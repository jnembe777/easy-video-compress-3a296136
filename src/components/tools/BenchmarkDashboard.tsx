import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Gauge } from "lucide-react";

interface Props { lang?: "fr" | "en"; }

const t = {
  fr: {
    title: "Benchmark Dashboard",
    sub: "Mesures FORGE-FINISHER F5 (release) et FORGE-APP Phase 1 (pyramide multi-échelle). Filtrez par activité pour explorer l'avantage PP-CODEC vs le scénario.",
    filter: "Filtrer par activité",
    all: "Tous",
    low: "≤ 5 % (surveillance)",
    high: "≥ 50 % (dense)",
    config: "Configuration",
    activity: "Activité",
    temporal: "Ratio temporel",
    pyramid: "Gain pyramidal",
    effective: "Ratio effectif",
    encode: "Encode",
    decode: "Decode",
    chartTitle: "Ratio effectif lossless (×)",
  },
  en: {
    title: "Benchmark Dashboard",
    sub: "FORGE-FINISHER F5 (release) and FORGE-APP Phase 1 (multi-scale pyramid) measurements. Filter by activity to explore PP-CODEC's edge per scenario.",
    filter: "Filter by activity",
    all: "All",
    low: "≤ 5 % (surveillance)",
    high: "≥ 50 % (dense)",
    config: "Configuration",
    activity: "Activity",
    temporal: "Temporal ratio",
    pyramid: "Pyramid gain",
    effective: "Effective ratio",
    encode: "Encode",
    decode: "Decode",
    chartTitle: "Lossless effective ratio (×)",
  },
} as const;

interface Row { id: string; config: string; activity: number; temporal: number; pyramid: number; encode: number; decode: number; }

const ROWS: Row[] = [
  { id: "surv", config: "Surveillance 128×96×128", activity: 5, temporal: 17.6, pyramid: 6.2, encode: 15, decode: 51 },
  { id: "sd",   config: "SD 360p 480×360×30",     activity: 5, temporal: 11.2, pyramid: 5.4, encode: 14, decode: 55 },
  { id: "py16", config: "Pyramide 16×16×64",      activity: 4, temporal: 8.5,  pyramid: 6.2, encode: 12, decode: 42 },
  { id: "py8",  config: "Pyramide 8×8×64",        activity: 5, temporal: 10.9, pyramid: 5.8, encode: 13, decode: 44 },
  { id: "dense",config: "Dense 64×48×64",         activity: 80, temporal: 4.6, pyramid: 1.4, encode: 14, decode: 32 },
  { id: "mid",  config: "Mid 256×144×64",         activity: 30, temporal: 7.8, pyramid: 2.6, encode: 13, decode: 48 },
];

export function BenchmarkDashboard({ lang = "fr" }: Props) {
  const L = t[lang];
  const [filter, setFilter] = useState<"all" | "low" | "high">("all");

  const data = useMemo(() => {
    const rows = ROWS.filter((r) => filter === "all" ? true : filter === "low" ? r.activity <= 5 : r.activity >= 50);
    return rows.map((r) => ({ ...r, effective: +(r.temporal * r.pyramid).toFixed(1) }));
  }, [filter]);

  const max = Math.max(...data.map((d) => d.effective), 1);

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <Gauge className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-2">{L.filter}</span>
        {([["all", L.all], ["low", L.low], ["high", L.high]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
              filter === id ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/40 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-background/40 p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.chartTitle}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fill: "currentColor" }} />
              <YAxis type="category" dataKey="id" stroke="hsl(var(--muted-foreground))" fontSize={10} width={60} tick={{ fill: "currentColor" }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.03 230)", border: "1px solid oklch(0.30 0.03 220)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="effective" radius={[0, 4, 4, 0]}>
                {data.map((d) => (
                  <Cell key={d.id} fill="oklch(0.66 0.12 190)" fillOpacity={0.3 + 0.7 * (d.effective / max)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-background/40 p-4 overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left p-2">{L.config}</th>
                <th className="text-right p-2">{L.activity}</th>
                <th className="text-right p-2">{L.temporal}</th>
                <th className="text-right p-2">{L.pyramid}</th>
                <th className="text-right p-2 text-primary">{L.effective}</th>
                <th className="text-right p-2">{L.encode}</th>
                <th className="text-right p-2">{L.decode}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id} className="border-b border-border/30 hover:bg-primary/5">
                  <td className="p-2 text-foreground">{d.config}</td>
                  <td className="p-2 text-right">{d.activity}%</td>
                  <td className="p-2 text-right">{d.temporal.toFixed(1)}×</td>
                  <td className="p-2 text-right">{d.pyramid.toFixed(1)}×</td>
                  <td className="p-2 text-right text-primary font-medium">{d.effective.toFixed(1)}×</td>
                  <td className="p-2 text-right text-muted-foreground">{d.encode} MPx/s</td>
                  <td className="p-2 text-right text-muted-foreground">{d.decode} MPx/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
