import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeachingState } from '../contexts/TeachingContext';
import TeachingHighlighter from '../components/TeachingHighlighter';
import CodeBlock from '../components/CodeBlock';
import { Play, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { API_URL } from '../config';

function KaraokeText({ text, isCurrentStep, isAdminMode }) {
  return (
    <span className={clsx(
      "transition-all duration-300 inline-block",
      isCurrentStep ? "scale-[1.02] origin-left" : "",
      isAdminMode && isCurrentStep ? "opacity-0 select-none" : ""
    )}>
      {text}
    </span>
  );
}

export default function LessonPage() {
  const { slug } = useParams();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    isActive, currentStep, isAdminMode,
    setIsSpeaking, mode, isPaused,
    setActiveLesson, continueTeaching, activeLesson, jumpToStep
  } = useTeachingState();

  const audioRef = useRef(null);

  // Auto-advance to the next block after audio ends.
  // Stops at code blocks so the user can try them.
  const autoAdvance = (block) => {
    if (!isActive) return;
    const nextIdx = currentStep + 1;
    if (!activeLesson || nextIdx >= activeLesson.blocks.length) return;
    const nextBlock = activeLesson.blocks[nextIdx];
    // Do not pause here. Let it continue to the code block so WAITING_TO_TRY starts.
    // Small delay so the highlight clears before moving
    setTimeout(() => continueTeaching(), 400);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/lessons`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/lessons/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setLesson(null);
        } else {
          setLesson(data);
          setActiveLesson(data);
        }
      })
      .catch(err => {
        console.error(err);
        setLesson(null);
      })
      .finally(() => setLoading(false));
  }, [slug, setActiveLesson]);

  const currentIdx = lessons.findIndex(l => l.slug === slug);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (!isActive || !lesson || (mode !== 'EXPLAINING' && mode !== 'EXPLAINING_CODE')) {
      setIsSpeaking(false);
      return;
    }

    const block = lesson.blocks[currentStep];
    if (!block?.teachingScript) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const script = block.teachingScript;
    let finalAudioUrl = script.audioUrl;
    if (!finalAudioUrl && script.uploadedName) {
      finalAudioUrl = `${API_URL}/audio/${script.uploadedName}`;
    }

    if (finalAudioUrl) {
      const audio = new Audio(finalAudioUrl);
      audioRef.current = audio;
      if (!isPaused) {
        audio.play().catch(() => {
          setTimeout(() => {
            if (audioRef.current === audio) {
              setIsSpeaking(false);
              autoAdvance(block);
            }
          }, script.duration || 3000);
        });
      }
      audio.addEventListener('ended', () => {
        setIsSpeaking(false);
        autoAdvance(block);
      });
      audio.addEventListener('error', () => setTimeout(() => setIsSpeaking(false), 2000));
    } else {
      const timer = setTimeout(() => {
        setIsSpeaking(false);
        autoAdvance(block);
      }, script.duration || 3500);
      return () => clearTimeout(timer);
    }
  }, [isActive, mode, currentStep, lesson, setIsSpeaking]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPaused) audio.pause();
    else if (isActive) audio.play().catch(() => { });
  }, [isPaused, isActive]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      setIsSpeaking(false);
    };
  }, [setIsSpeaking]);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, [isActive, setIsSpeaking]);

  if (loading && !lesson) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)] w-full max-w-5xl px-8 md:px-16 py-24 animate-pulse gap-6">
        <div className="h-16 w-20 bg-emerald-50 rounded-3xl" />
        <div className="h-12 w-3/4 bg-slate-50 rounded-3xl" />
      </div>
    );
  }

  if ((!lesson || !lesson.blocks) && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Lesson Not Found</h2>
        <p className="text-slate-500 max-w-sm font-medium mb-8">
          The requested lesson could not be loaded from the database. It might be missing or still migrating.
        </p>
        <Link to="/" className="text-blue-601 font-black uppercase tracking-widest text-[10px] bg-slate-100 px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12 md:p-12 md:pt-16 lg:p-16 lg:pt-20 relative font-sans animate-entrance w-full">
      <div className="flex-1 relative z-10 w-full">
        {isAdminMode && (
          <div className="fixed top-0 left-0 right-0 bg-red-600/90 text-white font-black text-center py-2 text-[10px] tracking-[0.4em] z-[100] shadow-2xl uppercase">
            Admin Preview Active
          </div>
        )}

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col">
            <span className="text-blue-600 font-bold tracking-widest text-[10px] uppercase mb-2">
              CHAPTER {String(lesson.chapterOrder || (currentIdx + 1)).padStart(2, '0')}
            </span>

            {lesson.blocks[0] && (
              <TeachingHighlighter stepIndex={0} noIndicator={true}>
                <h1
                  className={clsx(
                    "text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] drop-shadow-sm transition-all duration-300",
                    (isActive && currentStep === 0) ? "text-blue-600 dark:text-blue-400 scale-[1.01] origin-left" : "",
                    (isActive && currentStep !== 0) && "cursor-pointer hover:opacity-70"
                  )}
                  onClick={() => isActive && currentStep !== 0 && jumpToStep(0)}
                >
                  {isAdminMode && (isActive && currentStep === 0) ? lesson.blocks[0].teachingScript?.transcript : lesson.blocks[0].visibleText}
                </h1>
              </TeachingHighlighter>
            )}
          </div>
        </header>

        {/* Content Blocks */}
        <div className="space-y-8">
          {lesson.blocks.slice(1).map((block, idx) => {
            const actualStep = idx + 1;
            const isCurrentBlock = isActive && currentStep === actualStep;

            const blockLayoutClass = clsx(
              "transition-all duration-500",
              isCurrentBlock ? "scale-[1.01] origin-left" : ""
            );

            if (block.type === 'code') {
              return (
                <div
                  key={block.id}
                  className={clsx(blockLayoutClass, isActive && currentStep !== actualStep && "cursor-pointer opacity-90 hover:opacity-100")}
                  onClick={() => isActive && currentStep !== actualStep && jumpToStep(actualStep)}
                >
                  <TeachingHighlighter stepIndex={actualStep} hasCodeBlock={true}>
                    <CodeBlock
                      visibleText={block.visibleText}
                      language={block.language || 'html'}
                      stepIndex={actualStep}
                      audioDuration={block.teachingScript?.duration}
                    />
                  </TeachingHighlighter>
                </div>
              );
            }

            return (
              <div
                key={block.id}
                className={clsx(blockLayoutClass, isActive && currentStep !== actualStep && "cursor-pointer hover:opacity-70")}
                onClick={() => isActive && currentStep !== actualStep && jumpToStep(actualStep)}
              >
                <TeachingHighlighter stepIndex={actualStep} hasCodeBlock={false}>
                  <p className={clsx(
                    "text-lg leading-relaxed transition-all duration-300 w-full md:max-w-2xl",
                    isCurrentBlock
                      ? "text-slate-900 dark:text-white font-semibold italic"
                      : "text-slate-600 dark:text-slate-400 italic"
                  )}>
                    {isAdminMode && isCurrentBlock
                      ? <span className="font-bold text-red-600 dark:text-red-400 border-b-4 border-red-100 dark:border-red-900/40 pb-1">{block.teachingScript?.transcript}</span>
                      : <KaraokeText text={block.visibleText} isCurrentStep={isCurrentBlock} isAdminMode={isAdminMode} />
                    }
                  </p>
                </TeachingHighlighter>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="relative z-10 mt-20 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 pb-12 transition-all duration-300">
        <div className="flex-1 w-full md:w-auto">
          {prevLesson ? (
            <Link
              to={`/lessons/${prevLesson.slug}`}
              className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-slate-300 dark:group-hover:border-white/20">
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm font-semibold">{prevLesson.title}</span>
            </Link>
          ) : (
            <div className="h-1" />
          )}
        </div>

        <div className="flex-1 flex justify-end w-full md:w-auto">
          {nextLesson ? (
            <Link
              to={`/lessons/${nextLesson.slug}`}
              className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group flex-row-reverse"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-slate-300 dark:group-hover:border-white/20">
                <ArrowRight size={16} />
              </div>
              <span className="text-sm font-semibold">{nextLesson.title}</span>
            </Link>
          ) : (
            <div className="text-sm font-semibold text-slate-400 dark:text-slate-600">End of Course</div>
          )}
        </div>
      </div>

    </div>
  );
}
