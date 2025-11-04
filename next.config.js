/** @type {import('next').NextConfig} */


const nextConfig = {
  // Bundle @react-email packages for serverless functions
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
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
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: process.env.ALLOW_TS_BUILD_ERRORS === 'true',
  },
};


module.exports = nextConfig;