export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certificates";

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: string;
  category?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface SectionConfig {
  key: SectionKey;
  visible: boolean;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    avatarUrl: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  /** Order + visibility of sections in the rendered CV. */
  sections: SectionConfig[];
}

export type TemplateId = "modern" | "classic" | "minimalist" | "sidebar";
export type PageSize = "A4" | "Letter";

export interface DesignConfig {
  template: TemplateId;
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  spacing: "compact" | "comfortable" | "spacious";
  showIcons: boolean;
  showPhoto: boolean;
  borderAccent: boolean;
  pageSize: PageSize;
}

/** Everything that belongs to one CV version. */
export interface CVDocument {
  data: CVData;
  design: DesignConfig;
}

export interface CVProfile {
  id: string;
  name: string;
  updatedAt: number;
  doc: CVDocument;
}

export type ListSection = Exclude<SectionKey, "summary">;

export type ItemOf<K extends ListSection> = K extends "experience"
  ? ExperienceItem
  : K extends "education"
    ? EducationItem
    : K extends "skills"
      ? SkillItem
      : K extends "projects"
        ? ProjectItem
        : CertificateItem;
