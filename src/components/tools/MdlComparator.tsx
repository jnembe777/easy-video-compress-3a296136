import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line } from "recharts";
import { Sparkles, Trophy } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface Props {
  lang?: "fr" | "en";
}

const t = {
  fr: {
    title: "MDL Family Comparator",
    sub: "Le principe MDL (Minimum Description Length) choisit la famille la plus parcimonieuse pour décrire un signal. Plus le coût en bits est faible, plus la famille est adaptée.",
    signal: "Signal d'entrée",
    constant: "Constant",
    sinusoidal: "Sinusoïdal",
    piecewise: "Constant par morceaux",
    smooth: "Lisse (B‑spline)",
    sparse: "Sparse (événements rares)",
    n: "Longueur du signal (n)",
    noise: "Bruit σ",
    regenerate: "Régénérer",
    cost: "Coût MDL (bits)",
    winner: "Famille gagnante",
    interpretation: "MDL = log P(data | modèle) + (k/2)·log(n) — pénalise les modèles trop riches.",
  },
  en: {
    title: "MDL Family Comparator",
    sub: "The MDL (Minimum Description Length) principle picks the most parsimonious family to describe a signal. Lower bit cost = better fit.",
    signal: "Input signal",
    constant: "Constant",
    sinusoidal: "Sinusoidal",
    piecewise: "Piecewise constant",
    smooth: "Smooth (B‑spline)",
    sparse: "Sparse (rare events)",
    n: "Signal length (n)",
    noise: "Noise σ",
    regenerate: "Regenerate",
    cost: "MDL cost (bits)",
    winner: "Winning family",
    interpretation: "MDL = log P(data | model) + (k/2)·log(n) — penalizes overly rich models.",
  },
} as const;

type SignalKind = "constant" | "sinusoidal" | "piecewise" | "smooth" | "sparse";

const FAMILIES = [
  { name: "Constant", k: 1, color: "#94a3b8" },
  { name: "Trigonometric", k: 6, color: "#06b6d4" },
  { name: "Haar", k: 8, color: "#f59e0b" },
  { name: "B‑spline K6", k: 6, color: "#00a6a0" },
  { name: "Daubechies D4", k: 8, color: "#a78bfa" },
  { name: "Markov", k: 4, color: "#ef4444" },
] as const;

function generateSignal(kind: SignalKind, n: number, noise: number, seed: number): number[] {
  // simple seeded RNG
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    let v = 0;
    switch (kind) {
      case "constant": v = 0.5; break;
      case "sinusoidal": v = 0.5 + 0.4 * Math.sin(2 * Math.PI * 3 * x); break;
      case "piecewise":
        v = x < 0.25 ? 0.2 : x < 0.55 ? 0.8 : x < 0.8 ? 0.35 : 0.9;
        break;
      case "smooth":
        v = 0.5 + 0.3 * Math.sin(2 * Math.PI * x) + 0.15 * Math.cos(4 * Math.PI * x);
        break;
      case "sparse":
        v = (rnd() < 0.03) ? 0.9 : 0.1;
        break;
    }
    out[i] = Math.max(0, Math.min(1, v + (rnd() - 0.5) * noise));
  }
  return out;
}

/**
 * Simplified MDL: residual SSE → bits via log-likelihood under Gaussian noise,
 * plus model complexity penalty (k/2)·log(n).
 * The fit "quality" per family is approximated by how well each family's
 * basis matches the signal kind — captured via a small lookup of expected residuals.
 */
function familyResidual(signalKind: SignalKind, family: typeof FAMILIES[number]["name"]): number {
  // residual SSE per sample (0 = perfect, 1 = no fit)
  const M: Record<SignalKind, Record<string, number>> = {
    constant: { Constant: 0.001, Trigonometric: 0.05, Haar: 0.04, "B‑spline K6": 0.02, "Daubechies D4": 0.04, Markov: 0.06 },
    sinusoidal: { Constant: 0.16, Trigonometric: 0.002, Haar: 0.08, "B‑spline K6": 0.01, "Daubechies D4": 0.04, Markov: 0.10 },
    piecewise: { Constant: 0.10, Trigonometric: 0.07, Haar: 0.003, "B‑spline K6": 0.03, "Daubechies D4": 0.015, Markov: 0.02 },
    smooth: { Constant: 0.10, Trigonometric: 0.015, Haar: 0.05, "B‑spline K6": 0.002, "Daubechies D4": 0.02, Markov: 0.05 },
    sparse: { Constant: 0.14, Trigonometric: 0.13, Haar: 0.05, "B‑spline K6": 0.10, "Daubechies D4": 0.06, Markov: 0.008 },
  };
  return M[signalKind][family] ?? 0.05;
}

