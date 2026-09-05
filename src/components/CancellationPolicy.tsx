import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  RefreshCw,
} from "lucide-react";

const cancellationItems = [
  {
    icon: Clock3,
    title: "Annulation",
    description:
      "Les conditions d’annulation applicables à votre séjour sont précisées avant la confirmation de la réservation.",
  },
  {
    icon: AlertCircle,
    title: "Annulation tardive",
    description:
      "En cas d’annulation proche de la date d’arrivée, des frais peuvent s’appliquer selon les conditions de votre réservation.",
  },
  {
    icon: RefreshCw,
    title: "Modification",
    description:
      "Toute demande de modification est traitée selon les disponibilités et les conditions de votre séjour.",
  },
];

export default function CancellationPolicy() {
  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
          ===================================================== */}

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
            border-[#B28A47]/25
            bg-[#F8F5EF]
          "
        >
          <CalendarDays
            className="h-4 w-4 text-[#0F5A46]"
            strokeWidth={1.6}
          />
        </div>

        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#B28A47]
            "
          >
            Conditions
          </p>

          <h3
            className="
              mt-1
              font-serif
              text-[26px]
              font-medium
              leading-tight
              text-[#2B1C17]
            "
          >
            Annulation & modifications
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-[#6F625C]
            "
          >
            Des conditions claires vous sont présentées avant la
            confirmation de votre réservation.
          </p>
        </div>
      </div>

      {/* =====================================================
          POLICY ITEMS
          ===================================================== */}

      <div className="divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
        {cancellationItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                flex
                items-start
                gap-4
                py-5
              "
            >
              <div
                className="
                  mt-0.5
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#B28A47]/20
                  bg-[#FFFDF8]
                "
              >
                <Icon
                  className="h-4 w-4 text-[#0F5A46]"
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <h4
                  className="
                    text-[14px]
                    font-semibold
                    text-[#2B1C17]
                  "
                >
                  {item.title}
                </h4>

                <p
                  className="
                    mt-1
                    text-[13px]
                    leading-5
                    text-[#6F625C]
                  "
                >
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          GROUP / SPECIAL CONDITIONS
          ===================================================== */}

      <div
        className="
          rounded-[18px]
          border
          border-[#B28A47]/15
          bg-[#F8F5EF]/65
          p-5
        "
      >
        <p
          className="
            text-[13px]
            leading-6
            text-[#5D514C]
          "
        >
          Certaines réservations, offres ou séjours particuliers peuvent
          être soumis à des conditions spécifiques.
        </p>

        <Link
          href="/contact"
          className="
            mt-3
            inline-flex
            items-center
            gap-2
            text-[13px]
            font-semibold
            text-[#0F5A46]
            transition-colors
            hover:text-[#063F33]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#B28A47]/60
            focus-visible:ring-offset-2
          "
        >
          Nous contacter
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* =====================================================
          FOOTNOTE
          ===================================================== */}

      <p
        className="
          text-[11px]
          leading-5
          text-[#6F625C]/70
        "
      >
        Les conditions définitives applicables à votre réservation sont
        celles affichées au moment de la confirmation.
      </p>
    </div>
  );
}