import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/courses', '/services/', '/policy', '/student/blog'],
        disallow: [
          '/admin',
          '/api/',
          '/student/courses/',
          '/student/library',
          '/student/profile',
          '/student/tutor',
          '/student/tools',
          '/student/giveaways',
          '/student/leaderboards',
          '/student/indicators',
          '/student/calendar',
          '/dashboard',
          '/login',
        ],
      },
    ],
    sitemap: 'https://themarketrevelation.com/sitemap.xml',
  };
}
