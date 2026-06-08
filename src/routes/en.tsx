import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Binary,
  Cpu,
  Gauge,
  Layers,
  Lock,
  Microscope,
  Radio,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { Compressor } from "@/components/Compressor";

export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { title: "PPV Studio — PP‑CODEC: 109:1 lossless video compression" },
      {
        name: "description",
        content:
          "PP‑CODEC is a video meta‑codec grounded in marked point processes and the MDL principle. 109:1 lossless, mathematically validated (Theorem 6.4).",
      },
      { property: "og:title", content: "PPV Studio — PP‑CODEC 109:1 lossless" },
      {
        property: "og:description",
        content:
          "A pixel‑first, temporal and parsimonious paradigm. Theoretical validation + in‑browser demo.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: Activity,
    title: "Pixel‑first temporal",
    text: "Every pixel is a marked point process. Events are color changes — not frames.",
  },
  {
    icon: Binary,
    title: "MDL & Algorithm 1",
    text: "30‑bit arithmetic coder, Elias δ/γ, log₂C(r,N). Excess ≤ 2.72 bits vs optimal for r ≤ 900.",
  },
  {
    icon: Layers,
    title: "Multi‑scale pyramid",
    text: "98.2% residual sparsity. Spatial layer multiplies temporal gain by 6.2×.",
  },
  {
    icon: Cpu,
    title: "Parallel Rust, 0 unsafe",
    text: "4,497 LOC, 84 passing tests, Rayon per‑block. O(1) random‑access decoder via 12 B/block seek table.",
  },
  {
    icon: Microscope,
    title: "Hellinger validation",
    text: "n⁻⁰·⁷ convergence, Theorem 6.4 bound satisfied on 91.7% of the valid domain.",
  },
  {
    icon: Radio,
    title: "P3bis heuristics",
    text: "Embedded decision trees: framework 100%, family 79%. B‑spline K6 dominates at 55.6%.",
  },
];

const benchmarks = [
  { config: "Surveillance 128×96×128, 5% activity", ratio: "17.6 : 1", encode: "15 MPx/s", decode: "51 MPx/s" },
  { config: "SD 360p, 480×360×30, 5% activity", ratio: "11.2 : 1", encode: "14 MPx/s", decode: "55 MPx/s" },
  { config: "Dense 64×48×64, 80% activity", ratio: "4.6 : 1", encode: "14 MPx/s", decode: "32 MPx/s" },
  { config: "Pyramid 16×16×64, 4% (spatial only)", ratio: "6.2 ×", encode: "—", decode: "—" },
];

const comparison = [
  { codec: "PP‑CODEC (surveillance lossless)", ratio: "109 : 1", lossless: "Yes", paradigm: "Pixel‑temporal + MDL" },
  { codec: "H.264 lossless (x264 --qp 0)", ratio: "≈ 3 : 1", lossless: "Yes", paradigm: "DCT / frame" },
  { codec: "HEVC lossless", ratio: "≈ 4 : 1", lossless: "Yes", paradigm: "DCT / frame" },
  { codec: "AV1 lossless", ratio: "≈ 4 : 1", lossless: "Yes", paradigm: "DCT / frame" },
  { codec: "FFV1 (lossless archive)", ratio: "≈ 2.5 : 1", lossless: "Yes", paradigm: "Inter‑frame predictive" },
];

