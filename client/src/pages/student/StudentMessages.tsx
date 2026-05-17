import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Send, 
  Search,
  Circle,
  Phone,
  Video,
  Info
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";

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

interface Contact {
  id: number;
  name: string;
  role: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ChatGroup {
  id: number;
  name: string;
  type: 'course' | 'section' | 'class' | 'custom';
  courseId?: number;
  createdBy: number;
  members?: { userId: number; role: string; userName: string }[];
}

export default function StudentMessages() {
  const { user } = useAuth();
  const { 
    connected, 
    groups, 
    onlineUsers,
    sendDirectMessage, 
    sendGroupMessage, 
    getMessages,
    onNewMessage,
    onMessageHistory,
    onUserTyping,
    startTyping,
    stopTyping,
  } = useSocket();
  
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<{ userId: number; userName: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch teachers/admins for direct messaging
  const { data: teachers } = trpc.user.getAll.useQuery();
  
  const contacts: Contact[] = (teachers || [])
    .filter((t: any) => t.role === 'teacher' || t.role === 'admin')
    .map((t: any) => ({
      id: t.id,
      name: t.name || 'Unknown',
      role: t.role,
      isOnline: onlineUsers.includes(t.id),
    }));

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message: ChatMessage) => {
      if (activeTab === 'direct' && selectedContact) {
        if (message.senderId === selectedContact.id || message.recipientId === selectedContact.id) {
          setMessages(prev => [...prev, message]);
        }
      } else if (activeTab === 'groups' && selectedGroup) {
        if (message.groupId === selectedGroup.id) {
          setMessages(prev => [...prev, message]);
        }
      }
    });
    
    return unsubscribe;
  }, [onNewMessage, activeTab, selectedContact, selectedGroup]);

  // Subscribe to message history
  useEffect(() => {
    const unsubscribe = onMessageHistory((data: { type: string; messages: ChatMessage[] }) => {
      setMessages(data.messages.reverse());
    });
    
    return unsubscribe;
  }, [onMessageHistory]);

  // Subscribe to typing indicators
  useEffect(() => {
    const unsubscribe = onUserTyping((data: { userId: number; userName: string; groupId?: number }) => {
      setTypingUsers(prev => {
        if (prev.some(u => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, userName: data.userName }];
      });
      
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }, 3000);
    });
    
    return unsubscribe;
  }, [onUserTyping]);

  // Load messages when contact/group changes
  useEffect(() => {
    if (activeTab === 'direct' && selectedContact) {
      getMessages('direct', selectedContact.id);
    } else if (activeTab === 'groups' && selectedGroup) {
      getMessages('group', selectedGroup.id);
    }
    setMessages([]);
  }, [selectedContact, selectedGroup, activeTab, getMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (activeTab === 'direct' && selectedContact) {
      sendDirectMessage(selectedContact.id, newMessage);
      setMessages(prev => [...prev, {
        senderId: user?.id || 0,
        senderName: user?.name || 'You',
        content: newMessage,
        timestamp: new Date(),
        recipientId: selectedContact.id,
        type: 'direct',
      }]);
    } else if (activeTab === 'groups' && selectedGroup) {
      sendGroupMessage(selectedGroup.id, newMessage);
      setMessages(prev => [...prev, {
        senderId: user?.id || 0,
        senderName: user?.name || 'You',
        content: newMessage,
        timestamp: new Date(),
        groupId: selectedGroup.id,
        type: 'group',
      }]);
    }
    
    setNewMessage('');
    stopTyping(activeTab === 'direct' ? { recipientId: selectedContact?.id } : { groupId: selectedGroup?.id });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value) {
      startTyping(activeTab === 'direct' ? { recipientId: selectedContact?.id } : { groupId: selectedGroup?.id });
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeTab === 'direct' ? { recipientId: selectedContact?.id } : { groupId: selectedGroup?.id });
      }, 2000);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentDashboardLayout>
      <div className="p-4 md:p-6 h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Chat with teachers and classmates
            </p>
          </div>
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-5rem)]">
          {/* Contacts/Groups List */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'direct' | 'groups')}>
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="direct" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Direct
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Groups
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="direct" className="m-0">
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    {filteredContacts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No teachers available
                      </div>
                    ) : (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedContact?.id === contact.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => {
                            setSelectedContact(contact);
                            setSelectedGroup(null);
                          }}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>
                                {contact.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {contact.isOnline && (
                              <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{contact.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{contact.role}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="groups" className="m-0">
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    {filteredGroups.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No groups yet
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <div
                          key={group.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedGroup?.id === group.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => {
                            setSelectedGroup(group);
                            setSelectedContact(null);
                          }}
                        >
                          <Avatar>
                            <AvatarFallback>
                              <Users className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{group.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{group.type} group</p>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col">
            {(selectedContact || selectedGroup) ? (
              <>
                <CardHeader className="border-b py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {activeTab === 'direct' 
                            ? selectedContact?.name.charAt(0).toUpperCase()
                            : <Users className="h-4 w-4" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {activeTab === 'direct' ? selectedContact?.name : selectedGroup?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeTab === 'direct' 
                            ? (selectedContact?.isOnline ? 'Online' : 'Offline')
                            : `${selectedGroup?.type} group`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id || index}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                              {!isOwn && activeTab === 'groups' && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {message.senderName}
                                </p>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(message.timestamp), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm">
                            {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                          </span>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a contact or group to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
