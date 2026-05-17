import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle } from "lucide-react";

export default function StudentNotifications() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Stay updated with important announcements
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              All Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No new notifications</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
