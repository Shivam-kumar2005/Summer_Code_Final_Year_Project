import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import {
  Code2, ArrowLeft, Save, Plus, Trash2, GripVertical,
  Type, AlignLeft, FileCode2, ChevronDown, ChevronUp,
  Eye, Loader2, CheckCircle2, AlertCircle, Sparkles, X, Music,
  BookOpen, Layers, Play, Pause
} from 'lucide-react';
import clsx from 'clsx';
import { API_URL } from '../config';
const API = API_URL;

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: <Type size={16} />, color: 'blue' },
  { type: 'highlightable_text', label: 'Description Text', icon: <AlignLeft size={16} />, color: 'violet' },
  { type: 'code', label: 'Interactive Code Block', icon: <FileCode2 size={16} />, color: 'emerald' },
];

const DEFAULT_COURSES = [];
const LANG_OPTIONS = ['html', 'css', 'javascript', 'python', 'jsx', 'typescript'];

function makeBlock(type) {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    visibleText: '',
    ...(type === 'code' ? { language: 'html' } : {}),
    teachingScript: {
      step: 0,
      transcript: '',
      action: 'speak',
      duration: 3500,
    },
  };
}

const BLOCK_STYLE = {
  heading: { accent: 'bg-blue-600', ring: 'ring-blue-100', bg: 'bg-blue-50/10' },
  highlightable_text: { accent: 'bg-violet-600', ring: 'ring-violet-100', bg: 'bg-violet-50/10' },
  code: { accent: 'bg-emerald-600', ring: 'ring-emerald-100', bg: 'bg-emerald-50/10' },
};

