import { useState } from "react";
import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  FileText, Upload, Clock, CheckCircle, AlertCircle, 
  Calendar, BookOpen, Loader2, X, File, ExternalLink,
  AlertTriangle
} from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  titleBn?: string | null;
  description?: string | null;
  dueDate?: string | Date | null;
  totalMarks?: number | null;
  maxScore?: number | null;
  courseId?: number | null;
  courseName?: string;
  submission?: {
    id: number;
    fileUrl?: string | null;
    content?: string | null;
    submittedAt: string | Date;
    score?: number | null;
    feedback?: string | null;
    gradedAt?: string | Date | null;
  } | null;
}

export default function StudentAssignments() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch assignments for the student
  const { data: assignments = [], isLoading, refetch } = trpc.assignment.getMyAssignments.useQuery();

  // Submit assignment mutation
  const submitMutation = trpc.assignment.submit.useMutation({
    onSuccess: () => {
      setSelectedAssignment(null);
      setSubmissionContent("");
      setSelectedFile(null);
      refetch();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    setIsUploading(true);
    try {
      let fileUrl = "";
      
      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
        
        const data = await response.json();
        fileUrl = data.url;
      }

      // Submit assignment
      await submitMutation.mutateAsync({
        assignmentId: selectedAssignment.id,
        fileUrl: fileUrl || undefined,
        content: submissionContent || undefined,
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const isOverdue = dueDate && now > dueDate;

    if (assignment.submission?.gradedAt) {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" /> Graded
        </Badge>
      );
    }
    if (assignment.submission) {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <CheckCircle className="h-3 w-3 mr-1" /> Submitted
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-3 w-3 mr-1" /> Overdue
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock className="h-3 w-3 mr-1" /> Pending
      </Badge>
    );
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (dueDate: string | Date) => {
    const now = new Date();
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return "Due soon";
  };

  const pendingAssignments = assignments.filter((a: Assignment) => !a.submission);
  const submittedAssignments = assignments.filter((a: Assignment) => a.submission);

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Assignments
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and submit your assignments before the deadline
          </p>
        </div>

        {/* Pending Assignments */}
        <Card className="bg-white dark:bg-slate-800 border-orange-100 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Assignments ({pendingAssignments.length})
            </CardTitle>
            <CardDescription>
              Complete and submit your assignments before the due date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No pending assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssignments.map((assignment: Assignment) => {
                  const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate);
                  return (
                    <div
                      key={assignment.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        isOverdue 
                          ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {assignment.title}
                            </h3>
                            {getStatusBadge(assignment)}
                          </div>
                          {assignment.courseName && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {assignment.courseName}
                            </p>
                          )}
                          {assignment.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {assignment.dueDate && (
                            <>
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end">
                                <Calendar className="h-3 w-3" />
                                {formatDate(assignment.dueDate)}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isOverdue ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                              }`}>
                                {getTimeRemaining(assignment.dueDate)}
                              </p>
                            </>
                          )}
                          {assignment.maxScore && (
                            <p className="text-xs text-slate-400 mt-1">
                              Max: {assignment.maxScore} points
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submitted Assignments */}
        <Card className="bg-white dark:bg-slate-800 border-green-100 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Submitted Assignments ({submittedAssignments.length})
            </CardTitle>
            <CardDescription>
              View your submitted assignments and grades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submittedAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No submissions yet</p>
                <p className="text-sm">Your submitted assignments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedAssignments.map((assignment: Assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {assignment.title}
                          </h3>
                          {getStatusBadge(assignment)}
                        </div>
                        {assignment.courseName && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {assignment.courseName}
                          </p>
                        )}
                        {assignment.submission && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              Submitted: {formatDate(assignment.submission.submittedAt)}
                            </p>
                            {assignment.submission.fileUrl && (
                              <a 
                                href={assignment.submission.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <File className="h-3 w-3" /> View submitted file
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {assignment.submission.content && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                {assignment.submission.content}
                              </p>
                            )}
                            {assignment.submission.gradedAt && (
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Score:
                                  </span>
                                  <span className="text-lg font-bold text-primary">
                                    {assignment.submission.score}/{assignment.maxScore}
                                  </span>
                                </div>
                                {assignment.submission.feedback && (
                                  <div className="mt-2">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Feedback:</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded">
                                      {assignment.submission.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Submit Assignment
              </h3>
              <button onClick={() => setSelectedAssignment(null)}>
                <X className="h-5 w-5 text-slate-500 hover:text-slate-700" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  {selectedAssignment.title}
                </h4>
                {selectedAssignment.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedAssignment.description}
                  </p>
                )}
              </div>

              {/* Deadline Warning */}
              {selectedAssignment.dueDate && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  new Date() > new Date(selectedAssignment.dueDate)
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {new Date() > new Date(selectedAssignment.dueDate) 
                        ? 'This assignment is overdue!' 
                        : 'Due Date'}
                    </p>
                    <p className="text-sm">
                      {formatDate(selectedAssignment.dueDate)} ({getTimeRemaining(selectedAssignment.dueDate)})
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Upload File (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <File className="h-5 w-5 text-primary" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PDF, DOC, DOCX, ZIP (Max 10MB)
                      </p>
                      <Input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Text Submission */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Written Response (Optional)
                </label>
                <Textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Type your answer or additional notes here..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Validation Message */}
              {!selectedFile && !submissionContent.trim() && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                  Please upload a file or write a response before submitting.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => setSelectedAssignment(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading || submitMutation.isPending || (!selectedFile && !submissionContent.trim())}
              >
                {(isUploading || submitMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StudentDashboardLayout>
  );
}
