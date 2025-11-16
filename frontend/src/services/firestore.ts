// Firestore service for cloud data persistence

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { MealLog, WorkoutLog, UserProfile, BodyweightLog } from '../types/models';

// Collection names
const MEALS_COLLECTION = 'meals';
const WORKOUTS_COLLECTION = 'workouts';
const USERS_COLLECTION = 'users';
const BODYWEIGHT_COLLECTION = 'bodyweight';

// Helper to convert Firestore Timestamp to Date
const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Helper to convert Date to Firestore Timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Meal operations
export const saveMealToFirestore = async (meal: MealLog): Promise<void> => {
  try {
    const mealDoc = doc(db, MEALS_COLLECTION, meal.id);
    const mealData = {
      ...meal,
      timestamp: dateToTimestamp(meal.timestamp),
    };
    await setDoc(mealDoc, mealData);
  } catch (error) {
    console.error('Error saving meal to Firestore:', error);
    throw error;
  }
};

export const getMealFromFirestore = async (mealId: string): Promise<MealLog | null> => {
  try {
    const mealDoc = doc(db, MEALS_COLLECTION, mealId);
    const snapshot = await getDoc(mealDoc);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      ...data,
      timestamp: timestampToDate(data.timestamp),
    } as MealLog;
  } catch (error) {
    console.error('Error getting meal from Firestore:', error);
    throw error;
  }
};

export const getMealsFromFirestore = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<MealLog[]> => {
  try {
    const mealsRef = collection(db, MEALS_COLLECTION);
    let q = query(mealsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));

    if (startDate) {
      q = query(q, where('timestamp', '>=', dateToTimestamp(startDate)));
    }
    if (endDate) {
      q = query(q, where('timestamp', '<=', dateToTimestamp(endDate)));
    }

    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: timestampToDate(data.timestamp),
      } as MealLog;
    });
  } catch (error) {
    console.error('Error getting meals from Firestore:', error);
    throw error;
  }
};

// Workout operations
export const saveWorkoutToFirestore = async (workout: WorkoutLog): Promise<void> => {
  try {
    const workoutDoc = doc(db, WORKOUTS_COLLECTION, workout.id);
    const workoutData = {
      ...workout,
      timestamp: dateToTimestamp(workout.timestamp),
    };
    await setDoc(workoutDoc, workoutData);
  } catch (error) {
    console.error('Error saving workout to Firestore:', error);
    throw error;
  }
};

export const getWorkoutFromFirestore = async (workoutId: string): Promise<WorkoutLog | null> => {
  try {
    const workoutDoc = doc(db, WORKOUTS_COLLECTION, workoutId);
    const snapshot = await getDoc(workoutDoc);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      ...data,
      timestamp: timestampToDate(data.timestamp),
    } as WorkoutLog;
  } catch (error) {
    console.error('Error getting workout from Firestore:', error);
    throw error;
  }
};

export const getWorkoutsFromFirestore = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<WorkoutLog[]> => {
  try {
    const workoutsRef = collection(db, WORKOUTS_COLLECTION);
    let q = query(workoutsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));

    if (startDate) {
      q = query(q, where('timestamp', '>=', dateToTimestamp(startDate)));
    }
    if (endDate) {
      q = query(q, where('timestamp', '<=', dateToTimestamp(endDate)));
    }

    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: timestampToDate(data.timestamp),
      } as WorkoutLog;
    });
  } catch (error) {
    console.error('Error getting workouts from Firestore:', error);
    throw error;
  }
};

// User profile operations
export const saveUserProfileToFirestore = async (profile: UserProfile): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, profile.userId);
    const profileData = {
      ...profile,
      createdAt: dateToTimestamp(profile.createdAt),
      updatedAt: dateToTimestamp(profile.updatedAt),
    };
    await setDoc(userDoc, profileData);
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
    throw error;
  }
};

export const getUserProfileFromFirestore = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, userId);
    const snapshot = await getDoc(userDoc);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile from Firestore:', error);
    throw error;
  }
};

// Bodyweight operations
export const saveBodyweightToFirestore = async (bodyweight: BodyweightLog): Promise<void> => {
  try {
    const bodyweightDoc = doc(db, BODYWEIGHT_COLLECTION, bodyweight.id);
    const bodyweightData = {
      ...bodyweight,
      timestamp: dateToTimestamp(bodyweight.timestamp),
    };
    await setDoc(bodyweightDoc, bodyweightData);
  } catch (error) {
    console.error('Error saving bodyweight to Firestore:', error);
    throw error;
  }
};

export const getBodyweightLogsFromFirestore = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<BodyweightLog[]> => {
  try {
    const bodyweightRef = collection(db, BODYWEIGHT_COLLECTION);
    let q = query(bodyweightRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));

    if (startDate) {
      q = query(q, where('timestamp', '>=', dateToTimestamp(startDate)));
    }
    if (endDate) {
      q = query(q, where('timestamp', '<=', dateToTimestamp(endDate)));
    }

    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: timestampToDate(data.timestamp),
      } as BodyweightLog;
    });
  } catch (error) {
    console.error('Error getting bodyweight logs from Firestore:', error);
    throw error;
  }
};

export const getLatestBodyweightFromFirestore = async (userId: string): Promise<BodyweightLog | null> => {
  try {
    const bodyweightRef = collection(db, BODYWEIGHT_COLLECTION);
    const q = query(
      bodyweightRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return {
      ...data,
      timestamp: timestampToDate(data.timestamp),
    } as BodyweightLog;
  } catch (error) {
    console.error('Error getting latest bodyweight from Firestore:', error);
    throw error;
  }
};

// Get today's data from Firestore
export const getTodayDataFromFirestore = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [meals, workouts] = await Promise.all([
    getMealsFromFirestore(userId, today, tomorrow),
    getWorkoutsFromFirestore(userId, today, tomorrow),
  ]);

  return { meals, workouts };
};
