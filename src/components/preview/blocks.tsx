import React from "react";
import { Avatar } from "antd";
import {
  GithubOutlined,
  GlobalOutlined,
  HomeOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import type {
  CVData,
  DesignConfig,
  SectionKey,
  TemplateId,
} from "../../types";
import { dateRange, ensureUrl, stripBullet } from "../../utils/text";

export interface TemplateProps {
  data: CVData;
  config: DesignConfig;
}

const SECTION_GAP = { compact: 14, comfortable: 22, spacious: 30 };
const ITEM_GAP = { compact: 8, comfortable: 14, spacious: 20 };

export const metrics = (c: DesignConfig) => ({
  sectionGap: SECTION_GAP[c.spacing],
  itemGap: ITEM_GAP[c.spacing],
  fs: (n: number) => `${c.fontSize * n}px`,
});

const INK = "#0f172a";
const TEXT = "#334155";
const MUTED = "#64748b";

/* ---------- section labels / headings ---------- */

const LABELS: Record<TemplateId, Record<SectionKey, string>> = {
  modern: {
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills & Expertise",
    projects: "Projects",
    certificates: "Certifications",
  },
  sidebar: {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Featured Projects",
    certificates: "Certifications",
  },
  classic: {
    summary: "Executive Summary",
    experience: "Professional Experience",
    education: "Education",
    skills: "Core Competencies",
    projects: "Projects",
    certificates: "Certifications",
  },
  minimalist: {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certificates: "Certifications",
  },
};

interface SectionProps {
  id: SectionKey;
  variant: TemplateId;
  config: DesignConfig;
  /** Sidebar-column styling (small bold label with rule). */
  aside?: boolean;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  id,
  variant,
  config,
  aside,
  children,
}) => {
  const m = metrics(config);
  const label = LABELS[variant][id];
  const c = config.primaryColor;
  let heading: React.CSSProperties;

  if (aside) {
    heading = {
      fontWeight: 700,
      fontSize: m.fs(0.95),
      borderBottom: `2px solid ${c}30`,
      paddingBottom: 6,
      marginBottom: 12,
      color: INK,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    };
  } else if (variant === "classic") {
    heading = {
      fontSize: m.fs(1.1),
      color: c,
      borderBottom: "1px solid #d1d5db",
      paddingBottom: 2,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: "1px",
    };
  } else if (variant === "minimalist") {
    heading = {
      fontSize: m.fs(1.05),
      color: c,
      fontWeight: 600,
      marginBottom: 8,
      letterSpacing: "0.3px",
    };
  } else if (variant === "sidebar") {
    heading = {
      fontSize: m.fs(1.2),
      color: c,
      fontWeight: 700,
      marginBottom: 10,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    };
  } else {
    heading = {
      fontSize: m.fs(1.15),
      color: c,
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderBottom: `2px solid ${c}25`,
      paddingBottom: 4,
      marginBottom: 12,
      fontWeight: 700,
    };
  }

  return (
    <section style={{ marginBottom: m.sectionGap }}>
      <h3 style={{ margin: "0 0 0", ...heading }}>{label}</h3>
      {children}
    </section>
  );
};

/* ---------- small helpers ---------- */

const Link: React.FC<{ href?: string; children: React.ReactNode }> = ({
  href,
  children,
}) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {children}
    </a>
  ) : (
    <>{children}</>
  );

/** Renders a description as a real list when it has several lines. */
export const Bullets: React.FC<{ text: string; muted?: boolean }> = ({
  text,
  muted,
}) => {
  const lines = text.split("\n").filter((l) => l.trim());
  if (!lines.length) return null;
  const color = muted ? MUTED : TEXT;
  const isList = lines.length > 1 || /^\s*[•\-*–·▪●]\s/.test(lines[0]);
  if (!isList) return <div style={{ color, marginTop: 3 }}>{lines[0]}</div>;
  return (
    <ul style={{ margin: "4px 0 0", paddingLeft: "1.25em", color }}>
      {lines.map((l, i) => (
        <li key={i} style={{ marginBottom: 2 }}>
          {stripBullet(l)}
        </li>
      ))}
    </ul>
  );
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "baseline",
};

