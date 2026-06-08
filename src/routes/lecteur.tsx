import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft, SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward,
  Volume2, VolumeX, Maximize2, BarChart3, Palette, Tag as TagIcon, Move,
} from "lucide-react";
import { TerminalBox, TerminalButton } from "@/components/terminal/TerminalBox";
import { FeaturesBar } from "@/components/terminal/FeaturesBar";
import { fmt, bucket, bucketTag, faceCrop, filterTags, LOD_SCALE, LOD_LABEL, type Face } from "@/lib/lecteur-utils";

export const Route = createFileRoute("/lecteur")({
  head: () => ({
    meta: [
      { title: "Lecteur PPV — PPV Studio" },
      { name: "description", content: "Lecteur vidéo PPV avec timeline sémantique, LOD adaptatif, zoom Canvas et analyse d'activité." },
    ],
  }),
  component: Lecteur,
});

const VIDEO_SRC = "https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files/big_buck_bunny.mp4";

type Tag = { start: number; end: number; label: string; icon: string };

function fmt(s: number) {
  if (!isFinite(s)) return "--:--";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// LOD → downscale factor for analysis canvas
const LOD_SCALE = [0.25, 0.5, 1]; // LOD 0=low, 2=high
const LOD_LABEL = ["1/4", "1/2", "1/1"];

function Lecteur() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const rafRef = useRef<number | null>(null);

  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [lod, setLod] = useState(2);
  const [face, setFace] = useState<"Avant" | "Arrière" | "Gauche" | "Droite" | "Haut" | "Bas">("Avant");
  const [query, setQuery] = useState("");
  const [activity, setActivity] = useState(0);
  const [colorCount, setColorCount] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [ready, setReady] = useState(false);

  // Face → crop (sx,sy,sw,sh) en fraction de la vidéo
  const faceCrop = (): [number, number, number, number] => {
    switch (face) {
      case "Avant":   return [0.25, 0.25, 0.5, 0.5];
      case "Arrière": return [0, 0, 1, 1];
      case "Gauche":  return [0, 0.2, 0.45, 0.6];
      case "Droite":  return [0.55, 0.2, 0.45, 0.6];
      case "Haut":    return [0.2, 0, 0.6, 0.45];
      case "Bas":     return [0.2, 0.55, 0.6, 0.45];
    }
  };

  // Sync video time → state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => { setDuration(v.duration); setReady(true); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // Render loop: paint video → display canvas (with zoom/pan) + analyze
  useEffect(() => {
    const v = videoRef.current;
    const cv = canvasRef.current;
    if (!v || !cv) return;
    if (!analysisRef.current) analysisRef.current = document.createElement("canvas");
    const acv = analysisRef.current;
    const ctx = cv.getContext("2d");
    const actx = acv.getContext("2d", { willReadFrequently: true });
    if (!ctx || !actx) return;

    let lastAnalyze = 0;
    const loop = () => {
      if (v.readyState >= 2 && v.videoWidth > 0) {
        // Resize display canvas to its CSS box
        const w = cv.clientWidth, h = cv.clientHeight;
        if (cv.width !== w) cv.width = w;
        if (cv.height !== h) cv.height = h;

        // Face crop (source rect dans la vidéo)
        const [fx, fy, fw, fh] = faceCrop();
        const srcX = fx * v.videoWidth;
        const srcY = fy * v.videoHeight;
        const srcW = fw * v.videoWidth;
        const srcH = fh * v.videoHeight;

        // Compute draw rect (contain) avec zoom + pan
        const vAR = srcW / srcH;
        const cAR = w / h;
        let dw = w, dh = h;
        if (vAR > cAR) { dh = w / vAR; } else { dw = h * vAR; }
        dw *= zoom; dh *= zoom;
        const dx = (w - dw) / 2 + pan.x;
        const dy = (h - dh) / 2 + pan.y;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);

        // LOD : rendu via canvas intermédiaire à résolution réduite, puis upscale nearest
        const s = LOD_SCALE[lod];
        if (s < 1) {
          const lw = Math.max(8, Math.floor(dw * s));
          const lh = Math.max(8, Math.floor(dh * s));
          acv.width = lw; acv.height = lh;
          actx.imageSmoothingEnabled = true;
          actx.drawImage(v, srcX, srcY, srcW, srcH, 0, 0, lw, lh);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(acv, dx, dy, dw, dh);
        } else {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(v, srcX, srcY, srcW, srcH, dx, dy, dw, dh);
        }
        const now = performance.now();
        if (now - lastAnalyze > 160) {
          lastAnalyze = now;
          const s = LOD_SCALE[lod];
          const aw = Math.max(32, Math.floor(v.videoWidth * s * 0.25));
          const ah = Math.max(18, Math.floor(v.videoHeight * s * 0.25));
          acv.width = aw; acv.height = ah;
          actx.drawImage(v, 0, 0, aw, ah);
          const img = actx.getImageData(0, 0, aw, ah);
          const data = img.data;

          // Activity = mean abs diff vs previous frame
          let diff = 0, n = 0;
          const prev = prevFrameRef.current;
          if (prev && prev.length === data.length) {
            for (let i = 0; i < data.length; i += 16) {
              diff += Math.abs(data[i] - prev[i]) + Math.abs(data[i+1] - prev[i+1]) + Math.abs(data[i+2] - prev[i+2]);
              n++;
            }
            const a = Math.min(100, Math.round((diff / (n * 3 * 255)) * 100 * 4));
            setActivity(a);
          }
          prevFrameRef.current = new Uint8ClampedArray(data);

          // Color count: bucket RGB into 4³ cube
          const buckets = new Set<number>();
          for (let i = 0; i < data.length; i += 32) {
            const r = data[i] >> 6, g = data[i+1] >> 6, b = data[i+2] >> 6;
            buckets.add((r << 4) | (g << 2) | b);
          }
          setColorCount(buckets.size);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [zoom, pan, lod, face]);

  // Build semantic timeline from activity samples while playing
  const samplesRef = useRef<{ t: number; a: number }[]>([]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      samplesRef.current.push({ t: time, a: activity });
      // Rebuild segments
      const segs: Tag[] = [];
      const s = samplesRef.current;
      if (s.length && duration > 0) {
        let cur = bucket(s[0].a);
        let start = s[0].t;
        for (let i = 1; i < s.length; i++) {
          const b = bucket(s[i].a);
          if (b !== cur) {
            segs.push({ start: start / duration, end: s[i].t / duration, ...bucketTag(cur) });
            cur = b; start = s[i].t;
          }
        }
        segs.push({ start: start / duration, end: Math.min(1, s[s.length-1].t / duration + 0.001), ...bucketTag(cur) });
      }
      setTags(segs);
    }, 400);
    return () => clearInterval(id);
  }, [playing, time, activity, duration]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }, []);
  const seek = useCallback((s: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, s));
  }, []);
  const toggleMute = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  }, []);
  const fullscreen = useCallback(() => {
    canvasRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  // Drag-to-pan
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({ x: dragRef.current.px + (e.clientX - dragRef.current.x), y: dragRef.current.py + (e.clientY - dragRef.current.y) });
  };
  const onUp = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(1, Math.min(6, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const q = query.trim().toLowerCase();
  const visibleTags = q ? tags.filter((t) => t.label.toLowerCase().includes(q) || t.icon.includes(q)) : tags;
  const currentTag = visibleTags.find((g) => duration && time / duration >= g.start && time / duration < g.end);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <Title text="LECTEUR VIDÉO PPV" />

        <FeaturesBar
          lod={lod} onLodChange={setLod}
          face={face} onFaceChange={(f) => setFace(f as typeof face)}
          onQuery={setQuery}
        />

        {/* Transport bar */}
        <TerminalBox dense>
          <div className="flex items-center gap-1.5 flex-wrap">
            <TerminalButton onClick={() => seek(0)} title="Début"><SkipBack className="size-3" /></TerminalButton>
            <TerminalButton onClick={() => seek(time - 10)}><ChevronLeft className="size-3" /></TerminalButton>
            <TerminalButton onClick={togglePlay} active={playing}>
              {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
            </TerminalButton>
            <TerminalButton onClick={() => seek(time + 10)}><ChevronRight className="size-3" /></TerminalButton>
            <TerminalButton onClick={() => seek(duration)}><SkipForward className="size-3" /></TerminalButton>
            <span className="ml-2 text-primary tabular-nums text-[12px]">[ {fmt(time)} / {fmt(duration)} ]</span>
            <span className="flex-1" />
            <TerminalButton onClick={toggleMute} title={muted ? "Activer son" : "Couper son"}>
              {muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
            </TerminalButton>
            <TerminalButton onClick={fullscreen} title="Plein écran"><Maximize2 className="size-3" /></TerminalButton>
          </div>
        </TerminalBox>

        {/* Video area */}
        <TerminalBox className="relative aspect-[16/9] p-0 overflow-hidden">
          <video ref={videoRef} src={VIDEO_SRC} muted={muted} playsInline crossOrigin="anonymous" className="hidden" preload="metadata" />
          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onWheel={onWheel}
            onDoubleClick={togglePlay}
            className="absolute inset-0 w-full h-full block cursor-crosshair"
            style={{ cursor: zoom > 1 ? "grab" : "crosshair" }}
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-primary font-mono text-[11px] uppercase tracking-[0.3em]">
              [ Chargement flux… ]
            </div>
          )}
          {/* HUD */}
          <div className="absolute top-2 left-2 font-mono text-[10px] text-primary/80 bg-background/60 border border-primary/30 px-1.5 py-0.5">
            FACE {face.toUpperCase()} · ZOOM ×{zoom.toFixed(2)} · LOD {LOD_LABEL[lod]}
          </div>
          <div className="absolute bottom-2 right-2 flex gap-1">
            <TerminalButton onClick={() => { setZoom(1); setPan({x:0,y:0}); }} title="Reset"><Move className="size-3" /></TerminalButton>
            <TerminalButton onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>−</TerminalButton>
            <TerminalButton onClick={() => setZoom((z) => Math.min(6, z + 0.5))}>+</TerminalButton>
            <TerminalButton onClick={() => setLod((l) => (l + 1) % 3)} title="Level of Detail">LOD</TerminalButton>
          </div>
        </TerminalBox>

        {/* Semantic timeline */}
        <TerminalBox title="Timeline Sémantique">
          <div
            className="relative h-9 border border-primary/40 bg-background/60 overflow-hidden cursor-pointer"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              seek(((e.clientX - r.left) / r.width) * duration);
            }}
          >
            {visibleTags.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[10.5px] text-muted-foreground font-mono">
                [ {tags.length === 0 ? "lance la lecture pour générer les segments" : `aucun segment ne correspond à « ${query} »`} ]
              </div>
            )}
            {visibleTags.map((tag, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 flex items-center justify-center text-xs border-r border-primary/25 last:border-r-0"
                style={{
                  left: `${tag.start * 100}%`,
                  width: `${Math.max(0.4, (tag.end - tag.start) * 100)}%`,
                  background: tag.label === "rien" ? "transparent" : "oklch(0.66 0.12 190 / 0.18)",
                }}
                title={tag.label}
              >
                <span className="opacity-90">{tag.icon}</span>
              </div>
            ))}
            <div
              className="absolute top-0 bottom-0 w-px bg-accent shadow-[0_0_8px_currentColor] z-10 pointer-events-none"
              style={{ left: `${pct}%` }}
            />
          </div>
          <input
            type="range" min={0} max={duration || 1} value={time} step={0.1}
            onChange={(e) => seek(+e.target.value)}
            className="w-full mt-2 accent-[oklch(0.66_0.12_190)]"
          />
        </TerminalBox>

        {/* Live stats */}
        <TerminalBox tone="muted" dense>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11.5px] font-mono">
            <span className="flex items-center gap-1.5"><BarChart3 className="size-3 text-primary" /> Activité : <span className="text-primary tabular-nums">{activity}%</span></span>
            <span className="text-muted-foreground/50">|</span>
            <span className="flex items-center gap-1.5"><Palette className="size-3 text-accent" /> Couleurs : <span className="text-primary tabular-nums">{colorCount}</span></span>
            <span className="text-muted-foreground/50">|</span>
            <span className="flex items-center gap-1.5"><TagIcon className="size-3 text-accent" /> Segment : <span className="text-accent">{currentTag?.label ?? "—"}</span></span>
            <span className="text-muted-foreground/50">|</span>
            <span>Échantillons : <span className="text-primary tabular-nums">{samplesRef.current.length}</span></span>
          </div>
        </TerminalBox>
      </div>
    </div>
  );
}

function bucket(a: number): 0 | 1 | 2 {
  if (a < 8) return 0;
  if (a < 25) return 1;
  return 2;
}
function bucketTag(b: 0 | 1 | 2): { label: string; icon: string } {
  if (b === 0) return { label: "rien", icon: "·" };
  if (b === 1) return { label: "personne", icon: "🚶" };
  return { label: "véhicule", icon: "🚗" };
}

function Header() {
  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/60">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between font-mono text-[11px]">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> PPV Studio
        </Link>
        <div className="flex gap-2">
          <Link to="/lecteur" className="text-primary">[ LECTEUR ]</Link>
          <Link to="/navigateur" className="text-muted-foreground hover:text-foreground">[ NAVIGATEUR ]</Link>
          <Link to="/codec" className="text-muted-foreground hover:text-foreground">[ CODEC ]</Link>
        </div>
      </div>
    </header>
  );
}

function Title({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-primary">
      <span className="flex-1 border-t border-double border-primary/50" />
      <span className="uppercase tracking-[0.32em] text-[12px]">{text}</span>
      <span className="flex-1 border-t border-double border-primary/50" />
    </div>
  );
}
