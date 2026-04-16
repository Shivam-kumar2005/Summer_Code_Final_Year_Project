import React from 'react';
import { useTeachingState } from '../contexts/TeachingContext';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function TeachingPanel() {
  const {
    isActive, mode, isSpeaking, showContinueButton, userHasRun,
    stopTeaching, togglePause, isPaused, continueTeaching, explainLastTopic,
    startCodeExplanation
  } = useTeachingState();

  const [canExplainCode, setCanExplainCode] = React.useState(false);

  React.useEffect(() => {
    if (mode === 'WAITING_TO_TRY') {
      setCanExplainCode(false);
      const timer = setTimeout(() => setCanExplainCode(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const getStatusText = () => {
    switch (mode) {
      case 'EXPLAINING': return "Explaining the topic...";
      case 'EXPLAINING_CODE': return "Explaining the code...";
      case 'WAITING_TO_TRY': return "Try out this code!";
      case 'BOT_CODING': return "I am writing the code...";
      case 'AT_CODE_BLOCK': return showContinueButton ? "Your turn to try!" : "Wait for instruction";
      case 'USER_TRYING': return userHasRun ? "Great! Now run the code." : "Try editing then click Run!";
      default: return "Ready to start teaching!";
    }
  };

  return (
    <aside
      className={clsx(
        "fixed z-[100] flex flex-col transition-all duration-500 ease-in-out",
        "bottom-0 left-0 w-full h-[25vh] md:h-[calc(100vh-64px)] md:w-[260px] md:top-16 md:bottom-auto md:right-0 md:left-auto",
        isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      style={{
        transform: isActive 
          ? "translate(0)" 
          : (typeof window !== 'undefined' && window.innerWidth < 768) ? "translateY(110%)" : "translateX(110%)",
      }}
    >
      {/* Single unified container */}
      <div className="w-full flex-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.1)] md:shadow-none rounded-t-[2rem] md:rounded-t-none">

        {/* Header - even more compact */}
        <div className="px-6 py-1.5 md:pt-6 md:pb-5 border-b border-slate-100 dark:border-white/5 text-center shrink-0">
          <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-1.5 md:hidden" />
          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase select-none">
            Teaching Mode
          </span>
        </div>

        {/* Bot face section - centered row layout for mobile */}
        <div className="flex-1 flex flex-row md:flex-col items-center justify-center px-8 py-2 md:py-8 gap-6 md:gap-5 overflow-hidden">
          {/* Outer ring - tiny for mobile */}
          <div className="rounded-full p-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 shrink-0">
            <div className="relative w-12 h-12 md:w-32 md:h-32 rounded-full bg-slate-900 flex items-center justify-center shadow-inner">
              {/* Eyes */}
              <div className="flex gap-2 md:gap-6 absolute top-[34%]">
                <div className="w-0.5 md:w-[10px] h-2 md:h-6 rounded-full bg-blue-400" />
                <div className="w-0.5 md:w-[10px] h-2 md:h-6 rounded-full bg-blue-400" />
              </div>
              {/* Mouth dots */}
              <div className="absolute bottom-[27%] flex items-center gap-0.5 md:gap-1.5">
                {[0, 0.2, 0.4, 0.2, 0].map((delay, i) => (
                  <div
                    key={i}
                    className="w-0.5 md:w-1.5 h-0.5 md:h-1.5 rounded-full bg-blue-400/80"
                    style={{
                      animation: isSpeaking ? `dot-pulse 1.6s ease-in-out ${delay}s infinite` : 'none',
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status text - not flex-1 so it stays centered next to bot */}
          <p className="text-[11px] md:text-sm font-medium text-slate-600 dark:text-slate-300 text-left md:text-center leading-snug">
            "{getStatusText()}"
          </p>
        </div>

        {/* Controls - perfectly centered for mobile */}
        <div className="px-5 pb-5 pt-3 md:pt-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-col items-center justify-center gap-3">
          
          {/* Wait state */}
          {mode === 'AT_CODE_BLOCK' && !showContinueButton && (
            <div className="w-full py-2 bg-blue-600 text-white md:bg-slate-50 md:dark:bg-white/5 md:text-slate-500 font-semibold rounded-xl flex justify-center items-center gap-2 text-[10px] tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-white md:bg-blue-500 animate-pulse" />
              Your turn to try
            </div>
          )}

          {/* Unified Actions Row */}
          <div className="flex gap-3 h-10 md:h-12 w-full justify-center">
            {/* Context-aware primary button */}
            {mode === 'USER_TRYING' && userHasRun ? (
              <button
                onClick={continueTeaching}
                className="flex-1 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                Go Ahead <ChevronRight size={14} />
              </button>
            ) : (mode === 'AT_CODE_BLOCK' && showContinueButton) ? (
              <div className="flex gap-2 flex-1">
                <button
                  onClick={explainLastTopic}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  <RotateCcw size={12} /> Again
                </button>
                <button
                  onClick={continueTeaching}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            ) : (mode === 'WAITING_TO_TRY' || mode === 'AT_CODE_BLOCK') ? (
              <button
                onClick={startCodeExplanation}
                className="flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase transition-all bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 shadow-sm border-b-2 border-emerald-700"
              >
                Explain Code
              </button>
            ) : (
              <button
                onClick={togglePause}
                className={clsx(
                  "flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all active:scale-95",
                  isPaused
                    ? "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
                    : "bg-slate-900 dark:bg-blue-600 text-white shadow-sm"
                )}
              >
                {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}

            {/* Stop Button */}
            <button
              onClick={stopTeaching}
              className="w-10 md:w-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-red-50 transition-all group"
            >
              <div className="w-3 h-3 rounded-[2px] bg-slate-400 group-hover:bg-red-500" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
