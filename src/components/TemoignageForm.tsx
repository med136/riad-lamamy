"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type FormState = {
  name: string;
  country: string;
  rating: number;
  content: string;
  consent: boolean;
  company: string;
};

export default function TemoignageForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    country: "",
    rating: 5,
    content: "",
    consent: false,
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error as string | undefined;
        const friendly = (() => {
          if (code === "rate_limit") return "Trop de demandes. Reessayez plus tard.";
          if (code === "invalid_name") return "Nom invalide.";
          if (code === "invalid_content") return "Message trop court.";
          if (code === "invalid_rating") return "Note invalide.";
          if (code === "invalid_consent") return "Merci d'accepter la politique de confidentialite.";
          return "Erreur lors de l'envoi.";
        })();
        throw new Error(friendly);
      }

      setSuccess(true);
      setForm({ name: "", country: "", rating: 5, content: "", consent: false, company: "" });
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto lux-panel rounded-3xl border border-amber-200/40 p-8">
      <div className="lux-kicker text-amber-700/80 mb-3">TEMOIGNAGE</div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
        Laisser un temoignage
      </h1>
      <p className="text-gray-600 mb-8">
        Partagez votre experience pour aider les futurs voyageurs.
      </p>

      {success && (
        <div className="mb-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
          Merci. Votre avis a ete envoye et sera publie apres validation.
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            className="w-full border border-amber-200/60 rounded-2xl p-3 bg-white/80"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pays</label>
          <input
            className="w-full border border-amber-200/60 rounded-2xl p-3 bg-white/80"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setForm({ ...form, rating: n })}
                className={`p-2 rounded-full ${
                  form.rating >= n ? "text-amber-700" : "text-gray-400"
                }`}
              >
                <Star size={20} className={form.rating >= n ? "fill-amber-500" : ""} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Votre temoignage</label>
          <textarea
            className="w-full border border-amber-200/60 rounded-2xl p-3 bg-white/80"
            rows={5}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            minLength={20}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-amber-600"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            required
          />
          <div className="text-sm text-gray-600">
            J'accepte que mon avis soit traite et publie apres moderation, en accord
            avec la{" "}
            <a
              href="/politique-confidentialite"
              className="text-amber-700 hover:underline"
            >
              politique de confidentialite
            </a>
            .
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-amber-700 text-white rounded-2xl hover:bg-amber-800 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
}
