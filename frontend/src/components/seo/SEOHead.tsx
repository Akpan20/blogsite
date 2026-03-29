import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  postId?: number;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  postId,
}) => {
  const [seoData, setSeoData] = useState<any>(null);

  const baseUrl = window.location.origin;
  const currentUrl = url || window.location.href;
  const defaultTitle = 'Blog Site';
  const defaultDescription = 'Read the latest articles and insights';
  const defaultImage = `${baseUrl}/images/default-og.jpg`;

  // Fetch SEO data from backend if postId is provided
  useEffect(() => {
    if (postId) {
      api.get(`/posts/${postId}/meta`)
        .then((response) => setSeoData(response.data))
        .catch((error) => console.error('Failed to fetch SEO data:', error));
    }
  }, [postId]);

  // Use fetched data or props
  const finalTitle = seoData?.title || title || defaultTitle;
  const finalDescription = seoData?.description || description || defaultDescription;
  const finalImage = seoData?.og?.image || image || defaultImage;
  const finalKeywords = seoData?.keywords || keywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <meta name="author" content={author || 'Blog Site'} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={defaultTitle} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Schema.org JSON-LD */}
      {seoData?.schema && (
        <script type="application/ld+json">
          {JSON.stringify(seoData.schema)}
        </script>
      )}

      {/* Robots */}
      {seoData?.robots && <meta name="robots" content={seoData.robots} />}
    </Helmet>
  );
};

// Preset for blog post pages
export const PostSEO: React.FC<{
  postId: number;
  title: string;
  description?: string;
  image?: string;
  author: string;
  publishedTime: string;
  modifiedTime: string;
}> = (props) => (
  <SEOHead
    {...props}
    type="article"
  />
);

// Preset for homepage
export const HomeSEO: React.FC = () => (
  <SEOHead
    title="Home - Your Blog Name"
    description="Discover insightful articles, tutorials, and stories about technology, design, and more."
    type="website"
  />
);

// Preset for search results
export const SearchSEO: React.FC<{ query: string }> = ({ query }) => (
  <SEOHead
    title={`Search Results for "${query}" - Your Blog`}
    description={`Search results for ${query} on our blog`}
    type="website"
  />
);