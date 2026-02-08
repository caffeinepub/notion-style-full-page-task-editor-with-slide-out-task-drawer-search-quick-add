import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ProjectsOverview from './components/ProjectsOverview';
import HistoryPage from './components/HistoryPage';
import OverviewPage from './components/OverviewPage';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import InstallPrompt from './components/InstallPrompt';
import TaskPage from './components/TaskPage';
import TaskDrawer from './components/TaskDrawer';
import { Toaster } from './components/ui/sonner';

export type ViewMode = 'day' | 'week' | 'month';
export type AppSection = 'calendar' | 'projects' | 'history' | 'overview' | 'task';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeSection, setActiveSection] = useState<AppSection>('calendar');
  const [selectedTaskId, setSelectedTaskId] = useState<bigint | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Apply dark theme to html element
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const openTaskPage = (taskId: bigint) => {
    setSelectedTaskId(taskId);
    setActiveSection('task');
  };

  const closeTaskPage = () => {
    setSelectedTaskId(null);
    setActiveSection('calendar');
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <InstallPrompt />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
        <TaskDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onTaskSelect={openTaskPage}
        />
        {activeSection === 'task' && selectedTaskId ? (
          <TaskPage taskId={selectedTaskId} onClose={closeTaskPage} />
        ) : activeSection === 'calendar' ? (
          <MainContent
            viewMode={viewMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setViewMode={setViewMode}
            onTaskSelect={openTaskPage}
          />
        ) : activeSection === 'projects' ? (
          <ProjectsOverview onTaskSelect={openTaskPage} />
        ) : activeSection === 'overview' ? (
          <OverviewPage />
        ) : (
          <HistoryPage onTaskSelect={openTaskPage} />
        )}
      </div>
      {showProfileSetup && <ProfileSetupModal />}
      <InstallPrompt />
      <Toaster />
    </>
  );
}
