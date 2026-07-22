// ─── Profile ────────────────────────────────────────────────────────────────
export interface Profile {
  name: string;
  title: string;          // e.g. "ai engineer · data scientist · builder"
  heading: string;        // main hero heading
  subheading: string;
  bio: string[];          // paragraphs
  about: string[];
  location?: string;
  lastUpdated?: string;
}

// ─── Projects ───────────────────────────────────────────────────────────────
export type DiagramSide = 'left' | 'right';
export type DiagramType = 'pipeline' | 'multi-agent' | 'platform' | 'custom';

export interface DiagramNode {
  id: string;
  label: string;
  icon?: string;
  description?: string;   // shown in tooltip
  x?: number;             // optional manual position hint
  y?: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  stats?: string;         // e.g. "10,000+ docs · <200ms latency"
  tags: string[];
  diagramType: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  side: DiagramSide;
  order: number;
  featured?: boolean;

  // ─── Case-study fields (shown in the public Work section) ─────────────────
  org?: string;           // e.g. "MyVyay", "CDAC", "personal"
  year?: string;          // e.g. "2026"
  status?: string;        // "active" | "shipped" | "production" | free text
  metric?: string;        // headline impact, e.g. "+45% task success"
  stack?: string[];       // tech chips (falls back to tags if empty)
  problem?: string;
  approach?: string;
  outcome?: string;
  diagram?: string;       // ASCII pipeline diagram (monospace)
  githubUrl?: string;
}

// ─── Skills ─────────────────────────────────────────────────────────────────
export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;  // 5 = expert
  note: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  icon?: string;
  items: Skill[];
}

// ─── Contact ────────────────────────────────────────────────────────────────
export interface ContactLink {
  id: string;
  label: string;
  url: string;
  icon: string;           // lucide icon name
  visible: boolean;
}

export interface ContactData {
  heading: string;
  subtext: string;
  links: ContactLink[];
}

// ─── Demos ──────────────────────────────────────────────────────────────────
export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'neutral';
  delayAfter: number;     // ms before next command
}

export interface SentimentKeywords {
  positive: string[];
  negative: string[];
  neutral: string[];
}

export interface DemosData {
  terminalCommands: TerminalCommand[];
  sentimentKeywords: SentimentKeywords;
  sentimentThresholds: { positive: number; negative: number };
}

// ─── Resume & AI Tailor ─────────────────────────────────────────────────────
export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  year: string;
  gpa?: string;
  details?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;        // "Present" or date string
  location?: string;
  bullets: string[];
}

export type PDFStyle = 'clean-modern' | 'ats-minimal' | 'technical';
export type AITone  = 'confident' | 'humble' | 'technical' | 'balanced';

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  baseSummary: string;
  education: EducationEntry[];
  certifications: CertificationEntry[];
  experience: ExperienceEntry[];
  pdfStyle: PDFStyle;
  pdfAccentColor: string;
  includeSections: {
    education: boolean;
    certifications: boolean;
    experience: boolean;
    projects: boolean;
    skills: boolean;
  };
  aiSettings: {
    systemPromptOverride?: string;
    alwaysEmphasize: string[];
    neverInclude: string[];
    tone: AITone;
  };
}

// ─── Analytics ──────────────────────────────────────────────────────────────
export interface AnalyticsEntry {
  timestamp: string;
  mode: 'role' | 'jd';
  inputSummary: string;   // role name or first 60 chars of JD
  matchScore: number;
  ip?: string;
}

export interface AnalyticsData {
  totalGenerations: number;
  entries: AnalyticsEntry[];
  topRoles: { role: string; count: number }[];
  avgMatchScore: number;
}

// ─── SEO / Meta ─────────────────────────────────────────────────────────────
export interface MetaData {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  faviconUrl: string;
  gaId?: string;
  twitterHandle?: string;
}

// ─── AI Tailor API ──────────────────────────────────────────────────────────
export interface TailorRequest {
  mode: 'role' | 'jd';
  input: string;
}

export interface MatchedRequirement {
  requirement: string;
  matched: boolean;
  evidence: string;
}

export interface RelevantProject {
  projectId: string;
  relevanceScore: number;
  explanation: string;
}

export interface TailoredExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface TailoredProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface TailoredResume {
  title: string;
  summary: string;
  skills: string[];
  experience: TailoredExperience[];
  projects: TailoredProject[];
}

export interface TailorResponse {
  matchScore: number;
  summary: string;
  matchedRequirements: MatchedRequirement[];
  relevantProjects: RelevantProject[];
  tailoredResume: TailoredResume;
}

// ─── Content store ──────────────────────────────────────────────────────────
export type ContentKey = 'profile' | 'projects' | 'skills' | 'contact' | 'demos' | 'resume' | 'analytics' | 'meta';
