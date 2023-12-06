/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5000/api/:path*"
            : "/api/",
      },
    ];
  },
};

module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'upcdn.io',
        },
      ],
    },

    webpack: (config) => {
      config.resolve = {
        ...config.resolve,
        fallback: {
          "fs": false,
          "path": false,
          "os": false,
        }
      }
      return config
    },
  }
}
// module.exports = nextConfig
