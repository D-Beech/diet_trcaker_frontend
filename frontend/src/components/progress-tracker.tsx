import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getMealsFromLocalStorage, getWorkoutsFromLocalStorage, getBodyweightLogsFromLocalStorage, getProfileFromLocalStorage } from '../services/storage';

export function ProgressTracker() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(getProfileFromLocalStorage());

  useEffect(() => {
    setProfile(getProfileFromLocalStorage());
  }, []);

  // Get last 7 days of data
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }, []);

  // Calculate weekly calories
  const weeklyCalories = useMemo(() => {
    if (!user) return [];

    return last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayMeals = getMealsFromLocalStorage(user.uid, date, nextDay);
      const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.totalNutrition.calories, 0);

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: totalCalories,
        target: profile?.goals.calorieGoal || 2000,
      };
    });
  }, [user, last7Days, profile]);

  // Calculate weekly exercise
  const weeklyExercise = useMemo(() => {
    if (!user) return [];

    return last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayWorkouts = getWorkoutsFromLocalStorage(user.uid, date, nextDay);
      const totalBurned = dayWorkouts.reduce((sum, workout) => sum + workout.totalCaloriesBurned, 0);
      const totalDuration = dayWorkouts.reduce((sum, workout) => sum + workout.totalDuration, 0);

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        burned: totalBurned,
        duration: totalDuration,
      };
    });
  }, [user, last7Days]);

  // Get weight progress (last 30 days)
  const weightProgress = useMemo(() => {
    if (!user) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bodyweightLogs = getBodyweightLogsFromLocalStorage(user.uid);
    const recentLogs = bodyweightLogs
      .filter(log => log.timestamp >= thirtyDaysAgo)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return recentLogs.map(log => ({
      date: log.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: log.weight,
    }));
  }, [user]);

  // Calculate macro distribution for the week
  const macroDistribution = useMemo(() => {
    if (!user) return [];

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weekMeals = getMealsFromLocalStorage(user.uid, weekStart);
    const totalProtein = weekMeals.reduce((sum, meal) => sum + meal.totalNutrition.protein, 0);
    const totalCarbs = weekMeals.reduce((sum, meal) => sum + meal.totalNutrition.carbs, 0);
    const totalFat = weekMeals.reduce((sum, meal) => sum + meal.totalNutrition.fat, 0);

    const total = totalProtein + totalCarbs + totalFat;
    if (total === 0) return [];

    return [
      { name: 'Protein', value: Math.round((totalProtein / total) * 100), color: '#8b5cf6' },
      { name: 'Carbs', value: Math.round((totalCarbs / total) * 100), color: '#06b6d4' },
      { name: 'Fat', value: Math.round((totalFat / total) * 100), color: '#f59e0b' },
    ];
  }, [user]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!user) return { currentWeight: 0, startWeight: 0, targetWeight: 0, totalWorkouts: 0 };

    const allBodyweightLogs = getBodyweightLogsFromLocalStorage(user.uid);
    const currentWeight = allBodyweightLogs.length > 0 ? allBodyweightLogs[0].weight : 0;
    const startWeight = allBodyweightLogs.length > 0 ? allBodyweightLogs[allBodyweightLogs.length - 1].weight : 0;

    const allWorkouts = getWorkoutsFromLocalStorage(user.uid);

    return {
      currentWeight,
      startWeight,
      targetWeight: profile?.targetWeight || 0,
      totalWorkouts: allWorkouts.length,
    };
  }, [user, profile]);

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
          {stats.currentWeight > 0 && stats.startWeight > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight Change</p>
                    <p className="font-bold">
                      {(stats.startWeight - stats.currentWeight).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.currentWeight > 0 && stats.targetWeight > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">To Goal</p>
                    <p className="font-bold">
                      {Math.abs(stats.currentWeight - stats.targetWeight).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                <CardTitle>Weight Progress (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {weightProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No weight data yet. Log your weight in the Profile tab!
                  </p>
                )}
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
      </div>
    </div>
  );
}