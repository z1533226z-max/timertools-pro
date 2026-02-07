/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
              *.googlesyndication.com
              *.googletagmanager.com
              *.google.com
              *.gstatic.com
              *.doubleclick.net
              *.googleadservices.com
              *.adtrafficquality.google;
              frame-src 'self'
              *.googlesyndication.com
              *.google.com
              *.doubleclick.net
              *.googleadservices.com;
              img-src 'self' data:
              *.googlesyndication.com
              *.google.com
              *.gstatic.com
              *.doubleclick.net
              *.googleadservices.com;
              connect-src 'self'
              *.googlesyndication.com
              *.google.com
              *.doubleclick.net
              *.googleadservices.com
              *.supabase.co;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
