# Riad Dar Al Andalus — Site Web & Admin

Site vitrine et espace d'administration pour le riad "Dar Al Andalus" à Marrakech.
Le projet combine un front public pour les visiteurs et un back-office pour gérer le contenu,
les réservations, les médias et les paramètres du site.

## Fonctionnalités

### Site public
- Pages principales: accueil, chambres, services, galerie, contact, à propos.
- Réservation en ligne avec calendrier et tarification.
- Galerie photos et carrousels.
- Avis clients et témoignages.
- Intégration WhatsApp et carte interactive.
- Animations et transitions fluides.
- SEO et performance optimisés.

### Espace admin
- Dashboard et statistiques.
- Gestion des chambres, services, galerie et témoignages.
- Paramètres généraux du site (nom, contact, maintenance, logos).
- Upload de médias et logos via Supabase Storage.
- Gestion du hero (texte, visuels, carrousel).

## Stack technique

- Framework: Next.js 16 (App Router)
- Langage: TypeScript
- UI: React 19, Tailwind CSS
- Animations: Framer Motion
- Formulaires: React Hook Form + Zod
- Calendrier: React Datepicker
- Carrousel: Swiper
- Notifications: React Hot Toast
- Icônes: Lucide React
- Backend: Supabase (Database + Storage + Auth SSR)
- Tooling: ESLint, Prettier, PostCSS, Autoprefixer

## Architecture (extrait)

```
src/
  app/(site)/          Pages publiques
  app/admin/           Pages admin
  app/api/             Routes API (Next.js)
  components/          Composants UI
  lib/                 Clients Supabase et utilitaires
  types/               Types TypeScript
public/                Assets statiques
supabase/              Configs et migrations
```

## Configuration

1) Copier l'exemple:
```
cp .env.example .env.local
```

2) Renseigner les clés Supabase (obligatoires):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3) Optionnel: Maps, analytics, email, Stripe, etc.

## Scripts

```
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run seed:demo-homepage
```

### Seed demo (homepage)

Le script `seed:demo-homepage` crée des données de démonstration **dans la base Supabase** (rooms, services, gallery, testimonials, hero, settings) et upload des images **dans Supabase Storage** (SVG demo) puis enregistre leurs URLs publiques en base.

Pré-requis (env):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Exécution:
```
npm run seed:demo-homepage
```

Forcer la réinsertion des entrées demo (suppression des entrées `DEMO:*` puis réinsertion):
```
npm run seed:demo-homepage -- --force
```

## Déploiement

Le projet est compatible Vercel. Configurez les variables d'environnement,
déployez puis vérifiez les routes publiques et l'admin.
