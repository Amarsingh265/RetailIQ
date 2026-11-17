import React from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  FileSpreadsheet,
  Download,
  Settings,
  Database,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

export type NavItemKey =
  | 'dashboard'
  | 'segmentation'
  | 'prediction'
  | 'analytics'
  | 'recommendations'
  | 'evaluation'
  | 'dataset'
  | 'reports'
  | 'settings'
  | 'landing';

interface SidebarProps {
  activeKey: NavItemKey;
  onSelectKey: (key: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeKey,
  onSelectKey,
  isOpenMobile,
  onCloseMobile
}) => {
  const { isExpertMode } = useTheme();
  const { datasetSummary } = useData();

  const navItems: {
    key: NavItemKey;
    label: string;
    icon: any;
    badge?: string;
    expertOnly?: boolean;
  }[] = [
    { key: 'dashboard', label: isExpertMode ? 'Executive Dashboard' : 'Overview', icon: LayoutDashboard },
    { key: 'segmentation', label: isExpertMode ? 'Customer Segments' : 'Customer Groups', icon: Users },
    { key: 'prediction', label: 'Purchase Prediction', icon: TrendingUp },
    { key: 'analytics', label: isExpertMode ? 'Advanced Analytics' : 'Sales Insights', icon: Zap },
    { key: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { key: 'evaluation', label: 'Model Evaluation', icon: BrainCircuit, badge: 'Expert', expertOnly: true },
    { key: 'dataset', label: isExpertMode ? 'Dataset Manager' : 'Data & Uploads', icon: FileSpreadsheet },
    { key: 'reports', label: isExpertMode ? 'Reports & Export' : 'Reports', icon: Download },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'landing', label: 'Project Showcase', icon: ExternalLink, expertOnly: true }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-[#0E1612] border-r border-[#E5E7EB] dark:border-[#1E2922] flex flex-col justify-between transition-transform duration-200 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Mobile close banner */}
          <div className="lg:hidden flex items-center justify-between px-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Navigation Menu
            </span>
            <button
              onClick={onCloseMobile}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs px-2 py-1"
            >
              Close
            </button>
          </div>

          {/* Section: Analytics Suite */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              {isExpertMode ? 'Retail Intelligence' : 'Business tools'}
            </div>
            <nav className="space-y-0.5">
              {navItems.filter((item) => !item.expertOnly || isExpertMode).map((item) => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectKey(item.key);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-[#14532D] text-white dark:bg-[#16A34A] dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#15201A] hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dataset Status Banner in Sidebar footer */}
        <div className="p-3 border-t border-[#E5E7EB] dark:border-[#1E2922] bg-[#F5F7F5]/50 dark:bg-[#121B16]/50">
          <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 mb-1">
            <Database className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="font-medium truncate">{datasetSummary?.name || 'Sample sales data'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>{datasetSummary ? `${datasetSummary.uniqueCustomers} Customers` : 'Ready'}</span>
            <span>{datasetSummary ? `£${(datasetSummary.totalRevenue / 1000).toFixed(1)}k rev` : ''}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
