import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-twilight.css'; // Good dark theme
import { RotateCcw, Play } from 'lucide-react';
import { useTeachingState } from '../contexts/TeachingContext';

export default function CodeBlock({ visibleText, language, stepIndex, audioDuration }) {
  const [code, setCode] = useState(visibleText || '');
  const [output, setOutput] = useState(visibleText || '');
  const [hasRun, setHasRun] = useState(true);

  const {
    isActive, mode, currentStep, showContinueButton, setShowContinueButton,
    userHasRun, setUserHasRun, setMode, isPaused
  } = useTeachingState();

  // Sync state if prop changes
  useEffect(() => {
    setCode(visibleText || '');
    setOutput(visibleText || '');
  }, [visibleText]);

  const isCurrentBlock = isActive && currentStep === stepIndex;
  const isReadOnly = (isCurrentBlock && (mode === 'BOT_CODING' || mode === 'EXPLAINING' || mode === 'EXPLAINING_CODE')) || (!isCurrentBlock && isActive);

  // Initialize output
  useEffect(() => {
    setOutput(visibleText);
  }, [visibleText]);

  const typingState = useRef({ index: 0, text: '' });

  // Reset typing state when entering a new code block explanation
  useEffect(() => {
    if (isCurrentBlock && mode === 'EXPLAINING_CODE') {
      typingState.current = { index: 0, text: '' };
      setCode('');
    }
  }, [isCurrentBlock, mode]);

  // Handle Bot Typing Simulation Resumption & Execution
  useEffect(() => {
    let timeoutId;
    let isTypingActive = true;

    if (isCurrentBlock && mode === 'EXPLAINING_CODE' && !isPaused) {
      const sourceText = visibleText || '';
      const chars = sourceText.split('');

      let msPerChar = 30;
      if (audioDuration && chars.length > 0) {
        // Reserve 500ms safety buffer so it comfortably finishes just before audio ends
        const targetMs = Math.max(500, audioDuration - 500);
        msPerChar = Math.max(5, Math.floor(targetMs / chars.length));
      }

      const typeNextChar = () => {
        if (!isTypingActive) return;

        const state = typingState.current;
        if (state.index < chars.length) {
          state.text += chars[state.index] || '';
          setCode(state.text);
          setOutput(state.text); // Dynamically update preview while typing
          state.index++;
          timeoutId = setTimeout(typeNextChar, msPerChar);
        } else {
          // Done typing
          setOutput(sourceText);
        }
      };

      // If we are starting fresh, wait 500ms. If resuming from pause, start immediately.
      timeoutId = setTimeout(typeNextChar, typingState.current.index === 0 ? 500 : msPerChar);
    }

    return () => {
      isTypingActive = false;
      clearTimeout(timeoutId);
    };
  }, [isCurrentBlock, mode, visibleText, isPaused, audioDuration]);

  // Handle "Go Ahead" Timer visibility
  useEffect(() => {
    if (isCurrentBlock && mode === 'AT_CODE_BLOCK' && !isPaused) {
      const btnTimer = setTimeout(() => setShowContinueButton(true), 5000);
      return () => clearTimeout(btnTimer);
    }
    if (mode !== 'AT_CODE_BLOCK') {
      setShowContinueButton(false);
    }
  }, [isCurrentBlock, mode, isPaused, setShowContinueButton]);

  const handleRun = () => {
    setOutput(code);
    setHasRun(true);
    if (isCurrentBlock && mode === 'AT_CODE_BLOCK') {
      setMode('USER_TRYING');
      setUserHasRun(true);
    } else if (isCurrentBlock && mode === 'USER_TRYING') {
      setUserHasRun(true);
    }
  };

  const handleReset = () => {
    setCode(visibleText);
    setOutput(visibleText);
  };

  const highlightWithPrism = (codeStr) => {
    const lg = Prism.languages[language] || Prism.languages.markup;
    return Prism.highlight(codeStr, lg, language);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-0 rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none my-10 w-full transition-shadow duration-500">
      {/* Editor Side */}
      <div className="bg-[#0f172a] flex flex-col min-w-0 border-r border-slate-800">
        <div className="h-12 bg-[#0f172a] flex items-center px-4 justify-between border-b border-slate-800">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">EDITOR.{language}</span>
          <button onClick={handleReset} title="Reset Code" className="text-slate-500 hover:text-white transition-colors">
            <RotateCcw size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 text-sm font-mono relative group text-blue-300 min-h-[300px]">
          {isReadOnly && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
          {React.createElement(Editor.default || Editor, {
            value: code,
            onValueChange: c => {
              setCode(c);
              if (isCurrentBlock && mode === 'AT_CODE_BLOCK') setMode('USER_TRYING');
            },
            highlight: highlightWithPrism,
            padding: 0,
            textareaClassName: "focus:outline-none",
            style: {
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              lineHeight: 1.6,
            },
            readOnly: isReadOnly,
            className: "text-blue-300 w-full h-full",
            placeholder: `Write some ${language} code...`
          })}
        </div>
      </div>

      {/* Preview Side */}
      <div className="bg-white dark:bg-[#1e293b] flex flex-col min-w-0 transition-colors duration-500">
        <div className="h-12 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-4 bg-white dark:bg-[#1e293b]">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Preview
          </div>
          <button
            onClick={handleRun}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <Play size={12} fill="currentColor" /> RUN CODE
          </button>
        </div>
        <div className="flex-1 p-6 relative bg-white dark:bg-white/5">
          {!hasRun ? (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              Waiting for execution...
            </div>
          ) : (
            <iframe
              srcDoc={`
                 <html>
                   <head>
                     <style>
                       body { 
                         margin: 0; 
                         padding: 0; 
                         color: ${window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f1f5f9' : '#0f172a'}; 
                         font-family: system-ui, -apple-system, sans-serif;
                         background: transparent;
                       }
                     </style>
                   </head>
                   <body>${output}</body>
                 </html>
               `}
              title="preview"
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
