import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/auth/AuthScreen';
import { BottomNavigation } from './components/bottom-navigation';
import { Dashboard } from './components/dashboard';
import { DietTracker } from './components/diet-tracker';
import { ExerciseTracker } from './components/exercise-tracker';
import { ProgressTracker } from './components/progress-tracker';
import { Profile } from './components/profile';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'diet':
        return <DietTracker />;
      case 'exercise':
        return <ExerciseTracker />;
      case 'progress':
        return <ProgressTracker />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-[430px] w-full mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-[430px] w-full mx-auto">
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[430px] w-full bg-background shadow-xl">
        <main className="pb-16">
          {renderContent()}
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}