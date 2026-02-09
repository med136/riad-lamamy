import { Calendar, AlertCircle, Clock, RefreshCw } from "lucide-react";

export default function CancellationPolicy() {
  return (
    <div className="lux-panel rounded-2xl p-8 border border-amber-200/40 shadow-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-amber-100/80 rounded-xl">
          <Calendar size={24} className="text-amber-700" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold">Politique d&apos;Annulation</h3>
          <p className="text-gray-600">Flexible et transparente</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Clock size={20} className="text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Annulation Gratuite</h4>
            <p className="text-gray-600 text-sm">
              Jusqu&apos;à 48 heures avant votre date d&apos;arrivée.
              Remboursement intégral.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <AlertCircle size={20} className="text-amber-700 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Annulation Tardive</h4>
            <p className="text-gray-600 text-sm">
              Moins de 48 heures avant l&apos;arrivée : 
              première nuit facturée.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <RefreshCw size={20} className="text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Modification</h4>
            <p className="text-gray-600 text-sm">
              Modifications gratuites selon disponibilité.
              Contactez-nous pour toute demande.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-amber-200/60">
        <p className="text-sm text-gray-500 text-center">
          Pour les réservations de groupe (plus de 5 chambres), 
          des conditions spécifiques s&apos;appliquent.
          <a href="/contact" className="text-amber-700 hover:underline ml-1">
            Contactez-nous
          </a>.
        </p>
      </div>
    </div>
  );
}
