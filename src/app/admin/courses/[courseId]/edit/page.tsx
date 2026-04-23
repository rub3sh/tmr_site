'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Pencil, Video as VideoIcon,
  ChevronDown, ChevronRight, Loader2, Save, FolderOpen, Film,
  FileText, Link as LinkIcon, Upload,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────── */

type VideoItem = {
  id: string;
  title: string;
  videoUrl: string;
  vdoCipherId: string | null;
  durationSec: number;
  sortOrder: number;
  isFree: boolean;
  isPreview: boolean;
};

type AttachmentItem = {
  id: string;
  type: 'PDF' | 'LINK' | 'TOOL' | 'NOTE';
  title: string;
  url: string;
};

type ModuleItem = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  videos: VideoItem[];
  attachments: AttachmentItem[];
};

type CourseData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  thumbnailUrl: string;
  priceInPaise: number;
  taxMode: string;
  taxPercent: number;
  difficulty: string;
  category: string | null;
  status: string;
  isPublished: boolean;
  lessons: ModuleItem[];
  planCourses: Array<{ plan: { id: string; name: string } }>;
};

type PlanOption = { id: string; name: string };

/* ─── Helpers ──────────────────────────────────────────── */

const inputClass = 'w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/25';
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40';
const cardClass = 'rounded-xl border border-white/5 bg-white/[0.02] p-5';
const btnSecondary = 'rounded-lg px-3 py-2 text-xs font-medium text-white/30 transition hover:bg-white/5 hover:text-white/50';
const btnDanger = 'rounded-lg p-2 text-white/15 transition hover:bg-red-500/10 hover:text-red-400';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ─── Page ─────────────────────────────────────────────── */

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'modules' | 'details'>('modules');

  /* ── Detail editing state ── */
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editThumb, setEditThumb] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editDifficulty, setEditDifficulty] = useState('BEGINNER');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState('DRAFT');
  const [editPlanIds, setEditPlanIds] = useState<string[]>([]);
  const [savingDetails, setSavingDetails] = useState(false);

  /* ── Module/Video state ── */
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [addingModule, setAddingModule] = useState(false);

  /* ── Add video state ── */
  const [addVideoModuleId, setAddVideoModuleId] = useState<string | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoCipherId, setNewVideoCipherId] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState(0);
  const [newVideoFree, setNewVideoFree] = useState(false);
  const [newVideoPreview, setNewVideoPreview] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);

  /* ── Fetch ── */
  const fetchCourse = useCallback(async () => {
    const [courseRes, plansRes] = await Promise.all([
      fetch(`/api/admin/courses/${courseId}`),
      fetch('/api/admin/plans'),
    ]);
    const courseData = await courseRes.json();
    const plansData = await plansRes.json();
    if (courseData.data) {
      const c = courseData.data;
      setCourse(c);
      setEditTitle(c.title);
      setEditDesc(c.description);
      setEditShortDesc(c.shortDesc);
      setEditThumb(c.thumbnailUrl);
      setEditPrice(c.priceInPaise);
      setEditDifficulty(c.difficulty);
      setEditCategory(c.category || '');
      setEditStatus(c.status);
      setEditPlanIds(c.planCourses.map((pc: { plan: { id: string } }) => pc.plan.id));
    }
    if (plansData.data) setPlans(plansData.data);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  /* ── Module actions ── */
  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newModuleTitle, description: newModuleDesc || null }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setCourse((prev) => prev ? { ...prev, lessons: [...prev.lessons, data] } : null);
      setNewModuleTitle('');
      setNewModuleDesc('');
      setExpandedModules((prev) => new Set([...prev, data.id]));
    }
    setAddingModule(false);
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('Delete this module and all its videos?')) return;
    const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' });
    if (res.ok) {
      setCourse((prev) => prev ? { ...prev, lessons: prev.lessons.filter((l) => l.id !== moduleId) } : null);
    }
  }

  /* ── Video actions ── */
  function openAddVideo(moduleId: string) {
    setAddVideoModuleId(moduleId);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoCipherId('');
    setNewVideoDuration(0);
    setNewVideoFree(false);
    setNewVideoPreview(false);
  }

  async function handleAddVideo() {
    if (!addVideoModuleId || !newVideoTitle.trim()) return;
    setAddingVideo(true);
    const res = await fetch(`/api/admin/courses/${courseId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: addVideoModuleId,
        title: newVideoTitle,
        videoUrl: newVideoUrl,
        vdoCipherId: newVideoCipherId || null,
        durationSec: newVideoDuration,
        isFree: newVideoFree,
        isPreview: newVideoPreview,
      }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setCourse((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === addVideoModuleId ? { ...l, videos: [...l.videos, data] } : l
          ),
        };
      });
      setAddVideoModuleId(null);
    }
    setAddingVideo(false);
  }

  async function handleDeleteVideo(moduleId: string, videoId: string) {
    const res = await fetch(`/api/admin/courses/${courseId}/videos/${videoId}`, { method: 'DELETE' });
    if (res.ok) {
      setCourse((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === moduleId ? { ...l, videos: l.videos.filter((v) => v.id !== videoId) } : l
          ),
        };
      });
    }
  }

  /* ── Save details ── */
  async function handleSaveDetails() {
    setSavingDetails(true);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDesc,
        shortDesc: editShortDesc,
        thumbnailUrl: editThumb,
        priceInPaise: editPrice,
        difficulty: editDifficulty,
        category: editCategory || null,
        status: editStatus,
        planIds: editPlanIds,
      }),
    });
    setSavingDetails(false);
    fetchCourse();
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!course) {
    return <p className="py-10 text-center text-white/40">Course not found</p>;
  }

  const totalVideos = course.lessons.reduce((acc, l) => acc + l.videos.length, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/courses')} className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/60">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-white">{course.title}</h1>
          <p className="mt-0.5 text-xs text-white/30">
            {course.lessons.length} modules · {totalVideos} videos ·{' '}
            <span className={course.status === 'PUBLISHED' ? 'text-green-400' : 'text-yellow-400'}>{course.status}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1">
        <button onClick={() => setActiveTab('modules')} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
          activeTab === 'modules' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
        }`}>
          <FolderOpen size={14} className="mr-2 inline" /> Modules & Videos
        </button>
        <button onClick={() => setActiveTab('details')} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
          activeTab === 'details' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
        }`}>
          <Pencil size={14} className="mr-2 inline" /> Course Details
        </button>
      </div>

      {/* ─── MODULES TAB ────────────────────────────────── */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {/* Module list */}
          {course.lessons.length === 0 && (
            <div className={`${cardClass} py-12 text-center`}>
              <FolderOpen size={40} className="mx-auto text-white/10" />
              <p className="mt-3 text-sm text-white/30">No modules yet. Add your first module below.</p>
            </div>
          )}

          {course.lessons
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((mod, idx) => {
              const isExpanded = expandedModules.has(mod.id);
              return (
                <div key={mod.id} className={cardClass}>
                  {/* Module header */}
                  <div className="flex items-center gap-3">
                    <GripVertical size={14} className="text-white/10" />
                    <button onClick={() => toggleModule(mod.id)} className="text-white/30 transition hover:text-white/60">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/25">M{idx + 1}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white">{mod.title}</h3>
                      {mod.description && <p className="mt-0.5 text-xs text-white/25">{mod.description}</p>}
                    </div>
                    <span className="text-xs text-white/20">{mod.videos.length} videos</span>
                    <button onClick={() => handleDeleteModule(mod.id)} className={btnDanger}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Expanded: videos */}
                  {isExpanded && (
                    <div className="ml-10 mt-4 space-y-2">
                      {mod.videos.length === 0 && (
                        <p className="py-3 text-xs text-white/20">No videos in this module yet.</p>
                      )}
                      {mod.videos
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((video, vi) => (
                        <div key={video.id} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
                          <Film size={12} className="text-white/15" />
                          <span className="text-[10px] text-white/15">{vi + 1}</span>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-white/70">{video.title}</p>
                            <div className="mt-0.5 flex gap-2 text-[10px] text-white/20">
                              {video.durationSec > 0 && <span>{formatDuration(video.durationSec)}</span>}
                              {video.isFree && <span className="text-green-400/60">Free</span>}
                              {video.isPreview && <span className="text-blue-400/60">Preview</span>}
                              {video.vdoCipherId && <span>VdoCipher</span>}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteVideo(mod.id, video.id)} className="p-1.5 text-white/10 transition hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Add video form */}
                      {addVideoModuleId === mod.id ? (
                        <div className="space-y-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Add Video to {mod.title}</p>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <input type="text" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)}
                                className={inputClass} placeholder="Video title *" />
                            </div>
                            <input type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)}
                              className={inputClass} placeholder="Video URL" />
                            <input type="text" value={newVideoCipherId} onChange={(e) => setNewVideoCipherId(e.target.value)}
                              className={inputClass} placeholder="VdoCipher ID (optional)" />
                            <input type="number" value={newVideoDuration} onChange={(e) => setNewVideoDuration(parseInt(e.target.value) || 0)}
                              className={inputClass} placeholder="Duration (seconds)" />
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-1.5 text-xs text-white/40">
                                <input type="checkbox" checked={newVideoFree} onChange={(e) => setNewVideoFree(e.target.checked)} /> Free
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-white/40">
                                <input type="checkbox" checked={newVideoPreview} onChange={(e) => setNewVideoPreview(e.target.checked)} /> Preview
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleAddVideo} disabled={addingVideo} className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
                              {addingVideo ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add Video
                            </button>
                            <button onClick={() => setAddVideoModuleId(null)} className={btnSecondary}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => openAddVideo(mod.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/25 transition hover:bg-white/5 hover:text-white/40">
                          <Plus size={12} /> Add Video
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Add module form */}
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">New Module</p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <input type="text" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)}
                  className={inputClass} placeholder="Module title *" />
                <input type="text" value={newModuleDesc} onChange={(e) => setNewModuleDesc(e.target.value)}
                  className={inputClass} placeholder="Module description (optional)" />
              </div>
              <button onClick={handleAddModule} disabled={addingModule || !newModuleTitle.trim()} className="self-start rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-30">
                {addingModule ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} className="mr-1 inline" /> Add Module</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILS TAB ────────────────────────────────── */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className={cardClass}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">Course Info</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Short Description</label>
                <input type="text" value={editShortDesc} onChange={(e) => setEditShortDesc(e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea rows={4} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Thumbnail URL</label>
                <input type="text" value={editThumb} onChange={(e) => setEditThumb(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Price (Paise)</label>
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/25 hover:border-white/20 [&>option]:bg-[#0b0b0b] [&>option]:text-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputClass}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plan access */}
          <div className={cardClass}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">Plan Access</h2>
            <div className="grid gap-2 md:grid-cols-3">
              {plans.map((plan) => {
                const selected = editPlanIds.includes(plan.id);
                return (
                  <button key={plan.id} onClick={() => setEditPlanIds((prev) => selected ? prev.filter((id) => id !== plan.id) : [...prev, plan.id])}
                    className={`rounded-lg border p-3 text-left text-sm font-medium transition ${
                      selected ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 bg-white/[0.01] text-white/30 hover:border-white/10'
                    }`}>
                    {plan.name} {selected && <span className="text-xs text-white/50">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveDetails} disabled={savingDetails} className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
              {savingDetails ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {savingDetails ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
