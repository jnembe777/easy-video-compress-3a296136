import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from "recharts";
import { Activity, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface Props { lang?: "fr" | "en"; }

const t = {
  fr: {
    title: "PP Simulator — Poisson non-homogène",
    sub: "Génère un processus ponctuel non-homogène par thinning (phase1_generators.py). Choisissez la forme de l'intensité λ(t), réglez son amplitude, et observez les événements échantillonnés.",
    shape: "Forme de λ(t)",
    constant: "Constante",
    sinus: "Sinus",
    bspline: "B-spline",
    haar: "Haar (créneaux)",
    amplitude: "Amplitude λ_max",
    horizon: "Horizon T",
    regenerate: "Régénérer",
    events: "Événements",
    avg: "λ moyen",
    lambda: "λ(t)",
    pts: "Événements PP",
  },
  en: {
    title: "PP Simulator — non-homogeneous Poisson",
    sub: "Generates a non-homogeneous point process via thinning (phase1_generators.py). Pick the intensity λ(t) shape, tune amplitude, and watch sampled events.",
    shape: "λ(t) shape",
    constant: "Constant",
    sinus: "Sine",
    bspline: "B-spline",
    haar: "Haar (step)",
    amplitude: "Amplitude λ_max",
    horizon: "Horizon T",
    regenerate: "Regenerate",
    events: "Events",
    avg: "Mean λ",
    lambda: "λ(t)",
    pts: "PP events",
  },
} as const;

type Shape = "constant" | "sinus" | "bspline" | "haar";

function lambdaAt(shape: Shape, t: number, T: number, amp: number): number {
  const x = t / T;
  switch (shape) {
    case "constant": return amp * 0.5;
    case "sinus":    return amp * (0.5 + 0.45 * Math.sin(2 * Math.PI * 2 * x));
    case "bspline": {
      // 3 cubic bumps
      const bump = (c: number) => {
        const d = Math.abs(x - c) * 6;
        return d > 1 ? 0 : Math.pow(1 - d, 3);
      };
      return amp * (0.15 + 0.85 * (bump(0.2) + bump(0.55) + bump(0.85)));
    }
    case "haar":
      return amp * (x < 0.25 ? 0.2 : x < 0.55 ? 0.85 : x < 0.8 ? 0.35 : 0.95);
  }
}

function simulate(shape: Shape, T: number, amp: number, seed: number): { events: number[]; curve: { t: number; lam: number }[]; lamMax: number } {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const steps = 200;
  const curve: { t: number; lam: number }[] = [];
  let lamMax = 0;
  for (let i = 0; i <= steps; i++) {
    const tt = (i / steps) * T;
    const l = lambdaAt(shape, tt, T, amp);
    curve.push({ t: +tt.toFixed(3), lam: +l.toFixed(3) });
    if (l > lamMax) lamMax = l;
  }
  // Thinning: homogeneous λ_max, accept with prob λ(t)/λ_max
  const events: number[] = [];
  let tt = 0;
  while (tt < T) {
    const u = rnd();
    tt += -Math.log(Math.max(1e-9, u)) / lamMax;
    if (tt >= T) break;
    if (rnd() < lambdaAt(shape, tt, T, amp) / lamMax) events.push(+tt.toFixed(3));
  }
  return { events, curve, lamMax };
}

export function PpSimulator({ lang = "fr" }: Props) {
  const L = t[lang];
  const [shape, setShape] = useState<Shape>("sinus");
  const [amp, setAmp] = useState(8);
  const [T, setT] = useState(10);
  const [seed, setSeed] = useState(7);

  const { events, curve } = useMemo(() => simulate(shape, T, amp, seed), [shape, T, amp, seed]);
  const avg = useMemo(() => curve.reduce((a, c) => a + c.lam, 0) / curve.length, [curve]);

  const shapes: { id: Shape; label: string }[] = [
    { id: "constant", label: L.constant }, { id: "sinus", label: L.sinus },
    { id: "bspline", label: L.bspline }, { id: "haar", label: L.haar },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <Activity className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3">{L.shape}</p>
            <div className="flex flex-wrap gap-2">
              {shapes.map((sh) => (
                <button key={sh.id} onClick={() => setShape(sh.id)}
                  className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
                    shape === sh.id ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/40 text-muted-foreground hover:border-primary/40"
                  }`}>
                  {sh.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span>{L.amplitude}</span><span className="font-mono text-primary">{amp.toFixed(1)}</span></div>
            <Slider value={[amp]} min={1} max={20} step={0.5} onValueChange={(v) => setAmp(v[0])} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span>{L.horizon}</span><span className="font-mono text-primary">{T}</span></div>
            <Slider value={[T]} min={2} max={20} step={1} onValueChange={(v) => setT(v[0])} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setSeed(Math.floor(Math.random() * 10000))}>
            <RefreshCw className="size-3 mr-1" /> {L.regenerate}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-[10px] uppercase tracking-widest text-primary font-mono">{L.events}</p>
              <p className="font-display text-2xl mt-1">{events.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{L.avg}</p>
              <p className="font-display text-2xl mt-1">{avg.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/40 p-4">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={curve}>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} />
              <XAxis dataKey="t" type="number" domain={[0, T]} stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fill: "currentColor" }} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fill: "currentColor" }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.03 230)", border: "1px solid oklch(0.30 0.03 220)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="lam" name={L.lambda} stroke="oklch(0.66 0.12 190)" strokeWidth={2} dot={false} />
              {events.slice(0, 200).map((e, i) => (
                <ReferenceDot key={i} x={e} y={0.2} r={3} fill="#f59e0b" stroke="none" ifOverflow="extendDomain" />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-muted-foreground font-mono mt-2">● {L.pts} ({events.length})</p>
        </div>
      </div>
    </div>
  );
}
