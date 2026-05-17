import ParentDashboardLayout from "@/components/ParentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Trophy, Calendar, Bell, BarChart3, MessageSquare, UserPlus, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { data: linkedStudents, isLoading: studentsLoading } = trpc.parentStudent.getLinkedStudents.useQuery();
  const { data: announcements } = trpc.announcement.getAll.useQuery({ audience: 'parents' });
  const { data: events } = trpc.event.getUpcoming.useQuery({ limit: 5 });

  const hasLinkedStudents = linkedStudents && linkedStudents.length > 0;

  return (
    <ParentDashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name?.split(' ')[0] || 'Parent'}! 👋
          </h1>
          <p className="text-emerald-100 mt-1">
            Monitor your child's academic progress and stay connected with their learning journey.
          </p>
        </div>

        {/* Link Child CTA (if no children linked) */}
        {!studentsLoading && !hasLinkedStudents && (
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <UserPlus className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Link Your Child's Account
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Enter your child's Student UID to view their progress, grades, and achievements.
                  </p>
                </div>
                <a href="/parent/link-child">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    Link Child
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Linked Children */}
        {hasLinkedStudents && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              My Children
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {linkedStudents.map((student: any) => (
                <ChildCard key={student.id} student={student} />
              ))}
              <a href="/parent/link-child">
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[150px]">
                    <UserPlus className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Add Another Child</p>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            {hasLinkedStudents && (
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total Children"
                  value={linkedStudents.length}
                  icon={Users}
                  color="emerald"
                />
                <StatCard
                  title="Active Courses"
                  value={linkedStudents.reduce((acc: number, s: any) => acc + (s.enrollmentCount || 0), 0)}
                  icon={GraduationCap}
                  color="blue"
                />
                <StatCard
                  title="Achievements"
                  value={linkedStudents.reduce((acc: number, s: any) => acc + (s.achievementCount || 0), 0)}
                  icon={Trophy}
                  color="amber"
                />
              </div>
            )}

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your children's learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasLinkedStudents ? (
                  <RecentActivity students={linkedStudents} />
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Link a child to see their activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Announcements */}
            <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnnouncementsList announcements={announcements} />
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventsList events={events} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <QuickAction
            title="View Progress"
            icon={BarChart3}
            href="/parent/progress"
            color="emerald"
          />
          <QuickAction
            title="Attendance"
            icon={Calendar}
            href="/parent/attendance"
            color="blue"
          />
          <QuickAction
            title="Teacher Remarks"
            icon={MessageSquare}
            href="/parent/remarks"
            color="purple"
          />
          <QuickAction
            title="Achievements"
            icon={Trophy}
            href="/parent/achievements"
            color="amber"
          />
        </div>
      </div>
    </ParentDashboardLayout>
  );
}

function ChildCard({ student }: { student: any }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {student.name?.charAt(0).toUpperCase() || 'S'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {student.name || 'Student'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              UID: {student.studentUid}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {student.grade || 'Grade not set'}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between text-sm">
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-white">{student.enrollmentCount || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Courses</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-white">{student.achievementCount || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Achievements</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-white">{student.attendanceRate || 0}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Attendance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: 'emerald' | 'blue' | 'amber';
}) {
  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ students }: { students: any[] }) {
  // Placeholder for recent activity - would need to aggregate from multiple sources
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          📚 Activity tracking will show here once children are enrolled in courses.
        </p>
      </div>
    </div>
  );
}

function AnnouncementsList({ announcements }: { announcements: any[] | undefined }) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No announcements</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.slice(0, 3).map((announcement) => (
        <div key={announcement.id} className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <p className="font-medium text-sm text-slate-900 dark:text-white">
            {announcement.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {announcement.content}
          </p>
        </div>
      ))}
    </div>
  );
}

function EventsList({ events }: { events: any[] | undefined }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.slice(0, 3).map((event) => (
        <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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

function QuickAction({ 
  title, 
  icon: Icon, 
  href, 
  color 
}: { 
  title: string; 
  icon: any; 
  href: string; 
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100',
  };

  return (
    <a href={href}>
      <Card className={`${colorClasses[color]} border-0 cursor-pointer transition-all hover:shadow-md`}>
        <CardContent className="pt-6 pb-6 text-center">
          <Icon className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">{title}</p>
        </CardContent>
      </Card>
    </a>
  );
}
