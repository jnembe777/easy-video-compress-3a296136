import { useEffect, useRef, useState } from "react";
import { Layers, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { lang?: "fr" | "en"; }

const t = {
  fr: {
    title: "Spatial Pyramid Visualizer",
    sub: "Décomposition multi-échelle (multiscale.rs) : moyennage par blocs 2^k, puis affichage des résidus. Sur surveillance, les résidus atteignent 98.2 % de sparsité — d'où le gain pyramidal ×6.2.",
    upload: "Charger une image",
    base: "Base",
    levels: "Niveaux",
    residuals: "Résidus (×4 pour la lisibilité)",
    sparsity: "Sparsité résidus",
    threshold: "Seuil bruit",
    sample: "Image démo",
  },
  en: {
    title: "Spatial Pyramid Visualizer",
    sub: "Multi-scale decomposition (multiscale.rs): block-averaging by 2^k, then residual display. On surveillance footage, residuals hit 98.2 % sparsity — hence the ×6.2 pyramid gain.",
    upload: "Upload image",
    base: "Base",
    levels: "Levels",
    residuals: "Residuals (×4 for visibility)",
    sparsity: "Residual sparsity",
    threshold: "Noise threshold",
    sample: "Demo image",
  },
} as const;

function drawSampleTo(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  // Gradient sky
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1a2540"); g.addColorStop(1, "#3b6fa0");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Ground
  ctx.fillStyle = "#0d1b1a"; ctx.fillRect(0, H * 0.65, W, H * 0.35);
  // Sun
  ctx.fillStyle = "#f5d76e"; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.3, 18, 0, 2 * Math.PI); ctx.fill();
  // Buildings
  ctx.fillStyle = "#0a0f1d";
  for (let i = 0; i < 8; i++) {
    const w = 14 + (i % 3) * 8, h = 30 + (i * 7) % 60;
    ctx.fillRect(i * 22 + 4, H * 0.65 - h, w, h);
  }
  // moving dot (event)
  ctx.fillStyle = "#00a6a0"; ctx.beginPath(); ctx.arc(W * 0.35, H * 0.55, 4, 0, 2 * Math.PI); ctx.fill();
}

function downscale(src: ImageData, factor: number): ImageData {
  const W = src.width, H = src.height;
  const nW = Math.max(1, Math.floor(W / factor)), nH = Math.max(1, Math.floor(H / factor));
  const out = new ImageData(nW, nH);
  for (let y = 0; y < nH; y++) {
    for (let x = 0; x < nW; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const sx = x * factor + dx, sy = y * factor + dy;
          if (sx >= W || sy >= H) continue;
          const idx = (sy * W + sx) * 4;
          r += src.data[idx]; g += src.data[idx + 1]; b += src.data[idx + 2]; n++;
        }
      }
      const o = (y * nW + x) * 4;
      out.data[o] = r / n; out.data[o + 1] = g / n; out.data[o + 2] = b / n; out.data[o + 3] = 255;
    }
  }
  return out;
}

function upscaleNearest(src: ImageData, W: number, H: number): ImageData {
  const out = new ImageData(W, H);
  const sx = src.width / W, sy = src.height / H;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ix = Math.min(src.width - 1, Math.floor(x * sx));
      const iy = Math.min(src.height - 1, Math.floor(y * sy));
      const si = (iy * src.width + ix) * 4;
      const oi = (y * W + x) * 4;
      out.data[oi] = src.data[si]; out.data[oi + 1] = src.data[si + 1];
      out.data[oi + 2] = src.data[si + 2]; out.data[oi + 3] = 255;
    }
  }
  return out;
}

export function SpatialPyramid({ lang = "fr" }: Props) {
  const L = t[lang];
  const baseRef = useRef<HTMLCanvasElement>(null);
  const lvlRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  const resRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  const [sparsity, setSparsity] = useState(0);
  const [threshold, setThreshold] = useState(12);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    const base = baseRef.current; if (!base) return;
    base.width = 256; base.height = 192;
    const proceed = () => {
      const ctx = base.getContext("2d")!;
      const data = ctx.getImageData(0, 0, base.width, base.height);
      const factors = [2, 4, 8];
      let zeros = 0, total = 0;
      factors.forEach((f, i) => {
        const down = downscale(data, f);
        const lvl = lvlRefs[i].current!; lvl.width = base.width; lvl.height = base.height;
        const up = upscaleNearest(down, base.width, base.height);
        lvl.getContext("2d")!.putImageData(up, 0, 0);

        const res = resRefs[i].current!; res.width = base.width; res.height = base.height;
        const resImg = new ImageData(base.width, base.height);
        for (let p = 0; p < data.data.length; p += 4) {
          const dr = data.data[p] - up.data[p];
          const dg = data.data[p + 1] - up.data[p + 1];
          const db = data.data[p + 2] - up.data[p + 2];
          const mag = Math.abs(dr) + Math.abs(dg) + Math.abs(db);
          if (mag < threshold) { zeros++; resImg.data[p] = resImg.data[p + 1] = resImg.data[p + 2] = 8; }
          else {
            const v = Math.min(255, mag * 4);
            resImg.data[p] = v; resImg.data[p + 1] = v * 0.6; resImg.data[p + 2] = 0;
          }
          resImg.data[p + 3] = 255;
          if (i === 2) total++;
        }
        res.getContext("2d")!.putImageData(resImg, 0, 0);
      });
      setSparsity(total ? (zeros / 3 / total) * 100 : 0);
    };
    if (imgSrc) {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        base.getContext("2d")!.drawImage(img, 0, 0, base.width, base.height);
        proceed();
      };
      img.src = imgSrc;
    } else {
      drawSampleTo(base); proceed();
    }
  }, [imgSrc, threshold]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setImgSrc(r.result as string); r.readAsDataURL(f);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <Layers className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs rounded-md border border-border px-3 py-2 bg-card/40 hover:border-primary/40 cursor-pointer">
          <Upload className="size-3" /> {L.upload}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        {imgSrc && <Button size="sm" variant="ghost" onClick={() => setImgSrc(null)}>{L.sample}</Button>}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">{L.threshold}</span>
          <input type="range" min={4} max={48} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="w-32 accent-primary" />
          <span className="font-mono text-xs text-primary w-8">{threshold}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-background/40 p-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2 px-1">{L.base}</p>
          <canvas ref={baseRef} className="w-full rounded" />
        </div>
        {[2, 4, 8].map((f, i) => (
          <div key={f} className="rounded-lg border border-border bg-background/40 p-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 px-1">L{i + 1} · ÷{f}</p>
            <canvas ref={lvlRefs[i]} className="w-full rounded" />
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-6 mb-2">{L.residuals}</p>
      <div className="grid md:grid-cols-3 gap-3">
        {[2, 4, 8].map((f, i) => (
          <div key={f} className="rounded-lg border border-border bg-background/40 p-2">
            <p className="text-[10px] font-mono text-muted-foreground mb-2 px-1">R{i + 1} (L{i + 1})</p>
            <canvas ref={resRefs[i]} className="w-full rounded" />
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-primary">{L.sparsity}</p>
        <p className="font-display text-3xl text-foreground">{sparsity.toFixed(1)} <span className="text-base text-muted-foreground">%</span></p>
      </div>
    </div>
  );
}
