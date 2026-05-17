import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  LogOut, 
  Menu,
  Calendar,
  Trophy,
  Bell,
  MessageSquare,
  Home,
  GraduationCap,
  BarChart3,
  User,
  Users,
  FileText,
  ClipboardList,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import NotificationCenter from "./NotificationCenter";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/parent" },
  { icon: Users, label: "My Children", path: "/parent/children" },
  { icon: UserPlus, label: "Link Child", path: "/parent/link-child" },
  { icon: BarChart3, label: "Progress", path: "/parent/progress" },
  { icon: Calendar, label: "Attendance", path: "/parent/attendance" },
  { icon: GraduationCap, label: "Grades", path: "/parent/grades" },
  { icon: ClipboardList, label: "Quiz Results", path: "/parent/quizzes" },
  { icon: FileText, label: "Assignments", path: "/parent/assignments" },
  { icon: Trophy, label: "Achievements", path: "/parent/achievements" },
  { icon: MessageSquare, label: "Teacher Remarks", path: "/parent/remarks" },
  { icon: Calendar, label: "Events", path: "/parent/events" },
  { icon: Bell, label: "Announcements", path: "/parent/announcements" },
  { icon: MessageSquare, label: "Messages", path: "/parent/messages" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeMenuItem = menuItems.find(item => 
    location === item.path || (item.path !== '/parent' && location.startsWith(item.path))
  ) || menuItems[0];

  // Check if we're on a sub-page (not the main dashboard)
  const isSubPage = location !== '/parent';

  // Handle logout - redirect to landing page
  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // Handle back button
  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-emerald-950">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Parent Portal
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Sign in to monitor your child's academic progress, attendance, and achievements.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/login")}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
          >
            Sign in to Portal
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is parent (or admin for testing)
  if (user.role !== 'parent' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-emerald-950">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center text-amber-600 dark:text-amber-400">
              Parent Access Required
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              This portal is for parents only.
            </p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" size="lg" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Navigation content
  const NavigationContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto py-2 px-2">
      {menuItems.map(item => {
        const isActive = location === item.path || (item.path !== '/parent' && location.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => {
              setLocation(item.path);
              onNavigate?.();
            }}
            className={`w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-all mb-1 ${
              isActive 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  // User menu
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors w-full text-left">
          <Avatar className="h-9 w-9 border border-emerald-200 dark:border-slate-700 shrink-0">
            <AvatarFallback className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                {user?.name || "-"}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                Parent
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setLocation("/parent/profile")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation("/")} className="cursor-pointer">
          <Home className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-slate-950 dark:to-slate-900">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-700 px-2">
          <div className="flex items-center gap-1">
            {isSubPage && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9" title="Go back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-medium text-emerald-900 dark:text-white text-sm">
              {activeMenuItem?.label ?? "Parent"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="h-9 w-9" title="Back to Home">
              <Home className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full">
                  <Avatar className="h-8 w-8 border border-emerald-200 dark:border-slate-700">
                    <AvatarFallback className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/")} className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Back to Home</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Parent navigation</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
              <div className="h-14 flex items-center justify-between px-4 border-b border-emerald-100 dark:border-slate-700">
                <span className="font-bold text-emerald-900 dark:text-white">Parent Portal</span>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-xs gap-1">
                  <Home className="h-3 w-3" />
                  Home
                </Button>
              </div>
              <NavigationContent onNavigate={() => setMobileMenuOpen(false)} />
              <div className="p-3 border-t border-emerald-100 dark:border-slate-700">
                <UserMenu />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Content */}
        <main className="p-4">{children}</main>
      </div>
    );
  }

  // DESKTOP LAYOUT
  const sidebarWidth = sidebarCollapsed ? 64 : 260;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-slate-950 dark:to-slate-900">
      {/* Desktop Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-slate-900 border-r border-emerald-100 dark:border-slate-700 transition-all duration-200"
        style={{ width: sidebarWidth }}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-emerald-100 dark:border-slate-700">
          {!sidebarCollapsed && (
            <span className="font-bold text-emerald-900 dark:text-white">Parent Portal</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Back to Home Button */}
        <div className="px-2 pt-2 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className={`w-full justify-start gap-2 border-emerald-200 dark:border-slate-700 ${sidebarCollapsed ? 'px-2' : ''}`}
          >
            <Home className="h-4 w-4" />
            {!sidebarCollapsed && <span>Back to Home</span>}
          </Button>
          {!sidebarCollapsed && (
            <div className="flex justify-center">
              <NotificationCenter />
            </div>
          )}
        </div>

        <NavigationContent />

        <div className="p-3 border-t border-emerald-100 dark:border-slate-700">
          <UserMenu />
        </div>
      </aside>

      {/* Desktop Content */}
      <main 
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
