import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { PixelTrace } from "@/components/tools/PixelTrace";
import { P3bisTree } from "@/components/tools/P3bisTree";
import { MdlComparator } from "@/components/tools/MdlComparator";

export const Route = createFileRoute("/outils")({
  head: () => ({
    meta: [
      { title: "Outils interactifs — PP‑CODEC FORGE" },
      { name: "description", content: "Explorez le paradigme PP‑CODEC : trace temporelle d'un pixel, arbre de décision P3bis, comparateur MDL des 6 familles d'estimation." },
      { property: "og:title", content: "Outils interactifs PP‑CODEC" },
      { property: "og:description", content: "Démonstrateurs visuels du méta‑codec : pixel temporel, P3bis, MDL." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> PPV Studio
          </Link>
          <Link to="/en/tools" className="font-mono text-xs uppercase tracking-widest border border-border rounded-md px-2 py-1 hover:text-foreground hover:border-primary/50 transition-colors text-muted-foreground">
            EN
          </Link>
        </div>
      </header>

      <section className="bg-hero border-b border-border/50">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-mono mb-6">
            <FlaskConical className="size-3" /> Vague 1 / 3
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight leading-tight max-w-3xl">
            Manipulez le codec, <span className="font-display-italic text-gradient">pas la théorie.</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
            Trois outils interactifs pour comprendre PP‑CODEC en quelques clics — sans installation, sans WASM,
            directement dans votre navigateur.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <PixelTrace lang="fr" />
        <P3bisTree lang="fr" />
        <MdlComparator lang="fr" />
      </div>

      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs">PP‑CODEC FORGE · Outils v1 · Vague 1/3</span>
          <Link to="/" className="hover:text-foreground transition-colors">← Retour à la landing</Link>
        </div>
      </footer>
    </div>
  );
}
