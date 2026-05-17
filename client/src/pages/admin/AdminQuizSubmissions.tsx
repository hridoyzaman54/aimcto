import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { 
  ArrowLeft, Users, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, Download, Eye, Award
} from "lucide-react";

export default function AdminQuizSubmissions() {
  const { quizId } = useParams<{ quizId: string }>();
  
  const { data: quiz, isLoading: quizLoading } = trpc.quiz.getById.useQuery({ id: parseInt(quizId || '0') });
  const { data: submissions, isLoading } = trpc.quiz.getAttemptsByQuiz.useQuery({ quizId: parseInt(quizId || '0') });

  const getGradingStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { 
        label: 'Pending', 
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock
      },
      auto_graded: { 
        label: 'Auto-Graded', 
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: AlertCircle
      },
      partially_graded: { 
        label: 'Partially Graded', 
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: AlertCircle
      },
      fully_graded: { 
        label: 'Fully Graded', 
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = {
    total: submissions?.length || 0,
    graded: submissions?.filter((s: any) => s.attempt.gradingStatus === 'fully_graded').length || 0,
    pending: submissions?.filter((s: any) => 
      s.attempt.gradingStatus === 'pending' || 
      s.attempt.gradingStatus === 'auto_graded' ||
      s.attempt.gradingStatus === 'partially_graded'
    ).length || 0,
    passed: submissions?.filter((s: any) => s.attempt.passed === true).length || 0,
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/quizzes">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {quizLoading ? <Skeleton className="h-8 w-48" /> : quiz?.title || "Quiz Submissions"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                View and grade student submissions
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.graded}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Fully Graded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Needs Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.passed}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>All student submissions for this quiz</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : submissions?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No submissions yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Students haven't submitted this quiz yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions?.map((submission: any) => (
                  <div 
                    key={submission.attempt.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.user?.avatarUrl} />
                        <AvatarFallback>
                          {submission.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {submission.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {submission.user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="text-slate-500 dark:text-slate-400">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {formatDuration(submission.attempt.timeSpentSeconds)}
                      </div>
                      
                      {submission.attempt.score !== null && (
                        <div className={`font-semibold ${
                          submission.attempt.passed 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {submission.attempt.score}/{submission.attempt.totalMarks}
                          {submission.attempt.percentage && ` (${submission.attempt.percentage}%)`}
                        </div>
                      )}
                      
                      {getGradingStatusBadge(submission.attempt.gradingStatus || 'pending')}
                      
                      {submission.attempt.passed !== null && (
                        <Badge className={
                          submission.attempt.passed 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }>
                          {submission.attempt.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      )}
                      
                      {submission.attempt.handwrittenUploadUrl && (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Attachment
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/quiz/${quizId}/grade/${submission.attempt.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          {submission.attempt.gradingStatus === 'fully_graded' ? 'View' : 'Grade'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
