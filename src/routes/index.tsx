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
  Play,
  Box,
  Database,
  ArrowRight,
  FlaskConical,
  Building2,
  Stethoscope,
  Satellite,
  Rocket,
  Glasses,
  Clapperboard,
} from "lucide-react";
import { Compressor } from "@/components/Compressor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PPV Studio — PP‑CODEC : compression vidéo lossless 109:1" },
      {
        name: "description",
        content:
          "PP‑CODEC est un méta‑codec vidéo fondé sur les processus ponctuels marqués et le principe MDL. 109:1 lossless validé mathématiquement (Théorème 6.4).",
      },
      { property: "og:title", content: "PPV Studio — PP‑CODEC 109:1 lossless" },
      {
        property: "og:description",
        content:
          "Un paradigme pixel‑first, temporel et parcimonieux. Validation théorique + démo en navigateur.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: Activity,
    title: "Pixel‑first temporel",
    text: "Chaque pixel est un processus ponctuel marqué. Les événements sont les changements de couleur — pas les trames.",
  },
  {
    icon: Binary,
    title: "MDL & Algorithme 1",
    text: "Codeur arithmétique 30‑bit, Elias δ/γ, log₂C(r,N). Excès ≤ 2.72 bits vs optimal pour r ≤ 900.",
  },
  {
    icon: Layers,
    title: "Pyramide multi‑échelle",
    text: "Sparsité résidus 98.2%. Le spatial multiplie le gain temporel par 6.2×.",
  },
  {
    icon: Cpu,
    title: "Rust parallèle, 0 unsafe",
    text: "4 497 LOC, 84 tests verts, Rayon par bloc. Décodeur random‑access O(1) via seek table 12 B/bloc.",
  },
  {
    icon: Microscope,
    title: "Validation Hellinger",
    text: "Convergence n⁻⁰·⁷, borne du Théorème 6.4 satisfaite à 91.7% du domaine valide.",
  },
  {
    icon: Radio,
    title: "Heuristiques P3bis",
    text: "Arbres de décision embarqués : framework 100%, famille 79%. B‑spline K6 domine 55.6%.",
  },
];

const benchmarks = [
  { config: "Surveillance 128×96×128, 5% activité", ratio: "17.6 : 1", encode: "15 MPx/s", decode: "51 MPx/s" },
  { config: "SD 360p, 480×360×30, 5% activité", ratio: "11.2 : 1", encode: "14 MPx/s", decode: "55 MPx/s" },
  { config: "Dense 64×48×64, 80% activité", ratio: "4.6 : 1", encode: "14 MPx/s", decode: "32 MPx/s" },
  { config: "Pyramide 16×16×64, 4% (spatial seul)", ratio: "6.2 ×", encode: "—", decode: "—" },
];

