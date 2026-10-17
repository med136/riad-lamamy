"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getSoulSettings } from "@/lib/home-soul";

export function HomeSoulSection() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(getSoulSettings());
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/public/content/sections?page=home", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const body = await response.json();
        const section = Array.isArray(body?.items)
          ? body.items.find((entry: { section_key?: string }) => entry.section_key === "soul")
          : null;
        if (!controller.signal.aborted) {
          setVideoFailed(false);
          setMuted(true);
          setSettings(getSoulSettings(section?.settings as Record<string, unknown> | undefined));
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("Chargement de L’âme de Dar LaMamy impossible", error);
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preferReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    video.muted = true;
    if (preferReducedMotion) {
      video.pause(); // onPause synchronises the controls without setting state in this effect
      return;
    }
    void video.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [settings.videoUrl]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const labels = language === "fr"
    ? { play: "Lire la vidéo", pause: "Mettre en pause", sound: "Activer le son", mute: "Couper le son" }
    : { play: "Play video", pause: "Pause video", sound: "Turn sound on", mute: "Mute video" };

  return (
    <section className="relative overflow-hidden bg-[#F7F3EB]/60 py-16 sm:py-20 lg:py-24" aria-labelledby="home-soul-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_25%,rgba(178,138,71,0.08),transparent_55%)]" />
      <div className="site-container relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:gap-14 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[640px] lg:max-w-none"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-3 -left-3 -right-3 top-3 hidden rounded-[30px] border border-[#B28A47]/30 sm:block" />
            <div className="relative aspect-[4/5] max-h-[680px] overflow-hidden rounded-[26px] border border-[#B28A47]/25 bg-[#10251f] shadow-[0_30px_80px_-42px_rgba(35,20,12,0.36)] sm:aspect-[5/6]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${settings.posterUrl.replace(/["\\]/g, "\\$&")}")` }}
                role="img"
                aria-label={t("home.soul.video_label")}
              />
              {!videoFailed ? (
                <video
                  ref={videoRef}
                  key={settings.videoUrl}
                  src={settings.videoUrl}
                  poster={settings.posterUrl}
                  autoPlay
                  muted={muted}
                  loop
                  playsInline
                  preload="metadata"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onError={() => { setVideoFailed(true); setPlaying(false); }}
                  className="absolute inset-0 h-full w-full object-cover"
                  aria-label={t("home.soul.video_label")}
                />
              ) : null}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071c17]/40 via-transparent to-[#071c17]/5" />
              {!videoFailed ? (
                <div className="absolute bottom-5 left-5 flex items-center gap-2 sm:bottom-7 sm:left-7">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    aria-label={playing ? labels.pause : labels.play}
                    title={playing ? labels.pause : labels.play}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-[#10251f]/65 text-white backdrop-blur-md transition hover:bg-[#10251f]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C982]"
                  >
                    {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-label={muted ? labels.sound : labels.mute}
                    title={muted ? labels.sound : labels.mute}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-[#10251f]/65 text-white backdrop-blur-md transition hover:bg-[#10251f]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C982]"
                  >
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="py-2 lg:py-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">{t("home.soul.kicker")}</p>
            <h2 id="home-soul-title" className="mt-5 font-serif text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#2B1C17] sm:text-5xl lg:text-[3.35rem]">
              {t("home.soul.title_before")} <span className="text-[#0F5A46]">{t("home.soul.title_accent")}</span>
            </h2>
            <div aria-hidden="true" className="mt-6 flex w-[135px] items-center gap-3">
              <span className="h-px flex-1 bg-[#B28A47]/45" />
              <span className="h-1.5 w-1.5 rotate-45 border border-[#B28A47]" />
              <span className="h-px flex-1 bg-[#B28A47]/45" />
            </div>
            <div className="mt-7 space-y-5 text-[15px] font-light leading-[1.85] text-[#6F625C] sm:text-base">
              {(["home.soul.paragraph_1", "home.soul.paragraph_2", "home.soul.paragraph_3"] as const).map((key) =>
                t(key).trim() ? <p key={key}>{t(key)}</p> : null,
              )}
            </div>
            {settings.showCta && t("home.soul.cta").trim() ? (
              <Link
                href={settings.ctaHref}
                className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#0F5A46] transition hover:text-[#0B4436] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/60"
              >
                {t("home.soul.cta")}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B28A47]/40">
                  <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
              </Link>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
