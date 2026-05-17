import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Search,
  UserPlus,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { trpc } from "@/lib/trpc";


interface ChatGroup {
  id: number;
  name: string;
  type: 'course' | 'section' | 'class' | 'custom';
  courseId?: number;
  createdBy: number;
  memberCount?: number;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

export default function AdminChatGroups() {

  const { 
    connected, 
    groups, 
    createGroup, 
    addGroupMembers, 
    removeGroupMembers,
    addCourseStudents,
    onGroupCreated,
    onError,
  } = useSocket();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for creating group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'course' | 'section' | 'class' | 'custom'>('custom');
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  // Fetch data
  const { data: users } = trpc.user.getAll.useQuery();
  const { data: courses } = trpc.course.getAll.useQuery();
  
  const students = (users || []).filter((u: User) => u.role === 'student');
  const teachers = (users || []).filter((u: User) => u.role === 'teacher' || u.role === 'admin');

  // Subscribe to group creation and errors
  useEffect(() => {
    const unsubscribeCreated = onGroupCreated((group: ChatGroup) => {
      setIsCreateDialogOpen(false);
      setIsCreating(false);
      resetForm();
      console.log(`Group "${group.name}" created successfully`);
    });
    
    const unsubscribeError = onError((error: { message: string }) => {
      setIsCreating(false);
      console.error('Socket error:', error.message);
    });
    
    return () => {
      unsubscribeCreated();
      unsubscribeError();
    };
  }, [onGroupCreated, onError]);

  const resetForm = () => {
    setNewGroupName('');
    setNewGroupType('custom');
    setSelectedCourseId(undefined);
    setSelectedMembers([]);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    
    if (!connected) {
      alert("Not connected to server. Please refresh the page.");
      return;
    }
    
    setIsCreating(true);
    createGroup({
      name: newGroupName,
      type: newGroupType,
      courseId: selectedCourseId,
      memberIds: selectedMembers,
    });
  };

  const handleAddAllCourseStudents = () => {
    if (!selectedGroup || !selectedCourseId) return;
    addCourseStudents(selectedGroup.id, selectedCourseId);
    console.log("Adding all enrolled students to the group...");
  };

  const handleToggleMember = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllStudents = () => {
    const studentIds = students.map((s: User) => s.id);
    setSelectedMembers(prev => {
      const allSelected = studentIds.every((id: number) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id: number) => !studentIds.includes(id));
      }
      return Array.from(new Set([...prev, ...studentIds]));
    });
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chat Groups</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage group chats
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connected ? "default" : "destructive"} className="text-xs">
              {connected ? "Connected" : "Disconnected"}
            </Badge>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="sm:size-default">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Create Group</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">Create Chat Group</DialogTitle>
                  <DialogDescription className="text-sm">
                    Create a new group chat for students and teachers
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Math Class 2026"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupType">Group Type</Label>
                    <Select value={newGroupType} onValueChange={(v) => setNewGroupType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course Group</SelectItem>
                        <SelectItem value="section">Section Group</SelectItem>
                        <SelectItem value="class">Class Group</SelectItem>
                        <SelectItem value="custom">Custom Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(newGroupType === 'course' || newGroupType === 'section') && (
                    <div className="space-y-2">
                      <Label htmlFor="course">Associated Course</Label>
                      <Select 
                        value={selectedCourseId?.toString()} 
                        onValueChange={(v) => setSelectedCourseId(parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {(courses || []).map((course: any) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <Label>Select Members ({selectedMembers.length} selected)</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAllStudents}
                        className="w-full sm:w-auto"
                      >
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Toggle All Students
                      </Button>
                    </div>
                    
                    {/* Teachers Card */}
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Teachers & Admins</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <ScrollArea className="h-28 sm:h-32">
                          <div className="space-y-2">
                            {teachers.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No teachers found</p>
                            ) : (
                              teachers.map((teacher: User) => (
                                <div key={teacher.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`teacher-${teacher.id}`}
                                    checked={selectedMembers.includes(teacher.id)}
                                    onCheckedChange={() => handleToggleMember(teacher.id)}
                                  />
                                  <label
                                    htmlFor={`teacher-${teacher.id}`}
                                    className="text-sm flex-1 cursor-pointer truncate"
                                  >
                                    {teacher.name || teacher.email} 
                                    <span className="text-muted-foreground ml-1">({teacher.role})</span>
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                    
                    {/* Students Card */}
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Students</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <ScrollArea className="h-36 sm:h-48">
                          <div className="space-y-2">
                            {students.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No students found</p>
                            ) : (
                              students.map((student: User) => (
                                <div key={student.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`student-${student.id}`}
                                    checked={selectedMembers.includes(student.id)}
                                    onCheckedChange={() => handleToggleMember(student.id)}
                                  />
                                  <label
                                    htmlFor={`student-${student.id}`}
                                    className="text-sm flex-1 cursor-pointer truncate"
                                  >
                                    {student.name || student.email}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup} disabled={isCreating || !connected} className="w-full sm:w-auto">
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search groups..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Groups List - Cards on mobile, Table on desktop */}
        <Card>
          <CardHeader className="py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              All Groups ({filteredGroups.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No groups yet</p>
                <p className="text-sm">Create your first group to get started</p>
              </div>
            ) : (
              <>
                {/* Mobile: Card Layout */}
                <div className="sm:hidden space-y-3">
                  {filteredGroups.map((group) => (
                    <Card key={group.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{group.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize text-xs">
                              {group.type}
                            </Badge>
                            {group.courseId && (
                              <span className="text-xs text-muted-foreground truncate">
                                {(courses || []).find((c: any) => c.id === group.courseId)?.title || '-'}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => {
                            setSelectedGroup(group);
                            setIsManageMembersOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop: Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Name</th>
                        <th className="text-left py-3 px-2 font-medium">Type</th>
                        <th className="text-left py-3 px-2 font-medium">Course</th>
                        <th className="text-right py-3 px-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.map((group) => (
                        <tr key={group.id} className="border-b last:border-0">
                          <td className="py-3 px-2 font-medium">{group.name}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="capitalize">
                              {group.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {group.courseId 
                              ? (courses || []).find((c: any) => c.id === group.courseId)?.title || '-'
                              : '-'
                            }
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsManageMembersOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Members
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Manage Members Dialog */}
        <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
          <DialogContent className="w-[95vw] max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg truncate">Manage Members - {selectedGroup?.name}</DialogTitle>
              <DialogDescription className="text-sm">
                Add or remove members from this group
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedGroup?.courseId && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAddAllCourseStudents}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add All Enrolled Students
                </Button>
              )}
              
              <div className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
                Member management is handled through the WebSocket connection.
                Changes will be reflected in real-time.
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsManageMembersOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
