// Mock data for the merchant prototype
export type OrderStatus = "pending" | "accepted" | "pickup" | "washing" | "ready" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customer: string;
  avatar: string;
  service: string;
  items: number;
  amount: number;
  address: string;
  distance: string;
  createdAt: string;
  status: OrderStatus;
  notes?: string;
}

export const orders: Order[] = [
  {
    id: "HW-2841",
    customer: "Sofia Martinez",
    avatar: "SM",
    service: "Wash & Fold",
    items: 12,
    amount: 28,
    address: "221 Baker Street, London",
    distance: "2.4 km",
    createdAt: "2 min ago",
    status: "pending",
    notes: "Please use scent-free detergent",
  },
  {
    id: "HW-2840",
    customer: "Liam O'Connor",
    avatar: "LO",
    service: "Express Wash",
    items: 6,
    amount: 19,
    address: "12 Rue de Rivoli, Paris",
    distance: "3.1 km",
    createdAt: "12 min ago",
    status: "pending",
  },
  {
    id: "HW-2839",
    customer: "Ayaka Tanaka",
    avatar: "AT",
    service: "Dry Cleaning",
    items: 4,
    amount: 42,
    address: "5-3 Shibuya, Tokyo",
    distance: "5.0 km",
    createdAt: "34 min ago",
    status: "pickup",
  },
  {
    id: "HW-2838",
    customer: "Marcus Bennett",
    avatar: "MB",
    service: "Sneaker Cleaning",
    items: 2,
    amount: 24,
    address: "78 Bondi Road, Sydney",
    distance: "1.8 km",
    createdAt: "1 hr ago",
    status: "washing",
  },
  {
    id: "HW-2837",
    customer: "Priya Sharma",
    avatar: "PS",
    service: "Bulk Laundry",
    items: 28,
    amount: 56,
    address: "Bandra West, Mumbai",
    distance: "4.2 km",
    createdAt: "2 hr ago",
    status: "ready",
  },
  {
    id: "HW-2836",
    customer: "Noah Williams",
    avatar: "NW",
    service: "Wash & Fold",
    items: 10,
    amount: 22,
    address: "Brooklyn Heights, NY",
    distance: "2.0 km",
    createdAt: "5 hr ago",
    status: "delivered",
  },
];

export interface Service {
  id: string;
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  turnaround: string;
  active: boolean;
  icon: string;
  bookings: number;
}

// Service catalog is set by Highest Wash admins. Merchants can only enable
// or pause individual services for their shop — they cannot create new ones
// or change pricing (admins control that platform-wide).
export const services: Service[] = [
  { id: "1", name: "Wash & Fold", description: "Standard wash, dry & fold", priceMin: 8, priceMax: 18, turnaround: "24–48 hrs", active: true, icon: "👕", bookings: 412 },
  { id: "2", name: "Express Wash", description: "Same-day priority service", priceMin: 14, priceMax: 28, turnaround: "6 hrs", active: true, icon: "⚡", bookings: 287 },
  { id: "3", name: "Dry Cleaning", description: "Premium garment care", priceMin: 12, priceMax: 42, turnaround: "48 hrs", active: true, icon: "✨", bookings: 196 },
  { id: "4", name: "Bulk Laundry", description: "Large loads, big savings", priceMin: 28, priceMax: 70, turnaround: "48–72 hrs", active: true, icon: "📦", bookings: 134 },
  { id: "5", name: "Sneaker Cleaning", description: "Deep clean for kicks", priceMin: 14, priceMax: 28, turnaround: "72 hrs", active: true, icon: "👟", bookings: 98 },
  { id: "6", name: "Stain Removal", description: "Tough stains, gone", priceMin: 8, priceMax: 22, turnaround: "24–48 hrs", active: false, icon: "🧴", bookings: 47 },
];

export const revenueData = [
  { day: "Mon", revenue: 420, orders: 8 },
  { day: "Tue", revenue: 680, orders: 12 },
  { day: "Wed", revenue: 540, orders: 10 },
  { day: "Thu", revenue: 890, orders: 16 },
  { day: "Fri", revenue: 1240, orders: 22 },
  { day: "Sat", revenue: 1580, orders: 28 },
  { day: "Sun", revenue: 980, orders: 18 },
];

export const monthlyData = [
  { month: "Nov", revenue: 18420 },
  { month: "Dec", revenue: 22100 },
  { month: "Jan", revenue: 19800 },
  { month: "Feb", revenue: 24600 },
  { month: "Mar", revenue: 28900 },
  { month: "Apr", revenue: 32400 },
];

export const serviceShare = [
  { name: "Wash & Fold", value: 42, color: "var(--chart-1)" },
  { name: "Express", value: 24, color: "var(--chart-2)" },
  { name: "Dry Clean", value: 18, color: "var(--chart-3)" },
  { name: "Bulk", value: 11, color: "var(--chart-4)" },
  { name: "Other", value: 5, color: "var(--chart-5)" },
];

export interface Payout {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed";
}

