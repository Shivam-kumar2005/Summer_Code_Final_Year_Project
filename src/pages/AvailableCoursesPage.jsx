import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, Sparkles, Layers, Cpu, MousePointer2 } from 'lucide-react';
import TopNav from '../components/TopNav';
import { API_URL } from '../config';

export default function AvailableCoursesPage() {
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/topics`)
      .then(r => r.json())
      .then(setTopics)
      .catch(console.error);

    fetch(`${API_URL}/api/lessons`)
      .then(r => r.json())
      .then(setLessons)
      .catch(console.error);
  }, []);

  const getFirstLessonSlug = (courseName) => {
    const courseLessons = lessons.filter(l => l.course === courseName);
    if (courseLessons.length > 0) {
      return courseLessons.sort((a, b) => (a.chapterOrder || 0) - (b.chapterOrder || 0))[0].slug;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-950 flex flex-col font-sans">
      <TopNav />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 w-full animate-entrance">
        <div className="flex flex-col gap-4 mb-20">
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tighter">Available Courses</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Coding ab Hinglish mein! Hamare courses ko explore karein aur apni interactive coding journey aaj hi shuru karein.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {topics.map((course) => {
            const Icon = { Code2, Layers, Cpu, MousePointer2, Sparkles }[course.icon] || Code2;
            const isActive = course.status === 'Active';
            const firstSlug = getFirstLessonSlug(course.name);

            return (
              <div
                key={course.id}
                className={`group p-10 rounded-[3rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[420px] transition-all hover:-translate-y-2 hover:shadow-2xl ${!isActive ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-10 transition-all group-hover:scale-110">
                    <Icon size={32} />
                  </div>
                  <span className={`absolute top-10 right-10 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${isActive ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'}`}>
                    {course.status}
                  </span>
                  <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-6 tracking-tighter leading-none">{course.name}</h2>
                  <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-10 mt-10 border-t border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    {lessons.filter(l => l.course === course.name).length} Chapters
                  </div>
                  {isActive && firstSlug ? (
                    <Link
                      to={`/lessons/${firstSlug}`}
                      className="w-12 h-12 rounded-full bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg active:scale-95"
                    >
                      <ArrowRight size={22} />
                    </Link>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <ArrowRight size={22} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200/60 dark:border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400 dark:text-slate-600 font-medium tracking-tight">
            &copy; 2026 SummerCode Platform.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs font-black text-slate-400 hover:text-slate-800 dark:text-slate-600 dark:hover:text-white uppercase tracking-widest">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
