import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, Star } from "lucide-react";

export default function StudentGames() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Educational Games
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Learn while having fun with interactive games
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-purple-500" />
              Available Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Coming Soon!</p>
              <p className="text-sm">Educational games are being developed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
