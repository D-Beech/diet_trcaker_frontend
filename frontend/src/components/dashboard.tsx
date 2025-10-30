import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Flame, Mic, Utensils, Dumbbell } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const todayStats = {
    calories: { consumed: 1450, goal: 2000 },
    protein: { consumed: 85, goal: 120 },
    carbs: { consumed: 180, goal: 250 },
    fat: { consumed: 65, goal: 80 }
  };

  const calorieProgress = (todayStats.calories.consumed / todayStats.calories.goal) * 100;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl">
        <h1 className="mb-2">Good Morning!</h1>
        <p className="text-primary-foreground/80">Let's crush your goals today</p>
      </div>

      {/* Daily Summary Cards */}
      <div className="px-4 space-y-4">
        {/* Calories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              Calories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span>{todayStats.calories.consumed} / {todayStats.calories.goal} kcal</span>
              <span className="text-muted-foreground">{todayStats.calories.goal - todayStats.calories.consumed} left</span>
            </div>
            <Progress value={calorieProgress} className="h-2" />
          </CardContent>
        </Card>



        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="px-1">Quick Actions</h3>
          
          {/* Voice Input - Most Prominent */}
          <Button className="w-full h-20 text-lg bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 hover:from-violet-600 hover:via-purple-600 hover:to-blue-600 shadow-lg border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-purple-400/20 to-blue-400/20 animate-pulse"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Mic className="h-6 w-6" />
              </div>
              <span className="font-semibold">Voice Input</span>
            </div>
          </Button>
          
          {/* Manual Logging */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="h-16 flex-col gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => onNavigate('diet')}
            >
              <Utensils className="h-5 w-5" />
              <span>Log Meal</span>
            </Button>
            <Button 
              className="h-16 flex-col gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => onNavigate('exercise')}
            >
              <Dumbbell className="h-5 w-5" />
              <span>Log Workout</span>
            </Button>
          </div>
        </div>

        {/* Macros */}
        <Card>
          <CardHeader>
            <CardTitle>Macronutrients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Protein</span>
                <span>{todayStats.protein.consumed}g / {todayStats.protein.goal}g</span>
              </div>
              <Progress value={(todayStats.protein.consumed / todayStats.protein.goal) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Carbs</span>
                <span>{todayStats.carbs.consumed}g / {todayStats.carbs.goal}g</span>
              </div>
              <Progress value={(todayStats.carbs.consumed / todayStats.carbs.goal) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Fat</span>
                <span>{todayStats.fat.consumed}g / {todayStats.fat.goal}g</span>
              </div>
              <Progress value={(todayStats.fat.consumed / todayStats.fat.goal) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}