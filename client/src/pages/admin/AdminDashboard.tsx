import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, BookOpen, GraduationCap, TrendingUp, Calendar, Bell, Video, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.adminStats.useQuery();

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back! Here's an overview of your learning platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalStudents || 0}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Registered students
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalCourses || 0}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Published courses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Enrollments
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalEnrollments || 0}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All time enrollments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Enrollments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.activeEnrollments || 0}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Manage Users"
            description="Add, edit, or manage user accounts"
            icon={Users}
            href="/admin/users"
            color="blue"
          />
          <QuickActionCard
            title="Course Management"
            description="Create and manage courses"
            icon={BookOpen}
            href="/admin/courses"
            color="emerald"
          />
          <QuickActionCard
            title="Live Classes"
            description="Schedule and manage live sessions"
            icon={Video}
            href="/admin/live-classes"
            color="purple"
          />
          <QuickActionCard
            title="Announcements"
            description="Post announcements to users"
            icon={Bell}
            href="/admin/announcements"
            color="amber"
          />
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Scheduled events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingEvents />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Latest student achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAchievements />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  href: string; 
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30',
  };

  return (
    <a href={href}>
      <Card className={`${colorClasses[color]} border-0 cursor-pointer transition-all hover:shadow-md`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' : color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40' : color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm opacity-80">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function UpcomingEvents() {
  const { data: events, isLoading } = trpc.event.getUpcoming.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map(event => (
        <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {event.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(event.eventDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentAchievements() {
  const { data: achievements, isLoading } = trpc.achievement.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No achievements yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.slice(0, 5).map(achievement => (
        <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {achievement.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {achievement.points} points
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
