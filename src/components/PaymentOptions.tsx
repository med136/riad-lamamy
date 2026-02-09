import { 
  CreditCard, Smartphone, Banknote, 
  Shield, Lock, CheckCircle 
} from "lucide-react";

const paymentMethods = [
  {
    icon: <CreditCard size={24} />,
    name: "Carte Bancaire",
    description: "Visa, Mastercard, American Express",
    secure: true,
  },
  {
    icon: <Smartphone size={24} />,
    name: "Mobile Money",
    description: "PayPal, Apple Pay, Google Pay",
    secure: true,
  },
  {
    icon: <Banknote size={24} />,
    name: "Espèces",
    description: "Euros, Dollars, Dirhams",
    secure: false,
  },
];

export default function PaymentOptions() {
  return (
    <div className="lux-panel rounded-2xl p-8 border border-amber-200/40 shadow-2xl">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-green-100 rounded-xl">
          <Lock size={24} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-bold">Options de Paiement</h3>
          <p className="text-gray-600">Transactions 100% sécurisées</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {paymentMethods.map((method, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-amber-200/40 rounded-xl hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                method.secure ? 'bg-green-50 text-emerald-600' : 'bg-gray-50 text-gray-600'
              }`}>
                {method.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{method.name}</h4>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
            </div>
            {method.secure && (
              <div className="flex items-center space-x-1 text-emerald-600">
                <Shield size={16} />
                <span className="text-sm font-semibold">SÉCURISÉ</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lux-panel rounded-xl p-6 border border-amber-200/40">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle size={20} className="text-emerald-600" />
          <h4 className="font-bold text-gray-900">Garanties</h4>
        </div>
        <ul className="space-y-2 text-gray-600">
          <li>• Cryptage SSL 256-bit</li>
          <li>• Protection des données</li>
          <li>• Pas de frais cachés</li>
          <li>• Reçu fiscal fourni</li>
        </ul>
      </div>
    </div>
  );
}
