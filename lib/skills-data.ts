
export interface SkillApiCommand {
  name: string;
  description: string;
  parameters?: string;
}

export interface SkillApi {
  commands: SkillApiCommand[];
}

export interface SkillCapabilities {
  supported: string[];
  unsupported: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  downloads?: number;
  rating?: number;
  installs?: string;
  api?: SkillApi;
  capabilities?: SkillCapabilities;
  usage?: string;
}

export const categories = [
  { id: "web-frontend", name: "Web & Frontend", count: 14, color: "#3b82f6" },
  { id: "coding-agents", name: "Coding Agents & IDEs", count: 15, color: "#8b5cf6" },
  { id: "git-github", name: "Git & GitHub", count: 9, color: "#f97316" },
  { id: "devops-cloud", name: "DevOps & Cloud", count: 41, color: "#06b6d4" },
  { id: "browser-automation", name: "Browser & Automation", count: 11, color: "#10b981" },
  { id: "image-video", name: "Image & Video", count: 19, color: "#ec4899" },
  { id: "apple-services", name: "Apple Apps & Services", count: 14, color: "#64748b" },
  { id: "search-research", name: "Search & Research", count: 23, color: "#f59e0b" },
  { id: "opencreditai-tools", name: "OpenCreditAi Tools", count: 17, color: "#ef4444" },
  { id: "cli-utilities", name: "CLI Utilities", count: 41, color: "#14b8a6" },
  { id: "marketing-sales", name: "Marketing & Sales", count: 42, color: "#f97316" },
  { id: "productivity", name: "Productivity & Tasks", count: 42, color: "#22c55e" },
  { id: "ai-llms", name: "AI & LLMs", count: 38, color: "#a855f7" },
  { id: "finance", name: "Finance", count: 29, color: "#84cc16" },
  { id: "media-streaming", name: "Media & Streaming", count: 29, color: "#ec4899" },
  { id: "notes-pkm", name: "Notes & PKM", count: 44, color: "#06b6d4" },
  { id: "ios-macos", name: "iOS & macOS Dev", count: 13, color: "#6366f1" },
  { id: "transportation", name: "Transportation", count: 34, color: "#f59e0b" },
  { id: "personal-dev", name: "Personal Development", count: 27, color: "#10b981" },
  { id: "health-fitness", name: "Health & Fitness", count: 26, color: "#ef4444" },
  { id: "communication", name: "Communication", count: 26, color: "#3b82f6" },
  { id: "smart-home", name: "Smart Home & IoT", count: 31, color: "#8b5cf6" },
  { id: "shopping", name: "Shopping & E-commerce", count: 22, color: "#f97316" },
  { id: "calendar", name: "Calendar & Scheduling", count: 16, color: "#06b6d4" },
  { id: "pdf-documents", name: "PDF & Documents", count: 12, color: "#64748b" },
  { id: "self-hosted", name: "Self-Hosted & Automation", count: 11, color: "#22c55e" },
  { id: "security", name: "Security & Passwords", count: 6, color: "#ef4444" },
];

