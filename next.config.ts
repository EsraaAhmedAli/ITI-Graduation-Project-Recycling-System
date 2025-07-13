import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
   images: {
    domains: ['res.cloudinary.com'], 
  },
  /* config options here */
};

export default withFlowbiteReact(nextConfig);