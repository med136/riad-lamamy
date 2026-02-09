"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  Phone,
  User,
  MessageSquare,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  newsletter: boolean;
  consent: boolean;
  company: string;
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    newsletter: true,
    consent: false,
    company: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subjects = [
    { value: "general", label: "Demande generale" },
    { value: "reservation", label: "Reservation" },
    { value: "service", label: "Service particulier" },
    { value: "group", label: "Groupe / Evenement" },
    { value: "other", label: "Autre" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        newsletter: formData.newsletter,
        consent: formData.consent,
        company: formData.company,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error as string | undefined;
        const friendlyMessage = (() => {
          if (code === "rate_limit") return "Trop de demandes. Reessayez plus tard.";
          if (code === "invalid_name") return "Nom invalide.";
          if (code === "invalid_email") return "Email invalide.";
          if (code === "invalid_message") return "Message trop court.";
          if (code === "invalid_consent") return "Merci d'accepter la politique de confidentialite.";
          return "Erreur lors de l'envoi.";
        })();
        setErrorMessage(friendlyMessage);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      setErrorMessage("Erreur lors de l'envoi");
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="lux-panel rounded-3xl border border-amber-200/40 overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 p-8 text-white">
        <div className="lux-kicker text-amber-100/90 mb-3">MESSAGE</div>
        <h3 className="text-2xl font-serif font-bold mb-2">
          Envoyez-nous un message
        </h3>
        <p className="text-amber-100/90">
          Notre equipe vous repond sous 24 heures
        </p>
      </div>

      <div className="p-8">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <CheckCircle size={40} className="text-emerald-700" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Message envoye avec succes !
            </h4>
            <p className="text-gray-600 mb-6">
              Nous vous repondrons dans les plus brefs delais.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-amber-700 hover:text-amber-800 font-semibold"
            >
              Envoyer un nouveau message
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sujet de votre message
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {subjects.map((subject) => (
                  <label
                    key={subject.value}
                    className={`cursor-pointer p-3 rounded-2xl text-center transition-all border ${
                      formData.subject === subject.value
                        ? "bg-amber-700 text-white border-amber-700 shadow-lg"
                        : "bg-white/80 text-gray-700 border-amber-100/70 hover:border-amber-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="subject"
                      value={subject.value}
                      checked={formData.subject === subject.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{subject.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Prenom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Votre prenom"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Telephone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+212 6 XX XX XX XX"
                />
              </div>
            </div>

            {formData.subject === "reservation" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-6 p-6 lux-panel rounded-2xl border border-amber-200/40"
              >
                <h4 className="font-bold text-gray-900">Informations de sejour</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Arrivee
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Depart
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users size={16} className="inline mr-2" />
                      Voyageurs
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "personne" : "personnes"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare size={16} className="inline mr-2" />
                Votre message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={10}
                rows={6}
                className="w-full p-3 border border-amber-200/60 bg-white/80 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Decrivez-nous votre demande..."
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-amber-600"
              />
              <div>
                <div className="font-medium text-gray-900">
                  Recevoir notre newsletter
                </div>
                <p className="text-sm text-gray-600">
                  Offres exclusives, actualites du riad et conseils de voyage.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 accent-amber-600"
              />
              <div className="text-sm text-gray-600">
                J'accepte que mes donnees soient utilisees pour repondre a ma demande,
                conformement a la{" "}
                <a
                  href="/politique-confidentialite"
                  className="text-amber-700 hover:underline"
                >
                  politique de confidentialite
                </a>
                .
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 rounded-2xl hover:from-amber-800 hover:to-amber-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span className="font-bold text-lg">Envoyer le message</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Vos informations sont confidentielles et ne seront jamais partagees.
              <br />
              Consultez notre{" "}
              <a
                href="/politique-confidentialite"
                className="text-amber-700 hover:underline"
              >
                politique de confidentialite
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
