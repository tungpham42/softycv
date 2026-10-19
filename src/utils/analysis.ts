import type { CVData } from "../types";
import {
  escapeRegExp,
  findWeakPhrases,
  hasMetric,
  isEmail,
  toLines,
  wordCount,
} from "./text";

export type EditorTab =
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "design"
  | "insights";

export interface Check {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  /** What to do when the check fails (or a note when it passes). */
  tip: string;
  tab: EditorTab;
}

export interface Analysis {
  score: number;
  checks: Check[];
}

export function analyzeCV(data: CVData, pages?: number): Analysis {
  const { personalInfo: p } = data;
  const bullets = data.experience.flatMap((e) => toLines(e.description));
  const summaryWords = wordCount(data.summary);
  const metricShare = bullets.length
    ? bullets.filter(hasMetric).length / bullets.length
    : 0;
  const weak = data.experience.filter(
    (e) => findWeakPhrases(e.description).length,
  );
  const roleBulletCounts = data.experience.map(
    (e) => toLines(e.description).length,
  );
  const missingDates = [...data.experience, ...data.education].filter(
    (x) => !x.startDate.trim(),
  ).length;

  const checks: Check[] = [
    {
      id: "identity",
      label: "Name and job title",
      passed: Boolean(p.fullName.trim() && p.jobTitle.trim()),
      weight: 10,
      tip: "Add your full name and the job title you are applying for. Recruiters scan this first.",
      tab: "personal",
    },
    {
      id: "contact",
      label: "Valid email and phone",
      passed: isEmail(p.email.trim()) && p.phone.replace(/\D/g, "").length >= 7,
      weight: 10,
      tip: "Use a valid email address and a phone number with at least 7 digits.",
      tab: "personal",
    },
    {
      id: "links",
      label: "Location or professional link",
      passed: Boolean(
        p.location.trim() || p.linkedin.trim() || p.github.trim(),
      ),
      weight: 5,
      tip: "Add your city and a LinkedIn or GitHub link so employers can verify your work.",
      tab: "personal",
    },
    {
      id: "summary",
      label: "Summary of 40–90 words",
      passed: summaryWords >= 40 && summaryWords <= 90,
      weight: 10,
      tip:
        summaryWords === 0
          ? "Write a short summary (40–90 words) that names your role, years of experience and strongest result."
          : summaryWords < 40
            ? `Your summary has ${summaryWords} words. Aim for at least 40.`
            : `Your summary has ${summaryWords} words. Trim it to 90 or fewer.`,
      tab: "personal",
    },
    {
      id: "experience",
      label: "Each role has 2–6 bullet points",
      passed:
        data.experience.length > 0 &&
        roleBulletCounts.every((n) => n >= 2 && n <= 6),
      weight: 15,
      tip:
        data.experience.length === 0
          ? "Add at least one work experience entry."
          : "Aim for 2–6 short bullets per role. Use one line per achievement.",
      tab: "experience",
    },
    {
      id: "metrics",
      label: "Achievements include numbers",
      passed: metricShare >= 0.4,
      weight: 15,
      tip: `${Math.round(metricShare * 100)}% of your bullets contain a number. Aim for 40% or more: add percentages, money, team size or time saved.`,
      tab: "experience",
    },
    {
      id: "verbs",
      label: "Strong opening verbs",
      passed: bullets.length > 0 && weak.length === 0,
      weight: 10,
      tip: weak.length
        ? `Replace phrases like “responsible for” or “worked on” in ${weak
            .map((e) => e.position || e.company || "a role")
            .join(", ")} with verbs such as Led, Built or Reduced.`
        : "Add bullet points that start with action verbs.",
      tab: "experience",
    },
    {
      id: "education",
      label: "Education listed",
      passed: data.education.length > 0,
      weight: 5,
      tip: "Add your highest degree or most relevant training.",
      tab: "education",
    },
    {
      id: "skills",
      label: "At least 6 skills",
      passed: data.skills.filter((s) => s.name.trim()).length >= 6,
      weight: 10,
      tip: "List 6 or more skills. Mirror the wording used in the job post.",
      tab: "skills",
    },
    {
      id: "dates",
      label: "Dates on every role and degree",
      passed:
        missingDates === 0 &&
        data.experience.length + data.education.length > 0,
      weight: 5,
      tip: `${missingDates} entr${missingDates === 1 ? "y is" : "ies are"} missing a start date.`,
      tab: "experience",
    },
    {
      id: "length",
      label: "Fits in 2 pages or fewer",
      passed: pages === undefined ? true : pages <= 2,
      weight: 5,
      tip: "Your CV runs past 2 pages. Hide a section, shorten older roles or tighten the layout.",
      tab: "design",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  return { score, checks };
}

/* ---------- Job description keyword matching ---------- */

const STOPWORDS = new Set(
  (
    "a an and are as at be been being but by can could do does for from had has have he her his how i if in into is it its " +
    "may more most must no not of on or our out over per she should so such than that the their them then there these they " +
    "this those to too up us very was we were what when where which while who will with would you your about across after also " +
    "any both each few other some than within without able ability applicant applicants apply based benefits candidate candidates " +
    "company day etc excellent experience experienced including include join job looking love make need new opportunity part " +
    "plus position preferred required requirements responsibilities responsibility role skills strong team teams understanding " +
    "using use used well work working years year knowledge good great high high-quality like willing ideal environment " +
    "support provide help ensure related relevant business bonus salary full time degree equivalent minimum proven demonstrated"
  ).split(" "),
);

const TOKEN_RE = /[a-z0-9][a-z0-9+#./-]*[a-z0-9+#]|[a-z0-9]/gi;

export function extractKeywords(jd: string, limit = 30): string[] {
  const counts = new Map<string, number>();
  const first = new Map<string, number>();
  let i = 0;
  for (const raw of jd.match(TOKEN_RE) ?? []) {
    let t = raw.toLowerCase().replace(/[./-]+$/, "");
    if (t.length < 2 || STOPWORDS.has(t) || /^\d+$/.test(t)) continue;
    if (t.length < 3 && !/[+#]|^(ai|ui|ux|qa|ci|cd|go|js|c)$/.test(t)) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
    if (!first.has(t)) first.set(t, i++);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || first.get(a[0])! - first.get(b[0])!)
    .slice(0, limit)
    .map(([k]) => k);
}

export function cvSearchText(data: CVData): string {
  return [
    data.personalInfo.jobTitle,
    data.summary,
    ...data.experience.flatMap((e) => [e.position, e.company, e.description]),
    ...data.education.flatMap((e) => [
      e.degree,
      e.fieldOfStudy,
      e.description ?? "",
    ]),
    ...data.skills.map((s) => s.name),
    ...data.projects.flatMap((p) => [
      p.title,
      p.technologies ?? "",
      p.description,
    ]),
    ...data.certificates.map((c) => c.title),
  ]
    .join(" \n ")
    .toLowerCase();
}

export interface KeywordMatch {
  keywords: string[];
  matched: string[];
  missing: string[];
  percent: number;
}

export function matchKeywords(data: CVData, jd: string): KeywordMatch {
  const keywords = extractKeywords(jd);
  const haystack = cvSearchText(data);
  const has = (k: string) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(k)}($|[^a-z0-9])`).test(haystack);
  const matched = keywords.filter(has);
  const missing = keywords.filter((k) => !matched.includes(k));
  return {
    keywords,
    matched,
    missing,
    percent: keywords.length
      ? Math.round((matched.length / keywords.length) * 100)
      : 0,
  };
}
