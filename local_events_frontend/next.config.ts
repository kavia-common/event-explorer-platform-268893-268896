import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We use dynamic routes like /events/[id] that are driven by backend data.
  // Static export requires generateStaticParams() for all dynamic routes, which
  // isn't suitable for this app's runtime data model.
};

export default nextConfig;
