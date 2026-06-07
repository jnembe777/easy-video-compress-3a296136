import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, Shield, Wand2, FileVideo, Gauge, Lock } from "lucide-react";
import { Compressor } from "@/components/Compressor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kompressr — Compression vidéo rapide, locale et sans perte" },
      { name: "description", content: "Compressez vos vidéos directement dans votre navigateur. Aucun upload, vie privée préservée, propulsé par FFmpeg WebAssembly." },
      { property: "og:title", content: "Kompressr — Compression vidéo dans le navigateur" },
      { property: "og:description", content: "Réduisez la taille de vos vidéos sans sacrifier la qualité. 100% local, 100% privé." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Lock, title: "100% local", text: "Vos vidéos ne quittent jamais votre appareil. Aucun serveur, aucun upload." },
  { icon: Zap, title: "FFmpeg WASM", text: "Le moteur professionnel FFmpeg compilé en WebAssembly tourne dans votre navigateur." },
  { icon: Wand2, title: "Presets intelligents", text: "Trois profils calibrés pour réseaux sociaux, partage web ou archive haute qualité." },
  { icon: Gauge, title: "Contrôle granulaire", text: "Ajustez la résolution, le CRF et le preset x264 selon vos besoins." },
  { icon: Shield, title: "Aucune inscription", text: "Pas de compte, pas de tracking. Ouvrez la page, compressez, partez." },
  { icon: FileVideo, title: "Tous formats", text: "MP4, MOV, WebM, MKV en entrée. MP4 H.264 optimisé en sortie." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="relative z-20 border-b border-border/50 backdrop-blur-xl bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <FileVideo className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Kompressr</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#tool" className="hover:text-foreground transition-colors">Outil</a>
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-foreground transition-colors">Comment ça marche</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-hero">
        <div className="absolute inset-0 grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Propulsé par FFmpeg WebAssembly
            </div>
            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
              Compressez vos vidéos
              <br />
              <span className="text-gradient">sans jamais les uploader.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Kompressr réduit drastiquement la taille de vos vidéos directement dans votre navigateur.
              Privée par défaut, rapide par conception.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <a href="#tool" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-3 font-medium text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                Compresser une vidéo
              </a>
              <a href="#features" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-5 py-3 font-medium hover:bg-card transition-colors">
                Découvrir
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tool */}
      <section id="tool" className="relative max-w-5xl mx-auto px-6 -mt-12 pb-24">
        <Compressor />
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-mono uppercase tracking-widest text-primary">Fonctionnalités</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3">Pensé pour les créateurs exigeants.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden">
          {features.map((f) => (
            <div key={f.title} className="bg-card p-8 hover:bg-card/60 transition-colors">
              <div className="size-11 rounded-lg bg-primary/15 border border-primary/30 grid place-items-center mb-5">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-sm font-mono uppercase tracking-widest text-primary">Comment ça marche</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3">Trois étapes. Zéro friction.</h2>
            <p className="text-muted-foreground mt-4 max-w-md">
              Pas de cloud, pas de file d'attente. Votre processeur fait tout le travail pendant que vos
              fichiers restent chez vous.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { n: "01", t: "Déposez votre vidéo", d: "Glissez un fichier ou parcourez. Le moteur FFmpeg se charge automatiquement." },
              { n: "02", t: "Choisissez vos réglages", d: "Sélectionnez un preset de qualité et ajustez l'échelle de résolution si nécessaire." },
              { n: "03", t: "Téléchargez le résultat", d: "Vidéo H.264 optimisée pour le web, avec faststart pour lecture instantanée." },
            ].map((s) => (
              <div key={s.n} className="flex gap-5 rounded-xl border border-border bg-card/40 p-5">
                <div className="font-mono text-primary text-sm pt-1">{s.n}</div>
                <div>
                  <p className="font-display text-lg font-semibold">{s.t}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-gradient-primary" />
            <span className="font-display">Kompressr</span>
          </div>
          <p>Propulsé par FFmpeg.wasm — © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
