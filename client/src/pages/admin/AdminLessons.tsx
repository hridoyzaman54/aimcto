import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, Plus, Search, MoreVertical, Edit, Trash2, Eye, 
  Video, FileText, GripVertical, Upload, File, X, Play,
  ChevronDown, ChevronRight, Loader2, Presentation, Image as ImageIcon,
  Music, Link as LinkIcon, FileSpreadsheet
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface Lesson {
  id: number;
  courseId: number;
  title: string;
  titleBn?: string | null;
  description?: string | null;
  orderIndex: number;
  contentType: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  isPreview: boolean | null;
}

interface Material {
  id: number;
  lessonId: number;
  title: string;
  type: string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  orderIndex: number | null;
}

interface Course {
  id: number;
  title: string;
  titleBn?: string | null;
}

export default function AdminLessons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedLessonForMaterial, setSelectedLessonForMaterial] = useState<number | null>(null);
  const [createContentType, setCreateContentType] = useState<string>('video');
  const [editContentType, setEditContentType] = useState<string>('video');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [materialType, setMaterialType] = useState<string>('pdf');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);
  const editDocumentInputRef = useRef<HTMLInputElement>(null);
  const materialInputRef = useRef<HTMLInputElement>(null);
  
  const { data: courses } = trpc.course.getAll.useQuery();
  const { data: lessons, isLoading, refetch } = trpc.lesson.getByCourse.useQuery(
    { courseId: selectedCourseId! },
    { enabled: !!selectedCourseId }
  );
  
  const createMutation = trpc.lesson.create.useMutation({
    onSuccess: () => {
      toast.success("Lesson created successfully");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create lesson: ${error.message}`);
    },
  });

  const updateMutation = trpc.lesson.update.useMutation({
    onSuccess: () => {
      toast.success("Lesson updated successfully");
      setEditingLesson(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update lesson: ${error.message}`);
    },
  });

  const deleteMutation = trpc.lesson.delete.useMutation({
    onSuccess: () => {
      toast.success("Lesson deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete lesson: ${error.message}`);
    },
  });

  const addMaterialMutation = trpc.lesson.addMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material added successfully");
      setMaterialDialogOpen(false);
      setSelectedLessonForMaterial(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add material: ${error.message}`);
    },
  });

  const deleteMaterialMutation = trpc.lesson.deleteMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete material: ${error.message}`);
    },
  });

  const filteredLessons = lessons?.filter((lesson: Lesson) => 
    lesson.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoUpload = async (file: File): Promise<string> => {
    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return URL.createObjectURL(file);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleMaterialUpload = async (file: File): Promise<{ url: string; size: number }> => {
    setIsUploadingMaterial(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return { url: data.url, size: file.size };
    } catch (error) {
      console.error('Upload error:', error);
      return { url: URL.createObjectURL(file), size: file.size };
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  const handleDocumentUpload = async (file: File): Promise<string> => {
    setIsUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return URL.createObjectURL(file);
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleCreate = async (formData: FormData) => {
    const videoFile = (document.getElementById('videoFile') as HTMLInputElement)?.files?.[0];
    const documentFile = (document.getElementById('documentFile') as HTMLInputElement)?.files?.[0];
    let videoUrl = formData.get('videoUrl') as string;
    let documentUrl = formData.get('documentUrl') as string;
    
    if (videoFile) {
      videoUrl = await handleVideoUpload(videoFile);
    }
    if (documentFile) {
      documentUrl = await handleDocumentUpload(documentFile);
    }
    
    const contentUrl = createContentType === 'video' ? videoUrl : (documentUrl || videoUrl);
    
    createMutation.mutate({
      courseId: selectedCourseId!,
      title: formData.get('title') as string,
      titleBn: formData.get('titleBn') as string || undefined,
      description: formData.get('description') as string || undefined,
      orderIndex: parseInt(formData.get('orderIndex') as string) || (lessons?.length || 0) + 1,
      contentType: createContentType as 'video' | 'pdf' | 'text' | 'mixed',
      videoUrl: contentUrl || undefined,
      duration: parseInt(formData.get('duration') as string) || undefined,
      isPreview: formData.get('isPreview') === 'on',
    });
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingLesson) return;
    
    const videoFile = (document.getElementById('editVideoFile') as HTMLInputElement)?.files?.[0];
    const documentFile = (document.getElementById('editDocumentFile') as HTMLInputElement)?.files?.[0];
    let videoUrl = formData.get('videoUrl') as string;
    let documentUrl = formData.get('documentUrl') as string;
    
    if (videoFile) {
      videoUrl = await handleVideoUpload(videoFile);
    }
    if (documentFile) {
      documentUrl = await handleDocumentUpload(documentFile);
    }
    
    const contentUrl = editContentType === 'video' ? videoUrl : (documentUrl || videoUrl);
    
    updateMutation.mutate({
      id: editingLesson.id,
      title: formData.get('title') as string,
      titleBn: formData.get('titleBn') as string || undefined,
      description: formData.get('description') as string || undefined,
      orderIndex: parseInt(formData.get('orderIndex') as string) || undefined,
      contentType: editContentType as 'video' | 'pdf' | 'text' | 'mixed',
      videoUrl: contentUrl || undefined,
      duration: parseInt(formData.get('duration') as string) || undefined,
      isPreview: formData.get('isPreview') === 'on',
    });
  };

  const handleAddMaterial = async (formData: FormData) => {
    if (!selectedLessonForMaterial) return;
    
    const file = (document.getElementById('materialFile') as HTMLInputElement)?.files?.[0];
    let fileUrl = formData.get('fileUrl') as string;
    let fileSize: number | undefined;
    
    if (file) {
      const result = await handleMaterialUpload(file);
      fileUrl = result.url;
      fileSize = result.size;
    }
    
    addMaterialMutation.mutate({
      lessonId: selectedLessonForMaterial,
      title: formData.get('title') as string,
      type: materialType as 'pdf' | 'doc' | 'pptx' | 'image' | 'video' | 'audio' | 'link',
      fileUrl: fileUrl,
      fileName: file?.name || undefined,
      fileSize: fileSize,
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'text': return <FileText className="h-4 w-4 text-green-500" />;
      default: return <File className="h-4 w-4 text-slate-500" />;
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'doc': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'pptx': return <Presentation className="h-4 w-4 text-orange-500" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-green-500" />;
      case 'audio': return <Music className="h-4 w-4 text-purple-500" />;
      case 'link': return <LinkIcon className="h-4 w-4 text-cyan-500" />;
      default: return <File className="h-4 w-4 text-slate-500" />;
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'pdf': return 'PDF';
      case 'doc': return 'Document';
      case 'pptx': return 'Slides';
      case 'image': return 'Image';
      case 'audio': return 'Audio';
      case 'link': return 'Link';
      default: return 'File';
    }
  };

  const getAcceptedFileTypes = (type: string) => {
    switch (type) {
      case 'video': return 'video/*';
      case 'pdf': return '.pdf';
      case 'doc': return '.doc,.docx,.txt,.rtf';
      case 'pptx': return '.ppt,.pptx';
      case 'image': return 'image/*';
      case 'audio': return 'audio/*';
      default: return '*';
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleLessonExpand = (lessonId: number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Get materials for a lesson
  const LessonMaterials = ({ lessonId }: { lessonId: number }) => {
    const { data: materials, isLoading } = trpc.lesson.getMaterials.useQuery({ lessonId });
    
    if (isLoading) {
      return <div className="p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>;
    }
    
    if (!materials || materials.length === 0) {
      return (
        <div className="text-sm text-slate-500 dark:text-slate-400 p-2">
          No additional materials. Click "Add Material" to upload files.
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {materials.map((material: Material) => (
          <div 
            key={material.id}
            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              {getMaterialTypeIcon(material.type)}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{material.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getMaterialTypeLabel(material.type)} • {formatFileSize(material.fileSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(material.fileUrl, '_blank')}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600"
                onClick={() => {
                  if (confirm('Delete this material?')) {
                    deleteMaterialMutation.mutate({ id: material.id });
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lesson Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create and manage lessons with multiple materials (video, PDF, slides, etc.)
            </p>
          </div>
          {selectedCourseId && (
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          )}
        </div>

        {/* Course Selection */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Select Course</CardTitle>
            <CardDescription>Choose a course to manage its lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedCourseId?.toString() || ''} 
              onValueChange={(v) => setSelectedCourseId(v ? parseInt(v) : null)}
            >
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course: Course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourseId && (
          <>
            {/* Search */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Lessons ({filteredLessons?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredLessons && filteredLessons.length > 0 ? (
                  <div className="space-y-3">
                    {filteredLessons.map((lesson: Lesson, index: number) => (
                      <div
                        key={lesson.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                      >
                        {/* Lesson Header */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          {/* Lesson number and title row */}
                          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                            <div className="flex items-center gap-2 text-slate-400 shrink-0">
                              <GripVertical className="h-5 w-5 cursor-grab hidden md:block" />
                              <span className="font-mono text-sm w-6">{lesson.orderIndex || index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getContentTypeIcon(lesson.contentType || 'mixed')}
                                <h3 className="font-medium text-slate-900 dark:text-white truncate">
                                  {lesson.title}
                                </h3>
                                {lesson.isPreview && (
                                  <Badge variant="secondary" className="text-xs">Preview</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 md:gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                                {lesson.titleBn && <span className="truncate">{lesson.titleBn}</span>}
                                <span>{formatDuration(lesson.duration)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {lesson.contentType}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Mobile: Dropdown menu on the right */}
                            <div className="md:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedLessonForMaterial(lesson.id);
                                      setMaterialDialogOpen(true);
                                    }}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add Material
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleLessonExpand(lesson.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {expandedLessons.has(lesson.id) ? 'Hide' : 'View'} Materials
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setEditingLesson(lesson);
                                    setEditContentType(lesson.contentType || 'video');
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this lesson?')) {
                                        deleteMutation.mutate({ id: lesson.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {/* Desktop: Action buttons */}
                          <div className="hidden md:flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleLessonExpand(lesson.id)}
                            >
                              {expandedLessons.has(lesson.id) ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                              )}
                              Materials
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLessonForMaterial(lesson.id);
                                setMaterialDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingLesson(lesson);
                                  setEditContentType(lesson.contentType || 'video');
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this lesson?')) {
                                      deleteMutation.mutate({ id: lesson.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Materials Section (Expandable) */}
                        {expandedLessons.has(lesson.id) && (
                          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Lesson Materials
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLessonForMaterial(lesson.id);
                                  setMaterialDialogOpen(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Material
                              </Button>
                            </div>
                            <LessonMaterials lessonId={lesson.id} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No lessons yet</p>
                    <p className="text-sm">Add your first lesson to this course</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Create Lesson Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogDescription>
                Create a new lesson. You can add multiple materials (videos, PDFs, slides) after creating the lesson.
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={2} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Primary Content Type</Label>
                    <Select name="contentType" defaultValue="video" onValueChange={(value) => setCreateContentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="pdf">PDF/Document</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="mixed">Mixed Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderIndex">Order</Label>
                    <Input 
                      id="orderIndex" 
                      name="orderIndex" 
                      type="number" 
                      defaultValue={(lessons?.length || 0) + 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input id="duration" name="duration" type="number" placeholder="e.g., 600" />
                  </div>
                </div>
                
                {createContentType === 'video' ? (
                  <div className="space-y-2">
                    <Label>Primary Video</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="videoUrl" 
                        name="videoUrl" 
                        placeholder="Video URL (YouTube, Vimeo, etc.)" 
                        className="flex-1"
                      />
                      <span className="text-slate-400 self-center">or</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isUploadingVideo}
                      >
                        {isUploadingVideo ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                      <input
                        ref={videoInputRef}
                        id="videoFile"
                        type="file"
                        accept="video/*"
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      You can add more materials (PDF, slides, etc.) after creating the lesson.
                    </p>
                  </div>
                ) : createContentType === 'pdf' || createContentType === 'text' ? (
                  <div className="space-y-2">
                    <Label>Primary Document</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="documentUrl" 
                        name="documentUrl" 
                        placeholder="Document URL" 
                        className="flex-1"
                      />
                      <span className="text-slate-400 self-center">or</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => documentInputRef.current?.click()}
                        disabled={isUploadingDocument}
                      >
                        {isUploadingDocument ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                      <input
                        ref={documentInputRef}
                        id="documentFile"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.rtf"
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Supports PDF, DOC, DOCX, PPTX, TXT. Add more materials after creating.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Mixed Content:</strong> Create the lesson first, then add multiple materials 
                      (videos, PDFs, slides, images) using the "Add Material" button.
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Switch id="isPreview" name="isPreview" />
                  <Label htmlFor="isPreview">Allow preview (non-enrolled users can view)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || isUploadingVideo || isUploadingDocument}>
                  {createMutation.isPending ? "Creating..." : "Create Lesson"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Lesson Dialog */}
        <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
              <DialogDescription>
                Update lesson details. Use "Add Material" to manage additional files.
              </DialogDescription>
            </DialogHeader>
            {editingLesson && (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(new FormData(e.currentTarget)); }}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editTitle">Title (English) *</Label>
                      <Input id="editTitle" name="title" defaultValue={editingLesson.title} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editTitleBn">Title (Bengali)</Label>
                      <Input id="editTitleBn" name="titleBn" defaultValue={editingLesson.titleBn || ''} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea id="editDescription" name="description" rows={2} defaultValue={editingLesson.description || ''} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editContentType">Primary Content Type</Label>
                      <Select name="contentType" defaultValue={editingLesson.contentType || 'video'} onValueChange={(value) => setEditContentType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="pdf">PDF/Document</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="mixed">Mixed Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editOrderIndex">Order</Label>
                      <Input 
                        id="editOrderIndex" 
                        name="orderIndex" 
                        type="number" 
                        defaultValue={editingLesson.orderIndex}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editDuration">Duration (seconds)</Label>
                      <Input id="editDuration" name="duration" type="number" defaultValue={editingLesson.duration || ''} />
                    </div>
                  </div>
                  
                  {editContentType === 'video' ? (
                    <div className="space-y-2">
                      <Label>Primary Video</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="editVideoUrl" 
                          name="videoUrl" 
                          placeholder="Video URL" 
                          defaultValue={editingLesson.videoUrl || ''}
                          className="flex-1"
                        />
                        <span className="text-slate-400 self-center">or</span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => editVideoInputRef.current?.click()}
                          disabled={isUploadingVideo}
                        >
                          {isUploadingVideo ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload
                        </Button>
                        <input
                          ref={editVideoInputRef}
                          id="editVideoFile"
                          type="file"
                          accept="video/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : editContentType === 'pdf' || editContentType === 'text' ? (
                    <div className="space-y-2">
                      <Label>Primary Document</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="editDocumentUrl" 
                          name="documentUrl" 
                          placeholder="Document URL" 
                          defaultValue={editingLesson.videoUrl || ''}
                          className="flex-1"
                        />
                        <span className="text-slate-400 self-center">or</span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => editDocumentInputRef.current?.click()}
                          disabled={isUploadingDocument}
                        >
                          {isUploadingDocument ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload
                        </Button>
                        <input
                          ref={editDocumentInputRef}
                          id="editDocumentFile"
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.rtf"
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Mixed Content:</strong> Manage materials using the "Materials" button on the lesson card.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Switch id="editIsPreview" name="isPreview" defaultChecked={editingLesson.isPreview ?? false} />
                    <Label htmlFor="editIsPreview">Allow preview</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingLesson(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending || isUploadingVideo || isUploadingDocument}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Material Dialog */}
        <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Lesson Material</DialogTitle>
              <DialogDescription>
                Upload additional materials for this lesson (PDF, slides, documents, images, etc.)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAddMaterial(new FormData(e.currentTarget)); }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="materialTitle">Title *</Label>
                  <Input id="materialTitle" name="title" required placeholder="e.g., Lecture Slides, Worksheet" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="materialType">Material Type *</Label>
                  <Select name="type" defaultValue="pdf" onValueChange={setMaterialType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-red-500" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-600" />
                          PDF Document
                        </div>
                      </SelectItem>
                      <SelectItem value="pptx">
                        <div className="flex items-center gap-2">
                          <Presentation className="h-4 w-4 text-orange-500" />
                          PowerPoint Slides
                        </div>
                      </SelectItem>
                      <SelectItem value="doc">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Word Document
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-green-500" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-purple-500" />
                          Audio
                        </div>
                      </SelectItem>
                      <SelectItem value="link">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-cyan-500" />
                          External Link
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="materialUrl" 
                      name="fileUrl" 
                      placeholder={materialType === 'link' ? 'Enter URL' : 'URL or upload file'} 
                      className="flex-1"
                    />
                    {materialType !== 'link' && (
                      <>
                        <span className="text-slate-400 self-center">or</span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => materialInputRef.current?.click()}
                          disabled={isUploadingMaterial}
                        >
                          {isUploadingMaterial ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload
                        </Button>
                      </>
                    )}
                    <input
                      ref={materialInputRef}
                      id="materialFile"
                      type="file"
                      accept={getAcceptedFileTypes(materialType)}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {materialType === 'video' && 'Supports MP4, WebM, MOV (max 50MB)'}
                    {materialType === 'pdf' && 'Supports PDF files'}
                    {materialType === 'pptx' && 'Supports PPT, PPTX files'}
                    {materialType === 'doc' && 'Supports DOC, DOCX, TXT, RTF files'}
                    {materialType === 'image' && 'Supports JPG, PNG, GIF, WebP'}
                    {materialType === 'audio' && 'Supports MP3, WAV, OGG'}
                    {materialType === 'link' && 'Enter the full URL including https://'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMaterialDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMaterialMutation.isPending || isUploadingMaterial}>
                  {addMaterialMutation.isPending ? "Adding..." : "Add Material"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
