import { useMemo, useState } from "react";
import { FileCode } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Props { lang?: "fr" | "en"; }

const t = {
  fr: {
    title: ".ppv Format Inspector",
    sub: "Génère un fichier .ppv v2 synthétique (§4.3 du manifeste) et explore sa décomposition byte-level : magic, header, seek table, blocs de données.",
    width: "Largeur",
    height: "Hauteur",
    frames: "Frames",
    blockSize: "Taille bloc",
    layout: "Structure du fichier",
    hex: "Vue hex (header + seek table)",
    magic: "Magic 'PPV\\x02'",
    header: "Header (w, h, f, block, palette)",
    nblocks: "num_blocks",
    seek: "Seek table (offset, size, bits)",
    blocks: "Données blocs",
    total: "Taille totale",
  },
  en: {
    title: ".ppv Format Inspector",
    sub: "Generates a synthetic .ppv v2 file (manifest §4.3) and explores its byte-level layout: magic, header, seek table, data blocks.",
    width: "Width",
    height: "Height",
    frames: "Frames",
    blockSize: "Block size",
    layout: "File layout",
    hex: "Hex view (header + seek table)",
    magic: "Magic 'PPV\\x02'",
    header: "Header (w, h, f, block, palette)",
    nblocks: "num_blocks",
    seek: "Seek table (offset, size, bits)",
    blocks: "Block data",
    total: "Total size",
  },
} as const;

function buildPpv(w: number, h: number, frames: number, block: number) {
  const palette = 32;
  const numBlocks = Math.ceil(w / block) * Math.ceil(h / block);
  const headerSize = 4 + 20 + 4 + numBlocks * 12;
  // Per-block data size (synthetic) — small with low activity, larger otherwise
  let dataOffset = headerSize;
  const seek: { offset: number; size: number; bits: number }[] = [];
  for (let i = 0; i < numBlocks; i++) {
    const size = 24 + Math.round(8 * Math.sin(i) ** 2 + (i * 7) % 40);
    seek.push({ offset: dataOffset, size, bits: size * 8 - Math.round(Math.random() * 6) });
    dataOffset += size;
  }
  const totalSize = dataOffset;

  // build bytes for the first 64 of header + seek for hex view
  const bytes = new Uint8Array(Math.min(96, headerSize));
  bytes[0] = 0x50; bytes[1] = 0x50; bytes[2] = 0x56; bytes[3] = 0x02; // PPV\x02
  const dv = new DataView(bytes.buffer);
  dv.setUint32(4, w, true);
  dv.setUint32(8, h, true);
  dv.setUint32(12, frames, true);
  dv.setUint32(16, block, true);
  dv.setUint32(20, palette, true);
  dv.setUint32(24, numBlocks, true);
  // first seek entry
  if (numBlocks > 0) {
    dv.setUint32(28, seek[0].offset, true);
    dv.setUint32(32, seek[0].size, true);
    dv.setUint32(36, seek[0].bits, true);
  }
  if (numBlocks > 1) {
    dv.setUint32(40, seek[1].offset, true);
    dv.setUint32(44, seek[1].size, true);
    dv.setUint32(48, seek[1].bits, true);
  }

  return { bytes, numBlocks, headerSize, totalSize, seek, palette };
}

export function PpvInspector({ lang = "fr" }: Props) {
  const L = t[lang];
  const [w, setW] = useState(128);
  const [h, setH] = useState(96);
  const [frames, setFrames] = useState(64);
  const [block, setBlock] = useState(16);

  const ppv = useMemo(() => buildPpv(w, h, frames, block), [w, h, frames, block]);

  const hexRows = useMemo(() => {
    const rows: { offset: string; hex: string; ascii: string; tag: string }[] = [];
    for (let i = 0; i < ppv.bytes.length; i += 16) {
      const slice = ppv.bytes.slice(i, i + 16);
      const hex = [...slice].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = [...slice].map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
      let tag = "";
      if (i < 4) tag = "magic";
      else if (i < 24) tag = "header";
      else if (i < 28) tag = "nblocks";
      else tag = "seek";
      rows.push({ offset: i.toString(16).padStart(4, "0"), hex, ascii, tag });
    }
    return rows;
  }, [ppv]);

  const segments = [
    { label: L.magic, size: 4, color: "#f59e0b" },
    { label: L.header, size: 20, color: "#06b6d4" },
    { label: L.nblocks, size: 4, color: "#a78bfa" },
    { label: L.seek, size: ppv.numBlocks * 12, color: "#22c55e" },
    { label: L.blocks, size: ppv.totalSize - ppv.headerSize, color: "oklch(0.66 0.12 190)" },
  ];
  const total = segments.reduce((a, s) => a + s.size, 0);

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
      <div className="mb-6 flex items-start gap-4">
        <div className="size-11 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
          <FileCode className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{L.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{L.sub}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[
            { l: L.width, v: w, set: setW, min: 32, max: 512, step: 16 },
            { l: L.height, v: h, set: setH, min: 32, max: 384, step: 16 },
            { l: L.frames, v: frames, set: setFrames, min: 8, max: 256, step: 8 },
            { l: L.blockSize, v: block, set: setBlock, min: 4, max: 32, step: 4 },
          ].map((s) => (
            <div key={s.l}>
              <div className="flex justify-between text-sm mb-2"><span>{s.l}</span><span className="font-mono text-primary">{s.v}</span></div>
              <Slider value={[s.v]} min={s.min} max={s.max} step={s.step} onValueChange={(v) => s.set(v[0])} />
            </div>
          ))}

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 grid grid-cols-2 gap-3 text-xs font-mono">
            <div><p className="text-muted-foreground">num_blocks</p><p className="text-foreground text-lg">{ppv.numBlocks}</p></div>
            <div><p className="text-muted-foreground">{L.total}</p><p className="text-primary text-lg">{ppv.totalSize.toLocaleString()} B</p></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.layout}</p>
            <div className="flex h-8 rounded overflow-hidden border border-border">
              {segments.map((s) => (
                <div key={s.label} style={{ width: `${(s.size / total) * 100}%`, background: s.color }} title={`${s.label} · ${s.size} B`} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1 text-[11px] font-mono">
              {segments.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="text-muted-foreground flex-1 truncate">{s.label}</span>
                  <span className="text-foreground">{s.size.toLocaleString()} B</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{L.hex}</p>
            <div className="font-mono text-[11px] max-h-56 overflow-auto">
              {hexRows.map((r) => (
                <div key={r.offset} className="flex gap-3 leading-snug">
                  <span className="text-primary/70">{r.offset}</span>
                  <span className={`flex-1 ${r.tag === "magic" ? "text-amber-400" : r.tag === "header" ? "text-cyan-400" : r.tag === "nblocks" ? "text-violet-400" : "text-green-400"}`}>{r.hex}</span>
                  <span className="text-muted-foreground">{r.ascii}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
