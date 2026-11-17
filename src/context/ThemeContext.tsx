import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isExpertMode: boolean;
  toggleMode: () => void;
  setMode: (expert: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme mode: light or dark
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('retailiq_theme');
    if (saved) return saved === 'dark';
    return false; // Default clean light mode with brand green accents
  });

  // Interface mode: Easy (Business Owner) or Expert (Data Analyst)
  const [isExpertMode, setIsExpertMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('retailiq_mode');
    return saved === 'expert';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('retailiq_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('retailiq_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('retailiq_mode', isExpertMode ? 'expert' : 'easy');
  }, [isExpertMode]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleMode = () => setIsExpertMode((prev) => !prev);
  const setMode = (expert: boolean) => setIsExpertMode(expert);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, isExpertMode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
