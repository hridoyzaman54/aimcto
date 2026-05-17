import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useEffect, lazy, Suspense } from "react";
import Lenis from "@studio-freight/lenis";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";
import { DashboardLayoutSkeleton } from "./components/DashboardLayoutSkeleton";

import AIVoicePage from "@/pages/AIVoicePage";
import Auth from "@/pages/Auth";
import Chatbot from "./components/Chatbot";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// Lazy load dashboard pages for better performance
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const ParentDashboard = lazy(() => import("@/pages/parent/ParentDashboard"));

// Admin pages
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("@/pages/admin/AdminCourses"));
const AdminEnrollments = lazy(() => import("@/pages/admin/AdminEnrollments"));
const AdminQuizzes = lazy(() => import("@/pages/admin/AdminQuizzes"));
const AdminAssignments = lazy(() => import("@/pages/admin/AdminAssignments"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/AdminAnnouncements"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminAIMVerse = lazy(() => import("@/pages/admin/AdminAIMVerse"));
const AdminLiveClasses = lazy(() => import("@/pages/admin/AdminLiveClasses"));
const AdminAchievements = lazy(() => import("@/pages/admin/AdminAchievements"));
const AdminLessons = lazy(() => import("@/pages/admin/AdminLessons"));
const AdminChatGroups = lazy(() => import("@/pages/admin/AdminChatGroups"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminQuizQuestions = lazy(() => import("@/pages/admin/AdminQuizQuestions"));
const AdminQuizSubmissions = lazy(() => import("@/pages/admin/AdminQuizSubmissions"));
const AdminQuizGrading = lazy(() => import("@/pages/admin/AdminQuizGrading"));

// Student pages
const StudentCourses = lazy(() => import("@/pages/student/StudentCourses"));
const StudentQuizzes = lazy(() => import("@/pages/student/StudentQuizzes"));
const StudentAssignments = lazy(() => import("@/pages/student/StudentAssignments"));
const StudentAchievements = lazy(() => import("@/pages/student/StudentAchievements"));
const StudentAIMVerse = lazy(() => import("@/pages/student/StudentAIMVerse"));
const StudentProfile = lazy(() => import("@/pages/student/StudentProfile"));
const CoursePlayer = lazy(() => import("@/pages/student/CoursePlayer"));
const CourseCatalog = lazy(() => import("@/pages/student/CourseCatalog"));
const QuizPlayer = lazy(() => import("@/pages/student/QuizPlayer"));
const StudentNotes = lazy(() => import("@/pages/student/StudentNotes"));
const StudentProgress = lazy(() => import("@/pages/student/StudentProgress"));
const StudentAttendance = lazy(() => import("@/pages/student/StudentAttendance"));
const StudentGrades = lazy(() => import("@/pages/student/StudentGrades"));
const StudentLiveClasses = lazy(() => import("@/pages/student/StudentLiveClasses"));
const StudentGames = lazy(() => import("@/pages/student/StudentGames"));
const StudentEvents = lazy(() => import("@/pages/student/StudentEvents"));
const StudentNotifications = lazy(() => import("@/pages/student/StudentNotifications"));
const StudentMessages = lazy(() => import("@/pages/student/StudentMessages"));

// Parent pages
const ParentLinkChild = lazy(() => import("@/pages/parent/ParentLinkChild"));
const ParentProgress = lazy(() => import("@/pages/parent/ParentProgress"));

// Utility pages
const DocumentViewerDemo = lazy(() => import("@/pages/DocumentViewerDemo"));

function Router() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <Switch>
        {/* Public routes */}
        <Route path={"/"} component={Home} />
        <Route path={"/ai-voice"} component={AIVoicePage} />
        <Route path={"/auth"}>{() => { window.location.href = '/login'; return null; }}</Route>
        <Route path={"/login"} component={Login} />
        <Route path={"/signup"} component={Signup} />
        <Route path={"/document-viewer"} component={DocumentViewerDemo} />
        
        {/* Admin routes */}
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/admin/users"} component={AdminUsers} />
        <Route path={"/admin/courses"} component={AdminCourses} />
        <Route path={"/admin/enrollments"} component={AdminEnrollments} />
        <Route path="/admin/quizzes" component={AdminQuizzes} />
        <Route path="/admin/quiz/:quizId/questions" component={AdminQuizQuestions} />
        <Route path="/admin/quiz/:quizId/submissions" component={AdminQuizSubmissions} />
        <Route path="/admin/quiz/:quizId/grade/:attemptId" component={AdminQuizGrading} />
        <Route path="/admin/assignments" component={AdminAssignments} />
        <Route path={"/admin/announcements"} component={AdminAnnouncements} />
        <Route path={"/admin/lessons"} component={AdminLessons} />
        <Route path={"/admin/events"} component={AdminEvents} />
        <Route path={"/admin/aimverse"} component={AdminAIMVerse} />
        <Route path={"/admin/live-classes"} component={AdminLiveClasses} />
        <Route path={"/admin/achievements"} component={AdminAchievements} />
        <Route path={"/admin/chat-groups"} component={AdminChatGroups} />
        <Route path={"/admin/categories"} component={AdminCategories} />
        <Route path={"/admin/profile"} component={AdminProfile} />
        
        {/* Student routes */}
        <Route path={"/student"} component={StudentDashboard} />
        <Route path={"/student/courses"} component={StudentCourses} />
        <Route path={"/student/catalog"} component={CourseCatalog} />
        <Route path={"/student/quizzes"} component={StudentQuizzes} />
        <Route path={"/student/quiz/:quizId"} component={QuizPlayer} />
        <Route path={"/student/assignments"} component={StudentAssignments} />
        <Route path={"/student/achievements"} component={StudentAchievements} />
        <Route path={"/student/aimverse"} component={StudentAIMVerse} />
        <Route path={"/student/profile"} component={StudentProfile} />
        <Route path={"/student/course/:courseId"} component={CoursePlayer} />
        <Route path={"/student/course/:courseId/lesson/:lessonId"} component={CoursePlayer} />
        <Route path={"/student/notes"} component={StudentNotes} />
        <Route path={"/student/progress"} component={StudentProgress} />
        <Route path={"/student/attendance"} component={StudentAttendance} />
        <Route path={"/student/grades"} component={StudentGrades} />
        <Route path={"/student/live-classes"} component={StudentLiveClasses} />
        <Route path={"/student/games"} component={StudentGames} />
        <Route path={"/student/events"} component={StudentEvents} />
        <Route path={"/student/notifications"} component={StudentNotifications} />
        <Route path={"/student/messages"} component={StudentMessages} />
        
        {/* Parent routes */}
        <Route path={"/parent"} component={ParentDashboard} />
        <Route path={"/parent/link-child"} component={ParentLinkChild} />
        <Route path={"/parent/progress"} component={ParentProgress} />
        
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function AppContent() {
  const [location] = useLocation();
  
  // Check if we're on a dashboard route
  const isDashboardRoute = location.startsWith('/admin') || location.startsWith('/student') || location.startsWith('/parent');
  const isAuthRoute = location === '/login' || location === '/signup' || location === '/auth';

  useEffect(() => {
    // Skip Lenis smooth scroll on dashboard routes for better UX
    if (isDashboardRoute) return;
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isDashboardRoute]);

  return (
    <ThemeProvider
      defaultTheme="light"
      switchable
    >
      <TooltipProvider>
        {!isDashboardRoute && <CustomCursor />}
        {location !== '/auth' && !isDashboardRoute && <Chatbot />}
        <ScrollToTop />
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
