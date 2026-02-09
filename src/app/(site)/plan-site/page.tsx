const links = [
  { href: "/", label: "Accueil" },
  { href: "/chambres", label: "Chambres" },
  { href: "/services", label: "Services" },
  { href: "/galerie", label: "Galerie" },
  { href: "/reservations", label: "Reservations" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
  { href: "/mentions-legales", label: "Mentions legales" },
  { href: "/politique-confidentialite", label: "Politique de confidentialite" },
  { href: "/cgu", label: "CGU" },
];

export default function PlanSitePage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="lux-panel rounded-3xl border border-amber-200/40 p-8">
          <div className="lux-kicker text-amber-700/80 mb-3">PLAN DU SITE</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Plan du site
          </h1>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-2xl border border-amber-200/50 px-4 py-3 text-gray-700 hover:border-amber-400 hover:text-amber-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
