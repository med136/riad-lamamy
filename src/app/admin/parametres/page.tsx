'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Info, Save, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'

type SettingValue = string | number | boolean | null

type SettingItem = {
  id: string
  label: string
  value: SettingValue
  inputType?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'time'
  multiline?: boolean
}

type SettingGroup = {
  title: string
  description?: string
  items: SettingItem[]
}

type BookingSettings = {
  minNights: number
  maxGuests: number
  advanceNoticeHours: number
  allowSameDay: boolean
}

type SettingsState = {
  siteName: string
  siteTagline: string
  siteShortDescription: string
  logoText: string
  logoPreviewUrl: string
  adminLogoUrl: string
  contactEmail: string
  supportEmail: string
  contactPhone: string
  emergencyPhone: string
  whatsappPhone: string
  whatsappMessage: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
  country: string
  mapEmbedUrl: string
  googleMapsLink: string
  googlePlaceId: string
  timezone: string
  locale: string
  defaultLanguage: string
  currency: string
  seoTitle: string
  seoDescription: string
  ogImage: string
  instagram: string
  facebook: string
  pinterest: string
  tiktok: string
  youtube: string
  googleBusinessProfile: string
  emailFromName: string
  emailFromAddress: string
  emailReplyTo: string
  emailReservationCc: string
  checkInTime: string
  checkOutTime: string
  cancellationPolicy: string
  houseRules: string
  childPolicy: string
  petPolicy: string
  smokingPolicy: string
  accessibilityNotes: string
  wifiName: string
  wifiPassword: string
  termsUrl: string
  privacyUrl: string
  cookiePolicyUrl: string
  legalNoticeUrl: string
  businessName: string
  legalEntity: string
  legalRegistration: string
  vatNumber: string
  cityTaxPerPerson: number
  serviceFeePercent: number
  cleaningFee: number
  bookingBufferHours: number
  maxAdvanceMonths: number
  bookingSettings: BookingSettings
  gaId: string
  notificationEnabled: boolean
  maintenanceMode: boolean
  consentBannerEnabled: boolean
  analyticsConsentRequired: boolean
  cookieProvider: string
  newsletterEnabled: boolean
  securityContactEmail: string
  securityAlertsEnabled: boolean
  recaptchaSiteKey: string
  rateLimitEnabled: boolean
  allowedCountries: string
  monitoringEnabled: boolean
  monitoringProvider: string
  uptimeCheckUrl: string
  logRetentionDays: number
}

type SettingRow = {
  key: string
  value: SettingValue
}

const defaultSettings: SettingsState = {
  siteName: 'Riad Lamamy',
  siteTagline: 'Maison d hotes de caractere a Marrakech',
  siteShortDescription: 'Un riad authentique, experience premium et service sur mesure.',
  logoText: 'Riad Lamamy',
  logoPreviewUrl: '',
  adminLogoUrl: '',
  contactEmail: 'contact@riadlamamy.com',
  supportEmail: 'support@riadlamamy.com',
  contactPhone: '+212 5 24 00 00 00',
  emergencyPhone: '+212 6 11 11 11 11',
  whatsappPhone: '+212 6 00 00 00 00',
  whatsappMessage: 'Bonjour, je souhaite reserver un sejour.',
  addressLine1: 'Medina',
  addressLine2: 'Riad Lamamy',
  city: 'Marrakech',
  postalCode: '40000',
  country: 'Maroc',
  mapEmbedUrl: '',
  googleMapsLink: '',
  googlePlaceId: '',
  timezone: 'Africa/Casablanca',
  locale: 'fr-FR',
  defaultLanguage: 'fr',
  currency: 'MAD',
  seoTitle: 'Riad Lamamy | Maison d hotes a Marrakech',
  seoDescription: 'Sejournez dans un riad d exception au coeur de Marrakech.',
  ogImage: '',
  instagram: '',
  facebook: '',
  pinterest: '',
  tiktok: '',
  youtube: '',
  googleBusinessProfile: '',
  emailFromName: 'Riad Lamamy',
  emailFromAddress: 'reservations@riadlamamy.com',
  emailReplyTo: 'contact@riadlamamy.com',
  emailReservationCc: '',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  cancellationPolicy: 'Annulation gratuite jusqu a 7 jours avant l arrivee.',
  houseRules: 'Merci de respecter le calme a partir de 22h.',
  childPolicy: 'Enfants acceptes sous reserve de disponibilite.',
  petPolicy: 'Animaux non acceptes.',
  smokingPolicy: 'Etablissement non fumeur.',
  accessibilityNotes: 'Acces partiel, contactez-nous pour les details.',
  wifiName: 'RiadLamamy-Guest',
  wifiPassword: 'Change-me',
  termsUrl: '',
  privacyUrl: '',
  cookiePolicyUrl: '',
  legalNoticeUrl: '',
  businessName: 'Riad Lamamy SARL',
  legalEntity: 'SARL',
  legalRegistration: 'RC 123456',
  vatNumber: 'MA123456789',
  cityTaxPerPerson: 30,
  serviceFeePercent: 0,
  cleaningFee: 0,
  bookingBufferHours: 4,
  maxAdvanceMonths: 12,
  bookingSettings: {
    minNights: 2,
    maxGuests: 4,
    advanceNoticeHours: 12,
    allowSameDay: false,
  },
  gaId: '',
  notificationEnabled: true,
  maintenanceMode: false,
  consentBannerEnabled: true,
  analyticsConsentRequired: true,
  cookieProvider: 'Internal',
  newsletterEnabled: false,
  securityContactEmail: 'security@riadlamamy.com',
  securityAlertsEnabled: true,
  recaptchaSiteKey: '',
  rateLimitEnabled: true,
  allowedCountries: 'FR,ES,IT,DE,NL,BE,CH',
  monitoringEnabled: false,
  monitoringProvider: 'None',
  uptimeCheckUrl: '',
  logRetentionDays: 30,
}

