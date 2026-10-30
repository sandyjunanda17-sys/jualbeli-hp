export type PhoneCondition = "Baru (BNIB)" | "Bekas - Like New (Grade A+)" | "Bekas - Mulus (Grade A)" | "Bekas - Normal (Grade B)";

export interface PhoneVariant {
  id: string;
  ram: string;
  storage: string;
  color: string;
  colorHex: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface PhoneSpecs {
  screen: string;
  processor: string;
  camera: string;
  battery: string;
  os: string;
  network: string;
  sim: string;
  weight?: string;
}

export interface PhoneInspection {
  batteryHealth: string; // e.g. "100%" or "94%"
  imeiStatus: "Terdaftar Bea Cukai / Resmi Kemenperin" | "Resmi Indonesia (SEIN/iBox/TAM)" | "Sinyal Aman Permanen";
  faceIdOrFingerprint: "Normal 100%" | "Off";
  screenCondition: string;
  bodyCondition: string;
  completeness: string[]; // e.g. ["Unit HP", "Box Original", "Kabel Charger", "Kartu Garansi"]
}

export interface PhoneProduct {
  id: string;
  name: string;
  brand: "Apple" | "Samsung" | "Xiaomi" | "OPPO" | "vivo" | "ASUS" | "Google" | "Infinix" | "Lainnya";
  condition: PhoneCondition;
  warranty: string; // e.g. "Garansi Resmi iBox 1 Tahun" or "Garansi Toko 30 Hari"
  featured: boolean;
  flashSale: boolean;
  rating: number;
  soldCount: number;
  images: string[];
  description: string;
  variants: PhoneVariant[];
  specs: PhoneSpecs;
  inspection: PhoneInspection;
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaFilterBrand?: string;
  bgGradient: string;
  imageUrl: string;
  active: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  discountAmount: number;
  minPurchase: number;
  description: string;
  active: boolean;
}

export interface TradeInSubmission {
  id: string;
  customerName: string;
  whatsapp: string;
  oldPhoneBrand: string;
  oldPhoneModel: string;
  storage: string;
  physicalCondition: "Mulus Sempurna (Grade A+)" | "Lecet Pemakaian Wajar (Grade A)" | "Ada Dent / Retak Halus (Grade B)" | "Minus Fungsi / LCD (Grade C)";
  completeness: "Fullset Original" | "Unit + Box" | "Batangan (Unit Saja)";
  batteryHealth: string;
  estimatedValue: number;
  targetPhoneName?: string;
  submissionType: "Tukar Tambah (Trade-In)" | "Jual Langsung ke Toko";
  status: "Menunggu Inspeksi" | "Disetujui" | "Selesai" | "Ditolak";
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  condition: PhoneCondition;
  variantLabel: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  address: string;
  shippingMethod: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  voucherCode?: string;
  status: "Menunggu Pembayaran" | "Diproses & QC" | "Dikirim" | "Selesai" | "Dibatalkan";
  resiNumber?: string;
  createdAt: string;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  logoUrl: string; // Can be image URL, base64 data URI, or empty (uses custom icon + text)
  logoTextIcon: string;
  primaryColor: "blue" | "emerald" | "violet" | "rose" | "amber" | "slate";
  whatsappNumber: string;
  instagramHandle: string;
  storeAddress: string;
  mapsUrl?: string; // Link Google Maps lokasi toko (bisa disalin & dibuka langsung)
  operationalHours: string;
  announcementBar: string;
  announcementActive: boolean;
  adminPin: string;
  trustBadges: {
    title: string;
    desc: string;
  }[];
  tradeInBaseModels: {
    id: string;
    brand: string;
    model: string;
    basePrice: number;
  }[];
}

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  type: "calculated_via_wa" | "free" | "fixed";
  description: string;
  active: boolean;
}

export interface StoreData {
  brandConfig: BrandConfig;
  banners: PromoBanner[];
  products: PhoneProduct[];
  vouchers: Voucher[];
  orders: Order[];
  tradeIns: TradeInSubmission[];
  shippingOptions?: ShippingOption[];
  lastUpdated: string;
}
