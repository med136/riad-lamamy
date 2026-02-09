import { 
  CheckCircle, Clock, CreditCard, 
  Shield, HelpCircle, Star 
} from "lucide-react";

const policies = [
  {
    icon: <Clock size={20} />,
    title: "Check-in/out Flexible",
    description: "Arrivée après 14h • Départ avant 12h",
  },
  {
    icon: <CreditCard size={20} />,
    title: "Paiement Sécurisé",
    description: "CB, Visa, Mastercard, espèces acceptés",
  },
  {
    icon: <CheckCircle size={20} />,
    title: "Annulation Gratuite",
    description: "Jusqu'à 48h avant l'arrivée",
  },
  {
    icon: <Shield size={20} />,
    title: "Garantie",
    description: "Meilleur prix garanti",
  },
];

export default function ReservationInfo() {
  return (
    <div className="lux-panel rounded-3xl p-8 border border-amber-200/40 shadow-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Star size={28} className="text-amber-700" />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">
          Informations Importantes
        </h3>
        <p className="text-gray-600">
          Tout ce que vous devez savoir avant de réserver
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {policies.map((policy, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="text-amber-700 mt-1 flex-shrink-0">
              {policy.icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{policy.title}</h4>
              <p className="text-gray-600 text-sm">{policy.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="lux-panel rounded-2xl p-6 border border-amber-200/40">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle size={24} className="text-amber-700" />
          <h4 className="font-bold text-gray-900">Besoin d&apos;aide ?</h4>
        </div>
        <p className="text-gray-700 mb-4">
          Notre équipe est disponible 24h/24 pour répondre à vos questions.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Téléphone :</span>
            <span className="text-amber-700">+212 5 24 38 94 12</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Email :</span>
            <span className="text-amber-700">reservations@riad-al-andalus.com</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          En réservant, vous acceptez nos 
          <a href="/cgu" className="text-amber-700 hover:underline mx-1">
            conditions générales
          </a>
          d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