function buildSettingMap(settings: SettingsState): SettingRow[] {
  return [
    { key: 'site_title', value: settings.siteName },
    { key: 'site_tagline', value: settings.siteTagline },
    { key: 'site_short_description', value: settings.siteShortDescription },
    { key: 'logo_text', value: settings.logoText },
    { key: 'logo_preview_url', value: settings.logoPreviewUrl },
    { key: 'admin_logo_url', value: settings.adminLogoUrl },
    { key: 'contact_email', value: settings.contactEmail },
    { key: 'support_email', value: settings.supportEmail },
    { key: 'contact_phone', value: settings.contactPhone },
    { key: 'emergency_phone', value: settings.emergencyPhone },
    { key: 'whatsapp_phone', value: settings.whatsappPhone },
    { key: 'whatsapp_message', value: settings.whatsappMessage },
    { key: 'address_line_1', value: settings.addressLine1 },
    { key: 'address_line_2', value: settings.addressLine2 },
    { key: 'address_city', value: settings.city },
    { key: 'address_postal_code', value: settings.postalCode },
    { key: 'address_country', value: settings.country },
    { key: 'map_embed_url', value: settings.mapEmbedUrl },
    { key: 'google_maps_link', value: settings.googleMapsLink },
    { key: 'google_place_id', value: settings.googlePlaceId },
    { key: 'timezone', value: settings.timezone },
    { key: 'locale', value: settings.locale },
    { key: 'default_language', value: settings.defaultLanguage },
    { key: 'currency', value: settings.currency },
    { key: 'seo_title', value: settings.seoTitle },
    { key: 'seo_description', value: settings.seoDescription },
    { key: 'og_image', value: settings.ogImage },
    { key: 'social_instagram', value: settings.instagram },
    { key: 'social_facebook', value: settings.facebook },
    { key: 'social_pinterest', value: settings.pinterest },
    { key: 'social_tiktok', value: settings.tiktok },
    { key: 'social_youtube', value: settings.youtube },
    { key: 'social_google_business', value: settings.googleBusinessProfile },
    { key: 'email_from_name', value: settings.emailFromName },
    { key: 'email_from_address', value: settings.emailFromAddress },
    { key: 'email_reply_to', value: settings.emailReplyTo },
    { key: 'email_reservation_cc', value: settings.emailReservationCc },
    { key: 'check_in_time', value: settings.checkInTime },
    { key: 'check_out_time', value: settings.checkOutTime },
    { key: 'cancellation_policy', value: settings.cancellationPolicy },
    { key: 'house_rules', value: settings.houseRules },
    { key: 'child_policy', value: settings.childPolicy },
    { key: 'pet_policy', value: settings.petPolicy },
    { key: 'smoking_policy', value: settings.smokingPolicy },
    { key: 'accessibility_notes', value: settings.accessibilityNotes },
    { key: 'wifi_name', value: settings.wifiName },
    { key: 'wifi_password', value: settings.wifiPassword },
    { key: 'terms_url', value: settings.termsUrl },
    { key: 'privacy_url', value: settings.privacyUrl },
    { key: 'cookie_policy_url', value: settings.cookiePolicyUrl },
    { key: 'legal_notice_url', value: settings.legalNoticeUrl },
    { key: 'business_name', value: settings.businessName },
    { key: 'legal_entity', value: settings.legalEntity },
    { key: 'legal_registration', value: settings.legalRegistration },
    { key: 'vat_number', value: settings.vatNumber },
    { key: 'city_tax_per_person', value: settings.cityTaxPerPerson },
    { key: 'service_fee_percent', value: settings.serviceFeePercent },
    { key: 'cleaning_fee', value: settings.cleaningFee },
    { key: 'booking_buffer_hours', value: settings.bookingBufferHours },
    { key: 'max_advance_months', value: settings.maxAdvanceMonths },
    { key: 'booking_settings', value: JSON.stringify(settings.bookingSettings) },
    { key: 'ga_id', value: settings.gaId },
    { key: 'notification_enabled', value: settings.notificationEnabled },
    { key: 'maintenance_mode', value: settings.maintenanceMode },
    { key: 'consent_banner_enabled', value: settings.consentBannerEnabled },
    { key: 'analytics_consent_required', value: settings.analyticsConsentRequired },
    { key: 'cookie_provider', value: settings.cookieProvider },
    { key: 'newsletter_enabled', value: settings.newsletterEnabled },
    { key: 'security_contact_email', value: settings.securityContactEmail },
    { key: 'security_alerts_enabled', value: settings.securityAlertsEnabled },
    { key: 'recaptcha_site_key', value: settings.recaptchaSiteKey },
    { key: 'rate_limit_enabled', value: settings.rateLimitEnabled },
    { key: 'allowed_countries', value: settings.allowedCountries },
    { key: 'monitoring_enabled', value: settings.monitoringEnabled },
    { key: 'monitoring_provider', value: settings.monitoringProvider },
    { key: 'uptime_check_url', value: settings.uptimeCheckUrl },
    { key: 'log_retention_days', value: settings.logRetentionDays },
  ]
}

