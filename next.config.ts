import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'i.pravatar.cc',      'img.icons8.com',],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default withFlowbiteReact(nextConfig);