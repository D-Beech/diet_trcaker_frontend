// LocalStorage service for offline-first data storage

import { MealLog, WorkoutLog, PendingSync, BodyweightLog, UserProfile } from '../types/models';

const MEALS_KEY = 'diet_tracker_meals';
const WORKOUTS_KEY = 'diet_tracker_workouts';
const BODYWEIGHT_KEY = 'diet_tracker_bodyweight';
const PROFILE_KEY = 'diet_tracker_profile';
const PENDING_SYNC_KEY = 'diet_tracker_pending_sync';

// Helper to prepare log for serialization (converts Dates to ISO strings)
const prepareLogForStorage = <T extends MealLog | WorkoutLog>(log: T): any => {
  return JSON.parse(JSON.stringify(log, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
};

// Helper to restore log from storage (converts ISO strings back to Dates)
const restoreLogFromStorage = <T extends MealLog | WorkoutLog>(obj: any): T => {
  const restored = { ...obj };
  if (restored.timestamp) {
    restored.timestamp = new Date(restored.timestamp);
  }
  return restored as T;
};

// Meal operations
export const saveMealToLocalStorage = (meal: MealLog): void => {
  try {
    const meals = getMealsFromLocalStorage();
    const existingIndex = meals.findIndex(m => m.id === meal.id);

    if (existingIndex >= 0) {
      meals[existingIndex] = meal;
    } else {
      meals.push(meal);
    }

    localStorage.setItem(MEALS_KEY, JSON.stringify(meals.map(m => prepareLogForStorage(m))));
  } catch (error) {
    console.error('Error saving meal to localStorage:', error);
    throw error;
  }
};

export const getMealsFromLocalStorage = (userId?: string, startDate?: Date, endDate?: Date): MealLog[] => {
  try {
    const mealsJson = localStorage.getItem(MEALS_KEY);
    if (!mealsJson) return [];

    const meals: MealLog[] = JSON.parse(mealsJson).map((obj: any) => restoreLogFromStorage<MealLog>(obj));

    return meals.filter(meal => {
      if (userId && meal.userId !== userId) return false;
      if (startDate && meal.timestamp < startDate) return false;
      if (endDate && meal.timestamp > endDate) return false;
      return true;
    });
  } catch (error) {
    console.error('Error reading meals from localStorage:', error);
    return [];
  }
};

export const deleteMealFromLocalStorage = (mealId: string): void => {
  try {
    const meals = getMealsFromLocalStorage();
    const filtered = meals.filter(m => m.id !== mealId);
    localStorage.setItem(MEALS_KEY, JSON.stringify(filtered.map(m => prepareLogForStorage(m))));
  } catch (error) {
    console.error('Error deleting meal from localStorage:', error);
    throw error;
  }
};

// Workout operations
export const saveWorkoutToLocalStorage = (workout: WorkoutLog): void => {
  try {
    const workouts = getWorkoutsFromLocalStorage();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);

    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }

    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts.map(w => prepareLogForStorage(w))));
  } catch (error) {
    console.error('Error saving workout to localStorage:', error);
    throw error;
  }
};

export const getWorkoutsFromLocalStorage = (userId?: string, startDate?: Date, endDate?: Date): WorkoutLog[] => {
  try {
    const workoutsJson = localStorage.getItem(WORKOUTS_KEY);
    if (!workoutsJson) return [];

    const workouts: WorkoutLog[] = JSON.parse(workoutsJson).map((obj: any) => restoreLogFromStorage<WorkoutLog>(obj));

    return workouts.filter(workout => {
      if (userId && workout.userId !== userId) return false;
      if (startDate && workout.timestamp < startDate) return false;
      if (endDate && workout.timestamp > endDate) return false;
      return true;
    });
  } catch (error) {
    console.error('Error reading workouts from localStorage:', error);
    return [];
  }
};

export const deleteWorkoutFromLocalStorage = (workoutId: string): void => {
  try {
    const workouts = getWorkoutsFromLocalStorage();
    const filtered = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered.map(w => prepareLogForStorage(w))));
  } catch (error) {
    console.error('Error deleting workout from localStorage:', error);
    throw error;
  }
};

