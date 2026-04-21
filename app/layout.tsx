import type { Metadata } from 'next';
import './globals.css';
import { getMeta } from '@/lib/content';
import { ThemeProvider } from '@/app/components/ui/ThemeProvider';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getMeta();
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: meta.ogImageUrl ? [{ url: meta.ogImageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
      creator: meta.twitterHandle,
    },
    icons: {
      icon: meta.faviconUrl || '/favicon.ico',
    },
  };
}

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('lc-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg-base text-text-primary antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
