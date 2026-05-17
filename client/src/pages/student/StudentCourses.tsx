import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, Play, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function StudentCourses() {
  const { data: enrollments, isLoading } = trpc.enrollment.getMyEnrollments.useQuery();

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Continue learning from where you left off
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <Skeleton className="h-40 w-full rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/student/course/${enrollment.courseId}`}>
                <Card 
                  className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group h-full"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <BookOpen className="h-16 w-16 text-white/30" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {enrollment.courseTitle || `Course #${enrollment.courseId}`}
                      </CardTitle>
                      <Badge className={enrollment.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Progress</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {enrollment.progressPercent || 0}%
                        </span>
                      </div>
                      <Progress value={enrollment.progressPercent || 0} className="h-2" />
                      
                      {enrollment.progressPercent === 100 && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed!</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No courses yet</p>
                <p className="text-sm mb-6">Enroll in a course to start your learning journey</p>
                <a 
                  href="/#courses" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Browse Courses
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
