"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, MessageCircle, Terminal, ArrowUpRight } from "lucide-react";
import { en } from "@/lib/i18n";

const t = en.footer;

const footerLinks = {
  product: [
    { label: "Skills", href: "#skills" },
    { label: "Categories", href: "#categories" },
    { label: "Install Guide", href: "#install" },
    { label: "Documentation", href: "#" },
  ],
  resources: [
    { label: "GitHub", href: "https://github.com/VoltAgent/awesome-openclaw-skills" },
    { label: "Submit Skill", href: "https://github.com/VoltAgent/awesome-openclaw-skills" },
    { label: "Contributing", href: "#" },
    { label: "API Docs", href: "#" },
  ],
  community: [
    { label: "Discord", href: "#" },
    { label: "Twitter", href: "#" },
    { label: "Discussions", href: "#" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "License", href: "#" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/VoltAgent/awesome-openclaw-skills", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: MessageCircle, href: "#", label: "Discord" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <a
              href="#"
              className="flex items-center gap-2 mb-3"
            >
              <img
                src="/clawAgentSkillStore.png"
                alt="OpenCreditAi"
                className="h-8 w-auto"
              />
            </a>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs leading-relaxed font-mono">
              {t.tagline}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground mb-3 text-xs font-mono flex items-center gap-1">
              {t.links.product}
              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3 text-xs font-mono flex items-center gap-1">
              {t.links.resources}
              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3 text-xs font-mono flex items-center gap-1">
              {t.links.community}
              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
            </h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-mono">
            {t.copyright}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{t.poweredBy}</span>
            <span className="text-accent">OpenCreditAi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
