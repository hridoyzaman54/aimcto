import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ClipboardList, Clock, Trophy, Play, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function StudentQuizzes() {
  const { data: enrollments, isLoading: enrollmentsLoading } = trpc.enrollment.getMyEnrollments.useQuery();
  const { data: attempts, isLoading: attemptsLoading } = trpc.quiz.getMyAttempts.useQuery({});
  
  // Get all course IDs from enrollments
  const courseIds = enrollments?.map(e => e.courseId) || [];
  
  // Fetch quizzes for each enrolled course
  const quizQueries = courseIds.map(courseId => 
    trpc.quiz.getByCourse.useQuery({ courseId }, { enabled: !!courseId })
  );
  
  const isLoading = enrollmentsLoading || attemptsLoading || quizQueries.some(q => q.isLoading);
  
  // Flatten all quizzes from all courses
  const allQuizzes = quizQueries.flatMap(q => q.data || []);
  
  // Get attempt status for a quiz
  const getAttemptStatus = (quizId: number) => {
    const quizAttempts = attempts?.filter(a => a.quizId === quizId) || [];
    if (quizAttempts.length === 0) return null;
    
    const bestAttempt = quizAttempts.reduce((best, current) => {
      const currentScore = current.score || 0;
      const bestScore = best?.score || 0;
      return currentScore > bestScore ? current : best;
    }, quizAttempts[0]);
    
    return bestAttempt;
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Quizzes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Take quizzes and track your scores
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allQuizzes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allQuizzes.map((quiz) => {
              const attempt = getAttemptStatus(quiz.id);
              const passed = attempt && attempt.score !== null && attempt.totalMarks !== null
                ? (parseFloat(String(attempt.score)) / attempt.totalMarks) * 100 >= (quiz.passingScore || 50)
                : false;
              
              return (
                <Card 
                  key={quiz.id} 
                  className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {quiz.title}
                          </CardTitle>
                        </div>
                      </div>
                      {attempt && (
                        <Badge className={passed 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }>
                          {passed ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {passed ? 'Passed' : 'Failed'}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">
                      {quiz.description || "Test your knowledge with this quiz"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {quiz.durationMinutes || 30} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Pass: {quiz.passingScore || 50}%
                      </span>
                    </div>
                    
                    {attempt && attempt.score !== null && attempt.totalMarks !== null && (
                      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Best Score</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          {Math.round((parseFloat(String(attempt.score)) / attempt.totalMarks) * 100)}%
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            ({attempt.score}/{attempt.totalMarks})
                          </span>
                        </p>
                      </div>
                    )}
                    
                    <Link href={`/student/quiz/${quiz.id}`}>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Play className="h-4 w-4 mr-2" />
                        {attempt ? 'Retry Quiz' : 'Start Quiz'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No quizzes available</p>
                <p className="text-sm mb-6">Enroll in courses to access their quizzes</p>
                <Link href="/student/catalog">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
