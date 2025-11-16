# Quick Start Guide - Diet & Exercise Tracker

## 🚀 Getting Started (5 Minutes)

### Step 1: Set Up Firebase (One-time)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Click "Add project" or select existing project

2. **Enable Authentication**
   - Left sidebar → Build → Authentication → Get Started
   - Sign-in method tab
   - Enable "Email/Password"
   - Enable "Google" (optional but recommended)

3. **Enable Firestore Database**
   - Left sidebar → Build → Firestore Database → Create database
   - Choose "Start in test mode" (we'll add security rules later)
   - Select your region (closest to your users)

4. **Get Your Config Credentials**
   - Left sidebar → Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon `</>` to add a web app
   - Register app (name it whatever you want)
   - Copy the `firebaseConfig` object

### Step 2: Configure Frontend

1. **Create `.env.local` file in `/frontend` directory:**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your Firebase credentials:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_API_URL=http://localhost:8000
   ```

### Step 3: Set Firestore Security Rules

1. **Go to Firestore Database in Firebase Console**
2. **Click "Rules" tab**
3. **Replace with these rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only authenticated users can read/write their own data
       match /meals/{mealId} {
         allow read, write: if request.auth != null
           && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null
           && request.auth.uid == request.resource.data.userId;
       }

       match /workouts/{workoutId} {
         allow read, write: if request.auth != null
           && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null
           && request.auth.uid == request.resource.data.userId;
       }

       match /users/{userId} {
         allow read, write: if request.auth != null
           && request.auth.uid == userId;
       }
     }
   }
   ```
4. **Click "Publish"**

### Step 4: Start the App

1. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   - Go to `http://localhost:5173` (or whatever port Vite shows)

---

## 📱 How to Use the App

### First Time Setup

1. **Sign Up**
   - App will show login screen
   - Click "Sign Up" tab
   - Enter email and password, or use "Sign in with Google"

2. **You're In!**
   - App will load the Dashboard

### Logging Meals

1. **Navigate to "Diet" tab** (bottom navigation)

2. **Click "Manual Log Meal"** or click the `+` button next to a meal type

3. **Type naturally:**
   ```
   "2 eggs and toast with butter"
   "Chicken breast with rice and broccoli"
   "Banana and protein shake"
   ```

4. **Press Enter or Submit**
   - If online: Instantly parsed and saved
   - If offline: Saved locally, will sync when online

5. **View Your Meal:**
   - Shows up under the appropriate meal type (breakfast/lunch/dinner/snacks)
   - Displays calories and macros
   - Shows "Pending" badge if not yet synced to cloud

### Logging Workouts

1. **Navigate to "Exercise" tab**

2. **Click "Log Workout"**

3. **Type naturally:**
   ```
   "30 minute run"
   "Bench press 3 sets of 10 at 185 lbs"
   "Deadlifts 3x8 at 275 lbs and squats 3x12 at 225 lbs"
   ```

4. **Press Enter or Submit**
   - If online: Parsed and saved immediately
   - If offline: Saved, will sync later

5. **View Your Workout:**
   - Shows exercises, sets, reps, weight
   - Displays total calories burned and duration

### Viewing Progress

1. **Navigate to "Progress" tab**
2. View charts and analytics (TODO: will populate with your logged data)

### Profile Settings

1. **Navigate to "Profile" tab**
2. Set your goals (calorie targets, macros)
3. Update personal info

---

## 🌐 Offline Mode

### What Happens Offline?

1. **You can still log meals/workouts!**
   - Data saves to your browser's localStorage
   - Shows "Offline" badge in header
   - Shows pending count

2. **When You Come Back Online:**
   - App automatically syncs pending items
   - Sends to backend for parsing
   - Saves to Firestore
   - "Pending" badges disappear

### Testing Offline Mode

1. Open browser DevTools (F12)
2. Go to Network tab
3. Change dropdown to "Offline"
4. Log some meals/workouts
5. Notice "Pending" badges
6. Switch back to "Online"
7. Watch items sync automatically!

---

## 🐛 Troubleshooting

### "Firebase not configured" error
- Check `.env.local` exists in `/frontend` directory
- Verify all `VITE_FIREBASE_*` variables are filled in
- Restart dev server (`npm run dev`)

### Login not working
- Check Firebase Authentication is enabled
- Check you enabled Email/Password provider
- Check browser console for errors

### Data not syncing
- Check "Offline" badge - are you actually online?
- Check browser console for errors
- Verify Firestore security rules are published
- Check Network tab - is FastAPI running on port 8000?

### Items stuck in "Pending"
- Check if backend is running (`http://localhost:8000/health`)
- Check browser console for API errors
- Try refreshing the page

### Can't see my data on other devices
- Make sure you're logged in with same account
- Check Firestore console to see if data exists
- Verify security rules allow read access

---

## 🔍 Checking Your Data

### View in Firestore Console

1. Go to Firebase Console → Firestore Database
2. Click "Data" tab
3. You should see:
   - `meals` collection (with your meal documents)
   - `workouts` collection (with your workout documents)
   - `users` collection (with your profile)

### View in Browser DevTools

1. Open DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Expand "Local Storage"
4. Click your localhost URL
5. Look for keys:
   - `diet_tracker_meals`
   - `diet_tracker_workouts`
   - `diet_tracker_pending_sync`

---

## 📊 Example Natural Language Inputs

### Meals
```
"2 eggs scrambled with cheese and toast"
"Grilled chicken breast 6oz with brown rice and steamed broccoli"
"Banana and whey protein shake"
"Big Mac and medium fries"
"Oatmeal with blueberries and honey"
"Turkey sandwich on whole wheat"
```

### Workouts
```
"30 minute run at 6 mph"
"Bench press 3 sets of 10 reps at 185 lbs"
"Squats 4x12 at 225 lbs, deadlifts 3x8 at 275 lbs"
"60 minute yoga session"
"Swimming for 45 minutes"
"Bicep curls 3x15 at 30 lbs each arm"
```

---

## 🎯 Next Steps

1. ✅ Set up Firebase
2. ✅ Configure `.env.local`
3. ✅ Set security rules
4. ✅ Start backend and frontend
5. ✅ Create account and login
6. ✅ Log your first meal
7. ✅ Log your first workout
8. 🎉 Start tracking!

---

## 📞 Need Help?

- Check `OFFLINE_FIRST_ARCHITECTURE.md` for technical details
- Check `CLAUDE.md` for project overview
- Check Firebase Console for auth/database status
- Check browser console for error messages