export const payouts: Payout[] = [
  { id: "PO-104", date: "Apr 22, 2026", amount: 1280, method: "Stripe •••821", status: "completed" },
  { id: "PO-103", date: "Apr 15, 2026", amount: 920, method: "Stripe •••821", status: "completed" },
  { id: "PO-102", date: "Apr 08, 2026", amount: 1140, method: "Wise •••4421", status: "completed" },
  { id: "PO-101", date: "Apr 01, 2026", amount: 880, method: "Stripe •••821", status: "completed" },
  { id: "PO-100", date: "Mar 25, 2026", amount: 1060, method: "Wise •••4421", status: "completed" },
];

export interface BankAccount {
  id: string;
  type: "wallet" | "bank";
  provider: string;
  accountName: string;
  accountNumber: string;
  isPrimary: boolean;
}

export const bankAccounts: BankAccount[] = [
  { id: "1", type: "wallet", provider: "Stripe Connect", accountName: "Highest Wash Laundry", accountNumber: "acct_1Nq***821", isPrimary: true },
  { id: "2", type: "bank", provider: "Chase Bank", accountName: "Highest Wash Ltd", accountNumber: "1011****4421", isPrimary: false },
];

export interface ChatMessage {
  id: string;
  customer: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  orderId: string;
}

export const chats: ChatMessage[] = [
  { id: "c1", customer: "Sofia Martinez", avatar: "SM", lastMessage: "Please use scent-free detergent 🙏", time: "2m", unread: 2, orderId: "HW-2841" },
  { id: "c2", customer: "Liam O'Connor", avatar: "LO", lastMessage: "Driver is downstairs, coming now", time: "14m", unread: 0, orderId: "HW-2840" },
  { id: "c3", customer: "Ayaka Tanaka", avatar: "AT", lastMessage: "Thanks! Everything looks great ⭐", time: "1h", unread: 0, orderId: "HW-2839" },
  { id: "c4", customer: "Marcus Bennett", avatar: "MB", lastMessage: "Can you check the white shirts?", time: "3h", unread: 1, orderId: "HW-2838" },
];

