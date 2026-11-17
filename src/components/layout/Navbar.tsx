import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Search,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  Briefcase,
  BarChart2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onSearchSelectCustomer?: (customerId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSelectCustomer }) => {
  const { currentUser, loginAsDemo, logout } = useAuth();
  const { isDark, toggleTheme, isExpertMode, toggleMode } = useTheme();
  const { notifications, markNotificationRead, clearNotifications, customers } = useData();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name?: string; segment?: string }[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const matches = customers
      .filter((c) => c.customerId.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5)
      .map((c) => ({
        id: c.customerId,
        segment: c.segmentName || 'Customer'
      }));
    setSearchResults(matches);
  };

  const roleColors: Record<UserRole, { badge: string; text: string; icon: any }> = {
    retailer: {
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'Retailer (Business Owner)',
      icon: Briefcase
    },
    analyst: {
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      text: 'Data Analyst',
      icon: BarChart2
    },
    admin: {
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Administrator',
      icon: Shield
    }
  };

  const currentRoleConfig = currentUser ? roleColors[currentUser.role] : roleColors.retailer;
  const RoleIcon = currentRoleConfig.icon;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#0F1713]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1E2922] px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Brand Identity & Mode Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="#/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#14532D] dark:bg-[#16A34A] flex items-center justify-center text-white font-bold text-base shadow-sm">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#17211B] dark:text-[#F1F5F9] leading-none">
              RetailIQ
            </span>
            <span className="text-[10px] font-medium text-[#16A34A] tracking-wider uppercase mt-0.5">
              Smart Analytics
            </span>
          </div>
        </a>

        <div className="hidden sm:block h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1" />

        {/* Switch between simple and expert views */}
        <button
          onClick={toggleMode}
          title={isExpertMode ? 'Switch to the simple business view' : 'Show expert tools'}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
            isExpertMode
              ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isExpertMode ? 'Simple business view' : 'Expert tools'}</span>
        </button>
      </div>

      {/* Middle: Fast Customer Search Bar */}
      <div className="relative flex-1 max-w-xs md:max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search Customer ID (e.g. 13085)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F7F5] dark:bg-[#15201A] border border-[#E5E7EB] dark:border-[#22332A] rounded-lg text-[#17211B] dark:text-[#E2E8F0] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#16A34A] transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg shadow-lg z-50 overflow-hidden py-1">
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  if (onSearchSelectCustomer) onSearchSelectCustomer(r.id);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-[#1E2E25] flex items-center justify-between transition-colors"
              >
                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  Customer #{r.id}
                </span>
                <span className="text-[11px] text-[#16A34A]">{r.segment}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Role Switcher, Theme, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${currentRoleConfig.badge}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{currentUser?.role.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-[#22332A]">
                Preview as
              </div>
              <button
                onClick={() => {
                  loginAsDemo('retailer');
                  setShowRoleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-[#1E2E25] flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-medium text-neutral-800 dark:text-neutral-200">Business owner</div>
                  <div className="text-[10px] text-neutral-400">Sales and customer overview</div>
                </div>
              </button>
              <button
                onClick={() => {
                  loginAsDemo('analyst');
                  setShowRoleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-[#1E2E25] flex items-center gap-2"
              >
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="font-medium text-neutral-800 dark:text-neutral-200">Data Analyst</div>
                  <div className="text-[10px] text-neutral-400">Analysis and model details</div>
                </div>
              </button>
              <button
                onClick={() => {
                  loginAsDemo('admin');
                  setShowRoleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-[#1E2E25] flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-medium text-neutral-800 dark:text-neutral-200">Administrator</div>
                  <div className="text-[10px] text-neutral-400">User and system settings</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg border border-[#E5E7EB] dark:border-[#22332A] hover:bg-neutral-50 dark:hover:bg-[#15201A] transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg border border-[#E5E7EB] dark:border-[#22332A] hover:bg-neutral-50 dark:hover:bg-[#15201A] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#16A34A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-neutral-100 dark:border-[#22332A]">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100 dark:divide-[#22332A]">
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-neutral-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        n.read ? 'opacity-60' : 'bg-emerald-50/50 dark:bg-emerald-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {n.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                        <span>{n.title}</span>
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-0.5">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1">{n.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Capsule */}
        <div className="flex items-center gap-2 pl-1 border-l border-neutral-200 dark:border-neutral-800">
          <div className="w-7 h-7 rounded-full bg-[#14532D] text-white font-semibold text-xs flex items-center justify-center">
            {currentUser?.name.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {currentUser?.name || 'User'}
            </div>
            <div className="text-[10px] text-neutral-400 capitalize">
              {currentUser?.role || 'Guest'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