export function MdlComparator({ lang = "fr" }: Props) {
  const L = t[lang];
  const [kind, setKind] = useState<SignalKind>("sinusoidal");
  const [n, setN] = useState(128);
  const [noise, setNoise] = useState(0.05);
  const [seed, setSeed] = useState(42);

  const signal = useMemo(() => generateSignal(kind, n, noise, seed), [kind, n, noise, seed]);

  const costs = useMemo(() => {
    return FAMILIES.map((f) => {
      const baseRes = familyResidual(kind, f.name);
      // noise increases the residual floor for all families
      const sigma2 = Math.max(1e-4, baseRes + noise * 0.02);
      // negative log-likelihood (Gaussian) for n samples + MDL penalty
      const nll = 0.5 * n * Math.log(2 * Math.PI * sigma2) + 0.5 * n;
      const penalty = (f.k / 2) * Math.log(n);
      const bits = (nll + penalty) / Math.log(2);
      return { name: f.name, k: f.k, bits: +bits.toFixed(1), color: f.color };
    });
  }, [kind, n, noise]);

  const winner = useMemo(() => costs.reduce((a, b) => (a.bits < b.bits ? a : b)), [costs]);

  const chartData = useMemo(
    () => signal.map((v, i) => ({ i, v })),
    [signal]
  );

  const kinds: { id: SignalKind; label: string }[] = [
    { id: "constant", label: L.constant },
    { id: "sinusoidal", label: L.sinusoidal },
    { id: "piecewise", label: L.piecewise },
    { id: "smooth", label: L.smooth },
    { id: "sparse", label: L.sparse },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls + signal */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3">{L.signal}</p>
            <div className="flex flex-wrap gap-2">
              {kinds.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
                    kind === k.id ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/40 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{L.n}</span>
              <span className="font-mono text-primary">{n}</span>
            </div>
            <Slider value={[n]} min={32} max={512} step={32} onValueChange={(v) => setN(v[0])} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{L.noise}</span>
              <span className="font-mono text-primary">{noise.toFixed(2)}</span>
            </div>
            <Slider value={[noise]} min={0} max={0.3} step={0.01} onValueChange={(v) => setNoise(v[0])} />
          </div>

          <Button variant="outline" size="sm" onClick={() => setSeed(Math.floor(Math.random() * 10000))}>
            {L.regenerate}
          </Button>

          <div className="rounded-lg border border-border bg-background/40 p-3">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} />
                <XAxis dataKey="i" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fill: "currentColor" }} />
                <YAxis domain={[0, 1]} stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fill: "currentColor" }} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.66 0.12 190)" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 shadow-glow flex items-center gap-4">
            <Trophy className="size-8 text-primary shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-mono">{L.winner}</p>
              <p className="font-display text-2xl mt-1">{winner.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">{winner.bits} bits · k={winner.k}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.cost}</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={costs} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fill: "currentColor" }} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} tick={{ fill: "currentColor" }} />
                <Tooltip contentStyle={{ background: "oklch(0.16 0.03 230)", border: "1px solid oklch(0.30 0.03 220)", borderRadius: 8 }} />
                <Bar dataKey="bits" radius={[0, 4, 4, 0]}>
                  {costs.map((c) => (
                    <Cell key={c.name} fill={c.name === winner.name ? "oklch(0.66 0.12 190)" : c.color} fillOpacity={c.name === winner.name ? 1 : 0.45} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-muted-foreground font-mono leading-relaxed">{L.interpretation}</p>
        </div>
      </div>
    </div>
  );
}
