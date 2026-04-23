import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Mock currency table — rates are vs USD baseline. In production these would
// hydrate from a live FX API. They refresh every ~60s with tiny jitter so the
// UI feels alive.
export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD"
  | "INR" | "AED" | "SGD" | "BRL" | "MXN" | "ZAR"
  | "GHS" | "NGN" | "KES" | "CNY";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number;     // 1 USD = rate * currency
  decimals: number;
}

export const currencies: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$",   rate: 1,       decimals: 2 },
  EUR: { code: "EUR", symbol: "€",   rate: 0.92,    decimals: 2 },
  GBP: { code: "GBP", symbol: "£",   rate: 0.79,    decimals: 2 },
  JPY: { code: "JPY", symbol: "¥",   rate: 154.2,   decimals: 0 },
  AUD: { code: "AUD", symbol: "A$",  rate: 1.52,    decimals: 2 },
  CAD: { code: "CAD", symbol: "C$",  rate: 1.36,    decimals: 2 },
  INR: { code: "INR", symbol: "₹",   rate: 83.4,    decimals: 0 },
  AED: { code: "AED", symbol: "AED ",rate: 3.67,    decimals: 2 },
  SGD: { code: "SGD", symbol: "S$",  rate: 1.34,    decimals: 2 },
  BRL: { code: "BRL", symbol: "R$",  rate: 5.12,    decimals: 2 },
  MXN: { code: "MXN", symbol: "Mex$",rate: 17.1,    decimals: 0 },
  ZAR: { code: "ZAR", symbol: "R",   rate: 18.4,    decimals: 0 },
  GHS: { code: "GHS", symbol: "₵",   rate: 14.8,    decimals: 0 },
  NGN: { code: "NGN", symbol: "₦",   rate: 1620,    decimals: 0 },
  KES: { code: "KES", symbol: "KSh ",rate: 130,     decimals: 0 },
  CNY: { code: "CNY", symbol: "¥",   rate: 7.24,    decimals: 0 },
};

export const languages = ["en", "es", "fr", "ar", "pt", "hi", "zh", "ja"] as const;
export type LanguageCode = (typeof languages)[number];

export const languageNames: Record<LanguageCode, string> = {
  en: "English", es: "Español", fr: "Français", ar: "العربية",
  pt: "Português", hi: "हिन्दी", zh: "中文", ja: "日本語",
};

// Country → default currency + language
export interface CountryProfile {
  code: string;
  name: string;
  flag: string;
  currency: CurrencyCode;
  language: LanguageCode;
}

export const countries: CountryProfile[] = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", language: "en" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", language: "en" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", language: "en" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", language: "fr" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", language: "es" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", language: "ja" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", language: "en" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", language: "en" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", language: "hi" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", language: "ar" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", language: "en" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", language: "pt" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "MXN", language: "es" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", language: "en" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS", language: "en" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN", language: "en" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES", language: "en" },
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY", language: "zh" },
];

// Tiny i18n dictionary — only the most-used UI strings. Everything else
// falls back to English. Keeps the prototype lightweight.
type Dict = Record<string, string>;
const i18n: Record<LanguageCode, Dict> = {
  en: {
    welcomeBack: "Welcome back",
    todaysEarnings: "Today's earnings",
    online: "Online",
    offline: "Offline",
    pending: "Pending",
    active: "Active",
    doneToday: "Done today",
    orders: "Orders",
    earnings: "Earnings",
    payouts: "Payouts",
    staff: "Staff",
    chat: "Chat",
    profile: "Profile",
    home: "Home",
    accept: "Accept",
    decline: "Decline",
    detectingLocation: "Detecting your location…",
  },
  es: {
    welcomeBack: "Bienvenido",
    todaysEarnings: "Ganancias de hoy",
    online: "En línea",
    offline: "Desconectado",
    pending: "Pendientes",
    active: "Activos",
    doneToday: "Hecho hoy",
    orders: "Pedidos",
    earnings: "Ganancias",
    payouts: "Pagos",
    staff: "Equipo",
    chat: "Chat",
    profile: "Perfil",
    home: "Inicio",
    accept: "Aceptar",
    decline: "Rechazar",
    detectingLocation: "Detectando tu ubicación…",
  },
  fr: {
    welcomeBack: "Bon retour",
    todaysEarnings: "Gains du jour",
    online: "En ligne",
    offline: "Hors ligne",
    pending: "En attente",
    active: "Actifs",
    doneToday: "Faits aujourd'hui",
    orders: "Commandes",
    earnings: "Gains",
    payouts: "Paiements",
    staff: "Équipe",
    chat: "Chat",
    profile: "Profil",
    home: "Accueil",
    accept: "Accepter",
    decline: "Refuser",
    detectingLocation: "Détection de votre localisation…",
  },
  ar: {
    welcomeBack: "مرحبًا بعودتك",
    todaysEarnings: "أرباح اليوم",
    online: "متصل",
    offline: "غير متصل",
    pending: "قيد الانتظار",
    active: "نشط",
    doneToday: "تم اليوم",
    orders: "الطلبات",
    earnings: "الأرباح",
    payouts: "المدفوعات",
    staff: "الفريق",
    chat: "الدردشة",
    profile: "الملف",
    home: "الرئيسية",
    accept: "قبول",
    decline: "رفض",
    detectingLocation: "جارٍ تحديد موقعك…",
  },
  pt: {
    welcomeBack: "Bem-vindo de volta",
    todaysEarnings: "Ganhos de hoje",
    online: "Online",
    offline: "Offline",
    pending: "Pendentes",
    active: "Ativos",
    doneToday: "Feitos hoje",
    orders: "Pedidos",
    earnings: "Ganhos",
    payouts: "Pagamentos",
    staff: "Equipe",
    chat: "Chat",
    profile: "Perfil",
    home: "Início",
    accept: "Aceitar",
    decline: "Recusar",
    detectingLocation: "Detectando sua localização…",
  },
  hi: {
    welcomeBack: "वापसी पर स्वागत है",
    todaysEarnings: "आज की कमाई",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    pending: "लंबित",
    active: "सक्रिय",
    doneToday: "आज पूरे",
    orders: "ऑर्डर",
    earnings: "कमाई",
    payouts: "भुगतान",
    staff: "टीम",
    chat: "चैट",
    profile: "प्रोफ़ाइल",
    home: "होम",
    accept: "स्वीकार",
    decline: "अस्वीकार",
    detectingLocation: "आपका स्थान पता लगा रहे हैं…",
  },
  zh: {
    welcomeBack: "欢迎回来",
    todaysEarnings: "今日收入",
    online: "在线",
    offline: "离线",
    pending: "待处理",
    active: "进行中",
    doneToday: "今日完成",
    orders: "订单",
    earnings: "收入",
    payouts: "提现",
    staff: "员工",
    chat: "消息",
    profile: "我的",
    home: "首页",
    accept: "接受",
    decline: "拒绝",
    detectingLocation: "正在检测您的位置…",
  },
  ja: {
    welcomeBack: "おかえりなさい",
    todaysEarnings: "本日の売上",
    online: "オンライン",
    offline: "オフライン",
    pending: "保留中",
    active: "進行中",
    doneToday: "本日完了",
    orders: "注文",
    earnings: "売上",
    payouts: "振込",
    staff: "スタッフ",
    chat: "チャット",
    profile: "プロフィール",
    home: "ホーム",
    accept: "承諾",
    decline: "辞退",
    detectingLocation: "位置情報を取得中…",
  },
};

