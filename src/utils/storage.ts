import {
  DEFAULT_SECTIONS,
  LEGACY_DATA_KEY,
  LEGACY_DESIGN_KEY,
  STORAGE_KEY,
  emptyCVData,
  initialCVData,
  initialDesignConfig,
} from "../constants";
import type {
  CVData,
  CVDocument,
  CVProfile,
  DesignConfig,
  SectionConfig,
  SectionKey,
} from "../types";
import { uid } from "./text";

const SECTION_KEYS = DEFAULT_SECTIONS.map((s) => s.key);

const isObj = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const arr = <T>(v: unknown, map: (x: any) => T): T[] =>
  Array.isArray(v) ? v.filter(isObj).map(map) : [];

const str = (v: unknown, fallback = "") =>
  typeof v === "string" ? v : fallback;

const withId = (prefix: string, v: any) =>
  typeof v.id === "string" && v.id ? v.id : uid(prefix);

/**
 * Accepts anything (old exports, hand-edited JSON, partial data) and returns
 * a fully valid CVData. Throws when the input is clearly not a CV.
 */
export function normalizeCVData(input: unknown): CVData {
  if (!isObj(input)) throw new Error("File does not contain a CV object.");
  const looksLikeCV = ["personalInfo", "experience", "education", "skills"].some(
    (k) => k in input,
  );
  if (!looksLikeCV) throw new Error("This JSON doesn't look like a CV export.");

  const p = isObj(input.personalInfo) ? input.personalInfo : {};
  const personalInfo = Object.fromEntries(
    Object.keys(emptyCVData.personalInfo).map((k) => [k, str(p[k])]),
  ) as CVData["personalInfo"];

  // Keep saved order, drop unknown keys, append any missing section.
  const saved: SectionConfig[] = Array.isArray(input.sections)
    ? input.sections
        .filter(
          (s: any) => isObj(s) && SECTION_KEYS.includes(s.key as SectionKey),
        )
        .map((s: any) => ({
          key: s.key as SectionKey,
          visible: s.visible !== false,
        }))
    : [];
  const unique = saved.filter(
    (s, i) => saved.findIndex((x) => x.key === s.key) === i,
  );
  const seen = new Set(unique.map((s) => s.key));
  const sections = [
    ...unique,
    ...DEFAULT_SECTIONS.filter((s) => !seen.has(s.key)),
  ];

  return {
    personalInfo,
    summary: str(input.summary),
    experience: arr(input.experience, (e) => ({
      id: withId("exp", e),
      company: str(e.company),
      position: str(e.position),
      location: str(e.location),
      startDate: str(e.startDate),
      endDate: str(e.endDate),
      current: Boolean(e.current),
      description: str(e.description),
    })),
    education: arr(input.education, (e) => ({
      id: withId("edu", e),
      institution: str(e.institution),
      degree: str(e.degree),
      fieldOfStudy: str(e.fieldOfStudy),
      location: str(e.location),
      startDate: str(e.startDate),
      endDate: str(e.endDate),
      gpa: str(e.gpa),
      description: str(e.description),
    })),
    skills: arr(input.skills, (s) => ({
      id: withId("sk", s),
      name: str(s.name),
      level: str(s.level, "Advanced"),
      category: str(s.category),
    })),
    projects: arr(input.projects, (pr) => ({
      id: withId("proj", pr),
      title: str(pr.title),
      subtitle: str(pr.subtitle),
      link: str(pr.link),
      startDate: str(pr.startDate),
      endDate: str(pr.endDate),
      description: str(pr.description),
      technologies: str(pr.technologies),
    })),
    certificates: arr(input.certificates, (c) => ({
      id: withId("cert", c),
      title: str(c.title),
      issuer: str(c.issuer),
      date: str(c.date),
      link: str(c.link),
    })),
    sections,
  };
}

export function normalizeDesign(input: unknown): DesignConfig {
  const d = isObj(input) ? input : {};
  const base = initialDesignConfig;
  const pick = <T extends string>(v: unknown, allowed: T[], fb: T): T =>
    allowed.includes(v as T) ? (v as T) : fb;
  const num = (v: unknown, min: number, max: number, fb: number) =>
    typeof v === "number" && isFinite(v) ? Math.min(max, Math.max(min, v)) : fb;
  return {
    template: pick(
      d.template,
      ["modern", "classic", "minimalist", "sidebar"],
      base.template,
    ),
    primaryColor: /^#[0-9a-f]{6}$/i.test(str(d.primaryColor))
      ? str(d.primaryColor)
      : base.primaryColor,
    fontFamily: str(d.fontFamily) || base.fontFamily,
    fontSize: num(d.fontSize, 10, 18, base.fontSize),
    lineHeight: num(d.lineHeight, 1.1, 2, base.lineHeight),
    spacing: pick(
      d.spacing,
      ["compact", "comfortable", "spacious"],
      base.spacing,
    ),
    showIcons: typeof d.showIcons === "boolean" ? d.showIcons : base.showIcons,
    showPhoto: typeof d.showPhoto === "boolean" ? d.showPhoto : base.showPhoto,
    borderAccent:
      typeof d.borderAccent === "boolean" ? d.borderAccent : base.borderAccent,
    pageSize: pick(d.pageSize, ["A4", "Letter"], base.pageSize),
  };
}

export const makeProfile = (name: string, doc: CVDocument): CVProfile => ({
  id: uid("cv"),
  name,
  updatedAt: Date.now(),
  doc,
});

export interface Workspace {
  profiles: CVProfile[];
  activeId: string;
}

const safeParse = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function loadWorkspace(): Workspace {
  try {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (isObj(saved) && Array.isArray(saved.profiles)) {
      const profiles: CVProfile[] = [];
      for (const p of saved.profiles) {
        try {
          profiles.push({
            id: str(p.id) || uid("cv"),
            name: str(p.name) || "Untitled CV",
            updatedAt:
              typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
            doc: {
              data: normalizeCVData(p.doc?.data),
              design: normalizeDesign(p.doc?.design),
            },
          });
        } catch {
          /* skip corrupt profile */
        }
      }
      if (profiles.length) {
        const activeId = profiles.some((p) => p.id === saved.activeId)
          ? (saved.activeId as string)
          : profiles[0].id;
        return { profiles, activeId };
      }
    }

    // Migrate the v1 single-CV storage keys.
    const legacyData = safeParse(localStorage.getItem(LEGACY_DATA_KEY));
    if (legacyData) {
      const profile = makeProfile("My CV", {
        data: normalizeCVData(legacyData),
        design: normalizeDesign(
          safeParse(localStorage.getItem(LEGACY_DESIGN_KEY)),
        ),
      });
      return { profiles: [profile], activeId: profile.id };
    }
  } catch {
    /* storage unavailable – fall through to sample */
  }
  const first = makeProfile("My CV", {
    data: initialCVData,
    design: initialDesignConfig,
  });
  return { profiles: [first], activeId: first.id };
}

/** Returns false when the browser refused the write (quota, private mode). */
export function saveWorkspace(ws: Workspace): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
    return true;
  } catch {
    return false;
  }
}
