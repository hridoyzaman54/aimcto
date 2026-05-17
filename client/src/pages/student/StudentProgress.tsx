import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, BookOpen, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StudentProgress() {
  const { data: enrollments = [], isLoading } = trpc.enrollment.getMyEnrollments.useQuery();

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentDashboardLayout>
    );
  }

  const totalLessonsCompleted = enrollments.reduce((acc: number, e: any) => acc + (e.completedLessons || 0), 0);

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Progress
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your learning progress across all courses
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {enrollments.length}
                  </p>
                  <p className="text-sm text-slate-500">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalLessonsCompleted}
                  </p>
                  <p className="text-sm text-slate-500">Lessons Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {enrollments.filter((e: any) => e.status === 'completed').length}
                  </p>
                  <p className="text-sm text-slate-500">Courses Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Course Progress
            </CardTitle>
            <CardDescription>
              Your progress in each enrolled course
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No courses enrolled</p>
                <p className="text-sm">Enroll in a course to track your progress</p>
              </div>
            ) : (
              <div className="space-y-6">
                {enrollments.map((enrollment: any) => {
                  const percentage = enrollment.progressPercent || 0;
                  
                  return (
                    <div key={enrollment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {enrollment.courseTitle || "Course"}
                        </h3>
                        <span className="text-sm text-slate-500">
                          {percentage}% complete
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
