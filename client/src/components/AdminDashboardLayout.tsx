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
  Users, 
  BookOpen, 
  FileText, 
  ClipboardList,
  Calendar,
  Trophy,
  Bell,
  MessageSquare,
  Video,
  Sparkles,
  Settings,
  Home,
  GraduationCap,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  FolderTree
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import NotificationCenter from "./NotificationCenter";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: FolderTree, label: "Categories", path: "/admin/categories" },
  { icon: BookOpen, label: "Courses", path: "/admin/courses" },
  { icon: GraduationCap, label: "Enrollments", path: "/admin/enrollments" },
  { icon: FileText, label: "Lessons", path: "/admin/lessons" },
  { icon: ClipboardList, label: "Quizzes", path: "/admin/quizzes" },
  { icon: FileText, label: "Assignments", path: "/admin/assignments" },
  { icon: Calendar, label: "Attendance", path: "/admin/attendance" },
  { icon: Video, label: "Live Classes", path: "/admin/live-classes" },
  { icon: Trophy, label: "Achievements", path: "/admin/achievements" },
  { icon: Bell, label: "Announcements", path: "/admin/announcements" },
  { icon: Calendar, label: "Events", path: "/admin/events" },
  { icon: Sparkles, label: "AIMVerse", path: "/admin/aimverse" },
  { icon: Users, label: "Chat Groups", path: "/admin/chat-groups" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  { icon: User, label: "Profile", path: "/admin/profile" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminDashboardLayout({
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
    
    // Check immediately
    checkMobile();
    
    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeMenuItem = menuItems.find(item => 
    location === item.path || (item.path !== '/admin' && location.startsWith(item.path))
  ) || menuItems[0];

  // Check if we're on a sub-page (not the main dashboard)
  const isSubPage = location !== '/admin';

  // Handle logout - redirect to landing page
  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // Handle back button - go to previous page
  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Sign in with your admin credentials to access the management dashboard.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/login")}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in as Admin
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center text-red-600 dark:text-red-400">
              Access Denied
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              You don't have permission to access the admin dashboard.
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

  // Navigation content shared between mobile sheet and desktop sidebar
  const NavigationContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto py-2 px-2">
      {menuItems.map(item => {
        const isActive = location === item.path || (item.path !== '/admin' && location.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => {
              setLocation(item.path);
              onNavigate?.();
            }}
            className={`w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-all mb-1 ${
              isActive 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  // User menu content
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shrink-0">
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                {user?.name || "-"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Administrator
              </p>
            </div>
          )}
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
  );

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-2">
          <div className="flex items-center gap-1">
            {/* Back Button - only show on sub-pages */}
            {isSubPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {/* Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-medium text-slate-900 dark:text-white text-sm">
              {activeMenuItem?.label ?? "Admin"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationCenter />
            {/* Home Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="h-9 w-9"
              title="Back to Home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full">
                  <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
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
              <SheetDescription>Admin navigation</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
              <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">AIM Admin</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/")}
                  className="text-xs gap-1"
                >
                  <Home className="h-3 w-3" />
                  Home
                </Button>
              </div>
              <NavigationContent onNavigate={() => setMobileMenuOpen(false)} />
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-200"
        style={{ width: sidebarWidth }}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-700">
          {!sidebarCollapsed && (
            <span className="font-bold text-slate-900 dark:text-white">AIM Admin</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
            className={`w-full justify-start gap-2 ${sidebarCollapsed ? 'px-2' : ''}`}
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

        {/* Navigation */}
        <NavigationContent />

        {/* User Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
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
