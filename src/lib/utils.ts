/**
 * Formate un prix selon la devise et la locale
 */
export function formatPrice(
  price: number, 
  currency: string = 'EUR', 
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formate une date selon les options
 */
export function formatDate(
  date: Date | string, 
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Calcule le nombre de nuits entre deux dates
 */
export function calculateStayNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcule le prix total d'un séjour
 */
export function calculateTotalPrice(
  pricePerNight: number, 
  nights: number, 
  guests: number = 1,
  promoCode?: string
): number {
  let total = pricePerNight * nights;
  
  // Supplément pour personne supplémentaire (à partir de la 3ème)
  if (guests > 2) {
    total += (guests - 2) * 20 * nights;
  }
  
  // Réduction pour long séjour
  if (nights >= 7) {
    total *= 0.9; // 10% de réduction
  } else if (nights >= 3) {
    total *= 0.95; // 5% de réduction
  }
  
  // Application code promo
  if (promoCode === "RIAD10") {
    total *= 0.9; // 10% supplémentaire
  } else if (promoCode === "RIAD5") {
    total *= 0.95; // 5% supplémentaire
  }
  
  return Math.round(total);
}

/**
 * Génère un slug URL-friendly
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Validation d'email
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validation de téléphone (international)
 */
export function validatePhone(phone: string): boolean {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Formate un numéro de téléphone pour l'affichage
 */
export function formatPhone(phone: string, countryCode: string = '+212'): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('0')) {
    return `${countryCode} ${cleaned.substring(1).replace(/(\d{2})(?=\d)/g, '$1 ')}`;
  }
  
  return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
}

/**
 * Extrait l'année en cours
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Génère un identifiant unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Limite un texte avec ellipse
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Fonction utilitaire pour les classes CSS conditionnelles
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convertit une chaîne en camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retarde l'exécution d'une fonction
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
