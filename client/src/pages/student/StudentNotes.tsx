import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { StickyNote, BookOpen, Loader2, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "wouter";

export default function StudentNotes() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all notes for the student
  const { data: notes = [], isLoading } = trpc.notes.getAll.useQuery();

  const filteredNotes = notes.filter((note: any) => 
    note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.lessonTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            My Notes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            All your notes from courses and lessons
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Notes List */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-yellow-600" />
              All Notes ({filteredNotes.length})
            </CardTitle>
            <CardDescription>
              Notes you've taken while studying
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No notes yet</p>
                <p className="text-sm">Start taking notes while watching lessons</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note: any) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {note.lessonTitle || "Untitled Lesson"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {note.courseTitle || "Unknown Course"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
                      {note.content}
                    </p>
                    {note.courseId && note.lessonId && (
                      <Link
                        href={`/student/course/${note.courseId}/lesson/${note.lessonId}`}
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        Go to lesson →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
