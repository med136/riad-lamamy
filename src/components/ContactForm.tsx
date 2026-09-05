"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
  Users,
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

const subjects = [
  { value: "general", label: "Question générale" },
  { value: "reservation", label: "Réservation" },
  { value: "service", label: "Service" },
  { value: "group", label: "Groupe / événement" },
  { value: "other", label: "Autre" },
];

const fieldClass =
  "h-[54px] w-full rounded-[14px] border border-[#B28A47]/20 bg-[#FFFDF8] px-4 text-[14px] text-[#2B1C17] outline-none transition placeholder:text-[#6F625C]/45 focus:border-[#0F5A46]/45 focus:ring-2 focus:ring-[#0F5A46]/10";

const labelClass =
  "mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#5D514C]";

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
    newsletter: false,
    consent: false,
    company: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
          if (code === "rate_limit")
            return "Trop de demandes ont été envoyées. Merci de réessayer plus tard.";
          if (code === "invalid_name") return "Merci de vérifier votre nom.";
          if (code === "invalid_email") return "Merci de vérifier votre adresse e-mail.";
          if (code === "invalid_message") return "Votre message est trop court.";
          if (code === "invalid_consent")
            return "Merci d’accepter la politique de confidentialité.";
          return "Une erreur est survenue lors de l’envoi. Merci de réessayer.";
        })();

        setErrorMessage(friendlyMessage);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch {
      setErrorMessage("Une erreur est survenue lors de l’envoi. Merci de réessayer.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setErrorMessage("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "general",
      message: "",
      checkIn: "",
      checkOut: "",
      guests: "1",
      newsletter: false,
      consent: false,
      company: "",
    });
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8]">
      <header className="border-b border-[#B28A47]/15 px-6 py-6 sm:px-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#B28A47]">
          Votre demande
        </p>
        <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-[#2B1C17] sm:text-[32px]">
          Envoyez-nous un message
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#6F625C] sm:text-[14px]">
          Donnez-nous quelques informations et nous reviendrons vers vous dès que possible.
        </p>
      </header>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#0F5A46]/15 bg-[#0F5A46]/5">
                <CheckCircle2 className="h-6 w-6 text-[#0F5A46]" strokeWidth={1.6} />
              </div>
              <h3 className="mt-5 font-serif text-[27px] font-medium text-[#2B1C17]">
                Votre message a bien été envoyé
              </h3>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#6F625C]">
                Merci. L’équipe Dar LaMamy vous répondra dans les meilleurs délais.
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[#0F5A46]/20 px-5 text-[12px] font-semibold text-[#0F5A46] transition hover:bg-[#0F5A46] hover:text-[#FFFDF8]"
              >
                Envoyer un autre message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Honeypot */}
              <div
                className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* SUBJECT */}
              <fieldset>
                <legend className="mb-3 text-[12px] font-semibold text-[#5D514C]">
                  Quel est le sujet de votre message ?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => {
                    const active = formData.subject === subject.value;
                    return (
                      <label
                        key={subject.value}
                        className={`cursor-pointer rounded-full border px-4 py-2.5 text-[12px] font-medium transition ${
                          active
                            ? "border-[#0F5A46] bg-[#0F5A46] text-[#FFFDF8]"
                            : "border-[#B28A47]/20 bg-[#F8F5EF]/55 text-[#5D514C] hover:border-[#B28A47]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="subject"
                          value={subject.value}
                          checked={active}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        {subject.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* NAME */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    <User className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    autoComplete="given-name"
                    className={fieldClass}
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    <User className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    autoComplete="family-name"
                    className={fieldClass}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              {/* CONTACT */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    <Mail className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={fieldClass}
                    placeholder="vous@exemple.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    <Phone className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className={fieldClass}
                    placeholder="+212 ..."
                  />
                </div>
              </div>

              {/* RESERVATION FIELDS */}
              <AnimatePresence initial={false}>
                {formData.subject === "reservation" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-[18px] border border-[#B28A47]/15 bg-[#F8F5EF]/65 p-5">
                      <div className="mb-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B28A47]">
                          Séjour
                        </p>
                        <h3 className="mt-1 font-serif text-[22px] font-medium text-[#2B1C17]">
                          Informations indicatives
                        </h3>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label htmlFor="checkIn" className={labelClass}>
                            <Calendar className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                            Arrivée
                          </label>
                          <input
                            id="checkIn"
                            type="date"
                            name="checkIn"
                            value={formData.checkIn}
                            onChange={handleChange}
                            className={fieldClass}
                          />
                        </div>

                        <div>
                          <label htmlFor="checkOut" className={labelClass}>
                            <Calendar className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                            Départ
                          </label>
                          <input
                            id="checkOut"
                            type="date"
                            name="checkOut"
                            value={formData.checkOut}
                            onChange={handleChange}
                            className={fieldClass}
                          />
                        </div>

                        <div>
                          <label htmlFor="guests" className={labelClass}>
                            <Users className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                            Voyageurs
                          </label>
                          <select
                            id="guests"
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                            className={fieldClass}
                          >
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? "personne" : "personnes"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MESSAGE */}
              <div>
                <label htmlFor="message" className={labelClass}>
                  <MessageSquare className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                  Votre message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  rows={6}
                  className="min-h-[150px] w-full resize-y rounded-[14px] border border-[#B28A47]/20 bg-[#FFFDF8] px-4 py-3 text-[14px] leading-6 text-[#2B1C17] outline-none transition placeholder:text-[#6F625C]/45 focus:border-[#0F5A46]/45 focus:ring-2 focus:ring-[#0F5A46]/10"
                  placeholder="Décrivez-nous votre demande..."
                />
              </div>

              {/* NEWSLETTER */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 accent-[#0F5A46]"
                />
                <span>
                  <span className="block text-[13px] font-medium text-[#2B1C17]">
                    Recevoir les nouvelles de Dar LaMamy
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-5 text-[#6F625C]">
                    Cette option est facultative et reste décochée par défaut.
                  </span>
                </span>
              </label>

              {/* CONSENT */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 accent-[#0F5A46]"
                />
                <span className="text-[12px] leading-5 text-[#6F625C]">
                  J’accepte que mes données soient utilisées pour répondre à ma demande,
                  conformément à la{" "}
                  <Link
                    href="/politique-confidentialite"
                    className="font-medium text-[#0F5A46] underline decoration-[#B28A47]/40 underline-offset-4"
                  >
                    politique de confidentialité
                  </Link>
                  .
                </span>
              </label>

              {/* SUBMIT */}
              <div className="border-t border-[#B28A47]/12 pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full bg-[#0F5A46] px-6 text-[13px] font-semibold text-[#FFFDF8] transition hover:bg-[#083D31] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-[210px]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" strokeWidth={1.6} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
