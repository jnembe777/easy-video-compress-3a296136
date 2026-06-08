import { useMemo, useState } from "react";
import { Binary, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { lang?: "fr" | "en"; }

const t = {
  fr: {
    title: "Arithmetic Coder Playground",
    sub: "Saisissez une séquence de symboles. Le codeur arithmétique 30-bit (encoder.rs, arithmetic.rs) calcule les CDFs, restreint l'intervalle [lo, hi] et émet les bits convergents (E1/E2/E3).",
    seq: "Séquence",
    encode: "Encoder",
    randomize: "Aléatoire",
    probs: "Probabilités (CDF)",
    bits: "Flux binaire",
    stats: "Statistiques",
    entropy: "Entropie H(X)",
    actual: "Bits réels",
    overhead: "Excès",
    perSymbol: "bits/symbole",
    steps: "Trace d'encodage",
  },
  en: {
    title: "Arithmetic Coder Playground",
    sub: "Type a symbol sequence. The 30-bit arithmetic coder (encoder.rs, arithmetic.rs) computes CDFs, narrows the [lo, hi] interval and emits convergent bits (E1/E2/E3).",
    seq: "Sequence",
    encode: "Encode",
    randomize: "Random",
    probs: "Probabilities (CDF)",
    bits: "Bit stream",
    stats: "Stats",
    entropy: "Entropy H(X)",
    actual: "Actual bits",
    overhead: "Overhead",
    perSymbol: "bits/symbol",
    steps: "Encoding trace",
  },
} as const;

interface Step { i: number; sym: string; lo: number; hi: number; emitted: string; }

function encode(seq: string): { bits: string; steps: Step[]; cdf: Map<string, [number, number]>; probs: Map<string, number> } {
  const counts = new Map<string, number>();
  for (const c of seq) counts.set(c, (counts.get(c) ?? 0) + 1);
  const total = seq.length;
  const symbols = [...counts.keys()].sort();
  const probs = new Map<string, number>();
  const cdf = new Map<string, [number, number]>();
  let acc = 0;
  for (const s of symbols) {
    const p = (counts.get(s) ?? 0) / total;
    probs.set(s, p);
    cdf.set(s, [acc, acc + p]);
    acc += p;
  }

  // 30-bit interval arithmetic, simplified (no explicit E1/E2/E3 carry resolution here — illustrative)
  const PRECISION = 30;
  const TOP = (1 << PRECISION) >>> 0;
  const HALF = TOP / 2;
  const QTR = TOP / 4;
  const TQTR = 3 * QTR;
  let lo = 0;
  let hi = TOP - 1;
  let pending = 0;
  const out: string[] = [];
  const steps: Step[] = [];

  const emit = (b: 0 | 1) => {
    out.push(String(b));
    for (let i = 0; i < pending; i++) out.push(String(1 - b));
    pending = 0;
  };

  for (let i = 0; i < seq.length; i++) {
    const sym = seq[i];
    const [pl, ph] = cdf.get(sym)!;
    const range = hi - lo + 1;
    const newHi = lo + Math.floor(range * ph) - 1;
    const newLo = lo + Math.floor(range * pl);
    lo = newLo;
    hi = newHi;

    const before = out.length;
    while (true) {
      if (hi < HALF) emit(0);
      else if (lo >= HALF) { emit(1); lo -= HALF; hi -= HALF; }
      else if (lo >= QTR && hi < TQTR) { pending++; lo -= QTR; hi -= QTR; }
      else break;
      lo = (lo << 1) >>> 0;
      hi = ((hi << 1) | 1) >>> 0;
    }
    steps.push({ i, sym, lo, hi, emitted: out.slice(before).join("") });
  }
  // flush
  pending++;
  if (lo < QTR) emit(0); else emit(1);

  return { bits: out.join(""), steps, cdf, probs };
}

export function ArithmeticCoder({ lang = "fr" }: Props) {
  const L = t[lang];
  const [seq, setSeq] = useState("ABRACADABRA");

  const res = useMemo(() => encode(seq || "A"), [seq]);

  const entropy = useMemo(() => {
    let H = 0;
    for (const p of res.probs.values()) if (p > 0) H -= p * Math.log2(p);
    return H;
  }, [res.probs]);

  const actualPerSym = res.bits.length / Math.max(1, seq.length);

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <Binary className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2 block">{L.seq}</label>
            <textarea
              value={seq}
              onChange={(e) => setSeq(e.target.value.slice(0, 200))}
              rows={3}
              className="w-full rounded-md border border-border bg-background/40 p-3 font-mono text-sm focus:outline-none focus:border-primary/60"
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                const alphabet = "ABCD";
                let s = "";
                for (let i = 0; i < 24; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
                setSeq(s);
              }}>
                <Play className="size-3 mr-1" /> {L.randomize}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.probs}</p>
            <div className="space-y-1.5">
              {[...res.cdf.entries()].map(([s, [lo, hi]]) => (
                <div key={s} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-6 text-primary">{s === " " ? "·" : s}</span>
                  <div className="flex-1 h-3 rounded bg-card/60 relative overflow-hidden">
                    <div
                      className="absolute h-full bg-primary/60"
                      style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-muted-foreground">{((hi - lo) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-primary mb-3">{L.stats}</p>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <p className="text-muted-foreground">{L.entropy}</p>
                <p className="text-foreground text-lg mt-1">{entropy.toFixed(3)}</p>
                <p className="text-[10px] text-muted-foreground">{L.perSymbol}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{L.actual}</p>
                <p className="text-primary text-lg mt-1">{actualPerSym.toFixed(3)}</p>
                <p className="text-[10px] text-muted-foreground">{L.perSymbol}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{L.overhead}</p>
                <p className="text-foreground text-lg mt-1">{(actualPerSym - entropy).toFixed(3)}</p>
                <p className="text-[10px] text-muted-foreground">bits</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.bits} · {res.bits.length} bits</p>
            <div className="font-mono text-xs break-all leading-relaxed text-primary/90 max-h-32 overflow-auto">
              {res.bits.match(/.{1,8}/g)?.join(" ")}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.steps}</p>
            <div className="max-h-72 overflow-auto font-mono text-[11px]">
              <table className="w-full">
                <thead className="text-muted-foreground sticky top-0 bg-background/80">
                  <tr><th className="text-left p-1">#</th><th className="text-left p-1">sym</th><th className="text-left p-1">lo</th><th className="text-left p-1">hi</th><th className="text-left p-1">out</th></tr>
                </thead>
                <tbody>
                  {res.steps.map((s) => (
                    <tr key={s.i} className="border-t border-border/30">
                      <td className="p-1 text-muted-foreground">{s.i}</td>
                      <td className="p-1 text-primary">{s.sym}</td>
                      <td className="p-1">{s.lo.toString(16).padStart(8, "0")}</td>
                      <td className="p-1">{s.hi.toString(16).padStart(8, "0")}</td>
                      <td className="p-1 text-foreground/80">{s.emitted || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
