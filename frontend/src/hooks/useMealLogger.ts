import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MealLog } from '../types/models';
import { useAuth } from './useAuth';
import { useOnlineStatus } from './useOnlineStatus';
import { logMeal, syncPendingItems } from '../services/sync';
import { getMealsFromLocalStorage, getTodayData } from '../services/storage';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useMealLogger() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load today's meals from localStorage on mount
  useEffect(() => {
    if (user) {
      const { meals: todayMeals } = getTodayData(user.uid);
      setMeals(todayMeals);
    }
  }, [user]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (!user) return;
    if (!isOnline) {
      setError('Cannot sync while offline');
      return;
    }

    setSyncing(true);
    setError(null);
    try {
      const result = await syncPendingItems(user.uid);
      // Refresh meals after sync
      const { meals: todayMeals } = getTodayData(user.uid);
      setMeals(todayMeals);

      // Set error message if there were failures
      if (result.failed > 0) {
        setError(`Synced ${result.synced} items, ${result.failed} failed`);
      }
    } catch (err) {
      console.error('Error syncing pending items:', err);
      setError('Failed to sync pending items');
    } finally {
      setSyncing(false);
    }
  }, [user]);

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

  const addMeal = useCallback(
    async (input: string) => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const mealLog = await logMeal(user.uid, input, isOnline);

        // Update local state
        setMeals(prevMeals => [mealLog, ...prevMeals]);

        return mealLog;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to log meal';
        setError(errorMessage);
        console.error('Error adding meal:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, isOnline]
  );

  const refreshMeals = useCallback(() => {
    if (user) {
      const { meals: todayMeals } = getTodayData(user.uid);
      setMeals(todayMeals);
    }
  }, [user]);

  const pendingCount = useMemo(() => {
    return meals.filter(m => !m.synced).length;
  }, [meals]);

  return {
    meals,
    loading,
    syncing,
    error,
    isOnline,
    addMeal,
    refreshMeals,
    manualSync,
    pendingCount,
  };
}
