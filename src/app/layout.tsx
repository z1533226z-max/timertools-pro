import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SITE_NAME_KR, SITE_URL, SITE_DESCRIPTION, ADSENSE_CLIENT_ID } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME_KR} - 실시간 금융 시세 & AI 종목 추천`,
    template: `%s | ${SITE_NAME_KR}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '금 시세', '은 시세', '주식', '코스피', '코스닥', '비트코인',
    '코인 시세', '채권', '미국 주식', 'AI 종목 추천', '거래량 순위',
    '오늘의 시황', '금값', '금 1돈 가격', '실시간 시세',
  ],
  authors: [{ name: 'GON Finance' }],
  creator: 'GON Finance',
  publisher: 'GON AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: `${SITE_NAME_KR} - 실시간 금융 시세 & AI 종목 추천`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME_KR,
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME_KR} - 실시간 금융 시세`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'WUrfnWHUFd9icr_v6BWbC5IWS2mG_Dca7LBuL9Plx-I',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME_KR,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
    description: '실시간 금융 시세 및 AI 종목 추천 무료 서비스',
  },
  provider: {
    '@type': 'Organization',
    name: 'GON AI',
    url: SITE_URL,
  },
  featureList: [
    '실시간 거래량 Top 10',
    '한국/미국 주식 시세',
    '금/은 시세',
    '코인 시세',
    '채권 수익률',
    'AI 종목 추천',
    '일일 시황 리포트',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
