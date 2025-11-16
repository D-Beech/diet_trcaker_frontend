# Offline-First Data Architecture

## Overview

This application implements a complete offline-first architecture for tracking meals and workouts. Data is stored locally first (localStorage), then synced to the cloud (Firestore) when online.

## Architecture Flow

```
User Input (Natural Language)
       ↓
[Check Online Status]
       ↓
   ┌───┴───┐
   │       │
Online    Offline
   │       │
   ↓       ↓
FastAPI   Save Raw Input
Parse     to localStorage
   │       │
   ↓       └──→ Pending Queue
localStorage
   │
   ↓
Firestore Sync
   │
   ↓
Mark as Synced
```

## Data Flow

### Online Mode
1. User enters meal/workout via natural language
2. Frontend calls FastAPI to parse the input
3. Backend returns structured data (calories, macros, exercises)
4. Frontend saves to localStorage immediately
5. Frontend syncs to Firestore (with userId + timestamp)
6. Mark item as `synced: true`

### Offline Mode
1. User enters meal/workout via natural language
2. Frontend saves raw input to localStorage with `parsedByBackend: false`
3. Item added to pending sync queue
4. When internet returns:
   - Send raw input to FastAPI for parsing
   - Update localStorage with parsed data
   - Sync to Firestore
   - Mark as synced

## File Structure

```
frontend/src/
├── types/
│   ├── models.ts          # Core data types (MealLog, WorkoutLog, etc.)
│   ├── api.ts             # API request/response types
│   └── index.ts           # Central export
│
├── services/
│   ├── storage.ts         # localStorage CRUD operations
│   ├── firestore.ts       # Firestore sync operations
│   └── sync.ts            # Offline-first sync logic
│
├── hooks/
│   ├── useOnlineStatus.ts    # Detect online/offline
│   ├── useMealLogger.ts      # Meal logging with auto-sync
│   └── useWorkoutLogger.ts   # Workout logging with auto-sync
│
├── components/
│   ├── diet-tracker.tsx      # Updated with useMealLogger
│   └── exercise-tracker.tsx  # Updated with useWorkoutLogger
│
└── utils/
    └── firebase.ts        # Firebase + Firestore initialization
```

## Key Components

### 1. Type Definitions (`types/models.ts`)

**MealLog:**
```typescript
{
  id: string;                    // Firestore document ID
  userId: string;                // Firebase Auth UID
  timestamp: Date;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  rawInput: string;              // Original natural language
  items: FoodItem[];             // Parsed food items
  totalNutrition: NutritionData;
  synced: boolean;               // Synced to Firestore?
  parsedByBackend: boolean;      // Parsed by FastAPI?
}
```

**WorkoutLog:**
```typescript
{
  id: string;                    // Firestore document ID
  userId: string;
  timestamp: Date;
  rawInput: string;
  exercises: Exercise[];
  totalCaloriesBurned: number;
  totalDuration: number;
  synced: boolean;
  parsedByBackend: boolean;
}
```

### 2. LocalStorage Service (`services/storage.ts`)

Functions:
- `saveMealToLocalStorage(meal)` - Save/update meal
- `getMealsFromLocalStorage(userId, startDate, endDate)` - Query meals
- `saveWorkoutToLocalStorage(workout)` - Save/update workout
- `getWorkoutsFromLocalStorage(userId, startDate, endDate)` - Query workouts
- `getPendingSync()` - Get items waiting to sync
- `addToPendingSync(item)` - Add to sync queue
- `removeFromPendingSync(itemId)` - Remove after successful sync
- `getTodayData(userId)` - Get today's meals + workouts

### 3. Firestore Service (`services/firestore.ts`)

Collections:
- `/meals/{mealId}` - All meal logs
- `/workouts/{workoutId}` - All workout logs
- `/users/{userId}` - User profiles

Functions:
- `saveMealToFirestore(meal)` - Sync meal to cloud
- `getMealsFromFirestore(userId, startDate, endDate)` - Query meals
- `saveWorkoutToFirestore(workout)` - Sync workout to cloud
- `getWorkoutsFromFirestore(userId, startDate, endDate)` - Query workouts
- `saveUserProfileToFirestore(profile)` - Save user profile
- `getUserProfileFromFirestore(userId)` - Get user profile

