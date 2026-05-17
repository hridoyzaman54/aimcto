import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FolderTree, Plus, MoreVertical, Edit, Trash2, ChevronRight, ChevronDown, Layers, BookOpen, GraduationCap, Baby, Heart, Palette, Languages, Brain, Briefcase, Laptop } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Baby,
  Heart,
  Palette,
  Languages,
  Brain,
  Briefcase,
  Laptop,
  BookOpen,
  FolderTree,
};

export default function AdminCategories() {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<number>>(new Set());
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateSubcategoryOpen, setIsCreateSubcategoryOpen] = useState(false);
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  
  const { data: hierarchy, isLoading, refetch } = trpc.category.getHierarchy.useQuery();
  
  // Category mutations
  const createCategoryMutation = trpc.category.create.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully");
      setIsCreateCategoryOpen(false);
      refetch();
    },
    onError: (error) => toast.error(`Failed to create category: ${error.message}`),
  });

  const updateCategoryMutation = trpc.category.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      setEditingCategory(null);
      refetch();
    },
    onError: (error) => toast.error(`Failed to update category: ${error.message}`),
  });

  const deleteCategoryMutation = trpc.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      refetch();
    },
    onError: (error) => toast.error(`Failed to delete category: ${error.message}`),
  });

  // Subcategory mutations
  const createSubcategoryMutation = trpc.subcategory.create.useMutation({
    onSuccess: () => {
      toast.success("Subcategory created successfully");
      setIsCreateSubcategoryOpen(false);
      refetch();
    },
    onError: (error) => toast.error(`Failed to create subcategory: ${error.message}`),
  });

  const updateSubcategoryMutation = trpc.subcategory.update.useMutation({
    onSuccess: () => {
      toast.success("Subcategory updated successfully");
      setEditingSubcategory(null);
      refetch();
    },
    onError: (error) => toast.error(`Failed to update subcategory: ${error.message}`),
  });

  const deleteSubcategoryMutation = trpc.subcategory.delete.useMutation({
    onSuccess: () => {
      toast.success("Subcategory deleted successfully");
      refetch();
    },
    onError: (error) => toast.error(`Failed to delete subcategory: ${error.message}`),
  });

  // Section mutations
  const createSectionMutation = trpc.section.create.useMutation({
    onSuccess: () => {
      toast.success("Section created successfully");
      setIsCreateSectionOpen(false);
      refetch();
    },
    onError: (error) => toast.error(`Failed to create section: ${error.message}`),
  });

  const updateSectionMutation = trpc.section.update.useMutation({
    onSuccess: () => {
      toast.success("Section updated successfully");
      setEditingSection(null);
      refetch();
    },
    onError: (error) => toast.error(`Failed to update section: ${error.message}`),
  });

  const deleteSectionMutation = trpc.section.delete.useMutation({
    onSuccess: () => {
      toast.success("Section deleted successfully");
      refetch();
    },
    onError: (error) => toast.error(`Failed to delete section: ${error.message}`),
  });

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (id: number) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubcategories(newExpanded);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleCreateCategory = (formData: FormData) => {
    const name = formData.get('name') as string;
    createCategoryMutation.mutate({
      name,
      nameBn: formData.get('nameBn') as string || undefined,
      slug: generateSlug(name),
      description: formData.get('description') as string || undefined,
      icon: formData.get('icon') as string || 'FolderTree',
      color: formData.get('color') as string || '#3B82F6',
      orderIndex: hierarchy ? hierarchy.length + 1 : 1,
    });
  };

  const handleCreateSubcategory = (formData: FormData) => {
    if (!selectedCategoryId) return;
    const name = formData.get('name') as string;
    const category = hierarchy?.find(c => c.id === selectedCategoryId);
    createSubcategoryMutation.mutate({
      categoryId: selectedCategoryId,
      name,
      nameBn: formData.get('nameBn') as string || undefined,
      slug: `${category?.slug || 'cat'}-${generateSlug(name)}`,
      description: formData.get('description') as string || undefined,
      orderIndex: category?.subcategories?.length ? category.subcategories.length + 1 : 1,
    });
  };

  const handleCreateSection = (formData: FormData) => {
    if (!selectedSubcategoryId) return;
    const name = formData.get('name') as string;
    const category = hierarchy?.find(c => c.subcategories?.some(s => s.id === selectedSubcategoryId));
    const subcategory = category?.subcategories?.find(s => s.id === selectedSubcategoryId);
    createSectionMutation.mutate({
      subcategoryId: selectedSubcategoryId,
      name,
      nameBn: formData.get('nameBn') as string || undefined,
      slug: `${subcategory?.slug || 'sub'}-${generateSlug(name)}`,
      description: formData.get('description') as string || undefined,
      classLevel: formData.get('classLevel') as string || undefined,
      sectionName: formData.get('sectionName') as string || undefined,
      orderIndex: subcategory?.sections?.length ? subcategory.sections.length + 1 : 1,
    });
  };

  const getIcon = (iconName: string | null) => {
    const Icon = iconMap[iconName || 'FolderTree'] || FolderTree;
    return Icon;
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Category Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Organize courses into categories, subcategories, and sections
            </p>
          </div>
          <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new main category for organizing courses
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(new FormData(e.currentTarget)); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (English) *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Academic" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameBn">Name (Bengali)</Label>
                    <Input id="nameBn" name="nameBn" placeholder="e.g., একাডেমিক" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Brief description of this category" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <select id="icon" name="icon" className="w-full h-10 px-3 rounded-md border border-input bg-background">
                        <option value="GraduationCap">Graduation Cap</option>
                        <option value="Baby">Baby</option>
                        <option value="Heart">Heart</option>
                        <option value="Palette">Palette</option>
                        <option value="Languages">Languages</option>
                        <option value="Brain">Brain</option>
                        <option value="Briefcase">Briefcase</option>
                        <option value="Laptop">Laptop</option>
                        <option value="BookOpen">Book</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Theme Color</Label>
                      <Input id="color" name="color" type="color" defaultValue="#3B82F6" className="h-10" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCategoryMutation.isPending}>
                    {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Tree */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Category Hierarchy
            </CardTitle>
            <CardDescription>
              Click on categories to expand and view subcategories and sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hierarchy || hierarchy.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No categories yet. Create your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hierarchy.map((category) => {
                  const Icon = getIcon(category.icon);
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <Collapsible key={category.id} open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                      <div className="border rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <div 
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3"
                          style={{ borderLeft: `4px solid ${category.color || '#3B82F6'}` }}
                        >
                          <CollapsibleTrigger asChild>
                            <button className="flex items-center gap-3 flex-1 text-left min-w-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                              )}
                              <Icon className="h-5 w-5 flex-shrink-0" style={{ color: category.color || '#3B82F6' }} />
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-slate-900 dark:text-white block truncate">{category.name}</span>
                                {category.nameBn && (
                                  <span className="text-sm text-slate-500 block truncate">({category.nameBn})</span>
                                )}
                              </div>
                              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                                {category.subcategories?.length || 0} sub
                              </Badge>
                            </button>
                          </CollapsibleTrigger>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-7 sm:ml-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategoryId(category.id);
                                setIsCreateSubcategoryOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Add Subcategory</span>
                              <span className="sm:hidden">Add</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this category?")) {
                                      deleteCategoryMutation.mutate({ id: category.id });
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

                        {/* Subcategories */}
                        <CollapsibleContent>
                          <div className="border-t">
                            {category.subcategories?.length === 0 ? (
                              <div className="p-4 text-center text-slate-500 text-sm">
                                No subcategories yet
                              </div>
                            ) : (
                              category.subcategories?.map((subcategory) => {
                                const isSubExpanded = expandedSubcategories.has(subcategory.id);
                                
                                return (
                                  <Collapsible key={subcategory.id} open={isSubExpanded} onOpenChange={() => toggleSubcategory(subcategory.id)}>
                                    <div className="ml-4 sm:ml-8 border-l-2 border-slate-200 dark:border-slate-700">
                                      {/* Subcategory Header */}
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 pl-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors gap-2">
                                        <CollapsibleTrigger asChild>
                                          <button className="flex items-center gap-2 flex-1 text-left min-w-0">
                                            {subcategory.sections && subcategory.sections.length > 0 ? (
                                              isSubExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                              )
                                            ) : (
                                              <div className="w-4 flex-shrink-0" />
                                            )}
                                            <Layers className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                              <span className="text-slate-700 dark:text-slate-300 block truncate">{subcategory.name}</span>
                                              {subcategory.nameBn && (
                                                <span className="text-sm text-slate-400 block truncate">({subcategory.nameBn})</span>
                                              )}
                                            </div>
                                            {subcategory.sections && subcategory.sections.length > 0 && (
                                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                                {subcategory.sections.length}
                                              </Badge>
                                            )}
                                          </button>
                                        </CollapsibleTrigger>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-6 sm:ml-0">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs px-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSubcategoryId(subcategory.id);
                                              setIsCreateSectionOpen(true);
                                            }}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            <span className="hidden sm:inline">Add Section</span>
                                            <span className="sm:hidden">Add</span>
                                          </Button>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => setEditingSubcategory(subcategory)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuItem 
                                                className="text-red-600"
                                                onClick={() => {
                                                  if (confirm("Are you sure you want to delete this subcategory?")) {
                                                    deleteSubcategoryMutation.mutate({ id: subcategory.id });
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

                                      {/* Sections */}
                                      <CollapsibleContent>
                                        {subcategory.sections && subcategory.sections.length > 0 && (
                                          <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-800">
                                            {subcategory.sections.map((section) => (
                                              <div 
                                                key={section.id}
                                                className="flex items-center justify-between p-2 pl-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <BookOpen className="h-3 w-3 text-slate-400" />
                                                  <span className="text-sm text-slate-600 dark:text-slate-400">{section.name}</span>
                                                  {section.nameBn && (
                                                    <span className="text-xs text-slate-400">({section.nameBn})</span>
                                                  )}
                                                  {section.classLevel && (
                                                    <Badge variant="outline" className="text-xs">
                                                      Class {section.classLevel}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                      <MoreVertical className="h-3 w-3" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingSection(section)}>
                                                      <Edit className="h-4 w-4 mr-2" />
                                                      Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                      className="text-red-600"
                                                      onClick={() => {
                                                        if (confirm("Are you sure you want to delete this section?")) {
                                                          deleteSectionMutation.mutate({ id: section.id });
                                                        }
                                                      }}
                                                    >
                                                      <Trash2 className="h-4 w-4 mr-2" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                );
                              })
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Subcategory Dialog */}
        <Dialog open={isCreateSubcategoryOpen} onOpenChange={setIsCreateSubcategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subcategory</DialogTitle>
              <DialogDescription>
                Add a subcategory under the selected category
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateSubcategory(new FormData(e.currentTarget)); }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subName">Name (English) *</Label>
                  <Input id="subName" name="name" required placeholder="e.g., English Medium" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subNameBn">Name (Bengali)</Label>
                  <Input id="subNameBn" name="nameBn" placeholder="e.g., ইংরেজি মাধ্যম" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subDescription">Description</Label>
                  <Textarea id="subDescription" name="description" placeholder="Brief description" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateSubcategoryOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSubcategoryMutation.isPending}>
                  {createSubcategoryMutation.isPending ? "Creating..." : "Create Subcategory"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Section Dialog */}
        <Dialog open={isCreateSectionOpen} onOpenChange={setIsCreateSectionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Add a section (e.g., class level or division) under the selected subcategory
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateSection(new FormData(e.currentTarget)); }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="secName">Name (English) *</Label>
                  <Input id="secName" name="name" required placeholder="e.g., Class 5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secNameBn">Name (Bengali)</Label>
                  <Input id="secNameBn" name="nameBn" placeholder="e.g., শ্রেণি ৫" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classLevel">Class Level</Label>
                    <Input id="classLevel" name="classLevel" placeholder="e.g., 5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionName">Section Name</Label>
                    <Input id="sectionName" name="sectionName" placeholder="e.g., A, B, C" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secDescription">Description</Label>
                  <Textarea id="secDescription" name="description" placeholder="Brief description" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateSectionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSectionMutation.isPending}>
                  {createSectionMutation.isPending ? "Creating..." : "Create Section"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateCategoryMutation.mutate({
                  id: editingCategory.id,
                  name: formData.get('name') as string,
                  nameBn: formData.get('nameBn') as string || undefined,
                  description: formData.get('description') as string || undefined,
                  icon: formData.get('icon') as string,
                  color: formData.get('color') as string,
                });
              }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName">Name (English) *</Label>
                    <Input id="editName" name="name" required defaultValue={editingCategory.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editNameBn">Name (Bengali)</Label>
                    <Input id="editNameBn" name="nameBn" defaultValue={editingCategory.nameBn || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea id="editDescription" name="description" defaultValue={editingCategory.description || ''} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editIcon">Icon</Label>
                      <select id="editIcon" name="icon" defaultValue={editingCategory.icon || 'FolderTree'} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                        <option value="GraduationCap">Graduation Cap</option>
                        <option value="Baby">Baby</option>
                        <option value="Heart">Heart</option>
                        <option value="Palette">Palette</option>
                        <option value="Languages">Languages</option>
                        <option value="Brain">Brain</option>
                        <option value="Briefcase">Briefcase</option>
                        <option value="Laptop">Laptop</option>
                        <option value="BookOpen">Book</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editColor">Theme Color</Label>
                      <Input id="editColor" name="color" type="color" defaultValue={editingCategory.color || '#3B82F6'} className="h-10" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateCategoryMutation.isPending}>
                    {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Subcategory Dialog */}
        <Dialog open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subcategory</DialogTitle>
            </DialogHeader>
            {editingSubcategory && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSubcategoryMutation.mutate({
                  id: editingSubcategory.id,
                  name: formData.get('name') as string,
                  nameBn: formData.get('nameBn') as string || undefined,
                  description: formData.get('description') as string || undefined,
                });
              }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSubName">Name (English) *</Label>
                    <Input id="editSubName" name="name" required defaultValue={editingSubcategory.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSubNameBn">Name (Bengali)</Label>
                    <Input id="editSubNameBn" name="nameBn" defaultValue={editingSubcategory.nameBn || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSubDescription">Description</Label>
                    <Textarea id="editSubDescription" name="description" defaultValue={editingSubcategory.description || ''} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingSubcategory(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateSubcategoryMutation.isPending}>
                    {updateSubcategoryMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Section Dialog */}
        <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
            </DialogHeader>
            {editingSection && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSectionMutation.mutate({
                  id: editingSection.id,
                  name: formData.get('name') as string,
                  nameBn: formData.get('nameBn') as string || undefined,
                  description: formData.get('description') as string || undefined,
                  classLevel: formData.get('classLevel') as string || undefined,
                  sectionName: formData.get('sectionName') as string || undefined,
                });
              }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSecName">Name (English) *</Label>
                    <Input id="editSecName" name="name" required defaultValue={editingSection.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSecNameBn">Name (Bengali)</Label>
                    <Input id="editSecNameBn" name="nameBn" defaultValue={editingSection.nameBn || ''} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editClassLevel">Class Level</Label>
                      <Input id="editClassLevel" name="classLevel" defaultValue={editingSection.classLevel || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSectionName">Section Name</Label>
                      <Input id="editSectionName" name="sectionName" defaultValue={editingSection.sectionName || ''} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSecDescription">Description</Label>
                    <Textarea id="editSecDescription" name="description" defaultValue={editingSection.description || ''} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateSectionMutation.isPending}>
                    {updateSectionMutation.isPending ? "Saving..." : "Save Changes"}
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
