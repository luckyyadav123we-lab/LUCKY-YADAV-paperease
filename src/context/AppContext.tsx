import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserTier, ConversionJob } from '../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & Routing
  currentPath: string;
  navigateTo: (path: string) => void;

  // User & Subscription
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  user: UserProfile;
  switchTier: (tier: UserTier) => void;
  recordOperation: (bytesProcessed: number) => boolean;

  // Jobs & History
  jobs: ConversionJob[];
  addJob: (job: ConversionJob) => void;
  updateJob: (id: string, updates: Partial<ConversionJob>) => void;
  clearHistory: () => void;
  deleteJob: (id: string) => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  pricingModalOpen: boolean;
  setPricingModalOpen: (open: boolean) => void;
  privacyModalOpen: boolean;
  setPrivacyModalOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Workspace throughput stats
  totalBytesProcessed: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: 'usr_free_guest',
  name: 'Alex Turner',
  email: 'alex@example.com',
  tier: 'free',
  operationsToday: 2,
  maxDailyOperations: 10,
  maxFileSizeMB: 25,
  joinedDate: 'October 2026',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Path navigation synced with window.location.pathname / hash
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || window.location.pathname.replace(/^\//, '') || 'home';
  });

  // Authentication state - on first visit, show 3D Interactive Login / Sign In
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('paperease_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const setAuthStatus = (val: boolean) => {
    setIsAuthenticated(val);
    if (val) {
      localStorage.setItem('paperease_authenticated', 'true');
    } else {
      localStorage.removeItem('paperease_authenticated');
    }
  };

  const loginUser = (email: string, name?: string) => {
    const defaultName = email.split('@')[0].replace(/[._-]/g, ' ') || 'Alex Turner';
    const formattedName = name?.trim() || defaultName;
    setUser((prev) => ({
      ...prev,
      email,
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
    }));
    setAuthStatus(true);
    showToast(`Welcome back, ${formattedName}!`, 'success');
  };

  const logoutUser = () => {
    setAuthStatus(false);
    showToast('Signed out of PaperEase.', 'info');
  };

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('paperease_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Job history
  const [jobs, setJobs] = useState<ConversionJob[]>(() => {
    try {
      const saved = localStorage.getItem('paperease_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [totalBytesProcessed, setTotalBytesProcessed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('paperease_bytes_total');
      return saved ? parseInt(saved, 10) : 18450000;
    } catch {
      return 18450000;
    }
  });

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync navigation
  const navigateTo = (path: string) => {
    const cleanPath = path.replace(/^\//, '') || 'home';
    setCurrentPath(cleanPath);
    window.location.hash = cleanPath === 'home' ? '' : cleanPath;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save user changes
  useEffect(() => {
    localStorage.setItem('paperease_user', JSON.stringify(user));
  }, [user]);

  // Save jobs changes
  useEffect(() => {
    // Only store serializable metadata to prevent storage overflow
    const serializable = jobs.slice(0, 30).map((j) => ({
      ...j,
      outputBlob: undefined,
      outputUrl: undefined,
    }));
    try {
      localStorage.setItem('paperease_jobs', JSON.stringify(serializable));
    } catch {
      // Ignore quota errors
    }
  }, [jobs]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchTier = (tier: UserTier) => {
    const limits = {
      free: { maxDailyOperations: 10, maxFileSizeMB: 25 },
      pro: { maxDailyOperations: 999999, maxFileSizeMB: 500 },
      business: { maxDailyOperations: 999999, maxFileSizeMB: 2048 },
    };

    setUser((prev) => ({
      ...prev,
      tier,
      maxDailyOperations: limits[tier].maxDailyOperations,
      maxFileSizeMB: limits[tier].maxFileSizeMB,
    }));

    showToast(`Switched plan to ${tier.toUpperCase()}! Limits updated immediately.`, 'success');
  };

  const recordOperation = (bytesProcessed: number): boolean => {
    if (user.tier === 'free' && user.operationsToday >= user.maxDailyOperations) {
      showToast('Daily free limit reached (10/10). Upgrade to Pro for unlimited operations.', 'error');
      setPricingModalOpen(true);
      return false;
    }

    setUser((prev) => ({
      ...prev,
      operationsToday: prev.operationsToday + 1,
    }));

    setTotalBytesProcessed((prev) => {
      const next = prev + bytesProcessed;
      localStorage.setItem('paperease_bytes_total', next.toString());
      return next;
    });

    return true;
  };

  const addJob = (job: ConversionJob) => {
    setJobs((prev) => [job, ...prev]);
  };

  const updateJob = (id: string, updates: Partial<ConversionJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    showToast('Job removed from history.', 'info');
  };

  const clearHistory = () => {
    setJobs([]);
    localStorage.removeItem('paperease_jobs');
    showToast('Conversion history cleared.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigateTo,
        isAuthenticated,
        setIsAuthenticated: setAuthStatus,
        loginUser,
        logoutUser,
        user,
        switchTier,
        recordOperation,
        jobs,
        addJob,
        updateJob,
        deleteJob,
        clearHistory,
        authModalOpen,
        setAuthModalOpen,
        pricingModalOpen,
        setPricingModalOpen,
        privacyModalOpen,
        setPrivacyModalOpen,
        toasts,
        showToast,
        removeToast,
        totalBytesProcessed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
