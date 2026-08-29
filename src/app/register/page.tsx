"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "@/lib/supabase/client";

type PublicSettings = Record<string, unknown>;

export default function RegisterPage() {
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("DarLaMamy");
  const [brandTagline, setBrandTagline] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/public/settings", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = (await res.json()) as PublicSettings;

        const nextBrandName =
          data.logo_text ||
          data.logoText ||
          data.site_title ||
          data.siteName ||
          data.site_name ||
          null;

        if (
          typeof nextBrandName === "string" &&
          nextBrandName.trim()
        ) {
          setBrandName(nextBrandName.trim());
        }

        const nextTagline =
          data.site_tagline ||
          data.siteTagline ||
          data.tagline ||
          data.site_tag_line ||
          null;

        if (
          typeof nextTagline === "string" &&
          nextTagline.trim()
        ) {
          setBrandTagline(nextTagline.trim());
        }

        const url =
          data.logo_preview_url ||
          data.site_logo ||
          data.logo ||
          data.logoPreviewUrl ||
          data.admin_logo_url ||
          null;

        if (typeof url === "string" && url.trim()) {
          setLogoUrl(url.trim());
        }
      } catch {
        // ignore
      }
    };

    fetchSettings();
  }, []);

  const logoSrc = logoUrl || "/logo-mark-green.png";

  const subtitle = useMemo(() => {
    if (brandTagline) return brandTagline;

    return "Créez votre compte administrateur avec votre code d’invitation.";
  }, [brandTagline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (
      !inviteCode.trim() ||
      !trimmedEmail ||
      !password ||
      !passwordConfirm
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          email: trimmedEmail,
          password,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          (typeof json?.error === "string" && json.error) ||
          "Inscription impossible.";

        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Compte créé. Connexion en cours…");

      const { data, error } = await signIn(
        trimmedEmail,
        password
      );

      if (error || !data?.session?.user) {
        router.push(
          `/admin/login?email=${encodeURIComponent(trimmedEmail)}`
        );
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'inscription.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f7f3eb] lg:h-screen lg:grid-cols-[minmax(320px,39%)_1fr]">
      {/* =====================================================
          PARTIE GAUCHE — VIDÉO
      ====================================================== */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#10251f] lg:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/riad-login-courtyard.png"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source
            src="/video/darlamamy.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-[#10251f]/15"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071c17]/35 via-transparent to-[#071c17]/10"
          aria-hidden="true"
        />

        {/* Retour au site */}
        <Link
          href="/"
          className="absolute left-8 top-8 z-10 inline-flex items-center gap-2 rounded-[13px] border border-white/20 bg-[#17231f]/45 px-4 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-[#17231f]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd86] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <ArrowLeft
            size={17}
            className="text-[#dec48f]"
            aria-hidden="true"
          />
          Retour au site
        </Link>

        {/* Accès sécurisé */}
        <div className="absolute bottom-8 right-8 z-10 max-w-[270px] rounded-[14px] border border-white/15 bg-[#0b3f34]/45 p-4 text-white shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-[#d8bd86]"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold">
                Inscription sécurisée
              </p>

              <p className="mt-1 text-xs leading-relaxed text-white/75">
                Création de compte réservée
                <br />
                aux personnes invitées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PARTIE DROITE
      ====================================================== */}
      <section className="relative flex min-h-screen justify-center overflow-x-hidden overflow-y-auto px-5 py-7 sm:px-10 lg:h-screen lg:px-14 lg:py-6 xl:px-16">
        {/* Zellige */}
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/patterns/zellige-darlamamy.svg')] bg-repeat opacity-[0.04] [background-size:220px_220px] [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_78%)] sm:opacity-[0.05] lg:opacity-[0.06]"
          aria-hidden="true"
        />

        {/* Retour mobile */}
        <div className="absolute left-5 top-5 z-10 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c7a8] bg-[#fbf8f2]/90 px-3 py-2 text-xs font-semibold text-[#075847] shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075847]/40"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Retour au site
          </Link>
        </div>

        {/* Connexion desktop */}
        <div className="absolute right-5 top-6 z-10 hidden items-center gap-1.5 text-xs text-[#5f5c56] sm:flex lg:right-8 xl:right-10">
          <span>Déjà un compte ?</span>

          <Link
            href="/admin/login"
            className="font-semibold text-[#075847] underline decoration-[#075847]/35 underline-offset-4 transition hover:decoration-[#075847] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075847]/35"
          >
            Connexion
          </Link>
        </div>

        {/* =================================================
            CONTENU
        ================================================== */}
        <div className="relative my-auto w-full max-w-[520px] py-12 sm:py-10 lg:py-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28">
              <Image
                src="/logo-mark-green.png"
                alt={brandName}
                fill
                sizes="112px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <p className="mt-1 text-center font-serif text-[1.55rem] font-semibold tracking-[0.055em] text-[#111111] sm:text-[1.7rem]">
            {brandName}
          </p>

          <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-[0.36em] text-[#9b6a20]">
            FÈS • MAROC
          </p>

          {/* Header */}
          <header className="mt-5 text-center">
            <h1 className="font-serif text-[2rem] font-medium leading-tight tracking-[-0.025em] text-[#20211e] sm:text-[2.35rem] lg:text-[2.5rem]">
              Créer un compte
            </h1>

            <div
              className="my-3 flex items-center justify-center gap-2 text-[#b28a47]"
              aria-hidden="true"
            >
              <span className="h-px w-8 bg-[#c9a865]/60" />

              <span className="block h-2 w-2 rotate-45 border border-[#b28a47]/80" />

              <span className="h-px w-8 bg-[#c9a865]/60" />
            </div>

            
          </header>

          {/* Erreur */}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              {error}
            </div>
          )}

          {/* =================================================
              FORMULAIRE
          ================================================== */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            {/* Code invitation */}
            <div>
              <label
                htmlFor="inviteCode"
                className="mb-2 block text-sm font-semibold text-[#33352f]"
              >
                Code d&apos;invitation
              </label>

              <div className="relative">
                <KeyRound
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0b5a47]"
                  aria-hidden="true"
                />

                <input
                  id="inviteCode"
                  type={showInviteCode ? "text" : "password"}
                  autoComplete="one-time-code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="••••••••"
                  className="h-[58px] w-full rounded-xl border border-[#d8c7a8] bg-[#fbf8f2] pl-12 pr-12 text-[15px] text-[#202020] shadow-[0_5px_18px_-16px_rgba(70,50,25,0.5)] outline-none transition duration-300 placeholder:text-[#99958d] hover:border-[#c8b48f] focus:border-[#0b5a47] focus:ring-4 focus:ring-[#0b5a47]/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowInviteCode((value) => !value)
                  }
                  aria-label={
                    showInviteCode
                      ? "Masquer le code d'invitation"
                      : "Afficher le code d'invitation"
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#686b65] transition hover:bg-[#085040]/8 hover:text-[#085040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085040]/40"
                >
                  {showInviteCode ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#33352f]"
              >
                Adresse email
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0b5a47]"
                  aria-hidden="true"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemple.com"
                  className="h-[58px] w-full rounded-xl border border-[#d8c7a8] bg-[#fbf8f2] pl-12 pr-4 text-[15px] text-[#202020] shadow-[0_5px_18px_-16px_rgba(70,50,25,0.5)] outline-none transition duration-300 placeholder:text-[#99958d] hover:border-[#c8b48f] focus:border-[#0b5a47] focus:ring-4 focus:ring-[#0b5a47]/10"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#33352f]"
              >
                Mot de passe
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0b5a47]"
                  aria-hidden="true"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  className="h-[58px] w-full rounded-xl border border-[#d8c7a8] bg-[#fbf8f2] pl-12 pr-12 text-[15px] text-[#202020] shadow-[0_5px_18px_-16px_rgba(70,50,25,0.5)] outline-none transition duration-300 placeholder:text-[#99958d] hover:border-[#c8b48f] focus:border-[#0b5a47] focus:ring-4 focus:ring-[#0b5a47]/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#686b65] transition hover:bg-[#085040]/8 hover:text-[#085040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085040]/40"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="mb-2 block text-sm font-semibold text-[#33352f]"
              >
                Confirmer le mot de passe
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0b5a47]"
                  aria-hidden="true"
                />

                <input
                  id="passwordConfirm"
                  type={
                    showPasswordConfirm
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) =>
                    setPasswordConfirm(e.target.value)
                  }
                  placeholder="Répétez le mot de passe"
                  className="h-[58px] w-full rounded-xl border border-[#d8c7a8] bg-[#fbf8f2] pl-12 pr-12 text-[15px] text-[#202020] shadow-[0_5px_18px_-16px_rgba(70,50,25,0.5)] outline-none transition duration-300 placeholder:text-[#99958d] hover:border-[#c8b48f] focus:border-[#0b5a47] focus:ring-4 focus:ring-[#0b5a47]/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirm(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPasswordConfirm
                      ? "Masquer la confirmation"
                      : "Afficher la confirmation"
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#686b65] transition hover:bg-[#085040]/8 hover:text-[#085040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085040]/40"
                >
                  {showPasswordConfirm ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="premium-login-button group mt-2 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#075847] px-6 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075847] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f3eb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {isSubmitting
                  ? "Création…"
                  : "Créer le compte"}
              </span>

              {!isSubmitting && (
                <ArrowRight
                  size={19}
                  className="text-[#dec48f] transition-transform duration-300 group-hover:translate-x-1.5"
                  aria-hidden="true"
                />
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div
            className="mt-5 flex items-center justify-center gap-2 text-[#b28a47]"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-[#c9a865]/35" />

            <span className="block h-1.5 w-1.5 rotate-45 border border-[#b28a47]/65" />

            <span className="h-px flex-1 bg-[#c9a865]/35" />
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#8b877e]">
            L&apos;inscription est réservée au personnel disposant
            d&apos;un code d&apos;invitation.
          </p>

          {/* Connexion mobile */}
          <p className="mt-5 text-center text-xs text-[#5f5c56] sm:hidden">
            Déjà un compte ?{" "}
            <Link
              href="/admin/login"
              className="font-semibold text-[#075847] underline decoration-[#075847]/35 underline-offset-4"
            >
              Connexion
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}