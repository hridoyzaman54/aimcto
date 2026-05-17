import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Search, Clock, Users, CheckCircle, Loader2, FolderTree, ChevronRight, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CourseCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("all");
  
  const { data: courses, isLoading } = trpc.course.getPublished.useQuery();
  const { data: enrollments } = trpc.enrollment.getMyEnrollments.useQuery();
  const { data: categoryHierarchy, isLoading: categoriesLoading } = trpc.category.getHierarchy.useQuery();
  const utils = trpc.useUtils();
  
  const enrollMutation = trpc.enrollment.enroll.useMutation({
    onSuccess: () => {
      toast.success("Successfully enrolled in course!");
      utils.enrollment.getMyEnrollments.invalidate();
      setEnrollingCourseId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enroll in course");
      setEnrollingCourseId(null);
    }
  });

  // Get selected category and its subcategories
  const selectedCategory = categoryHierarchy?.find(c => c.id.toString() === selectedCategoryId);
  
  // Filter courses based on search and category
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategoryId === "all" || 
      course.categoryId?.toString() === selectedCategoryId;
    
    const matchesSubcategory = 
      selectedSubcategoryId === "all" || 
      course.subcategoryId?.toString() === selectedSubcategoryId;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  }) || [];

  const isEnrolled = (courseId: number) => {
    return enrollments?.some(e => e.courseId === courseId);
  };

  const handleEnroll = (courseId: number) => {
    setEnrollingCourseId(courseId);
    enrollMutation.mutate({ courseId });
  };

  // Get category path for a course
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

  // Reset subcategory when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSubcategoryId("all");
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Course Catalog
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Browse and enroll in available courses
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Main Category Filter */}
              <div className="w-full sm:w-auto min-w-[200px]">
                <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryHierarchy?.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Subcategory Filter - only show if category is selected */}
              {selectedCategoryId !== "all" && selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                <div className="w-full sm:w-auto min-w-[200px]">
                  <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subcategories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {selectedCategory.subcategories.map(subcategory => (
                        <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Clear Filters */}
              {(selectedCategoryId !== "all" || selectedSubcategoryId !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setSelectedSubcategoryId("all");
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <Skeleton className="h-40 w-full rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const enrolled = isEnrolled(course.id);
              const isEnrolling = enrollingCourseId === course.id;
              const categoryPath = getCategoryPath(course);
              
              return (
                <Card 
                  key={course.id} 
                  className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Course Image/Header */}
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-white/30" />
                    )}
                    {enrolled && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-emerald-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {course.title}
                      </CardTitle>
                      {course.price && parseFloat(course.price) > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          ৳{course.price}
                        </Badge>
                      )}
                      {(!course.price || parseFloat(course.price) === 0) && (
                        <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-700">
                          Free
                        </Badge>
                      )}
                    </div>
                    
                    {/* Category Path */}
                    {categoryPath && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap mt-1">
                        <FolderTree className="h-3 w-3" />
                        {categoryPath.map((part, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <ChevronRight className="h-3 w-3" />}
                            {part}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <CardDescription className="line-clamp-2 text-sm mt-2">
                      {course.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.totalLessons || 0} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.durationMonths || 1} Month{(course.durationMonths || 1) > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {enrolled ? (
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => window.location.href = `/student/course/${course.id}`}
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleEnroll(course.id)}
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          "Enroll Now"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No courses found</p>
                <p className="text-sm">
                  {searchQuery || selectedCategoryId !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Check back later for new courses"}
                </p>
                {(searchQuery || selectedCategoryId !== "all") && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategoryId("all");
                      setSelectedSubcategoryId("all");
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
