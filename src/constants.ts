import type {
  CVData,
  DesignConfig,
  PageSize,
  SectionConfig,
  SectionKey,
  TemplateId,
} from "./types";

export const STORAGE_KEY = "cv_builder_workspace_v2";
export const LEGACY_DATA_KEY = "pro_cv_builder_data";
export const LEGACY_DESIGN_KEY = "pro_cv_builder_design";

export const PRESET_PALETTES = [
  { name: "Ocean Blue", color: "#0052CC" },
  { name: "Emerald Teal", color: "#00875A" },
  { name: "Royal Violet", color: "#6554C0" },
  { name: "Crimson Rose", color: "#DE350B" },
  { name: "Midnight Charcoal", color: "#172B4D" },
  { name: "Sunset Bronze", color: "#C14000" },
];

export const QUICK_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Tailwind CSS",
  "GraphQL",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Figma",
  "Git",
  "Agile",
];

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const FONT_OPTIONS = [
  {
    label: "Inter / System Sans",
    value: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  { label: "Arial (ATS-safe)", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  {
    label: "Times New Roman (ATS-safe)",
    value: "'Times New Roman', Times, serif",
  },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

export const TEMPLATES: {
  id: TemplateId;
  label: string;
  hint: string;
  atsFriendly: boolean;
}[] = [
  {
    id: "modern",
    label: "Modern",
    hint: "Header banner with photo and contact bar",
    atsFriendly: true,
  },
  {
    id: "sidebar",
    label: "Two-column",
    hint: "Sidebar for contact, skills and certificates",
    atsFriendly: false,
  },
  {
    id: "classic",
    label: "Executive",
    hint: "Centered serif header, traditional layout",
    atsFriendly: true,
  },
  {
    id: "minimalist",
    label: "Minimal",
    hint: "Quiet, text-first, lots of white space",
    atsFriendly: true,
  },
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certificates: "Certifications",
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: "summary", visible: true },
  { key: "experience", visible: true },
  { key: "education", visible: true },
  { key: "skills", visible: true },
  { key: "projects", visible: true },
  { key: "certificates", visible: true },
];

/** CSS px at 96dpi. */
export const PAGE_DIMENSIONS: Record<PageSize, { w: number; h: number }> = {
  A4: { w: 794, h: 1123 },
  Letter: { w: 816, h: 1056 },
};

/** Padding on screen == @page margin in print (≈ 12.7mm). */
export const PAGE_PADDING = 48;

export const POWER_VERBS = [
  "Led",
  "Built",
  "Designed",
  "Launched",
  "Reduced",
  "Increased",
  "Automated",
  "Delivered",
  "Optimized",
  "Mentored",
  "Migrated",
  "Architected",
  "Streamlined",
  "Negotiated",
  "Drove",
  "Shipped",
];

export const WEAK_PHRASES = [
  "responsible for",
  "worked on",
  "helped with",
  "helped to",
  "assisted with",
  "duties included",
  "tasked with",
  "in charge of",
  "participated in",
  "involved in",
];

export const initialCVData: CVData = {
  personalInfo: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Full Stack Software Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedin: "linkedin.com/in/alexmorgan-dev",
    github: "github.com/alexmorgan",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
  summary:
    "Innovative and detail-oriented Senior Software Engineer with 7+ years of experience building scalable web applications, microservices, and design systems. Passionate about clean architecture, user experience, performance optimization, and mentoring high-performing engineering teams.",
  experience: [
    {
      id: "exp-1",
      company: "TechCorp Solutions",
      position: "Senior Frontend Engineer",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description:
        "• Architected and developed core modules using React, TypeScript, and Ant Design, serving 500k+ daily active users.\n• Improved initial page load times by 42% through code-splitting, tree-shaking, and lazy loading strategies.\n• Led a cross-functional team of 6 engineers, establishing CI/CD pipelines and automated code quality checks.",
    },
    {
      id: "exp-2",
      company: "Innovate Digital",
      position: "Full Stack Developer",
      location: "Austin, TX",
      startDate: "2019",
      endDate: "2022",
      current: false,
      description:
        "• Engineered RESTful APIs and microservices using Node.js, Express, and PostgreSQL handling $2M+ monthly payments.\n• Integrated WebSockets for real-time collaborative features and live chat functionality.\n• Reduced database query latency by 35% through query optimization and Redis caching layer.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.88 / 4.0",
      description:
        "Graduated with High Honors. Dean’s Honor List. Lead Organizer of CalHacks Hackathon.",
    },
  ],
  skills: [
    { id: "sk-1", name: "TypeScript / JavaScript", level: "Expert" },
    { id: "sk-2", name: "React.js / Next.js", level: "Expert" },
    { id: "sk-3", name: "Node.js & Express", level: "Advanced" },
    { id: "sk-4", name: "Tailwind CSS & Ant Design", level: "Advanced" },
    { id: "sk-5", name: "GraphQL & REST APIs", level: "Advanced" },
    { id: "sk-6", name: "PostgreSQL & MongoDB", level: "Intermediate" },
    { id: "sk-7", name: "Docker & AWS Services", level: "Intermediate" },
  ],
  projects: [
    {
      id: "proj-1",
      title: "CloudDash - Open Metrics Dashboard",
      subtitle: "Creator & Maintainer",
      link: "https://github.com/alexmorgan/clouddash",
      startDate: "2023",
      endDate: "2023",
      technologies: "React, TypeScript, Recharts, Tailwind",
      description:
        "An open-source server telemetry monitoring dashboard featuring real-time charts, dark mode support, and customizable alert thresholds.",
    },
    {
      id: "proj-2",
      title: "DevFlow - Task Workspace",
      subtitle: "Side Project",
      link: "https://devflow.example.com",
      startDate: "2022",
      endDate: "2022",
      technologies: "Next.js, Zustand, Node.js, PostgreSQL",
      description:
        "Kanban-based project management software designed for agile engineering sprints with seamless GitHub issue synchronization.",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023",
    },
    {
      id: "cert-2",
      title: "Meta Professional Front-End Certificate",
      issuer: "Coursera / Meta",
      date: "2021",
    },
  ],
  sections: DEFAULT_SECTIONS,
};

export const initialDesignConfig: DesignConfig = {
  template: "modern",
  primaryColor: "#0052CC",
  fontFamily: FONT_OPTIONS[0].value,
  fontSize: 14,
  lineHeight: 1.5,
  spacing: "comfortable",
  showIcons: true,
  showPhoto: true,
  borderAccent: true,
  pageSize: "A4",
};

export const emptyCVData: CVData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    avatarUrl: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  sections: DEFAULT_SECTIONS,
};
