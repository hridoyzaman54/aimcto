import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function StudentEvents() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Events
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Upcoming events and activities
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No upcoming events</p>
              <p className="text-sm">Check back later for scheduled events</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
