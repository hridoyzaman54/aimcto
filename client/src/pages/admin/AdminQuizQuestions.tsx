import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useParams, Link } from "wouter";
import { 
  Plus, ArrowLeft, Edit, Trash2, GripVertical, CheckCircle, 
  XCircle, HelpCircle, FileText, Image, AlertCircle
} from "lucide-react";

type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'long_answer' | 'fill_blank';

interface QuestionFormData {
  question: string;
  questionBn: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  answerGuideline: string;
  marks: number;
  negativeMarks: string;
  explanation: string;
  imageUrl: string;
  isRequired: boolean;
}

export default function AdminQuizQuestions() {
  const { quizId } = useParams<{ quizId: string }>();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  const { data: quiz, isLoading: quizLoading } = trpc.quiz.getById.useQuery({ id: parseInt(quizId || '0') });
  const { data: questions, isLoading, refetch } = trpc.quiz.getQuestions.useQuery({ quizId: parseInt(quizId || '0') });
  
  const addMutation = trpc.quiz.addQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question added successfully");
      setIsAddOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add question");
    },
  });
  
  const updateMutation = trpc.quiz.updateQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question updated successfully");
      setEditingQuestion(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update question");
    },
  });
  
  const deleteMutation = trpc.quiz.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete question");
    },
  });

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

  const getQuestionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mcq: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      true_false: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      short_answer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      long_answer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      fill_blank: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const totalMarks = questions?.reduce((sum: number, q: any) => sum + (q.marks || 1), 0) || 0;

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
                {quizLoading ? <Skeleton className="h-8 w-48" /> : quiz?.title || "Quiz Questions"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {questions?.length || 0} questions • {totalMarks} total marks
              </p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <QuestionForm 
                quizId={parseInt(quizId || '0')}
                orderIndex={(questions?.length || 0) + 1}
                onSubmit={(data) => addMutation.mutate(data)}
                isLoading={addMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : questions?.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No questions yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Add questions to this quiz to get started</p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            questions?.map((question: any, index: number) => (
              <Card key={question.id} className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getQuestionTypeColor(question.questionType || 'mcq')}>
                          {getQuestionTypeLabel(question.questionType || 'mcq')}
                        </Badge>
                        <Badge variant="outline">{question.marks || 1} marks</Badge>
                        {question.isRequired && (
                          <Badge variant="outline" className="text-red-600 border-red-200">Required</Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-900 dark:text-white font-medium mb-2">
                        {question.question}
                      </p>
                      
                      {question.questionBn && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                          {question.questionBn}
                        </p>
                      )}
                      
                      {/* Show options for MCQ */}
                      {(question.questionType === 'mcq' || question.questionType === 'true_false') && question.options && (
                        <div className="mt-3 space-y-1">
                          {(Array.isArray(question.options) ? question.options : JSON.parse(question.options)).map((option: string, optIndex: number) => (
                            <div 
                              key={optIndex}
                              className={`flex items-center gap-2 text-sm p-2 rounded ${
                                option === question.correctAnswer 
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {option === question.correctAnswer ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-slate-300" />
                              )}
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show correct answer for other types */}
                      {question.questionType !== 'mcq' && question.questionType !== 'true_false' && question.correctAnswer && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Expected Answer:</p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">{question.correctAnswer}</p>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Explanation:</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this question?")) {
                            deleteMutation.mutate({ id: question.id });
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingQuestion && (
              <QuestionForm 
                quizId={parseInt(quizId || '0')}
                question={editingQuestion}
                orderIndex={editingQuestion.orderIndex}
                onSubmit={(data) => updateMutation.mutate({ id: editingQuestion.id, ...data })}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}

function QuestionForm({ quizId, question, orderIndex, onSubmit, isLoading }: {
  quizId: number;
  question?: any;
  orderIndex: number;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<QuestionFormData>({
    question: question?.question || "",
    questionBn: question?.questionBn || "",
    questionType: question?.questionType || "mcq",
    options: question?.options 
      ? (Array.isArray(question.options) ? question.options : JSON.parse(question.options))
      : ["", "", "", ""],
    correctAnswer: question?.correctAnswer || "",
    answerGuideline: question?.answerGuideline || "",
    marks: question?.marks || 1,
    negativeMarks: question?.negativeMarks || "0",
    explanation: question?.explanation || "",
    imageUrl: question?.imageUrl || "",
    isRequired: question?.isRequired ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      quizId,
      question: formData.question,
      questionBn: formData.questionBn || undefined,
      questionType: formData.questionType,
      correctAnswer: formData.correctAnswer || undefined,
      answerGuideline: formData.answerGuideline || undefined,
      marks: formData.marks,
      negativeMarks: formData.negativeMarks || undefined,
      explanation: formData.explanation || undefined,
      imageUrl: formData.imageUrl || undefined,
      orderIndex,
      isRequired: formData.isRequired,
    };
    
    // Add options for MCQ and true/false
    if (formData.questionType === 'mcq') {
      data.options = formData.options.filter(o => o.trim() !== '');
    } else if (formData.questionType === 'true_false') {
      data.options = ['True', 'False'];
    }
    
    onSubmit(data);
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{question ? "Edit Question" : "Add New Question"}</DialogTitle>
        <DialogDescription>
          {question ? "Update the question details" : "Create a new question for this quiz"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Question Type */}
        <div>
          <Label htmlFor="questionType">Question Type</Label>
          <Select
            value={formData.questionType}
            onValueChange={(value: QuestionType) => setFormData({ ...formData, questionType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
              <SelectItem value="long_answer">Long Answer (Essay)</SelectItem>
              <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Text */}
        <div>
          <Label htmlFor="question">Question *</Label>
          <Textarea
            id="question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter your question"
            rows={3}
            required
          />
        </div>

        {/* Question in Bengali */}
        <div>
          <Label htmlFor="questionBn">Question (Bengali)</Label>
          <Textarea
            id="questionBn"
            value={formData.questionBn}
            onChange={(e) => setFormData({ ...formData, questionBn: e.target.value })}
            placeholder="বাংলায় প্রশ্ন লিখুন"
            rows={2}
          />
        </div>

        {/* Options for MCQ */}
        {formData.questionType === 'mcq' && (
          <div>
            <Label>Answer Options</Label>
            <div className="space-y-2 mt-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={option === formData.correctAnswer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}
                  />
                  <Button
                    type="button"
                    variant={option === formData.correctAnswer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, correctAnswer: option })}
                    className={option === formData.correctAnswer ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Click the checkmark to set the correct answer</p>
          </div>
        )}

        {/* True/False correct answer */}
        {formData.questionType === 'true_false' && (
          <div>
            <Label>Correct Answer</Label>
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant={formData.correctAnswer === 'True' ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, correctAnswer: 'True' })}
                className={formData.correctAnswer === 'True' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                True
              </Button>
              <Button
                type="button"
                variant={formData.correctAnswer === 'False' ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, correctAnswer: 'False' })}
                className={formData.correctAnswer === 'False' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <XCircle className="h-4 w-4 mr-2" />
                False
              </Button>
            </div>
          </div>
        )}

        {/* Expected answer for other types */}
        {(formData.questionType === 'short_answer' || formData.questionType === 'fill_blank') && (
          <div>
            <Label htmlFor="correctAnswer">Expected Answer (for auto-grading)</Label>
            <Input
              id="correctAnswer"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              placeholder="Enter the expected answer"
            />
            <p className="text-xs text-slate-500 mt-1">Leave empty for manual grading only</p>
          </div>
        )}

        {/* Answer guideline for long answers */}
        {formData.questionType === 'long_answer' && (
          <div>
            <Label htmlFor="answerGuideline">Answer Guideline (for manual grading)</Label>
            <Textarea
              id="answerGuideline"
              value={formData.answerGuideline}
              onChange={(e) => setFormData({ ...formData, answerGuideline: e.target.value })}
              placeholder="Key points to look for when grading this answer"
              rows={3}
            />
          </div>
        )}

        {/* Marks and settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="marks">Marks</Label>
            <Input
              id="marks"
              type="number"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </div>
          <div>
            <Label htmlFor="negativeMarks">Negative Marks (optional)</Label>
            <Input
              id="negativeMarks"
              type="text"
              value={formData.negativeMarks}
              onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <Label htmlFor="explanation">Explanation (shown after quiz)</Label>
          <Textarea
            id="explanation"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            placeholder="Explain why this is the correct answer"
            rows={2}
          />
        </div>

        {/* Image URL */}
        <div>
          <Label htmlFor="imageUrl">Image URL (optional)</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Required toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
          <div>
            <Label className="text-base">Required Question</Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">Students must answer this question</p>
          </div>
          <Switch
            checked={formData.isRequired}
            onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
          />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : question ? "Update Question" : "Add Question"}
        </Button>
      </DialogFooter>
    </form>
  );
}
