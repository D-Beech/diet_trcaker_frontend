import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Search, Dumbbell, Timer, Flame, Play, Pause, Square } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { NaturalLanguageInput } from './NaturalLanguageInput';

export function ExerciseTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);

  const todayWorkouts = [
    {
      name: 'Morning Run',
      type: 'Cardio',
      duration: 30,
      calories: 320,
      time: '7:00 AM',
      exercises: [
        { name: 'Running', duration: 30, calories: 320 }
      ]
    },
    {
      name: 'Strength Training',
      type: 'Strength',
      duration: 45,
      calories: 280,
      time: '6:00 PM',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10, weight: 185 },
        { name: 'Squats', sets: 3, reps: 12, weight: 225 },
        { name: 'Deadlifts', sets: 3, reps: 8, weight: 275 }
      ]
    }
  ];

  const exerciseLibrary = [
    // Cardio
    { name: 'Running (6 mph)', category: 'Cardio', caloriesPerMin: 10.8 },
    { name: 'Cycling (moderate)', category: 'Cardio', caloriesPerMin: 8.4 },
    { name: 'Swimming', category: 'Cardio', caloriesPerMin: 11.2 },
    { name: 'Walking (3.5 mph)', category: 'Cardio', caloriesPerMin: 4.3 },
    { name: 'Elliptical', category: 'Cardio', caloriesPerMin: 9.1 },
    
    // Strength
    { name: 'Bench Press', category: 'Strength', primaryMuscle: 'Chest' },
    { name: 'Squats', category: 'Strength', primaryMuscle: 'Legs' },
    { name: 'Deadlifts', category: 'Strength', primaryMuscle: 'Back' },
    { name: 'Pull-ups', category: 'Strength', primaryMuscle: 'Back' },
    { name: 'Push-ups', category: 'Strength', primaryMuscle: 'Chest' },
    { name: 'Shoulder Press', category: 'Strength', primaryMuscle: 'Shoulders' },
  ];

  const filteredExercises = exerciseLibrary.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCaloriesBurned = todayWorkouts.reduce((total, workout) => total + workout.calories, 0);
  const totalWorkoutTime = todayWorkouts.reduce((total, workout) => total + workout.duration, 0);

  const handleWorkoutInput = async (input: string) => {
    try {
      await fetch('https://coffeeforbees.free.beeceptor.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'exercise',
          mode: 'log-workout',
          input,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to send workout input', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-b-3xl">
        <h1 className="mb-2">Exercise Tracker</h1>
        <p className="text-blue-100">Track your workouts and activities</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Flame className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">Calories Burned</p>
                  <p className="font-bold">{totalCaloriesBurned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Timer className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">Workout Time</p>
                  <p className="font-bold">{totalWorkoutTime} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Workout Timer */}
        {isWorkoutActive && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Workout</p>
                  <p className="text-2xl font-bold">{Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsWorkoutActive(false)}>
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1"
            onClick={() => setIsAddWorkoutOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>

          <Button 
            variant={isWorkoutActive ? "destructive" : "default"}
            onClick={() => setIsWorkoutActive(!isWorkoutActive)}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>

        {/* Today's Workouts */}
        <div className="space-y-4">
          <h2 className="font-medium">Today's Workouts</h2>
          
          {todayWorkouts.map((workout, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    {workout.name}
                  </div>
                  <Badge variant="secondary">{workout.time}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">Type: {workout.type}</span>
                    <span className="text-muted-foreground">Duration: {workout.duration} min</span>
                    <span className="text-muted-foreground">Calories: {workout.calories}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="flex justify-between items-center">
                      <p className="font-medium">{exercise.name}</p>
                      <div className="text-sm text-muted-foreground">
                        {'sets' in exercise ? (
                          `${exercise.sets} × ${exercise.reps} @ ${exercise.weight}lbs`
                        ) : (
                          `${exercise.duration} min • ${exercise.calories} cal`
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {todayWorkouts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No workouts logged today</p>
                <p className="text-sm text-muted-foreground">Tap "Log Workout" to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Natural Language Input Dialog */}
      <NaturalLanguageInput
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
        onSubmit={handleWorkoutInput}
        title="Log Workout"
        placeholder="Describe your workout..."
      />
    </div>
  );
}