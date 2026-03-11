/**
 * English Translations
 * 
 * Single source of truth for all English text
 * KISS: Flat structure, no nesting beyond 2 levels
 */

import type { I18nLabels } from '../types';

export const en: I18nLabels = {
  nav: {
    home: 'Home',
    skills: 'Skills',
    categories: 'Categories',
    installGuide: 'Install Guide',
    faq: 'FAQ',
    searchPlaceholder: 'Search skills...',
    github: 'GitHub',
  },

  hero: {
    badge: 'AI Economy Marketplace',
    headline: ['AI Economy', 'Open Credit', 'Infinite Potential'],
    subtitle: 'The premier marketplace for AI agent skills. Build, monetize, and discover capabilities that power the open AI economy.',
    cta: {
      browse: 'Browse Skills',
      installGuide: 'Install Guide',
    },
    stats: {
      skills: 'Community Skills',
      categories: 'Categories',
      downloads: 'Monthly Downloads',
    },
    supportedFrameworks: 'Supported Frameworks',
  },

  skills: {
    title: 'Popular Skills',
    subtitle: (count: number) => `Discover ${count} community-curated skills`,
    searchPlaceholder: 'Search skills...',
    emptyState: {
      title: 'No skills found',
      description: 'Try different keywords or clear filters',
      clearFilters: 'Clear Filters',
    },
    loadMore: 'Load More',
  },

  categories: {
    title: 'Browse by Category',
    subtitle: (count: number) => `Explore our comprehensive catalog across ${count} major domains`,
    all: 'All',
  },

  installGuide: {
    badge: 'Quick Start',
    title: 'Easy Setup — No Coding Required',
    subtitle: 'Get started with AI skills in minutes',
    methods: {
      cli: {
        name: 'CLI Install',
        description: 'Install skills quickly using ClawdHub CLI',
        steps: [
          {
            title: 'Install CLI',
            code: 'npm install -g clawdhub',
            description: 'Install ClawdHub CLI tool globally',
          },
          {
            title: 'Search Skills',
            code: 'clawdhub search <skill-name>',
            description: 'Search for skills you need',
          },
          {
            title: 'Install Skill',
            code: 'npx clawdhub@latest install <skill-slug>',
            description: 'Install the specified skill to your OpenCreditAi',
          },
        ],
      },
      manual: {
        name: 'Manual Install',
        description: 'Manually copy skill files to designated directories',
        steps: [
          {
            title: 'Download Skill',
            code: 'git clone <skill-repo>',
            description: 'Download skill repository from GitHub',
          },
          {
            title: 'Global Install',
            code: 'cp -r skill-folder ~/.openclaw/skills/',
            description: 'Copy to global skills directory',
          },
          {
            title: 'Project Install',
            code: 'cp -r skill-folder ./skills/',
            description: 'Or copy to current project directory',
          },
        ],
      },
    },
    priority: {
      title: 'Skill Loading Priority',
      levels: [
        { label: 'Workspace', path: '<project>/skills/', desc: 'Project-level (Highest)' },
        { label: 'Global', path: '~/.openclaw/skills/', desc: 'Global-level' },
        { label: 'Bundled', path: 'Built-in', desc: 'Built-in skills' },
      ],
    },
  },

  faq: {
    badge: 'FAQ',
    title: 'Questions? We have answers',
    subtitle: 'Frequently asked questions about OpenCreditAi Marketplace',
    items: [
      {
        question: 'What are OpenCreditAi?',
        answer: 'OpenCreditAi are modular capability extensions that enable your AI assistant (like Claude Code, OpenCode, Codex, etc.) to perform specialized tasks. They follow the Agent Skill open standard developed by Anthropic, allowing AI assistants to interact with external services, automate workflows, and execute various professional tasks from code review to documentation generation and security analysis.',
      },
      {
        question: 'How do I install OpenCreditAi?',
        answer: 'Installing skills is simple. The easiest method is using ClawdHub CLI: run `npx clawdhub@latest install <skill-slug>` to install a specific skill. Alternatively, you can manually copy the skill folder to `~/.openclaw/skills/` (global) or `<project>/skills/` (project-level) directory.',
      },
      {
        question: 'Which AI agent frameworks are supported?',
        answer: 'OpenCreditAi supports all AI coding assistants that follow the Agent Skill standard, including Claude Code, OpenCode, Codex, Cursor, Aider, Windsurf, Zed, RooCode, Gemini CLI, GitHub Copilot, and more. This universal compatibility allows you to seamlessly switch between different AI tools.',
      },
      {
        question: 'What is the difference between skills and simple prompts?',
        answer: 'Skills offer significant advantages over simple prompts: 1) Reusability - install once, use everywhere; 2) Complexity - support multi-step workflows; 3) Quality - tested and scored; 4) Updates - automatic updates via CLI. Simple prompts require copy-pasting each time and are difficult to maintain.',
      },
      {
        question: 'Can I create my own skills?',
        answer: 'Absolutely! You can create custom skills following the Agent Skill standard. A skill typically includes a SKILL.md file (describing capabilities and usage scenarios), necessary code files, and configuration. Once created, you can submit it to the Awesome OpenCreditAi list to share with the community.',
      },
      {
        question: 'What is the skill loading priority?',
        answer: 'OpenCreditAi loads skills in the following priority (from highest to lowest): 1) Workspace level - current project\'s skills/ directory; 2) Global level - ~/.openclaw/skills/ directory; 3) Bundled level - built-in OpenCreditAi. This allows you to override global skill configurations at the project level.',
      },
      {
        question: 'How do I update installed skills?',
        answer: 'You can easily update skills using ClawdHub CLI. Run `clawdhub update <skill-name>` to update a specific skill, or run `clawdhub update --all` to update all installed skills. The CLI will automatically check for the latest version and perform the update.',
      },
      {
        question: 'How is skill security ensured?',
        answer: 'Community skills go through a review process, but we recommend checking the skill\'s source code and permission requirements before installation. OpenCreditAi will request confirmation before performing sensitive operations. For enterprise environments, we recommend distributing security-reviewed skill versions internally.',
      },
    ],
    contact: {
      title: 'Still have questions?',
      description: 'Join our community for more help and support',
      github: 'Visit GitHub',
      discord: 'Join Discord',
    },
  },

  footer: {
    tagline: 'Building the open AI economy. Infinite potential, one skill at a time.',
    links: {
      product: 'Product',
      resources: 'Resources',
      community: 'Community',
      legal: 'Legal',
    },
    copyright: `© ${new Date().getFullYear()} OpenCreditAi Marketplace. All rights reserved.`,
    poweredBy: 'Powered by the community, for the community',
  },

  skillCard: {
    by: 'by',
    tagPrefix: '#',
    moreTags: (count: number) => `+${count}`,
    installCommand: 'Install Command',
    installCount: (count: string) => `${count} installs`,
    copyCommand: 'Copy Install Command',
    copied: 'Copied',
    apiCommands: 'API Commands',
    capabilities: 'Capabilities',
    supported: 'Supported',
    unsupported: 'Not Supported',
    usageExample: 'Usage Example',
  },
};

export default en;
