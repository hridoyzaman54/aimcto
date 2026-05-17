import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  ChevronLeft, ChevronRight, FileText, Video, Image as ImageIcon,
  Download, CheckCircle, Circle, X,
  BookOpen, Clock, User, Loader2, StickyNote, Check
} from "lucide-react";
import StudentDashboardLayout from "@/components/StudentDashboardLayout";

export default function CoursePlayer() {
  const params = useParams();
  
  const courseId = parseInt(params.courseId || "0");
  const lessonId = params.lessonId ? parseInt(params.lessonId) : null;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'video' | 'pdf'>('video');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch course data
  const { data: course, isLoading: courseLoading } = trpc.course.getById.useQuery(
    { id: courseId },
    { enabled: courseId > 0 }
  );

  // Fetch lessons for this course
  const { data: lessons = [], isLoading: lessonsLoading, refetch: refetchLessons } = trpc.lesson.getByCourse.useQuery(
    { courseId },
    { enabled: courseId > 0 }
  );

  // Fetch enrollment for this course
  const { data: enrollmentData } = trpc.enrollment.checkAccess.useQuery(
    { courseId },
    { enabled: courseId > 0 }
  );
  const enrollment = enrollmentData?.enrollment;

  // Get current lesson
  const currentLesson = lessonId 
    ? lessons.find((l: any) => l.id === lessonId) 
    : lessons[0];

  // Fetch materials for current lesson
  const { data: materials = [] } = trpc.lesson.getMaterials.useQuery(
    { lessonId: currentLesson?.id || 0 },
    { enabled: !!currentLesson?.id }
  );

  // Fetch existing notes
  const { data: existingNotes = [], refetch: refetchNotes } = trpc.notes.getByLesson.useQuery(
    { lessonId: currentLesson?.id || 0 },
    { enabled: !!currentLesson?.id }
  );

  // Fetch lesson progress
  const { data: lessonProgress, refetch: refetchProgress } = trpc.progress.getByEnrollment.useQuery(
    { enrollmentId: enrollment?.id || 0 },
    { enabled: !!enrollment?.id }
  );

  // Save note mutation
  const saveNoteMutation = trpc.notes.save.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      refetchNotes();
    }
  });

  // Mark lesson complete mutation
  const markCompleteMutation = trpc.progress.markComplete.useMutation({
    onSuccess: () => {
      // Progress saved
      refetchProgress();
      refetchLessons();
    },
    onError: (error) => {
      console.error("Failed to mark lesson as complete:", error);
    }
  });

  // Update progress mutation
  const updateProgressMutation = trpc.progress.update.useMutation();

  // Initialize completed lessons from progress data
  useEffect(() => {
    if (lessonProgress) {
      const completed = new Set<number>();
      lessonProgress.forEach((p: any) => {
        if (p.completed) {
          completed.add(p.lessonId);
        }
      });
      setCompletedLessons(completed);
    }
  }, [lessonProgress]);

  // Auto-save notes
  const autoSaveNote = useCallback(() => {
    if (noteContent.trim() && currentLesson?.id) {
      setIsSavingNote(true);
      saveNoteMutation.mutate(
        { lessonId: currentLesson.id, content: noteContent },
        { onSettled: () => setIsSavingNote(false) }
      );
    }
  }, [noteContent, currentLesson?.id, saveNoteMutation]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (noteContent.trim()) {
      autoSaveTimeoutRef.current = setTimeout(autoSaveNote, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [noteContent, autoSaveNote]);

  // Load existing note when lesson changes
  useEffect(() => {
    if (existingNotes.length > 0) {
      setNoteContent((existingNotes[0] as any).content || "");
    } else {
      setNoteContent("");
    }
  }, [existingNotes]);

  // Track video progress
  useEffect(() => {
    if (enrollment?.id && currentLesson?.id && currentTime > 0 && duration > 0) {
      const progressPercent = Math.round((currentTime / duration) * 100);
      // Update progress every 10 seconds
      if (Math.floor(currentTime) % 10 === 0) {
        updateProgressMutation.mutate({
          enrollmentId: enrollment.id,
          lessonId: currentLesson.id,
          progressPercent,
          watchedDuration: Math.floor(currentTime),
          lastPosition: Math.floor(currentTime),
        });
      }
    }
  }, [currentTime, duration, enrollment?.id, currentLesson?.id]);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!isFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMarkComplete = () => {
    if (enrollment?.id && currentLesson?.id) {
      markCompleteMutation.mutate({
        enrollmentId: enrollment.id,
        lessonId: currentLesson.id,
      });
    }
  };

  const isLessonCompleted = currentLesson?.id ? completedLessons.has(currentLesson.id) : false;

  // Get PDF material if available
  const pdfMaterial = materials.find((m: any) => m.type === 'pdf');

  // Get current and next/prev lesson indices
  const currentIndex = lessons.findIndex((l: any) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Calculate overall course progress
  const completedCount = completedLessons.size;
  const totalLessons = lessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (courseLoading || lessonsLoading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentDashboardLayout>
    );
  }

  if (!course) {
    return (
      <StudentDashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">Course not found</h2>
          <Link href="/student/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <div className="mb-6">
          <Link href="/student/courses" className="text-sm text-stone-500 hover:text-primary flex items-center gap-1 mb-2">
            <ChevronLeft className="h-4 w-4" /> Back to Courses
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{course.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Instructor
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.durationMonths} months
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {lessons.length} lessons
            </span>
          </div>
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-stone-600 dark:text-stone-400">Course Progress</span>
              <span className="font-medium text-primary">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-stone-500 mt-1">{completedCount} of {totalLessons} lessons completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* View Mode Toggle */}
            {pdfMaterial && currentLesson?.videoUrl && (
              <div className="flex gap-2 mb-2">
                <Button
                  variant={viewMode === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('video')}
                >
                  <Video className="h-4 w-4 mr-2" /> Video
                </Button>
                <Button
                  variant={viewMode === 'pdf' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" /> PDF
                </Button>
              </div>
            )}

            {/* Video Player */}
            {(viewMode === 'video' || !pdfMaterial) && (
              <div 
                ref={playerContainerRef}
                className="bg-black rounded-xl overflow-hidden relative aspect-video"
              >
                {currentLesson?.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={currentLesson.videoUrl}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      onClick={togglePlay}
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      {/* Progress Bar */}
                      <div 
                        className="h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
                        onClick={handleSeek}
                      >
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <button onClick={togglePlay} className="hover:text-primary transition-colors">
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </button>
                          <button onClick={toggleMute} className="hover:text-primary transition-colors">
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </button>
                          <span className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        <button onClick={toggleFullscreen} className="hover:text-primary transition-colors">
                          <Maximize className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    <div className="text-center">
                      <Video className="h-16 w-16 mx-auto mb-2" />
                      <p>No video available for this lesson</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PDF Viewer */}
            {viewMode === 'pdf' && pdfMaterial && (
              <div className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="p-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    {pdfMaterial.title}
                  </span>
                  <a href={pdfMaterial.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </a>
                </div>
                <iframe
                  src={pdfMaterial.fileUrl}
                  className="w-full h-[70vh]"
                  title={pdfMaterial.title}
                />
              </div>
            )}

            {/* Lesson Navigation & Mark Complete */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Link href={`/student/course/${courseId}/lesson/${(prevLesson as any).id}`}>
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                </Link>
              ) : <div />}
              
              {/* Mark Complete Button */}
              <Button
                onClick={handleMarkComplete}
                disabled={isLessonCompleted || markCompleteMutation.isPending}
                variant={isLessonCompleted ? "secondary" : "default"}
                size="sm"
              >
                {markCompleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isLessonCompleted ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isLessonCompleted ? 'Completed' : 'Mark as Complete'}
              </Button>
              
              {nextLesson ? (
                <Link href={`/student/course/${courseId}/lesson/${(nextLesson as any).id}`}>
                  <Button size="sm">
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              ) : <div />}
            </div>

            {/* Current Lesson Info */}
            {currentLesson && (
              <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                      {currentLesson.title}
                    </h2>
                    {currentLesson.description && (
                      <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                  {isLessonCompleted && (
                    <span className="flex items-center gap-1 text-green-500 text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Study Materials */}
            {materials.length > 0 && (
              <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Study Materials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.map((material: any) => (
                    <div 
                      key={material.id}
                      className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-900 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      {material.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                      {material.type === 'doc' && <FileText className="h-5 w-5 text-blue-500" />}
                      {material.type === 'image' && <ImageIcon className="h-5 w-5 text-green-500" />}
                      {material.type === 'video' && <Video className="h-5 w-5 text-purple-500" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                          {material.title}
                        </p>
                        <p className="text-xs text-stone-500 capitalize">{material.type}</p>
                      </div>
                      <a 
                        href={material.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4 text-stone-400 hover:text-primary" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note Taking Section */}
            {!isFullscreen && showNotes && (
              <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <StickyNote className="h-5 w-5" /> My Notes
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    {isSavingNote && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                      </span>
                    )}
                    {lastSaved && !isSavingNote && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" /> 
                        Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Take notes while watching... (auto-saves every 2 seconds)"
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-stone-400 mt-2">
                  Notes are automatically saved and can be accessed from the Notes section in Study Materials.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Lesson List */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-100">Course Content</h3>
                <p className="text-sm text-stone-500">{completedCount}/{lessons.length} lessons completed</p>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {lessons.map((lesson: any, index: number) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <Link 
                      key={lesson.id}
                      href={`/student/course/${courseId}/lesson/${lesson.id}`}
                    >
                      <div className={`p-4 border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors ${
                        lesson.id === currentLesson?.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${lesson.id === currentLesson?.id ? 'text-primary' : 'text-stone-400'}`}>
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              lesson.id === currentLesson?.id 
                                ? 'text-primary' 
                                : 'text-stone-800 dark:text-stone-200'
                            }`}>
                              {index + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                              <Video className="h-3 w-3" />
                              <span>{lesson.duration || 0} min</span>
                              {isCompleted && (
                                <span className="text-green-500 ml-auto">✓ Done</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Toggle Notes Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowNotes(!showNotes)}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </Button>
          </div>
        </div>

        {/* Material Preview Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-100">
                  {selectedMaterial.title}
                </h3>
                <button onClick={() => setSelectedMaterial(null)}>
                  <X className="h-5 w-5 text-stone-500 hover:text-stone-700" />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {selectedMaterial.type === 'image' && (
                  <img 
                    src={selectedMaterial.fileUrl} 
                    alt={selectedMaterial.title}
                    className="max-w-full mx-auto rounded-lg"
                  />
                )}
                {selectedMaterial.type === 'pdf' && (
                  <iframe
                    src={selectedMaterial.fileUrl}
                    className="w-full h-[70vh] rounded-lg"
                    title={selectedMaterial.title}
                  />
                )}
                {(selectedMaterial.type === 'doc' || selectedMaterial.type === 'video') && (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                    <p className="text-stone-600 dark:text-stone-400 mb-4">
                      Preview not available for this file type
                    </p>
                    <a href={selectedMaterial.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button>
                        <Download className="h-4 w-4 mr-2" /> Download File
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
