import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Globe,
  CreditCard,
  Shield,
} from "lucide-react";

const contactMethods = [
  {
    icon: <Phone size={24} />,
    title: "Telephone",
    details: ["+212 5 24 38 94 12", "+212 6 61 23 45 67 (WhatsApp)"],
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  {
    icon: <Mail size={24} />,
    title: "Email",
    details: [
      "reservations@riad-al-andalus.com",
      "contact@riad-al-andalus.com",
      "groups@riad-al-andalus.com",
    ],
    color: "text-sky-700",
    bgColor: "bg-sky-100",
  },
  {
    icon: <MapPin size={24} />,
    title: "Adresse",
    details: [
      "Derb Sidi Bouloukat, no 123",
      "Medina de Marrakech",
      "40000 Marrakech, Maroc",
    ],
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  {
    icon: <Clock size={24} />,
    title: "Horaires",
    details: [
      "Reception : 24h/24 et 7j/7",
      "Check-in : a partir de 14h",
      "Check-out : jusqu'a 12h",
    ],
    color: "text-rose-700",
    bgColor: "bg-rose-100",
  },
];

const emergencyContacts = [
  { label: "Police", number: "19" },
  { label: "Pompiers", number: "15" },
  { label: "Ambulance", number: "15" },
  { label: "Taxi", number: "05 24 44 44 44" },
];

export default function ContactInfo() {
  const toTel = (raw: string) => {
    const digits = raw.replace(/\s|\(|\)|-/g, "");
    return digits.startsWith("+") ? `tel:${digits}` : `tel:+${digits}`;
  };

  const toWhatsApp = (raw: string) => {
    const cleaned = raw.replace(/\(.*?\)/g, "");
    const digits = cleaned.replace(/[^0-9+]/g, "");
    const withoutPlus = digits.replace(/^\+/, "");
    return `https://wa.me/${withoutPlus}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="lux-kicker text-amber-700/80 mb-2">CONTACT</div>
        <h3 className="text-2xl font-serif font-bold mb-2">
          Comment nous contacter
        </h3>
        <p className="text-gray-600">
          Plusieurs moyens pour echanger avec notre equipe
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col items-center">
          <a
            href={toTel("+212 5 24 38 94 12")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-lg"
          >
            <Phone size={18} /> Appeler
          </a>
          <div className="text-xs text-gray-600 mt-1">Disponible 24/7</div>
        </div>
        <div className="flex flex-col items-center">
          <a
            href={toWhatsApp("+212 6 61 23 45 67 (WhatsApp)")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg"
          >
            <MessageSquare size={18} /> WhatsApp
          </a>
          <div className="text-xs text-gray-600 mt-1">Reponse rapide</div>
        </div>
        <div className="flex flex-col items-center">
          <a
            href="mailto:contact@riad-al-andalus.com"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-950 transition shadow-lg"
          >
            <Mail size={18} /> Email
          </a>
          <div className="text-xs text-gray-600 mt-1">Reponse sous 24h</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contactMethods.map((method, index) => (
          <div
            key={index}
            className="lux-panel p-6 rounded-2xl border border-amber-200/40 shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl ${method.bgColor} ${method.color}`}
              >
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">{method.title}</h4>
                <ul className="space-y-1">
                  {method.details.map((detail, idx) => {
                    const isPhone = method.title === "Telephone";
                    const isEmail = method.title === "Email";
                    if (isPhone) {
                      const isWhatsApp = /WhatsApp/i.test(detail);
                      return (
                        <li key={idx}>
                          {isWhatsApp ? (
                            <a
                              href={toWhatsApp(detail)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline"
                            >
                              {detail}
                            </a>
                          ) : (
                            <a
                              href={toTel(detail)}
                              className="text-emerald-700 hover:underline"
                            >
                              {detail}
                            </a>
                          )}
                        </li>
                      );
                    }
                    if (isEmail) {
                      return (
                        <li key={idx}>
                          <a
                            href={`mailto:${detail}`}
                            className="text-sky-700 hover:underline"
                          >
                            {detail}
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={idx} className="text-gray-600">
                        {detail}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lux-panel rounded-2xl p-6 border border-rose-200/50 bg-gradient-to-r from-rose-50 to-amber-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-rose-100 rounded-lg">
            <MessageSquare size={20} className="text-rose-700" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Contacts d'urgence</h4>
            <p className="text-sm text-gray-600">A retenir pendant votre sejour</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white/80 p-4 rounded-xl text-center shadow-sm"
            >
              <div className="text-lg font-bold text-gray-900">{contact.number}</div>
              <div className="text-sm text-gray-600">{contact.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lux-panel rounded-2xl p-6 border border-amber-200/40 space-y-4">
        <div className="flex items-start space-x-3">
          <Globe size={20} className="text-amber-700" />
          <div>
            <div className="font-medium">Langues parlees</div>
            <div className="text-sm text-gray-600">
              Francais, Anglais, Arabe, Espagnol
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <CreditCard size={20} className="text-amber-700" />
          <div>
            <div className="font-medium">Moyens de paiement</div>
            <div className="text-sm text-gray-600">
              CB, Visa, Mastercard, especes (EUR / USD / MAD), virement
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shield size={20} className="text-amber-700" />
          <div>
            <div className="font-medium">Garantie</div>
            <div className="text-sm text-gray-600">
              Reservation securisee SSL - Confidentialite garantie
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-800">
          <span className="font-bold">Conseil :</span> Pour les reservations
          urgentes, privilegiez l'appel telephonique ou WhatsApp. Notre equipe
          est joignable 24h/24 pour repondre a vos questions.
        </p>
      </div>
    </div>
  );
}
