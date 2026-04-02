interface BlogPostJsonLdProps {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  author?: {
    "@type": string;
    name: string;
    url: string;
  };
}

export function BlogPostJsonLd({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  url,
  author,
}: BlogPostJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: author || {
      "@type": "Organization",
      name: "OpenCreditAi Team",
      url: "https://opencreditai.com",
    },
    publisher: {
      "@type": "Organization",
      name: "OpenCreditAi",
      url: "https://opencreditai.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
