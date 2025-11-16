import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Mic, WifiOff, Clock, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { useMealLogger } from '../hooks/useMealLogger';
import { MealLog } from '../types/models';

export function DietTracker() {
  const [isLogMealOpen, setIsLogMealOpen] = useState(false);

  const { meals, loading, syncing, error, isOnline, addMeal, manualSync, pendingCount } = useMealLogger();

  const getTotalMacros = () => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    meals.forEach(meal => {
      totals.calories += meal.totalNutrition.calories;
      totals.protein += meal.totalNutrition.protein;
      totals.carbs += meal.totalNutrition.carbs;
      totals.fat += meal.totalNutrition.fat;
    });
    return totals;
  };

  const handleMealInput = async (input: string) => {
    await addMeal(input);
    setIsLogMealOpen(false);
  };

  const totalMacros = getTotalMacros();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="mb-2">Diet Tracker</h1>
            <p className="text-green-100">Track your daily nutrition</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {!isOnline && (
              <Badge variant="secondary" className="bg-orange-500 text-white">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {pendingCount > 0 && (
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingCount} pending
                </Badge>
                {isOnline && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={manualSync}
                    disabled={syncing}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalMacros.calories}</p>
                <p className="text-muted-foreground">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalMacros.protein}g</p>
                <p className="text-muted-foreground">Protein</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Log Meal Button */}
        <Button
          className="w-full h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
          onClick={() => setIsLogMealOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Meal
        </Button>

        {/* Today's Meals */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meals logged today. Tap "Log Meal" to get started!</p>
            ) : (
              meals.map((meal, index) => (
                <div key={meal.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {meal.parsedByBackend
                            ? meal.items.map(item => item.name).join(', ')
                            : meal.rawInput
                          }
                        </p>
                        {!meal.synced && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-2 w-2 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      {meal.parsedByBackend && (
                        <p className="text-sm text-muted-foreground">
                          P: {meal.totalNutrition.protein}g • C: {meal.totalNutrition.carbs}g • F: {meal.totalNutrition.fat}g
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {meal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="outline">{meal.totalNutrition.calories} kcal</Badge>
                  </div>
                  {index < meals.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Natural Language Input Dialog */}
      <NaturalLanguageInput
        isOpen={isLogMealOpen}
        onClose={() => setIsLogMealOpen(false)}
        onSubmit={handleMealInput}
        title="Log Meal"
        placeholder="Describe what you ate..."
      />
    </div>
  );
}