import ParentDashboardLayout from "@/components/ParentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, BookOpen, Trophy, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function ParentProgress() {
  const { data: linkedStudents, isLoading } = trpc.parentStudent.getLinkedStudents.useQuery();

  return (
    <ParentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Progress Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your children's learning progress
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : linkedStudents && linkedStudents.length > 0 ? (
          <div className="space-y-6">
            {linkedStudents.map((student: any) => (
              <Card key={student.id} className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {student.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.name || 'Student'}</CardTitle>
                      <CardDescription>
                        {student.grade || 'Grade not set'} • UID: {student.studentUid}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats Grid */}
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <StatCard
                      title="Courses"
                      value={student.enrollmentCount || 0}
                      icon={BookOpen}
                      color="blue"
                    />
                    <StatCard
                      title="Completed"
                      value={student.completedCourses || 0}
                      icon={TrendingUp}
                      color="emerald"
                    />
                    <StatCard
                      title="Achievements"
                      value={student.achievementCount || 0}
                      icon={Trophy}
                      color="amber"
                    />
                    <StatCard
                      title="Attendance"
                      value={`${student.attendanceRate || 0}%`}
                      icon={Users}
                      color="purple"
                    />
                  </div>

                  {/* Course Progress */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white">Course Progress</h4>
                    {student.courses && student.courses.length > 0 ? (
                      student.courses.map((course: any) => (
                        <div key={course.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {course.title}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {course.progress || 0}%
                            </span>
                          </div>
                          <Progress value={course.progress || 0} className="h-2" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                        No courses enrolled yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No children linked</p>
                <p className="text-sm mb-6">Link your child's account to view their progress</p>
                <a 
                  href="/parent/link-child" 
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Link Child Account
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentDashboardLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
        </div>
      </div>
    </div>
  );
}
