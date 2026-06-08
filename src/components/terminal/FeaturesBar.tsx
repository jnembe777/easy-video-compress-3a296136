import { useState } from "react";
import { Layers, Box, Search } from "lucide-react";
import { TerminalBox, TerminalButton } from "./TerminalBox";

const LOD_LABEL = ["1/4", "1/2", "1/1"];
const FACES = ["Avant", "Arrière", "Gauche", "Droite", "Haut", "Bas"] as const;
type Face = (typeof FACES)[number];

/**
 * Barre transverse exposant les 3 fonctionnalités PP‑CODEC communes
 * à tous les outils : multi‑résolution (LOD), navigation spatiale 3D (cube),
 * et requêtes sémantiques.
 */
export function FeaturesBar({
  lod: lodProp,
  onLodChange,
  face: faceProp,
  onFaceChange,
  onQuery,
  className,
}: {
  lod?: number;
  onLodChange?: (lod: number) => void;
  face?: Face;
  onFaceChange?: (face: Face) => void;
  onQuery?: (q: string) => void;
  className?: string;
}) {
  const [lodLocal, setLodLocal] = useState(2);
  const [faceLocal, setFaceLocal] = useState<Face>("Avant");
  const [q, setQ] = useState("");

  const lod = lodProp ?? lodLocal;
  const face = faceProp ?? faceLocal;
  const setLod = (n: number) => { onLodChange ? onLodChange(n) : setLodLocal(n); };
  const setFace = (f: Face) => { onFaceChange ? onFaceChange(f) : setFaceLocal(f); };

  return (
    <TerminalBox dense className={className}>
      <div className="grid gap-2 md:grid-cols-3 text-[11.5px] font-mono">
        {/* Multi‑résolution */}
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="size-3 text-primary shrink-0" />
          <span className="text-muted-foreground shrink-0">Échelle :</span>
          <div className="flex gap-1">
            {LOD_LABEL.map((label, i) => (
              <TerminalButton key={i} active={lod === i} onClick={() => setLod(i)}>
                {label}
              </TerminalButton>
            ))}
          </div>
        </div>

        {/* Navigation spatiale */}
        <div className="flex items-center gap-2 min-w-0 md:border-l md:border-primary/20 md:pl-3">
          <Box className="size-3 text-primary shrink-0" />
          <span className="text-muted-foreground shrink-0">Face :</span>
          <select
            value={face}
            onChange={(e) => setFace(e.target.value as Face)}
            className="bg-background border border-primary/40 px-1.5 py-0.5 text-primary text-[11px]"
          >
            {FACES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Requêtes sémantiques */}
        <div className="flex items-center gap-2 min-w-0 md:border-l md:border-primary/20 md:pl-3">
          <Search className="size-3 text-primary shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onQuery?.(q); }}
            placeholder="tag:véhicule conf>0.8"
            className="flex-1 min-w-0 bg-background border border-primary/40 px-1.5 py-0.5 text-primary placeholder:text-muted-foreground/60 text-[11px]"
          />
          <TerminalButton onClick={() => onQuery?.(q)}>↵</TerminalButton>
        </div>
      </div>
    </TerminalBox>
  );
}
