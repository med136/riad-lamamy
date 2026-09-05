export const guestConfig = {
  brand: "Dar LaMamy",
  city: "Fès",
  country: "Maroc",
} as const;

export function whatsappHref(number: string, message: string) {
  const normalizedNumber = number.replace(/\D/g, "");
  if (!normalizedNumber) return "/guest/contact";
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function phoneHref(number: string) {
  const normalizedNumber = number.replace(/[^\d+]/g, "");
  return normalizedNumber ? `tel:${normalizedNumber}` : "/guest/contact";
}
