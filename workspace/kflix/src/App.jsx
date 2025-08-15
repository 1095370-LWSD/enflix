import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Plus, Search, X, ChevronLeft, ChevronRight, Clapperboard, Settings, ShieldCheck, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ---------- Constants & Helpers ----------
const LS_KEY = "kflix_v3_store";
const NAV_ITEMS = ["Home", "Trending", "New Releases", "Editor's Picks", "Dance Prac.", "Live"];

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    if (!url.includes("youtube") && !url.includes("youtu.be")) return url.trim();
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const paths = u.pathname.split("/").filter(Boolean);
    const i = paths.indexOf("shorts");
    if (i !== -1 && paths[i + 1]) return paths[i + 1];
    return paths[paths.length - 1] || null;
  } catch {
    return typeof url === "string" && url.trim().length >= 8 ? url.trim() : null;
  }
}

function ytThumb(id) {
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// ---------- Seed Data (shows only visible on home) ----------
const seedVideos = [];
const seedShows = [
  {
    id: "show1",
    title: "ENHYPEN Live Collection",
    thumbnail: null,
    category: "Concerts",
    seasons: [
      { seasonNumber: 1, episodes: [] }
    ]
  }
];

// ---------- UI Subcomponents ----------
function Header({ query, setQuery, onToggleAdmin, adminMode }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/50 bg-black/70 border-b border-red-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-md grid place-items-center shadow-lg shadow-red-900/40">
            <Clapperboard className="w-5 h-5 text-black" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white"><span className="text-red-600">K</span>‑Flix</span>
        </div>

        <nav className="hidden md:flex ml-6 items-center gap-4 text-sm">
          {NAV_ITEMS.map((x) => (
            <a key={x} href="#" className="text-zinc-300 hover:text-white transition">{x}</a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shows, seasons, tags…"
              className="pl-9 bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <Button variant="secondary" className="bg-red-600/90 hover:bg-red-600 text-white" onClick={onToggleAdmin}>
            <Settings className="w-4 h-4 mr-2" /> {adminMode ? 'Admin On' : 'Admin Off'}
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-700 to-zinc-800 border border-red-900" />
        </div>
      </div>
    </header>
  );
}

function Hero({ featured, onPlay }) {
  if (!featured) return (
    <section className="relative">
      <div className="relative h-[40vh] sm:h-[48vh] w-full overflow-hidden rounded-b-2xl bg-gradient-to-br from-zinc-900 to-black" />
    </section>
  );
  return (
    <section className="relative">
      <div className="relative h-[42vh] sm:h-[56vh] w-full overflow-hidden rounded-b-2xl">
        <img src={featured.thumbnail || ytThumb(featured.id)} alt={featured.title} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 max-w-2xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow">
            {featured.title}
          </motion.h1>
          <p className="mt-2 text-zinc-200/90 line-clamp-2">{featured.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => onPlay(featured)} className="bg-white text-black hover:bg-zinc-200">
              <Play className="w-4 h-4 mr-2" /> Play
            </Button>
            <Button variant="secondary" className="bg-red-600/90 hover:bg-red-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> My List
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowRow({ title, shows, onOpenShow }) {
  const scrollerRef = useRef(null);
  const scrollBy = (delta) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };
  if (!shows?.length) return null;
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between px-4 sm:px-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => scrollBy(-600)} className="text-zinc-400 hover:text-white"><ChevronLeft className="w-6 h-6" /></Button>
          <Button variant="ghost" size="icon" onClick={() => scrollBy(600)} className="text-zinc-400 hover:text-white"><ChevronRight className="w-6 h-6" /></Button>
        </div>
      </div>

      <div ref={scrollerRef} className="mt-3 flex gap-4 overflow-x-auto px-4 sm:px-8 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-red-900/60 scrollbar-track-transparent">
        {shows.map(s => (
          <motion.div key={s.id} whileHover={{ y:-6 }} className="min-w-[180px] max-w-[180px] snap-start">
            <div onClick={() => onOpenShow(s)} className="cursor-pointer group relative rounded overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform-gpu hover:-translate-y-1">
              <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover bg-zinc-800" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute left-3 bottom-3 text-white text-sm font-semibold opacity-0 group-hover:opacity-100">{s.title}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PlayerModal({ open, onOpenChange, video }) {
  const src = video && video.id ? `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0` : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border border-red-900/40">
        <DialogHeader className="px-4 pt-3">
          <DialogTitle className="text-white">{video?.title || "Playing"}</DialogTitle>
          <DialogDescription className="text-zinc-400">{video?.description}</DialogDescription>
        </DialogHeader>
        {video && (
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full"
              src={src}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
        <DialogFooter className="px-4 pb-4">
          <Button variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" /> Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShowModal({ open, onOpenChange, show, videos, onPlay, onAddEpisode, onRemoveEpisode, adminMode }) {
  if (!show) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border border-red-900/40">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <img src={show.thumbnail} alt={show.title} className="w-full h-full object-cover bg-zinc-800" />
          </div>
          <div className="p-4 md:w-2/3">
            <h2 className="text-2xl font-bold text-white">{show.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">{show.seasons.length} season(s)</p>
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-auto pr-2">
              {show.seasons.map(se => (
                <div key={se.seasonNumber} className="p-2 bg-zinc-900/70 rounded">
                  <div className="flex items-center justify-between">
                    <strong>Season {se.seasonNumber}</strong>
                    <span className="text-xs text-zinc-400">{se.episodes.length} episode(s)</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {se.episodes.map(ep => {
                      const video = videos.find(v => v.id === ep.videoId);
                      return (
                        <div key={ep.id} className="flex items-center gap-3">
                          <img src={video?.thumbnail || ytThumb(ep.videoId)} alt={video?.title || ep.videoId} className="w-20 h-12 object-cover rounded" />
                          <div className="flex-1 text-sm">
                            <div className="font-medium">{video?.title || ep.videoId}</div>
                            <div className="text-xs text-zinc-400">{video?.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => onPlay(video || { id: ep.videoId, title: video?.title || ep.videoId })} className="bg-white text-black">Play</Button>
                            {adminMode && <Button onClick={() => onRemoveEpisode(show.id, se.seasonNumber, ep.id)} className="bg-red-600 text-white"><Trash2 className="w-4 h-4"/></Button>}
                          </div>
                        </div>
                      );
                    })}

                    {adminMode && (
                      <AddEpisodeInline show={show} season={se} videos={videos} onAdd={(videoId) => onAddEpisode(show.id, se.seasonNumber, videoId)} addVideoToLibrary={(v) => { if (v) {} }} />
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="px-4 py-3">
          <Button variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminPanel({ onAddVideo, onAddShow }) {
  const [tab, setTab] = useState("video");
  const [videoForm, setVideoForm] = useState({ title: "", url: "", category: "Trending", tags: "", description: "", thumbnailPreview: null });
  const [showForm, setShowForm] = useState({ title: "", seasons: 1, thumbnailFile: null, thumbnailPreview: null, category: "Featured" });

  const handleVideoFile = async (file) => {
    if (!file) { setVideoForm(f=>({...f, thumbnailPreview:null})); return; }
    const data = await fileToDataUrl(file);
    setVideoForm(f => ({ ...f, thumbnailPreview: data }));
  };

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    const id = extractYouTubeId(videoForm.url);
    if (!id) return alert("Please enter a valid YouTube URL or ID");
    const video = {
      id,
      title: videoForm.title || id,
      description: videoForm.description || "",
      category: videoForm.category || "Uncategorized",
      tags: videoForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      addedByAdmin: true,
      thumbnail: videoForm.thumbnailPreview || null
    };
    onAddVideo(video);
    setVideoForm({ title: "", url: "", category: "Trending", tags: "", description: "", thumbnailPreview: null });
  };

  const handleShowFile = async (file) => {
    if (!file) { setShowForm(f=>({...f, thumbnailFile:null, thumbnailPreview:null})); return; }
    const data = await fileToDataUrl(file);
    setShowForm(f => ({ ...f, thumbnailFile: file, thumbnailPreview: data }));
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault();
    const seasonsCount = Math.max(1, Number(showForm.seasons) || 1);
    const show = {
      id: Date.now().toString(),
      title: showForm.title || `Untitled Show ${Date.now()}`,
      thumbnail: showForm.thumbnailPreview || null,
      category: showForm.category || "Uncategorized",
      seasons: Array.from({ length: seasonsCount }).map((_, i) => ({ seasonNumber: i + 1, episodes: [] })),
    };
    onAddShow(show);
    setShowForm({ title: "", seasons: 1, thumbnailFile: null, thumbnailPreview: null, category: "Featured" });
  };

  return (
    <div className="border border-red-900/40 rounded-2xl p-4 bg-zinc-950/70">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="w-4 h-4 text-red-500" />
        <h3 className="text-lg font-semibold text-white">Admin — Add Content</h3>
        <div className="ml-auto flex gap-2">
          <Button variant={tab === "video" ? "default" : "ghost"} onClick={() => setTab("video")} className="text-sm">Add Video</Button>
          <Button variant={tab === "show" ? "default" : "ghost"} onClick={() => setTab("show")} className="text-sm">Create Show</Button>
        </div>
      </div>

      {tab === "video" && (
        <form onSubmit={handleVideoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="vtitle" className="text-zinc-300">Title</Label>
            <Input id="vtitle" value={videoForm.title} onChange={(e) => setVideoForm(f => ({ ...f, title: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" placeholder="Video title" />
          </div>

          <div>
            <Label htmlFor="vurl" className="text-zinc-300">YouTube URL or ID</Label>
            <Input id="vurl" value={videoForm.url} onChange={(e) => setVideoForm(f => ({ ...f, url: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" placeholder="https://youtu.be/VIDEO_ID" />
          </div>

          <div>
            <Label htmlFor="vcat" className="text-zinc-300">Category (for library)</Label>
            <Input id="vcat" value={videoForm.category} onChange={(e) => setVideoForm(f => ({ ...f, category: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" />
          </div>

          <div>
            <Label htmlFor="vtags" className="text-zinc-300">Tags (comma-separated)</Label>
            <Input id="vtags" value={videoForm.tags} onChange={(e) => setVideoForm(f => ({ ...f, tags: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" />
          </div>

          <div>
            <Label htmlFor="vthumb" className="text-zinc-300">Thumbnail (optional)</Label>
            <input id="vthumb" type="file" accept="image/*" onChange={(e) => handleVideoFile(e.target.files[0])} className="w-full text-sm text-zinc-400" />
            {videoForm.thumbnailPreview && <img src={videoForm.thumbnailPreview} alt="preview" className="mt-2 w-44 h-24 object-cover rounded" />}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="vdesc" className="text-zinc-300">Description</Label>
            <Input id="vdesc" value={videoForm.description} onChange={(e) => setVideoForm(f => ({ ...f, description: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" className="bg-red-600 hover:bg-red-600/90 text-white"><Plus className="w-4 h-4 mr-2"/> Add Video</Button>
            <p className="text-xs text-zinc-400 self-center">Added videos will be marked as admin uploads and can be deleted later. They are stored in the library only.</p>
          </div>
        </form>
      )}

      {tab === "show" && (
        <form onSubmit={handleShowSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="stitle" className="text-zinc-300">Show Title</Label>
            <Input id="stitle" value={showForm.title} onChange={(e) => setShowForm(f => ({ ...f, title: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" placeholder="Show title" />
          </div>

          <div>
            <Label htmlFor="scat" className="text-zinc-300">Category (homepage row)</Label>
            <Input id="scat" value={showForm.category} onChange={(e) => setShowForm(f => ({ ...f, category: e.target.value }))} className="bg-zinc-900/80 border-zinc-800 text-white" placeholder="e.g., Dance Practices" />
          </div>

          <div>
            <Label htmlFor="sseasons" className="text-zinc-300">Seasons</Label>
            <Input id="sseasons" type="number" min="1" value={showForm.seasons} onChange={(e) => setShowForm(f => ({ ...f, seasons: Number(e.target.value) }))} className="bg-zinc-900/80 border-zinc-800 text-white" />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="sthumbnail" className="text-zinc-300">Thumbnail (upload)</Label>
            <input id="sthumbnail" type="file" accept="image/*" onChange={(e) => handleShowFile(e.target.files[0])} className="w-full text-sm text-zinc-400" />
            {showForm.thumbnailPreview && <img src={showForm.thumbnailPreview} alt="preview" className="mt-2 w-44 h-24 object-cover rounded" />}
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" className="bg-red-600 hover:bg-red-600/90 text-white"><Plus className="w-4 h-4 mr-2"/> Create Show</Button>
            <p className="text-xs text-zinc-400 self-center">Shows appear on the homepage grouped by their category rows.</p>
          </div>
        </form>
      )}
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [videos, setVideos] = useState([]);
  const [shows, setShows] = useState([]);
  const [query, setQuery] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [openShow, setOpenShow] = useState(null);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setVideos(parsed.videos || seedVideos);
        setShows(parsed.shows || seedShows);
      } else {
        setVideos(seedVideos);
        setShows(seedShows);
        localStorage.setItem(LS_KEY, JSON.stringify({ videos: seedVideos, shows: seedShows }));
      }
    } catch (e) {
      setVideos(seedVideos);
      setShows(seedShows);
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ videos, shows }));
    } catch (e) {}
  }, [videos, shows]);

  const addVideo = (video) => {
    setVideos(prev => {
      if (prev.some(p => p.id === video.id)) return prev;
      return [video, ...prev];
    });
  };

  const deleteVideo = (id) => {
    const target = videos.find(v => v.id === id);
    if (!target) return;
    if (!target.addedByAdmin) return alert("Only videos uploaded through Admin can be deleted.");
    setVideos(prev => prev.filter(v => v.id !== id));
    setShows(prev => prev.map(s => ({
      ...s,
      seasons: s.seasons.map(season => ({
        ...season,
        episodes: season.episodes.filter(ep => ep.videoId !== id)
      }))
    })));
  };

  const addShow = (show) => {
    setShows(prev => [show, ...prev]);
  };

  const deleteShow = (showId) => {
    setShows(prev => prev.filter(s => s.id !== showId));
  };

  const addEpisodeToShow = (showId, seasonNumber, videoId) => {
    setShows(prev => prev.map(s => {
      if (s.id !== showId) return s;
      return {
        ...s,
        seasons: s.seasons.map(se => {
          if (se.seasonNumber !== seasonNumber) return se;
          return { ...se, episodes: [...se.episodes, { id: Date.now().toString(), videoId }] };
        })
      };
    }));
  };

  const removeEpisodeFromShow = (showId, seasonNumber, episodeId) => {
    setShows(prev => prev.map(s => {
      if (s.id !== showId) return s;
      return { ...s, seasons: s.seasons.map(se => se.seasonNumber === seasonNumber ? { ...se, episodes: se.episodes.filter(ep => ep.id !== episodeId) } : se) };
    }));
  };

  const filteredShows = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return shows;
    return shows.filter(s => (
      (s.title || "").toLowerCase().includes(q)
    ));
  }, [shows, query]);

  // Group shows by category for homepage rows
  const showGroups = useMemo(() => {
    const map = new Map();
    for (const s of filteredShows) {
      const key = s.category || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [filteredShows]);

  const featured = shows[0] || null;

  const handlePlay = (v) => { setPlayingVideo(v); setPlayerOpen(true); };
  const openShowModal = (s) => setOpenShow(s);
  const closeShowModal = () => setOpenShow(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-zinc-100">
      <Header query={query} setQuery={setQuery} onToggleAdmin={() => setAdminMode(a => !a)} adminMode={adminMode} />

      <main className="max-w-7xl mx-auto">
        <Hero featured={featured} onPlay={handlePlay} />

        <div className="px-4 sm:px-8 mt-6 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <p className="text-sm text-zinc-400">Admin Mode lets you add videos, create shows (with thumbnails) and manage episodes. Data is stored in your browser.</p>
        </div>

        {adminMode && (
          <div className="px-4 sm:px-8 mt-6">
            <AdminPanel onAddVideo={addVideo} onAddShow={addShow} />
          </div>
        )}

        <div className="px-2 sm:px-8 mt-6">
          {showGroups.map(g => (
            <ShowRow key={g.key} title={g.key} shows={g.items} onOpenShow={openShowModal} />
          ))}
        </div>

        <section className="px-4 sm:px-8 mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">All Shows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shows.map(show => (
              <div key={show.id} className="bg-zinc-900/80 rounded overflow-hidden border border-red-900/30">
                {show.thumbnail && <img src={show.thumbnail} alt={show.title} className="w-full h-40 object-cover" />}
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{show.title}</h3>
                      <p className="text-sm text-zinc-400">{show.seasons.length} season(s) — {show.category}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button onClick={() => openShowModal(show)} className="bg-red-600 text-white">Episodes</Button>
                      {adminMode && <Button onClick={() => deleteShow(show.id)} className="bg-red-500 text-white"><Trash2 className="w-4 h-4"/></Button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="px-4 sm:px-8 py-10 text-zinc-500 text-sm">
          <div className="border-t border-red-900/30 pt-6">
            <p>© {new Date().getFullYear()} K‑Flix • A Netflix‑style K‑pop showcase. Built for embedded YouTube content.</p>
          </div>
        </footer>

      </main>

      <PlayerModal open={playerOpen} onOpenChange={(open) => { if (!open) setPlayingVideo(null); setPlayerOpen(open); }} video={playingVideo} />
      <ShowModal open={!!openShow} onOpenChange={closeShowModal} show={openShow} videos={videos} onPlay={handlePlay} onAddEpisode={addEpisodeToShow} onRemoveEpisode={removeEpisodeFromShow} adminMode={adminMode} />
    </div>
  );
}

// ---------- Small helper component for adding episode inline ----------
function AddEpisodeInline({ show, season, videos, onAdd, addVideoToLibrary }) {
  const [mode, setMode] = useState("select"); // 'select' or 'url'
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id || "");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (mode === "select") {
      if (!selectedVideoId) return alert("Pick a video from the library");
      onAdd(selectedVideoId);
      return;
    }
    const id = extractYouTubeId(url);
    if (!id) return alert("Invalid YouTube URL/ID");
    const newVideo = {
      id,
      title: title || id,
      description: "",
      category: "Uncategorized",
      tags: [],
      addedByAdmin: true,
      thumbnail: null,
    };
    addVideoToLibrary(newVideo);
    onAdd(id);
    setUrl(""); setTitle("");
  };

  return (
    <form onSubmit={handleAdd} className="mt-2 flex gap-2">
      <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-zinc-800 text-sm p-1">
        <option value="select">From library</option>
        <option value="url">Paste YouTube URL</option>
      </select>

      {mode === "select" ? (
        <select value={selectedVideoId} onChange={(e) => setSelectedVideoId(e.target.value)} className="flex-1 bg-zinc-800 text-sm p-1">
          <option value="">-- choose video --</option>
          {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>
      ) : (
        <>
          <input placeholder="YouTube URL or ID" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 bg-zinc-800 text-sm p-1" />
          <input placeholder="Optional title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-40 bg-zinc-800 text-sm p-1" />
        </>
      )}

      <Button type="submit" className="bg-red-600 text-white">Add Episode</Button>
    </form>
  );
}
