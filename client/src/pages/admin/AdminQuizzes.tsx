import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Plus, Search, Filter, Clock, Users, CheckCircle, XCircle, 
  Edit, Trash2, Eye, FileText, Calendar, Target, Award,
  ClipboardList, GraduationCap, AlertCircle, MoreVertical,
  ChevronRight, BookOpen, Timer, Upload
} from "lucide-react";
import { Link } from "wouter";

export default function AdminQuizzes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  
  const { data: quizzes, isLoading, refetch } = trpc.quiz.getAll.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const { data: courses } = trpc.course.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: pendingGrading } = trpc.quiz.getPendingGrading.useQuery();
  
  const createMutation = trpc.quiz.create.useMutation({
    onSuccess: () => {
      toast.success("Quiz created successfully");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create quiz");
    },
  });
  
  const updateMutation = trpc.quiz.update.useMutation({
    onSuccess: () => {
      toast.success("Quiz updated successfully");
      setEditingQuiz(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quiz");
    },
  });
  
  const deleteMutation = trpc.quiz.delete.useMutation({
    onSuccess: () => {
      toast.success("Quiz deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete quiz");
    },
  });
  
  const filteredQuizzes = quizzes?.filter((quiz: any) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const stats = {
    total: quizzes?.length || 0,
    published: quizzes?.filter((q: any) => q.status === 'published').length || 0,
    draft: quizzes?.filter((q: any) => q.status === 'draft').length || 0,
    pendingGrading: pendingGrading?.length || 0,
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Create and manage quizzes, view submissions, and grade answers</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <QuizForm 
                courses={courses || []}
                categories={categories || []}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Quizzes" value={stats.total} icon={ClipboardList} color="blue" />
          <StatCard title="Published" value={stats.published} icon={CheckCircle} color="emerald" />
          <StatCard title="Drafts" value={stats.draft} icon={FileText} color="amber" />
          <StatCard 
            title="Pending Grading" 
            value={stats.pendingGrading} 
            icon={AlertCircle} 
            color="red"
            href="/admin/quiz-grading"
          />
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quiz List */}
        <div className="grid gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredQuizzes.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No quizzes found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first quiz to get started</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredQuizzes.map((quiz: any) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz}
                onEdit={() => setEditingQuiz(quiz)}
                onDelete={() => {
                  if (confirm("Are you sure you want to delete this quiz?")) {
                    deleteMutation.mutate({ id: quiz.id });
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingQuiz} onOpenChange={(open) => !open && setEditingQuiz(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingQuiz && (
              <QuizForm 
                quiz={editingQuiz}
                courses={courses || []}
                categories={categories || []}
                onSubmit={(data) => updateMutation.mutate({ id: editingQuiz.id, ...data })}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, href }: { 
  title: string; 
  value: number; 
  icon: any; 
  color: 'blue' | 'emerald' | 'amber' | 'red';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const content = (
    <Card className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          </div>
          {href && <ChevronRight className="h-5 w-5 ml-auto text-slate-400" />}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuizCard({ quiz, onEdit, onDelete }: { quiz: any; onEdit: () => void; onDelete: () => void }) {
  const statusColors = {
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    archived: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  };

  return (
    <Card className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{quiz.title}</h3>
                <Badge className={statusColors[quiz.status as keyof typeof statusColors]}>
                  {quiz.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {quiz.description || "No description"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {quiz.durationMinutes || 30} mins
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {quiz.totalMarks || 100} marks
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Pass: {quiz.passingScore || 60}%
                </span>
                {quiz.targetClass && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {quiz.targetClass}
                  </span>
                )}
                {quiz.allowHandwrittenUpload && (
                  <span className="flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Handwritten
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/admin/quiz/${quiz.id}/questions`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Questions
              </Button>
            </Link>
            <Link href={`/admin/quiz/${quiz.id}/submissions`}>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Submissions
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuizForm({ quiz, courses, categories, onSubmit, isLoading }: {
  quiz?: any;
  courses: any[];
  categories: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: quiz?.title || "",
    titleBn: quiz?.titleBn || "",
    description: quiz?.description || "",
    instructions: quiz?.instructions || "",
    courseId: quiz?.courseId?.toString() || "",
    categoryId: quiz?.categoryId?.toString() || "",
    targetClass: quiz?.targetClass || "",
    targetSection: quiz?.targetSection || "",
    durationMinutes: quiz?.durationMinutes || 30,
    totalMarks: quiz?.totalMarks || 100,
    passingScore: quiz?.passingScore || 60,
    maxAttempts: quiz?.maxAttempts || 1,
    shuffleQuestions: quiz?.shuffleQuestions || false,
    showResults: quiz?.showResults ?? true,
    showCorrectAnswers: quiz?.showCorrectAnswers || false,
    allowHandwrittenUpload: quiz?.allowHandwrittenUpload || false,
    requireHandwrittenUpload: quiz?.requireHandwrittenUpload || false,
    autoGrade: quiz?.autoGrade ?? true,
    announcementDate: quiz?.announcementDate ? new Date(quiz.announcementDate).toISOString().slice(0, 16) : "",
    availableFrom: quiz?.availableFrom ? new Date(quiz.availableFrom).toISOString().slice(0, 16) : "",
    availableUntil: quiz?.availableUntil ? new Date(quiz.availableUntil).toISOString().slice(0, 16) : "",
    status: quiz?.status || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      ...formData,
      courseId: formData.courseId ? parseInt(formData.courseId) : undefined,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{quiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
        <DialogDescription>
          {quiz ? "Update quiz settings and configuration" : "Set up a new quiz with questions and scheduling"}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="basic" className="mt-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <Label htmlFor="titleBn">Title (Bengali)</Label>
              <Input
                id="titleBn"
                value={formData.titleBn}
                onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                placeholder="বাংলায় শিরোনাম"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the quiz"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions for Students</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Detailed instructions that students will see before starting the quiz"
                rows={4}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="courseId">Course (Optional)</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific course</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetClass">Target Class</Label>
              <Select
                value={formData.targetClass}
                onValueChange={(value) => setFormData({ ...formData, targetClass: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                    <SelectItem key={cls} value={`Class ${cls}`}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetSection">Target Section</Label>
              <Select
                value={formData.targetSection}
                onValueChange={(value) => setFormData({ ...formData, targetSection: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sections</SelectItem>
                  {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                    <SelectItem key={sec} value={`Section ${sec}`}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 100 })}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 60 })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="announcementDate">Announcement Date</Label>
              <Input
                id="announcementDate"
                type="datetime-local"
                value={formData.announcementDate}
                onChange={(e) => setFormData({ ...formData, announcementDate: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">When students will be notified about this quiz</p>
            </div>
            <div>
              <Label htmlFor="availableFrom">Available From</Label>
              <Input
                id="availableFrom"
                type="datetime-local"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">When students can start taking the quiz</p>
            </div>
            <div>
              <Label htmlFor="availableUntil">Available Until (Deadline)</Label>
              <Input
                id="availableUntil"
                type="datetime-local"
                value={formData.availableUntil}
                onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">Deadline for quiz submission</p>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
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
        </TabsContent>

        <TabsContent value="options" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <Label className="text-base">Shuffle Questions</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Randomize question order for each student</p>
              </div>
              <Switch
                checked={formData.shuffleQuestions}
                onCheckedChange={(checked) => setFormData({ ...formData, shuffleQuestions: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <Label className="text-base">Show Results</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Show score immediately after submission</p>
              </div>
              <Switch
                checked={formData.showResults}
                onCheckedChange={(checked) => setFormData({ ...formData, showResults: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <Label className="text-base">Show Correct Answers</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Reveal correct answers after submission</p>
              </div>
              <Switch
                checked={formData.showCorrectAnswers}
                onCheckedChange={(checked) => setFormData({ ...formData, showCorrectAnswers: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <Label className="text-base">Auto-Grade MCQ</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Automatically grade multiple choice questions</p>
              </div>
              <Switch
                checked={formData.autoGrade}
                onCheckedChange={(checked) => setFormData({ ...formData, autoGrade: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <Label className="text-base">Allow Handwritten Upload</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Students can attach scanned handwritten documents</p>
              </div>
              <Switch
                checked={formData.allowHandwrittenUpload}
                onCheckedChange={(checked) => setFormData({ ...formData, allowHandwrittenUpload: checked })}
              />
            </div>
            {formData.allowHandwrittenUpload && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div>
                  <Label className="text-base">Require Handwritten Upload</Label>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Make handwritten document mandatory</p>
                </div>
                <Switch
                  checked={formData.requireHandwrittenUpload}
                  onCheckedChange={(checked) => setFormData({ ...formData, requireHandwrittenUpload: checked })}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : quiz ? "Update Quiz" : "Create Quiz"}
        </Button>
      </DialogFooter>
    </form>
  );
}