function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-6">
      <p className="font-display text-4xl sm:text-5xl text-primary tracking-tight">{value}</p>
      <p className="mt-2 font-medium">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1 font-mono">{sub}</p>}
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="relative z-20 border-b border-border/50 backdrop-blur-xl bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-gradient-primary grid place-items-center shadow-glow">
              <Waves className="size-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold tracking-tight">PPV Studio</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">PP‑CODEC FORGE</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#paradigm" className="hover:text-foreground transition-colors">Paradigm</a>
            <a href="#benchmarks" className="hover:text-foreground transition-colors">Benchmarks</a>
            <a href="#compare" className="hover:text-foreground transition-colors">Comparison</a>
            <Link to="/en/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
            <Link to="/" className="font-mono text-xs uppercase tracking-widest border border-border rounded-md px-2 py-1 hover:text-foreground hover:border-primary/50 transition-colors">
              FR
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-hero">
        <div className="absolute inset-0 grid-pattern opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 sm:pt-32 sm:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-mono mb-8">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              ROOTS INSIGHTS — Libreville · Singapore · San Francisco
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.02]">
              Video is not
              <br />
              a <span className="font-display-italic text-gradient">sequence of frames.</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              <span className="text-foreground">PP‑CODEC</span> is a video meta‑codec grounded in
              marked point processes and the MDL principle. Each pixel becomes an independent
              temporal stream — and compression becomes mathematical.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 text-sm">
              <a
                href="#benchmarks"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 font-medium text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
              >
                See the benchmarks
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-6 py-3 font-medium hover:bg-card transition-colors"
              >
                Try the classic demo
              </a>
            </div>

            {/* Hero stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat value="109 : 1" label="Lossless surveillance" sub="17.6 × 6.2" />
              <Stat value="100%" label="MDL accuracy" sub="n = 256" />
              <Stat value="0" label="Rust unsafe blocks" sub="84 / 84 tests" />
              <Stat value="Thm 6.4" label="Theoretical validation" sub="docB — 91.7%" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Paradigm shift */}
      <section id="paradigm" className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">The paradigm shift</p>
              <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4 leading-tight">
                Instead of slicing video into frames,
                <br />
                <span className="font-display-italic">we listen to it pixel by pixel.</span>
              </h2>
              <p className="text-muted-foreground mt-6 leading-relaxed">
                Classical codecs — H.264, HEVC, AV1 — all inherit from the same paradigm: block‑based
                DCT transform, inter‑frame prediction, quantization. PP‑CODEC discards that frame.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Each pixel is treated as a <span className="text-foreground">marked point
                process</span> whose events are color changes. The MDL (Minimum Description Length)
                principle automatically selects the most parsimonious estimation family among
                Trigonometric, Haar, B‑spline K6 and Daubechies D4.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-px bg-border/60 rounded-2xl overflow-hidden">
              {pillars.map((p) => (
                <div key={p.title} className="bg-card p-7 hover:bg-card/70 transition-colors">
                  <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center mb-5">
                    <p.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benchmarks */}
      <section id="benchmarks" className="border-t border-border/50 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">FORGE‑FINISHER F5 benchmarks</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4">
              Measured, not extrapolated.
            </h2>
            <p className="text-muted-foreground mt-4">
              Rust release build, 0 unsafe. All values come from manifesto v1.0.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-elegant">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-background/40 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <div className="col-span-6">Configuration</div>
              <div className="col-span-2 text-right">Ratio</div>
              <div className="col-span-2 text-right">Encode</div>
              <div className="col-span-2 text-right">Decode</div>
            </div>
            {benchmarks.map((b, i) => (
              <div
                key={b.config}
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center ${
                  i < benchmarks.length - 1 ? "border-b border-border/60" : ""
                }`}
              >
                <div className="col-span-6 text-sm">{b.config}</div>
                <div className="col-span-2 text-right font-display text-2xl text-primary">{b.ratio}</div>
                <div className="col-span-2 text-right text-sm font-mono text-muted-foreground">{b.encode}</div>
                <div className="col-span-2 text-right text-sm font-mono text-muted-foreground">{b.decode}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4 font-mono">
            Combined effective ratio, lossless surveillance = 17.6 × 6.2 ≈ <span className="text-primary">109 : 1</span>.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Lossless comparison</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4">
              Where DCT codecs stop.
            </h2>
            <p className="text-muted-foreground mt-4">
              On low‑activity surveillance content, the temporal paradigm exploits structures that
              block‑based transforms simply cannot see.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {comparison.map((c, i) => (
              <div
                key={c.codec}
                className={`rounded-xl border p-6 ${
                  i === 0
                    ? "border-primary/50 bg-primary/5 shadow-glow"
                    : "border-border bg-card/40"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className={`font-display text-lg font-semibold ${i === 0 ? "text-primary" : ""}`}>
                    {c.codec}
                  </h3>
                  <p className={`font-display text-3xl ${i === 0 ? "text-primary" : "text-foreground"}`}>
                    {c.ratio}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs font-mono text-muted-foreground">
                  <span>Lossless: {c.lossless}</span>
                  <span>·</span>
                  <span>{c.paradigm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-t border-border/50 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Architecture</p>
              <h2 className="font-display text-4xl font-medium mt-4">Four systems, one meta‑codec.</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                The project is structured around 4 FORGE agents working in parallel, from statistical
                theory all the way to the public SDK.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                { tag: "FINISHER", state: "F1–F5 ✓", text: "Rust codec: pp-core + pp-codec, 4,497 LOC, .ppv v2 format." },
                { tag: "SIM", state: "P1–P5 ✓", text: "Python: 6 families, MDL, Hellinger convergence, 22 findings." },
                { tag: "APP", state: "Ph1 + Ph3 ✓", text: "Multi‑scale pyramid 760 LOC, Rayon parallelization." },
                { tag: "INTEG", state: "In progress", text: "Embedded P3bis tree heuristics. SDK + WASM bindings to come." },
              ].map((s) => (
                <div key={s.tag} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-wider text-primary">FORGE‑{s.tag}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{s.state}</p>
                  </div>
                  <p className="text-sm mt-3 leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo — classical compression */}
      <section id="demo" className="border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Demo — classical reference</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4">
              Try DCT compression, right in your browser.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              While the <span className="font-mono text-primary">WASM bindings</span> for PP‑CODEC
              (FORGE‑INTEG) are still in development, here is a classical
              <span className="text-foreground"> H.264 / x264 </span> compression demo powered by
              FFmpeg.wasm. It illustrates the state‑of‑the‑art DCT baseline that PP‑CODEC outperforms
              by <span className="text-primary">30× to 50×</span> on surveillance content.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
                <Lock className="size-3 text-primary" /> 100% local
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
                <Gauge className="size-3 text-primary" /> H.264 + AAC
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
                <ShieldCheck className="size-3 text-primary" /> No upload
              </span>
            </div>
          </div>
          <Compressor />
          <p className="text-xs text-muted-foreground mt-6 font-mono text-center">
            This demo does not use PP‑CODEC. The Rust + WASM SDK is in development (FORGE‑INTEG).
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-hero">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <Sparkles className="size-6 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl sm:text-5xl font-medium leading-tight">
            A meta‑codec, mathematically validated,
            <br />
            <span className="font-display-italic text-gradient">industry‑ready.</span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            PP‑CODEC FORGE is an industrial research project by ROOTS INSIGHTS. Investor brochures and
            comparative studies available on request.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-md bg-gradient-primary" />
            <div className="leading-tight">
              <p className="font-display text-foreground">PPV Studio · PP‑CODEC</p>
              <p className="text-[10px] font-mono uppercase tracking-widest">ROOTS INSIGHTS</p>
            </div>
          </div>
          <p className="font-mono text-xs">
            Manifesto v1.0 — March 2026 · Confidential © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
