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

export const statusMeta: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "bg-warning/15 text-warning-foreground" },
  accepted: { label: "Accepted", tone: "bg-primary/15 text-primary" },
  pickup: { label: "Picked up", tone: "bg-accent text-accent-foreground" },
  washing: { label: "Washing", tone: "bg-primary/15 text-primary" },
  ready: { label: "Ready", tone: "bg-success/15 text-success" },
  delivered: { label: "Delivered", tone: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", tone: "bg-destructive/15 text-destructive" },
};
