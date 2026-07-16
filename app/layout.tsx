import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cormorant, jost } from '@/lib/fonts';
import { rtlLocales } from '@/i18n/request';
import { FlowProvider } from '@/components/FlowProvider';
import { DesignProvider } from '@/components/DesignProvider';
import Nav from '@/components/Nav';
import FloatingGuide from '@/components/FloatingGuide';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ancestralk — No one gets forgotten',
  description:
    "Capture the voices, stories, and faces of everyone you love — so that a century from now, your great-grandchildren will know exactly who you were.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FDFAF5',
};

// Applies the saved theme before first paint to avoid a flash of the default theme.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('ank-theme');if(t&&t!=='heritage')document.body.setAttribute('data-theme',t);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        {/* Tabler icon webfont — matches the icon set used throughout the prototype. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3/dist/tabler-icons.min.css"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FlowProvider>
            <DesignProvider>
              <Nav />
              {children}
              <FloatingGuide />
            </DesignProvider>
          </FlowProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
