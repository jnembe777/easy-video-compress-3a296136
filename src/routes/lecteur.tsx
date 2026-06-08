import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward, Volume2, Maximize2 } from "lucide-react";
import { TerminalBox, TerminalButton } from "@/components/terminal/TerminalBox";

export const Route = createFileRoute("/lecteur")({
  head: () => ({
    meta: [
      { title: "Lecteur PPV — PPV Studio" },
      { name: "description", content: "Lecteur vidéo PPV avec timeline sémantique, LOD adaptatif et zoom Canvas/WebGL." },
    ],
  }),
  component: Lecteur,
});

type Tag = { start: number; end: number; label: string; icon: string };
const TAGS: Tag[] = [
  { start: 0, end: 0.2, label: "véhicule", icon: "🚗" },
  { start: 0.2, end: 0.4, label: "rien", icon: "·" },
  { start: 0.4, end: 0.7, label: "personne", icon: "🚶" },
  { start: 0.7, end: 1, label: "rien", icon: "·" },
];

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function Lecteur() {
  const DUR = 942; // 15:42
  const [t, setT] = useState(154); // 02:34
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [lod, setLod] = useState(2);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((p) => {
        const n = p + dt;
        if (n >= DUR) {
          setPlaying(false);
          return DUR;
        }
        return n;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing]);

  const pct = (t / DUR) * 100;
  const currentTag = TAGS.find((g) => t / DUR >= g.start && t / DUR < g.end) ?? TAGS[0];
  const activity = 23;
  const colors = 12;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <Title text="LECTEUR VIDÉO PPV" />

        {/* Transport bar */}
        <TerminalBox>
          <div className="flex items-center gap-2 flex-wrap">
            <TerminalButton onClick={() => setT(0)}><SkipBack className="size-3 inline" /></TerminalButton>
            <TerminalButton onClick={() => setT((p) => Math.max(0, p - 10))}><ChevronLeft className="size-3 inline" /></TerminalButton>
            <TerminalButton onClick={() => setPlaying((p) => !p)} active={playing}>
              {playing ? <Pause className="size-3 inline" /> : <Play className="size-3 inline" />}
            </TerminalButton>
            <TerminalButton onClick={() => setT((p) => Math.min(DUR, p + 10))}><ChevronRight className="size-3 inline" /></TerminalButton>
            <TerminalButton onClick={() => setT(DUR)}><SkipForward className="size-3 inline" /></TerminalButton>
            <span className="px-3 text-primary tabular-nums">[{fmt(t)} / {fmt(DUR)}]</span>
            <TerminalButton><Volume2 className="size-3 inline" /></TerminalButton>
            <TerminalButton><Maximize2 className="size-3 inline" /></TerminalButton>
          </div>
        </TerminalBox>

        {/* Video area */}
        <TerminalBox className="aspect-video flex items-center justify-center">
          <div className="border-2 border-double border-primary/60 px-8 py-6 text-center bg-primary/5">
            <p className="text-primary font-mono text-sm uppercase tracking-widest">ZONE VIDÉO</p>
            <p className="text-xs text-muted-foreground mt-1">(Canvas / WebGL)</p>
            <p className="text-xs text-muted-foreground mt-3">[Zoom: {zoom}%]</p>
            <p className="text-xs text-muted-foreground">[LOD: {lod}/2]</p>
            <div className="flex gap-2 justify-center mt-4">
              <TerminalButton onClick={() => setZoom((z) => Math.max(50, z - 25))}>−</TerminalButton>
              <TerminalButton onClick={() => setZoom((z) => Math.min(400, z + 25))}>+</TerminalButton>
              <TerminalButton onClick={() => setLod((l) => (l + 1) % 3)}>LOD</TerminalButton>
            </div>
          </div>
        </TerminalBox>

        {/* Semantic timeline */}
        <TerminalBox title="Timeline Sémantique">
          <div className="relative h-10 border border-primary/40 bg-background overflow-hidden">
            {TAGS.map((tag, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 flex items-center justify-center text-xs border-r border-primary/30 last:border-r-0"
                style={{
                  left: `${tag.start * 100}%`,
                  width: `${(tag.end - tag.start) * 100}%`,
                  background: tag.label === "rien" ? "transparent" : "oklch(0.66 0.12 190 / 0.12)",
                }}
                title={tag.label}
              >
                <span className="opacity-80">{tag.icon}</span>
              </div>
            ))}
            <div
              className="absolute top-0 bottom-0 w-px bg-accent shadow-[0_0_8px_currentColor] z-10"
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
            {TAGS.map((g, i) => <span key={i}>({g.label})</span>)}
          </div>
          <input
            type="range" min={0} max={DUR} value={t} step={0.1}
            onChange={(e) => setT(+e.target.value)}
            className="w-full mt-3 accent-[oklch(0.66_0.12_190)]"
          />
        </TerminalBox>

        {/* Stats */}
        <TerminalBox tone="muted">
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs">
            <span>📊 Activité : <span className="text-primary">{activity}%</span></span>
            <span>🎨 Couleurs : <span className="text-primary">{colors}</span></span>
            <span>🏷  Tag courant : <span className="text-accent">{currentTag.label}</span></span>
          </div>
        </TerminalBox>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/60">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between font-mono text-xs">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> PPV Studio
        </Link>
        <div className="flex gap-2">
          <Link to="/lecteur" className="text-primary">[LECTEUR]</Link>
          <Link to="/navigateur" className="text-muted-foreground hover:text-foreground">[NAVIGATEUR]</Link>
          <Link to="/codec" className="text-muted-foreground hover:text-foreground">[CODEC]</Link>
        </div>
      </div>
    </header>
  );
}

function Title({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-primary">
      <span className="flex-1 border-t-2 border-double border-primary/60" />
      <span className="uppercase tracking-[0.3em] text-sm">{text}</span>
      <span className="flex-1 border-t-2 border-double border-primary/60" />
    </div>
  );
}
