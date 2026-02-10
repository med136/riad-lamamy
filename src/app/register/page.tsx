"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Mail } from "lucide-react";
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

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("Riad Lamamy");
  const [brandTagline, setBrandTagline] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/public/settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PublicSettings;

        const nextBrandName =
          data.logo_text ||
          data.logoText ||
          data.site_title ||
          data.siteName ||
          data.site_name ||
          null;
        if (typeof nextBrandName === "string" && nextBrandName.trim()) {
          setBrandName(nextBrandName.trim());
        }

        const nextTagline =
          data.site_tagline ||
          data.siteTagline ||
          data.tagline ||
          data.site_tag_line ||
          null;
        if (typeof nextTagline === "string" && nextTagline.trim()) {
          setBrandTagline(nextTagline.trim());
        }

        const url =
          data.logo_preview_url ||
          data.site_logo ||
          data.logo ||
          data.logoPreviewUrl ||
          data.admin_logo_url ||
          null;
        if (typeof url === "string" && url.trim()) setLogoUrl(url.trim());
      } catch {
        // ignore
      }
    };

    fetchSettings();
  }, []);

  const logoSrc = logoUrl || "/logo.svg";
  const isDefaultLogo = logoSrc === "/logo.svg";

  const subtitle = useMemo(() => {
    if (brandTagline) return brandTagline;
    return "Création de compte sur invitation.";
  }, [brandTagline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!inviteCode.trim() || !trimmedEmail || !password || !passwordConfirm) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
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
        headers: { "Content-Type": "application/json" },
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
      const { data, error } = await signIn(trimmedEmail, password);
      if (error || !data?.session?.user) {
        router.push(`/admin/login?email=${encodeURIComponent(trimmedEmail)}`);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      const message = err?.message || "Erreur lors de l'inscription.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="lux-panel rounded-3xl border border-amber-200/50 p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <Link
            href="/admin/login"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-700 hover:text-amber-900"
          >
            Connexion
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800/80 hover:text-amber-900"
          >
            Retour au site
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-amber-200/60 bg-white/70 shadow-sm">
            <Image
              src={logoSrc}
              alt={brandName}
              fill
              sizes="48px"
              className={`object-contain p-2 ${isDefaultLogo ? "brightness-0" : ""}`}
            />
          </div>

          <div className="leading-tight">
            <p className="font-serif text-xl font-semibold tracking-tight text-gray-900">
              {brandName}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700/80">
              Administration
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900">
            Inscription
          </h1>
          <p className="text-sm leading-relaxed text-gray-600">{subtitle}</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200/60 bg-rose-50/70 p-4 text-sm text-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="inviteCode"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Code d'invitation
            </label>
            <div className="relative">
              <KeyRound
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="inviteCode"
                type="password"
                autoComplete="one-time-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-amber-200/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/60"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Adresse email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                className="w-full rounded-2xl border border-amber-200/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/60"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Mot de passe
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                className="w-full rounded-2xl border border-amber-200/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/60"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full rounded-2xl border border-amber-200/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/60"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="btn-primary w-full py-3.5 text-base shadow-2xl hover:shadow-[0_25px_70px_-40px_rgba(120,87,71,0.65)] disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Création…" : "Créer le compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          {"L'inscription est réservée au personnel, via un code d'invitation."}
        </p>
      </div>
    </div>
  );
}

