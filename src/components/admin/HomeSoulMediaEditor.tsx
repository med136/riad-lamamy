"use client";

import { useState, type ChangeEvent } from "react";
import { Film, ImageIcon, Loader2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_SOUL_VIDEO_BYTES,
  SOUL_POSTER_FALLBACK,
  SOUL_VIDEO_FALLBACK,
  getSoulSettings,
  type SoulSettings,
} from "@/lib/home-soul";

type Props = {
  settings: Record<string, unknown>;
  onChange: (key: keyof SoulSettings, value: string | boolean) => void;
};

export function HomeSoulMediaEditor({ settings, onChange }: Props) {
  const [videoUploading, setVideoUploading] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const current = getSoulSettings(settings);

  const uploadVideo = async (file: File) => {
    if (!["video/mp4", "video/webm"].includes(file.type)) {
      toast.error("Utilisez un fichier MP4 ou WebM.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_SOUL_VIDEO_BYTES) {
      toast.error("La vidéo doit faire au maximum 45 Mo.");
      return;
    }
    setVideoUploading(true);
    try {
      const response = await fetch("/api/admin/content/soul-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const result = await response.json();
      if (!response.ok || !result.token || !result.publicUrl || !result.bucket || !result.path) {
        throw new Error(result.error || "Impossible de préparer l’upload.");
      }
      const client = createClient();
      const { error } = await client.storage.from(result.bucket).uploadToSignedUrl(
        result.path, result.token, file,
        { contentType: file.type, cacheControl: "31536000" },
      );
      if (error) throw error;

      onChange("videoUrl", result.publicUrl);
      toast.success("Vidéo ajoutée. Cliquez sur Enregistrer pour la publier.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload vidéo impossible.");
    } finally {
      setVideoUploading(false);
    }
  };

  const uploadPoster = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      toast.error("Utilisez une image JPG, PNG, WebP ou AVIF de moins de 10 Mo.");
      return;
    }
    setPosterUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("pageKey", "home");
      data.append("sectionKey", "soul");
      const response = await fetch("/api/admin/content/media", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || !result.publicUrl) throw new Error(result.error || "Upload image impossible.");
      onChange("posterUrl", result.publicUrl);
      toast.success("Image ajoutée. Cliquez sur Enregistrer pour la publier.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload image impossible.");
    } finally {
      setPosterUploading(false);
    }
  };

  const chooseFile = (event: ChangeEvent<HTMLInputElement>, kind: "video" | "poster") => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (kind === "video") void uploadVideo(file);
    else void uploadPoster(file);
  };

  return (
    <section aria-labelledby="home-soul-media-heading" className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4 sm:p-5">
      <div>
        <h3 id="home-soul-media-heading" className="font-serif text-xl font-medium text-[#2B1C17]">
          Vidéo et médias — L’âme de Dar LaMamy
        </h3>
        <p className="mt-1 text-xs leading-5 text-[#6F625C]">
          Le fichier utilisé par défaut est celui du Login. Importer une nouvelle vidéo n’affecte pas le Login.
          Cliquez sur « Enregistrer » pour publier les changements.
        </p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-[#B28A47]/25 bg-[#10251f]">
            <video
              key={current.videoUrl}
              src={current.videoUrl}
              poster={current.posterUrl}
              autoPlay muted loop playsInline controls preload="metadata"
              className="h-full w-full object-contain"
              aria-label="Aperçu du clip Dar LaMamy"
            />
          </div>
          <p className="break-all text-[11px] text-[#6F625C]">{current.videoUrl}</p>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#0F5A46] px-4 text-xs font-semibold text-white transition hover:bg-[#0B4436]">
            {videoUploading ? <Loader2 size={16} className="animate-spin"/> : <Film size={16}/>}
            {videoUploading ? "Import vidéo en cours…" : "Ajouter / remplacer la vidéo"}
            <input type="file" className="sr-only" accept="video/mp4,video/webm" disabled={videoUploading || posterUploading}
              onChange={(event) => chooseFile(event, "video")}/>
          </label>
          <p className="text-[11px] leading-5 text-[#6F625C]">
            MP4 recommandé (H.264), ou WebM. 45 Mo maximum et sous réserve de la limite du bucket Supabase.
            Le transfert s’effectue directement vers Storage.
          </p>
          <button type="button" disabled={videoUploading} onClick={() => onChange("videoUrl", "")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5A46] disabled:opacity-50">
            <RotateCcw size={14}/> Rétablir la vidéo du Login
          </button>
        </div>
        <div className="space-y-3">
          <div className="aspect-video rounded-xl border border-[#B28A47]/25 bg-[#10251f] bg-cover bg-center"
            style={{ backgroundImage: `url("${current.posterUrl.replace(/["\\]/g, "\\$&")}")` }}
            role="img" aria-label="Aperçu de la couverture de la vidéo"
          />
          <p className="break-all text-[11px] text-[#6F625C]">{current.posterUrl}</p>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#0F5A46]/25 bg-white px-4 text-xs font-semibold text-[#0F5A46] hover:bg-[#0F5A46]/5">
            {posterUploading ? <Loader2 size={16} className="animate-spin"/> : <ImageIcon size={16}/>}
            {posterUploading ? "Upload image…" : "Ajouter / remplacer la couverture"}
            <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={videoUploading || posterUploading} onChange={(event) => chooseFile(event, "poster")}/>
          </label>
          <p className="text-[11px] text-[#6F625C]">Poster facultatif : l’image reste visible pendant le chargement ou en cas d’échec de la vidéo.</p>
          <button type="button" disabled={posterUploading} onClick={() => onChange("posterUrl", "")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5A46] disabled:opacity-50">
            <RotateCcw size={14}/> Rétablir la couverture par défaut
          </button>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-[#B28A47]/15 bg-white p-4">
        <h4 className="text-sm font-semibold text-[#2B1C17]">Bouton de découverte</h4>
        <label className="mt-3 flex items-center gap-2 text-xs font-medium text-[#5D514C]">
          <input type="checkbox" checked={current.showCta} onChange={(event)=>onChange("showCta",event.target.checked)}
            className="h-4 w-4 accent-[#0F5A46]"/>
          Afficher le bouton « Découvrir nos chambres »
        </label>
        <label className="mt-3 block space-y-1 text-xs font-semibold text-[#5D514C]">
          Lien du bouton (chemin interne)
          <input type="text" maxLength={200} value={typeof settings.ctaHref === "string" ? settings.ctaHref : "/chambres"}
            onChange={(event) => onChange("ctaHref",event.target.value)}
            placeholder="/chambres"
            className="h-11 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm font-normal text-[#2B1C17]"/>
        </label>
        <p className="mt-1 text-[11px] text-[#6F625C]">Le libellé du bouton se modifie ci-dessus dans les traductions FR / EN.</p>
      </div>
      <p className="mt-4 text-[11px] text-[#6F625C]">
        Média par défaut : <code>{SOUL_VIDEO_FALLBACK}</code> · Poster : <code>{SOUL_POSTER_FALLBACK}</code>.
        Les fichiers chargés restent conservés dans Storage et ne sont pas supprimés lors du remplacement.
      </p>
    </section>
  );
}
