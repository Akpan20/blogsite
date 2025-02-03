import Head from 'next/head';
import { useRouter } from 'next/router';

interface MetaTagsProps {
  seo: SeoData;
  websiteName?: string;
}

export default function MetaTags({ seo, websiteName = 'Your Blog Name' }: MetaTagsProps) {
  const router = useRouter();
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical" href={seo.canonical || canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={canonicalUrl} />
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
      <meta property="og:site_name" content={websiteName} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

      {/* Article Specific Tags */}
      {seo.type === 'article' && (
        <>
          {seo.publishedTime && (
            <meta property="article:published_time" content={seo.publishedTime} />
          )}
          {seo.modifiedTime && (
            <meta property="article:modified_time" content={seo.modifiedTime} />
          )}
          {seo.section && (
            <meta property="article:section" content={seo.section} />
          )}
          {seo.tags?.map((tag) => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
          {seo.authors?.map((author) => (
            <meta property="article:author" content={author} key={author} />
          ))}
        </>
      )}
    </Head>
  );
}
