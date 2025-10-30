import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'login'
              ? 'Sign in to your FitTracker account to continue your health journey'
              : 'Start tracking your diet and exercise today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
