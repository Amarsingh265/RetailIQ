import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Sun,
  Moon,
  Sparkles,
  Info,
  CheckCircle2,
  LogOut,
  Save,
  Database,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const { isDark, toggleTheme, isExpertMode, toggleMode } = useTheme();
  const { datasetSummary, addNotification } = useData();

  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, department);
    setSavedSuccess(true);
    addNotification('Profile Updated', 'Your personal details have been saved successfully.', 'success');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addNotification('Password Changed', 'Security credentials updated.', 'success');
      setTimeout(() => setPasswordSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Account & Application Preferences
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Configure profile credentials, default analytical interfaces, and theme aesthetics
          </p>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Profile Card */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100">
            <User className="w-4 h-4 text-[#16A34A]" />
            <span>Profile Information</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Email (System Fixed)</label>
              <input
                type="text"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3 py-1.5 bg-neutral-100 dark:bg-[#0E1612] border border-neutral-200 dark:border-[#1E2922] rounded-md text-neutral-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Department / Business Unit</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile updated</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-1.5 bg-[#14532D] dark:bg-[#16A34A] text-white font-medium rounded-md hover:bg-[#1b6b3b] transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100">
            <Lock className="w-4 h-4 text-sky-500" />
            <span>Security & Password</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {passwordSuccess && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Password updated</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white font-medium rounded-md hover:bg-neutral-900 transition-colors"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Interface & Theme Selection */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Theme & Analytical Mode</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">Dark Appearance</div>
                <div className="text-[11px] text-neutral-400">Toggle high-contrast dark green canvas</div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-md font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#15201A]"
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">Expert Analyst Interface</div>
                <div className="text-[11px] text-neutral-400">Expose Elbow plots, ROC curves, and Gini importance</div>
              </div>
              <button
                onClick={toggleMode}
                className={`px-3 py-1.5 border rounded-md font-medium ${
                  isExpertMode
                    ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {isExpertMode ? 'Expert Active' : 'Business Active'}
              </button>
            </div>
          </div>
        </div>

        {/* About RetailIQ Academic Card */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>About RetailIQ (VTU Mini Project)</span>
          </div>

          <div className="space-y-2 text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
            <div>
              <strong>Project:</strong> Retail Customer Segmentation and Purchase Prediction Using Machine Learning
            </div>
            <div>
              <strong>Algorithms:</strong> K-Means Clustering with StandardScaler & RFM; Random Forest Classifier with Gini splits.
            </div>
            <div>
              <strong>Dataset:</strong> UCI Online Retail II Repository (Year 2009-2010 transactions).
            </div>
            <div className="pt-2 text-neutral-400 font-mono text-[10px]">
              Engineered for academic evaluation, viva presentation, and retail commercial decision support.
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of RetailIQ Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
