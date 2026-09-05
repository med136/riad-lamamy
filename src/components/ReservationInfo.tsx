import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

const policies = [
  {
    icon: Clock3,
    title: "Arrivée & départ",
    description: "Arrivée après 14h • Départ avant 12h",
  },
  {
    icon: CreditCard,
    title: "Paiement",
    description: "Carte bancaire et espèces selon les modalités du séjour",
  },
  {
    icon: CheckCircle2,
    title: "Annulation",
    description: "Les conditions applicables sont précisées avant confirmation",
  },
  {
    icon: ShieldCheck,
    title: "Réservation directe",
    description: "Échange direct avec Dar LaMamy pour préparer votre séjour",
  },
];

export default function ReservationInfo() {
  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div>
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.24em]
            text-[#B28A47]
          "
        >
          À savoir
        </p>

        <h3
          className="
            mt-2
            font-serif
            text-[28px]
            font-medium
            leading-tight
            text-[#2B1C17]
          "
        >
          Informations utiles
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-[#6F625C]
          "
        >
          Les principales informations à connaître avant de confirmer
          votre séjour à Dar LaMamy.
        </p>
      </div>

      {/* =====================================================
          POLICIES
          ===================================================== */}

      <div className="divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
        {policies.map((policy) => {
          const Icon = policy.icon;

          return (
            <div
              key={policy.title}
              className="
                flex
                items-start
                gap-4
                py-4
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
                  bg-[#F8F5EF]
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
                  {policy.title}
                </h4>

                <p
                  className="
                    mt-1
                    text-[13px]
                    leading-5
                    text-[#6F625C]
                  "
                >
                  {policy.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          HELP
          ===================================================== */}

      <div
        className="
          rounded-[18px]
          border
          border-[#B28A47]/15
          bg-[#F8F5EF]/70
          p-5
        "
      >
        <div className="flex items-start gap-3">
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
              bg-[#FFFDF8]
            "
          >
            <HelpCircle
              className="h-4 w-4 text-[#0F5A46]"
              strokeWidth={1.6}
            />
          </div>

          <div>
            <h4
              className="
                font-serif
                text-[22px]
                font-medium
                leading-tight
                text-[#2B1C17]
              "
            >
              Besoin d&apos;aide ?
            </h4>

            <p
              className="
                mt-2
                text-[13px]
                leading-6
                text-[#6F625C]
              "
            >
              Notre équipe peut vous accompagner avant votre arrivée
              et répondre à vos questions concernant votre réservation.
            </p>

            <Link
              href="/contact"
              className="
                mt-4
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
        </div>
      </div>

      {/* =====================================================
          TERMS
          ===================================================== */}

      <p
        className="
          text-[11px]
          leading-5
          text-[#6F625C]/75
        "
      >
        En confirmant votre réservation, vous acceptez nos{" "}
        <Link
          href="/cgu"
          className="
            font-medium
            text-[#0F5A46]
            underline-offset-4
            transition-colors
            hover:text-[#063F33]
            hover:underline
          "
        >
          conditions générales
        </Link>
        .
      </p>
    </div>
  );
}