import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { motion } from "framer-motion";
import { Upload, Download, Loader2, Film, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

type Quality = "low" | "medium" | "high";

const QUALITY_PRESETS: Record<Quality, { crf: number; preset: string; label: string }> = {
  low: { crf: 32, preset: "veryfast", label: "Compression maximale" },
  medium: { crf: 26, preset: "fast", label: "Équilibré" },
  high: { crf: 20, preset: "medium", label: "Haute qualité" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function Compressor() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [scale, setScale] = useState<number>(100);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [output, setOutput] = useState<{ url: string; size: number; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFFmpeg = async () => {
    if (loaded || loading) return;
    setLoading(true);
    setError(null);
    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setProgress(Math.min(100, Math.round(progress * 100))));
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
      setLoaded(true);
    } catch (e) {
      setError("Impossible de charger le moteur de compression. Vérifiez votre connexion.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file && !loaded) loadFFmpeg();
  }, [file]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setOutput(null);
    setError(null);
    setProgress(0);
    setFile(f);
  };

  const compress = async () => {
    if (!file || !ffmpegRef.current) return;
    setProcessing(true);
    setProgress(0);
    setOutput(null);
    setError(null);
    const ffmpeg = ffmpegRef.current;
    try {
      const inputName = "input.mp4";
      const outputName = "output.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const preset = QUALITY_PRESETS[quality];
      const scaleFilter = scale < 100 ? `scale=trunc(iw*${scale / 100}/2)*2:trunc(ih*${scale / 100}/2)*2` : null;
      const args = [
        "-i", inputName,
        "-c:v", "libx264",
        "-crf", String(preset.crf),
        "-preset", preset.preset,
        ...(scaleFilter ? ["-vf", scaleFilter] : []),
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        outputName,
      ];
      await ffmpeg.exec(args);
      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const name = file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4";
      setOutput({ url, size: blob.size, name });
      setProgress(100);
    } catch (e) {
      console.error(e);
      setError("La compression a échoué. Essayez un fichier plus court.");
    } finally {
      setProcessing(false);
    }
  };

  const reduction = output && file ? Math.max(0, Math.round((1 - output.size / file.size) * 100)) : 0;

  return (
    <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative">
        {!file && (
          <label className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl py-16 px-6 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors">
            <div className="size-16 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
              <Upload className="size-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-display text-xl">Déposez votre vidéo</p>
              <p className="text-sm text-muted-foreground mt-1">MP4, MOV, WebM, MKV — traité localement dans votre navigateur</p>
            </div>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-12 rounded-xl bg-primary/15 grid place-items-center shrink-0">
                  <Film className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setOutput(null); }}>
                Changer
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {(Object.keys(QUALITY_PRESETS) as Quality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    quality === q
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{q}</p>
                  <p className="font-display text-base mt-1">{QUALITY_PRESETS[q].label}</p>
                  <p className="text-xs text-muted-foreground mt-1">CRF {QUALITY_PRESETS[q].crf}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Échelle de résolution</span>
                <span className="font-mono text-primary">{scale}%</span>
              </div>
              <Slider value={[scale]} min={25} max={100} step={5} onValueChange={(v) => setScale(v[0])} />
            </div>

            {(loading || processing) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  {loading ? "Chargement du moteur FFmpeg…" : `Compression en cours… ${progress}%`}
                </div>
                {processing && <Progress value={progress} />}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <Button
              onClick={compress}
              disabled={!loaded || processing || loading}
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 shadow-glow font-medium"
            >
              <Sparkles className="size-4" />
              Compresser la vidéo
            </Button>

            {output && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/40 bg-primary/5 p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">Résultat</p>
                    <p className="font-display text-2xl">
                      {formatBytes(output.size)}{" "}
                      <span className="text-primary text-lg">−{reduction}%</span>
                    </p>
                  </div>
                  <a href={output.url} download={output.name}>
                    <Button size="lg" className="bg-gradient-primary shadow-glow">
                      <Download className="size-4" />
                      Télécharger
                    </Button>
                  </a>
                </div>
                <video src={output.url} controls className="w-full rounded-lg border border-border" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
