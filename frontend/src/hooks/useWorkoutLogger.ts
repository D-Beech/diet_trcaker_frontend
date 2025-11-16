import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkoutLog } from '../types/models';
import { useAuth } from './useAuth';
import { useOnlineStatus } from './useOnlineStatus';
import { logWorkout, syncPendingItems } from '../services/sync';
import { getTodayData } from '../services/storage';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useWorkoutLogger() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load today's workouts from localStorage on mount
  useEffect(() => {
    if (user) {
      const { workouts: todayWorkouts } = getTodayData(user.uid);
      setWorkouts(todayWorkouts);
    }
  }, [user]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (!user || !isOnline) return;

    setSyncing(true);
    try {
      await syncPendingItems(user.uid);
      // Refresh workouts after sync
      const { workouts: todayWorkouts } = getTodayData(user.uid);
      setWorkouts(todayWorkouts);
    } catch (err) {
      console.error('Error syncing pending items:', err);
      setError('Failed to sync pending items');
    } finally {
      setSyncing(false);
    }
  }, [user, isOnline]);

  // Sync on mount (if online and authenticated)
  useEffect(() => {
    if (isOnline && user) {
      manualSync();
    }
  }, []); // Only on mount

  // Sync pending items when coming online
  useEffect(() => {
    if (isOnline && user) {
      syncPendingItems(user.uid).catch(err => {
        console.error('Error syncing pending items:', err);
      });
    }
  }, [isOnline, user]);

  // Periodic background sync
  useEffect(() => {
    if (isOnline && user) {
      // Clear any existing interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }

      // Set up periodic sync
      syncIntervalRef.current = setInterval(() => {
        syncPendingItems(user.uid).catch(err => {
          console.error('Error in periodic sync:', err);
        });
      }, SYNC_INTERVAL_MS);
    } else {
      // Clear interval when offline or no user
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, user]);

  const addWorkout = useCallback(
    async (input: string) => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const workoutLog = await logWorkout(user.uid, input, isOnline);

        // Update local state
        setWorkouts(prevWorkouts => [workoutLog, ...prevWorkouts]);

        return workoutLog;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to log workout';
        setError(errorMessage);
        console.error('Error adding workout:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, isOnline]
  );

  const refreshWorkouts = useCallback(() => {
    if (user) {
      const { workouts: todayWorkouts } = getTodayData(user.uid);
      setWorkouts(todayWorkouts);
    }
  }, [user]);

  const getPendingCount = useCallback(() => {
    return workouts.filter(w => !w.synced).length;
  }, [workouts]);

  return {
    workouts,
    loading,
    syncing,
    error,
    isOnline,
    addWorkout,
    refreshWorkouts,
    manualSync,
    pendingCount: getPendingCount(),
  };
}
