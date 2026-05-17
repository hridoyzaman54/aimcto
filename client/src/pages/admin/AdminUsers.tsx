import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Search, Filter, MoreVertical, Shield, GraduationCap, User, UserCog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: users, isLoading, refetch } = trpc.user.getAll.useQuery(
    roleFilter !== "all" ? { role: roleFilter } : undefined
  );
  
  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.studentUid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string; icon: any }> = {
      admin: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Shield },
      teacher: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: UserCog },
      student: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: GraduationCap },
      parent: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Users },
      user: { color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300", icon: User },
    };
    
    const config = roleConfig[role] || roleConfig.user;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ 
      userId, 
      role: newRole as 'user' | 'admin' | 'student' | 'parent' | 'teacher' 
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {users?.length || 0} users
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or Student UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Users
            </CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="rounded-md border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Student UID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {user.name || 'Unnamed User'}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.studentUid ? (
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {user.studentUid}
                            </code>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <span className="text-slate-600 dark:text-slate-400">
                            {user.grade || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'teacher')}>
                                <UserCog className="h-4 w-4 mr-2" />
                                Make Teacher
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'student')}>
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Make Student
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'parent')}>
                                <Users className="h-4 w-4 mr-2" />
                                Make Parent
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>
                                <User className="h-4 w-4 mr-2" />
                                Make User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
