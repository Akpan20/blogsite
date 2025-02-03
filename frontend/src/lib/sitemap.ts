import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { prisma } from '@/lib/prisma'

export async function generateSitemap(hostname: string) {
  // Fetch all posts and other dynamic routes
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const authors = await prisma.user.findMany({
    select: {
      username: true,
      updatedAt: true,
    },
  });

  // Create sitemap stream
  const links = [
    { url: '/', changefreq: 'daily', priority: 1 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.8 },
    ...posts.map((post) => ({
      url: `/post/${post.slug}`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: post.updatedAt.toISOString(),
    })),
    ...authors.map((author) => ({
      url: `/author/${author.username}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: author.updatedAt.toISOString(),
    })),
  ];

  const stream = new SitemapStream({ hostname });
  const data = await streamToPromise(Readable.from(links).pipe(stream));
  return data.toString();
}