/* ─── Single block editor ─── */
function BlockEditor({ block, idx, total, onChange, onDelete, onMove }) {
  const [open, setOpen] = useState(true);
  const style = BLOCK_STYLE[block.type] || BLOCK_STYLE.heading;

  const set = (key, val) => onChange({ ...block, [key]: val });
  const setScript = (key, val) => onChange({ ...block, teachingScript: { ...block.teachingScript, [key]: val } });

  return (
    <div className={clsx(
      "bg-white border rounded-[2rem] overflow-hidden transition-all duration-300 shadow-sm",
      open ? "border-slate-300 ring-4 " + style.ring : "border-slate-200 hover:border-slate-300"
    )}>
      {/* Block header */}
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <GripVertical size={18} className="text-slate-300 cursor-grab active:text-slate-600" />
        <div className={clsx("w-3 h-3 rounded-full", style.accent)} />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {idx + 1}. {BLOCK_TYPES.find(b => b.type === block.type)?.label ?? block.type}
        </span>

        <div className="flex items-center gap-2">
          <IconBtn disabled={idx === 0} onClick={(e) => { e.stopPropagation(); onMove(idx, idx - 1); }}>
            <ChevronUp size={16} />
          </IconBtn>
          <IconBtn disabled={idx === total - 1} onClick={(e) => { e.stopPropagation(); onMove(idx, idx + 1); }}>
            <ChevronDown size={16} />
          </IconBtn>
          <IconBtn danger onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
            <Trash2 size={16} />
          </IconBtn>
          <div className="w-px h-4 bg-slate-100 mx-2" />
          <span className="text-slate-400 transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            <ChevronDown size={18} />
          </span>
        </div>
      </div>

      {/* Block body */}
      {open && (
        <div className="px-8 pb-8 pt-2 border-t border-slate-100 bg-slate-50/20 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visible content */}
          <div className="space-y-4">
            <Label>Student View (Visible Content)</Label>
            {block.type === 'code' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Editor Language:</span>
                  <select
                    value={block.language || 'html'}
                    onChange={e => set('language', e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {LANG_OPTIONS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                </div>
                <textarea
                  value={block.visibleText}
                  onChange={e => set('visibleText', e.target.value)}
                  rows={8}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-5 py-4 text-sm text-emerald-400 font-mono outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none shadow-inner"
                />
              </div>
            ) : (
              <textarea
                value={block.visibleText}
                onChange={e => set('visibleText', e.target.value)}
                rows={block.type === 'heading' ? 2 : 5}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
              />
            )}
          </div>

          {/* Teaching script */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
              <Music size={14} /> Narrator Voice
            </div>

            <AudioUploader block={block} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Editor ─── */
export default function AdminLessonEditor() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNew = slug === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [allLessons, setAllLessons] = useState([]);

  const [lesson, setLesson] = useState({
    id: '',
    slug: '',
    title: '',
    course: location.state?.topic || 'HTML',
    description: '',
    chapterOrder: 1,
    blocks: [],
  });

  const [courseList, setCourseList] = useState(DEFAULT_COURSES);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // 1. Fetch ALL Topics for the dropdown list
    fetch(`${API}/api/topics`)
      .then(r => r.json())
      .then(data => {
        setCourseList(data.map(t => t.name));
      })
      .catch(console.error);

    // 2. Fetch Lessons to load current lesson if not new
    fetch(`${API}/api/lessons`)
      .then(r => r.json())
      .then(data => {
        setAllLessons(data);
        if (!isNew) {
          const l = data.find(l => l.slug === slug);
          if (l) setLesson(l);
          setLoading(false);
        }
      })
      .catch(() => { showToast('Failed to load lessons', 'error'); setLoading(false); });
  }, [slug, isNew]);

  const setField = (key, val) => setLesson(l => ({ ...l, [key]: val }));

  const handleTitleChange = (val) => {
    setField('title', val);
    if (isNew) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setField('slug', autoSlug);
      setField('id', autoSlug);
    }
  };

  const addBlock = (type) => {
    const b = makeBlock(type);
    setLesson(l => ({ ...l, blocks: [...l.blocks, b] }));
    setShowAddMenu(false);
  };

  const updateBlock = (updated) =>
    setLesson(l => ({ ...l, blocks: l.blocks.map(b => b.id === updated.id ? updated : b) }));

  const deleteBlock = (id) =>
    setLesson(l => ({ ...l, blocks: l.blocks.filter(b => b.id !== id) }));

  const moveBlock = (from, to) => {
    setLesson(l => {
      const blocks = [...l.blocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { ...l, blocks };
    });
  };

  const handleSave = async () => {
    if (!lesson.title.trim()) { showToast('Title is required', 'error'); return; }
    if (!lesson.slug.trim()) { showToast('Slug is required', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/save-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Lesson saved securely!');
        if (isNew) navigate(`/admin/lesson/${lesson.slug}`, { replace: true });
      } else {
        showToast('Save failed', 'error');
      }
    } catch {
      showToast('Server connection error', 'error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Editor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-100">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center gap-6 shadow-sm">
        <button
          onClick={() => navigate('/admin')}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all shadow-sm active:scale-95 group"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md leading-none">Lesson Editor</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-extrabold text-slate-900 leading-none truncate max-w-sm">
              {isNew ? 'New Content' : lesson.title}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {!isNew && (
            <Link
              to={`/lessons/${lesson.slug}`}
              target="_blank"
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-bold px-5 py-3 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-slate-200"
            >
              <Eye size={18} /> Preview
            </Link>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-8 py-3.5 rounded-2xl text-sm font-black transition-all hover:shadow-xl hover:shadow-blue-200 active:scale-95 tracking-wide"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'SAVING…' : 'SAVE CONTENT'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-8 py-10 gap-10">
        {/* Left: Metadata */}
        <aside className="w-80 shrink-0 space-y-6">
          <Section title="Lesson Metadata" icon={<Layers size={14} />}>
            <Field label="Target Course">
              <select
                value={lesson.course || 'HTML'}
                onChange={e => setField('course', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {courseList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Display Title">
              <input
                value={lesson.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. Intro to Box Model"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:slate-300"
              />
            </Field>

            <Field label="Slug URL Identifier">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group-focus-within:ring-2 group-focus-within:ring-blue-500/30">
                <span className="text-slate-400 text-xs font-bold mr-1">/lessons/</span>
                <input
                  value={lesson.slug}
                  onChange={e => setField('slug', e.target.value)}
                  className="bg-transparent flex-1 outline-none text-sm font-bold text-blue-600"
                />
              </div>
            </Field>

            <Field label="Chapter Index">
              <div className="w-full bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 group/index">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none group-focus-within/index:text-blue-600 transition-colors">SET CHAPTER ORDER</span>
                  <input
                    type="number"
                    min="1"
                    value={lesson.chapterOrder}
                    onChange={e => {
                      const val = Math.max(1, Number(e.target.value));
                      setField('chapterOrder', val);

                      // Smart auto-load: If user types an existing chapter number, load it!
                      const existing = allLessons.find(l => l.course === lesson.course && l.chapterOrder === val);
                      if (existing && existing.slug !== slug) {
                        navigate(`/admin/lesson/${existing.slug}`);
                      }
                    }}
                    className="w-16 bg-slate-50 border-0 rounded-xl px-3 py-2 text-sm font-black text-slate-800 text-center outline-none hover:bg-slate-100 transition-all focus:bg-blue-50 focus:text-blue-600"
                    placeholder="1"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none border-b border-slate-100 pb-2">PREVIOUSLY WRITTEN</p>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const existingChapters = allLessons.filter(l => l.course === lesson.course);
                      const isDraftNew = !existingChapters.some(l => l.id === lesson.id || l.slug === slug);
                      const draftIndex = lesson.chapterOrder;
                      const showDraft = !existingChapters.some(l => l.chapterOrder === draftIndex);

                      const allDisplay = [...existingChapters];
                      if (showDraft) {
                        allDisplay.push({ id: 'draft', slug: 'draft', chapterOrder: draftIndex, title: 'Drafting New Chapter', isDraft: true });
                      }

                      return allDisplay.sort((a, b) => a.chapterOrder - b.chapterOrder).map(l => {
                        const isActive = l.id === lesson.id || l.slug === slug;
                        const isConflict = !isActive && !l.isDraft && l.chapterOrder === lesson.chapterOrder;

                        return (
                          <button
                            key={l.slug}
                            type="button"
                            onClick={() => !l.isDraft && navigate(`/admin/lesson/${l.slug}`)}
                            className={clsx("group relative", l.isDraft && "cursor-default")}
                          >
                            <div className={clsx(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all",
                              isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105" :
                                l.isDraft ? "bg-blue-50/10 border-2 border-dashed border-blue-200 text-blue-300 opacity-60" :
                                  isConflict ? "bg-red-50 border-red-200 text-red-500" :
                                    "bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"
                            )}>
                              {l.chapterOrder}
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl opacity-0 hover:opacity-0 transition-all pointer-events-none whitespace-nowrap z-50">
                              {l.title}
                            </div>
                            {!l.isDraft && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                {l.title}
                              </div>
                            )}
                          </button>
                        );
                      });
                    })()}
                    {allLessons.filter(l => l.course === lesson.course).length === 0 && !lesson.chapterOrder && (
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic pt-1">No chapters yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </Field>
          </Section>

          <Section title="Lesson Abstract" icon={<AlignLeft size={14} />}>
            <textarea
              value={lesson.description}
              onChange={e => setField('description', e.target.value)}
              rows={4}
              placeholder="Brief summary..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </Section>

          {/* Chapter History for context */}
          <Section title="Chapter History" icon={<BookOpen size={14} />}>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">
                Existing {lesson.course} Lessons
              </p>
              {allLessons.filter(l => l.course === lesson.course).sort((a, b) => a.chapterOrder - b.chapterOrder).map(l => (
                <div key={l.slug} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-all">
                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                    {l.chapterOrder}
                  </div>
                  <span className="text-xs font-bold text-slate-600 truncate flex-1">{l.title}</span>
                </div>
              ))}
              {allLessons.filter(l => l.course === lesson.course).length === 0 && (
                <p className="text-[10px] text-slate-400 font-medium italic">No other chapters yet.</p>
              )}
            </div>
          </Section>
        </aside>

        {/* Right: Actual Blocks Editor */}
        <main className="flex-1 space-y-6">
          {/* Header only, no top button as requested */}
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Teaching Blocks
            <span className="text-xs font-bold bg-slate-200/50 text-slate-500 px-3 py-1 rounded-full">{lesson.blocks.length}</span>
          </h2>

          <div className="space-y-6">
            {lesson.blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                idx={idx}
                total={lesson.blocks.length}
                onChange={updateBlock}
                onDelete={deleteBlock}
                onMove={moveBlock}
              />
            ))}

            <button
              onClick={() => setShowAddMenu(true)}
              className="w-full py-10 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-[3rem] text-slate-400 hover:text-blue-600 text-sm font-black transition-all flex flex-col items-center justify-center gap-4 hover:bg-blue-50/20 group pb-12"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors shadow-sm">
                <Plus size={32} />
              </div>
              <span className="uppercase tracking-widest text-[11px]">TUTORIAL MEIN AGAL BLOCK ADD KAREIN</span>
            </button>
          </div>
        </main>
      </div>

      {/* Add Block Dialogue Modal */}
      {showAddMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddMenu(false)} />

          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 overflow-hidden border border-slate-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Add Content</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select block type</p>
              </div>
              <button onClick={() => setShowAddMenu(false)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BLOCK_TYPES.map(type => (
                <button
                  key={type.type}
                  onClick={() => { addBlock(type.type); setShowAddMenu(false); }}
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                    {React.cloneElement(type.icon, { size: 18, className: `text-blue-500` })}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-600">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddMenu(false)}
              className="w-full mt-6 py-2 rounded-xl text-[9px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] flex items-center gap-3 px-8 py-5 rounded-[2.5rem] text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 border-2 bg-white ${toast.type === 'error' ? 'border-red-100 text-red-600' : 'border-blue-100 text-blue-600'
          }`}>
          {toast.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ─── Audio Uploader sub-component ─── */
function AudioUploader({ block, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const audioUrl = block.teachingScript?.audioUrl;

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  // Reset audio if URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
    }
  }, [audioUrl]);

  const readDurationFromFile = (file) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.ceil(audio.duration * 1000));
        URL.revokeObjectURL(url);
      });
    });

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const duration = await readDurationFromFile(file);
      const form = new FormData();
      form.append('audio', file);
      const res = await fetch(`${API_URL}/api/admin/upload-audio`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        onChange({
          ...block,
          teachingScript: {
            ...block.teachingScript,
            audioUrl: data.audioUrl,
            duration: duration,
            fileName: file.name,
            uploadedName: data.filename
          }
        });
      }
    } catch (e) {
      alert('Upload failed. Server check karein.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Narrator Voice File (Audio)</Label>
      <div
        className={clsx(
          "relative border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-2 transition-all",
          audioUrl ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 hover:border-blue-500 hover:bg-blue-50/30"
        )}
      >
        <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

        {uploading ? (
          <Loader2 size={32} className="animate-spin text-blue-600" />
        ) : audioUrl ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all active:scale-90"
            >
              {playing ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest truncate max-w-[200px] mt-1">
              {block.teachingScript?.fileName || 'Audio Saved'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{Math.round((block.teachingScript?.duration || 0) / 1000)}s</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => inputRef.current.click()}>
            <Music size={32} className="text-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              MANTOR KI AWAZ UPLOAD KAREIN
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {audioUrl && (
          <button
            onClick={() => inputRef.current.click()}
            className="flex-1 text-[9px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-all"
          >
            Change Audio
          </button>
        )}
        {audioUrl && (
          <button
            onClick={() => onChange({ ...block, teachingScript: { ...block.teachingScript, audioUrl: null } })}
            className="flex-1 text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-all"
          >
            Remove Audio
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Tiny Helpers ─── */
function Label({ children }) {
  return <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{children}</p>;
}
function Field({ label, children }) {
  return <div className="flex flex-col">{children}<p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest opacity-60 ml-1">{label}</p></div>;
}
function Section({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-7 flex flex-col gap-5 shadow-sm">
      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}
function IconBtn({ children, onClick, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "p-2 rounded-xl transition-all disabled:opacity-20",
        danger ? "text-slate-300 hover:text-red-500 hover:bg-red-50" : "text-slate-300 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      {children}
    </button>
  );
}
