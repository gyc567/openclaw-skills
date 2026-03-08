/**
 * i18n Type Definitions
 * 
 * Centralized type system for internationalization
 * Ensures type safety across all components
 */

export interface NavLabels {
  home: string;
  skills: string;
  categories: string;
  installGuide: string;
  faq: string;
  searchPlaceholder: string;
  github: string;
}

export interface HeroLabels {
  badge: string;
  headline: string[];
  subtitle: string;
  cta: {
    browse: string;
    installGuide: string;
  };
  stats: {
    skills: string;
    categories: string;
    downloads: string;
  };
  supportedFrameworks: string;
}

export interface SkillsLabels {
  title: string;
  subtitle: (count: number) => string;
  searchPlaceholder: string;
  emptyState: {
    title: string;
    description: string;
    clearFilters: string;
  };
  loadMore: string;
}

export interface CategoryLabels {
  title: string;
  subtitle: (count: number) => string;
  all: string;
}

export interface InstallGuideLabels {
  badge: string;
  title: string;
  subtitle: string;
  methods: {
    cli: {
      name: string;
      description: string;
      steps: Array<{
        title: string;
        code: string;
        description: string;
      }>;
    };
    manual: {
      name: string;
      description: string;
      steps: Array<{
        title: string;
        code: string;
        description: string;
      }>;
    };
  };
  priority: {
    title: string;
    levels: Array<{
      label: string;
      path: string;
      desc: string;
    }>;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqLabels {
  badge: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
  contact: {
    title: string;
    description: string;
    github: string;
    discord: string;
  };
}

export interface FooterLabels {
  tagline: string;
  links: {
    product: string;
    resources: string;
    community: string;
    legal: string;
  };
  copyright: string;
  poweredBy: string;
}

export interface SkillCardLabels {
  by: string;
  tagPrefix: string;
  moreTags: (count: number) => string;
  installCommand: string;
  installCount: (count: string) => string;
  copyCommand: string;
  copied: string;
  apiCommands: string;
  capabilities: string;
  supported: string;
  unsupported: string;
  usageExample: string;
}

export interface I18nLabels {
  nav: NavLabels;
  hero: HeroLabels;
  skills: SkillsLabels;
  categories: CategoryLabels;
  installGuide: InstallGuideLabels;
  faq: FaqLabels;
  footer: FooterLabels;
  skillCard: SkillCardLabels;
}
