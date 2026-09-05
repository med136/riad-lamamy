import Link from "next/link";

export default function CguPage() {
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
              Informations légales
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
                max-w-2xl
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
              Conditions générales
              d&apos;utilisation
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
              Les présentes conditions encadrent l&apos;utilisation du
              site Dar LaMamy et les services proposés aux visiteurs.
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
                  <li>
                    <a
                      href="#objet"
                      className="
                        text-[13px]
                        text-[#6F625C]
                        transition-colors
                        hover:text-[#0F5A46]
                      "
                    >
                      Objet
                    </a>
                  </li>

                  <li>
                    <a
                      href="#reservations"
                      className="
                        text-[13px]
                        text-[#6F625C]
                        transition-colors
                        hover:text-[#0F5A46]
                      "
                    >
                      Réservations
                    </a>
                  </li>

                  <li>
                    <a
                      href="#responsabilite"
                      className="
                        text-[13px]
                        text-[#6F625C]
                        transition-colors
                        hover:text-[#0F5A46]
                      "
                    >
                      Responsabilité
                    </a>
                  </li>

                  <li>
                    <a
                      href="#contact"
                      className="
                        text-[13px]
                        text-[#6F625C]
                        transition-colors
                        hover:text-[#0F5A46]
                      "
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* =================================================
              LEGAL CONTENT
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
            <div
              className="
                divide-y
                divide-[#B28A47]/12
              "
            >
              {/* OBJET */}

              <section
                id="objet"
                className="scroll-mt-28 pb-8"
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
                    01
                  </span>

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
                      Conditions d&apos;utilisation
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
                      Objet
                    </h2>

                    <p
                      className="
                        mt-3
                        text-[14px]
                        leading-7
                        text-[#6F625C]
                      "
                    >
                      Les présentes conditions générales d&apos;utilisation
                      définissent les règles applicables à la consultation
                      et à l&apos;utilisation du site Dar LaMamy ainsi qu&apos;aux
                      services présentés sur celui-ci.
                    </p>
                  </div>
                </div>
              </section>

              {/* RESERVATIONS */}

              <section
                id="reservations"
                className="scroll-mt-28 py-8"
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
                    02
                  </span>

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
                      Séjour
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
                      Réservations
                    </h2>

                    <p
                      className="
                        mt-3
                        text-[14px]
                        leading-7
                        text-[#6F625C]
                      "
                    >
                      Toute demande de réservation est soumise à
                      disponibilité et à confirmation. La réservation
                      devient effective après validation par Dar LaMamy
                      et l&apos;envoi d&apos;une confirmation au voyageur.
                    </p>

                    <div
                      className="
                        mt-5
                        rounded-[16px]
                        border
                        border-[#B28A47]/15
                        bg-[#F8F5EF]
                        px-4
                        py-4
                      "
                    >
                      <p
                        className="
                          text-[13px]
                          leading-6
                          text-[#5D514C]
                        "
                      >
                        Les conditions spécifiques de paiement,
                        d&apos;annulation ou de modification peuvent varier
                        selon le séjour et sont précisées au moment de la
                        réservation.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* RESPONSABILITE */}

              <section
                id="responsabilite"
                className="scroll-mt-28 py-8"
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
                    03
                  </span>

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
                      Informations
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
                      Responsabilité
                    </h2>

                    <p
                      className="
                        mt-3
                        text-[14px]
                        leading-7
                        text-[#6F625C]
                      "
                    >
                      Dar LaMamy s&apos;efforce de fournir sur ce site des
                      informations exactes et régulièrement mises à jour.
                      Toutefois, des erreurs, omissions ou indisponibilités
                      temporaires peuvent survenir.
                    </p>

                    <p
                      className="
                        mt-3
                        text-[14px]
                        leading-7
                        text-[#6F625C]
                      "
                    >
                      Dar LaMamy ne peut être tenu responsable des
                      conséquences liées à une interruption temporaire du
                      site ou à l&apos;utilisation d&apos;informations devenues
                      obsolètes.
                    </p>
                  </div>
                </div>
              </section>

              {/* CONTACT */}

              <section
                id="contact"
                className="scroll-mt-28 pt-8"
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
                    04
                  </span>

                  <div className="w-full">
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#B28A47]
                      "
                    >
                      Assistance
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
                      Contact
                    </h2>

                    <p
                      className="
                        mt-3
                        text-[14px]
                        leading-7
                        text-[#6F625C]
                      "
                    >
                      Pour toute question relative aux présentes conditions,
                      vous pouvez contacter l&apos;équipe Dar LaMamy.
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
                          Besoin d&apos;aide ?
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
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}