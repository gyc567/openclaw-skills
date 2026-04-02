import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Create and Sell Your First AI Skill on OpenCreditAi",
  description:
    "Step-by-step guide to creating your first AI skill listing on OpenCreditAi and earning USDC. Learn how to package, price, and sell AI capabilities to thousands of buyers worldwide.",
  alternates: {
    canonical: "https://opencreditai.com/blog/create-first-skill-listing",
  },
  openGraph: {
    title: "How to Create and Sell Your First AI Skill on OpenCreditAi",
    description:
      "Step-by-step guide to creating your first AI skill listing on OpenCreditAi and earning USDC. Learn how to package, price, and sell AI capabilities to thousands of buyers worldwide.",
    type: "article",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Create and sell AI skills on OpenCreditAi",
      },
    ],
  },
};

export default function CreateFirstSkillListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
