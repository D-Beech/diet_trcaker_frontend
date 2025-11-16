// Core data models for the Diet & Exercise Tracker

export interface NutritionData {
  calories: number;
  protein: number;   // grams
  carbs: number;     // grams
  fat: number;       // grams
}

export interface FoodItem {
  name: string;
  quantity_g?: number;
  quantity_items?: number;
  nutrition: NutritionData;
}

export interface MealLog {
  id: string;                    // Firestore document ID
  userId: string;                // Firebase Auth UID
  timestamp: Date;
  rawInput: string;              // Original natural language input
  items: FoodItem[];             // Parsed food items
  totalNutrition: NutritionData; // Aggregated nutrition
  synced: boolean;               // Synced to Firestore
  parsedByBackend: boolean;      // Parsed by FastAPI
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  duration_min?: number;
  calories?: number;
}

export interface WorkoutLog {
  id: string;                    // UUID
  userId: string;                // Firebase Auth UID
  timestamp: Date;
  rawInput: string;              // Original natural language input
  exercises: Exercise[];         // Parsed exercises
  totalCaloriesBurned: number;
  totalDuration: number;         // minutes
  synced: boolean;               // Synced to Firestore
  parsedByBackend: boolean;      // Parsed by FastAPI
}

export interface BodyweightLog {
  id: string;                    // Firestore document ID
  userId: string;                // Firebase Auth UID
  timestamp: Date;
  weight: number;                // kg
  synced: boolean;               // Synced to Firestore
}

export interface UserProfile {
  userId: string;                // Firebase Auth UID
  email: string;
  displayName?: string;
  age?: number;
  height?: number;               // cm
  targetWeight?: number;         // kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: {
    calorieGoal: number;
    proteinGoal: number;
    carbGoal: number;
    fatGoal: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySummary {
  userId: string;
  date: string;                  // YYYY-MM-DD format
  meals: {
    breakfast: MealLog[];
    lunch: MealLog[];
    dinner: MealLog[];
    snacks: MealLog[];
  };
  workouts: WorkoutLog[];
  totalNutrition: NutritionData;
  totalCaloriesBurned: number;
  netCalories: number;           // consumed - burned
}

// Helper type for localStorage pending items
export interface PendingSync {
  id: string;
  type: 'meal' | 'workout' | 'bodyweight' | 'profile';
  data: MealLog | WorkoutLog | BodyweightLog | UserProfile;
  attempts: number;
  lastAttempt?: Date;
}
