import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SegmentationPage } from './components/segmentation/SegmentationPage';
import { PredictionPage } from './components/prediction/PredictionPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { RecommendationsPage } from './components/recommendations/RecommendationsPage';
import { EvaluationPage } from './components/evaluation/EvaluationPage';
import { DatasetPage } from './components/dataset/DatasetPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { LandingPage } from './components/landing/LandingPage';
import { VivaGuideModal } from './components/viva/VivaGuideModal';
import { Menu } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { isExpertMode } = useTheme();
  const [activeKey, setActiveKey] = useState<NavItemKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVivaOpen, setIsVivaOpen] = useState(false);
  const [selectedCustomerIdForPrediction, setSelectedCustomerIdForPrediction] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isExpertMode && activeKey === 'evaluation') {
      setActiveKey('dashboard');
    }
  }, [activeKey, isExpertMode]);

  const handleSearchSelectCustomer = (customerId: string) => {
    setSelectedCustomerIdForPrediction(customerId);
    setActiveKey('prediction');
  };

  // If user chooses Landing Page showcase
  if (activeKey === 'landing') {
    return (
      <>
        <LandingPage
          onLaunchApp={() => setActiveKey('dashboard')}
          onOpenViva={() => setIsVivaOpen(true)}
        />
        <VivaGuideModal isOpen={isVivaOpen} onClose={() => setIsVivaOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#0A120E] text-[#17211B] dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-150">
      {/* Top Navigation */}
      <Navbar
        onSearchSelectCustomer={handleSearchSelectCustomer}
      />

      <div className="flex-1 flex">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeKey={activeKey}
          onSelectKey={(key) => setActiveKey(key)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Mobile menu toggle bar */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white dark:bg-[#121B16] border border-neutral-200 dark:border-[#22332A] rounded-lg text-neutral-800 dark:text-neutral-200"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-medium text-[#16A34A] capitalize">
              {activeKey.replace('-', ' ')}
            </span>
          </div>

          {/* Active View Router */}
          {activeKey === 'dashboard' && <DashboardPage onNavigateTo={(page) => setActiveKey(page)} />}
          {activeKey === 'segmentation' && <SegmentationPage />}
          {activeKey === 'prediction' && (
            <PredictionPage initialCustomerId={selectedCustomerIdForPrediction} />
          )}
          {activeKey === 'analytics' && <AnalyticsPage />}
          {activeKey === 'recommendations' && (
            <RecommendationsPage onNavigateTo={(page) => setActiveKey(page)} />
          )}
          {activeKey === 'evaluation' && <EvaluationPage />}
          {activeKey === 'dataset' && <DatasetPage />}
          {activeKey === 'reports' && <ReportsPage />}
          {activeKey === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* VTU Engineering Mini Project Viva Guide Modal */}
      <VivaGuideModal isOpen={isVivaOpen} onClose={() => setIsVivaOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
