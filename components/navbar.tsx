"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, ChevronDown, Wallet, Settings, LogOut, User } from "lucide-react";
import { en } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";
import { WalletModal } from "@/components/wallet-modal";

const t = en.nav;

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    address,
    balance,
    isConnected,
    isConnecting,
    disconnect,
    isWrongNetwork,
    refreshWallets,
  } = useWallet();

  useEffect(() => {
    refreshWallets();
  }, [refreshWallets]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const navLinks = [
    { label: "Claw Dojo", href: "/dojo" },
    { label: "Sell Skills", href: "/seller" },
    { label: "Blog", href: "/blog" },
    { label: "Audit", href: "/audit" },
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
              alt="OpenCreditAi"
              className="h-8 w-auto"
            />
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

            {isConnected && address ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded text-sm font-mono hover:border-accent transition-colors"
                >
                  <Wallet className="w-4 h-4 text-accent" />
                  <span className="max-w-[80px] truncate">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  <span className="text-muted-foreground">${Number(balance).toFixed(2)}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground font-mono">Balance</p>
                      <p className="text-sm font-mono">${Number(balance).toFixed(2)} USDC</p>
                    </div>
                    {isWrongNetwork && (
                      <div className="px-3 py-2 border-b border-border bg-yellow-500/10">
                        <p className="text-xs text-yellow-500 font-mono">Wrong Network</p>
                      </div>
                    )}
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-mono hover:bg-secondary transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-mono hover:bg-secondary transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </a>
                    <button
                      onClick={() => { disconnect(); setDropdownOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-mono hover:bg-secondary transition-colors w-full text-left text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setWalletModalOpen(true)}
                disabled={isConnecting}
                className="bg-accent hover:bg-accent/90 text-black font-mono text-sm"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>

          <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />

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
          </div>
        </div>
      )}
    </header>
  );
}
