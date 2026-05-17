import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar, Clock } from "lucide-react";

export default function StudentLiveClasses() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live Classes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join live classes and interactive sessions
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              Upcoming Live Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No upcoming classes</p>
              <p className="text-sm">Check back later for scheduled live sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
