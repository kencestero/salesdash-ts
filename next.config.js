/** @type {import('next').NextConfig} */


const nextConfig = {
  // External packages for serverless functions (moved from experimental in Next.js 15)
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // Ensure react-email dependencies are bundled
  transpilePackages: ['@react-email/components', '@react-email/render', '@react-email/tailwind'],

  webpack(config, { isServer }) {
    if (isServer) {
      // Properly externalize Puppeteer and Chromium for serverless
      if (typeof config.externals === 'function') {
        const origExternals = config.externals;
        config.externals = async (context, request, callback) => {
          if (request === 'puppeteer-core' || request === '@sparticuz/chromium') {
            return callback(null, 'commonjs ' + request);
          }
          return origExternals(context, request, callback);
        };
      } else if (Array.isArray(config.externals)) {
        config.externals.push('puppeteer-core', '@sparticuz/chromium');
      } else {
        config.externals = ['puppeteer-core', '@sparticuz/chromium'];
      }
    }
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.lorem.space",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Main pages
      { source: '/dashboard', destination: '/en/dashboard', permanent: false },
      { source: '/chat', destination: '/en/chat', permanent: false },
      { source: '/calendar', destination: '/en/calendar', permanent: false },
      { source: '/inventory', destination: '/en/inventory', permanent: false },
      { source: '/finance/compare', destination: '/en/finance/compare', permanent: false },
      { source: '/credit', destination: '/en/credit', permanent: false },
      { source: '/profile', destination: '/en/profile', permanent: false },
      { source: '/user-management', destination: '/en/user-management', permanent: false },
      { source: '/deliveries', destination: '/en/deliveries', permanent: false },
      { source: '/secret-code-instructions', destination: '/en/secret-code-instructions', permanent: false },
      // CRM pages
      { source: '/crm/customers', destination: '/en/crm/customers', permanent: false },
      { source: '/crm/dashboard', destination: '/en/crm/dashboard', permanent: false },
      { source: '/crm/pipeline', destination: '/en/crm/pipeline', permanent: false },
      { source: '/crm/duplicates', destination: '/en/crm/duplicates', permanent: false },
      { source: '/crm/search', destination: '/en/crm/search', permanent: false },
      { source: '/crm/bulk-actions', destination: '/en/crm/bulk-actions', permanent: false },
      { source: '/crm/quick-actions', destination: '/en/crm/quick-actions', permanent: false },
      { source: '/crm/lead-scoring', destination: '/en/crm/lead-scoring', permanent: false },
      { source: '/crm/follow-ups', destination: '/en/crm/follow-ups', permanent: false },
      { source: '/crm/sheets-sync', destination: '/en/crm/sheets-sync', permanent: false },
      { source: '/crm/pipeline-pro-demo', destination: '/en/crm/pipeline-pro-demo', permanent: false },
    ];
  },
};


module.exports = nextConfig;