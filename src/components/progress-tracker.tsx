import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, Calendar } from 'lucide-react';

export function ProgressTracker() {
  const weeklyCalories = [
    { day: 'Mon', calories: 1800, target: 2000 },
    { day: 'Tue', calories: 2100, target: 2000 },
    { day: 'Wed', calories: 1950, target: 2000 },
    { day: 'Thu', calories: 1750, target: 2000 },
    { day: 'Fri', calories: 2200, target: 2000 },
    { day: 'Sat', calories: 1900, target: 2000 },
    { day: 'Sun', calories: 1850, target: 2000 }
  ];

  const weeklyExercise = [
    { day: 'Mon', burned: 400, duration: 45 },
    { day: 'Tue', burned: 320, duration: 30 },
    { day: 'Wed', burned: 0, duration: 0 },
    { day: 'Thu', burned: 280, duration: 35 },
    { day: 'Fri', burned: 450, duration: 50 },
    { day: 'Sat', burned: 380, duration: 40 },
    { day: 'Sun', burned: 300, duration: 25 }
  ];

  const weightProgress = [
    { week: 'Week 1', weight: 180 },
    { week: 'Week 2', weight: 179.2 },
    { week: 'Week 3', weight: 178.8 },
    { week: 'Week 4', weight: 178.1 },
    { week: 'Week 5', weight: 177.5 },
    { week: 'Week 6', weight: 176.9 },
    { week: 'Week 7', weight: 176.4 },
    { week: 'Week 8', weight: 175.8 }
  ];

  const macroDistribution = [
    { name: 'Protein', value: 30, color: '#8b5cf6' },
    { name: 'Carbs', value: 45, color: '#06b6d4' },
    { name: 'Fat', value: 25, color: '#f59e0b' }
  ];

  const achievements = [
    { title: '7-Day Streak', description: 'Logged meals for 7 days straight', date: '2 days ago', icon: '🔥' },
    { title: 'Workout Warrior', description: 'Completed 10 workouts this month', date: '1 week ago', icon: '💪' },
    { title: 'Protein Goal', description: 'Hit protein target 5 days in a row', date: '3 days ago', icon: '🥩' },
    { title: 'Step Master', description: 'Reached 10,000 steps daily for a week', date: '1 week ago', icon: '👟' }
  ];

  const stats = {
    currentWeight: 175.8,
    startWeight: 180,
    targetWeight: 170,
    streakDays: 14,
    totalWorkouts: 28,
    avgCalories: 1925
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-purple-600 text-white p-6 rounded-b-3xl">
        <h1 className="mb-2">Progress Tracker</h1>
        <p className="text-purple-100">Monitor your fitness journey</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">Weight Lost</p>
                  <p className="font-bold">{(stats.startWeight - stats.currentWeight).toFixed(1)} lbs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">To Goal</p>
                  <p className="font-bold">{(stats.currentWeight - stats.targetWeight).toFixed(1)} lbs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">Streak</p>
                  <p className="font-bold">{stats.streakDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">Workouts</p>
                  <p className="font-bold">{stats.totalWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="macros">Macros</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyCalories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Bar dataKey="calories" fill="#06b6d4" />
                    <Bar dataKey="target" fill="#e5e7eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercise" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyExercise}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Bar dataKey="burned" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="macros" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Macro Distribution (This Week)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={macroDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {macroDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {macroDistribution.map((macro) => (
                    <div key={macro.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: macro.color }}
                      />
                      <span className="text-sm">{macro.name} ({macro.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {achievement.date}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}