export type HeroMediaType = "image" | "video";

export type HeroMediaItem = {
  id: string;
  mediaType: HeroMediaType;
  mediaUrl: string;
  posterUrl: string | null;
  altText: string | null;
  position: number;
  isActive: boolean;
};

export type HeroMediaApiItem = {
  id: string;
  media_type: HeroMediaType;
  media_url: string;
  poster_url: string | null;
  alt_text: string | null;
  position: number;
  is_active: boolean;
};

export const toHeroMediaItem = (item: HeroMediaApiItem): HeroMediaItem => ({
  id: item.id,
  mediaType: item.media_type,
  mediaUrl: item.media_url,
  posterUrl: item.poster_url,
  altText: item.alt_text,
  position: item.position,
  isActive: item.is_active,
});

