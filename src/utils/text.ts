import { WEAK_PHRASES } from "../constants";

const BULLET_RE = /^\s*(?:[•\-*–·▪●]\s+)/;

export const stripBullet = (line: string) => line.replace(BULLET_RE, "").trim();

/** Non-empty lines of a description, bullet markers removed. */
export const toLines = (text: string): string[] =>
  text
    .split("\n")
    .map(stripBullet)
    .filter(Boolean);

/** True when every non-empty line already starts with a bullet marker. */
export const isBulleted = (text: string) => {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.length > 0 && lines.every((l) => BULLET_RE.test(l));
};

export const formatAsBullets = (text: string) =>
  toLines(text)
    .map((l) => `• ${l}`)
    .join("\n");

export const wordCount = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

export const findWeakPhrases = (text: string): string[] => {
  const lower = text.toLowerCase();
  return WEAK_PHRASES.filter((p) => lower.includes(p));
};

export const hasMetric = (line: string) =>
  /(\d+\s?%|\$\s?\d|\d+\s?[kKmMbB]\b|\d{2,}|\d+x\b)/.test(line);

export const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

export const ensureUrl = (s: string) =>
  /^https?:\/\//i.test(s) ? s : `https://${s}`;

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const dateRange = (start?: string, end?: string, sep = "–") => {
  const s = (start || "").trim();
  const e = (end || "").trim();
  if (s && e) return `${s} ${sep} ${e}`;
  return s || e;
};
