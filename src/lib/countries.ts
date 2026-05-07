// Curated country list for the Highest Wash Merchant signup + locale flow.
// Each country ties together: dial code (for phone OTP), default currency,
// language, and a sample list of major cities / areas so the UX feels real
// even before we ship a maps autocomplete. Currency rates live in
// src/lib/locale.tsx so the same FX engine drives the whole app.

import type { CurrencyCode, LanguageCode } from "./locale";

export interface SupportedCountry {
  code: string;          // ISO-2
  name: string;
  flag: string;
  dial: string;          // E.164 prefix incl. "+"
  currency: CurrencyCode;
  language: LanguageCode;
  cities: string[];      // major cities for the city dropdown
}

// Order matches the user's requested order.
export const supportedCountries: SupportedCountry[] = [
  { code: "GH", name: "Ghana",         flag: "🇬🇭", dial: "+233", currency: "GHS", language: "en", cities: ["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast", "Tema"] },
  { code: "MA", name: "Morocco",       flag: "🇲🇦", dial: "+212", currency: "MAD", language: "fr", cities: ["Casablanca", "Rabat", "Marrakesh", "Fez", "Tangier", "Agadir"] },
  { code: "QA", name: "Qatar",         flag: "🇶🇦", dial: "+974", currency: "QAR", language: "ar", cities: ["Doha", "Al Wakrah", "Al Khor", "Lusail", "Al Rayyan"] },
  { code: "SA", name: "Saudi Arabia",  flag: "🇸🇦", dial: "+966", currency: "SAR", language: "ar", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"] },
  { code: "EG", name: "Egypt",         flag: "🇪🇬", dial: "+20",  currency: "EGP", language: "ar", cities: ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor"] },
  { code: "MY", name: "Malaysia",      flag: "🇲🇾", dial: "+60",  currency: "MYR", language: "en", cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Shah Alam"] },
  { code: "FI", name: "Finland",       flag: "🇫🇮", dial: "+358", currency: "EUR", language: "en", cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku"] },
  { code: "AE", name: "Dubai (UAE)",   flag: "🇦🇪", dial: "+971", currency: "AED", language: "ar", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah"] },
  { code: "AU", name: "Australia",     flag: "🇦🇺", dial: "+61",  currency: "AUD", language: "en", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"] },
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1",   currency: "USD", language: "en", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco", "Atlanta"] },
  { code: "CA", name: "Canada",        flag: "🇨🇦", dial: "+1",   currency: "CAD", language: "en", cities: ["Toronto", "Vancouver", "Montréal", "Calgary", "Ottawa", "Edmonton"] },
  { code: "PH", name: "Philippines",   flag: "🇵🇭", dial: "+63",  currency: "PHP", language: "en", cities: ["Manila", "Quezon City", "Cebu", "Davao", "Makati"] },
  { code: "KW", name: "Kuwait",        flag: "🇰🇼", dial: "+965", currency: "KWD", language: "ar", cities: ["Kuwait City", "Hawalli", "Salmiya", "Jahra"] },
  { code: "MX", name: "Mexico",        flag: "🇲🇽", dial: "+52",  currency: "MXN", language: "es", cities: ["Mexico City", "Guadalajara", "Monterrey", "Cancún", "Puebla"] },
  { code: "ZA", name: "South Africa",  flag: "🇿🇦", dial: "+27",  currency: "ZAR", language: "en", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"] },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225", currency: "XOF", language: "fr", cities: ["Abidjan", "Yamoussoukro", "Bouaké", "Daloa", "San-Pédro"] },
  { code: "GB", name: "United Kingdom",flag: "🇬🇧", dial: "+44",  currency: "GBP", language: "en", cities: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Leeds"] },
  { code: "CH", name: "Switzerland",   flag: "🇨🇭", dial: "+41",  currency: "CHF", language: "fr", cities: ["Zürich", "Geneva", "Basel", "Bern", "Lausanne"] },
];

export function findCountry(code: string | null | undefined): SupportedCountry | undefined {
  if (!code) return undefined;
  return supportedCountries.find((c) => c.code === code.toUpperCase());
}
