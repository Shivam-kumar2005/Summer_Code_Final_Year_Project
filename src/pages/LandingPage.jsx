import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, Layers, Cpu, Mic2, MousePointer2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import CodeBlock from '../components/CodeBlock';
import TopNav from '../components/TopNav';
import { API_URL } from '../config';

export default function LandingPage() {
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/topics`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTopics(data);
        else setTopics([]);
      })
      .catch(console.error);

    fetch(`${API_URL}/api/lessons`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setLessons(data);
        else setLessons([]);
      })
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
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-slate-950 relative overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-200">

      {/* Nebula Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-200/30 dark:bg-blue-800/20 blur-[140px] rounded-full animate-slow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/30 dark:bg-purple-900/20 blur-[140px] rounded-full" />
        <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-blue-200/20 dark:bg-blue-900/20 blur-[100px] rounded-full animate-float" />
      </div>

      <TopNav />

      {/* Floating Hero Section */}
      <main className="relative z-10 pt-56 pb-20 px-6 flex flex-col items-center text-center">

        <h1 className="text-6xl md:text-8xl font-black text-slate-800 dark:text-white tracking-tighter leading-[0.95] mb-10 max-w-5xl animate-entrance drop-shadow-sm">
          Coding Seekho <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 dark:from-blue-400 dark:via-blue-500 dark:to-blue-400 drop-shadow-sm">Hinglish Mein.</span>
        </h1>

        <p className="text-[10px] md:text-[11px] text-slate-600 dark:text-slate-400 max-w-3xl mb-16 font-black leading-relaxed tracking-[0.4em] animate-entrance uppercase">
          INTERACTIVE GUIDED TEACHING KA EXPERIENCE LEIN
        </p>

        <div className="flex flex-col md:flex-row gap-8 animate-entrance mb-32">
          <Link to="/lessons/html-introduction" className="group bg-slate-800 dark:bg-blue-500 text-white dark:text-[#0f172a] px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-lg dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 active:scale-95">
            Free Mein Seekhna Shuru Karein
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="bg-white dark:bg-transparent text-slate-700 dark:text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95 shadow-sm">
            Syllabus Dekhein
          </button>
        </div>

        {/* Floating Content Elements Animation */}
        <div className="absolute top-[20%] left-[10%] opacity-20 animate-float" style={{ animationDelay: '0s' }}>
          <div className="text-4xl text-blue-600 font-mono">{"{ }"}</div>
        </div>
        <div className="absolute top-[40%] right-[10%] opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <div className="text-5xl text-purple-600 font-mono">{"<div />"}</div>
        </div>
        <div className="absolute bottom-[10%] left-[20%] opacity-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="text-3xl text-blue-600 font-mono">{"[ ]"}</div>
        </div>
      </main>

      {/* Feature Strip - Floating Glass Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-32 mb-40 animate-entrance">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter mb-4 translate-y-0 group">Guided Teaching</h2>
          <div className="h-1.5 w-16 bg-blue-500 mx-auto rounded-full shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Har Line Ki Clarity",
              desc: "Code ka har ek line pure Hinglish mein samjhaya gaya hai—koi logic nahi chhutega.",
              icon: <Mic2 size={24} />,
              accent: "blue"
            },
            {
              title: "Lecture Mode",
              desc: "Pure content ko ek lecture ki tarah dekhein. Hamara highlighter mentor ki awaaz ko automatically follow karta hai.",
              icon: <MousePointer2 size={24} />,
              accent: "blue"
            },
            {
              title: "Khud Try Karke Dekhein",
              desc: "Kisi aur editor mein jaane ki zaroorat nahi. Browser mein hi code likhein, edit karein aur run karein.",
              icon: <Code2 size={24} />,
              accent: "blue"
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-panel bg-white/70 dark:bg-[#1e293b]/50 group p-10 rounded-[2.5rem] flex flex-col items-center text-center hover:border-slate-300 dark:hover:border-white/20 duration-500">
              <div className={clsx(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transition-all duration-700 shadow-sm",
                "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300"
              )}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-5">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[280px] opacity-80 group-hover:opacity-100 transition-opacity">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Try It Yourself Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 mb-32 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 text-center lg:text-left lg:pl-10">
          <h2 className="text-7xl md:text-8xl font-black text-slate-800 dark:text-white tracking-tighter mb-6">HTML</h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Web pages banane ki number one language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link to="/lessons/html-introduction" className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-10 py-4 rounded-full text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-95 text-center">
              HTML Seekhein
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-[60%] pointer-events-auto lg:pr-10 relative">
          <div className="bg-slate-100 dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-xl border border-slate-200 dark:border-slate-700 relative">
            <div className="text-slate-800 dark:text-slate-200 font-bold mb-4 text-lg">
              HTML Example:
            </div>
            <div className="-mt-6 -mb-6 pointer-events-auto relative z-10">
              <CodeBlock
                language="markup"
                visibleText={`<!DOCTYPE html>\n<html>\n<head>\n  <title>HTML Tutorial</title>\n</head>\n<body>\n\n  <h1>Mera Pehla Heading</h1>\n  <p>Yeh ek paragraph hai.</p>\n\n  <p style="color: blue; font-weight: bold;">\n    Mujhe edit karein aur RUN CODE par click karein!\n  </p>\n\n</body>\n</html>`}
                stepIndex={-1}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog - High Elevation Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-64">
        <div className="flex items-end justify-between mb-24 gap-8">
          <div className="flex flex-col gap-4">
            <Link to="/courses" className="group flex items-center gap-6">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">Available Courses</h2>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-500/30">
                <ArrowRight size={24} className="transition-transform group-hover:translate-x-1.5" />
              </div>
            </Link>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mb-5 hidden md:block"></div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-10 pb-12 no-scrollbar px-1 min-h-[480px]">
          {topics.map((course, idx) => {
            const Icon = { Code2, Layers, Cpu, MousePointer2, Sparkles }[course.icon] || Code2;
            const isActive = course.status === 'Active';

            return isActive ? (
              <Link
                key={course.id}
                to={`/lessons/${getFirstLessonSlug(course.name) || 'html-introduction'}`}
                className="snap-center shrink-0 w-[85%] md:w-[400px] glass-panel group p-12 rounded-[3.5rem] bg-white dark:bg-[#1e293b]/70 hover:border-slate-300 dark:hover:border-blue-500/30 hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all relative overflow-hidden flex flex-col justify-between min-h-[480px]"
              >
                <div>
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-12 transition-all group-hover:scale-110 duration-700 dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Icon size={32} />
                  </div>
                  <span className="absolute top-12 right-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-sm">Active</span>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-6 tracking-tighter leading-none">{course.name} <br /> {course.subtitle}</h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed tracking-tight group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                    {course.description}
                  </p>
                </div>
                <div className="flex items-center justify-end pt-12 mt-12 border-t border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#0f172a] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-500 dark:group-hover:from-blue-600 dark:group-hover:to-blue-500 group-hover:text-white transition-all shadow-sm text-slate-600 dark:text-slate-400 group-hover:shadow-md">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            ) : (
              <div key={course.id} className="snap-center shrink-0 w-[85%] md:w-[400px] glass-panel p-12 rounded-[3.5rem] opacity-70 grayscale flex flex-col justify-between min-h-[480px] bg-slate-50/50 dark:bg-slate-900/40 relative group hover:opacity-100 hover:grayscale-0 transition-all border border-transparent dark:border-white/5">
                <div>
                  <div className="w-16 h-16 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-12 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-all">
                    <Icon size={32} />
                  </div>
                  <span className="absolute top-12 right-12 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest">{course.status}</span>
                  <h3 className="text-4xl font-black text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors mb-6 tracking-tighter leading-none">{course.name}</h3>
                  <p className="text-base text-slate-500 dark:text-slate-600 font-medium leading-relaxed tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-400">
                    {course.description}
                  </p>
                </div>
                <div className="h-1 bg-slate-200 dark:bg-slate-800 w-full rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-300 dark:bg-blue-500/30 w-1/3 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimalist Professional Footer */}
        <footer className="mt-40 border-t border-slate-200/60 dark:border-white/5 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <Link to="/" className="flex items-center gap-3 group transition-transform hover:-translate-y-0.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center p-2 shadow-lg">
                  <Code2 className="text-white" size={20} />
                </div>
                <span className="text-sm font-black text-slate-800 dark:text-white tracking-[0.2em] uppercase">SUMMERCODE</span>
              </Link>

              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {["Courses", "Pricing", "About", "Community", "Admin"].map(item => (
                  <Link
                    key={item}
                    to={item === "Admin" ? "/admin" : "#"}
                    className="text-[12px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
                &copy; 2026 SummerCode Platform. All Rights Reserved.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-[9px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em]">BUILT WITH LOVE IN INDIA</span>
              </div>
            </div>
          </div>
        </footer>
      </section>

    </div>
  );
}