const comparison = [
  { codec: "PP‑CODEC (surveillance lossless)", ratio: "109 : 1", lossless: "Oui", paradigm: "Pixel temporel + MDL" },
  { codec: "H.264 lossless (x264 --qp 0)", ratio: "≈ 3 : 1", lossless: "Oui", paradigm: "DCT / frame" },
  { codec: "HEVC lossless", ratio: "≈ 4 : 1", lossless: "Oui", paradigm: "DCT / frame" },
  { codec: "AV1 lossless", ratio: "≈ 4 : 1", lossless: "Oui", paradigm: "DCT / frame" },
  { codec: "FFV1 (archive lossless)", ratio: "≈ 2.5 : 1", lossless: "Oui", paradigm: "Inter‑frame predictive" },
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
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-gradient-primary grid place-items-center shadow-glow">
              <Waves className="size-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold tracking-tight">PPV Studio</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">PP‑CODEC FORGE</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#marches" className="hover:text-foreground transition-colors">Marchés</a>
            <a href="#paradigm" className="hover:text-foreground transition-colors">Technologie</a>
            <a href="#benchmarks" className="hover:text-foreground transition-colors">Benchmarks</a>
            <a href="#tools" className="hover:text-foreground transition-colors">Outils</a>
            <a href="#demos" className="hover:text-foreground transition-colors">Démos</a>
            <Link to="/en" className="font-mono text-xs uppercase tracking-widest border border-border rounded-md px-2 py-1 hover:text-foreground hover:border-primary/50 transition-colors">
              EN
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
              ROOTS INSIGHTS — Libreville · Singapour · San Francisco
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.02]">
              La vidéo n'est pas
              <br />
              une <span className="font-display-italic text-gradient">séquence de trames.</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              <span className="text-foreground">PP‑CODEC</span> est un méta‑codec vidéo fondé sur les
              processus ponctuels marqués et le principe MDL. Chaque pixel devient un flux temporel
              indépendant — et la compression devient mathématique.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 text-sm">
              <a href="#tools" className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 font-medium text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                Ouvrir les 3 outils <ArrowRight className="size-4" />
              </a>
              <Link to="/outils" className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-6 py-3 font-medium hover:bg-primary/10 transition-colors">
                <FlaskConical className="size-4 text-primary" /> 9 démos interactives
              </Link>
              <a href="#marches" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-6 py-3 font-medium hover:bg-card transition-colors">
                Pitch commercial
              </a>
              <a href="#paradigm" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-6 py-3 font-medium hover:bg-card transition-colors">
                Détails techniques
              </a>
            </div>

            {/* Hero stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat value="109 : 1" label="Lossless surveillance" sub="17.6 × 6.2" />
              <Stat value="100%" label="MDL accuracy" sub="n = 256" />
              <Stat value="0" label="Blocs unsafe Rust" sub="84 / 84 tests" />
              <Stat value="Thm 6.4" label="Validation théorique" sub="docB — 91.7%" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== TRACK COMMERCIAL ==================== */}
      <SectionDivider label="Track 1 — Vision & Marchés" />

      {/* Markets / verticals */}
      <section id="marches" className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Pitch commercial</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4 leading-tight">
              Compresser <span className="font-display-italic">l'événement</span>,
              <br />pas le pixel.
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Le premier codec vidéo lossless qui exploite la sparsité temporelle native des contenus
              statiques. Six marchés verticaux, un même paradigme.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((m) => (
              <div key={m.name} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: m.color }} />
                <m.icon className="size-6 mb-4" style={{ color: m.color }} />
                <h3 className="font-display text-xl font-semibold">{m.name}</h3>
                <p className="font-mono text-3xl mt-3" style={{ color: m.color }}>{m.ratio}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">vs {m.vs}</p>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden">
            <TamCell label="Surveillance" value="$8 B" sub="caméras IP, NVR cloud" />
            <TamCell label="Médical + Satellite" value="$4 B" sub="imagerie diagnostique, EO" />
            <TamCell label="Streaming + VR/XR" value="$12 B" sub="ciné, 360°, volumétrique" />
          </div>
        </div>
      </section>

      {/* ==================== TRACK TECHNIQUE ==================== */}
      <SectionDivider label="Track 2 — Architecture & Théorie" />

      {/* Paradigm shift */}
      <section id="paradigm" className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Le changement de paradigme</p>
              <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4 leading-tight">
                Au lieu de couper la vidéo en trames,
                <br />
                <span className="font-display-italic">on l'écoute pixel par pixel.</span>
              </h2>
              <p className="text-muted-foreground mt-6 leading-relaxed">
                Les codecs classiques — H.264, HEVC, AV1 — héritent tous du même paradigme : transformée
                DCT par bloc, prédiction inter‑trame, quantification. PP‑CODEC abandonne ce cadre.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Chaque pixel est traité comme un <span className="text-foreground">processus ponctuel
                marqué</span> dont les événements sont les changements de couleur. Le principe MDL
                (Minimum Description Length) sélectionne automatiquement la famille d'estimation la plus
                parcimonieuse parmi Trigonométrique, Haar, B‑splines K6 et Daubechies D4.
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
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Benchmarks FORGE‑FINISHER F5</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4">
              Mesuré, pas extrapolé.
            </h2>
            <p className="text-muted-foreground mt-4">
              Build release Rust, 0 unsafe. Toutes les valeurs proviennent du manifeste v1.0.
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
            Ratio effectif combiné surveillance lossless = 17.6 × 6.2 ≈ <span className="text-primary">109 : 1</span>.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Comparatif lossless</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4">
              Là où les codecs DCT s'arrêtent.
            </h2>
            <p className="text-muted-foreground mt-4">
              Sur contenu de surveillance à faible activité, le paradigme temporel exploite des structures
              que les transformées par bloc ne voient pas.
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
                  <span>Lossless : {c.lossless}</span>
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
              <h2 className="font-display text-4xl font-medium mt-4">Quatre systèmes, un méta‑codec.</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Le projet est structuré en 4 agents FORGE travaillant en parallèle, depuis la théorie
                statistique jusqu'au SDK public.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                { tag: "FINISHER", state: "F1–F5 ✓", text: "Codec Rust : pp-core + pp-codec, 4 497 LOC, format .ppv v2." },
                { tag: "SIM", state: "P1–P5 ✓", text: "Python : 6 familles, MDL, convergence Hellinger, 22 findings." },
                { tag: "APP", state: "Ph1 + Ph3 ✓", text: "Pyramide multi‑échelle 760 LOC, parallélisation Rayon." },
                { tag: "INTEG", state: "En cours", text: "Heuristics arbres P3bis embarqués. SDK + bindings WASM à venir." },
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
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Démo — référence classique</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium mt-4">
              Essayez la compression DCT, dans votre navigateur.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              En attendant les <span className="font-mono text-primary">bindings WASM</span> de PP‑CODEC
              (FORGE‑INTEG), voici une démo de compression classique <span className="text-foreground">H.264 / x264</span>{" "}
              propulsée par FFmpeg.wasm. Elle illustre l'état de l'art DCT que PP‑CODEC dépasse de
              <span className="text-primary"> 30× à 50× </span> sur contenu surveillance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
                <Lock className="size-3 text-primary" /> 100% local
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
                <Gauge className="size-3 text-primary" /> H.264 + AAC
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
                <ShieldCheck className="size-3 text-primary" /> Aucun upload
              </span>
            </div>
          </div>
          <Compressor />
          <p className="text-xs text-muted-foreground mt-6 font-mono text-center">
            Cette démo n'utilise pas PP‑CODEC. Le SDK Rust + WASM est en développement (FORGE‑INTEG).
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-hero">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <Sparkles className="size-6 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl sm:text-5xl font-medium leading-tight">
            Un méta‑codec, validé mathématiquement,
            <br />
            <span className="font-display-italic text-gradient">prêt pour l'industrie.</span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            PP‑CODEC FORGE est un projet de recherche industrielle de ROOTS INSIGHTS. Brochures
            investisseurs et études comparatives disponibles.
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
            Manifeste v1.0 — Mars 2026 · Confidentiel © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
