import { useRef, useState } from "react";
import { Upload, Crosshair, Film } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Button } from "@/components/ui/button";

type Sample = { t: number; r: number; g: number; b: number; event?: boolean };

const SAMPLE_COUNT = 120;
const EVENT_THRESHOLD = 18;

interface Props {
  lang?: "fr" | "en";
}

const t = {
  fr: {
    title: "Pixel Temporal Trace",
    sub: "Le concept central de PP‑CODEC : chaque pixel est un processus ponctuel marqué dont les événements sont les changements de couleur.",
    drop: "Déposez une vidéo pour commencer",
    hint: "MP4, MOV, WebM — analyse 100% locale, ~120 échantillons sur toute la durée",
    pick: "Cliquez sur la vidéo pour choisir un pixel",
    analyze: "Analyser le pixel",
    analyzing: "Échantillonnage en cours…",
    change: "Changer de vidéo",
    pixel: "Pixel",
    events: "événements détectés",
    threshold: "seuil ΔE",
    interpretation: "Interprétation",
    interpTxt: "Sur ce pixel, le codec n'encode QUE les transitions. Sur une vidéo de surveillance, 95% des pixels n'ont que quelques événements par seconde — d'où le ratio lossless 109:1.",
  },
  en: {
    title: "Pixel Temporal Trace",
    sub: "The core idea behind PP‑CODEC: every pixel is a marked point process whose events are color changes.",
    drop: "Drop a video to get started",
    hint: "MP4, MOV, WebM — fully local analysis, ~120 samples across the full duration",
    pick: "Click on the video to pick a pixel",
    analyze: "Analyze pixel",
    analyzing: "Sampling…",
    change: "Change video",
    pixel: "Pixel",
    events: "detected events",
    threshold: "ΔE threshold",
    interpretation: "Interpretation",
    interpTxt: "On this pixel, the codec only encodes transitions. On surveillance video, 95% of pixels have just a few events per second — hence the 109:1 lossless ratio.",
  },
} as const;

export function PixelTrace({ lang = "fr" }: Props) {
  const L = t[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [coord, setCoord] = useState<{ x: number; y: number } | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [running, setRunning] = useState(false);

  const handleFile = (f?: File) => {
    if (!f) return;
    if (url) URL.revokeObjectURL(url);
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setCoord(null);
    setSamples([]);
  };

  const handleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = video.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width;
    const sy = (e.clientY - rect.top) / rect.height;
    const x = Math.floor(sx * video.videoWidth);
    const y = Math.floor(sy * video.videoHeight);
    setCoord({ x, y });
    setSamples([]);
  };

  const analyze = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !coord) return;
    setRunning(true);
    setSamples([]);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const duration = video.duration;
    const out: Sample[] = [];
    let prev: { r: number; g: number; b: number } | null = null;

    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const time = (i / (SAMPLE_COUNT - 1)) * duration;
      video.currentTime = time;
      await new Promise<void>((r) => {
        const onSeek = () => {
          video.removeEventListener("seeked", onSeek);
          r();
        };
        video.addEventListener("seeked", onSeek);
      });
      ctx.drawImage(video, 0, 0);
      const p = ctx.getImageData(coord.x, coord.y, 1, 1).data;
      const r = p[0], g = p[1], b = p[2];
      let event = false;
      if (prev) {
        const d = Math.sqrt((r - prev.r) ** 2 + (g - prev.g) ** 2 + (b - prev.b) ** 2);
        event = d > EVENT_THRESHOLD;
      }
      out.push({ t: +time.toFixed(2), r, g, b, event });
      prev = { r, g, b };
      setSamples([...out]);
    }
    setRunning(false);
  };

  const eventCount = samples.filter((s) => s.event).length;

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6">
        <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
      </div>

      {!url && (
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl py-14 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors">
          <div className="size-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
            <Upload className="size-6 text-primary-foreground" />
          </div>
          <p className="font-display text-lg">{L.drop}</p>
          <p className="text-xs text-muted-foreground">{L.hint}</p>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
      )}

      {url && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Film className="size-4 text-primary shrink-0" />
              <span className="truncate text-sm">{file?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setUrl(null); setFile(null); setSamples([]); setCoord(null); }}>
              {L.change}
            </Button>
          </div>

          <div className="relative inline-block max-w-full">
            <video
              ref={videoRef}
              src={url}
              controls
              onClick={handleClick}
              className="max-w-full rounded-lg border border-border cursor-crosshair"
              crossOrigin="anonymous"
            />
            {coord && videoRef.current && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${(coord.x / videoRef.current.videoWidth) * 100}%`,
                  top: `${(coord.y / videoRef.current.videoHeight) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Crosshair className="size-6 text-primary drop-shadow-[0_0_4px_black]" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex items-center justify-between gap-4 flex-wrap text-sm">
            <p className="text-muted-foreground">
              {coord
                ? <>{L.pixel} <span className="font-mono text-primary">({coord.x}, {coord.y})</span></>
                : L.pick}
            </p>
            <Button onClick={analyze} disabled={!coord || running} className="bg-gradient-primary shadow-glow">
              {running ? L.analyzing : L.analyze}
            </Button>
          </div>

          {samples.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={samples}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={11} tick={{ fill: "currentColor" }} />
                    <YAxis domain={[0, 255]} stroke="hsl(var(--muted-foreground))" fontSize={11} tick={{ fill: "currentColor" }} />
                    <Tooltip contentStyle={{ background: "oklch(0.16 0.03 230)", border: "1px solid oklch(0.30 0.03 220)", borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="r" stroke="#ef4444" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="g" stroke="#22c55e" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="b" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Event timeline */}
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                  Events · {L.threshold} = {EVENT_THRESHOLD}
                </p>
                <div className="relative h-10 bg-background rounded border border-border overflow-hidden">
                  {samples.map((s, i) =>
                    s.event ? (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-primary shadow-[0_0_6px_currentColor]"
                        style={{ left: `${(i / (samples.length - 1)) * 100}%` }}
                        title={`t=${s.t}s`}
                      />
                    ) : null
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{L.events}</p>
                  <p className="font-display text-3xl text-primary mt-1">{eventCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">/ {samples.length} samples</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-primary font-mono">{L.interpretation}</p>
                  <p className="text-xs mt-2 leading-relaxed text-muted-foreground">{L.interpTxt}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