export const skills: Skill[] = [
  // Web & Frontend
  {
    id: "discord",
    name: "discord",
    description: "Control Discord from OpenCreditAi via the discord tool: send messages, react to messages, manage channels.",
    author: "openclaw",
    category: "web-frontend",
    tags: ["discord", "chat", "messaging"],
    installs: "12.5k",
  },
  {
    id: "frontend-design",
    name: "frontend-design",
    description: "Create distinctive, production-grade frontend interfaces with high design quality and modern aesthetics.",
    author: "designkit",
    category: "web-frontend",
    tags: ["design", "frontend", "ui", "css"],
    installs: "8.2k",
  },
  {
    id: "vercel-react-best-practices",
    name: "vercel-react-best-practices",
    description: "React and Next.js performance optimization guidelines from Vercel Engineering team.",
    author: "vercel",
    category: "web-frontend",
    tags: ["react", "nextjs", "performance", "vercel"],
    installs: "25.1k",
  },
  {
    id: "slack",
    name: "slack",
    description: "Control Slack from OpenCreditAi via the slack tool: send messages, manage channels, and interact with workspaces.",
    author: "openclaw",
    category: "web-frontend",
    tags: ["slack", "messaging", "workspace"],
    installs: "18.3k",
  },
  {
    id: "ui-audit",
    name: "ui-audit",
    description: "AI skill for automated UI audits. Evaluate interfaces against proven UX principles and best practices.",
    author: "uxteam",
    category: "web-frontend",
    tags: ["ui", "audit", "ux", "review"],
    installs: "5.7k",
  },

  // Coding Agents & IDEs
  {
    id: "claude-team",
    name: "claude-team",
    description: "Orchestrate multiple Claude Code workers via iTerm2 using the claude-team MCP server.",
    author: "anthropic",
    category: "coding-agents",
    tags: ["claude", "orchestration", "mcp"],
    installs: "9.8k",
  },
  {
    id: "cursor-agent",
    name: "cursor-agent",
    description: "A comprehensive skill for using the Cursor CLI agent effectively with best practices.",
    author: "cursor",
    category: "coding-agents",
    tags: ["cursor", "ide", "agent"],
    installs: "22.4k",
  },
  {
    id: "codex-monitor",
    name: "codex-monitor",
    description: "Browse OpenAI Codex session logs stored in ~/.codex/sessions with powerful search and filtering.",
    author: "openai",
    category: "coding-agents",
    tags: ["codex", "monitoring", "logs", "openai"],
    installs: "6.3k",
  },
  {
    id: "opencode-acp-control",
    name: "opencode-acp-control",
    description: "Control OpenCode directly via the Agent Client Protocol (ACP) for advanced automation.",
    author: "opencode",
    category: "coding-agents",
    tags: ["opencode", "acp", "automation"],
    installs: "4.1k",
  },
  {
    id: "agentlens",
    name: "agentlens",
    description: "Navigate and understand codebases using agentlens hierarchical documentation system.",
    author: "agentlens",
    category: "coding-agents",
    tags: ["navigation", "documentation", "codebase"],
    installs: "3.8k",
  },

  // Git & GitHub
  {
    id: "github",
    name: "github",
    description: "Interact with GitHub using the gh CLI. Manage repos, PRs, issues, and workflows seamlessly.",
    author: "github",
    category: "git-github",
    tags: ["github", "git", "cli"],
    installs: "31.2k",
  },
  {
    id: "github-pr",
    name: "github-pr",
    description: "Fetch, preview, merge, and test GitHub PRs locally with comprehensive review capabilities.",
    author: "github-tools",
    category: "git-github",
    tags: ["github", "pr", "review", "merge"],
    installs: "15.6k",
  },
  {
    id: "conventional-commits",
    name: "conventional-commits",
    description: "Format commit messages using the Conventional Commits specification for better changelog generation.",
    author: "commitlint",
    category: "git-github",
    tags: ["git", "commits", "conventional", "standard"],
    installs: "11.9k",
  },
  {
    id: "read-github",
    name: "read-github",
    description: "Read GitHub repos via gitmcp.io with semantic search and LLM-optimized output formatting.",
    author: "gitmcp",
    category: "git-github",
    tags: ["github", "mcp", "semantic-search"],
    installs: "7.4k",
  },

  // DevOps & Cloud
  {
    id: "cloudflare",
    name: "cloudflare",
    description: "Manage Cloudflare Workers, KV, D1, R2, and secrets using the Wrangler CLI.",
    author: "cloudflare",
    category: "devops-cloud",
    tags: ["cloudflare", "workers", "edge", "cdn"],
    installs: "14.2k",
  },
  {
    id: "kubectl-skill",
    name: "kubectl-skill",
    description: "Execute and manage Kubernetes clusters via kubectl commands with intelligent completions.",
    author: "kubernetes",
    category: "devops-cloud",
    tags: ["kubernetes", "k8s", "kubectl", "containers"],
    installs: "19.8k",
  },
  {
    id: "supabase",
    name: "supabase",
    description: "Connect to Supabase for database management, authentication, and real-time subscriptions.",
    author: "supabase",
    category: "devops-cloud",
    tags: ["supabase", "postgres", "database", "backend"],
    installs: "16.5k",
  },
  {
    id: "digital-ocean",
    name: "digital-ocean",
    description: "Manage Digital Ocean droplets, domains, and infrastructure via DO API integration.",
    author: "digitalocean",
    category: "devops-cloud",
    tags: ["digitalocean", "cloud", "vps", "infrastructure"],
    installs: "8.7k",
  },
  {
    id: "hetzner-cloud",
    name: "hetzner-cloud",
    description: "Hetzner Cloud CLI for managing servers, volumes, firewalls, networks, DNS, and snapshots.",
    author: "hetzner",
    category: "devops-cloud",
    tags: ["hetzner", "cloud", "servers", "vps"],
    installs: "10.3k",
  },

  // AI & LLMs
  {
    id: "openai",
    name: "openai",
    description: "Interact with OpenAI API for GPT models, embeddings, and DALL-E image generation.",
    author: "openai",
    category: "ai-llms",
    tags: ["openai", "gpt", "llm", "ai"],
    installs: "28.6k",
  },
  {
    id: "anthropic",
    name: "anthropic",
    description: "Work with Anthropic's Claude API for advanced reasoning and conversation capabilities.",
    author: "anthropic",
    category: "ai-llms",
    tags: ["anthropic", "claude", "llm", "ai"],
    installs: "24.3k",
  },
  {
    id: "ollama",
    name: "ollama",
    description: "Run and manage local LLMs with Ollama. Self-host models for privacy and offline use.",
    author: "ollama",
    category: "ai-llms",
    tags: ["ollama", "local-llm", "self-hosted", "ai"],
    installs: "13.9k",
  },
  {
    id: "perplexity",
    name: "perplexity",
    description: "Search the web using Perplexity AI for real-time information and research.",
    author: "perplexity",
    category: "ai-llms",
    tags: ["perplexity", "search", "research", "ai"],
    installs: "9.2k",
  },

  // Productivity & Tasks
  {
    id: "deepwork-tracker",
    name: "deepwork-tracker",
    description: "Track deep work sessions locally with start/stop/status commands and productivity insights.",
    author: "productivity",
    category: "productivity",
    tags: ["productivity", "focus", "time-tracking"],
    installs: "5.4k",
  },
  {
    id: "linearis",
    name: "linearis",
    description: "Linear.app CLI for issue tracking. List, create, update issues and manage projects.",
    author: "linear",
    category: "productivity",
    tags: ["linear", "project-management", "issues"],
    installs: "11.7k",
  },
  {
    id: "notion",
    name: "notion",
    description: "Interact with Notion workspaces, databases, and pages via the Notion API.",
    author: "notion",
    category: "productivity",
    tags: ["notion", "notes", "wiki", "database"],
    installs: "17.8k",
  },

  // Browser & Automation
  {
    id: "puppeteer",
    name: "puppeteer",
    description: "Control headless Chrome with Puppeteer for web scraping and browser automation.",
    author: "google",
    category: "browser-automation",
    tags: ["puppeteer", "browser", "automation", "scraping"],
    installs: "12.3k",
  },
  {
    id: "playwright",
    name: "playwright",
    description: "Cross-browser automation with Playwright for testing and web scraping.",
    author: "microsoft",
    category: "browser-automation",
    tags: ["playwright", "testing", "automation", "browser"],
    installs: "14.7k",
  },
  {
    id: "selenium",
    name: "selenium",
    description: "Classic browser automation with Selenium WebDriver for legacy and modern browsers.",
    author: "selenium",
    category: "browser-automation",
    tags: ["selenium", "webdriver", "automation"],
    installs: "8.9k",
  },

  // Image & Video
  {
    id: "ffmpeg",
    name: "ffmpeg",
    description: "Video and audio processing with FFmpeg. Convert, edit, and manipulate media files.",
    author: "ffmpeg",
    category: "image-video",
    tags: ["ffmpeg", "video", "audio", "media"],
    installs: "16.4k",
  },
  {
    id: "sharp",
    name: "sharp",
    description: "High-performance image processing with Sharp. Resize, convert, and optimize images.",
    author: "lovell",
    category: "image-video",
    tags: ["sharp", "images", "processing", "optimization"],
    installs: "11.2k",
  },
  {
    id: "remotion",
    name: "remotion",
    description: "Create videos programmatically with React. Render videos on servers without GUI.",
    author: "remotion",
    category: "image-video",
    tags: ["remotion", "video", "react", "programmatic"],
    installs: "7.8k",
  },

  // Finance
  {
    id: "stripe",
    name: "stripe",
    description: "Integrate Stripe payments, subscriptions, and billing with comprehensive API support.",
    author: "stripe",
    category: "finance",
    tags: ["stripe", "payments", "billing", "saas"],
    installs: "20.5k",
  },
  {
    id: "plaid",
    name: "plaid",
    description: "Connect bank accounts and access financial data with Plaid API integration.",
    author: "plaid",
    category: "finance",
    tags: ["plaid", "banking", "finance", "api"],
    installs: "6.7k",
  },

  // Notes & PKM
  {
    id: "obsidian",
    name: "obsidian",
    description: "Interact with Obsidian vaults for note-taking and personal knowledge management.",
    author: "obsidian",
    category: "notes-pkm",
    tags: ["obsidian", "notes", "pkm", "markdown"],
    installs: "9.3k",
  },
  {
    id: "logseq",
    name: "logseq",
    description: "Work with Logseq for outliner-based note-taking and knowledge graphs.",
    author: "logseq",
    category: "notes-pkm",
    tags: ["logseq", "outliner", "notes", "graph"],
    installs: "4.2k",
  },

  // Smart Home & IoT
  {
    id: "homeassistant",
    name: "homeassistant",
    description: "Control Home Assistant for smart home automation and device management.",
    author: "homeassistant",
    category: "smart-home",
    tags: ["homeassistant", "smarthome", "iot", "automation"],
    installs: "8.1k",
  },
  {
    id: "nodered",
    name: "nodered",
    description: "Visual programming for IoT with Node-RED flow-based development.",
    author: "nodered",
    category: "smart-home",
    tags: ["nodered", "iot", "flows", "automation"],
    installs: "5.6k",
  },

  // Security
  {
    id: "1password",
    name: "1password",
    description: "Securely access passwords and secrets from 1Password vaults.",
    author: "1password",
    category: "security",
    tags: ["1password", "passwords", "security", "secrets"],
    installs: "13.4k",
  },
  {
    id: "bitwarden",
    name: "bitwarden",
    description: "Open-source password management with Bitwarden CLI integration.",
    author: "bitwarden",
    category: "security",
    tags: ["bitwarden", "passwords", "security", "opensource"],
    installs: "7.9k",
  },

  {
    id: "assist_agent_repair",
    name: "assist_agent_repair",
    description: "Use A2A protocol to help another OpenClaw agent diagnose, repair configuration issues, and restart if needed. Supports discovery, file edits, and session coordination.",
    author: "Grok Assistant",
    category: "opencreditai-tools",
    tags: ["openclaw", "agent", "repair", "a2a", "configuration"],
    installs: "0",
    api: {
      commands: [
        { name: "discover_sessions", description: "List all active agent sessions", parameters: "()" },
        { name: "diagnose_issue", description: "Fetch session logs for diagnosis", parameters: "(session_id: string, limit?: number)" },
        { name: "repair_config", description: "Repair agent configuration issues", parameters: "(session_id: string, issue_type: string)" },
        { name: "restart_agent", description: "Restart target agent session", parameters: "(session_id: string, scope?: string)" }
      ]
    }
  },
];

export const getSkillsByCategory = (categoryId: string): Skill[] => {
  return skills.filter((skill) => skill.category === categoryId);
};

export const getSkillById = (id: string): Skill | undefined => {
  return skills.find((skill) => skill.id === id);
};

export const searchSkills = (query: string): Skill[] => {
  const lowercaseQuery = query.toLowerCase();
  return skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      skill.description.toLowerCase().includes(lowercaseQuery) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const totalSkills = 701;
export const totalCategories = categories.length;
