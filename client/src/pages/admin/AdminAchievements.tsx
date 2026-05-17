import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function AdminAchievements() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Achievement Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage student achievements and badges
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>
              Define achievements that students can earn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Achievement management coming soon</p>
              <p className="text-sm">This feature is under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
