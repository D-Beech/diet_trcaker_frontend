import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, Settings, Target, Bell, Moon, Smartphone, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const userStats = {
    name: user?.displayName || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@example.com',
    age: 27,
    height: '182cm',
    currentWeight: 72,
    targetWeight: 170,
    activityLevel: 'Moderately Active',
    joinDate: 'January 2024',
    totalWorkouts: 28,
    streakDays: 14,
    calorieGoal: 2000,
    proteinGoal: 120,
    carbGoal: 250,
    fatGoal: 80
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
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Member since {userStats.joinDate}</Badge>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{userStats.streakDays}</p>
              <p className="text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{userStats.totalWorkouts}</p>
              <p className="text-muted-foreground">Total Workouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <p className="font-medium">{userStats.age} years</p>
              </div>
              <div>
                <Label>Height</Label>
                <p className="font-medium">{userStats.height}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Weight</Label>
                <p className="font-medium">{userStats.currentWeight} kg</p>
              </div>
              <div>
                <Label>Target Weight</Label>
                <p className="font-medium">{userStats.targetWeight} kg</p>
              </div>
            </div>

            <div>
              <Label>Activity Level</Label>
              <p className="font-medium">{userStats.activityLevel}</p>
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
              <Label htmlFor="calories">Calories</Label>
              <Input id="calories" value={userStats.calorieGoal} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input id="protein" value={userStats.proteinGoal} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input id="carbs" value={userStats.carbGoal} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input id="fat" value={userStats.fatGoal} />
              </div>
            </div>

            <Button className="w-full">Update Goals</Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Meal and workout reminders</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sync with Health Apps</p>
                  <p className="text-sm text-muted-foreground">Connect with Apple Health or Google Fit</p>
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            
            <Separator />

            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}