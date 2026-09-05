import {
  Banknote,
  Check,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const paymentMethods = [
  {
    icon: CreditCard,
    name: "Carte bancaire",
    description: "Visa, Mastercard, American Express",
    secure: true,
  },
  {
    icon: Smartphone,
    name: "Paiement mobile",
    description: "PayPal, Apple Pay, Google Pay",
    secure: true,
  },
  {
    icon: Banknote,
    name: "Espèces",
    description: "Paiement sur place en Dirhams",
    secure: false,
  },
];

const guarantees = [
  "Connexion sécurisée",
  "Protection de vos données",
  "Aucun frais caché",
  "Confirmation claire avant paiement",
];

export default function PaymentOptions() {
  return (
    <div className="space-y-7">
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
          <LockKeyhole
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
            Paiement
          </p>

          <h3
            className="
              mt-1
              font-serif
              text-[28px]
              font-medium
              leading-tight
              text-[#2B1C17]
            "
          >
            Paiement simple et sécurisé
          </h3>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-[#6F625C]
            "
          >
            Choisissez le mode de paiement qui vous convient.
            Les informations sont présentées clairement avant
            toute confirmation.
          </p>
        </div>
      </div>

      {/* =====================================================
          PAYMENT METHODS
          ===================================================== */}

      <div className="divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
        {paymentMethods.map((method) => {
          const Icon = method.icon;

          return (
            <div
              key={method.name}
              className="
                flex
                flex-col
                gap-4
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
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
                    border-[#B28A47]/20
                    bg-[#FFFDF8]
                  "
                >
                  <Icon
                    className="h-4.5 w-4.5 text-[#0F5A46]"
                    strokeWidth={1.6}
                  />
                </div>

                <div>
                  <h4
                    className="
                      text-[15px]
                      font-semibold
                      text-[#2B1C17]
                    "
                  >
                    {method.name}
                  </h4>

                  <p
                    className="
                      mt-1
                      text-[13px]
                      leading-5
                      text-[#6F625C]
                    "
                  >
                    {method.description}
                  </p>
                </div>
              </div>

              {method.secure && (
                <div
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#0F5A46]/15
                    bg-[#0F5A46]/5
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[#0F5A46]
                  "
                >
                  <ShieldCheck
                    className="h-3.5 w-3.5"
                    strokeWidth={1.7}
                  />

                  Sécurisé
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================================
          GUARANTEES
          ===================================================== */}

      <div
        className="
          rounded-[18px]
          border
          border-[#B28A47]/15
          bg-[#F8F5EF]/65
          p-5
          sm:p-6
        "
      >
        <div className="flex items-center gap-3">
          <ShieldCheck
            className="h-4.5 w-4.5 text-[#0F5A46]"
            strokeWidth={1.6}
          />

          <h4
            className="
              font-serif
              text-[22px]
              font-medium
              text-[#2B1C17]
            "
          >
            Vos garanties
          </h4>
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-x-7
            gap-y-3
            sm:grid-cols-2
          "
        >
          {guarantees.map((guarantee) => (
            <div
              key={guarantee}
              className="
                flex
                items-start
                gap-3
                text-[13px]
                leading-5
                text-[#5D514C]
              "
            >
              <div
                className="
                  mt-0.5
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#B28A47]/25
                  bg-[#FFFDF8]
                "
              >
                <Check
                  className="h-2.5 w-2.5 text-[#0F5A46]"
                  strokeWidth={2}
                />
              </div>

              <span>{guarantee}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          FOOTNOTE
          ===================================================== */}

      <p
        className="
          flex
          items-center
          gap-2
          text-[12px]
          leading-5
          text-[#6F625C]/75
        "
      >
        <LockKeyhole
          className="h-3.5 w-3.5 shrink-0 text-[#B28A47]"
          strokeWidth={1.6}
        />

        Les modalités exactes de paiement sont confirmées avant
        la finalisation de votre réservation.
      </p>
    </div>
  );
}