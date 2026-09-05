"use client";

import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { openCookieBanner } from "@/components/CookieBanner";

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="bg-[#F8F5EF]">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          border-b
          border-[#B28A47]/15
          bg-[#F8F5EF]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            left-[-120px]
            top-[-180px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[#B28A47]/[0.05]
            blur-3xl
          "
          aria-hidden="true"
        />

        <div
          className="
            site-container
            relative
            py-12
            sm:py-14
            lg:py-16
          "
        >
          <div className="max-w-3xl">
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B28A47]
              "
            >
              Vos données
            </p>

            <div
              className="
                mt-3
                flex
                items-center
                gap-3
              "
              aria-hidden="true"
            >
              <span className="h-px w-10 bg-[#B28A47]/45" />

              <span
                className="
                  h-[6px]
                  w-[6px]
                  rotate-45
                  border
                  border-[#B28A47]/60
                "
              />

              <span className="h-px w-5 bg-[#B28A47]/20" />
            </div>

            <h1
              className="
                mt-5
                max-w-3xl
                font-serif
                text-[34px]
                font-medium
                leading-[1.05]
                tracking-[-0.025em]
                text-[#2B1C17]
                sm:text-[42px]
                lg:text-[48px]
              "
            >
              Politique de confidentialité
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                text-[14px]
                leading-7
                text-[#6F625C]
                sm:text-[15px]
              "
            >
              Dar LaMamy accorde une attention particulière à la
              confidentialité des informations que vous nous transmettez
              lors de votre navigation, de vos demandes ou de vos
              réservations.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <section
        className="
          site-container
          py-10
          sm:py-12
          lg:py-14
        "
      >
        <div
          className="
            grid
            gap-8
            lg:grid-cols-[220px_minmax(0,1fr)]
            lg:gap-12
          "
        >
          {/* =================================================
              SIDE NAV
              ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.24em]
                  text-[#B28A47]
                "
              >
                Sommaire
              </p>

              <nav className="mt-4">
                <ul
                  className="
                    space-y-3
                    border-l
                    border-[#B28A47]/20
                    pl-4
                  "
                >
                  {[
                    ["donnees", "Données collectées"],
                    ["finalites", "Utilisation des données"],
                    ["base-legale", "Base légale"],
                    ["conservation", "Conservation"],
                    ["partage", "Partage"],
                    ["droits", "Vos droits"],
                    ["contact", "Contact"],
                    ["cookies", "Cookies"],
                  ].map(([id, label]) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="
                          text-[13px]
                          text-[#6F625C]
                          transition-colors
                          hover:text-[#0F5A46]
                        "
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <div>
            {/* =================================================
                SUMMARY
                ================================================= */}

            <div
              className="
                mb-6
                rounded-[20px]
                border
                border-[#0F5A46]/15
                bg-[#0F5A46]/[0.045]
                px-5
                py-5
                sm:px-6
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#0F5A46]/15
                    bg-[#FFFDF8]
                  "
                >
                  <ShieldCheck
                    className="h-4.5 w-4.5 text-[#0F5A46]"
                    strokeWidth={1.6}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.22em]
                      text-[#B28A47]
                    "
                  >
                    En bref
                  </p>

                  <h2
                    className="
                      mt-1
                      font-serif
                      text-[23px]
                      font-medium
                      text-[#2B1C17]
                    "
                  >
                    Une utilisation limitée à ce qui est nécessaire
                  </h2>

                  <ul className="mt-4 space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <Check
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                          text-[#0F5A46]
                        "
                        strokeWidth={1.8}
                      />

                      <span className="text-[13px] leading-6 text-[#5D514C]">
                        Nous collectons les informations nécessaires au
                        traitement de vos demandes et réservations.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <Check
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                          text-[#0F5A46]
                        "
                        strokeWidth={1.8}
                      />

                      <span className="text-[13px] leading-6 text-[#5D514C]">
                        Vos données ne sont pas destinées à être revendues à
                        des tiers.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <Check
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                          text-[#0F5A46]
                        "
                        strokeWidth={1.8}
                      />

                      <span className="text-[13px] leading-6 text-[#5D514C]">
                        Vous pouvez nous contacter pour demander l&apos;accès,
                        la rectification ou la suppression de vos données,
                        lorsque cela est applicable.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* =================================================
                LEGAL BODY
                ================================================= */}

            <article
              className="
                rounded-[24px]
                border
                border-[#B28A47]/15
                bg-[#FFFDF8]
                px-6
                py-7
                sm:px-8
                sm:py-9
                lg:px-10
                lg:py-10
              "
            >
              <div className="divide-y divide-[#B28A47]/12">
                <LegalSection
                  number="01"
                  kicker="Informations"
                  id="donnees"
                  title="Données collectées"
                >
                  <p>
                    Lorsque vous utilisez le site ou nous adressez une
                    demande, nous pouvons collecter les informations que
                    vous choisissez de nous communiquer, notamment votre
                    nom, votre adresse e-mail, votre numéro de téléphone,
                    les dates envisagées pour votre séjour ainsi que les
                    informations utiles à votre demande.
                  </p>
                </LegalSection>

                <LegalSection
                  number="02"
                  kicker="Utilisation"
                  id="finalites"
                  title="Utilisation des données"
                >
                  <p>
                    Ces informations peuvent être utilisées pour répondre à
                    vos demandes, traiter ou préparer une réservation,
                    communiquer avec vous au sujet de votre séjour et
                    assurer le fonctionnement des services proposés par Dar
                    LaMamy.
                  </p>

                  <p>
                    Elles ne sont pas destinées à être vendues ou exploitées
                    à des fins commerciales par des tiers indépendants.
                  </p>
                </LegalSection>

                <LegalSection
                  number="03"
                  kicker="Fondement"
                  id="base-legale"
                  title="Base légale"
                >
                  <p>
                    Selon la nature de votre demande, le traitement de vos
                    données peut reposer notamment sur l&apos;exécution de
                    mesures nécessaires à une réservation, votre
                    consentement lorsque celui-ci est requis, ou le respect
                    d&apos;obligations légales applicables.
                  </p>
                </LegalSection>

                <LegalSection
                  number="04"
                  kicker="Durée"
                  id="conservation"
                  title="Conservation des données"
                >
                  <p>
                    Les données sont conservées uniquement pendant la durée
                    nécessaire aux finalités pour lesquelles elles ont été
                    collectées et, lorsqu&apos;il y a lieu, pendant les durées
                    requises par les obligations légales ou administratives
                    applicables.
                  </p>
                </LegalSection>

                <LegalSection
                  number="05"
                  kicker="Prestataires"
                  id="partage"
                  title="Partage des données"
                >
                  <p>
                    Certaines informations peuvent être transmises à des
                    prestataires techniques lorsque cela est nécessaire au
                    fonctionnement du site ou à la fourniture d&apos;un service,
                    par exemple pour l&apos;hébergement, l&apos;envoi d&apos;e-mails ou
                    certains outils nécessaires à la gestion des demandes.
                  </p>

                  <p>
                    Ces transmissions sont limitées aux informations utiles
                    à la réalisation du service concerné.
                  </p>
                </LegalSection>

                <LegalSection
                  number="06"
                  kicker="Contrôle"
                  id="droits"
                  title="Vos droits"
                >
                  <p>
                    Selon la réglementation applicable, vous pouvez disposer
                    de droits concernant vos données personnelles,
                    notamment l&apos;accès, la rectification, l&apos;effacement ou
                    l&apos;opposition à certains traitements.
                  </p>

                  <p>
                    Pour exercer un droit ou obtenir des informations
                    complémentaires, vous pouvez nous contacter directement.
                  </p>
                </LegalSection>

                <LegalSection
                  number="07"
                  kicker="Assistance"
                  id="contact"
                  title="Contact relatif aux données"
                >
                  <p>
                    Pour toute demande concernant vos données personnelles
                    ou cette politique de confidentialité, vous pouvez
                    contacter Dar LaMamy.
                  </p>

                  <div
                    className="
                      mt-5
                      flex
                      flex-col
                      gap-3
                      rounded-[18px]
                      bg-[#0F5A46]
                      px-5
                      py-5
                      text-[#FFFDF8]
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.22em]
                          text-[#D2AA5A]
                        "
                      >
                        Confidentialité
                      </p>

                      <a
                        href="mailto:contact@darlamamy.com"
                        className="
                          mt-1
                          block
                          text-[14px]
                          text-white/85
                          transition-colors
                          hover:text-white
                        "
                      >
                        contact@darlamamy.com
                      </a>
                    </div>

                    <Link
                      href="/contact"
                      className="
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#D2AA5A]/45
                        px-4
                        text-[12px]
                        font-semibold
                        transition-colors
                        hover:bg-[#FFFDF8]
                        hover:text-[#0F5A46]
                      "
                    >
                      Nous contacter
                    </Link>
                  </div>
                </LegalSection>

                <LegalSection
                  number="08"
                  kicker="Navigation"
                  id="cookies"
                  title="Cookies"
                  last
                >
                  <p>
                    Le site peut utiliser des cookies nécessaires à son bon
                    fonctionnement ainsi que, selon les outils activés,
                    d&apos;autres cookies soumis à vos préférences.
                  </p>

                  <p>
                    Vous pouvez modifier vos choix à tout moment à l&apos;aide
                    de l&apos;outil de gestion des cookies disponible sur le
                    site.
                  </p>

                  <button
                    type="button"
                    onClick={openCookieBanner}
                    className="
                      mt-5
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#0F5A46]/20
                      bg-[#0F5A46]/5
                      px-4
                      text-[12px]
                      font-semibold
                      text-[#0F5A46]
                      transition-colors
                      hover:border-[#0F5A46]/35
                      hover:bg-[#0F5A46]
                      hover:text-[#FFFDF8]
                    "
                  >
                    Gérer mes préférences
                  </button>
                </LegalSection>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function LegalSection({
  id,
  number,
  kicker,
  title,
  children,
  last = false,
}: {
  id: string;
  number: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className={`
        scroll-mt-28
        ${last ? "pt-8" : "py-8 first:pt-0"}
      `}
    >
      <div className="flex items-start gap-4">
        <span
          className="
            mt-1
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#B28A47]/25
            bg-[#F8F5EF]
            text-[10px]
            font-semibold
            text-[#0F5A46]
          "
        >
          {number}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#B28A47]
            "
          >
            {kicker}
          </p>

          <h2
            className="
              mt-1
              font-serif
              text-[25px]
              font-medium
              text-[#2B1C17]
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-3
              space-y-3
              text-[14px]
              leading-7
              text-[#6F625C]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}