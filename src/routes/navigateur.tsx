import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RotateCcw, Camera, Save, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from "lucide-react";
import { TerminalBox, TerminalButton } from "@/components/terminal/TerminalBox";

export const Route = createFileRoute("/navigateur")({
  head: () => ({
    meta: [
      { title: "Navigateur 3D — PPV Studio" },
      { name: "description", content: "Navigateur cube 6 faces avec LOD progressif sur flux PPV." },
    ],
  }),
  component: Navigateur,
});

type Face = "Avant" | "Arrière" | "Gauche" | "Droite" | "Haut" | "Bas";

function Navigateur() {
  const [focus, setFocus] = useState<Face>("Avant");
  const [zoom, setZoom] = useState(100);

  const lod = (f: Face) => (f === focus ? 2 : f === "Haut" || f === "Bas" ? 0 : 1);
  const lateral = focus === "Gauche" || focus === "Droite" ? 2 : 1;
  const arriere = focus === "Arrière" ? 2 : 0;

  const FaceBox = ({ name, area }: { name: Face; area: string }) => (
    <button
      onClick={() => setFocus(name)}
      className={`relative border border-double font-mono text-center transition-all ${
        focus === name
          ? "border-primary bg-primary/15 text-primary shadow-[0_0_24px_oklch(0.66_0.12_190/0.4)]"
          : "border-primary/40 text-foreground/80 hover:border-primary/70"
      }`}
      style={{ gridArea: area }}
    >
      <div className="p-2 text-[11px] uppercase tracking-wider">
        <div>{name}</div>
        <div className="mt-0.5 opacity-70 text-[10px] normal-case tracking-normal">(LOD {lod(name)})</div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <Title text="NAVIGATEUR 3D — CUBE 6 FACES" />

        <TerminalBox>
          <div
            className="grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: "1fr 1.5fr 1fr",
              gridTemplateRows: "0.7fr 1.5fr 0.7fr",
              gridTemplateAreas: `". haut ." "gauche avant droite" ". bas ."`,
              minHeight: 300,
              maxWidth: 560,
            }}
          >
            <FaceBox name="Haut" area="haut" />
            <FaceBox name="Gauche" area="gauche" />
            <div style={{ gridArea: "avant" }} className="relative border border-double border-primary bg-primary/10 grid place-items-center">
              <div className="absolute top-1.5 left-2 right-2 text-[10px] font-mono text-primary/70 uppercase tracking-wider text-center">
                Arrière
              </div>
              <button onClick={() => setFocus("Avant")} className="font-mono text-primary text-center">
                <div className="text-[12px] uppercase tracking-wider">Avant</div>
                <div className="text-[10px] opacity-70 mt-0.5">(LOD 2)</div>
              </button>
            </div>
            <FaceBox name="Droite" area="droite" />
            <FaceBox name="Bas" area="bas" />
          </div>
        </TerminalBox>

        <TerminalBox dense>
          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">Direction :</span>
              <TerminalButton onClick={() => setFocus("Gauche")}><ArrowLeftIcon className="size-3" /></TerminalButton>
              <TerminalButton onClick={() => setFocus("Haut")}><ArrowUp className="size-3" /></TerminalButton>
              <TerminalButton onClick={() => setFocus("Bas")}><ArrowDown className="size-3" /></TerminalButton>
              <TerminalButton onClick={() => setFocus("Droite")}><ArrowRight className="size-3" /></TerminalButton>
              <span className="px-2 text-muted-foreground/60">|</span>
              <span className="text-muted-foreground">Zoom :</span>
              <input
                type="range" min={25} max={400} value={zoom}
                onChange={(e) => setZoom(+e.target.value)}
                className="w-32 accent-[oklch(0.66_0.12_190)]"
              />
              <span className="text-primary tabular-nums">{zoom}%</span>
            </div>
            <div className="text-muted-foreground">
              LOD Actuel : <span className="text-primary">Avant={lod("Avant")}</span>,{" "}
              <span className="text-primary">Latéral={lateral}</span>,{" "}
              <span className="text-primary">Arrière={arriere}</span>
            </div>
          </div>
        </TerminalBox>

        <div className="flex gap-2 flex-wrap">
          <TerminalButton onClick={() => { setFocus("Avant"); setZoom(100); }}>
            <RotateCcw className="size-3 inline mr-1" /> Réinitialiser Vue
          </TerminalButton>
          <TerminalButton><Camera className="size-3 inline mr-1" /> Capture</TerminalButton>
          <TerminalButton><Save className="size-3 inline mr-1" /> Enregistrer Navig.</TerminalButton>
        </div>
      </div>
    </div>
  );
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
          <Link to="/navigateur" className="text-primary">[ NAVIGATEUR ]</Link>
          <Link to="/codec" className="text-muted-foreground hover:text-foreground">[ CODEC ]</Link>
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
