import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Supabase storage signed URLs + remote avatars. Tighten to your project ref in production.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // @react-pdf/renderer pulls in some node-targeted deps; keep it out of the client bundle.
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default withNextIntl(nextConfig);
