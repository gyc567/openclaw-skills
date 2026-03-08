"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Github, Terminal, ArrowRight } from "lucide-react";
import { en } from "@/lib/i18n";

const t = en.nav;

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const navLinks = [
    { label: t.skills, href: "#skills" },
    { label: t.categories, href: "#categories" },
    { label: t.installGuide, href: "#install" },
    { label: t.faq, href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group"
          >
            <img
              src="/clawAgentSkillStore.png"
              alt="ClawSkillStore"
              className="h-8 w-auto"
            />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded bg-border flex items-center justify-center group-hover:bg-accent transition-colors">
              <Terminal className="w-4 h-4 text-foreground" />
            </div>
            <span className="font-mono text-sm font-medium text-foreground group-hover:text-accent transition-colors">
              OpenClawSkills
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 pl-8 bg-secondary border-border text-sm font-mono focus:border-accent transition-colors"
              />
            </form>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary transition-colors font-mono text-xs"
              asChild
            >
              <a
                href="https://github.com/VoltAgent/awesome-openclaw-skills"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-3.5 h-3.5 mr-2" />
                {t.github}
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 bg-secondary border-border font-mono"
              />
            </form>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors font-mono"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="outline"
              className="w-full border-border font-mono text-xs"
              asChild
            >
              <a
                href="https://github.com/VoltAgent/awesome-openclaw-skills"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-3.5 h-3.5 mr-2" />
                {t.github}
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
