export function generateRobotsTxt(hostname: string) {
    return `
  User-agent: *
  Allow: /
  
  # Sitemaps
  Sitemap: ${hostname}/sitemap.xml
    `.trim();
  }
  