const Dates: React.FC<{ config: DesignConfig; children: React.ReactNode }> = ({
  config,
  children,
}) =>
  children ? (
    <span
      style={{
        color: MUTED,
        fontSize: metrics(config).fs(0.9),
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  ) : null;

const entry = (config: DesignConfig): React.CSSProperties => ({
  marginBottom: metrics(config).itemGap,
  breakInside: "avoid",
});

/* ---------- contact ---------- */

export const contactItems = (p: CVData["personalInfo"]) =>
  [
    { key: "email", icon: <MailOutlined />, text: p.email, href: p.email && `mailto:${p.email}` },
    { key: "phone", icon: <PhoneOutlined />, text: p.phone, href: p.phone && `tel:${p.phone.replace(/[^\d+]/g, "")}` },
    { key: "location", icon: <HomeOutlined />, text: p.location },
    { key: "website", icon: <GlobalOutlined />, text: p.website, href: p.website && ensureUrl(p.website) },
    { key: "linkedin", icon: <LinkedinOutlined />, text: p.linkedin, href: p.linkedin && ensureUrl(p.linkedin) },
    { key: "github", icon: <GithubOutlined />, text: p.github, href: p.github && ensureUrl(p.github) },
  ].filter((i) => i.text.trim());

export const ContactList: React.FC<{
  info: CVData["personalInfo"];
  config: DesignConfig;
  layout: "bar" | "stack" | "inline" | "plain";
}> = ({ info, config, layout }) => {
  const items = contactItems(info);
  if (!items.length) return null;
  const icon = (el: React.ReactNode) =>
    config.showIcons && layout !== "plain" ? (
      <span style={{ color: config.primaryColor }}>{el}</span>
    ) : null;

  const base: React.CSSProperties = {
    display: "flex",
    fontSize: metrics(config).fs(layout === "stack" ? 0.88 : 0.9),
    color: "#475569",
  };
  const layoutStyle: Record<string, React.CSSProperties> = {
    bar: {
      flexWrap: "wrap",
      gap: "8px 20px",
      background: "#f8fafc",
      padding: "12px 18px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      marginBottom: metrics(config).sectionGap,
    },
    stack: { flexDirection: "column", gap: 10 },
    inline: { flexWrap: "wrap", gap: "4px 18px" },
    plain: { flexWrap: "wrap", justifyContent: "center", gap: "2px 14px" },
  };

  return (
    <div style={{ ...base, ...layoutStyle[layout] }}>
      {items.map((i) => (
        <span
          key={i.key}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            wordBreak: layout === "stack" ? "break-all" : undefined,
          }}
        >
          {icon(i.icon)}
          <Link href={i.href}>{i.text}</Link>
        </span>
      ))}
    </div>
  );
};

export const Photo: React.FC<{ data: CVData; config: DesignConfig; size: number }> = ({
  data,
  config,
  size,
}) =>
  config.showPhoto && data.personalInfo.avatarUrl ? (
    <Avatar
      size={size}
      src={data.personalInfo.avatarUrl}
      style={{
        border: `3px solid ${config.primaryColor}`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        flexShrink: 0,
      }}
    />
  ) : null;

/* ---------- section bodies ---------- */

interface BodyProps {
  data: CVData;
  config: DesignConfig;
  variant: TemplateId;
  aside?: boolean;
}

const SummaryBody: React.FC<BodyProps> = ({ data, variant }) => (
  <p
    style={{
      margin: 0,
      color: TEXT,
      fontStyle: variant === "classic" ? "italic" : undefined,
    }}
  >
    {data.summary}
  </p>
);

const ExperienceBody: React.FC<BodyProps> = ({ data, config, variant }) => (
  <>
    {data.experience.map((e) => {
      const dates = dateRange(e.startDate, e.current ? "Present" : e.endDate);
      const m = metrics(config);
      let head: React.ReactNode;

      if (variant === "sidebar") {
        head = (
          <>
            <div style={{ ...row, fontWeight: 700 }}>
              <span style={{ color: INK }}>{e.position}</span>
              <Dates config={config}>{dates}</Dates>
            </div>
            <div style={{ color: config.primaryColor, fontWeight: 600 }}>
              {e.company}
              {e.location && (
                <span style={{ color: MUTED, fontWeight: 400 }}> · {e.location}</span>
              )}
            </div>
          </>
        );
      } else if (variant === "classic") {
        head = (
          <>
            <div style={{ ...row, fontWeight: 700 }}>
              <span>
                {e.position}
                {e.company && ` — ${e.company}`}
              </span>
              <Dates config={config}>{dates}</Dates>
            </div>
            {e.location && (
              <div style={{ color: MUTED, fontSize: m.fs(0.88) }}>{e.location}</div>
            )}
          </>
        );
      } else if (variant === "minimalist") {
        head = (
          <>
            <div style={{ ...row, fontWeight: 600, color: INK }}>
              <span>{e.company}</span>
              <Dates config={config}>{dates}</Dates>
            </div>
            <div style={{ color: MUTED, fontSize: m.fs(0.92) }}>
              {[e.position, e.location].filter(Boolean).join(", ")}
            </div>
          </>
        );
      } else {
        head = (
          <>
            <div style={{ ...row, fontWeight: 700, fontSize: m.fs(1.05) }}>
              <span style={{ color: INK }}>
                {e.position}
                {e.company && (
                  <span style={{ color: config.primaryColor }}> @ {e.company}</span>
                )}
              </span>
              <Dates config={config}>{dates}</Dates>
            </div>
            {e.location && (
              <div style={{ fontSize: m.fs(0.85), color: MUTED }}>{e.location}</div>
            )}
          </>
        );
      }
      return (
        <div key={e.id} style={entry(config)}>
          {head}
          <Bullets text={e.description} />
        </div>
      );
    })}
  </>
);

