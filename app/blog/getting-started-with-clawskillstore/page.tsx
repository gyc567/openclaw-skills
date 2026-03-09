import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Getting Started with ClawSkillStore - Beginner's Guide",
  description:
    "Learn how to browse, install, and use AI skills from ClawSkillStore. A step-by-step guide for first-time users.",
};

export default function BlogPostPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-accent font-mono text-sm uppercase tracking-wider">
            Beginner Tutorial
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-foreground font-mono">
            Getting Started with ClawSkillStore
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
            alt="ClawSkillStore - AI Skills Marketplace"
            className="w-full aspect-video object-cover rounded-lg"
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-3xl mx-auto prose prose-invert prose-accent">
          <p>
            So you want to give your AI assistant some new tricks? You've come to the
            right place. This guide walks you through everything you need to know to
            get up and running with ClawSkillStore in under 10 minutes.
          </p>

          <h2>What Exactly is ClawSkillStore?</h2>
          <p>
            Think of ClawSkillStore as an app store—but instead of phone apps, these
            are skills for AI agents. Need your AI to analyze stock market data? There's
            a skill for that. Want automated content translation? We've got you covered.
            Whether you're building a trading bot, a customer support assistant, or a
            research tool, skills let you add specialized capabilities without building
            everything from scratch.
          </p>

          <h2>Step 1: Explore the Marketplace</h2>
          <p>
            Head over to <a href="/">ClawSkillStore</a> and take a look around. The
            homepage shows featured skills across different categories:
          </p>
          <ul>
            <li>
              <strong>Finance & Trading</strong> — Stock analysis, forex signals, crypto
              predictions
            </li>
            <li>
              <strong>Data & Analytics</strong> — Data processing, visualization, reports
            </li>
            <li>
              <strong>Marketing & Content</strong> — Copywriting, SEO, social media
            </li>
            <li>
              <strong>Development</strong> — Code assistance, debugging, API integration
            </li>
          </ul>
          <p>
            Not sure what you need? Use the search bar to type in whatever task you're
            trying to accomplish. Our search matches skill names, descriptions, and tags.
          </p>

          <h2>Step 2: Pick Your First Skill</h2>
          <p>
            Here's my recommendation for beginners: start with something free. This lets
            you understand how skills work without spending money. Look for the "Free"
            badge on skill cards—that means no cost to install.
          </p>
          <p>
            When you click on a skill, you'll see:
          </p>
          <ul>
            <li>
              <strong>Description</strong> — What the skill actually does
            </li>
            <li>
              <strong>Price</strong> — Free or paid (if paid, you'll need to set up
              payment)
            </li>
            <li>
              <strong>Install Command</strong> — The npm command to add it to your
              project
            </li>
            <li>
              <strong>Author</strong> — Who created it (some are verified creators)
            </li>
          </ul>

          <h2>Step 3: Install It (It's Just npm)</h2>
          <p>
            This is the easiest part. Every skill comes with an installation command that
            looks like this:
          </p>
          <pre>
            <code>npm install @clawskill/[skill-name]</code>
          </pre>
          <p>Or if you prefer using npx:</p>
          <pre>
            <code>npx clawskill install [skill-name]</code>
          </pre>
          <p>
            Just copy the command from the skill page, paste it into your terminal, and
            hit enter. That's it—the skill is now part of your project.
          </p>

          <h2>Step 4: Configure It</h2>
          <p>
            Most skills work right out of the box, but some need a bit of setup. Common
            requirements include:
          </p>
          <ol>
            <li>
              <strong>API Keys</strong> — Some skills connect to external services like
              weather APIs or financial data providers. You'll need to sign up for those
              services and paste your API key.
            </li>
            <li>
              <strong>Environment Variables</strong> — Settings like API endpoints or
              configuration options usually go in your .env file.
            </li>
            <li>
              <strong>Permissions</strong> — If the skill accesses files or makes
              network requests, you may need to explicitly allow those capabilities.
            </li>
          </ol>
          <p>
            Don't worry—each skill's documentation explains exactly what you need. Look
            for the README file in the skill's package.
          </p>

          <h2>Quick Tips for New Users</h2>
          <ul>
            <li>
              <strong>One at a time</strong> — Install skills one by one. If something
              breaks, you'll know exactly which skill caused it.
            </li>
            <li>
              <strong>Check the version</strong> — Skills update frequently. Make sure
              you're using a version compatible with your setup.
            </li>
            <li>
              <strong>Read reviews</strong> — Other users often leave helpful feedback
              about their experience.
            </li>
            <li>
              <strong>Start simple</strong> — Don't try to build a complex multi-skill
              system on day one.
            </li>
          </ul>

          <h2>What's Next?</h2>
          <p>
            Once you've installed your first skill, here are some good next steps:
          </p>
          <ul>
            <li>
              <a href="/blog/create-first-skill-listing">
                <strong>Sell Your Own Skills</strong>
              </a>{' '}
              — Got a skill idea? Learn how to list it on the marketplace
            </li>
            <li>
              <a href="/blog/pricing-your-skill">
                <strong>Pricing Your Skill</strong>
              </a>{' '}
              — Tips for setting the right price if you sell skills
            </li>
            <li>
              <a href="/blog/navigating-the-marketplace">
                <strong>Finding the Right Skills</strong>
              </a>{' '}
              — Advanced search and filtering tips
            </li>
          </ul>

          <h2>Need Help?</h2>
          <p>
            Stuck on something? Our documentation has answers to common questions. You can
            also reach out to our community—we're a friendly bunch and happy to help
            newcomers.
          </p>
          <p>
            Now go ahead—head back to the{' '}
            <a href="/">marketplace</a> and find a skill that solves a problem you have.
            Happy building!
          </p>

          <hr className="my-8 border-border" />

          <p className="text-muted-foreground">
            Questions? Found this helpful? Let us know. We're always improving based on
            user feedback.
          </p>
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
