import { useState } from 'react';
import { BottomNavigation } from './components/bottom-navigation';
import { Dashboard } from './components/dashboard';
import { DietTracker } from './components/diet-tracker';
import { ExerciseTracker } from './components/exercise-tracker';
import { ProgressTracker } from './components/progress-tracker';
import { Profile } from './components/profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16">
        {renderContent()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}