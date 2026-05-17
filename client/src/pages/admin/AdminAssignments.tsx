import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AdminAssignments() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assignment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage assignments for courses
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Assignments
            </CardTitle>
            <CardDescription>
              Create assignments with due dates and grading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Assignment management coming soon</p>
              <p className="text-sm">This feature is under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
