import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogPostJsonLd } from "./blog-post-json-ld";
import articleHtml from "./article-content";

export default function BlogPostPage() {
  return (
    <main className="min-h-screen bg-background">
      <BlogPostJsonLd
        headline="Getting Started with OpenCreditAi - Beginner's Guide"
        description="Learn how to browse, install, and use AI skills from OpenCreditAi. A step-by-step guide for first-time users."
        image="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop"
        datePublished="2026-03-09"
        url="https://opencreditai.com/blog/getting-started-with-opencreditai"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-accent font-mono text-sm uppercase tracking-wider">
            Beginner Tutorial
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-foreground font-mono">
            Getting Started with OpenCreditAi
          </h1>
          <div className="mt-6 flex items-center gap-4 text-muted-foreground">
            <span>March 9, 2026</span>
            <span>·</span>
            <span>6 min read</span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <img
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop"
            alt="OpenCreditAi - AI Skills Marketplace"
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

      {/* Back to Blog */}
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
