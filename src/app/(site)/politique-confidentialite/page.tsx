export default function PolitiqueConfidentialitePage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="lux-panel rounded-3xl border border-amber-200/40 p-8">
          <div className="lux-kicker text-amber-700/80 mb-3">CONFIDENTIALITE</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Politique de confidentialite
          </h1>

          <div className="mb-8 rounded-2xl border border-amber-200/60 bg-amber-50/60 p-5 text-gray-700">
            <p className="font-semibold text-gray-900 mb-2">Resume rapide</p>
            <ul className="space-y-2 text-sm">
              <li>Nous collectons uniquement les donnees utiles a vos demandes et reservations.</li>
              <li>Vos donnees ne sont jamais revendues.</li>
              <li>Vous pouvez demander l'acces, la rectification ou la suppression.</li>
            </ul>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Donnees collectees</h2>
              <p>
                Nous collectons les informations necessaires a la gestion de vos
                demandes et reservations : nom, email, telephone, dates de sejour
                et preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Finalites</h2>
              <p>
                Vos donnees sont utilisees pour traiter les demandes, confirmer les
                reservations et assurer le suivi client. Aucune revente n'est
                effectuee.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Base legale</h2>
              <p>
                Le traitement repose sur l'execution d'un contrat (reservation),
                votre consentement (formulaires) et nos obligations legales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Conservation</h2>
              <p>
                Les donnees sont conservees le temps necessaire a la gestion de la
                relation client et aux obligations legales. A titre indicatif :
                12 mois pour les demandes de contact, 3 ans pour les dossiers
                de reservation, sauf obligations legales contraires.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Partage</h2>
              <p>
                Les donnees peuvent etre partagees avec des prestataires techniques
                (hebergement, emails transactionnels) strictement pour fournir le
                service. Aucun transfert commercial n'est effectue.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Vos droits</h2>
              <p>
                Vous disposez d'un droit d'acces, de rectification et de suppression
                de vos donnees. Contactez-nous pour exercer vos droits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact RGPD</h2>
              <p>
                Pour toute demande relative a vos donnees, ecrivez-nous a
                contact@riad-al-andalus.com. Nous repondons sous 30 jours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cookies</h2>
              <p>
                Nous utilisons des cookies essentiels au bon fonctionnement du site.
                Vous pouvez gerer vos preferences via la banniere cookies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