interface LocaleState {
  country: CountryProfile;
  currency: Currency;
  language: LanguageCode;
  setCountry: (code: string) => void;
  setCurrency: (code: CurrencyCode) => void;
  setLanguage: (code: LanguageCode) => void;
  format: (usd: number) => string;     // formats a USD-base number into local currency
  fx: number;                           // current rate (1 USD = fx local)
  detected: boolean;                    // whether IP detection has run
  t: (key: string) => string;           // translate
}

const Ctx = createContext<LocaleState | null>(null);

const STORAGE_KEY = "hw-locale-v1";

interface Stored {
  countryCode: string;
  currency: CurrencyCode;
  language: LanguageCode;
}

// Mock IP geolocation. In production, hit ipapi.co or cloudflare's cf-ipcountry.
// For demo we randomly pick a non-US country so the auto-switch is visible.
async function detectCountry(): Promise<CountryProfile> {
  await new Promise((r) => setTimeout(r, 600));
  const pool = countries.filter((c) => c.code !== "US");
  return pool[Math.floor(Math.random() * pool.length)];
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryProfile>(countries[0]);
  const [currency, setCurrencyState] = useState<Currency>(currencies.USD);
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [detected, setDetected] = useState(false);
  const [fxJitter, setFxJitter] = useState(0);

  // Hydrate from storage or auto-detect
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        const c = countries.find((x) => x.code === s.countryCode);
        if (c) {
          setCountryState(c);
          setCurrencyState(currencies[s.currency] ?? currencies[c.currency]);
          setLanguageState(s.language);
          setDetected(true);
          return;
        }
      }
    } catch { /* noop */ }

    let mounted = true;
    detectCountry().then((c) => {
      if (!mounted) return;
      setCountryState(c);
      setCurrencyState(currencies[c.currency]);
      setLanguageState(c.language);
      setDetected(true);
    });
    return () => { mounted = false; };
  }, []);

  // Persist
  useEffect(() => {
    if (!detected) return;
    const data: Stored = {
      countryCode: country.code,
      currency: currency.code,
      language,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* noop */ }
  }, [country.code, currency.code, language, detected]);

  // Mock live FX jitter (±0.4%) every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setFxJitter((Math.random() - 0.5) * 0.008);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // RTL handling
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const fx = currency.rate * (1 + fxJitter);

  const format = (usd: number) => {
    const local = usd * fx;
    const sym = currency.symbol;
    const rounded = currency.decimals === 0
      ? Math.round(local).toLocaleString()
      : local.toLocaleString(undefined, { minimumFractionDigits: currency.decimals, maximumFractionDigits: currency.decimals });
    return `${sym}${rounded}`;
  };

  const t = (key: string) => i18n[language]?.[key] ?? i18n.en[key] ?? key;

  const setCountry = (code: string) => {
    const c = countries.find((x) => x.code === code);
    if (!c) return;
    setCountryState(c);
    setCurrencyState(currencies[c.currency]);
    setLanguageState(c.language);
  };

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(currencies[code]);
  };

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
  };

  const value: LocaleState = {
    country, currency, language,
    setCountry, setCurrency, setLanguage,
    format, fx, detected, t,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleState {
  const v = useContext(Ctx);
  if (!v) {
    // Safe fallback so non-wrapped pages don't crash during SSR or storybooks.
    return {
      country: countries[0],
      currency: currencies.USD,
      language: "en",
      setCountry: () => {},
      setCurrency: () => {},
      setLanguage: () => {},
      format: (n) => `$${n.toLocaleString()}`,
      fx: 1,
      detected: false,
      t: (k) => i18n.en[k] ?? k,
    };
  }
  return v;
}
