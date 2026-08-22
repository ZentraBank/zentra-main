import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Permit development assets when the app is opened from another device
  // or through this computer's LAN address.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.188",
  ],


  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
  
};

export default nextConfig;
