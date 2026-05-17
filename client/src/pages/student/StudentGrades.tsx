import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Trophy, Target } from "lucide-react";

export default function StudentGrades() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Grades
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View your grades and academic performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                  <p className="text-sm text-slate-500">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                  <p className="text-sm text-slate-500">Highest Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-sm text-slate-500">Graded Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Grade History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No grades yet</p>
              <p className="text-sm">Complete quizzes and assignments to see your grades</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
