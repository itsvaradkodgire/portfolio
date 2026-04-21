import Anthropic from '@anthropic-ai/sdk';
import type {
  TailorRequest,
  TailorResponse,
  Profile,
  Project,
  SkillCategory,
  ResumeData,
} from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Cache (in-memory, TTL 24h) ──────────────────────────────────────────────
const cache = new Map<string, { data: TailorResponse; expiresAt: number }>();

function getCacheKey(input: string): string {
  // Simple hash using built-in crypto
  const str = input.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}

function getCached(key: string): TailorResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: TailorResponse): void {
  cache.set(key, { data, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
}

// ─── Prompt engineering ──────────────────────────────────────────────────────
function buildSystemPrompt(
  profile: Profile,
  projects: Project[],
  skills: SkillCategory[],
  resume: ResumeData
): string {
  const projectSummary = projects
    .map(
      (p) =>
        `- ${p.id}: "${p.title}" — ${p.description.slice(0, 200)} [tags: ${p.tags.join(', ')}]`
    )
    .join('\n');

  const skillsSummary = skills
    .map(
      (cat) =>
        `${cat.label}: ${cat.items.map((s) => `${s.name}(L${s.level})`).join(', ')}`
    )
    .join('\n');

  const experienceSummary = resume.experience
    .map(
      (e) =>
        `${e.title} at ${e.company} (${e.startDate}–${e.endDate}):\n  ${e.bullets.join('\n  ')}`
    )
    .join('\n\n');

  return `You are an expert technical recruiter and resume tailoring assistant for ${profile.name}, an ${profile.title}.

CANDIDATE PROFILE:
Name: ${profile.name}
Title: ${profile.title}
Summary: ${resume.baseSummary}

PROJECTS:
${projectSummary}

SKILLS:
${skillsSummary}

EXPERIENCE:
${experienceSummary}

EDUCATION:
${resume.education.map((e) => `${e.degree} from ${e.school} (${e.year})`).join(', ')}

CERTIFICATIONS:
${resume.certifications.map((c) => `${c.name} by ${c.issuer} (${c.year})`).join(', ')}

AI SETTINGS:
- Always emphasize: ${resume.aiSettings.alwaysEmphasize.join(', ')}
- Never include: ${resume.aiSettings.neverInclude.length > 0 ? resume.aiSettings.neverInclude.join(', ') : 'nothing excluded'}
- Tone: ${resume.aiSettings.tone}
${resume.aiSettings.systemPromptOverride ? `\nCUSTOM INSTRUCTIONS:\n${resume.aiSettings.systemPromptOverride}` : ''}

Your task: Analyze the provided job description or role and return a JSON response (NO markdown, NO preamble, valid JSON only) with this exact structure:
{
  "matchScore": <integer 0-100>,
  "summary": "<2-3 sentence summary of fit>",
  "matchedRequirements": [
    { "requirement": "<requirement text>", "matched": <true/false>, "evidence": "<how candidate meets it or why it's a growth area>" }
  ],
  "relevantProjects": [
    { "projectId": "<project id>", "relevanceScore": <integer 0-100>, "explanation": "<why this project is relevant>" }
  ],
  "tailoredResume": {
    "title": "<tailored job title>",
    "summary": "<tailored 3-4 sentence professional summary>",
    "skills": ["<skill1>", "<skill2>", ...],
    "experience": [
      { "company": "<company>", "title": "<title>", "startDate": "<date>", "endDate": "<date>", "bullets": ["<bullet>", ...] }
    ],
    "projects": [
      { "id": "<project_id>", "title": "<title>", "description": "<JD-tailored description>", "tags": ["<tag>", ...] }
    ]
  }
}`;
}

// ─── Main tailor function ────────────────────────────────────────────────────
export async function tailorProfile(
  request: TailorRequest,
  profile: Profile,
  projects: Project[],
  skills: SkillCategory[],
  resume: ResumeData
): Promise<TailorResponse> {
  const cacheKey = getCacheKey(request.input);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const systemPrompt = buildSystemPrompt(profile, projects, skills, resume);
  const userMessage =
    request.mode === 'role'
      ? `Analyze this candidate's fit for the following role: "${request.input}". Provide the full analysis and tailored resume.`
      : `Analyze this job description and tailor the candidate's profile accordingly:\n\n${request.input}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any markdown code fences if the model added them
  const jsonStr = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  const result = JSON.parse(jsonStr) as TailorResponse;
  setCached(cacheKey, result);
  return result;
}
