export const SERVICE_CATEGORIES = [
  "restauration",
  "spa",
  "transport",
  "activite",
  "sur_mesure",
] as const;

type ServiceUpdateInput = {
  name?: unknown;
  category?: unknown;
  display_order?: unknown;
  price?: unknown;
  duration_minutes?: unknown;
  is_active?: unknown;
  description?: unknown;
};

export function buildServiceUpdate(body: ServiceUpdateInput): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      throw new Error("Le nom du service est obligatoire.");
    }
    updates.name = body.name.trim();
  }
  if (body.category !== undefined) {
    if (
      typeof body.category !== "string" ||
      !SERVICE_CATEGORIES.includes(body.category as (typeof SERVICE_CATEGORIES)[number])
    ) {
      throw new Error("La catégorie du service est invalide.");
    }
    updates.category = body.category;
  }
  if (body.display_order !== undefined) {
    if (!Number.isInteger(body.display_order) || (body.display_order as number) < 0) {
      throw new Error("L’ordre d’affichage doit être un entier positif ou nul.");
    }
    updates.display_order = body.display_order;
  }
  if (body.price !== undefined) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) {
      throw new Error("Le prix doit être un nombre positif ou nul.");
    }
    updates.base_price = body.price;
  }
  if (body.duration_minutes !== undefined) {
    if (
      body.duration_minutes !== null &&
      (typeof body.duration_minutes !== "number" ||
        !Number.isInteger(body.duration_minutes) ||
        body.duration_minutes < 0)
    ) {
      throw new Error("La durée doit être un entier positif ou nul.");
    }
    updates.duration_minutes = body.duration_minutes;
  }
  if (body.is_active !== undefined) {
    if (typeof body.is_active !== "boolean") throw new Error("Le statut actif est invalide.");
    updates.is_active = body.is_active;
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string") throw new Error("La description est invalide.");
    updates.description = body.description;
  }
  if (!Object.keys(updates).length) throw new Error("Aucun champ valide à mettre à jour.");
  return updates;
}
