import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'amiipwipnznizbovwbml.supabase.co',
        port: '',
        pathname: '/**',
      },
      // If you use other Supabase buckets or domains, add them here.
    ],
  },
};

export default nextConfig;
