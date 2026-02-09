export default function CguPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="lux-panel rounded-3xl border border-amber-200/40 p-8">
          <div className="lux-kicker text-amber-700/80 mb-3">CGU</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Conditions generales d'utilisation
          </h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Objet</h2>
              <p>
                Les presentes conditions encadrent l'utilisation du site et des
                services proposes par le Riad Dar Al Andalus.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reservations</h2>
              <p>
                Les demandes de reservation sont soumises a disponibilite et
                confirmation. Un email de confirmation est envoye apres validation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Responsabilite</h2>
              <p>
                Le Riad met tout en oeuvre pour fournir des informations exactes.
                Il ne saurait etre tenu responsable d'erreurs involontaires ou
                d'indisponibilites temporaires.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
              <p>
                Pour toute question relative aux CGU, contactez-nous a
                contact@riad-al-andalus.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
