import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Search, Coffee, Sun, Sunset, Moon, Mic } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { NaturalLanguageInput } from './NaturalLanguageInput';

export function DietTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isManualLogOpen, setIsManualLogOpen] = useState(false);

  const todayMeals = {
    breakfast: [
      { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
    ],
    lunch: [
      { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
    ],
    dinner: [
      { name: 'Big Mac', calories: 550, protein: 25, carbs: 45, fat: 33 },
    ],
    snacks: []
  };

  const commonFoods = [
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
    { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: 'Big Mac', calories: 550, protein: 25, carbs: 45, fat: 33 },
  ];

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mealTypes = [
    { id: 'breakfast', icon: Coffee, label: 'Breakfast', color: 'bg-orange-100 text-orange-600' },
    { id: 'lunch', icon: Sun, label: 'Lunch', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'dinner', icon: Sunset, label: 'Dinner', color: 'bg-purple-100 text-purple-600' },
    { id: 'snacks', icon: Moon, label: 'Snacks', color: 'bg-blue-100 text-blue-600' },
  ];

  const getTotalCalories = (meals: typeof todayMeals[keyof typeof todayMeals]) => {
    return meals.reduce((total, meal) => total + meal.calories, 0);
  };

  const handleMealInput = async (input: string) => {
    try {
      await fetch('https://coffeeforbees.free.beeceptor.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'meal',
          mode: 'add-meal',
          mealType: selectedMeal,
          input,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to send meal input', err);
    }
  };

  const handleManualLogInput = async (input: string) => {
    try {
      await fetch('https://coffeeforbees.free.beeceptor.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'meal',
          mode: 'manual-log',
          input,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to send manual meal input', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-6 rounded-b-3xl">
        <h1 className="mb-2">Diet Tracker</h1>
        <p className="text-green-100">Track your daily nutrition</p>
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
                <p className="text-2xl font-bold text-primary">1,450</p>
                <p className="text-muted-foreground">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">85g</p>
                <p className="text-muted-foreground">Protein</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Input - Primary */}
        <Button className="w-full h-16 text-lg bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 hover:from-violet-600 hover:via-purple-600 hover:to-blue-600 shadow-lg border-0 relative overflow-hidden mb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-purple-400/20 to-blue-400/20 animate-pulse"></div>
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Mic className="h-5 w-5" />
            </div>
            <span className="font-semibold">Voice Log Meal</span>
          </div>
        </Button>

        {/* Quick Log Meal */}
        <Button 
          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          onClick={() => setIsManualLogOpen(true)}
        >
          <Mic className="h-4 w-4 mr-2" />
          Manual Log Meal
        </Button>

        {/* Meals */}
        {mealTypes.map(({ id, icon: Icon, label, color }) => (
          <Card key={id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {label}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getTotalCalories(todayMeals[id as keyof typeof todayMeals])} kcal</Badge>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedMeal(id);
                      setIsAddMealOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayMeals[id as keyof typeof todayMeals].map((food, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-muted-foreground">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </p>
                    </div>
                    <Badge variant="outline">{food.calories} kcal</Badge>
                  </div>
                  {index < todayMeals[id as keyof typeof todayMeals].length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
              {todayMeals[id as keyof typeof todayMeals].length === 0 && (
                <p className="text-muted-foreground text-center py-4">No foods logged yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Natural Language Input Dialogs */}
      <NaturalLanguageInput
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        onSubmit={handleMealInput}
        title={`Add to ${selectedMeal ? mealTypes.find(m => m.id === selectedMeal)?.label : 'Meal'}`}
        placeholder="Describe what you ate..."
      />

      <NaturalLanguageInput
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        onSubmit={handleManualLogInput}
        title="Log Meal"
        placeholder="Describe what you ate..."
      />
    </div>
  );
}