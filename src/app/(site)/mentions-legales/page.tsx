export default function MentionsLegalesPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="lux-panel rounded-3xl border border-amber-200/40 p-8">
          <div className="lux-kicker text-amber-700/80 mb-3">MENTIONS LEGALES</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Mentions legales
          </h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Editeur</h2>
              <p>Riad Dar Al Andalus</p>
              <p>123 Derb Sidi Bouloukat, Medina, Marrakech 40000, Maroc</p>
              <p>Contact : contact@riad-al-andalus.com</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Directeur de publication</h2>
              <p>Responsable legal : A renseigner</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Hebergement</h2>
              <p>Hebergeur : A renseigner</p>
              <p>Adresse : A renseigner</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Propriete intellectuelle</h2>
              <p>
                Les contenus (textes, images, videos, logos) sont la propriete
                du Riad Dar Al Andalus. Toute reproduction sans autorisation est
                interdite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
              <p>
                Pour toute question, contactez-nous a l'adresse
                contact@riad-al-andalus.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
