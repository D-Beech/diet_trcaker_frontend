// Sync service to handle offline-first data synchronization

import { collection, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { MealLog, WorkoutLog, PendingSync } from '../types/models';
import { MealLogRequest, WorkoutLogRequest, MealLogResponse, WorkoutLogResponse } from '../types/api';
import {
  saveMealToLocalStorage,
  saveWorkoutToLocalStorage,
  getPendingSync,
  addToPendingSync,
  removeFromPendingSync,
} from './storage';
import { saveMealToFirestore, saveWorkoutToFirestore } from './firestore';

// Generate Firestore document ID
const generateFirestoreId = (collectionName: string): string => {
  return doc(collection(db, collectionName)).id;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Parse meal using FastAPI backend
export const parseMealInput = async (
  userId: string,
  input: string
): Promise<MealLog> => {
  const requestBody: MealLogRequest = {
    input,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/logs/meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: MealLogResponse = await response.json();

    const mealLog: MealLog = {
      id: generateFirestoreId('meals'),
      userId,
      timestamp: new Date(data.timestamp),
      rawInput: input,
      items: data.items,
      totalNutrition: data.totalNutrition,
      synced: false,
      parsedByBackend: true,
    };

    return mealLog;
  } catch (error) {
    console.error('Error parsing meal input:', error);
    throw error;
  }
};

// Parse workout using FastAPI backend
export const parseWorkoutInput = async (userId: string, input: string): Promise<WorkoutLog> => {
  const requestBody: WorkoutLogRequest = {
    input,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/logs/workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: WorkoutLogResponse = await response.json();

    const workoutLog: WorkoutLog = {
      id: generateFirestoreId('workouts'),
      userId,
      timestamp: new Date(data.timestamp),
      rawInput: input,
      exercises: data.exercises,
      totalCaloriesBurned: data.totalCaloriesBurned,
      totalDuration: data.totalDuration,
      synced: false,
      parsedByBackend: true,
    };

    return workoutLog;
  } catch (error) {
    console.error('Error parsing workout input:', error);
    throw error;
  }
};

// Log meal with offline-first approach
export const logMeal = async (
  userId: string,
  input: string,
  isOnline: boolean = navigator.onLine
): Promise<MealLog> => {
  if (isOnline) {
    try {
      // Parse with backend
      const mealLog = await parseMealInput(userId, input);

      // Save to localStorage
      saveMealToLocalStorage(mealLog);

      // Try to sync to Firestore
      try {
        await saveMealToFirestore(mealLog);
        mealLog.synced = true;
        saveMealToLocalStorage(mealLog); // Update synced status
      } catch (firestoreError) {
        console.error('Firestore sync failed, added to pending queue:', firestoreError);
        addToPendingSync({
          id: mealLog.id,
          type: 'meal',
          data: mealLog,
          attempts: 0,
        });
      }

      return mealLog;
    } catch (error) {
      console.error('Online meal logging failed, falling back to offline mode:', error);
      // Fall through to offline mode
    }
  }

  // Offline mode: save raw input without parsing
  const mealLog: MealLog = {
    id: generateFirestoreId('meals'),
    userId,
    timestamp: new Date(),
    rawInput: input,
    items: [],
    totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    synced: false,
    parsedByBackend: false,
  };

  saveMealToLocalStorage(mealLog);
  addToPendingSync({
    id: mealLog.id,
    type: 'meal',
    data: mealLog,
    attempts: 0,
  });

  return mealLog;
};

// Log workout with offline-first approach
export const logWorkout = async (
  userId: string,
  input: string,
  isOnline: boolean = navigator.onLine
): Promise<WorkoutLog> => {
  if (isOnline) {
    try {
      // Parse with backend
      const workoutLog = await parseWorkoutInput(userId, input);

      // Save to localStorage
      saveWorkoutToLocalStorage(workoutLog);

      // Try to sync to Firestore
      try {
        await saveWorkoutToFirestore(workoutLog);
        workoutLog.synced = true;
        saveWorkoutToLocalStorage(workoutLog); // Update synced status
      } catch (firestoreError) {
        console.error('Firestore sync failed, added to pending queue:', firestoreError);
        addToPendingSync({
          id: workoutLog.id,
          type: 'workout',
          data: workoutLog,
          attempts: 0,
        });
      }

      return workoutLog;
    } catch (error) {
      console.error('Online workout logging failed, falling back to offline mode:', error);
      // Fall through to offline mode
    }
  }

  // Offline mode: save raw input without parsing
  const workoutLog: WorkoutLog = {
    id: generateFirestoreId('workouts'),
    userId,
    timestamp: new Date(),
    rawInput: input,
    exercises: [],
    totalCaloriesBurned: 0,
    totalDuration: 0,
    synced: false,
    parsedByBackend: false,
  };

  saveWorkoutToLocalStorage(workoutLog);
  addToPendingSync({
    id: workoutLog.id,
    type: 'workout',
    data: workoutLog,
    attempts: 0,
  });

  return workoutLog;
};

// Sync pending items when coming back online
export const syncPendingItems = async (userId: string): Promise<{ synced: number; failed: number }> => {
  const pending = getPendingSync();

  if (pending.length === 0) {
    return { synced: 0, failed: 0 };
  }

  console.log(`Syncing ${pending.length} pending items...`);

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {

      if (item.type === 'meal') {
        const mealLog = item.data as MealLog;

        // Parse if not already parsed
        if (!mealLog.parsedByBackend) {
          const parsed = await parseMealInput(userId, mealLog.rawInput);
          mealLog.items = parsed.items;
          mealLog.totalNutrition = parsed.totalNutrition;
          mealLog.parsedByBackend = true;
          saveMealToLocalStorage(mealLog);
        }

        // Sync to Firestore
        await saveMealToFirestore(mealLog);
        mealLog.synced = true;
        saveMealToLocalStorage(mealLog);

        // Remove from pending queue
        removeFromPendingSync(item.id);
        syncedCount++;
        console.log(`Successfully synced meal ${item.id}`);
      } else if (item.type === 'workout') {
        const workoutLog = item.data as WorkoutLog;

        // Parse if not already parsed
        if (!workoutLog.parsedByBackend) {
          const parsed = await parseWorkoutInput(userId, workoutLog.rawInput);
          workoutLog.exercises = parsed.exercises;
          workoutLog.totalCaloriesBurned = parsed.totalCaloriesBurned;
          workoutLog.totalDuration = parsed.totalDuration;
          workoutLog.parsedByBackend = true;
          saveWorkoutToLocalStorage(workoutLog);
        }

        // Sync to Firestore
        await saveWorkoutToFirestore(workoutLog);
        workoutLog.synced = true;
        saveWorkoutToLocalStorage(workoutLog);

        // Remove from pending queue
        removeFromPendingSync(item.id);
        syncedCount++;
        console.log(`Successfully synced workout ${item.id}`);
      }
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      failedCount++;

      // Increment retry count
      addToPendingSync({
        ...item,
        attempts: item.attempts + 1,
        lastAttempt: new Date(),
      });
    }
  }

  console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed`);
  return { synced: syncedCount, failed: failedCount };
};
