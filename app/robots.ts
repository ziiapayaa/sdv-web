import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://societeduvide.com"}/sitemap.xml`,
  };
}
