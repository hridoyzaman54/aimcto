import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams, Link, useLocation } from "wouter";
import { 
  ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText, 
  Download, Clock, Award, Save, Send, Image as ImageIcon
} from "lucide-react";

export default function AdminQuizGrading() {
  const { quizId, attemptId } = useParams<{ quizId: string; attemptId: string }>();
  const [, setLocation] = useLocation();
  const [grades, setGrades] = useState<Record<number, { marks: number; feedback: string }>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  
  const { data: attemptData, isLoading, refetch } = trpc.quiz.getAttemptForGrading.useQuery({ 
    attemptId: parseInt(attemptId || '0') 
  });
  
  const gradeAnswerMutation = trpc.quiz.gradeAnswer.useMutation({
    onSuccess: () => {
      toast.success("Answer graded");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to grade answer");
    },
  });
  
  const finalizeGradingMutation = trpc.quiz.finalizeGrading.useMutation({
    onSuccess: (result) => {
      toast.success(`Grading finalized! Score: ${result.totalScore}/${attemptData?.quiz?.totalMarks} (${result.percentage?.toFixed(1)}%)`);
      setLocation(`/admin/quiz/${quizId}/submissions`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to finalize grading");
    },
  });

  // Initialize grades from existing data
  useEffect(() => {
    if (attemptData?.grades) {
      const initialGrades: Record<number, { marks: number; feedback: string }> = {};
      attemptData.grades.forEach((grade: any) => {
        initialGrades[grade.id] = {
          marks: parseFloat(grade.marksAwarded || '0'),
          feedback: grade.feedback || '',
        };
      });
      setGrades(initialGrades);
    }
    if (attemptData?.attempt?.feedback) {
      setOverallFeedback(attemptData.attempt.feedback);
    }
  }, [attemptData]);

  const handleGradeChange = (gradeId: number, field: 'marks' | 'feedback', value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [gradeId]: {
        ...prev[gradeId],
        [field]: value,
      }
    }));
  };

  const saveGrade = async (gradeId: number) => {
    const grade = grades[gradeId];
    if (!grade) return;
    
    await gradeAnswerMutation.mutateAsync({
      gradeId,
      marksAwarded: grade.marks,
      feedback: grade.feedback || undefined,
    });
  };

  const finalizeGrading = async () => {
    // First save all grades
    for (const [gradeId, grade] of Object.entries(grades)) {
      await gradeAnswerMutation.mutateAsync({
        gradeId: parseInt(gradeId),
        marksAwarded: grade.marks,
        feedback: grade.feedback || undefined,
      });
    }
    
    // Then finalize
    await finalizeGradingMutation.mutateAsync({
      attemptId: parseInt(attemptId || '0'),
      feedback: overallFeedback || undefined,
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mcq: 'Multiple Choice',
      true_false: 'True/False',
      short_answer: 'Short Answer',
      long_answer: 'Long Answer',
      fill_blank: 'Fill in the Blank',
    };
    return labels[type] || type;
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!attemptData) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium">Submission not found</h3>
          <Link href={`/admin/quiz/${quizId}/submissions`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
          </Link>
        </div>
      </AdminDashboardLayout>
    );
  }

  const { attempt, quiz, grades: existingGrades, user } = attemptData;
  const questions = quiz?.questions || [];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/admin/quiz/${quizId}/submissions`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Grade Submission
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {quiz?.title}
              </p>
            </div>
          </div>
          <Button 
            onClick={finalizeGrading}
            disabled={finalizeGradingMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {finalizeGradingMutation.isPending ? "Finalizing..." : "Finalize & Submit Grades"}
          </Button>
        </div>

        {/* Student Info */}
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="text-xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {user?.name || 'Unknown Student'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Submitted: {formatDate(attempt.submittedAt)}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time: {attempt.timeSpentSeconds ? `${Math.floor(attempt.timeSpentSeconds / 60)}m ${attempt.timeSpentSeconds % 60}s` : 'N/A'}
                </div>
                {attempt.isAutoSubmitted && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200">
                    Auto-submitted
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Handwritten upload */}
            {attempt.handwrittenUploadUrl && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Handwritten Document Attached
                    </span>
                    {attempt.handwrittenUploadName && (
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        ({attempt.handwrittenUploadName})
                      </span>
                    )}
                  </div>
                  <a 
                    href={attempt.handwrittenUploadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      View/Download
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div className="space-y-4">
          {questions.map((question: any, index: number) => {
            const grade = existingGrades?.find((g: any) => g.questionId === question.id);
            const currentGrade = grade ? grades[grade.id] : null;
            const answersObj = attempt.answers as Record<string, string> || {};
            const studentAnswer = answersObj[question.id.toString()] || 'No answer provided';
            const isAutoGraded = grade?.isAutoGraded;
            
            return (
              <Card key={question.id} className="bg-white dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {getQuestionTypeLabel(question.questionType || 'mcq')}
                        </Badge>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {question.question}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{question.marks || 1} marks</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Show options for MCQ */}
                  {(question.questionType === 'mcq' || question.questionType === 'true_false') && question.options && (
                    <div className="mb-4 space-y-1">
                      {(Array.isArray(question.options) ? question.options : JSON.parse(question.options)).map((option: string, optIndex: number) => (
                        <div 
                          key={optIndex}
                          className={`flex items-center gap-2 text-sm p-2 rounded ${
                            option === studentAnswer && option === question.correctAnswer
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : option === studentAnswer
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : option === question.correctAnswer
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 opacity-60'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {option === studentAnswer && option === question.correctAnswer ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : option === studentAnswer ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : option === question.correctAnswer ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                          {option}
                          {option === studentAnswer && <span className="ml-2 text-xs">(Student's answer)</span>}
                          {option === question.correctAnswer && option !== studentAnswer && <span className="ml-2 text-xs">(Correct)</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show answer for other types */}
                  {question.questionType !== 'mcq' && question.questionType !== 'true_false' && (
                    <div className="mb-4">
                      <Label className="text-sm text-slate-500 dark:text-slate-400">Student's Answer:</Label>
                      <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                          {studentAnswer || <span className="text-slate-400 italic">No answer provided</span>}
                        </p>
                      </div>
                      
                      {question.correctAnswer && (
                        <div className="mt-2">
                          <Label className="text-sm text-emerald-600 dark:text-emerald-400">Expected Answer:</Label>
                          <div className="mt-1 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <p className="text-emerald-700 dark:text-emerald-300">{question.correctAnswer}</p>
                          </div>
                        </div>
                      )}
                      
                      {question.answerGuideline && (
                        <div className="mt-2">
                          <Label className="text-sm text-blue-600 dark:text-blue-400">Grading Guideline:</Label>
                          <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-blue-700 dark:text-blue-300 text-sm">{question.answerGuideline}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Grading Section */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-32">
                      <Label htmlFor={`marks-${grade?.id}`}>Marks</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`marks-${grade?.id}`}
                          type="number"
                          min={0}
                          max={question.marks || 1}
                          step={0.5}
                          value={currentGrade?.marks ?? 0}
                          onChange={(e) => grade && handleGradeChange(grade.id, 'marks', parseFloat(e.target.value) || 0)}
                          className="w-20"
                          disabled={isAutoGraded ?? false}
                        />
                        <span className="text-slate-500">/ {question.marks || 1}</span>
                      </div>
                      {isAutoGraded && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Auto-graded</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`feedback-${grade?.id}`}>Feedback (optional)</Label>
                      <Textarea
                        id={`feedback-${grade?.id}`}
                        value={currentGrade?.feedback || ''}
                        onChange={(e) => grade && handleGradeChange(grade.id, 'feedback', e.target.value)}
                        placeholder="Add feedback for this answer..."
                        rows={2}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => grade && saveGrade(grade.id)}
                        disabled={gradeAnswerMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Overall Feedback */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Overall Feedback</CardTitle>
            <CardDescription>Provide general feedback for the student's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Write overall feedback for this submission..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            onClick={finalizeGrading}
            disabled={finalizeGradingMutation.isPending}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="h-5 w-5 mr-2" />
            {finalizeGradingMutation.isPending ? "Finalizing..." : "Finalize & Submit All Grades"}
          </Button>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
