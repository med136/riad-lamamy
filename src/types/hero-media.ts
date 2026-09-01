export type HeroMediaType = "image" | "video";

export type HeroMediaItem = {
  id: string;
  mediaType: HeroMediaType;
  mediaUrl: string;
  posterUrl: string | null;
  altText: string | null;
  position: number;
  isActive: boolean;
  filename: string | null;
  mimeType: string | null;
  size: number | null;
};

export type HeroMediaApiItem = {
  id: string;
  media_type: HeroMediaType;
  media_url: string;
  poster_url: string | null;
  alt_text: string | null;
  position: number;
  is_active: boolean;
  filename?: string | null;
  mime_type?: string | null;
  size?: number | null;
};

export const toHeroMediaItem = (item: HeroMediaApiItem): HeroMediaItem => ({
  id: item.id,
  mediaType: item.media_type,
  mediaUrl: item.media_url,
  posterUrl: item.poster_url,
  altText: item.alt_text,
  position: item.position,
  isActive: item.is_active,
  filename: item.filename ?? null,
  mimeType: item.mime_type ?? null,
  size: item.size ?? null,
});
