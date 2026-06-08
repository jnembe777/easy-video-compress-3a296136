import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, RotateCcw, BarChart3, Search, Download, Play, Pencil, Trash2, Plus, Clock } from "lucide-react";
import { TerminalBox, TerminalButton } from "@/components/terminal/TerminalBox";

export const Route = createFileRoute("/codec")({
  head: () => ({
    meta: [
      { title: "Codec PPV — Sémantique & Métadonnées" },
      { name: "description", content: "Moteur de requêtes sémantiques sur flux PPV + éditeur de métadonnées par bloc." },
    ],
  }),
  component: Codec,
});

type Tab = "query" | "meta";

type Result = { time: string; block: string; tag: string; conf: number };
const INITIAL_RESULTS: Result[] = [
  { time: "00:02:34", block: "B(0,0)", tag: "véhicule", conf: 0.92 },
  { time: "00:02:45", block: "B(0,1)", tag: "véhicule", conf: 0.89 },
  { time: "00:03:12", block: "B(1,0)", tag: "personne", conf: 0.87 },
  { time: "00:05:45", block: "B(1,1)", tag: "incident", conf: 0.95 },
];

type Meta = { range: string; label: string; icon: string; conf: number };
const INITIAL_META: Meta[] = [
  { range: "00:02:34-00:02:45", label: "véhicule", icon: "🚗", conf: 0.92 },
  { range: "00:03:12-00:03:28", label: "personne", icon: "🚶", conf: 0.87 },
  { range: "00:05:45-00:06:02", label: "incident", icon: "🔥", conf: 0.95 },
];

const TAG_OPTIONS = ["véhicule", "personne", "animal", "incident", "mouvement", "statique"];

function Codec() {
  const [tab, setTab] = useState<Tab>("query");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <div className="flex gap-2">
          <TerminalButton active={tab === "query"} onClick={() => setTab("query")}>
            ▸ Moteur de requêtes
          </TerminalButton>
          <TerminalButton active={tab === "meta"} onClick={() => setTab("meta")}>
            ▸ Éditeur de métadonnées
          </TerminalButton>
        </div>

        {tab === "query" ? <QueryPanel /> : <MetaPanel />}
      </div>
    </div>
  );
}

function QueryPanel() {
  const defaultQuery = `SELECT time, location, tag
FROM video_stream
WHERE tag = 'véhicule' AND magnitude > 0.8
AND location IN (B(0,0), B(0,1), B(1,0), B(1,1))
ORDER BY time ASC`;
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<Result[]>(INITIAL_RESULTS);
  const [elapsed, setElapsed] = useState(23);

  const run = () => {
    setElapsed(15 + Math.floor(Math.random() * 30));
    if (/personne/i.test(query)) {
      setResults([
        { time: "00:03:12", block: "B(1,0)", tag: "personne", conf: 0.87 },
        { time: "00:03:28", block: "B(1,1)", tag: "personne", conf: 0.83 },
      ]);
    } else if (/incident/i.test(query)) {
      setResults([{ time: "00:05:45", block: "B(1,1)", tag: "incident", conf: 0.95 }]);
    } else {
      setResults(INITIAL_RESULTS);
    }
  };

  return (
    <div className="space-y-5">
      <Title text="MOTEUR DE REQUÊTES SÉMANTIQUES" />

      <TerminalBox title="Requête">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          className="w-full bg-transparent text-primary font-mono text-[12.5px] leading-relaxed resize-none outline-none min-h-[120px]"
        />
        <div className="flex justify-end mt-1">
          <TerminalButton onClick={run}><Play className="size-3 inline mr-1" /> Exécuter</TerminalButton>
        </div>
      </TerminalBox>

      <TerminalBox title={`Résultats — ${results.length} occurrence${results.length>1?"s":""} en 0.0${elapsed}s`}>
        <div className="space-y-0.5 text-[12px]">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 font-mono py-0.5 border-b border-primary/10 last:border-b-0">
              <span className="text-primary tabular-nums">{r.time}</span>
              <Sep />
              <span className="text-foreground/90 w-14">{r.block}</span>
              <Sep />
              <span className="text-accent w-20">{r.tag}</span>
              <Sep />
              <span className="text-muted-foreground">conf={r.conf.toFixed(2)}</span>
              <span className="flex-1" />
              <TerminalButton><Play className="size-3 inline mr-1" /> Lire</TerminalButton>
            </div>
          ))}
        </div>
      </TerminalBox>

      <div className="flex gap-2 flex-wrap">
        <TerminalButton><Download className="size-3 inline mr-1" /> Exporter</TerminalButton>
        <TerminalButton><BarChart3 className="size-3 inline mr-1" /> Analyser</TerminalButton>
        <TerminalButton><Search className="size-3 inline mr-1" /> Nouvelle recherche</TerminalButton>
      </div>
    </div>
  );
}

