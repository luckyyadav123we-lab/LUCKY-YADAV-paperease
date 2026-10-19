import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { ToolWorkspace } from './components/ToolWorkspace';
import { HistoryDashboard } from './components/HistoryDashboard';
import { HowItWorksSection, WhyPaperEaseSection, FAQSection } from './components/HomeSections';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Interactive3DAuth } from './components/Interactive3DAuth';
import { Toasts } from './components/Toasts';
import { Footer } from './components/Footer';
import { TOOLS } from './data/tools';

const MainContent: React.FC = () => {
  const { currentPath, navigateTo, isAuthenticated } = useApp();
  const [presetFile, setPresetFile] = useState<File | null>(null);

  // If user is not yet logged in on first visit, present the 3D Interactive Sign In & Login gateway
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Interactive3DAuth />
        <Toasts />
      </div>
    );
  }

  // Direct file drop handler on hero
  const handleDirectFileDropped = (file: File) => {
    setPresetFile(file);
    const ext = file.name.split('.').pop()?.toLowerCase();

    // Smart routing based on file extension
    if (ext === 'pdf') {
      navigateTo('merge-pdf');
    } else if (ext === 'png') {
      navigateTo('png-to-jpg');
    } else if (ext === 'jpg' || ext === 'jpeg') {
      navigateTo('jpg-to-pdf');
    } else if (ext === 'docx' || ext === 'txt') {
      navigateTo('word-to-pdf');
    } else if (ext === 'csv') {
      navigateTo('csv-to-xlsx');
    } else if (ext === 'xlsx' || ext === 'xls') {
      navigateTo('xlsx-to-csv');
    } else {
      navigateTo('compress-image');
    }
  };

  // Check if current path matches a tool
  const currentTool = TOOLS.find((t) => t.slug === currentPath);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      <Header />

      <main className="flex-1">
        {currentPath === 'home' && (
          <>
            <Hero onDirectFileDropped={handleDirectFileDropped} />
            <ToolGrid initialFilter="popular" />
            <HowItWorksSection />
            <WhyPaperEaseSection />
            <FAQSection />
          </>
        )}

        {currentPath === 'history' && <HistoryDashboard />}

        {currentTool && (
          <ToolWorkspace tool={currentTool} presetFile={presetFile} />
        )}

        {/* Fallback if route not recognized */}
        {!currentTool && currentPath !== 'home' && currentPath !== 'history' && (
          <div className="py-20 text-center max-w-md mx-auto px-4">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Tool Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">
              The requested conversion pipeline or route does not exist.
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl"
            >
              Return to All Tools
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Global Modals & Notifications */}
      <PricingModal />
      <AuthModal />
      <PrivacyModal />
      <Toasts />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
