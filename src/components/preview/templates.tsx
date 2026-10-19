import React from "react";
import type { SectionKey } from "../../types";
import {
  ContactList,
  Photo,
  RenderSection,
  TemplateProps,
  metrics,
} from "./blocks";

const visibleKeys = (data: TemplateProps["data"]): SectionKey[] =>
  data.sections.filter((s) => s.visible).map((s) => s.key);

const root = (c: TemplateProps["config"], color = "#1e293b"): React.CSSProperties => ({
  color,
  lineHeight: c.lineHeight,
});

/* ---------- Modern: banner header ---------- */
export const ModernTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const p = data.personalInfo;
  const m = metrics(config);
  return (
    <div style={root(config)}>
      <div
        style={{
          borderBottom: config.borderAccent
            ? `4px solid ${config.primaryColor}`
            : "1px solid #e2e8f0",
          paddingBottom: 18,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: m.fs(2.1),
              margin: 0,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
            }}
          >
            {p.fullName || "Your Name"}
          </h1>
          <div
            style={{
              fontSize: m.fs(1.25),
              color: config.primaryColor,
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {p.jobTitle}
          </div>
        </div>
        <Photo data={data} config={config} size={80} />
      </div>
      <ContactList info={p} config={config} layout="bar" />
      {visibleKeys(data).map((k) => (
        <RenderSection key={k} id={k} data={data} config={config} variant="modern" />
      ))}
    </div>
  );
};

/* ---------- Two-column: sidebar ---------- */
const ASIDE: SectionKey[] = ["skills", "certificates"];

export const SidebarTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const p = data.personalInfo;
  const m = metrics(config);
  const keys = visibleKeys(data);
  return (
    <div style={{ display: "flex", gap: 26, ...root(config) }}>
      <aside
        style={{
          width: "34%",
          flexShrink: 0,
          alignSelf: "stretch",
          backgroundColor: "#f8fafc",
          padding: "24px 18px",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          borderLeft: config.borderAccent
            ? `5px solid ${config.primaryColor}`
            : "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Photo data={data} config={config} size={96} />
        </div>
        <h2
          style={{
            fontSize: m.fs(1.5),
            margin: 0,
            fontWeight: 800,
            textAlign: "center",
            color: "#0f172a",
            lineHeight: 1.2,
          }}
        >
          {p.fullName || "Your Name"}
        </h2>
        <div
          style={{
            color: config.primaryColor,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 24,
            fontSize: m.fs(0.95),
          }}
        >
          {p.jobTitle}
        </div>
        <div style={{ marginBottom: m.sectionGap }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: m.fs(0.95),
              borderBottom: `2px solid ${config.primaryColor}30`,
              paddingBottom: 6,
              marginBottom: 12,
              color: "#0f172a",
              letterSpacing: "0.5px",
            }}
          >
            CONTACT
          </div>
          <ContactList info={p} config={config} layout="stack" />
        </div>
        {keys
          .filter((k) => ASIDE.includes(k))
          .map((k) => (
            <RenderSection key={k} id={k} data={data} config={config} variant="sidebar" aside />
          ))}
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        {keys
          .filter((k) => !ASIDE.includes(k))
          .map((k) => (
            <RenderSection key={k} id={k} data={data} config={config} variant="sidebar" />
          ))}
      </main>
    </div>
  );
};

/* ---------- Executive classic ---------- */
export const ClassicTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const p = data.personalInfo;
  const m = metrics(config);
  return (
    <div style={root(config, "#111827")}>
      <header
        style={{
          textAlign: "center",
          borderBottom: "2px solid #111827",
          paddingBottom: 14,
          marginBottom: 18,
        }}
      >
        <h1
          style={{
            fontSize: m.fs(2.2),
            margin: 0,
            fontWeight: 700,
            letterSpacing: "1px",
            lineHeight: 1.15,
          }}
        >
          {(p.fullName || "Your Name").toUpperCase()}
        </h1>
        <div
          style={{
            fontSize: m.fs(1.1),
            color: config.primaryColor,
            fontWeight: 600,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          {p.jobTitle}
        </div>
        <div style={{ marginTop: 8 }}>
          <ContactList info={p} config={config} layout="plain" />
        </div>
      </header>
      {visibleKeys(data).map((k) => (
        <RenderSection key={k} id={k} data={data} config={config} variant="classic" />
      ))}
    </div>
  );
};

/* ---------- Minimalist ---------- */
export const MinimalistTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const p = data.personalInfo;
  const m = metrics(config);
  return (
    <div style={root(config)}>
      <header style={{ marginBottom: m.sectionGap + 4 }}>
        <h1
          style={{
            fontSize: m.fs(2.4),
            margin: 0,
            fontWeight: 300,
            letterSpacing: "-0.5px",
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          {p.fullName || "Your Name"}
        </h1>
        <div
          style={{
            fontSize: m.fs(1.1),
            color: config.primaryColor,
            marginTop: 6,
            marginBottom: 10,
          }}
        >
          {p.jobTitle}
        </div>
        <ContactList info={p} config={config} layout="inline" />
      </header>
      {visibleKeys(data).map((k) => (
        <RenderSection key={k} id={k} data={data} config={config} variant="minimalist" />
      ))}
    </div>
  );
};

export const TEMPLATE_COMPONENTS = {
  modern: ModernTemplate,
  sidebar: SidebarTemplate,
  classic: ClassicTemplate,
  minimalist: MinimalistTemplate,
} as const;
