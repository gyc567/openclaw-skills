import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogPostJsonLd } from "./blog-post-json-ld";
import articleHtml from "./article-content";

export default function ClaudeCodeUnpackedPage() {
  return (
    <main className="min-h-screen bg-background">
      <BlogPostJsonLd
        headline="Claude Code Unpacked for AI Skill Marketplaces"
        description="A practical exploration of Claude Code's agent loop and tool orchestration, translated into actionable guidance for building AI skill marketplaces like OpenCreditAi. Includes geo-optimized content strategy and infrastructure recommendations."
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop"
        datePublished="2026-04-01"
        url="https://opencreditai.com/blog/claude-code-unpacked-for-ai-skill-marketplaces"
      />
      <Navbar />

      <section className="pt-24 pb-16 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-accent font-mono text-sm uppercase tracking-wider">
            AI Engineering
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-foreground font-mono">
            Claude Code Unpacked for AI Skill Marketplaces
          </h1>
          <div className="mt-6 flex items-center gap-4 text-muted-foreground">
            <span>April 1, 2026</span>
            <span>·</span>
            <span>12 min read</span>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <img
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop"
            alt="Claude Code Agent Loop - AI Skill Marketplace Architecture"
            className="w-full aspect-video object-cover rounded-lg"
          />
        </div>
      </section>

      <section className="py-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl px-6 py-8"
            style={{
              background: "#faf9f5",
              color: "#3f3f3f",
            }}
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />
        </div>
      </section>

      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-accent hover:underline"
          >
            ← Back to all articles
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
