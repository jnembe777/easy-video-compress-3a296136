import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { PixelTrace } from "@/components/tools/PixelTrace";
import { P3bisTree } from "@/components/tools/P3bisTree";
import { MdlComparator } from "@/components/tools/MdlComparator";
import { HellingerChart } from "@/components/tools/HellingerChart";
import { ArithmeticCoder } from "@/components/tools/ArithmeticCoder";
import { BenchmarkDashboard } from "@/components/tools/BenchmarkDashboard";
import { PpSimulator } from "@/components/tools/PpSimulator";
import { SpatialPyramid } from "@/components/tools/SpatialPyramid";
import { PpvInspector } from "@/components/tools/PpvInspector";

export const Route = createFileRoute("/en/tools")({
  head: () => ({
    meta: [
      { title: "Interactive tools — PP‑CODEC FORGE" },
      { name: "description", content: "Explore the PP‑CODEC paradigm: pixel temporal trace, P3bis decision tree, MDL comparator across 6 estimation families." },
      { property: "og:title", content: "PP‑CODEC interactive tools" },
      { property: "og:description", content: "Visual demonstrators for the meta‑codec: pixel‑temporal, P3bis, MDL." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> PPV Studio
          </Link>
          <Link to="/outils" className="font-mono text-xs uppercase tracking-widest border border-border rounded-md px-2 py-1 hover:text-foreground hover:border-primary/50 transition-colors text-muted-foreground">
            FR
          </Link>
        </div>
      </header>

      <section className="bg-hero border-b border-border/50">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-mono mb-6">
            <FlaskConical className="size-3" /> Wave 3 / 3 — complete
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight leading-tight max-w-3xl">
            Touch the codec, <span className="font-display-italic text-gradient">not the theory.</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
            Nine interactive tools for PP‑CODEC — pixel paradigm, P3bis, MDL, Hellinger, arithmetic coder,
            benchmarks, Poisson NH simulator, spatial pyramid and .ppv inspector. No install, no WASM.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <PixelTrace lang="en" />
        <P3bisTree lang="en" />
        <MdlComparator lang="en" />
        <HellingerChart lang="en" />
        <ArithmeticCoder lang="en" />
        <BenchmarkDashboard lang="en" />
        <PpSimulator lang="en" />
        <SpatialPyramid lang="en" />
        <PpvInspector lang="en" />
      </div>

      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs">PP‑CODEC FORGE · Tools v3 · Wave 3/3</span>
          <Link to="/en" className="hover:text-foreground transition-colors">← Back to landing</Link>
        </div>
      </footer>
    </div>
  );
}
