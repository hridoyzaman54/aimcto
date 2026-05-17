import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Search, MoreVertical, Edit, Trash2, Eye, Users, Upload, Image, X, Loader2, FolderTree, ChevronRight } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function AdminCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const editThumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Category selection state for create form
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  
  // Category selection state for edit form
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editSubcategoryId, setEditSubcategoryId] = useState<number | null>(null);
  const [editSectionId, setEditSectionId] = useState<number | null>(null);
  
  const { data: courses, isLoading, refetch } = trpc.course.getAll.useQuery();
  const { data: categoryHierarchy } = trpc.category.getHierarchy.useQuery();
  
  // Get subcategories for selected category
  const selectedCategory = categoryHierarchy?.find(c => c.id === selectedCategoryId);
  const editCategory = categoryHierarchy?.find(c => c.id === editCategoryId);
  
  // Get sections for selected subcategory
  const selectedSubcategory = selectedCategory?.subcategories?.find(s => s.id === selectedSubcategoryId);
  const editSubcategory = editCategory?.subcategories?.find(s => s.id === editSubcategoryId);
  
  // Reset subcategory and section when category changes
  useEffect(() => {
    setSelectedSubcategoryId(null);
    setSelectedSectionId(null);
  }, [selectedCategoryId]);
  
  useEffect(() => {
    setSelectedSectionId(null);
  }, [selectedSubcategoryId]);
  
  useEffect(() => {
    setEditSubcategoryId(null);
    setEditSectionId(null);
  }, [editCategoryId]);
  
  useEffect(() => {
    setEditSectionId(null);
  }, [editSubcategoryId]);
  
  // Initialize edit form category values when editing course
  useEffect(() => {
    if (editingCourse) {
      setEditCategoryId(editingCourse.categoryId || null);
      setEditSubcategoryId(editingCourse.subcategoryId || null);
      setEditSectionId(editingCourse.sectionId || null);
    }
  }, [editingCourse]);
  
  const createMutation = trpc.course.create.useMutation({
    onSuccess: () => {
      toast.success("Course created successfully");
      setIsCreateOpen(false);
      setThumbnailPreview(null);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      setSelectedSectionId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create course: ${error.message}`);
    },
  });

  const updateMutation = trpc.course.update.useMutation({
    onSuccess: () => {
      toast.success("Course updated successfully");
      setEditingCourse(null);
      setEditThumbnailPreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });

  const deleteMutation = trpc.course.delete.useMutation({
    onSuccess: () => {
      toast.success("Course deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete course: ${error.message}`);
    },
  });

  const filteredCourses = courses?.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      archived: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    };
    
    return (
      <Badge className={statusConfig[status] || statusConfig.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get category path display
  const getCategoryPath = (course: any) => {
    if (!categoryHierarchy || !course.categoryId) return null;
    
    const category = categoryHierarchy.find(c => c.id === course.categoryId);
    if (!category) return null;
    
    const parts = [category.name];
    
    if (course.subcategoryId) {
      const subcategory = category.subcategories?.find(s => s.id === course.subcategoryId);
      if (subcategory) {
        parts.push(subcategory.name);
        
        if (course.sectionId) {
          const section = subcategory.sections?.find(sec => sec.id === course.sectionId);
          if (section) {
            parts.push(section.name);
          }
        }
      }
    }
    
    return parts;
  };

  const handleThumbnailUpload = async (file: File, isEdit: boolean = false) => {
    setIsUploadingThumbnail(true);
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
      if (isEdit) {
        setEditThumbnailPreview(data.url);
      } else {
        setThumbnailPreview(data.url);
      }
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload thumbnail");
      console.error(error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditThumbnailPreview(reader.result as string);
        } else {
          setThumbnailPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload to server
      handleThumbnailUpload(file, isEdit);
    }
  };

  const handleCreate = (formData: FormData) => {
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!selectedSubcategoryId) {
      toast.error("Please select a subcategory");
      return;
    }
    
    createMutation.mutate({
      title: formData.get('title') as string,
      titleBn: formData.get('titleBn') as string || undefined,
      description: formData.get('description') as string || undefined,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      sectionId: selectedSectionId || undefined,
      level: formData.get('level') as 'beginner' | 'intermediate' | 'advanced' || undefined,
      price: formData.get('price') as string || undefined,
      durationMonths: parseInt(formData.get('durationMonths') as string) || 3,
      status: formData.get('status') as 'draft' | 'published' | 'archived' || 'draft',
      thumbnail: thumbnailPreview || undefined,
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editingCourse) return;
    updateMutation.mutate({
      id: editingCourse.id,
      title: formData.get('title') as string,
      titleBn: formData.get('titleBn') as string || undefined,
      description: formData.get('description') as string || undefined,
      categoryId: editCategoryId || undefined,
      subcategoryId: editSubcategoryId || undefined,
      sectionId: editSectionId || undefined,
      level: formData.get('level') as 'beginner' | 'intermediate' | 'advanced' || undefined,
      price: formData.get('price') as string || undefined,
      durationMonths: parseInt(formData.get('durationMonths') as string) || 3,
      status: formData.get('status') as 'draft' | 'published' | 'archived' || 'draft',
      thumbnail: editThumbnailPreview || editingCourse.thumbnail || undefined,
    });
  };

  const ThumbnailUploader = ({ 
    preview, 
    onRemove, 
    inputRef, 
    onChange,
    existingUrl 
  }: { 
    preview: string | null; 
    onRemove: () => void; 
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    existingUrl?: string | null;
  }) => {
    const displayUrl = preview || existingUrl;
    
    return (
      <div className="space-y-2">
        <Label>Course Thumbnail</Label>
        {displayUrl ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <img 
              src={displayUrl} 
              alt="Course thumbnail" 
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="w-full h-40 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {isUploadingThumbnail ? (
              <>
                <Loader2 className="h-10 w-10 text-slate-400 animate-spin mb-2" />
                <p className="text-sm text-slate-500">Uploading...</p>
              </>
            ) : (
              <>
                <Image className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click to upload thumbnail</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </div>
    );
  };

  // Category Selection Component
  const CategorySelector = ({ 
    categoryId, 
    subcategoryId, 
    sectionId,
    onCategoryChange,
    onSubcategoryChange,
    onSectionChange
  }: {
    categoryId: number | null;
    subcategoryId: number | null;
    sectionId: number | null;
    onCategoryChange: (id: number | null) => void;
    onSubcategoryChange: (id: number | null) => void;
    onSectionChange: (id: number | null) => void;
  }) => {
    const category = categoryHierarchy?.find(c => c.id === categoryId);
    const subcategory = category?.subcategories?.find(s => s.id === subcategoryId);
    
    return (
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <FolderTree className="h-4 w-4" />
          Category Selection *
        </div>
        
        {/* Category Path Display */}
        {categoryId && (
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="font-medium" style={{ color: category?.color || '#3B82F6' }}>
              {category?.name}
            </span>
            {subcategoryId && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>{subcategory?.name}</span>
              </>
            )}
            {sectionId && subcategory?.sections && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>{subcategory.sections.find(s => s.id === sectionId)?.name}</span>
              </>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Category */}
          <div className="space-y-2">
            <Label>Main Category *</Label>
            <Select 
              value={categoryId?.toString() || ''} 
              onValueChange={(v) => onCategoryChange(v ? parseInt(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryHierarchy?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: cat.color || '#3B82F6' }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subcategory */}
          <div className="space-y-2">
            <Label>Subcategory *</Label>
            <Select 
              value={subcategoryId?.toString() || ''} 
              onValueChange={(v) => onSubcategoryChange(v ? parseInt(v) : null)}
              disabled={!categoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoryId ? "Select subcategory" : "Select category first"} />
              </SelectTrigger>
              <SelectContent>
                {category?.subcategories?.map(sub => (
                  <SelectItem key={sub.id} value={sub.id.toString()}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Section (Optional) */}
          <div className="space-y-2">
            <Label>Section (Optional)</Label>
            <Select 
              value={sectionId?.toString() || ''} 
              onValueChange={(v) => onSectionChange(v && v !== 'none' ? parseInt(v) : null)}
              disabled={!subcategoryId || !subcategory?.sections?.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !subcategoryId 
                    ? "Select subcategory first" 
                    : !subcategory?.sections?.length 
                      ? "No sections available" 
                      : "Select section"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {subcategory?.sections?.map(sec => (
                  <SelectItem key={sec.id} value={sec.id.toString()}>
                    {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
              Course Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create and manage courses for your students
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setThumbnailPreview(null);
              setSelectedCategoryId(null);
              setSelectedSubcategoryId(null);
              setSelectedSectionId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Select a category and fill in the details to create a new course
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(new FormData(e.currentTarget)); }}>
                <div className="grid gap-4 py-4">
                  {/* Category Selection */}
                  <CategorySelector
                    categoryId={selectedCategoryId}
                    subcategoryId={selectedSubcategoryId}
                    sectionId={selectedSectionId}
                    onCategoryChange={setSelectedCategoryId}
                    onSubcategoryChange={setSelectedSubcategoryId}
                    onSectionChange={setSelectedSectionId}
                  />
                  
                  {/* Thumbnail Upload */}
                  <ThumbnailUploader
                    preview={thumbnailPreview}
                    onRemove={() => setThumbnailPreview(null)}
                    inputRef={thumbnailInputRef}
                    onChange={(e) => handleThumbnailChange(e, false)}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Textarea id="description" name="description" rows={3} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Select name="level" defaultValue="beginner">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="draft">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (BDT)</Label>
                      <Input id="price" name="price" type="number" placeholder="0 for free" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="durationMonths">Duration (Months)</Label>
                      <Input id="durationMonths" name="durationMonths" type="number" defaultValue={3} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || isUploadingThumbnail}>
                    {createMutation.isPending ? "Creating..." : "Create Course"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredCourses?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No courses found</h3>
              <p className="text-slate-500 text-center max-w-sm">
                {searchQuery ? "Try a different search term" : "Create your first course to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses?.map((course) => {
              const categoryPath = getCategoryPath(course);
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(course.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        {course.titleBn && (
                          <p className="text-sm text-slate-500 truncate">{course.titleBn}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCourse(course);
                            setEditThumbnailPreview(null);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this course?")) {
                                deleteMutation.mutate({ id: course.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Category Path */}
                    {categoryPath && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 flex-wrap">
                        <FolderTree className="h-3 w-3" />
                        {categoryPath.map((part, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <ChevronRight className="h-3 w-3" />}
                            {part}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span>{course.totalLessons || 0} lessons</span>
                      <span>{course.durationMonths} months</span>
                    </div>
                    <div className="mt-2 font-semibold text-primary">
                      {parseFloat(course.price || '0') > 0 ? `৳${course.price}` : 'Free'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => {
          if (!open) {
            setEditingCourse(null);
            setEditThumbnailPreview(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details
              </DialogDescription>
            </DialogHeader>
            {editingCourse && (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(new FormData(e.currentTarget)); }}>
                <div className="grid gap-4 py-4">
                  {/* Category Selection */}
                  <CategorySelector
                    categoryId={editCategoryId}
                    subcategoryId={editSubcategoryId}
                    sectionId={editSectionId}
                    onCategoryChange={setEditCategoryId}
                    onSubcategoryChange={setEditSubcategoryId}
                    onSectionChange={setEditSectionId}
                  />
                  
                  {/* Thumbnail Upload */}
                  <ThumbnailUploader
                    preview={editThumbnailPreview}
                    onRemove={() => setEditThumbnailPreview(null)}
                    inputRef={editThumbnailInputRef}
                    onChange={(e) => handleThumbnailChange(e, true)}
                    existingUrl={editingCourse.thumbnail}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editTitle">Title (English) *</Label>
                      <Input id="editTitle" name="title" required defaultValue={editingCourse.title} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editTitleBn">Title (Bengali)</Label>
                      <Input id="editTitleBn" name="titleBn" defaultValue={editingCourse.titleBn || ''} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea id="editDescription" name="description" rows={3} defaultValue={editingCourse.description || ''} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editLevel">Level</Label>
                      <Select name="level" defaultValue={editingCourse.level || 'beginner'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editStatus">Status</Label>
                      <Select name="status" defaultValue={editingCourse.status || 'draft'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPrice">Price (BDT)</Label>
                      <Input id="editPrice" name="price" type="number" defaultValue={editingCourse.price || '0'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editDurationMonths">Duration (Months)</Label>
                      <Input id="editDurationMonths" name="durationMonths" type="number" defaultValue={editingCourse.durationMonths || 3} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending || isUploadingThumbnail}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