function MetaPanel() {
  const [tags, setTags] = useState<Meta[]>(INITIAL_META);
  const [newTag, setNewTag] = useState("véhicule");
  const [range, setRange] = useState("00:02:34-00:02:45");
  const [dx, setDx] = useState(2);
  const [dy, setDy] = useState(-1);
  const conf = 0.88;

  const add = () => {
    const icon = newTag === "véhicule" ? "🚗" : newTag === "personne" ? "🚶" : newTag === "incident" ? "🔥" : "•";
    setTags([...tags, { range, label: newTag, icon, conf: 0.8 + Math.random() * 0.2 }]);
  };
  const remove = (i: number) => setTags(tags.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <Title text="ÉDITEUR DE MÉTADONNÉES SÉMANTIQUES" />

      <TerminalBox dense>
        <div className="text-[12px] font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Bloc : <span className="text-primary">B(5,3)</span></span>
          <Sep />
          <span className="text-muted-foreground">[16×16]</span>
          <Sep />
          <span>Frames : <span className="text-primary">128–256</span></span>
          <Sep />
          <span>Tags actuels : <span className="text-accent">🚗</span></span>
        </div>
      </TerminalBox>

      <TerminalBox title="Ajouter un tag">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-background border border-primary/50 px-2 py-1 font-mono text-primary"
          >
            {TAG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <span className="text-muted-foreground"><Clock className="size-3 inline mr-1" /></span>
          <input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-background border border-primary/50 px-2 py-1 font-mono text-primary w-44"
          />
          <TerminalButton onClick={add}><Plus className="size-3 inline" /></TerminalButton>
        </div>
        <div className="mt-1.5 text-[10.5px] text-muted-foreground tracking-wide">
          {TAG_OPTIONS.join(" · ")}
        </div>
      </TerminalBox>

      <TerminalBox title="Tags existants">
        <div className="space-y-0.5 text-[12px] font-mono">
          {tags.map((m, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap py-0.5 border-b border-primary/10 last:border-b-0">
              <span className="text-accent">{m.icon}</span>
              <span className="w-20">{m.label}</span>
              <Sep />
              <span className="text-primary tabular-nums">{m.range}</span>
              <Sep />
              <span className="text-muted-foreground">conf={m.conf.toFixed(2)}</span>
              <span className="flex-1" />
              <TerminalButton><Pencil className="size-3 inline" /></TerminalButton>
              <TerminalButton onClick={() => remove(i)}><Trash2 className="size-3 inline" /></TerminalButton>
            </div>
          ))}
        </div>
      </TerminalBox>

      <TerminalBox title="Vecteur de mouvement">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono">
          <label className="flex items-center gap-1">
            dx :
            <input type="number" value={dx} onChange={(e) => setDx(+e.target.value)}
              className="w-16 bg-background border border-primary/50 px-2 py-1 text-primary" />
          </label>
          <label className="flex items-center gap-1">
            dy :
            <input type="number" value={dy} onChange={(e) => setDy(+e.target.value)}
              className="w-16 bg-background border border-primary/50 px-2 py-1 text-primary" />
          </label>
          <span className="text-muted-foreground">conf={conf.toFixed(2)}</span>
          <TerminalButton>Auto</TerminalButton>
        </div>
      </TerminalBox>

      <div className="flex gap-2 flex-wrap">
        <TerminalButton><Save className="size-3 inline mr-1" /> Appliquer</TerminalButton>
        <TerminalButton><RotateCcw className="size-3 inline mr-1" /> Réinitialiser</TerminalButton>
        <TerminalButton><BarChart3 className="size-3 inline mr-1" /> Statistiques du bloc</TerminalButton>
      </div>
    </div>
  );
}

function Sep() {
  return <span className="text-muted-foreground/40">|</span>;
}

function Header() {
  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/60">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between font-mono text-[11px]">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> PPV Studio
        </Link>
        <div className="flex gap-2">
          <Link to="/lecteur" className="text-muted-foreground hover:text-foreground">[ LECTEUR ]</Link>
          <Link to="/navigateur" className="text-muted-foreground hover:text-foreground">[ NAVIGATEUR ]</Link>
          <Link to="/codec" className="text-primary">[ CODEC ]</Link>
        </div>
      </div>
    </header>
  );
}

function Title({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-primary">
      <span className="flex-1 border-t border-double border-primary/50" />
      <span className="uppercase tracking-[0.32em] text-[12px]">{text}</span>
      <span className="flex-1 border-t border-double border-primary/50" />
    </div>
  );
}
