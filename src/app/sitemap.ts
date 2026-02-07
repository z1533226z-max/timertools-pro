import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: baseUrl, changeFrequency: 'hourly' as const, priority: 1.0 },
    { url: `${baseUrl}/stocks`, changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${baseUrl}/stocks/us`, changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${baseUrl}/crypto`, changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${baseUrl}/gold`, changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${baseUrl}/silver`, changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${baseUrl}/bonds`, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/picks`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/daily`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/daily/${today}`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  return staticPages.map((page) => ({
    ...page,
    lastModified: new Date(),
  }));
}