export interface Notification {
  id: string;
  type: "order" | "payment" | "review" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const notifications: Notification[] = [
  { id: "n1", type: "order", title: "New order received", message: "Sofia Martinez placed an order — $28", time: "2 min ago", read: false },
  { id: "n2", type: "payment", title: "Payout sent", message: "$1,280 sent to Stripe •••821", time: "1 hr ago", read: false },
  { id: "n3", type: "review", title: "New 5-star review ⭐", message: "Ayaka Tanaka: \"Best laundry service ever!\"", time: "3 hr ago", read: true },
  { id: "n4", type: "order", title: "Order completed", message: "HW-2836 marked as delivered", time: "5 hr ago", read: true },
  { id: "n5", type: "system", title: "Weekly report ready", message: "You earned $1,820 this week — 12% up", time: "1 day ago", read: true },
];

export interface Staff {
  id: string;
  name: string;
  role: "Manager" | "Washer" | "Driver";
  avatar: string;
  phone: string;
  status: "active" | "off";
  ordersHandled: number;
}

export const staff: Staff[] = [
  { id: "s1", name: "Carlos Rivera", role: "Manager", avatar: "CR", phone: "+1 555 ••• 1102", status: "active", ordersHandled: 142 },
  { id: "s2", name: "Amelia Chen", role: "Washer", avatar: "AC", phone: "+44 20 ••• 8841", status: "active", ordersHandled: 98 },
  { id: "s3", name: "Diego Alvarez", role: "Driver", avatar: "DA", phone: "+34 6 ••• 3320", status: "active", ordersHandled: 76 },
  { id: "s4", name: "Fatima Hassan", role: "Washer", avatar: "FH", phone: "+971 50 ••• 7715", status: "off", ordersHandled: 64 },
];

export const merchantProfile = {
  businessName: "Highest Wash Laundry",
  ownerName: "Daniel Carter",
  email: "daniel@highestwash.com",
  phone: "+1 (415) 555 0188",
  address: "12 Market Street, San Francisco",
  rating: 4.9,
  totalReviews: 412,
  joinedAt: "March 2025",
  verified: true,
};

// Default platform currency. Each merchant inherits this from their region.
// Admins control regional currency settings — this is just a display helper.
export const formatMoney = (n: number, currency = "$") =>
  `${currency}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// Backwards-compat alias — kept so existing imports keep working.
export const formatGHS = formatMoney;

// ============= Reviews =============
export interface Review {
  id: string;
  customer: string;
  avatar: string;
  rating: number; // 1-5
  comment: string;
  service: string;
  orderId: string;
  date: string;
  reply?: string;
}

export const reviews: Review[] = [
  { id: "r1", customer: "Ayaka Tanaka", avatar: "AT", rating: 5, comment: "Best laundry service ever! Came back perfectly folded.", service: "Dry Cleaning", orderId: "HW-2839", date: "2 days ago" },
  { id: "r2", customer: "Sofia Martinez", avatar: "SM", rating: 5, comment: "Loved that they used scent-free detergent as requested 🙏", service: "Wash & Fold", orderId: "HW-2820", date: "5 days ago", reply: "Thanks Sofia! Always happy to accommodate." },
  { id: "r3", customer: "Marcus Bennett", avatar: "MB", rating: 4, comment: "Sneakers look great. Pickup was 20 min late though.", service: "Sneaker Cleaning", orderId: "HW-2811", date: "1 week ago" },
  { id: "r4", customer: "Priya Sharma", avatar: "PS", rating: 5, comment: "Bulk order handled flawlessly. Will book again.", service: "Bulk Laundry", orderId: "HW-2802", date: "1 week ago" },
  { id: "r5", customer: "Liam O'Connor", avatar: "LO", rating: 3, comment: "Service was OK but a button came loose on my shirt.", service: "Wash & Fold", orderId: "HW-2790", date: "2 weeks ago" },
];

// ============= Customers / CRM =============
export interface Customer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  totalOrders: number;
  lifetimeValue: number;
  lastOrder: string;
  tier: "new" | "regular" | "vip";
}

export const customers: Customer[] = [
  { id: "cu1", name: "Sofia Martinez", avatar: "SM", email: "sofia.m@mail.com", phone: "+44 20 ••• 4421", totalOrders: 18, lifetimeValue: 612, lastOrder: "Today", tier: "vip" },
  { id: "cu2", name: "Ayaka Tanaka", avatar: "AT", email: "ayaka.t@mail.com", phone: "+81 90 ••• 7711", totalOrders: 24, lifetimeValue: 980, lastOrder: "2 days ago", tier: "vip" },
  { id: "cu3", name: "Marcus Bennett", avatar: "MB", email: "marcus.b@mail.com", phone: "+61 4 ••• 2210", totalOrders: 9, lifetimeValue: 284, lastOrder: "1 hr ago", tier: "regular" },
  { id: "cu4", name: "Priya Sharma", avatar: "PS", email: "priya.s@mail.com", phone: "+91 98 ••• 1102", totalOrders: 12, lifetimeValue: 540, lastOrder: "2 hr ago", tier: "regular" },
  { id: "cu5", name: "Liam O'Connor", avatar: "LO", email: "liam.o@mail.com", phone: "+33 6 ••• 8820", totalOrders: 3, lifetimeValue: 64, lastOrder: "12 min ago", tier: "new" },
  { id: "cu6", name: "Noah Williams", avatar: "NW", email: "noah.w@mail.com", phone: "+1 718 ••• 1199", totalOrders: 6, lifetimeValue: 142, lastOrder: "5 hr ago", tier: "regular" },
];

// ============= Inventory & supplies =============
export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  unit: string;
  inStock: number;
  threshold: number;
  category: "detergent" | "softener" | "packaging" | "tools";
}

export const inventory: InventoryItem[] = [
  { id: "i1", name: "Premium detergent", icon: "🧴", unit: "L", inStock: 24, threshold: 10, category: "detergent" },
  { id: "i2", name: "Fabric softener", icon: "💧", unit: "L", inStock: 8, threshold: 10, category: "softener" },
  { id: "i3", name: "Stain remover", icon: "🧪", unit: "bottles", inStock: 12, threshold: 6, category: "detergent" },
  { id: "i4", name: "Wooden hangers", icon: "🪝", unit: "pcs", inStock: 142, threshold: 50, category: "tools" },
  { id: "i5", name: "Paper laundry bags", icon: "🛍️", unit: "pcs", inStock: 38, threshold: 100, category: "packaging" },
  { id: "i6", name: "Garment covers", icon: "👔", unit: "pcs", inStock: 64, threshold: 30, category: "packaging" },
];

// ============= Promotions =============
export interface Promotion {
  id: string;
  name: string;
  description: string;
  discount: string;
  validUntil: string;
  optedIn: boolean;
  badge: "new" | "featured" | "seasonal";
}

export const promotions: Promotion[] = [
  { id: "p1", name: "Spring Refresh −20%", description: "Platform-wide spring campaign. Customers see your shop in featured carousel.", discount: "20% off Wash & Fold", validUntil: "May 31, 2026", optedIn: true, badge: "seasonal" },
  { id: "p2", name: "First-order welcome", description: "New customers get free pickup on first order. Platform absorbs the fee.", discount: "Free pickup", validUntil: "Ongoing", optedIn: true, badge: "featured" },
  { id: "p3", name: "Bulk laundry weekend", description: "Boost weekend bulk bookings with 15% off promotion.", discount: "15% off Bulk", validUntil: "Apr 30, 2026", optedIn: false, badge: "new" },
  { id: "p4", name: "Sneaker cleaning launch", description: "Highlight sneaker service to local customers.", discount: "$5 off Sneakers", validUntil: "Jun 15, 2026", optedIn: false, badge: "new" },
];

// ============= Shop settings =============
export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export const defaultHours: OperatingHours[] = [
  { day: "Mon", open: "08:00", close: "20:00", closed: false },
  { day: "Tue", open: "08:00", close: "20:00", closed: false },
  { day: "Wed", open: "08:00", close: "20:00", closed: false },
  { day: "Thu", open: "08:00", close: "20:00", closed: false },
  { day: "Fri", open: "08:00", close: "21:00", closed: false },
  { day: "Sat", open: "09:00", close: "18:00", closed: false },
  { day: "Sun", open: "10:00", close: "16:00", closed: true },
];

// ============= Reports =============
export interface Report {
  id: string;
  name: string;
  period: string;
  type: "statement" | "tax-invoice" | "order-export";
  size: string;
  generatedAt: string;
}

export const reports: Report[] = [
  { id: "rp1", name: "Monthly statement — March 2026", period: "Mar 2026", type: "statement", size: "284 KB", generatedAt: "Apr 01, 2026" },
  { id: "rp2", name: "Tax invoice — Q1 2026", period: "Q1 2026", type: "tax-invoice", size: "412 KB", generatedAt: "Apr 02, 2026" },
  { id: "rp3", name: "Order export — March 2026", period: "Mar 2026", type: "order-export", size: "98 KB", generatedAt: "Apr 01, 2026" },
  { id: "rp4", name: "Monthly statement — February 2026", period: "Feb 2026", type: "statement", size: "276 KB", generatedAt: "Mar 01, 2026" },
];

// ============= FAQ =============
export const faqs: { q: string; a: string; category: string }[] = [
  { q: "How do payouts work?", a: "Payouts run weekly every Monday. Funds settle to your primary account within 24 hours. You can switch your primary account anytime in Payouts.", category: "Payments" },
  { q: "Why can't I change service prices?", a: "Highest Wash sets prices platform-wide to keep quality and customer trust consistent everywhere. You choose which services your shop accepts.", category: "Services" },
  { q: "What if a customer disputes an order?", a: "Open the order, tap Report Issue, and our team will mediate within 24 hours. Funds are held until resolution.", category: "Orders" },
  { q: "How do I add staff?", a: "Go to Profile → Staff & branches → Add member. Each staff member gets their own login with limited permissions.", category: "Account" },
  { q: "Is there a monthly fee?", a: "No. Highest Wash takes a small commission (12%) on each completed order. No setup, monthly, or hidden fees.", category: "Payments" },
  { q: "Can I pause my shop temporarily?", a: "Yes. Go to Shop settings and toggle Online status off, or set vacation mode with a return date.", category: "Account" },
];

// ============= AI customer trust / background check =============
export interface CustomerTrust {
  customerId: string; // matches Order.customer
  verified: boolean;
  riskScore: "low" | "medium" | "high";
  priorOrders: number;
  paymentValid: boolean;
  fraudFlags: number;
  summary: string;
}

export const customerTrust: Record<string, CustomerTrust> = {
  "Sofia Martinez": { customerId: "Sofia Martinez", verified: true, riskScore: "low", priorOrders: 18, paymentValid: true, fraudFlags: 0, summary: "VIP · 18 prior orders · 100% on-time payment" },
  "Liam O'Connor": { customerId: "Liam O'Connor", verified: false, riskScore: "medium", priorOrders: 3, paymentValid: true, fraudFlags: 0, summary: "New customer · 3 prior orders · payment verified" },
  "Ayaka Tanaka": { customerId: "Ayaka Tanaka", verified: true, riskScore: "low", priorOrders: 24, paymentValid: true, fraudFlags: 0, summary: "VIP · 24 prior orders · 5★ avg rating" },
  "Marcus Bennett": { customerId: "Marcus Bennett", verified: true, riskScore: "low", priorOrders: 9, paymentValid: true, fraudFlags: 0, summary: "Regular · 9 prior orders · low risk" },
  "Priya Sharma": { customerId: "Priya Sharma", verified: true, riskScore: "low", priorOrders: 12, paymentValid: true, fraudFlags: 0, summary: "Regular · 12 prior orders · 4.8★ avg" },
  "Noah Williams": { customerId: "Noah Williams", verified: true, riskScore: "low", priorOrders: 6, paymentValid: true, fraudFlags: 0, summary: "Regular · 6 prior orders · low risk" },
};

// ============= AI dispatch feed =============
export interface DispatchAssignment {
  id: string;
  orderId: string;
  customer: string;
  service: string;
  amount: number;
  distance: string;
  riderName: string;
  riderEta: string;
  aiConfidence: number; // 0–100
  reason: string;
  expiresInSec: number;
  trustSummary: string;
}

export const dispatchAssignments: DispatchAssignment[] = [
  {
    id: "AD-9921",
    orderId: "HW-2842",
    customer: "Emma Larsson",
    service: "Express Wash",
    amount: 32,
    distance: "1.2 km",
    riderName: "Diego A.",
    riderEta: "6 min",
    aiConfidence: 94,
    reason: "Verified customer · within radius · capacity OK",
    expiresInSec: 45,
    trustSummary: "Regular · 7 orders · low risk",
  },
  {
    id: "AD-9920",
    orderId: "HW-2843",
    customer: "Hiro Nakamura",
    service: "Wash & Fold",
    amount: 24,
    distance: "2.8 km",
    riderName: "Amelia C.",
    riderEta: "11 min",
    aiConfidence: 88,
    reason: "Returning customer · matches your peak hours",
    expiresInSec: 90,
    trustSummary: "VIP · 21 orders · 5★ avg",
  },
];

// ============= AI insights =============
export interface AIInsight {
  id: string;
  title: string;
  body: string;
  trend: "up" | "down" | "neutral";
  metric?: string;
}

export const aiInsights: AIInsight[] = [
  { id: "in1", title: "Revenue up 12% this week", body: "Driven by Wash & Fold weekday spikes. Consider adding 1 staff member on Thu–Fri.", trend: "up", metric: "+$240" },
  { id: "in2", title: "3 customers at churn risk", body: "Sofia, Marcus & Priya haven't ordered in 9+ days. Send a 15% comeback offer.", trend: "down" },
  { id: "in3", title: "Sneaker cleaning is trending", body: "Bookings up 28% in your area. Enable the service to capture demand.", trend: "up", metric: "+28%" },
];

// ============= AI Copilot starter prompts =============
export const copilotSuggestions = [
  "What's my revenue today?",
  "Which orders are running late?",
  "Accept all verified pending orders",
  "Draft a reply to Sofia's review",
  "Show me my top 3 customers",
  "When should I add staff?",
];

// Mock AI responses keyed by intent keyword
export const copilotMockResponses: { match: RegExp; reply: string }[] = [
  { match: /revenue|earning|today/i, reply: "You've earned **$340** today across 8 completed orders — up **18%** vs yesterday. Wash & Fold drove 62% of that. Want me to break it down by service?" },
  { match: /late|overdue|delay/i, reply: "**2 orders are running late:**\n\n• HW-2838 (Marcus Bennett) — washing stage, 45 min over SLA\n• HW-2839 (Ayaka Tanaka) — pickup pending, rider 8 min away\n\nShall I notify both customers with an apology + ETA?" },
  { match: /accept.*pending|accept.*all/i, reply: "Found **2 pending orders** matching your auto-accept rules (verified · under $50 · within 5km). Accepting now… ✅ Done. HW-2841 and HW-2840 are now in your queue." },
  { match: /reply|review|sofia/i, reply: "Here's a draft reply to Sofia's 5★ review:\n\n> *\"Thanks so much, Sofia! Scent-free is always our pleasure 💙 See you next pickup!\"*\n\nWant me to post it or tweak the tone?" },
  { match: /top.*customer|best.*customer|vip/i, reply: "**Your top 3 customers this month:**\n\n1. Ayaka Tanaka — $312 · 8 orders\n2. Sofia Martinez — $284 · 6 orders\n3. Priya Sharma — $196 · 4 orders\n\nWant me to send them each a thank-you voucher?" },
  { match: /staff|hire|add.*person/i, reply: "Based on your 4-week trend, you're hitting **92% capacity Thu–Sat**. Adding one washer for those 3 days would unlock ~$420/week in extra revenue. Want me to draft a job post?" },
];

// ============= Voice intents =============
export interface VoiceIntent {
  pattern: RegExp;
  action: string;
  feedback: string;
}

export const voiceIntents: VoiceIntent[] = [
  { pattern: /accept.*all|accept.*pending/i, action: "accept_all", feedback: "Accepting all 2 verified pending orders" },
  { pattern: /next.*stage|move.*next|advance/i, action: "next_stage", feedback: "Moving active orders to next stage" },
  { pattern: /revenue|earning|how much/i, action: "show_revenue", feedback: "Today: $340 · This week: $1,820" },
  { pattern: /pause|vacation|stop.*orders/i, action: "vacation", feedback: "Vacation mode enabled · all incoming orders paused" },
  { pattern: /resume|come back|online/i, action: "resume", feedback: "You're back online · accepting orders" },
  { pattern: /call.*rider|call.*driver/i, action: "call_rider", feedback: "Calling Diego A. now…" },
  { pattern: /late|overdue/i, action: "show_late", feedback: "2 orders are running late — HW-2838 and HW-2839" },
];

// Sample mock voice transcriptions for demo
export const sampleVoicePrompts = [
  "Accept all pending orders",
  "How much have I made today?",
  "Move all active orders to next stage",
  "Are any orders late?",
  "Call the rider for the latest order",
  "Pause my shop for tonight",
];

export const statusMeta: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "bg-warning/15 text-warning-foreground" },
  accepted: { label: "Accepted", tone: "bg-primary/15 text-primary" },
  pickup: { label: "Picked up", tone: "bg-accent text-accent-foreground" },
  washing: { label: "Washing", tone: "bg-primary/15 text-primary" },
  ready: { label: "Ready", tone: "bg-success/15 text-success" },
  delivered: { label: "Delivered", tone: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", tone: "bg-destructive/15 text-destructive" },
};

// ============= Rider tracking =============
export interface RiderTrack {
  orderId: string;
  riderName: string;
  riderAvatar: string;
  riderPhone: string;
  vehicle: string;
  rating: number;
  etaMin: number;
  // Position is normalized 0–100 across a mock map
  position: { x: number; y: number };
  destination: { x: number; y: number };
  origin: { x: number; y: number };
  stage: "en-route-pickup" | "at-pickup" | "en-route-delivery" | "at-delivery";
  trail: { x: number; y: number }[];
}

export const riderTracks: Record<string, RiderTrack> = {
  "HW-2839": {
    orderId: "HW-2839",
    riderName: "Diego Alvarez",
    riderAvatar: "DA",
    riderPhone: "+34 6 ••• 3320",
    vehicle: "Yamaha NMax · GHA-2241",
    rating: 4.9,
    etaMin: 8,
    origin: { x: 18, y: 78 },
    position: { x: 42, y: 56 },
    destination: { x: 78, y: 24 },
    stage: "en-route-pickup",
    trail: [
      { x: 18, y: 78 }, { x: 24, y: 72 }, { x: 30, y: 66 }, { x: 36, y: 60 }, { x: 42, y: 56 },
    ],
  },
  "HW-2838": {
    orderId: "HW-2838",
    riderName: "Amelia Chen",
    riderAvatar: "AC",
    riderPhone: "+44 20 ••• 8841",
    vehicle: "Honda PCX · LDN-7715",
    rating: 4.8,
    etaMin: 14,
    origin: { x: 80, y: 20 },
    position: { x: 55, y: 45 },
    destination: { x: 22, y: 80 },
    stage: "en-route-delivery",
    trail: [
      { x: 80, y: 20 }, { x: 72, y: 28 }, { x: 64, y: 36 }, { x: 55, y: 45 },
    ],
  },
};

// ============= Voice command audit history =============
export interface VoiceCommandLog {
  id: string;
  transcript: string;
  intent: string;
  result: string;
  source: "wake-word" | "push-to-talk" | "copilot";
  at: string;
  success: boolean;
}

export const voiceHistorySeed: VoiceCommandLog[] = [
  { id: "vh1", transcript: "Accept all pending orders", intent: "accept_all", result: "Accepted 2 orders (HW-2841, HW-2840)", source: "push-to-talk", at: "2 min ago", success: true },
  { id: "vh2", transcript: "How much have I made today?", intent: "show_revenue", result: "Reported today: $340 · week: $1,820", source: "wake-word", at: "18 min ago", success: true },
  { id: "vh3", transcript: "Call the rider for HW-2839", intent: "call_rider", result: "Dialed Diego A.", source: "copilot", at: "1 hr ago", success: true },
  { id: "vh4", transcript: "Move all active orders to next stage", intent: "next_stage", result: "Advanced 3 orders", source: "wake-word", at: "2 hr ago", success: true },
  { id: "vh5", transcript: "Pause my shop until Monday", intent: "vacation", result: "Could not parse end date — asked for clarification", source: "push-to-talk", at: "Yesterday", success: false },
];

// ============= AI suggested replies (chat) =============
export const aiReplyDrafts: Record<string, string[]> = {
  c1: [
    "Got it Sofia 🙏 We'll use scent-free detergent on your order. Driver is on the way!",
    "Noted — scent-free only. Your order is queued and will be ready in 24 hrs.",
    "Of course! No fragrance added. We'll text you once it's ready for delivery.",
  ],
  c2: [
    "Perfect — driver is at the entrance now in a black scooter 🛵",
    "Great! Heading down to meet them. Order confirmed.",
    "Awesome, sending the driver up to apartment 4B.",
  ],
  c3: [
    "Thanks so much Ayaka! 💙 See you on the next pickup.",
    "So glad you loved it! A 5★ review would mean the world.",
    "Thank you! Always our pleasure caring for your wardrobe.",
  ],
  c4: [
    "Yes — checked all whites, no stains found. Photos coming in 5 min.",
    "On it! Inspecting the white shirts now and will report back.",
    "Will double-check those shirts before we fold and send a photo.",
  ],
};

// ============= Smart notification grouping =============
export interface NotificationGroup {
  id: string;
  title: string;
  summary: string;
  count: number;
  priority: "high" | "medium" | "low";
  type: "order" | "payment" | "review" | "system";
  items: string[];
  actionLabel?: string;
}

export const notificationGroups: NotificationGroup[] = [
  {
    id: "g1",
    title: "3 orders need attention",
    summary: "AI grouped pending + late + at-risk orders so you can review in one tap.",
    count: 3,
    priority: "high",
    type: "order",
    items: ["HW-2841 pending 2m", "HW-2838 late 45m over SLA", "HW-2839 rider arriving"],
    actionLabel: "Review all",
  },
  {
    id: "g2",
    title: "Payout arriving Monday",
    summary: "$1,280 will land in Stripe •••821 in 3 days.",
    count: 1,
    priority: "medium",
    type: "payment",
    items: ["PO-105 — $1,280 scheduled"],
    actionLabel: "View payout",
  },
  {
    id: "g3",
    title: "2 new 5-star reviews ⭐",
    summary: "Customers loved your recent dry cleaning work.",
    count: 2,
    priority: "low",
    type: "review",
    items: ["Ayaka Tanaka · 5★", "Priya Sharma · 5★"],
    actionLabel: "Reply with AI",
  },
  {
    id: "g4",
    title: "Weekly report ready",
    summary: "You earned $1,820 this week — 12% up vs last week.",
    count: 1,
    priority: "low",
    type: "system",
    items: ["Wk 17 summary"],
    actionLabel: "Open report",
  },
];

// ============= AI pricing suggestions =============
export interface PricingSuggestion {
  id: string;
  service: string;
  current: number;
  suggested: number;
  reason: string;
  uplift: string;       // e.g. "+$120/wk"
  confidence: number;   // 0–100
  applies: string;      // e.g. "Weekends only"
}

export const pricingSuggestions: PricingSuggestion[] = [
  { id: "ps1", service: "Wash & Fold", current: 18, suggested: 20, reason: "Weekend demand 40% above weekday baseline. Customers paying premium nearby.", uplift: "+$120/wk", confidence: 92, applies: "Sat–Sun" },
  { id: "ps2", service: "Express Wash", current: 28, suggested: 32, reason: "You consistently sell out 6hr slots by 11am. Raise to manage demand.", uplift: "+$84/wk", confidence: 88, applies: "All days" },
  { id: "ps3", service: "Sneaker Cleaning", current: 24, suggested: 22, reason: "Lower than competitors but bookings stalled. Slight cut to drive volume.", uplift: "+$40/wk", confidence: 71, applies: "Weekdays" },
];

// ============= Demand forecast (next 7 days) =============
export interface DemandDay {
  date: string;     // "Wed Apr 23"
  short: string;    // "Wed"
  forecast: number; // expected orders
  baseline: number; // your usual
  weather: string;  // emoji
  note: string;
  load: "low" | "med" | "high" | "peak";
}

export const demandForecast: DemandDay[] = [
  { date: "Wed Apr 23", short: "Wed", forecast: 14, baseline: 12, weather: "☀️", note: "Normal weekday", load: "med" },
  { date: "Thu Apr 24", short: "Thu", forecast: 18, baseline: 14, weather: "☀️", note: "Promo boost expected", load: "high" },
  { date: "Fri Apr 25", short: "Fri", forecast: 22, baseline: 18, weather: "🌧️", note: "Rain — demand up", load: "high" },
  { date: "Sat Apr 26", short: "Sat", forecast: 28, baseline: 22, weather: "☀️", note: "Peak day · add staff", load: "peak" },
  { date: "Sun Apr 27", short: "Sun", forecast: 16, baseline: 14, weather: "⛅", note: "Steady", load: "med" },
  { date: "Mon Apr 28", short: "Mon", forecast: 10, baseline: 12, weather: "🌧️", note: "Slow start", load: "low" },
  { date: "Tue Apr 29", short: "Tue", forecast: 13, baseline: 12, weather: "☀️", note: "Normal", load: "med" },
];

// ============= Anomaly alerts =============
export interface AnomalyAlert {
  id: string;
  orderId?: string;
  title: string;
  detail: string;
  severity: "info" | "warn" | "critical";
  category: "fraud" | "pricing" | "delay" | "duplicate";
  at: string;
}

export const anomalyAlerts: AnomalyAlert[] = [
  { id: "an1", orderId: "HW-2842", title: "Order amount unusual", detail: "$180 vs your shop average $45. Items: 3 — verify with customer before accepting.", severity: "warn", category: "pricing", at: "5 min ago" },
  { id: "an2", orderId: "HW-2841", title: "Possible duplicate", detail: "Sofia Martinez placed identical order 18 min ago. Confirm or auto-merge.", severity: "info", category: "duplicate", at: "12 min ago" },
  { id: "an3", title: "New device login", detail: "Sign-in from Chrome · Lagos · 14 min ago. If this wasn't you, secure account.", severity: "critical", category: "fraud", at: "14 min ago" },
];

// ============= Disputes =============
export interface Dispute {
  id: string;
  orderId: string;
  customer: string;
  avatar: string;
  reason: string;
  amount: number;
  openedAt: string;
  status: "open" | "resolved" | "escalated";
  aiResolution: { action: string; rationale: string; cost: number };
}

export const disputes: Dispute[] = [
  {
    id: "d1", orderId: "HW-2790", customer: "Liam O'Connor", avatar: "LO",
    reason: "Button missing from white shirt after wash",
    amount: 22, openedAt: "1 hr ago", status: "open",
    aiResolution: {
      action: "Refund $8 + offer 1 free wash voucher",
      rationale: "Liam is a 3-order customer. Partial refund preserves LTV ($142 expected). Cost: $8 cash + $14 voucher cost.",
      cost: 8,
    },
  },
  {
    id: "d2", orderId: "HW-2802", customer: "Priya Sharma", avatar: "PS",
    reason: "Bulk order arrived 4 hrs late, requested 25% discount",
    amount: 56, openedAt: "3 hr ago", status: "open",
    aiResolution: {
      action: "Approve 15% discount ($8.40) — offer free pickup next time",
      rationale: "Priya is VIP (12 orders, $540 LTV). 15% is below her ask but matches your dispute policy. Recovery rate: 96%.",
      cost: 8,
    },
  },
];

// ============= Performance scorecard =============
export interface ScorecardMetric {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  benchmark: string; // vs nearby merchants
}

export const scorecard = {
  weekOf: "Apr 14 – Apr 20, 2026",
  overallGrade: "A",
  overallScore: 92,
  metrics: [
    { label: "Acceptance rate", value: "96%", delta: "+2%", positive: true, benchmark: "Top 10% nearby" } as ScorecardMetric,
    { label: "Avg turnaround", value: "21 hrs", delta: "-1.5 hrs", positive: true, benchmark: "Avg nearby: 28 hrs" },
    { label: "Customer rating", value: "4.9★", delta: "+0.1", positive: true, benchmark: "Avg nearby: 4.6★" },
    { label: "Cancel rate", value: "1.2%", delta: "-0.4%", positive: true, benchmark: "Avg nearby: 3.8%" },
    { label: "On-time delivery", value: "94%", delta: "+3%", positive: true, benchmark: "Top 15% nearby" },
    { label: "Repeat customers", value: "62%", delta: "+5%", positive: true, benchmark: "Avg nearby: 48%" },
  ],
  highlights: [
    "You're outperforming 87% of laundries in your city.",
    "Consider raising Wash & Fold weekend price by $2 — demand supports it.",
    "Add 1 staff Thu–Sat to capture lost capacity (~$180/wk).",
  ],
};

// ============= Staff scheduling / shifts =============
export interface Shift {
  staffId: string;
  staffName: string;
  avatar: string;
  role: string;
  day: string;       // "Mon"
  start: string;     // "08:00"
  end: string;       // "16:00"
  aiSuggested?: boolean;
}

export const shiftWeek: Shift[] = [
  { staffId: "s1", staffName: "Carlos Rivera", avatar: "CR", role: "Manager", day: "Mon", start: "08:00", end: "17:00" },
  { staffId: "s1", staffName: "Carlos Rivera", avatar: "CR", role: "Manager", day: "Tue", start: "08:00", end: "17:00" },
  { staffId: "s1", staffName: "Carlos Rivera", avatar: "CR", role: "Manager", day: "Wed", start: "08:00", end: "17:00" },
  { staffId: "s1", staffName: "Carlos Rivera", avatar: "CR", role: "Manager", day: "Thu", start: "08:00", end: "17:00" },
  { staffId: "s1", staffName: "Carlos Rivera", avatar: "CR", role: "Manager", day: "Fri", start: "08:00", end: "20:00" },
  { staffId: "s2", staffName: "Amelia Chen", avatar: "AC", role: "Washer", day: "Mon", start: "09:00", end: "16:00" },
  { staffId: "s2", staffName: "Amelia Chen", avatar: "AC", role: "Washer", day: "Wed", start: "09:00", end: "16:00" },
  { staffId: "s2", staffName: "Amelia Chen", avatar: "AC", role: "Washer", day: "Fri", start: "09:00", end: "18:00" },
  { staffId: "s2", staffName: "Amelia Chen", avatar: "AC", role: "Washer", day: "Sat", start: "10:00", end: "18:00" },
  { staffId: "s3", staffName: "Diego Alvarez", avatar: "DA", role: "Driver", day: "Tue", start: "10:00", end: "18:00" },
  { staffId: "s3", staffName: "Diego Alvarez", avatar: "DA", role: "Driver", day: "Thu", start: "10:00", end: "20:00" },
  { staffId: "s3", staffName: "Diego Alvarez", avatar: "DA", role: "Driver", day: "Sat", start: "11:00", end: "19:00" },
];

export const aiShiftSuggestions: Shift[] = [
  { staffId: "s4", staffName: "Fatima Hassan", avatar: "FH", role: "Washer", day: "Thu", start: "12:00", end: "20:00", aiSuggested: true },
  { staffId: "s4", staffName: "Fatima Hassan", avatar: "FH", role: "Washer", day: "Sat", start: "10:00", end: "18:00", aiSuggested: true },
];

// ============= Supplies auto-reorder =============
export interface SupplyOrder {
  id: string;
  itemName: string;
  qty: string;
  supplier: string;
  amount: number;
  status: "auto-placed" | "pending-approval" | "delivered";
  eta: string;
}

export const supplyOrders: SupplyOrder[] = [
  { id: "so1", itemName: "Premium detergent", qty: "20 L", supplier: "EcoClean Wholesale", amount: 84, status: "auto-placed", eta: "Tue Apr 29" },
  { id: "so2", itemName: "Paper laundry bags", qty: "500 pcs", supplier: "PackPro", amount: 38, status: "pending-approval", eta: "Wed Apr 30" },
  { id: "so3", itemName: "Fabric softener", qty: "10 L", supplier: "EcoClean Wholesale", amount: 42, status: "delivered", eta: "Apr 18" },
];

// ============= Onboarding tour steps =============
export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  icon: string;
}

export const onboardingSteps: OnboardingStep[] = [
  { id: "o1", title: "AI runs your shop", body: "Background checks, dispatch, pricing, scheduling — all handled automatically. You stay in control with one-tap overrides.", icon: "✨" },
  { id: "o2", title: "Voice-first by design", body: "Tap the mic in the header or say \"Hey Wash\" anywhere. Accept orders, check revenue, call riders — hands-free.", icon: "🎤" },
  { id: "o3", title: "Live order & rider tracking", body: "Every job gets a real-time timeline and a mini-map showing exactly where your rider is.", icon: "🛵" },
  { id: "o4", title: "Insights that earn you more", body: "AI suggests pricing tweaks, demand forecasts, and customer reactivation campaigns straight from your dashboard.", icon: "📈" },
  { id: "o5", title: "You're ready to go", body: "Tap \"Done\" to enter your dashboard. You can replay this tour anytime from Profile → Help.", icon: "🚀" },
];
