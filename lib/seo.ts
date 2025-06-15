// lib/seo.ts
export const siteConfig = {
  name: "Arjun Dubey",
  description: "Arjun Dubey",
  url: "https://www.arjundubey.com/",
  ogImage: "https://www.arjundubey.com/images/arjun.png",
  creator: "@yourusername",
  keywords: ["arjun", "dubey", "arjun dubey"],
}

export interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  keywords?: string[]
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

export const generateSEOConfig = (props: SEOProps) => {
  const {
    title = siteConfig.name,
    description = siteConfig.description,
    image = siteConfig.ogImage,
    url = siteConfig.url,
    keywords = siteConfig.keywords,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
  } = props

  return {
    title: title === siteConfig.name ? title : `${title} | ${siteConfig.name}`,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      type,
      url,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: siteConfig.name,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.creator,
    },
    alternates: {
      canonical: url,
    },
  }
}