### 4. Sync Service (`services/sync.ts`)

**Main Functions:**

`logMeal(userId, input, mealType, isOnline)`
- Online: Parse → localStorage → Firestore
- Offline: Save raw → pending queue

`logWorkout(userId, input, isOnline)`
- Online: Parse → localStorage → Firestore
- Offline: Save raw → pending queue

`syncPendingItems(userId)`
- Called when coming back online
- Processes pending queue
- Parses unparsed items
- Syncs to Firestore
- Retries up to 3 times

**ID Generation:**
- Uses Firestore's auto-generated IDs via `doc(collection(db, 'meals')).id`
- Ensures consistent IDs between localStorage and Firestore

### 5. Custom Hooks

**`useOnlineStatus()`**
- Returns `isOnline: boolean`
- Listens to window `online`/`offline` events

**`useMealLogger()`**
```typescript
{
  meals: MealLog[];           // Today's meals
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  addMeal: (input, mealType?) => Promise<MealLog>;
  refreshMeals: () => void;
  pendingCount: number;       // Unsynced items
}
```

**`useWorkoutLogger()`**
```typescript
{
  workouts: WorkoutLog[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  addWorkout: (input) => Promise<WorkoutLog>;
  refreshWorkouts: () => void;
  pendingCount: number;
}
```

## UI Indicators

Both DietTracker and ExerciseTracker show:

1. **Offline Badge** - Orange badge when offline
2. **Pending Count Badge** - Yellow badge showing unsynced items
3. **Per-Item Status** - "Pending" badge on unsynced items
4. **Error Messages** - Red card for errors

## Data Sync Strategy

### When to Sync
1. On mount (if online)
2. When coming back online
3. After each successful log (if online)

### Retry Logic
- Max 3 attempts per item
- Items that exceed max attempts stay in queue (manual intervention needed)
- Last attempt timestamp tracked

### Conflict Resolution
- localStorage is source of truth for offline changes
- Last write wins when syncing to Firestore
- No merge conflicts (append-only for logs)

## Setup Requirements

### Environment Variables (`.env.local`)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:8000
```

### Firestore Security Rules (Example)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /meals/{mealId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }

    match /workouts/{workoutId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

### Firestore Indexes (Recommended)
```
Collection: meals
- userId (Ascending), timestamp (Descending)

Collection: workouts
- userId (Ascending), timestamp (Descending)
```

## Testing Scenarios

### Test Offline Functionality
1. Open DevTools → Network → Set to "Offline"
2. Log a meal/workout
3. Verify it appears in UI with "Pending" badge
4. Verify it's in localStorage
5. Go back online
6. Verify auto-sync occurs
7. Check Firestore console for synced data

### Test Online Functionality
1. Log a meal/workout while online
2. Verify it's parsed immediately
3. Verify it appears in UI without "Pending" badge
4. Check localStorage
5. Check Firestore console

### Test Retry Logic
1. Go offline
2. Log multiple items
3. Go online but block FastAPI endpoint (firewall/503 error)
4. Observe retry attempts
5. Unblock endpoint
6. Verify sync completes

## Future Enhancements

1. **Background Sync API** - Use Service Workers for true background sync
2. **Optimistic UI Updates** - Show parsed data before backend confirms
3. **Conflict Resolution** - Handle edge cases with timestamps
4. **Batch Sync** - Sync multiple items in single request
5. **Progressive Web App** - Full offline capability
6. **IndexedDB** - For larger datasets (replace localStorage)
7. **Real-time Listeners** - Firestore onSnapshot for multi-device sync

## Troubleshooting

**Items stuck in pending queue:**
- Check console for errors
- Verify FastAPI is reachable
- Check Firestore permissions
- Clear localStorage and re-log

**Data not syncing:**
- Verify Firebase config is correct
- Check network tab for API calls
- Verify user is authenticated
- Check Firestore rules

**Duplicate items:**
- Shouldn't happen (same ID used for localStorage + Firestore)
- If it occurs, check ID generation logic
