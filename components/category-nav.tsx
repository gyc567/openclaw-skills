"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { categories } from "@/lib/skills-data";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { en } from "@/lib/i18n";

const t = en.categories;

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  }, [checkScroll]);

  return (
    <section id="categories" className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-accent">{t.title}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            {t.title}
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            {t.subtitle(categories.length)}
          </p>
        </div>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded bg-background border border-accent-glow flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded bg-background border border-accent-glow flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded text-xs font-mono transition-colors ${
                selectedCategory === null
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-accent border border-accent-glow"
              }`}
            >
              {t.all}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-accent border border-accent-glow"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <span className="opacity-50">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
