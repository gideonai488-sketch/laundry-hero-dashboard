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
    customer: "Akosua Mensah",
    avatar: "AM",
    service: "Wash & Fold",
    items: 12,
    amount: 85,
    address: "East Legon, Accra",
    distance: "2.4 km",
    createdAt: "2 min ago",
    status: "pending",
    notes: "Please use scent-free detergent",
  },
  {
    id: "HW-2840",
    customer: "Kwame Boateng",
    avatar: "KB",
    service: "Express Wash",
    items: 6,
    amount: 60,
    address: "Cantonments, Accra",
    distance: "3.1 km",
    createdAt: "12 min ago",
    status: "pending",
  },
  {
    id: "HW-2839",
    customer: "Ama Owusu",
    avatar: "AO",
    service: "Dry Cleaning",
    items: 4,
    amount: 120,
    address: "Airport Residential",
    distance: "5.0 km",
    createdAt: "34 min ago",
    status: "pickup",
  },
  {
    id: "HW-2838",
    customer: "Yaw Asante",
    avatar: "YA",
    service: "Sneaker Cleaning",
    items: 2,
    amount: 80,
    address: "Labone, Accra",
    distance: "1.8 km",
    createdAt: "1 hr ago",
    status: "washing",
  },
  {
    id: "HW-2837",
    customer: "Esi Nyarko",
    avatar: "EN",
    service: "Bulk Laundry",
    items: 28,
    amount: 180,
    address: "Spintex Road",
    distance: "4.2 km",
    createdAt: "2 hr ago",
    status: "ready",
  },
  {
    id: "HW-2836",
    customer: "Kojo Annan",
    avatar: "KA",
    service: "Wash & Fold",
    items: 10,
    amount: 70,
    address: "Osu, Accra",
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

export const services: Service[] = [
  { id: "1", name: "Wash & Fold", description: "Standard wash, dry & fold", priceMin: 25, priceMax: 50, turnaround: "24–48 hrs", active: true, icon: "👕", bookings: 412 },
  { id: "2", name: "Express Wash", description: "Same-day priority service", priceMin: 40, priceMax: 80, turnaround: "6 hrs", active: true, icon: "⚡", bookings: 287 },
  { id: "3", name: "Dry Cleaning", description: "Premium garment care", priceMin: 35, priceMax: 120, turnaround: "48 hrs", active: true, icon: "✨", bookings: 196 },
  { id: "4", name: "Bulk Laundry", description: "Large loads, big savings", priceMin: 80, priceMax: 200, turnaround: "48–72 hrs", active: true, icon: "📦", bookings: 134 },
  { id: "5", name: "Sneaker Cleaning", description: "Deep clean for kicks", priceMin: 40, priceMax: 80, turnaround: "72 hrs", active: true, icon: "👟", bookings: 98 },
  { id: "6", name: "Stain Removal", description: "Tough stains, gone", priceMin: 25, priceMax: 60, turnaround: "24–48 hrs", active: false, icon: "🧴", bookings: 47 },
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
  { id: "PO-104", date: "Apr 22, 2026", amount: 4280, method: "MTN MoMo •••821", status: "completed" },
  { id: "PO-103", date: "Apr 15, 2026", amount: 3920, method: "MTN MoMo •••821", status: "completed" },
  { id: "PO-102", date: "Apr 08, 2026", amount: 5140, method: "GCB •••4421", status: "completed" },
  { id: "PO-101", date: "Apr 01, 2026", amount: 3680, method: "MTN MoMo •••821", status: "completed" },
  { id: "PO-100", date: "Mar 25, 2026", amount: 4560, method: "GCB •••4421", status: "completed" },
];

export interface BankAccount {
  id: string;
  type: "momo" | "bank";
  provider: string;
  accountName: string;
  accountNumber: string;
  isPrimary: boolean;
}

export const bankAccounts: BankAccount[] = [
  { id: "1", type: "momo", provider: "MTN Mobile Money", accountName: "Highest Wash Laundry", accountNumber: "0244***821", isPrimary: true },
  { id: "2", type: "bank", provider: "GCB Bank", accountName: "Highest Wash Ltd", accountNumber: "1011****4421", isPrimary: false },
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
  { id: "c1", customer: "Akosua Mensah", avatar: "AM", lastMessage: "Please use scent-free detergent 🙏", time: "2m", unread: 2, orderId: "HW-2841" },
  { id: "c2", customer: "Kwame Boateng", avatar: "KB", lastMessage: "Driver is downstairs, coming now", time: "14m", unread: 0, orderId: "HW-2840" },
  { id: "c3", customer: "Ama Owusu", avatar: "AO", lastMessage: "Thanks! Everything looks great ⭐", time: "1h", unread: 0, orderId: "HW-2839" },
  { id: "c4", customer: "Yaw Asante", avatar: "YA", lastMessage: "Can you check the white shirts?", time: "3h", unread: 1, orderId: "HW-2838" },
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
  { id: "n1", type: "order", title: "New order received", message: "Akosua Mensah placed an order — GH₵85", time: "2 min ago", read: false },
  { id: "n2", type: "payment", title: "Payout sent", message: "GH₵4,280 sent to MTN MoMo •••821", time: "1 hr ago", read: false },
  { id: "n3", type: "review", title: "New 5-star review ⭐", message: "Ama Owusu: \"Best laundry in Accra!\"", time: "3 hr ago", read: true },
  { id: "n4", type: "order", title: "Order completed", message: "HW-2836 marked as delivered", time: "5 hr ago", read: true },
  { id: "n5", type: "system", title: "Weekly report ready", message: "You earned GH₵6,330 this week — 12% up", time: "1 day ago", read: true },
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
  { id: "s1", name: "Kofi Mensah", role: "Manager", avatar: "KM", phone: "+233 24 ••• 1102", status: "active", ordersHandled: 142 },
  { id: "s2", name: "Adwoa Sarpong", role: "Washer", avatar: "AS", phone: "+233 20 ••• 8841", status: "active", ordersHandled: 98 },
  { id: "s3", name: "Kwesi Boadu", role: "Driver", avatar: "KB", phone: "+233 55 ••• 3320", status: "active", ordersHandled: 76 },
  { id: "s4", name: "Abena Owusu", role: "Washer", avatar: "AO", phone: "+233 24 ••• 7715", status: "off", ordersHandled: 64 },
];

export const merchantProfile = {
  businessName: "Highest Wash Laundry",
  ownerName: "Daniel Owusu",
  email: "daniel@highestwash.gh",
  phone: "+233 24 555 0188",
  address: "12 Spintex Road, Accra",
  rating: 4.9,
  totalReviews: 412,
  joinedAt: "March 2025",
  verified: true,
};

export const formatGHS = (n: number) => `GH₵ ${n.toLocaleString()}`;

export const statusMeta: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "bg-warning/15 text-warning-foreground" },
  accepted: { label: "Accepted", tone: "bg-primary/15 text-primary" },
  pickup: { label: "Picked up", tone: "bg-accent text-accent-foreground" },
  washing: { label: "Washing", tone: "bg-primary/15 text-primary" },
  ready: { label: "Ready", tone: "bg-success/15 text-success" },
  delivered: { label: "Delivered", tone: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", tone: "bg-destructive/15 text-destructive" },
};
