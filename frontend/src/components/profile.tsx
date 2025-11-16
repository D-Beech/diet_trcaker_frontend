import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, Settings, Target, Bell, Moon, Smartphone, LogOut, Edit, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/models';
import { getProfileFromLocalStorage, saveProfileToLocalStorage, getLatestBodyweightFromLocalStorage, saveBodyweightToLocalStorage } from '../services/storage';
import { saveUserProfileToFirestore, saveBodyweightToFirestore } from '../services/firestore';
import { collection, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingWeight, setIsAddingWeight] = useState(false);

  // Form states
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbGoal, setCarbGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');

  // Load profile and latest weight on mount
  useEffect(() => {
    if (user) {
      let loadedProfile = getProfileFromLocalStorage();

      // Create default profile if none exists
      if (!loadedProfile) {
        loadedProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          goals: {
            calorieGoal: 2000,
            proteinGoal: 120,
            carbGoal: 250,
            fatGoal: 80,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        saveProfileToLocalStorage(loadedProfile);
      }

      setProfile(loadedProfile);
      setAge(loadedProfile.age?.toString() || '');
      setHeight(loadedProfile.height?.toString() || '');
      setTargetWeight(loadedProfile.targetWeight?.toString() || '');
      setCalorieGoal(loadedProfile.goals.calorieGoal.toString());
      setProteinGoal(loadedProfile.goals.proteinGoal.toString());
      setCarbGoal(loadedProfile.goals.carbGoal.toString());
      setFatGoal(loadedProfile.goals.fatGoal.toString());

      // Get latest bodyweight
      const latestWeight = getLatestBodyweightFromLocalStorage(user.uid);
      setCurrentWeight(latestWeight?.weight || null);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      age: age ? parseInt(age) : undefined,
      height: height ? parseInt(height) : undefined,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      goals: {
        calorieGoal: parseInt(calorieGoal) || 2000,
        proteinGoal: parseInt(proteinGoal) || 120,
        carbGoal: parseInt(carbGoal) || 250,
        fatGoal: parseInt(fatGoal) || 80,
      },
      updatedAt: new Date(),
    };

    saveProfileToLocalStorage(updatedProfile);
    setProfile(updatedProfile);

    // Try to sync to Firestore
    try {
      await saveUserProfileToFirestore(updatedProfile);
    } catch (error) {
      console.error('Failed to sync profile to Firestore:', error);
    }

    setIsEditingProfile(false);
  };

  const handleAddWeight = async () => {
    if (!user || !newWeight) return;

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue)) return;

    const bodyweightLog = {
      id: doc(collection(db, 'bodyweight')).id,
      userId: user.uid,
      timestamp: new Date(),
      weight: weightValue,
      synced: false,
    };

    saveBodyweightToLocalStorage(bodyweightLog);
    setCurrentWeight(weightValue);

    // Try to sync to Firestore
    try {
      await saveBodyweightToFirestore(bodyweightLog);
    } catch (error) {
      console.error('Failed to sync bodyweight to Firestore:', error);
    }

    setNewWeight('');
    setIsAddingWeight(false);
  };

  const userStats = {
    name: user?.displayName || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@example.com',
    totalWorkouts: 28,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-b-3xl">
        <h1 className="mb-2">Profile</h1>
        <p className="text-indigo-100">Manage your account and preferences</p>
      </div>

      <div className="px-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/api/placeholder/64/64" />
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold">{userStats.name}</h2>
                <p className="text-muted-foreground">{userStats.email}</p>
              </div>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{userStats.totalWorkouts}</p>
            <p className="text-muted-foreground">Total Workouts</p>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <p className="font-medium">{profile?.age || '-'} {profile?.age ? 'years' : ''}</p>
              </div>
              <div>
                <Label>Height</Label>
                <p className="font-medium">{profile?.height ? `${profile.height} cm` : '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Weight</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{currentWeight ? `${currentWeight} kg` : '-'}</p>
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingWeight(true)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Target Weight</Label>
                <p className="font-medium">{profile?.targetWeight ? `${profile.targetWeight} kg` : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Calories</Label>
              <p className="font-medium">{profile?.goals.calorieGoal || 2000} kcal</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Protein</Label>
                <p className="font-medium">{profile?.goals.proteinGoal || 120}g</p>
              </div>
              <div>
                <Label>Carbs</Label>
                <p className="font-medium">{profile?.goals.carbGoal || 250}g</p>
              </div>
              <div>
                <Label>Fat</Label>
                <p className="font-medium">{profile?.goals.fatGoal || 80}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 27"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 175"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="e.g., 70.5"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
              <Input
                id="calorieGoal"
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proteinGoal">Protein (g)</Label>
                <Input
                  id="proteinGoal"
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbGoal">Carbs (g)</Label>
                <Input
                  id="carbGoal"
                  type="number"
                  value={carbGoal}
                  onChange={(e) => setCarbGoal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatGoal">Fat (g)</Label>
                <Input
                  id="fatGoal"
                  type="number"
                  value={fatGoal}
                  onChange={(e) => setFatGoal(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Weight Dialog */}
      <Dialog open={isAddingWeight} onOpenChange={setIsAddingWeight}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Bodyweight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newWeight">Weight (kg)</Label>
              <Input
                id="newWeight"
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="e.g., 72.5"
                autoFocus
              />
            </div>

            <Button onClick={handleAddWeight} className="w-full">
              Save Weight
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}