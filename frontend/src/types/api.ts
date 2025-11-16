// API request and response types matching backend FastAPI endpoints

import { FoodItem, Exercise, NutritionData } from './models';

// Request types
export interface MealLogRequest {
  input: string;
  timestamp?: string;  // ISO string
}

export interface WorkoutLogRequest {
  input: string;
  timestamp?: string;  // ISO string
}

// Response types from FastAPI
export interface MealLogResponse {
  success: boolean;
  timestamp: string;
  items: FoodItem[];
  totalNutrition: NutritionData;
  rawInput: string;
}

export interface WorkoutLogResponse {
  success: boolean;
  timestamp: string;
  exercises: Exercise[];
  totalCaloriesBurned: number;
  totalDuration: number;
  rawInput: string;
}

export interface TodaySummaryResponse {
  date: string;
  meals: {
    count: number;
    totalCalories: number;
  };
  workouts: {
    count: number;
    totalCalories: number;
  };
  nutrition: NutritionData;
}

export interface ApiError {
  detail: string;
  status: number;
}
