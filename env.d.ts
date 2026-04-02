/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module "./blog-post-json-ld" {
  import type { ComponentType } from "react";
  const BlogPostJsonLd: ComponentType<{
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    url: string;
  }>;
  export { BlogPostJsonLd };
}
