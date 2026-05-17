import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Sparkles, Play, Clock, Star, Trophy, Gift, Zap, Crown, Heart, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function StudentAIMVerse() {
  const { data: episodes, isLoading } = trpc.aimverse.getEpisodes.useQuery({ releasedOnly: true });

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        {/* Premium Hero Section - No Gradients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 md:w-32 md:h-32 border border-white/10 rounded-full"
            />
          </div>
          <div className="absolute bottom-6 right-20 md:bottom-10 md:right-40">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 md:w-16 md:h-16 border border-white/10 rounded-full"
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  AIMVerse
                </h1>
                <p className="text-white/60 text-sm">Learning Reimagined</p>
              </div>
            </div>
            <p className="text-white/80 max-w-xl text-lg leading-relaxed">
              Where education meets entertainment. Watch captivating episodes, 
              collect exclusive cards, and unlock rewards while mastering new skills.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Start Watching
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Trophy className="h-5 w-5 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Play, label: "Episodes", value: episodes?.length || 0, color: "text-blue-600" },
            { icon: Star, label: "Cards Collected", value: 0, color: "text-amber-600" },
            { icon: Trophy, label: "Achievements", value: 0, color: "text-emerald-600" },
            { icon: Zap, label: "Points", value: 0, color: "text-purple-600" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-700 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Episodes Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Episodes</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Watch and learn from our educational content</p>
            </div>
            <Button variant="ghost" className="text-slate-600 dark:text-slate-400">
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode, index) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-xl">
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                      {episode.thumbnailUrl ? (
                        <img 
                          src={episode.thumbnailUrl} 
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                          <span className="text-sm text-slate-400 dark:text-slate-500">Preview</span>
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1 }}
                          className="h-16 w-16 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl"
                        >
                          <Play className="h-7 w-7 text-slate-900 ml-1" />
                        </motion.div>
                      </div>

                      {/* Episode badge */}
                      {episode.seasonNumber && episode.episodeNumber && (
                        <Badge className="absolute top-3 left-3 bg-slate-900/80 text-white border-0 font-medium">
                          S{episode.seasonNumber} E{episode.episodeNumber}
                        </Badge>
                      )}

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Heart className="h-4 w-4 text-slate-600" />
                        </button>
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Bookmark className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-lg">
                        {episode.title}
                      </h3>
                      {episode.titleBn && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                          {episode.titleBn}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          {episode.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {Math.floor(episode.duration / 60)} min
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:border-emerald-800">
                          <Star className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Coming Soon!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Exciting episodes are being prepared just for you. Stay tuned!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Collectible Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">Collectible Cards</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Build your ultimate collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Unlock exclusive character cards, power cards, and rare collectibles by watching episodes and completing challenges.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="w-10 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600" />
                  <div className="w-10 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600" />
                  <div className="w-10 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600" />
                  <div className="w-10 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                    +12
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Win Prizes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">Win Prizes</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Compete and earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Participate in weekly competitions, climb the leaderboard, and win amazing prizes including merchandise and exclusive content.
                </p>
                <Button variant="outline" className="mt-4 w-full border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  View Prizes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">Achievements</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Earn badges and achievements as you progress through your learning journey. Show off your accomplishments!
                </p>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
