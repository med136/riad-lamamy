import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://riad-al-andalus.com";
  const lastModified = new Date();

  const routes = [
    "",
    "/chambres",
    "/services",
    "/galerie",
    "/reservations",
    "/a-propos",
    "/contact",
    "/temoignage",
    "/mentions-legales",
    "/politique-confidentialite",
    "/cgu",
    "/plan-site",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));
}
