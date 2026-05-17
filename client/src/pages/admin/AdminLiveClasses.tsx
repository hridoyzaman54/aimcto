import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

export default function AdminLiveClasses() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live Class Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Schedule and manage live classes
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Live Classes
            </CardTitle>
            <CardDescription>
              Schedule live sessions with Zoom/Google Meet integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Live class management coming soon</p>
              <p className="text-sm">This feature is under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
