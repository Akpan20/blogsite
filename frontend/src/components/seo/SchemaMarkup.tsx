import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SchemaMarkup({ post, author }) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: post.coverImage,
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: author.name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/author/${author.username}`,
      },
      publisher: {
        '@type': 'Organization',
        name: process.env.NEXT_PUBLIC_SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}`,
      },
    };
  
    return (
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
    );
}
  
  