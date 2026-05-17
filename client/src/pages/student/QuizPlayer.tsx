import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Clock, AlertTriangle, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, Upload, FileText, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Question {
  id: number;
  question: string;
  questionBn?: string;
  questionType: string;
  options: string[] | null;
  marks: number;
}

interface QuizResult {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  answers: Record<number, string>;
  correctAnswers: Record<number, string>;
}

export default function QuizPlayer() {
  const { quizId } = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [handwrittenFile, setHandwrittenFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [handwrittenUploadUrl, setHandwrittenUploadUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: quiz, isLoading: quizLoading } = trpc.quiz.getById.useQuery(
    { id: parseInt(quizId || "0") },
    { enabled: !!quizId }
  );
  
  const { data: questions, isLoading: questionsLoading } = trpc.quiz.getQuestions.useQuery(
    { quizId: parseInt(quizId || "0") },
    { enabled: !!quizId && quizStarted }
  );
  
  const startAttemptMutation = trpc.quiz.startAttempt.useMutation({
    onSuccess: (data) => {
      setAttemptId(data.attemptId ?? null);
      setQuizStarted(true);
      if (quiz?.durationMinutes) {
        setTimeRemaining(quiz.durationMinutes * 60);
      }
      toast.success("Quiz started! Good luck!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start quiz");
    }
  });
  
  const submitAttemptMutation = trpc.quiz.submitAttempt.useMutation({
    onSuccess: () => {
      setQuizSubmitted(true);
      toast.success("Quiz submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit quiz");
    }
  });

  // Timer countdown
  useEffect(() => {
    if (quizStarted && timeRemaining !== null && timeRemaining > 0 && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) return 0;
          
          // Show warning at 5 minutes
          if (prev === 300) {
            setShowTimeWarning(true);
            toast.warning("5 minutes remaining!", { duration: 5000 });
          }
          
          // Show warning at 1 minute
          if (prev === 60) {
            toast.error("1 minute remaining!", { duration: 5000 });
          }
          
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [quizStarted, quizSubmitted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && quizStarted && !quizSubmitted) {
      handleSubmitQuiz(true);
    }
  }, [timeRemaining, quizStarted, quizSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    if (!quizId) return;
    startAttemptMutation.mutate({ quizId: parseInt(quizId) });
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const calculateScore = useCallback(() => {
    if (!questions) return { score: 0, totalMarks: 0, correctAnswers: {} as Record<number, string> };
    
    let score = 0;
    let totalMarks = 0;
    const correctAnswers: Record<number, string> = {};
    
    questions.forEach((q: any) => {
      totalMarks += q.marks || 1;
      correctAnswers[q.id] = q.correctAnswer || '';
      
      if (answers[q.id] && answers[q.id].toLowerCase() === q.correctAnswer?.toLowerCase()) {
        score += q.marks || 1;
      }
    });
    
    return { score, totalMarks, correctAnswers };
  }, [questions, answers]);

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!attemptId || !questions) return;
    
    const { score, totalMarks, correctAnswers } = calculateScore();
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= (quiz?.passingScore || 50);
    
    // Convert answers to string record format
    const answersRecord: Record<string, string> = {};
    Object.entries(answers).forEach(([key, value]) => {
      answersRecord[key.toString()] = value;
    });
    
    await submitAttemptMutation.mutateAsync({
      attemptId,
      answers: answersRecord,
      handwrittenUploadUrl: handwrittenUploadUrl || undefined,
      handwrittenUploadName: handwrittenFile?.name || undefined,
      isAutoSubmitted: autoSubmit,
    });
    
    setQuizResult({
      score,
      totalMarks,
      percentage,
      passed,
      answers,
      correctAnswers
    });
    
    if (autoSubmit) {
      toast.info("Time's up! Your quiz has been auto-submitted.");
    }
    
    setShowSubmitDialog(false);
  };

  const currentQuestion = questions?.[currentQuestionIndex] as Question | undefined;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions?.length || 0;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setHandwrittenFile(file);
    setUploadingFile(true);
    
    try {
      // Create form data and upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setHandwrittenUploadUrl(data.url);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file. Please try again.');
      setHandwrittenFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeUploadedFile = () => {
    setHandwrittenFile(null);
    setHandwrittenUploadUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (quizLoading) {
    return (
      <StudentDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </StudentDashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <StudentDashboardLayout>
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <p className="text-lg font-medium">Quiz not found</p>
            <Button 
              className="mt-4"
              onClick={() => setLocation("/student/quizzes")}
            >
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </StudentDashboardLayout>
    );
  }

  // Quiz Result Screen
  if (quizSubmitted && quizResult) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                quizResult.passed 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {quizResult.passed ? (
                  <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {quizResult.passed ? "Congratulations!" : "Keep Trying!"}
              </CardTitle>
              <CardDescription>
                {quizResult.passed 
                  ? "You have passed the quiz!" 
                  : `You need ${quiz.passingScore || 50}% to pass`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                  {quizResult.percentage}%
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  {quizResult.score} / {quizResult.totalMarks} marks
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{answeredCount}</p>
                  <p className="text-sm text-slate-500">Answered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{totalQuestions - answeredCount}</p>
                  <p className="text-sm text-slate-500">Skipped</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation("/student/quizzes")}
                >
                  Back to Quizzes
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizStarted(false);
                    setQuizResult(null);
                    setAnswers({});
                    setFlaggedQuestions(new Set());
                    setCurrentQuestionIndex(0);
                    setAttemptId(null);
                  }}
                >
                  Retry Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentDashboardLayout>
    );
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {quiz.durationMinutes || 30} minutes
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Passing Score</p>
                  <p className="text-lg font-semibold">{quiz.passingScore || 50}%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Marks</p>
                  <p className="text-lg font-semibold">{quiz.totalMarks || 100}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
                  <p className="text-lg font-semibold">{quiz.shuffleQuestions ? "Shuffled" : "In Order"}</p>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Important Instructions</p>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                      <li>• Once started, the timer cannot be paused</li>
                      <li>• Quiz will auto-submit when time runs out</li>
                      <li>• Make sure you have a stable internet connection</li>
                      <li>• You can flag questions to review later</li>
                      {quiz.allowHandwrittenUpload && (
                        <li>• You can attach a scanned handwritten document</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                onClick={handleStartQuiz}
                disabled={startAttemptMutation.isPending}
              >
                {startAttemptMutation.isPending ? "Starting..." : "Start Quiz"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudentDashboardLayout>
    );
  }

  // Quiz Taking Screen
  return (
    <StudentDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Timer and Progress Header */}
        <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Question {currentQuestionIndex + 1} / {totalQuestions}
                </Badge>
                <div className="hidden sm:block">
                  <Progress value={progressPercent} className="w-32 h-2" />
                  <p className="text-xs text-slate-500 mt-1">{answeredCount} answered</p>
                </div>
              </div>
              
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeRemaining <= 60 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse' 
                    : timeRemaining <= 300 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  <Clock className="h-5 w-5" />
                  <span className="text-xl font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        {questionsLoading ? (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="py-8">
              <Skeleton className="h-8 w-3/4 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : currentQuestion ? (
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
                <Button
                  variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? "bg-amber-500 hover:bg-amber-600" : ""}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentQuestion.questionType === 'mcq' && currentQuestion.options ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {(currentQuestion.options as string[]).map((option, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                      onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : currentQuestion.questionType === 'true_false' ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {['True', 'False'].map((option) => (
                    <div 
                      key={option}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                      onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${option}`} />
                      <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : currentQuestion.questionType === 'long_answer' ? (
                <Textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Write your detailed answer here..."
                  rows={8}
                  className="w-full p-4 border rounded-lg dark:bg-slate-700 dark:border-slate-600 resize-y"
                />
              ) : currentQuestion.questionType === 'fill_blank' ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the blank:</p>
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full p-4 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                />
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Navigation */}
        <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2 overflow-x-auto py-2 px-1">
                {questions?.map((q: any, index: number) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                      currentQuestionIndex === index
                        ? 'bg-blue-600 text-white'
                        : answers[q.id]
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : flaggedQuestions.has(q.id)
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Handwritten Upload Section */}
        {quiz.allowHandwrittenUpload && (
          <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Attach Handwritten Document
              </CardTitle>
              <CardDescription>
                Upload a scanned copy of your handwritten answers (PDF or Image, max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {handwrittenFile ? (
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">{handwrittenFile.name}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {(handwrittenFile.size / 1024 / 1024).toFixed(2)} MB
                        {uploadingFile && ' - Uploading...'}
                        {handwrittenUploadUrl && ' - Uploaded ✓'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeUploadedFile} disabled={uploadingFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} out of {totalQuestions} questions.
                {totalQuestions - answeredCount > 0 && (
                  <span className="block mt-2 text-amber-600">
                    {totalQuestions - answeredCount} question(s) are unanswered.
                  </span>
                )}
                {flaggedQuestions.size > 0 && (
                  <span className="block mt-2 text-amber-600">
                    {flaggedQuestions.size} question(s) are flagged for review.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Review Answers</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleSubmitQuiz()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Submit Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StudentDashboardLayout>
  );
}
