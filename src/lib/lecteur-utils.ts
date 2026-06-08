// Pure helpers utilisés par le Lecteur PPV — extraits pour pouvoir être testés.

export type Face = "Avant" | "Arrière" | "Gauche" | "Droite" | "Haut" | "Bas";

/** LOD → facteur d'échelle appliqué au canvas de rendu. */
export const LOD_SCALE = [0.25, 0.5, 1] as const;
export const LOD_LABEL = ["1/4", "1/2", "1/1"] as const;

/** Format mm:ss tolérant aux valeurs invalides. */
export function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return "--:--";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/** Classification d'activité (mean abs diff %) en 3 niveaux sémantiques. */
export function bucket(a: number): 0 | 1 | 2 {
  if (a < 8) return 0;
  if (a < 25) return 1;
  return 2;
}

/** Étiquette + icône pour chaque bucket. */
export function bucketTag(b: 0 | 1 | 2): { label: string; icon: string } {
  if (b === 0) return { label: "rien", icon: "·" };
  if (b === 1) return { label: "personne", icon: "🚶" };
  return { label: "véhicule", icon: "🚗" };
}

/** Recadrage source (x, y, w, h) en fraction de la vidéo, par face cubique. */
export function faceCrop(face: Face): [number, number, number, number] {
  switch (face) {
    case "Avant":   return [0.25, 0.25, 0.5, 0.5];
    case "Arrière": return [0, 0, 1, 1];
    case "Gauche":  return [0, 0.2, 0.45, 0.6];
    case "Droite":  return [0.55, 0.2, 0.45, 0.6];
    case "Haut":    return [0.2, 0, 0.6, 0.45];
    case "Bas":     return [0.2, 0.55, 0.6, 0.45];
  }
}

/** Filtre une liste de tags par requête textuelle simple. */
export function filterTags<T extends { label: string; icon: string }>(
  tags: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return tags;
  return tags.filter((t) => t.label.toLowerCase().includes(q) || t.icon.includes(q));
}
