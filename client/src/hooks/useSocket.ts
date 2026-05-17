import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/_core/hooks/useAuth';

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
  members?: { userId: number; role: string; userName: string }[];
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  groups: ChatGroup[];
  onlineUsers: number[];
  sendDirectMessage: (recipientId: number, content: string) => void;
  sendGroupMessage: (groupId: number, content: string) => void;
  createGroup: (data: { name: string; type: 'course' | 'section' | 'class' | 'custom'; courseId?: number; memberIds: number[] }) => void;
  addGroupMembers: (groupId: number, memberIds: number[]) => void;
  removeGroupMembers: (groupId: number, memberIds: number[]) => void;
  addCourseStudents: (groupId: number, courseId: number) => void;
  getMessages: (type: 'direct' | 'group', id: number) => void;
  startTyping: (data: { recipientId?: number; groupId?: number }) => void;
  stopTyping: (data: { recipientId?: number; groupId?: number }) => void;
  markAsRead: (messageIds: number[], senderId?: number, groupId?: number) => void;
  onNewMessage: (callback: (message: ChatMessage) => void) => () => void;
  onMessageHistory: (callback: (data: { type: string; messages: ChatMessage[] }) => void) => () => void;
  onUserTyping: (callback: (data: { userId: number; userName: string; groupId?: number }) => void) => () => void;
  onGroupJoined: (callback: (group: ChatGroup) => void) => () => void;
  onGroupCreated: (callback: (group: ChatGroup) => void) => () => void;
  onError: (callback: (error: { message: string }) => void) => () => void;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const callbacksRef = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Get JWT token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return;

    const socketInstance = io(window.location.origin, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connected', (data: { userId: number; groups: ChatGroup[]; onlineUsers: number[] }) => {
      setGroups(data.groups);
      setOnlineUsers(data.onlineUsers);
    });

    socketInstance.on('user_offline', (data: { userId: number }) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    socketInstance.on('new_message', (message: ChatMessage) => {
      const callbacks = callbacksRef.current.get('new_message');
      callbacks?.forEach(cb => cb(message));
    });

    socketInstance.on('message_history', (data: { type: string; messages: ChatMessage[] }) => {
      const callbacks = callbacksRef.current.get('message_history');
      callbacks?.forEach(cb => cb(data));
    });

    socketInstance.on('user_typing', (data: { userId: number; userName: string; groupId?: number }) => {
      const callbacks = callbacksRef.current.get('user_typing');
      callbacks?.forEach(cb => cb(data));
    });

    socketInstance.on('user_stopped_typing', (data: { userId: number; groupId?: number }) => {
      const callbacks = callbacksRef.current.get('user_stopped_typing');
      callbacks?.forEach(cb => cb(data));
    });

    socketInstance.on('group_joined', (group: ChatGroup) => {
      setGroups(prev => [...prev, group]);
      const callbacks = callbacksRef.current.get('group_joined');
      callbacks?.forEach(cb => cb(group));
    });

    socketInstance.on('group_created', (group: ChatGroup) => {
      setGroups(prev => [...prev, group]);
      const callbacks = callbacksRef.current.get('group_created');
      callbacks?.forEach(cb => cb(group));
    });

    socketInstance.on('group_left', (data: { groupId: number }) => {
      setGroups(prev => prev.filter(g => g.id !== data.groupId));
    });

    socketInstance.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      const callbacks = callbacksRef.current.get('error');
      callbacks?.forEach(cb => cb(error));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  const sendDirectMessage = useCallback((recipientId: number, content: string) => {
    socket?.emit('direct_message', { recipientId, content });
  }, [socket]);

  const sendGroupMessage = useCallback((groupId: number, content: string) => {
    socket?.emit('group_message', { groupId, content });
  }, [socket]);

  const createGroup = useCallback((data: { name: string; type: 'course' | 'section' | 'class' | 'custom'; courseId?: number; memberIds: number[] }) => {
    socket?.emit('create_group', data);
  }, [socket]);

  const addGroupMembers = useCallback((groupId: number, memberIds: number[]) => {
    socket?.emit('add_group_members', { groupId, memberIds });
  }, [socket]);

  const removeGroupMembers = useCallback((groupId: number, memberIds: number[]) => {
    socket?.emit('remove_group_members', { groupId, memberIds });
  }, [socket]);

  const addCourseStudents = useCallback((groupId: number, courseId: number) => {
    socket?.emit('add_course_students', { groupId, courseId });
  }, [socket]);

  const getMessages = useCallback((type: 'direct' | 'group', id: number) => {
    if (type === 'direct') {
      socket?.emit('get_messages', { type: 'direct', recipientId: id });
    } else {
      socket?.emit('get_messages', { type: 'group', groupId: id });
    }
  }, [socket]);

  const startTyping = useCallback((data: { recipientId?: number; groupId?: number }) => {
    socket?.emit('typing_start', data);
  }, [socket]);

  const stopTyping = useCallback((data: { recipientId?: number; groupId?: number }) => {
    socket?.emit('typing_stop', data);
  }, [socket]);

  const markAsRead = useCallback((messageIds: number[], senderId?: number, groupId?: number) => {
    socket?.emit('mark_read', { messageIds, senderId, groupId });
  }, [socket]);

  const registerCallback = useCallback((event: string, callback: Function) => {
    if (!callbacksRef.current.has(event)) {
      callbacksRef.current.set(event, new Set());
    }
    callbacksRef.current.get(event)!.add(callback);
    return () => {
      callbacksRef.current.get(event)?.delete(callback);
    };
  }, []);

  const onNewMessage = useCallback((callback: (message: ChatMessage) => void) => {
    return registerCallback('new_message', callback);
  }, [registerCallback]);

  const onMessageHistory = useCallback((callback: (data: { type: string; messages: ChatMessage[] }) => void) => {
    return registerCallback('message_history', callback);
  }, [registerCallback]);

  const onUserTyping = useCallback((callback: (data: { userId: number; userName: string; groupId?: number }) => void) => {
    return registerCallback('user_typing', callback);
  }, [registerCallback]);

  const onGroupJoined = useCallback((callback: (group: ChatGroup) => void) => {
    return registerCallback('group_joined', callback);
  }, [registerCallback]);

  const onGroupCreated = useCallback((callback: (group: ChatGroup) => void) => {
    return registerCallback('group_created', callback);
  }, [registerCallback]);

  const onError = useCallback((callback: (error: { message: string }) => void) => {
    return registerCallback('error', callback);
  }, [registerCallback]);

  return {
    socket,
    connected,
    groups,
    onlineUsers,
    sendDirectMessage,
    sendGroupMessage,
    createGroup,
    addGroupMembers,
    removeGroupMembers,
    addCourseStudents,
    getMessages,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onMessageHistory,
    onUserTyping,
    onGroupJoined,
    onGroupCreated,
    onError,
  };
}
