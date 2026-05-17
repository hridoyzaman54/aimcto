import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function StudentAttendance() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your class attendance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-sm text-slate-500">Classes Attended</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-sm text-slate-500">Classes Missed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">100%</p>
                  <p className="text-sm text-slate-500">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No attendance records yet</p>
              <p className="text-sm">Your attendance will be tracked when you join live classes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
