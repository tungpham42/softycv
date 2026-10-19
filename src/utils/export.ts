import type { CVData } from "../types";
import { dateRange, toLines } from "./text";

/** ATS-friendly plain-text version of the CV, honouring section order. */
export function cvToPlainText(data: CVData): string {
  const { personalInfo: p } = data;
  const out: string[] = [];
  out.push((p.fullName || "").toUpperCase());
  if (p.jobTitle) out.push(p.jobTitle);
  out.push(
    [p.email, p.phone, p.location, p.website, p.linkedin, p.github]
      .filter(Boolean)
      .join(" | "),
  );

  const blocks: Record<string, () => string[]> = {
    summary: () => (data.summary ? [data.summary] : []),
    experience: () =>
      data.experience.flatMap((e) => [
        `${e.position}${e.company ? `, ${e.company}` : ""}${e.location ? ` (${e.location})` : ""}`,
        dateRange(e.startDate, e.current ? "Present" : e.endDate),
        ...toLines(e.description).map((l) => `- ${l}`),
        "",
      ]),
    education: () =>
      data.education.flatMap((e) => [
        `${[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")} – ${e.institution}`,
        dateRange(e.startDate, e.endDate) + (e.gpa ? ` | GPA: ${e.gpa}` : ""),
        ...(e.description ? [e.description] : []),
        "",
      ]),
    skills: () => [data.skills.map((s) => s.name).filter(Boolean).join(", ")],
    projects: () =>
      data.projects.flatMap((pr) => [
        `${pr.title}${pr.subtitle ? ` – ${pr.subtitle}` : ""}`,
        ...(pr.technologies ? [`Tech: ${pr.technologies}`] : []),
        ...toLines(pr.description).map((l) => `- ${l}`),
        ...(pr.link ? [pr.link] : []),
        "",
      ]),
    certificates: () =>
      data.certificates.map(
        (c) => `${c.title} – ${c.issuer}${c.date ? ` (${c.date})` : ""}`,
      ),
  };
  const titles: Record<string, string> = {
    summary: "SUMMARY",
    experience: "EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    projects: "PROJECTS",
    certificates: "CERTIFICATIONS",
  };

  for (const s of data.sections) {
    if (!s.visible) continue;
    const lines = blocks[s.key]();
    if (!lines.some(Boolean)) continue;
    out.push("", titles[s.key], ...lines);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const safeFileName = (name: string) =>
  (name || "CV").trim().replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "") ||
  "CV";
