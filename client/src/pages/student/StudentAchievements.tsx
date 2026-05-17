import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Star, Award, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentAchievements() {
  const { data: achievements, isLoading } = trpc.achievement.getStudentAchievements.useQuery();
  const { data: allAchievements } = trpc.achievement.getAll.useQuery();

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Achievements
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Celebrate your learning milestones
          </p>
        </div>

        {/* Earned Achievements */}
        <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Earned Achievements
            </CardTitle>
            <CardDescription>
              Badges and achievements you've earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ))}
              </div>
            ) : achievements && achievements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {achievements.map((achievement: any) => (
                  <div 
                    key={achievement.id} 
                    className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center"
                  >
                    <div className="h-16 w-16 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {achievement.points} points
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Earned {new Date(achievement.awardedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No achievements earned yet</p>
                <p className="text-sm">Complete courses and quizzes to earn achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Achievements */}
        <Card className="bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-slate-400" />
              Available Achievements
            </CardTitle>
            <CardDescription>
              Achievements you can earn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allAchievements && allAchievements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-4">
                {allAchievements.map((achievement) => {
                  const isEarned = achievements?.some((a: any) => a.achievementId === achievement.id);
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-4 border rounded-xl text-center transition-all ${
                        isEarned 
                          ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' 
                          : 'border-slate-200 dark:border-slate-700 opacity-60 grayscale'
                      }`}
                    >
                      <div className={`h-12 w-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        isEarned 
                          ? 'bg-amber-100 dark:bg-amber-900/40' 
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {isEarned ? (
                          <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Medal className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm text-slate-900 dark:text-white">
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {achievement.points} points
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No achievements defined yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
