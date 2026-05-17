import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, Trophy, ClipboardList, Calendar, Video, Bell, BarChart3, Sparkles, AlertTriangle, Megaphone, Heart, ArrowRight, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.studentStats.useQuery();
  const { data: enrollments } = trpc.enrollment.getMyEnrollments.useQuery();
  const { data: notifications } = trpc.notification.getMyNotifications.useQuery({ unreadOnly: true });
  const { data: liveClasses } = trpc.liveClass.getUpcoming.useQuery();
  const { data: announcements } = trpc.announcement.getAll.useQuery({ audience: 'students' });
  const { data: wishlist, isLoading: wishlistLoading } = trpc.wishlist.getMyWishlist.useQuery();

  // Filter urgent announcements
  const urgentAnnouncements = announcements?.filter((a: any) => a.priority === 'urgent' || a.isPinned) || [];

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        {/* Urgent Announcements Banner */}
        {urgentAnnouncements.length > 0 && (
          <div className="space-y-3">
            {urgentAnnouncements.map((announcement: any) => (
              <div
                key={announcement.id}
                className={`rounded-xl p-4 border-l-4 ${
                  announcement.priority === 'urgent'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    announcement.priority === 'urgent'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {announcement.priority === 'urgent' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${
                        announcement.priority === 'urgent'
                          ? 'text-red-800 dark:text-red-300'
                          : 'text-amber-800 dark:text-amber-300'
                      }`}>
                        {announcement.title}
                      </h3>
                      {announcement.priority === 'urgent' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      announcement.priority === 'urgent'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}>
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 mt-1">
            Continue your learning journey. You're doing great!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Enrolled Courses"
            value={stats?.enrolledCourses || 0}
            icon={BookOpen}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Completed Lessons"
            value={stats?.completedLessons || 0}
            icon={BarChart3}
            color="emerald"
            isLoading={isLoading}
          />
          <StatCard
            title="Quizzes Taken"
            value={stats?.quizzesTaken || 0}
            icon={ClipboardList}
            color="purple"
            isLoading={isLoading}
          />
          <StatCard
            title="Achievements"
            value={stats?.achievementsEarned || 0}
            icon={Trophy}
            color="amber"
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  My Courses
                </CardTitle>
                <CardDescription>
                  Continue where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveCourses enrollments={enrollments} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Live Classes */}
            <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-600" />
                  Upcoming Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingClasses classes={liveClasses} />
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  Notifications
                  {notifications && notifications.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationsList notifications={notifications} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <QuickAction
            title="Take Quiz"
            icon={ClipboardList}
            href="/student/quizzes"
            color="purple"
          />
          <QuickAction
            title="View Schedule"
            icon={Calendar}
            href="/student/events"
            color="blue"
          />
          <QuickAction
            title="My Achievements"
            icon={Trophy}
            href="/student/achievements"
            color="amber"
          />
          <QuickAction
            title="AIMVerse"
            icon={Sparkles}
            href="/student/aimverse"
            color="pink"
          />
        </div>

        {/* Wishlist Section */}
        <Card className="bg-white dark:bg-slate-800 border-pink-100 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
              My Wishlist
              {wishlist && wishlist.length > 0 && (
                <span className="ml-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs px-2 py-0.5 rounded-full">
                  {wishlist.length} courses
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Courses you've saved for later - enroll when you're ready!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WishlistSection wishlist={wishlist} isLoading={wishlistLoading} />
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isLoading 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  isLoading: boolean;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveCourses({ enrollments }: { enrollments: any[] | undefined }) {
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No courses yet</p>
        <p className="text-sm">Enroll in a course to start learning!</p>
        <a 
          href="/#courses" 
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Courses
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.slice(0, 4).map((enrollment) => (
        <div 
          key={enrollment.id} 
          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900 dark:text-white">
              Course #{enrollment.courseId}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              enrollment.status === 'active' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
            }`}>
              {enrollment.status}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Progress</span>
              <span>{enrollment.progressPercent || 0}%</span>
            </div>
            <Progress value={enrollment.progressPercent || 0} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingClasses({ classes }: { classes: any[] | undefined }) {
  if (!classes || classes.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No upcoming classes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {classes.slice(0, 3).map((cls) => (
        <div key={cls.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {cls.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(cls.scheduledAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsList({ notifications }: { notifications: any[] | undefined }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.slice(0, 3).map((notification) => (
        <div key={notification.id} className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <p className="font-medium text-sm text-slate-900 dark:text-white">
            {notification.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {notification.content}
          </p>
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
  color: 'blue' | 'purple' | 'amber' | 'pink';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100',
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


function WishlistSection({ wishlist, isLoading }: { wishlist: any[] | undefined; isLoading: boolean }) {
  const utils = trpc.useUtils();
  
  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.getMyWishlist.invalidate();
      utils.wishlist.getMyWishlistIds.invalidate();
      toast.success("Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
            <Skeleton className="h-32 w-full mb-3 rounded-lg" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Your wishlist is empty</p>
        <p className="text-sm mb-4">Browse courses and click the heart icon to save them here!</p>
        <Link href="/#courses">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wishlist.map((item) => (
        <div 
          key={item.wishlistId} 
          className="group relative p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 hover:shadow-md"
        >
          {/* Course Image */}
          <div className="relative h-32 rounded-lg overflow-hidden mb-3">
            <img
              src={item.course.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"}
              alt={item.course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
            
            {/* Remove from wishlist button */}
            <button
              onClick={() => removeMutation.mutate({ courseId: item.courseId })}
              disabled={removeMutation.isPending}
              className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <Heart className="h-4 w-4 fill-current" />
            </button>
          </div>

          {/* Course Info */}
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">
            {item.course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {item.course.description || "Explore this comprehensive course."}
          </p>

          {/* Price and Enroll */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-pink-600 dark:text-pink-400">
              {parseFloat(item.course.price || '0') > 0 ? `৳${item.course.price}` : 'Free'}
            </span>
            <Link href={`/student/catalog`}>
              <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white text-xs h-8">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Enroll
              </Button>
            </Link>
          </div>

          {/* Added date */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            Added {new Date(item.addedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
