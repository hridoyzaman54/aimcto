import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bell, Plus, MoreVertical, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminAnnouncements() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: announcements, isLoading, refetch } = trpc.announcement.getAll.useQuery();
  
  const createMutation = trpc.announcement.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement created successfully");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create announcement: ${error.message}`);
    },
  });

  const deleteMutation = trpc.announcement.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete announcement: ${error.message}`);
    },
  });

  const handleCreate = (formData: FormData) => {
    createMutation.mutate({
      title: formData.get('title') as string,
      titleBn: formData.get('titleBn') as string || undefined,
      content: formData.get('content') as string,
      contentBn: formData.get('contentBn') as string || undefined,
      targetAudience: formData.get('targetAudience') as 'all' | 'students' | 'parents' | 'teachers' || 'all',
      priority: formData.get('priority') as 'low' | 'normal' | 'high' | 'urgent' || 'normal',
      isPinned: (formData.get('isPinned') as string) === 'true',
    });
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      low: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    };
    return <Badge className={config[priority] || config.normal}>{priority}</Badge>;
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Announcements
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create and manage announcements for users
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement to notify users
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(new FormData(e.currentTarget)); }}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (English) *</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleBn">Title (Bengali)</Label>
                      <Input id="titleBn" name="titleBn" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content (English) *</Label>
                    <Textarea id="content" name="content" rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentBn">Content (Bengali)</Label>
                    <Textarea id="contentBn" name="contentBn" rows={4} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select name="targetAudience" defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Everyone</SelectItem>
                          <SelectItem value="students">Students Only</SelectItem>
                          <SelectItem value="parents">Parents Only</SelectItem>
                          <SelectItem value="teachers">Teachers Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue="normal">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pin to Top</Label>
                      <Select name="isPinned" defaultValue="false">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Announcement"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              All Announcements
            </CardTitle>
            <CardDescription>
              Manage your announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {announcement.title}
                          </h3>
                          {getPriorityBadge(announcement.priority || 'normal')}
                          {announcement.isPinned && (
                            <Badge variant="outline">Pinned</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>Target: {announcement.targetAudience}</span>
                          <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ id: announcement.id })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No announcements yet</p>
                <p className="text-sm">Create your first announcement to notify users</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
