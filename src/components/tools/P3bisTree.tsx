import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { GitBranch, ArrowRight } from "lucide-react";

interface Props {
  lang?: "fr" | "en";
}

const t = {
  fr: {
    title: "P3bis Decision Tree",
    sub: "Arbres de décision embarqués dans heuristics.rs. Le codec choisit son framework et sa famille d'estimation en O(1) — sans entraînement, sans réseau de neurones.",
    framework: "Framework",
    family: "Famille",
    accuracy: "Précision validée",
    rule: "Règle déclenchée",
    inputs: "Caractéristiques du bloc",
    palette: "Taille palette (m)",
    lambda: "Intensité moyenne (λ_avg)",
    spectral: "Énergie spectrale",
    peak: "Peak ratio",
    r: "Longueur fenêtre (r)",
    paletteHint: "Nombre de couleurs distinctes",
    lambdaHint: "Événements par échantillon",
    spectralHint: "Détecte la périodicité",
    peakHint: "Pic FFT dominant",
    rHint: "Frames analysées par bloc",
  },
  en: {
    title: "P3bis Decision Tree",
    sub: "Decision trees embedded in heuristics.rs. The codec picks its framework and estimation family in O(1) — no training, no neural network.",
    framework: "Framework",
    family: "Family",
    accuracy: "Validated accuracy",
    rule: "Rule fired",
    inputs: "Block characteristics",
    palette: "Palette size (m)",
    lambda: "Mean intensity (λ_avg)",
    spectral: "Spectral energy",
    peak: "Peak ratio",
    r: "Window length (r)",
    paletteHint: "Distinct color count",
    lambdaHint: "Events per sample",
    spectralHint: "Detects periodicity",
    peakHint: "Dominant FFT peak",
    rHint: "Frames per block",
  },
} as const;

function decideFramework(m: number, lambdaAvg: number) {
  // m ≤ 5 → Vector | λ_avg ≤ 0.67 → Marked | else → Vector
  if (m <= 5) return { value: "Vector", rule: "m ≤ 5" };
  if (lambdaAvg <= 0.67) return { value: "Marked", rule: "m > 5 ∧ λ_avg ≤ 0.67" };
  return { value: "Vector", rule: "m > 5 ∧ λ_avg > 0.67" };
}

function decideFamily(lambdaAvg: number, spectral: number, peak: number, r: number) {
  if (lambdaAvg < 0.01) return { value: "Constant", rule: "λ_avg < 0.01" };
  if (spectral > 50 && peak > 1.8) return { value: "Trigonometric", rule: "spectral > 50 ∧ peak > 1.8" };
  if (r <= 32) return { value: "Daubechies D4 (J=2)", rule: "r ≤ 32" };
  return { value: "B‑spline K=6", rule: "default (dominates 55.6%)" };
}

export function P3bisTree({ lang = "fr" }: Props) {
  const L = t[lang];
  const [m, setM] = useState(16);
  const [lambdaAvg, setLambdaAvg] = useState(0.45);
  const [spectral, setSpectral] = useState(28);
  const [peak, setPeak] = useState(1.4);
  const [r, setR] = useState(64);

  const framework = useMemo(() => decideFramework(m, lambdaAvg), [m, lambdaAvg]);
  const family = useMemo(() => decideFamily(lambdaAvg, spectral, peak, r), [lambdaAvg, spectral, peak, r]);

  const sliders: Array<{ label: string; hint: string; value: number; set: (n: number) => void; min: number; max: number; step: number; fmt: (n: number) => string }> = [
    { label: L.palette, hint: L.paletteHint, value: m, set: setM, min: 1, max: 256, step: 1, fmt: (n) => String(n) },
    { label: L.lambda, hint: L.lambdaHint, value: lambdaAvg, set: setLambdaAvg, min: 0, max: 1, step: 0.01, fmt: (n) => n.toFixed(2) },
    { label: L.spectral, hint: L.spectralHint, value: spectral, set: setSpectral, min: 0, max: 120, step: 1, fmt: (n) => String(n) },
    { label: L.peak, hint: L.peakHint, value: peak, set: setPeak, min: 0, max: 4, step: 0.05, fmt: (n) => n.toFixed(2) },
    { label: L.r, hint: L.rHint, value: r, set: setR, min: 8, max: 900, step: 8, fmt: (n) => String(n) },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <GitBranch className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-3 space-y-5">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">{L.inputs}</p>
          {sliders.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-sm mb-2">
                <span>
                  {s.label} <span className="text-xs text-muted-foreground">· {s.hint}</span>
                </span>
                <span className="font-mono text-primary">{s.fmt(s.value)}</span>
              </div>
              <Slider value={[s.value]} min={s.min} max={s.max} step={s.step} onValueChange={(v) => s.set(v[0])} />
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 shadow-glow">
            <p className="text-xs uppercase tracking-widest text-primary font-mono">{L.framework}</p>
            <p className="font-display text-3xl mt-2">{framework.value}</p>
            <p className="text-xs font-mono text-muted-foreground mt-2">
              <ArrowRight className="inline size-3 mr-1" />
              {framework.rule}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-3">{L.accuracy} · 100%</p>
          </div>

          <div className="rounded-xl border border-accent/40 bg-accent/5 p-5">
            <p className="text-xs uppercase tracking-widest text-accent font-mono">{L.family}</p>
            <p className="font-display text-2xl mt-2 text-accent">{family.value}</p>
            <p className="text-xs font-mono text-muted-foreground mt-2">
              <ArrowRight className="inline size-3 mr-1" />
              {family.rule}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-3">{L.accuracy} · 79%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
