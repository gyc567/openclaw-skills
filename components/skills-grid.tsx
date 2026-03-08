"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { SkillCard } from "./skill-card";
import { skills, searchSkills, categories } from "@/lib/skills-data";
import { getPaginatedSkills, type SkillFilter } from "@/lib/api/skills";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryNav } from "./category-nav";
import { en } from "@/lib/i18n";
import { ErrorBoundary } from "./error/error-boundary";

const t = en.skills;
const PAGE_SIZE = 20;

interface SkillsGridProps {
  initialSearchQuery?: string;
  enablePagination?: boolean;
}

export function SkillsGrid({ initialSearchQuery = "", enablePagination = true }: SkillsGridProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const allFilteredSkills = useMemo(() => {
    let result = skills;

    if (searchQuery) {
      result = searchSkills(searchQuery);
    }

    if (selectedCategory) {
      result = result.filter((skill) => skill.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const displayedSkills = useMemo(() => {
    if (!enablePagination) {
      return allFilteredSkills;
    }
    return allFilteredSkills.slice(0, page * PAGE_SIZE);
  }, [allFilteredSkills, page, enablePagination]);

  const hasMore = enablePagination && displayedSkills.length < allFilteredSkills.length;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setPage((prev) => prev + 1);
        setIsLoading(false);
      }, 150);
    }
  }, [hasMore, isLoading]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPage(1);
  }, []);

  const handleSearchFromNavbar = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  return (
    <section id="skills" className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              {t.title}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {t.subtitle(allFilteredSkills.length)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 pl-8 bg-secondary border-accent-glow text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <ErrorBoundary>
          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </ErrorBoundary>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
          {displayedSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>

        {displayedSkills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              {t.emptyState.title}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mb-3">
              {t.emptyState.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-accent-glow font-mono text-xs"
              onClick={clearFilters}
            >
              {t.emptyState.clearFilters}
            </Button>
          </motion.div>
        )}

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-8"
          >
            <Button
              variant="outline"
              size="sm"
              className="border-accent-glow font-mono text-xs"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                `${t.loadMore} (${allFilteredSkills.length - displayedSkills.length} remaining)`
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
