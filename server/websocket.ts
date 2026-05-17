import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import * as db from "./db";

interface UserSocket extends Socket {
  userId?: number;
  userRole?: string;
  userName?: string;
}

interface ChatMessage {
  id?: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  groupId?: number;
  recipientId?: number;
  type: 'direct' | 'group';
}

interface ChatGroup {
  id: number;
  name: string;
  type: 'course' | 'section' | 'class' | 'custom';
  courseId?: number;
  createdBy: number;
  members: number[];
}

// Store active connections
const activeConnections = new Map<number, UserSocket>();
const userGroups = new Map<number, Set<number>>(); // userId -> Set of groupIds

export function setupWebSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "development" 
        ? ["http://localhost:3000", "http://localhost:5173"] 
        : true,
      credentials: true,
    },
    path: "/socket.io",
  });

  // Authentication middleware
  io.use(async (socket: UserSocket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
        userId: number;
        role: string;
        name: string;
      };

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.userName = decoded.name;
      
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: UserSocket) => {
    const userId = socket.userId!;
    const userName = socket.userName!;
    
    console.log(`User connected: ${userName} (${userId})`);
    
    // Store connection
    activeConnections.set(userId, socket);
    
    // Join user's personal room
    socket.join(`user:${userId}`);
    
    // Load and join user's groups
    try {
      const groups = await db.getUserChatGroups(userId);
      const groupIds = new Set<number>();
      
      for (const group of groups) {
        socket.join(`group:${group.id}`);
        groupIds.add(group.id);
      }
      
      userGroups.set(userId, groupIds);
      
      // Send initial data
      socket.emit("connected", {
        userId,
        groups,
        onlineUsers: Array.from(activeConnections.keys()),
      });
    } catch (error) {
      console.error("Error loading user groups:", error);
    }

    // Handle direct messages
    socket.on("direct_message", async (data: { recipientId: number; content: string }) => {
      try {
        const message: ChatMessage = {
          senderId: userId,
          senderName: userName,
          content: data.content,
          timestamp: new Date(),
          recipientId: data.recipientId,
          type: 'direct',
        };

        // Save to database
        const savedMessage = await db.saveDirectMessage({
          fromUserId: userId,
          toUserId: data.recipientId,
          content: data.content,
        });

        message.id = savedMessage.id;

        // Send to recipient if online
        io.to(`user:${data.recipientId}`).emit("new_message", message);
        
        // Send confirmation to sender
        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Error sending direct message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle group messages
    socket.on("group_message", async (data: { groupId: number; content: string }) => {
      try {
        const message: ChatMessage = {
          senderId: userId,
          senderName: userName,
          content: data.content,
          timestamp: new Date(),
          groupId: data.groupId,
          type: 'group',
        };

        // Save to database
        const savedMessage = await db.saveGroupMessage({
          groupId: data.groupId,
          senderId: userId,
          content: data.content,
        });

        message.id = savedMessage.id;

        // Broadcast to all group members
        io.to(`group:${data.groupId}`).emit("new_message", message);
      } catch (error) {
        console.error("Error sending group message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data: { recipientId?: number; groupId?: number }) => {
      if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit("user_typing", { userId, userName });
      } else if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit("user_typing", { userId, userName, groupId: data.groupId });
      }
    });

    socket.on("typing_stop", (data: { recipientId?: number; groupId?: number }) => {
      if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit("user_stopped_typing", { userId });
      } else if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit("user_stopped_typing", { userId, groupId: data.groupId });
      }
    });

    // Handle message read receipts
    socket.on("mark_read", async (data: { messageIds: number[]; senderId?: number; groupId?: number }) => {
      try {
        await db.markMessagesAsRead(data.messageIds, userId);
        
        if (data.senderId) {
          io.to(`user:${data.senderId}`).emit("messages_read", { 
            messageIds: data.messageIds, 
            readBy: userId 
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle group creation (admin/teacher only)
    socket.on("create_group", async (data: { 
      name: string; 
      type: 'course' | 'section' | 'class' | 'custom';
      courseId?: number;
      memberIds: number[];
    }) => {
      if (socket.userRole !== 'admin' && socket.userRole !== 'teacher') {
        socket.emit("error", { message: "Only admins and teachers can create groups" });
        return;
      }

      try {
        const group = await db.createChatGroup({
          name: data.name,
          type: data.type,
          courseId: data.courseId,
          createdBy: userId,
          memberIds: data.memberIds,
        });

        if (!group) {
          socket.emit("error", { message: "Failed to create group" });
          return;
        }

        // Add all members to the group room
        for (const memberId of data.memberIds) {
          const memberSocket = activeConnections.get(memberId);
          if (memberSocket) {
            memberSocket.join(`group:${group.id}`);
            memberSocket.emit("group_joined", group);
          }
        }

        socket.emit("group_created", group);
      } catch (error) {
        console.error("Error creating group:", error);
        socket.emit("error", { message: "Failed to create group" });
      }
    });

    // Handle adding members to group
    socket.on("add_group_members", async (data: { groupId: number; memberIds: number[] }) => {
      if (socket.userRole !== 'admin' && socket.userRole !== 'teacher') {
        socket.emit("error", { message: "Only admins and teachers can add members" });
        return;
      }

      try {
        await db.addGroupMembers(data.groupId, data.memberIds);

        for (const memberId of data.memberIds) {
          const memberSocket = activeConnections.get(memberId);
          if (memberSocket) {
            memberSocket.join(`group:${data.groupId}`);
            const group = await db.getChatGroup(data.groupId);
            if (group) memberSocket.emit("group_joined", group);
          }
        }

        io.to(`group:${data.groupId}`).emit("members_added", { 
          groupId: data.groupId, 
          memberIds: data.memberIds 
        });
      } catch (error) {
        console.error("Error adding members:", error);
        socket.emit("error", { message: "Failed to add members" });
      }
    });

    // Handle removing members from group
    socket.on("remove_group_members", async (data: { groupId: number; memberIds: number[] }) => {
      if (socket.userRole !== 'admin' && socket.userRole !== 'teacher') {
        socket.emit("error", { message: "Only admins and teachers can remove members" });
        return;
      }

      try {
        await db.removeGroupMembers(data.groupId, data.memberIds);

        for (const memberId of data.memberIds) {
          const memberSocket = activeConnections.get(memberId);
          if (memberSocket) {
            memberSocket.leave(`group:${data.groupId}`);
            memberSocket.emit("group_left", { groupId: data.groupId });
          }
        }

        io.to(`group:${data.groupId}`).emit("members_removed", { 
          groupId: data.groupId, 
          memberIds: data.memberIds 
        });
      } catch (error) {
        console.error("Error removing members:", error);
        socket.emit("error", { message: "Failed to remove members" });
      }
    });

    // Handle adding all course students to group
    socket.on("add_course_students", async (data: { groupId: number; courseId: number }) => {
      if (socket.userRole !== 'admin' && socket.userRole !== 'teacher') {
        socket.emit("error", { message: "Only admins and teachers can add course students" });
        return;
      }

      try {
        const enrollments = await db.getEnrollmentsByCourse(data.courseId);
        const studentIds = enrollments.map(e => e.userId);
        
        await db.addGroupMembers(data.groupId, studentIds);

        for (const studentId of studentIds) {
          const studentSocket = activeConnections.get(studentId);
          if (studentSocket) {
            studentSocket.join(`group:${data.groupId}`);
            const group = await db.getChatGroup(data.groupId);
            studentSocket.emit("group_joined", group);
          }
        }

        io.to(`group:${data.groupId}`).emit("members_added", { 
          groupId: data.groupId, 
          memberIds: studentIds,
          message: `Added ${studentIds.length} students from course`
        });
      } catch (error) {
        console.error("Error adding course students:", error);
        socket.emit("error", { message: "Failed to add course students" });
      }
    });

    // Handle fetching message history
    socket.on("get_messages", async (data: { 
      type: 'direct' | 'group'; 
      recipientId?: number; 
      groupId?: number;
      limit?: number;
      before?: number;
    }) => {
      try {
        let messages;
        if (data.type === 'direct' && data.recipientId) {
          messages = await db.getDirectMessages(userId, data.recipientId, data.limit, data.before);
        } else if (data.type === 'group' && data.groupId) {
          messages = await db.getGroupMessages(data.groupId, data.limit, data.before);
        }
        
        socket.emit("message_history", { 
          type: data.type, 
          recipientId: data.recipientId,
          groupId: data.groupId,
          messages 
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        socket.emit("error", { message: "Failed to fetch messages" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userName} (${userId})`);
      activeConnections.delete(userId);
      userGroups.delete(userId);
      
      // Notify others that user went offline
      io.emit("user_offline", { userId });
    });
  });

  return io;
}
