# Fix: Error "Could not find the 'featured' column" - Solution

## Problème
Quand tu essaies d'ajouter une chambre, tu reçois cette erreur:
```
Could not find the 'featured' column of 'rooms' in the schema cache
```

## Cause
La table `rooms` dans Supabase a été créée avec une structure ancienne qui n'inclut pas les colonnes:
- `featured` (BOOLEAN)
- `slug` (VARCHAR)
- `base_price` (DECIMAL)

Mais le code API essaie d'insérer des données avec ces colonnes.

## Solution Rapide (Via Interface Supabase)

### Étape 1: Accéder à Supabase
1. Va sur https://app.supabase.com
2. Sélectionne ton projet Riad
3. Va à **SQL Editor**

### Étape 2: Exécuter la requête de correction
Copie-colle et exécute ce script SQL:

```sql
-- Ajouter les colonnes manquantes
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Remplir base_price depuis base_price_per_night s'il existe
UPDATE public.rooms
SET base_price = base_price_per_night
WHERE base_price IS NULL AND base_price_per_night IS NOT NULL;

-- Créer les slugs si base_price était NULL
UPDATE public.rooms
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'g'), '^-|-$', '', 'g'))
WHERE slug IS NULL OR slug = '';

-- Créer les indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_slug ON public.rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_featured ON public.rooms(featured);
```

### Étape 3: Rafraîchir Supabase
Dans Supabase, va à:
- **Database** → **rooms** 
- Clique sur le bouton **Refresh** en haut à droite

## Solution Alternative (Via CLI)

Si tu préfères utiliser la CLI Supabase:

```bash
cd riad-website
supabase db push
```

Cela exécutera la nouvelle migration `20260116000000_fix_rooms_schema.sql` que j'ai créée.

## Étape 4: Tester
1. Redémarre le serveur Next.js:
```bash
npm run dev
```

2. Va à http://localhost:3000/admin/chambres

3. Clique sur "Ajouter une chambre"

4. Remplis les informations:
   - Nom: "Test Chambre"
   - Description: "Test"
   - Prix: "2000"
   - Capacité: "2"
   - Status: "available"
   
5. Clique "Sauvegarder"

L'erreur devrait maintenant être résolue! ✅

## Vérification

Pour vérifier que les colonnes existent:

```sql
-- Dans Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'rooms'
ORDER BY column_name;
```

Tu devrais voir:
- `featured` (BOOLEAN)
- `slug` (VARCHAR)
- `base_price` (NUMERIC)
- `order_index` (INTEGER)

## Notes

- La colonne `slug` est générée automatiquement à partir du nom (normalisé, minuscules, tirets)
- La colonne `featured` est `false` par défaut
- Si tu as des chambres existantes, la migration copiera `base_price_per_night` → `base_price`
- Les indexes créés améliorent les performances des requêtes
