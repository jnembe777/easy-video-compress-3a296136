import { describe, it, expect } from "vitest";
import {
  fmt, bucket, bucketTag, faceCrop, filterTags, LOD_SCALE, LOD_LABEL,
} from "@/lib/lecteur-utils";

describe("fmt", () => {
  it("formate les secondes en mm:ss avec zéro padding", () => {
    expect(fmt(0)).toBe("00:00");
    expect(fmt(5)).toBe("00:05");
    expect(fmt(59)).toBe("00:59");
    expect(fmt(60)).toBe("01:00");
    expect(fmt(125)).toBe("02:05");
    expect(fmt(3599)).toBe("59:59");
  });
  it("tronque les fractions", () => {
    expect(fmt(12.9)).toBe("00:12");
  });
  it("retourne --:-- pour les valeurs invalides", () => {
    expect(fmt(NaN)).toBe("--:--");
    expect(fmt(Infinity)).toBe("--:--");
    expect(fmt(-1)).toBe("--:--");
  });
});

describe("bucket", () => {
  it("classifie l'activité en 3 paliers", () => {
    expect(bucket(0)).toBe(0);
    expect(bucket(7.99)).toBe(0);
    expect(bucket(8)).toBe(1);
    expect(bucket(24.99)).toBe(1);
    expect(bucket(25)).toBe(2);
    expect(bucket(100)).toBe(2);
  });
});

describe("bucketTag", () => {
  it("retourne un libellé + icône pour chaque bucket", () => {
    expect(bucketTag(0)).toEqual({ label: "rien", icon: "·" });
    expect(bucketTag(1)).toEqual({ label: "personne", icon: "🚶" });
    expect(bucketTag(2)).toEqual({ label: "véhicule", icon: "🚗" });
  });
});

describe("faceCrop", () => {
  const faces = ["Avant", "Arrière", "Gauche", "Droite", "Haut", "Bas"] as const;

  it("retourne un rectangle dans [0,1] pour chaque face", () => {
    for (const f of faces) {
      const [x, y, w, h] = faceCrop(f);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      expect(x + w).toBeLessThanOrEqual(1 + 1e-9);
      expect(y + h).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it("Arrière couvre toute la trame (plan large)", () => {
    expect(faceCrop("Arrière")).toEqual([0, 0, 1, 1]);
  });

  it("Avant est centré", () => {
    const [x, y, w, h] = faceCrop("Avant");
    expect(x + w / 2).toBeCloseTo(0.5);
    expect(y + h / 2).toBeCloseTo(0.5);
  });

  it("Gauche et Droite sont symétriques autour de l'axe vertical", () => {
    const [gx, gy, gw, gh] = faceCrop("Gauche");
    const [dx, dy, dw, dh] = faceCrop("Droite");
    expect(gw).toBeCloseTo(dw);
    expect(gh).toBeCloseTo(dh);
    expect(gy).toBeCloseTo(dy);
    // miroir : (gx+gw/2) et (dx+dw/2) équidistants de 0.5
    expect((gx + gw / 2) + (dx + dw / 2)).toBeCloseTo(1);
  });

  it("Haut et Bas sont symétriques autour de l'axe horizontal", () => {
    const [, hy, , hh] = faceCrop("Haut");
    const [, by, , bh] = faceCrop("Bas");
    expect(hh).toBeCloseTo(bh);
    expect((hy + hh / 2) + (by + bh / 2)).toBeCloseTo(1);
  });
});

describe("filterTags", () => {
  const tags = [
    { start: 0, end: 0.2, label: "rien", icon: "·" },
    { start: 0.2, end: 0.5, label: "personne", icon: "🚶" },
    { start: 0.5, end: 1, label: "véhicule", icon: "🚗" },
  ];

  it("retourne tous les tags pour une requête vide", () => {
    expect(filterTags(tags, "")).toHaveLength(3);
    expect(filterTags(tags, "   ")).toHaveLength(3);
  });

  it("filtre par libellé, insensible à la casse", () => {
    expect(filterTags(tags, "véhicule")).toHaveLength(1);
    expect(filterTags(tags, "VÉHICULE")).toHaveLength(1);
    expect(filterTags(tags, "person")).toEqual([tags[1]]);
  });

  it("filtre par icône emoji", () => {
    expect(filterTags(tags, "🚗")).toEqual([tags[2]]);
  });

  it("retourne une liste vide si aucun match", () => {
    expect(filterTags(tags, "avion")).toEqual([]);
  });
});

describe("constantes LOD", () => {
  it("expose 3 niveaux croissants", () => {
    expect(LOD_SCALE).toHaveLength(3);
    expect(LOD_LABEL).toHaveLength(3);
    expect(LOD_SCALE[0]).toBeLessThan(LOD_SCALE[1]);
    expect(LOD_SCALE[1]).toBeLessThan(LOD_SCALE[2]);
    expect(LOD_SCALE[2]).toBe(1);
  });
});