function parseNumberValue(value: SettingValue, fallback: number) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return fallback
}

function mergeSettings(state: SettingsState, list: SettingRow[]) {
  const map = new Map(list.map((entry) => [entry.key, entry.value]))
  const bookingSettingsValue = map.get('booking_settings')
  let bookingSettings = state.bookingSettings
  if (typeof bookingSettingsValue === 'string') {
    try {
      bookingSettings = JSON.parse(bookingSettingsValue) as BookingSettings
    } catch {
      bookingSettings = state.bookingSettings
    }
  }

  return {
    ...state,
    siteName: (map.get('site_title') as string) || state.siteName,
    siteTagline: (map.get('site_tagline') as string) || state.siteTagline,
    siteShortDescription:
      (map.get('site_short_description') as string) || state.siteShortDescription,
    logoText: (map.get('logo_text') as string) || state.logoText,
    logoPreviewUrl: (map.get('logo_preview_url') as string) || state.logoPreviewUrl,
    adminLogoUrl: (map.get('admin_logo_url') as string) || state.adminLogoUrl,
    contactEmail: (map.get('contact_email') as string) || state.contactEmail,
    supportEmail: (map.get('support_email') as string) || state.supportEmail,
    contactPhone: (map.get('contact_phone') as string) || state.contactPhone,
    emergencyPhone: (map.get('emergency_phone') as string) || state.emergencyPhone,
    whatsappPhone: (map.get('whatsapp_phone') as string) || state.whatsappPhone,
    whatsappMessage: (map.get('whatsapp_message') as string) || state.whatsappMessage,
    addressLine1: (map.get('address_line_1') as string) || state.addressLine1,
    addressLine2: (map.get('address_line_2') as string) || state.addressLine2,
    city: (map.get('address_city') as string) || state.city,
    postalCode: (map.get('address_postal_code') as string) || state.postalCode,
    country: (map.get('address_country') as string) || state.country,
    mapEmbedUrl: (map.get('map_embed_url') as string) || state.mapEmbedUrl,
    googleMapsLink: (map.get('google_maps_link') as string) || state.googleMapsLink,
    googlePlaceId: (map.get('google_place_id') as string) || state.googlePlaceId,
    timezone: (map.get('timezone') as string) || state.timezone,
    locale: (map.get('locale') as string) || state.locale,
    defaultLanguage: (map.get('default_language') as string) || state.defaultLanguage,
    currency: (map.get('currency') as string) || state.currency,
    seoTitle: (map.get('seo_title') as string) || state.seoTitle,
    seoDescription: (map.get('seo_description') as string) || state.seoDescription,
    ogImage: (map.get('og_image') as string) || state.ogImage,
    instagram: (map.get('social_instagram') as string) || state.instagram,
    facebook: (map.get('social_facebook') as string) || state.facebook,
    pinterest: (map.get('social_pinterest') as string) || state.pinterest,
    tiktok: (map.get('social_tiktok') as string) || state.tiktok,
    youtube: (map.get('social_youtube') as string) || state.youtube,
    googleBusinessProfile:
      (map.get('social_google_business') as string) || state.googleBusinessProfile,
    emailFromName: (map.get('email_from_name') as string) || state.emailFromName,
    emailFromAddress: (map.get('email_from_address') as string) || state.emailFromAddress,
    emailReplyTo: (map.get('email_reply_to') as string) || state.emailReplyTo,
    emailReservationCc:
      (map.get('email_reservation_cc') as string) || state.emailReservationCc,
    checkInTime: (map.get('check_in_time') as string) || state.checkInTime,
    checkOutTime: (map.get('check_out_time') as string) || state.checkOutTime,
    cancellationPolicy: (map.get('cancellation_policy') as string) || state.cancellationPolicy,
    houseRules: (map.get('house_rules') as string) || state.houseRules,
    childPolicy: (map.get('child_policy') as string) || state.childPolicy,
    petPolicy: (map.get('pet_policy') as string) || state.petPolicy,
    smokingPolicy: (map.get('smoking_policy') as string) || state.smokingPolicy,
    accessibilityNotes: (map.get('accessibility_notes') as string) || state.accessibilityNotes,
    wifiName: (map.get('wifi_name') as string) || state.wifiName,
    wifiPassword: (map.get('wifi_password') as string) || state.wifiPassword,
    termsUrl: (map.get('terms_url') as string) || state.termsUrl,
    privacyUrl: (map.get('privacy_url') as string) || state.privacyUrl,
    cookiePolicyUrl: (map.get('cookie_policy_url') as string) || state.cookiePolicyUrl,
    legalNoticeUrl: (map.get('legal_notice_url') as string) || state.legalNoticeUrl,
    businessName: (map.get('business_name') as string) || state.businessName,
    legalEntity: (map.get('legal_entity') as string) || state.legalEntity,
    legalRegistration: (map.get('legal_registration') as string) || state.legalRegistration,
    vatNumber: (map.get('vat_number') as string) || state.vatNumber,
    cityTaxPerPerson: parseNumberValue(map.get('city_tax_per_person') ?? null, state.cityTaxPerPerson),
    serviceFeePercent: parseNumberValue(map.get('service_fee_percent') ?? null, state.serviceFeePercent),
    cleaningFee: parseNumberValue(map.get('cleaning_fee') ?? null, state.cleaningFee),
    bookingBufferHours: parseNumberValue(map.get('booking_buffer_hours') ?? null, state.bookingBufferHours),
    maxAdvanceMonths: parseNumberValue(map.get('max_advance_months') ?? null, state.maxAdvanceMonths),
    bookingSettings,
    gaId: (map.get('ga_id') as string) || state.gaId,
    notificationEnabled:
      typeof map.get('notification_enabled') === 'boolean'
        ? (map.get('notification_enabled') as boolean)
        : state.notificationEnabled,
    maintenanceMode:
      typeof map.get('maintenance_mode') === 'boolean'
        ? (map.get('maintenance_mode') as boolean)
        : state.maintenanceMode,
    consentBannerEnabled:
      typeof map.get('consent_banner_enabled') === 'boolean'
        ? (map.get('consent_banner_enabled') as boolean)
        : state.consentBannerEnabled,
    analyticsConsentRequired:
      typeof map.get('analytics_consent_required') === 'boolean'
        ? (map.get('analytics_consent_required') as boolean)
        : state.analyticsConsentRequired,
    cookieProvider: (map.get('cookie_provider') as string) || state.cookieProvider,
    newsletterEnabled:
      typeof map.get('newsletter_enabled') === 'boolean'
        ? (map.get('newsletter_enabled') as boolean)
        : state.newsletterEnabled,
    securityContactEmail: (map.get('security_contact_email') as string) || state.securityContactEmail,
    securityAlertsEnabled:
      typeof map.get('security_alerts_enabled') === 'boolean'
        ? (map.get('security_alerts_enabled') as boolean)
        : state.securityAlertsEnabled,
    recaptchaSiteKey: (map.get('recaptcha_site_key') as string) || state.recaptchaSiteKey,
    rateLimitEnabled:
      typeof map.get('rate_limit_enabled') === 'boolean'
        ? (map.get('rate_limit_enabled') as boolean)
        : state.rateLimitEnabled,
    allowedCountries: (map.get('allowed_countries') as string) || state.allowedCountries,
    monitoringEnabled:
      typeof map.get('monitoring_enabled') === 'boolean'
        ? (map.get('monitoring_enabled') as boolean)
        : state.monitoringEnabled,
    monitoringProvider: (map.get('monitoring_provider') as string) || state.monitoringProvider,
    uptimeCheckUrl: (map.get('uptime_check_url') as string) || state.uptimeCheckUrl,
    logRetentionDays: parseNumberValue(map.get('log_retention_days') ?? null, state.logRetentionDays),
  }
}

