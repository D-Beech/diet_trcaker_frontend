import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Search, Dumbbell, Timer, Flame, Play, Pause, Square, WifiOff, Clock, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { useWorkoutLogger } from '../hooks/useWorkoutLogger';

export function ExerciseTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);

  const { workouts, loading, syncing, error, isOnline, addWorkout, manualSync, pendingCount } = useWorkoutLogger();

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

  const totalCaloriesBurned = workouts.reduce((total, workout) => total + workout.totalCaloriesBurned, 0);
  const totalWorkoutTime = workouts.reduce((total, workout) => total + workout.totalDuration, 0);

  const handleWorkoutInput = async (input: string) => {
    await addWorkout(input);
    setIsAddWorkoutOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="mb-2">Exercise Tracker</h1>
            <p className="text-blue-100">Track your workouts and activities</p>
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
        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

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

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                No workouts logged today. Start by logging your first workout!
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span>
                            {workout.parsedByBackend
                              ? `Workout - ${workout.exercises.length} exercises`
                              : workout.rawInput
                            }
                          </span>
                          {!workout.synced && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-2 w-2 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {workout.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workout.parsedByBackend && (
                    <>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">Duration: {workout.totalDuration} min</span>
                          <span className="text-muted-foreground">Calories: {workout.totalCaloriesBurned}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="flex justify-between items-center">
                            <p className="font-medium">{exercise.name}</p>
                            <div className="text-sm text-muted-foreground">
                              {exercise.sets && exercise.reps ? (
                                `${exercise.sets} × ${exercise.reps}${exercise.weight_kg ? ` @ ${exercise.weight_kg}kg` : ''}`
                              ) : exercise.duration_min ? (
                                `${exercise.duration_min} min${exercise.calories ? ` • ${exercise.calories} cal` : ''}`
                              ) : exercise.distance_km ? (
                                `${exercise.distance_km} km`
                              ) : (
                                'Completed'
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Natural Language Input Dialog */}
      <NaturalLanguageInput
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
        onSubmit={handleWorkoutInput}
        title="Quick Log"
        placeholder="Log meals, workouts, or weight... (e.g., 'did 10 pushups, ran 5km, ate chicken')"
      />
    </div>
  );
}