export default function sitemapIndex() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://callmibro.com'
  
  return [
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
    },
  ]
} 