function SectionCard({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description ? <p className="text-xs text-gray-500 mt-1">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

type UploadFieldProps = {
  title: string
  description?: string
  endpoint: string
  value: string
  onChange: (nextUrl: string) => void
}

function UploadField({ title, description, endpoint, value, onChange }: UploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Erreur upload')
      }

      const nextUrl = data?.publicUrl || data?.url
      if (!nextUrl) {
        throw new Error('URL manquante')
      }

      onChange(nextUrl)
      toast.success('Upload reussi')
    } catch (err: any) {
      const message = err?.message || 'Erreur upload'
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {description ? <p className="text-xs text-gray-500">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
          <UploadCloud size={14} />
          {uploading ? 'Upload...' : 'Choisir un fichier'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        <input
          className="flex-1 min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="URL publique"
        />
      </div>
      {value ? (
        <div className="relative h-20 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <img src={value} alt={title} className="h-full w-full object-contain" loading="lazy" />
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

type ToggleProps = {
  label: string
  value: boolean
  onChange: (next: boolean) => void
}

function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600"
      />
    </label>
  )
}
export default function AdminParametersPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  type AdminTab = 'general' | 'reservation' | 'seo' | 'legal' | 'ops'
  const [activeTab, setActiveTab] = useState<AdminTab>('general')

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Echec du chargement des parametres')
      }
      const data = (await response.json()) as { data?: SettingRow[] } | Record<string, SettingValue>
      if (Array.isArray((data as { data?: SettingRow[] }).data)) {
        setSettings((prev) => mergeSettings(prev, (data as { data?: SettingRow[] }).data ?? []))
      } else if (data && typeof data === 'object') {
        const rows = Object.entries(data).map(([key, value]) => ({ key, value }))
        setSettings((prev) => mergeSettings(prev, rows))
      }
    } catch (err: any) {
      setSaveMessage('Impossible de charger les parametres.')
      toast.error(err?.message || 'Impossible de charger les parametres')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const tabGroups = useMemo<Record<AdminTab, SettingGroup[]>>(() => {
    return {
      general: [
        {
          title: 'Identite & contact',
          description: 'Branding, contacts et coordonnees principales.',
          items: [
            { id: 'siteName', label: 'Nom du site', value: settings.siteName },
            { id: 'logoText', label: 'Texte du logo', value: settings.logoText },
            { id: 'siteTagline', label: 'Tagline', value: settings.siteTagline },
            {
              id: 'siteShortDescription',
              label: 'Description courte',
              value: settings.siteShortDescription,
              multiline: true,
            },
            { id: 'contactEmail', label: 'Email principal', value: settings.contactEmail, inputType: 'email' },
            { id: 'supportEmail', label: 'Email support', value: settings.supportEmail, inputType: 'email' },
            { id: 'contactPhone', label: 'Telephone principal', value: settings.contactPhone, inputType: 'tel' },
            { id: 'emergencyPhone', label: 'Telephone urgence', value: settings.emergencyPhone, inputType: 'tel' },
            { id: 'whatsappPhone', label: 'WhatsApp', value: settings.whatsappPhone, inputType: 'tel' },
            { id: 'whatsappMessage', label: 'Message WhatsApp', value: settings.whatsappMessage },
            { id: 'addressLine1', label: 'Adresse ligne 1', value: settings.addressLine1 },
            { id: 'addressLine2', label: 'Adresse ligne 2', value: settings.addressLine2 },
            { id: 'city', label: 'Ville', value: settings.city },
            { id: 'postalCode', label: 'Code postal', value: settings.postalCode },
            { id: 'country', label: 'Pays', value: settings.country },
            { id: 'mapEmbedUrl', label: 'URL carte (embed)', value: settings.mapEmbedUrl, inputType: 'url' },
            { id: 'googleMapsLink', label: 'Lien Google Maps', value: settings.googleMapsLink, inputType: 'url' },
            { id: 'timezone', label: 'Fuseau horaire', value: settings.timezone },
            { id: 'locale', label: 'Locale', value: settings.locale },
            { id: 'defaultLanguage', label: 'Langue par defaut', value: settings.defaultLanguage },
            { id: 'currency', label: 'Devise', value: settings.currency },
          ],
        },
      ],
      reservation: [
        {
          title: 'Reservation & tarifs',
          description: 'Regles de reservation et frais.',
          items: [
            { id: 'checkInTime', label: 'Heure check-in', value: settings.checkInTime, inputType: 'time' },
            { id: 'checkOutTime', label: 'Heure check-out', value: settings.checkOutTime, inputType: 'time' },
            {
              id: 'minNights',
              label: 'Minimum de nuits',
              value: settings.bookingSettings.minNights,
              inputType: 'number',
            },
            {
              id: 'maxGuests',
              label: 'Capacite max',
              value: settings.bookingSettings.maxGuests,
              inputType: 'number',
            },
            {
              id: 'advanceNoticeHours',
              label: 'Preavis (heures)',
              value: settings.bookingSettings.advanceNoticeHours,
              inputType: 'number',
            },
            {
              id: 'bookingBufferHours',
              label: 'Buffer nettoyage (heures)',
              value: settings.bookingBufferHours,
              inputType: 'number',
            },
            {
              id: 'maxAdvanceMonths',
              label: 'Reservation avancee (mois)',
              value: settings.maxAdvanceMonths,
              inputType: 'number',
            },
            {
              id: 'cityTaxPerPerson',
              label: 'Taxe sejour par personne',
              value: settings.cityTaxPerPerson,
              inputType: 'number',
            },
            {
              id: 'serviceFeePercent',
              label: 'Frais service (%)',
              value: settings.serviceFeePercent,
              inputType: 'number',
            },
            {
              id: 'cleaningFee',
              label: 'Frais menage',
              value: settings.cleaningFee,
              inputType: 'number',
            },
          ],
        },
      ],
      seo: [
        {
          title: 'SEO & social',
          description: 'Referencement, OpenGraph et reseaux sociaux.',
          items: [
            { id: 'seoTitle', label: 'Titre SEO', value: settings.seoTitle },
            {
              id: 'seoDescription',
              label: 'Description SEO',
              value: settings.seoDescription,
              multiline: true,
            },
            { id: 'ogImage', label: 'Image OpenGraph', value: settings.ogImage, inputType: 'url' },
            { id: 'googlePlaceId', label: 'Google Place ID', value: settings.googlePlaceId },
            { id: 'instagram', label: 'Instagram', value: settings.instagram, inputType: 'url' },
            { id: 'facebook', label: 'Facebook', value: settings.facebook, inputType: 'url' },
            { id: 'pinterest', label: 'Pinterest', value: settings.pinterest, inputType: 'url' },
            { id: 'tiktok', label: 'TikTok', value: settings.tiktok, inputType: 'url' },
            { id: 'youtube', label: 'YouTube', value: settings.youtube, inputType: 'url' },
            {
              id: 'googleBusinessProfile',
              label: 'Google Business Profile',
              value: settings.googleBusinessProfile,
              inputType: 'url',
            },
          ],
        },
      ],
      legal: [
        {
          title: 'Legal & politiques',
          description: 'Informations legales et policies.',
          items: [
            { id: 'businessName', label: 'Raison sociale', value: settings.businessName },
            { id: 'legalEntity', label: 'Forme juridique', value: settings.legalEntity },
            { id: 'legalRegistration', label: 'Immatriculation', value: settings.legalRegistration },
            { id: 'vatNumber', label: 'Numero TVA', value: settings.vatNumber },
            { id: 'legalNoticeUrl', label: 'Lien mentions legales', value: settings.legalNoticeUrl, inputType: 'url' },
            { id: 'termsUrl', label: 'Lien CGV', value: settings.termsUrl, inputType: 'url' },
            { id: 'privacyUrl', label: 'Lien politique de confidentialite', value: settings.privacyUrl, inputType: 'url' },
            { id: 'cookiePolicyUrl', label: 'Lien politique cookies', value: settings.cookiePolicyUrl, inputType: 'url' },
            {
              id: 'cancellationPolicy',
              label: 'Politique annulation',
              value: settings.cancellationPolicy,
              multiline: true,
            },
            { id: 'houseRules', label: 'Reglement interieur', value: settings.houseRules, multiline: true },
            { id: 'childPolicy', label: 'Politique enfants', value: settings.childPolicy, multiline: true },
            { id: 'petPolicy', label: 'Politique animaux', value: settings.petPolicy, multiline: true },
            { id: 'smokingPolicy', label: 'Politique tabac', value: settings.smokingPolicy, multiline: true },
            {
              id: 'accessibilityNotes',
              label: 'Accessibilite',
              value: settings.accessibilityNotes,
              multiline: true,
            },
            { id: 'wifiName', label: 'Nom WiFi', value: settings.wifiName },
            { id: 'wifiPassword', label: 'Mot de passe WiFi', value: settings.wifiPassword },
          ],
        },
      ],
      ops: [
        {
          title: 'Operations & integrations',
          description: 'Emails, securite, monitoring et analytics.',
          items: [
            { id: 'emailFromName', label: 'Nom expediteur', value: settings.emailFromName },
            { id: 'emailFromAddress', label: 'Adresse expediteur', value: settings.emailFromAddress, inputType: 'email' },
            { id: 'emailReplyTo', label: 'Adresse reponse', value: settings.emailReplyTo, inputType: 'email' },
            { id: 'emailReservationCc', label: 'CC reservations', value: settings.emailReservationCc, inputType: 'email' },
            { id: 'gaId', label: 'Google Analytics ID', value: settings.gaId },
            { id: 'cookieProvider', label: 'Fournisseur cookie', value: settings.cookieProvider },
            {
              id: 'securityContactEmail',
              label: 'Email securite',
              value: settings.securityContactEmail,
              inputType: 'email',
            },
            {
              id: 'recaptchaSiteKey',
              label: 'reCAPTCHA site key',
              value: settings.recaptchaSiteKey,
            },
            {
              id: 'allowedCountries',
              label: 'Pays autorises (ISO)',
              value: settings.allowedCountries,
            },
            {
              id: 'monitoringProvider',
              label: 'Provider monitoring',
              value: settings.monitoringProvider,
            },
            { id: 'uptimeCheckUrl', label: 'URL uptime', value: settings.uptimeCheckUrl, inputType: 'url' },
            {
              id: 'logRetentionDays',
              label: 'Retention logs (jours)',
              value: settings.logRetentionDays,
              inputType: 'number',
            },
          ],
        },
      ],
    }
  }, [settings])

  const groupedSettings = useMemo<SettingGroup[]>(() => tabGroups[activeTab], [tabGroups, activeTab])

  const handleChange = (id: string, value: SettingValue) => {
    setSettings((prev) => {
      if (
        id === 'minNights' ||
        id === 'maxGuests' ||
        id === 'advanceNoticeHours' ||
        id === 'cityTaxPerPerson' ||
        id === 'serviceFeePercent' ||
        id === 'cleaningFee' ||
        id === 'bookingBufferHours' ||
        id === 'maxAdvanceMonths' ||
        id === 'logRetentionDays'
      ) {
        if (id === 'minNights' || id === 'maxGuests' || id === 'advanceNoticeHours') {
          return {
            ...prev,
            bookingSettings: {
              ...prev.bookingSettings,
              [id]: Number(value),
            },
          }
        }
        return { ...prev, [id]: Number(value) } as SettingsState
      }
      return { ...prev, [id]: value } as SettingsState
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const payload = buildSettingMap(settings).reduce<Record<string, SettingValue>>((acc, item) => {
        acc[item.key] = item.value
        return acc
      }, {})
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Sauvegarde impossible')
      }
      setSaveMessage('Parametres enregistres.')
      toast.success('Parametres enregistres')
    } catch (err: any) {
      const message = err?.message || 'Erreur lors de la sauvegarde'
      setSaveMessage(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8">
        <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Control center</p>
              <h1 className="text-3xl font-semibold text-gray-900">Parametres globaux</h1>
              <p className="text-sm text-gray-500">
                Moins de sections, plus de clarté. Les essentiels d abord.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs text-gray-600">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Sync auto active
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-amber-200/60 bg-white/80 p-2 shadow-sm">
          {[
            { key: 'general', label: 'General' },
            { key: 'reservation', label: 'Reservation' },
            { key: 'seo', label: 'SEO & social' },
            { key: 'legal', label: 'Legal' },
            { key: 'ops', label: 'Operations' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-gray-900 text-white shadow'
                  : 'text-gray-600 hover:bg-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {saveMessage ? (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {saveMessage}
          </div>
        ) : null}

        <div className="mt-8 space-y-6">
          {activeTab === 'general' ? (
            <SectionCard title="Logos" description="Upload et URLs pour les logos public et admin.">
              <div className="grid gap-4 lg:grid-cols-2">
                <UploadField
                  title="Logo public"
                  description="Affiche dans la navigation et les emails"
                  endpoint="/api/upload/logo"
                  value={settings.logoPreviewUrl}
                  onChange={(url) => handleChange('logoPreviewUrl', url)}
                />
                <UploadField
                  title="Logo admin"
                  description="Affiche dans le back-office"
                  endpoint="/api/upload/admin-logo"
                  value={settings.adminLogoUrl}
                  onChange={(url) => handleChange('adminLogoUrl', url)}
                />
              </div>
            </SectionCard>
          ) : null}

          {groupedSettings.map((group) => (
            <SectionCard key={group.title} title={group.title} description={group.description}>
              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map((item) => {
                  const inputType = item.inputType || 'text'
                  const displayValue =
                    item.value === null || item.value === undefined
                      ? ''
                      : typeof item.value === 'boolean'
                        ? item.value
                          ? 'true'
                          : 'false'
                        : item.value
                  if (item.multiline) {
                    return (
                      <label key={item.id} className="space-y-2 text-xs text-gray-600 md:col-span-2">
                        <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                        <textarea
                          className="h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm"
                          value={displayValue}
                          onChange={(event) => handleChange(item.id, event.target.value)}
                        />
                      </label>
                    )
                  }

                  return (
                    <label key={item.id} className="space-y-2 text-xs text-gray-600">
                      <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                      <input
                        type={inputType}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm"
                        value={displayValue}
                        onChange={(event) => handleChange(item.id, event.target.value)}
                      />
                    </label>
                  )
                })}
              </div>
            </SectionCard>
          ))}

          <SectionCard title="Options rapides" description="Toggles essentiels au quotidien." className="bg-white">
            <div className="grid gap-4 lg:grid-cols-2">
              <Toggle
                label="Autoriser les reservations le jour meme"
                value={settings.bookingSettings.allowSameDay}
                onChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    bookingSettings: { ...prev.bookingSettings, allowSameDay: value },
                  }))
                }
              />
              <Toggle
                label="Banniere cookies active"
                value={settings.consentBannerEnabled}
                onChange={(value) => handleChange('consentBannerEnabled', value)}
              />
              <Toggle
                label="Consentement requis pour analytics"
                value={settings.analyticsConsentRequired}
                onChange={(value) => handleChange('analyticsConsentRequired', value)}
              />
              <Toggle
                label="Inscription newsletter active"
                value={settings.newsletterEnabled}
                onChange={(value) => handleChange('newsletterEnabled', value)}
              />
              <Toggle
                label="Rate limiting actif"
                value={settings.rateLimitEnabled}
                onChange={(value) => handleChange('rateLimitEnabled', value)}
              />
              <Toggle
                label="Alertes securite actives"
                value={settings.securityAlertsEnabled}
                onChange={(value) => handleChange('securityAlertsEnabled', value)}
              />
              <Toggle
                label="Monitoring actif"
                value={settings.monitoringEnabled}
                onChange={(value) => handleChange('monitoringEnabled', value)}
              />
              <Toggle
                label="Notifications email actives"
                value={settings.notificationEnabled}
                onChange={(value) => handleChange('notificationEnabled', value)}
              />
              <Toggle
                label="Mode maintenance"
                value={settings.maintenanceMode}
                onChange={(value) => handleChange('maintenanceMode', value)}
              />
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
            <div className="flex items-start gap-2">
              <Info size={16} className="mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Checklist rapide</p>
                <ul className="mt-2 space-y-1 text-xs text-amber-800">
                  <li>- Mettre a jour le titre SEO et la description</li>
                  <li>- Verifier les horaires check-in / check-out</li>
                  <li>- Ajouter les liens reseaux sociaux si actifs</li>
                </ul>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
              Chargement...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