// Pending sync queue operations
export const addToPendingSync = (item: PendingSync): void => {
  try {
    const pending = getPendingSync();
    const existingIndex = pending.findIndex(p => p.id === item.id);

    if (existingIndex >= 0) {
      pending[existingIndex] = item;
    } else {
      pending.push(item);
    }

    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error adding to pending sync:', error);
    throw error;
  }
};

export const getPendingSync = (): PendingSync[] => {
  try {
    const pendingJson = localStorage.getItem(PENDING_SYNC_KEY);
    if (!pendingJson) return [];

    return JSON.parse(pendingJson, (key, value) => {
      if (key === 'lastAttempt') {
        return value ? new Date(value) : undefined;
      }
      if (key === 'timestamp') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error reading pending sync:', error);
    return [];
  }
};

export const removeFromPendingSync = (itemId: string): void => {
  try {
    const pending = getPendingSync();
    const filtered = pending.filter(p => p.id !== itemId);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from pending sync:', error);
    throw error;
  }
};

export const clearPendingSync = (): void => {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing pending sync:', error);
    throw error;
  }
};

// Get today's data for a user
export const getTodayData = (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meals = getMealsFromLocalStorage(userId, today, tomorrow);
  const workouts = getWorkoutsFromLocalStorage(userId, today, tomorrow);

  return { meals, workouts };
};

// Bodyweight operations
export const saveBodyweightToLocalStorage = (bodyweight: BodyweightLog): void => {
  try {
    const bodyweights = getBodyweightLogsFromLocalStorage();
    const existingIndex = bodyweights.findIndex(b => b.id === bodyweight.id);

    if (existingIndex >= 0) {
      bodyweights[existingIndex] = bodyweight;
    } else {
      bodyweights.push(bodyweight);
    }

    const prepared = bodyweights.map(b => ({
      ...b,
      timestamp: b.timestamp.toISOString(),
    }));
    localStorage.setItem(BODYWEIGHT_KEY, JSON.stringify(prepared));
  } catch (error) {
    console.error('Error saving bodyweight to localStorage:', error);
    throw error;
  }
};

export const getBodyweightLogsFromLocalStorage = (userId?: string): BodyweightLog[] => {
  try {
    const bodyweightsJson = localStorage.getItem(BODYWEIGHT_KEY);
    if (!bodyweightsJson) return [];

    const bodyweights: BodyweightLog[] = JSON.parse(bodyweightsJson).map((obj: any) => ({
      ...obj,
      timestamp: new Date(obj.timestamp),
    }));

    return bodyweights.filter(b => !userId || b.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error reading bodyweight logs from localStorage:', error);
    return [];
  }
};

export const getLatestBodyweightFromLocalStorage = (userId: string): BodyweightLog | null => {
  const bodyweights = getBodyweightLogsFromLocalStorage(userId);
  return bodyweights.length > 0 ? bodyweights[0] : null;
};

// Profile operations
export const saveProfileToLocalStorage = (profile: UserProfile): void => {
  try {
    const prepared = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(prepared));
  } catch (error) {
    console.error('Error saving profile to localStorage:', error);
    throw error;
  }
};

export const getProfileFromLocalStorage = (): UserProfile | null => {
  try {
    const profileJson = localStorage.getItem(PROFILE_KEY);
    if (!profileJson) return null;

    const obj = JSON.parse(profileJson);
    return {
      ...obj,
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    };
  } catch (error) {
    console.error('Error reading profile from localStorage:', error);
    return null;
  }
};

// Clear all data (for logout)
export const clearAllLocalData = (): void => {
  try {
    localStorage.removeItem(MEALS_KEY);
    localStorage.removeItem(WORKOUTS_KEY);
    localStorage.removeItem(BODYWEIGHT_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(PENDING_SYNC_KEY);
  } catch (error) {
    console.error('Error clearing local data:', error);
    throw error;
  }
};
