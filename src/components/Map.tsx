"use client";

import { MapPin, Navigation, ExternalLink } from "lucide-react";

export default function Map() {
  return (
    <section
      className="
        overflow-hidden
        rounded-[22px]
        border
        border-[#B28A47]/15
        bg-[#FFFDF8]
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          border-b
          border-[#B28A47]/15
          px-5
          py-5
          sm:px-6
        "
      >
        <p
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.24em]
            text-[#B28A47]
          "
        >
          Localisation
        </p>

        <div className="mt-2 flex items-start gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[#B28A47]/20
              bg-[#F8F5EF]
            "
          >
            <MapPin
              className="h-4 w-4 text-[#0F5A46]"
              strokeWidth={1.6}
            />
          </div>

          <div>
            <h2
              className="
                font-serif
                text-[24px]
                font-medium
                leading-tight
                text-[#2B1C17]
              "
            >
              Au cœur de Fès
            </h2>

            <p
              className="
                mt-1
                text-[13px]
                leading-5
                text-[#6F625C]
              "
            >
              Dar LaMamy vous accueille dans l&apos;atmosphère
              unique de la médina de Fès.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAP PLACEHOLDER
          ===================================================== */}

      <div
        className="
          relative
          flex
          min-h-[250px]
          items-center
          justify-center
          overflow-hidden
          bg-[#F3EEE5]
          sm:min-h-[280px]
        "
      >
        {/* subtle pattern */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.18]
            bg-[radial-gradient(circle_at_20%_20%,rgba(178,138,71,0.18),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(15,90,70,0.13),transparent_26%)]
          "
          aria-hidden="true"
        />

        <div
          className="
            relative
            z-10
            max-w-xs
            px-6
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-[#B28A47]/25
              bg-[#FFFDF8]
            "
          >
            <MapPin
              className="h-6 w-6 text-[#0F5A46]"
              strokeWidth={1.6}
            />
          </div>

          <h3
            className="
              mt-4
              font-serif
              text-[22px]
              font-medium
              text-[#2B1C17]
            "
          >
            Dar LaMamy
          </h3>

          <p
            className="
              mt-1
              text-[12px]
              uppercase
              tracking-[0.16em]
              text-[#B28A47]
            "
          >
            Fès · Maroc
          </p>
        </div>
      </div>

      {/* =====================================================
          INFO
          ===================================================== */}

      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <Navigation
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-[#B28A47]
            "
            strokeWidth={1.6}
          />

          <div>
            <h3
              className="
                text-[13px]
                font-semibold
                text-[#2B1C17]
              "
            >
              Préparer votre arrivée
            </h3>

            <p
              className="
                mt-1
                text-[13px]
                leading-6
                text-[#6F625C]
              "
            >
              Une fois votre réservation confirmée, notre équipe peut
              vous communiquer les indications utiles pour rejoindre
              Dar LaMamy dans les meilleures conditions.
            </p>
          </div>
        </div>

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
              text-[12px]
              leading-5
              text-[#5D514C]
            "
          >
            La position exacte et l&apos;itinéraire peuvent être
            communiqués aux voyageurs avant leur arrivée.
          </p>
        </div>

        {/* ===================================================
            OPTIONAL GOOGLE MAPS LINK
            =================================================== */}

        <a
          href="https://www.google.com/maps/search/?api=1&query=Fes+Medina+Morocco"
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-5
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-[#0F5A46]/20
            px-4
            text-[12px]
            font-semibold
            text-[#0F5A46]
            transition-colors
            hover:bg-[#0F5A46]
            hover:text-[#FFFDF8]
          "
        >
          Voir la médina de Fès
          <ExternalLink
            className="h-3.5 w-3.5"
            strokeWidth={1.6}
          />
        </a>
      </div>
    </section>
  );
}