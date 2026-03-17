const GITHUB_API = "https://api.github.com";
const SKILLS_REPO_OWNER = "openclaw";
const SKILLS_REPO = "skills";

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
  download_url: string | null;
  content?: string;
}

interface GitHubSkillMeta {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  repository?: string;
}

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${GITHUB_API}${endpoint}`, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function listSkills(): Promise<GitHubFile[]> {
  const data = await fetchGitHub<GitHubFile[]>(
    `/repos/${SKILLS_REPO_OWNER}/${SKILLS_REPO}/contents`
  );
  return data.filter((f) => f.type === "dir");
}

export async function getSkillFiles(skillName: string): Promise<GitHubFile[]> {
  const data = await fetchGitHub<GitHubFile[]>(
    `/repos/${SKILLS_REPO_OWNER}/${SKILLS_REPO}/contents/${skillName}`
  );
  return data;
}

export async function getSkillFile(skillName: string, fileName: string): Promise<string> {
  const data = await fetchGitHub<GitHubFile>(
    `/repos/${SKILLS_REPO_OWNER}/${SKILLS_REPO}/contents/${skillName}/${fileName}`
  );

  if (!data.content) {
    throw new Error("File content not found");
  }

  return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function getSkillMetadata(skillName: string): Promise<GitHubSkillMeta | null> {
  try {
    const content = await getSkillFile(skillName, "SKILL.md");
    const metaMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!metaMatch) return null;

    const meta: Record<string, unknown> = {};
    const lines = metaMatch[1].split("\n");
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        const value = valueParts.join(":").trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          meta[key.trim()] = value.slice(1, -1);
        } else if (value === "true" || value === "false") {
          meta[key.trim()] = value === "true";
        } else if (!isNaN(Number(value))) {
          meta[key.trim()] = Number(value);
        } else {
          meta[key.trim()] = value;
        }
      }
    }

    return meta as unknown as GitHubSkillMeta;
  } catch {
    return null;
  }
}

export async function searchSkills(query: string): Promise<string[]> {
  const skills = await listSkills();
  const lowerQuery = query.toLowerCase();
  
  const matched: string[] = [];
  
  for (const skill of skills) {
    const meta = await getSkillMetadata(skill.name);
    if (meta) {
      const searchable = `${meta.name} ${meta.description} ${meta.tags?.join(" ")}`.toLowerCase();
      if (searchable.includes(lowerQuery)) {
        matched.push(skill.name);
      }
    } else if (skill.name.toLowerCase().includes(lowerQuery)) {
      matched.push(skill.name);
    }
  }

  return matched;
}

export async function getSkillReadme(skillName: string): Promise<string> {
  return getSkillFile(skillName, "README.md");
}

export async function skillExists(skillName: string): Promise<boolean> {
  try {
    await fetchGitHub<GitHubFile>(
      `/repos/${SKILLS_REPO_OWNER}/${SKILLS_REPO}/contents/${skillName}`
    );
    return true;
  } catch {
    return false;
  }
}