const EducationBody: React.FC<BodyProps> = ({ data, config, variant }) => (
  <>
    {data.education.map((e) => {
      const title = [e.degree, e.fieldOfStudy].filter(Boolean).join(
        variant === "classic" ? ", " : " in ",
      );
      return (
        <div key={e.id} style={entry(config)}>
          <div style={{ ...row, fontWeight: 700 }}>
            <span style={{ color: INK }}>{title}</span>
            <Dates config={config}>{dateRange(e.startDate, e.endDate)}</Dates>
          </div>
          <div style={{ color: "#475569", fontWeight: 500 }}>
            {[e.institution, e.location].filter(Boolean).join(" · ")}
            {e.gpa && <span style={{ color: MUTED }}> (GPA: {e.gpa})</span>}
          </div>
          {e.description && (
            <div
              style={{
                color: MUTED,
                fontSize: metrics(config).fs(0.9),
                marginTop: 2,
              }}
            >
              {e.description}
            </div>
          )}
        </div>
      );
    })}
  </>
);

const SkillsBody: React.FC<BodyProps> = ({ data, config, variant, aside }) => {
  const skills = data.skills.filter((s) => s.name.trim());
  const m = metrics(config);
  if (aside) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {skills.map((s) => (
          <div key={s.id} style={{ fontSize: m.fs(0.88) }}>
            <div style={{ fontWeight: 600, color: "#1e293b" }}>{s.name}</div>
            {s.level && (
              <div style={{ fontSize: m.fs(0.78), color: MUTED }}>{s.level}</div>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (variant === "classic" || variant === "minimalist") {
    return (
      <div style={{ color: TEXT, fontWeight: variant === "classic" ? 600 : 400 }}>
        {skills.map((s) => s.name).join(variant === "classic" ? "  •  " : ", ")}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {skills.map((s) => (
        <span
          key={s.id}
          style={{
            background: `${config.primaryColor}10`,
            border: `1px solid ${config.primaryColor}30`,
            color: config.primaryColor,
            fontWeight: 600,
            fontSize: m.fs(0.88),
            padding: "3px 12px",
            borderRadius: 20,
          }}
        >
          {s.name}
          {s.level ? ` (${s.level})` : ""}
        </span>
      ))}
    </div>
  );
};

const ProjectsBody: React.FC<BodyProps> = ({ data, config }) => (
  <>
    {data.projects.map((p) => (
      <div key={p.id} style={entry(config)}>
        <div style={{ ...row, fontWeight: 700 }}>
          <span style={{ color: INK }}>
            <Link href={p.link ? ensureUrl(p.link) : undefined}>{p.title}</Link>
            {p.subtitle && (
              <span style={{ color: MUTED, fontWeight: 500 }}> — {p.subtitle}</span>
            )}
          </span>
          <Dates config={config}>
            {p.startDate === p.endDate ? p.startDate : dateRange(p.startDate, p.endDate)}
          </Dates>
        </div>
        {p.technologies && (
          <div
            style={{
              fontSize: metrics(config).fs(0.85),
              color: config.primaryColor,
              fontWeight: 600,
            }}
          >
            {p.technologies}
          </div>
        )}
        <Bullets text={p.description} />
      </div>
    ))}
  </>
);

const CertificatesBody: React.FC<BodyProps> = ({ data, config, aside }) => (
  <>
    {data.certificates.map((c) =>
      aside ? (
        <div
          key={c.id}
          style={{ marginBottom: 10, fontSize: metrics(config).fs(0.85), breakInside: "avoid" }}
        >
          <div style={{ fontWeight: 600, color: INK }}>{c.title}</div>
          <div style={{ color: MUTED }}>
            {c.issuer}
            {c.date && ` (${c.date})`}
          </div>
        </div>
      ) : (
        <div key={c.id} style={{ ...row, marginBottom: 6, breakInside: "avoid" }}>
          <div>
            <strong style={{ color: INK }}>
              <Link href={c.link ? ensureUrl(c.link) : undefined}>{c.title}</Link>
            </strong>
            {c.issuer && <span style={{ color: "#475569" }}> — {c.issuer}</span>}
          </div>
          <Dates config={config}>{c.date}</Dates>
        </div>
      ),
    )}
  </>
);

const BODIES: Record<SectionKey, React.FC<BodyProps>> = {
  summary: SummaryBody,
  experience: ExperienceBody,
  education: EducationBody,
  skills: SkillsBody,
  projects: ProjectsBody,
  certificates: CertificatesBody,
};

export const hasContent = (data: CVData, key: SectionKey) =>
  key === "summary"
    ? Boolean(data.summary.trim())
    : key === "skills"
      ? data.skills.some((s) => s.name.trim())
      : data[key].length > 0;

/** Renders one CV section with the heading style of the given template. */
export const RenderSection: React.FC<
  BodyProps & { id: SectionKey }
> = ({ id, data, config, variant, aside }) => {
  if (!hasContent(data, id)) return null;
  const Body = BODIES[id];
  return (
    <Section id={id} variant={variant} config={config} aside={aside}>
      <Body data={data} config={config} variant={variant} aside={aside} />
    </Section>
  );
};
