import React from 'react';
import { useTeachingState } from '../contexts/TeachingContext';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import TeachingPanel from './TeachingPanel';
import clsx from 'clsx';
import { Play, ChevronRight, Menu } from 'lucide-react';

export default function MainLayout({ children }) {
  const { isActive, startTeaching, activeLesson, isSidebarOpen, setIsSidebarOpen } = useTeachingState();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Right swipe to open (from anywhere near left edge)
    if (isRightSwipe && !isSidebarOpen && touchStart < 100) {
      setIsSidebarOpen(true);
    }
    // Left swipe to close
    if (isLeftSwipe && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div 
      className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <TopNav />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
        
        {/* Mobile Sidebar Reveal Trigger */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed left-0 top-[20%] w-3 h-20 bg-blue-600 dark:bg-blue-500 rounded-r-2xl z-40 shadow-[4px_0_15px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center transition-all active:w-6 active:bg-blue-700"
            aria-label="Toggle Sidebar"
          >
            <div className="w-1 h-8 bg-white/50 rounded-full" />
          </button>
        )}
        
        <main className={clsx(
          "flex-1 overflow-y-auto w-full transition-all duration-500 bg-slate-50 dark:bg-slate-950",
          "pl-0",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64",
          "md:pr-[260px]"
        )}>
          {children}
        </main>
        
        {/* The Teaching Panel */}
        <TeachingPanel />

        {/* Mobile FAB to start teaching when not active */}
        {!isActive && activeLesson && (
          <button
            onClick={() => startTeaching(activeLesson)}
            className="md:hidden fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full px-4 py-2.5 shadow-2xl z-40 animate-pulse flex items-center gap-2 font-bold text-[11px] tracking-wider uppercase border-b-2 border-blue-800"
          >
            <Play fill="currentColor" size={14} />
            Teach
          </button>
        )}
      </div>
    </div>
  );
}
