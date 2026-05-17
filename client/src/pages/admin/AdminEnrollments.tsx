import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function AdminEnrollments() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enrollment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage student enrollments and course access
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Enrollments
            </CardTitle>
            <CardDescription>
              View and manage all course enrollments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Enrollment management coming soon</p>
              <p className="text-sm">This feature is under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
