// components/BlogSEO.tsx
import { ArticleJsonLd, NextSeo } from 'next-seo'

interface BlogSEOProps {
  title: string
  description: string
  url: string
  author: string
  publishedDate: string
  modifiedDate?: string
  image: string
  tags?: string[]
}

export default function BlogSEO({
  title,
  description,
  url,
  author,
  publishedDate,
  modifiedDate,
  image,
  tags = [],
}: BlogSEOProps) {
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: publishedDate,
            modifiedTime: modifiedDate,
            authors: [author],
            tags: tags,
          },
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
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: tags.join(', '),
          },
        ]}
      />
      <ArticleJsonLd
        url={url}
        title={title}
        images={[image]}
        datePublished={publishedDate}
        dateModified={modifiedDate || publishedDate}
        authorName={[author]}
        publisherName="Your Site Name"
        publisherLogo="https://yoursite.com/logo.png"
        description={description}
        isAccessibleForFree={true}
      />
    </>
  )
}