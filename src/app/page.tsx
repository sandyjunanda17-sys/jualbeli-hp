"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import Navbar from "@/components/Navbar";
import ProductDetailModal from "@/components/ProductDetailModal";
import CompareModal from "@/components/CompareModal";
import CartCheckoutDrawer from "@/components/CartCheckoutDrawer";
import LivePurchaseNotification from "@/components/LivePurchaseNotification";
import AllBrandsModal from "@/components/AllBrandsModal";
import { PhoneProduct, PhoneVariant } from "@/types/store";
import {
  buildWhatsAppUrl,
  formatRupiah,
  getConditionBadgeStyle,
} from "@/utils/format";
import {
  ShieldCheck,
  Sparkles,
  Heart,
  SlidersHorizontal,
  BatteryCharging,
  Radio,
  Star,
  ShoppingBag,
  Repeat,
  MapPin,
  Clock,
  MessageCircle,
  Settings,
  CheckCircle2,
  X,
  ArrowRight,
  Smartphone,
  Flame,
  Lock,
  Navigation,
  Copy,
  ExternalLink,
  ChevronDown,
  Home,
  Filter,
} from "lucide-react";

export default function HomePage() {
  const {
    store,
    cart,
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    toastMessage,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"catalog" | "admin">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("ALL");
  const [onlyFlashSale, setOnlyFlashSale] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "popular"
  >("featured");

  // Modals & Drawers
  const [detailProduct, setDetailProduct] = useState<PhoneProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAllBrandsOpen, setIsAllBrandsOpen] = useState(false);

  // Live Flash Sale Urgency Countdown Timer (ticks every second)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 24, seconds: 18 });

  // Pagination for high performance (handles 100+ to 1000+ products seamlessly)
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedBrand, selectedCondition, selectedPriceRange, onlyFlashSale, searchQuery, sortBy]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 3, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute unit counts per brand
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: store.products.length };
    store.products.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [store.products]);

  const filteredProducts = useMemo(() => {
    return store.products
      .filter((p) => {
        if (selectedBrand !== "ALL" && p.brand !== selectedBrand) return false;
        if (
          selectedCondition !== "ALL" &&
          p.condition !== selectedCondition
        ) {
          return false;
        }
        if (onlyFlashSale && !p.flashSale) return false;

        const primaryPrice = p.variants[0]?.price || 0;
        if (selectedPriceRange === "under5m" && primaryPrice >= 5000000) return false;
        if (selectedPriceRange === "5m-10m" && (primaryPrice < 5000000 || primaryPrice > 10000000)) return false;
        if (selectedPriceRange === "10m-20m" && (primaryPrice < 10000000 || primaryPrice > 20000000)) return false;
        if (selectedPriceRange === "above20m" && primaryPrice <= 20000000) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSpecs =
            p.specs.processor.toLowerCase().includes(q) ||
            p.inspection.imeiStatus.toLowerCase().includes(q);
          return matchName || matchBrand || matchDesc || matchSpecs;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.variants[0]?.price || 0;
        const priceB = b.variants[0]?.price || 0;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "popular") return b.soldCount - a.soldCount;
        return Number(b.featured) - Number(a.featured);
      });
  }, [
    store.products,
    selectedBrand,
    selectedCondition,
    selectedPriceRange,
    onlyFlashSale,
    searchQuery,
    sortBy,
  ]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const wishlistProducts = store.products.filter((p) =>
    wishlist.includes(p.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenWishlistModal={() => setIsWishlistOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === "catalog" && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-8">
            {/* ========================================================
                MOBILE QUICK ACCESS: Button "Semua Jenis HP" + Brand Chips + Flash Ticker
                Directly displayed at the top so on mobile 6 products are immediately visible!
               ======================================================== */}
            <div className="lg:hidden space-y-2.5">
              {/* Mini Urgency Flash Sale Ticker */}
              <div className="rounded-2xl bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white p-2.5 shadow-md border border-rose-800/40 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <Flame className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                  <span className="font-extrabold text-[11px] truncate">
                    FLASH SALE: Sisa {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
                <button
                  onClick={() => setOnlyFlashSale(!onlyFlashSale)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-black shrink-0 transition ${
                    onlyFlashSale
                      ? "bg-amber-400 text-slate-950"
                      : "bg-rose-600 text-white animate-pulse"
                  }`}
                >
                  {onlyFlashSale ? "Semua HP" : "Lihat Flash Sale"}
                </button>
              </div>

              {/* Main Prominent Button: "Semua Jenis & Merek HP" */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAllBrandsOpen(true)}
                  className="flex-1 py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-between shadow-md active:scale-98 transition"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-brand-400" />
                    <span>Semua Jenis & Merek HP</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold flex items-center gap-1">
                    {selectedBrand === "ALL" ? "Semua Merek" : selectedBrand}
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </button>

                <button
                  onClick={() => setIsAllBrandsOpen(true)}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs active:scale-95 transition shrink-0"
                  title="Filter Lengkap"
                >
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                </button>
              </div>

              {/* Horizontal Brand Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: "ALL", label: "Semua HP", icon: "✨" },
                  { id: "Apple", label: "iPhone", icon: "🍎" },
                  { id: "Samsung", label: "Samsung", icon: "📱" },
                  { id: "Xiaomi", label: "Xiaomi", icon: "⚡" },
                  { id: "OPPO", label: "OPPO", icon: "🟢" },
                  { id: "vivo", label: "vivo", icon: "🔵" },
                  { id: "ASUS", label: "ROG", icon: "🎮" },
                  { id: "Google", label: "Pixel", icon: "🔍" },
                  { id: "Infinix", label: "Infinix", icon: "🚀" },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition ${
                      selectedBrand === b.id
                        ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-500/20"
                        : "bg-white text-slate-700 border border-slate-200/80 shadow-xs"
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>

              {/* Section Header: Direct 6 Products indicator */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    {selectedBrand === "ALL" ? "Koleksi Smartphone Siap Kirim" : `Koleksi ${selectedBrand}`}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-bold">
                    ({filteredProducts.length} Unit Ready)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent font-bold text-slate-600 outline-none text-right"
                  >
                    <option value="featured">Rekomendasi</option>
                    <option value="popular">Terlaris</option>
                    <option value="price-asc">Termurah</option>
                    <option value="price-desc">Termahal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ========================================================
                DESKTOP PROMO BANNERS, TRUST BADGES & FLASH SALE BAR
                (Shown on desktop; on mobile we prioritize products first!)
               ======================================================== */}
            <div className="hidden lg:block space-y-8">
              {/* Hero Promo Banners */}
              {store.banners.filter((b) => b.active).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {store.banners
                    .filter((b) => b.active)
                    .slice(0, 2)
                    .map((banner, idx) => (
                      <div
                        key={banner.id}
                        className={`${
                          idx === 0 ? "lg:col-span-7" : "lg:col-span-5"
                        } rounded-3xl bg-gradient-to-br ${
                          banner.bgGradient
                        } text-white p-6 sm:p-8 relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[260px]`}
                      >
                        <div className="relative z-10 max-w-md space-y-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            {banner.badge}
                          </span>
                          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                            {banner.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                            {banner.subtitle}
                          </p>
                        </div>

                        <div className="relative z-10 pt-5 flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => {
                              if (banner.ctaFilterBrand) {
                                setSelectedBrand(banner.ctaFilterBrand);
                              }
                              const el = document.getElementById("catalog-section");
                              el?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-2 shadow-md transition"
                          >
                            <span>{banner.ctaText}</span>
                            <ArrowRight className="w-4 h-4 text-brand-600" />
                          </button>
                          <a
                            href={buildWhatsAppUrl(
                              store.brandConfig.whatsappNumber,
                              `Halo Admin *${store.brandConfig.name}*, saya ingin tanya info promo dan ketersediaan stok HP.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-white text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Konsultasi WhatsApp</span>
                          </a>
                        </div>

                        {/* Decorative Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="hidden sm:block absolute -right-6 -bottom-6 w-52 h-52 object-cover rounded-3xl opacity-35 rotate-6 pointer-events-none"
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Trust Badges Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {store.brandConfig.trustBadges.map((tb, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {tb.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {tb.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FLASH SALE URGENCY BAR WITH COUNTDOWN */}
              <div className="rounded-3xl bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white p-4 sm:p-5 shadow-xl border border-rose-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
                    <Flame className="w-6 h-6 animate-pulse text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                        🔥 FLASH SALE HARI INI
                      </span>
                      <span className="text-xs text-rose-200 font-bold hidden sm:inline">
                        • Harga Coret Spesial Toko
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                      Promo Smartphone Baru & Second Bergaransi Resmi
                    </h3>
                    <p className="text-xs text-rose-200/80">
                      Gratis Asuransi Pengiriman + Bonus Adaptor Fast Charging khusus transaksi hari ini.
                    </p>
                  </div>
                </div>

                {/* Countdown Digits */}
                <div className="flex items-center gap-2 shrink-0 bg-slate-950/60 p-2.5 rounded-2xl border border-rose-700/50">
                  <span className="text-xs font-bold text-rose-200 mr-1 hidden sm:inline">
                    Promo Berakhir:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black">
                    <div className="px-2.5 py-1 rounded-xl bg-rose-950 border border-rose-600/50 text-amber-300 min-w-[38px] text-center">
                      {String(timeLeft.hours).padStart(2, "0")}
                      <span className="block text-[8px] font-sans text-slate-400">JAM</span>
                    </div>
                    <span className="text-rose-400 font-bold">:</span>
                    <div className="px-2.5 py-1 rounded-xl bg-rose-950 border border-rose-600/50 text-amber-300 min-w-[38px] text-center">
                      {String(timeLeft.minutes).padStart(2, "0")}
                      <span className="block text-[8px] font-sans text-slate-400">MNT</span>
                    </div>
                    <span className="text-rose-400 font-bold">:</span>
                    <div className="px-2.5 py-1 rounded-xl bg-rose-950 border border-rose-600/50 text-amber-300 min-w-[38px] text-center">
                      {String(timeLeft.seconds).padStart(2, "0")}
                      <span className="block text-[8px] font-sans text-slate-400">DTK</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter & Sorting Controls */}
              <div
                id="catalog-section"
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Brand Filter Pills */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      "ALL",
                      "Apple",
                      "Samsung",
                      "Xiaomi",
                      "ASUS",
                      "OPPO",
                      "vivo",
                      "Google",
                    ].map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition ${
                          selectedBrand === brand
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {brand === "ALL" ? "Semua Merk" : brand}
                      </button>
                    ))}
                  </div>

                  {/* Sort Select */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs font-semibold text-slate-400">
                      Urutkan:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:border-brand-600"
                    >
                      <option value="featured">Rekomendasi Unggulan</option>
                      <option value="popular">Paling Laris</option>
                      <option value="price-asc">Harga Terendah</option>
                      <option value="price-desc">Harga Tertinggi</option>
                    </select>
                  </div>
                </div>

                {/* Condition & Flash Deal Filter */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  {[
                    { id: "ALL", label: "Semua Kondisi" },
                    { id: "Baru (BNIB)", label: "Baru (Segel BNIB)" },
                    {
                      id: "Bekas - Like New (Grade A+)",
                      label: "Second Like New (Grade A+)",
                    },
                    { id: "Bekas - Mulus (Grade A)", label: "Second Mulus (Grade A)" },
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => setSelectedCondition(cond.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCondition === cond.id
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setOnlyFlashSale(!onlyFlashSale)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      onlyFlashSale
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Promo Flash Sale</span>
                  </button>

                  <span className="ml-auto text-xs font-semibold text-slate-400">
                    Menampilkan <strong>{filteredProducts.length}</strong> unit siap kirim
                  </span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">
                  Unit tidak ditemukan
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba ubah filter pencarian atau hubungi Admin kami untuk request tipe smartphone yang Anda cari.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand("ALL");
                    setSelectedCondition("ALL");
                    setSelectedPriceRange("ALL");
                    setOnlyFlashSale(false);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Reset Filter Katalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                {displayedProducts.map((product) => {
                  const primaryVariant = product.variants[0];
                  const badge = getConditionBadgeStyle(product.condition);
                  const isWished = wishlist.includes(product.id);
                  const isCompared = compareIds.includes(product.id);
                  const totalStock = product.variants.reduce(
                    (acc, v) => acc + v.stock,
                    0
                  );

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-brand-500/60 overflow-hidden shadow-xs sm:shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Image Header */}
                        <div className="relative aspect-square sm:aspect-[4/3] bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            onClick={() => setDetailProduct(product)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          />

                          {/* Top Left Condition Badge */}
                          <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 flex flex-col gap-1">
                            <span
                              className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border shadow-xs backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.shortLabel}
                            </span>
                            {product.flashSale && (
                              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-rose-600 text-white shadow-xs flex items-center gap-0.5 w-fit">
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> FLASH SALE
                              </span>
                            )}
                          </div>

                          {/* Bottom Right Photo Count Badge */}
                          {product.images.length > 1 && (
                            <div className="hidden sm:flex absolute bottom-2.5 right-2.5 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow items-center gap-1 pointer-events-none">
                              📷 {product.images.length} Foto
                            </div>
                          )}

                          {/* Top Right Wishlist & Compare */}
                          <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 flex flex-col gap-1">
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md shadow-xs transition ${
                                isWished
                                  ? "bg-rose-600 text-white"
                                  : "bg-white/90 text-slate-700 hover:bg-white"
                              }`}
                              title="Simpan ke Favorit"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                  isWished ? "fill-white" : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => toggleCompare(product.id)}
                              className={`hidden sm:flex p-2 rounded-full backdrop-blur-md shadow-xs transition ${
                                isCompared
                                  ? "bg-brand-600 text-white"
                                  : "bg-white/90 text-slate-700 hover:bg-white"
                              }`}
                              title="Bandingkan Spesifikasi"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Bottom Strip: Battery Health & IMEI */}
                          <div className="absolute bottom-1 sm:bottom-2.5 left-1 sm:left-3 right-1 sm:right-3 flex items-center justify-between gap-1 bg-slate-950/85 backdrop-blur-md text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px]">
                            <span className="flex items-center gap-0.5 font-semibold text-emerald-300 truncate">
                              <BatteryCharging className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span className="truncate">BH: {product.inspection.batteryHealth}</span>
                            </span>
                            <span className="flex items-center gap-0.5 truncate text-slate-200">
                              <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400 shrink-0" />
                              <span className="truncate">
                                {product.inspection.imeiStatus.includes("Resmi")
                                  ? "Resmi"
                                  : "Aman"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-2 sm:p-5 space-y-1 sm:space-y-3.5">
                          <div>
                            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">
                              <span className="font-bold uppercase tracking-wider text-slate-500 truncate max-w-[65%]">
                                {product.brand}
                              </span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                                {product.rating.toFixed(1)}
                              </span>
                            </div>

                            <h3
                              onClick={() => setDetailProduct(product)}
                              className="text-xs sm:text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                              title={product.name}
                            >
                              {product.name}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-0.5 truncate">
                              ✓ {product.warranty}
                            </p>
                          </div>

                          {/* Available Variants Preview */}
                          <div className="flex flex-wrap gap-1">
                            {product.variants.slice(0, 2).map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-100 text-slate-700"
                              >
                                <span
                                  className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full border border-slate-300 shrink-0"
                                  style={{
                                    backgroundColor: v.colorHex || "#334155",
                                  }}
                                />
                                {v.ram}/{v.storage}
                              </span>
                            ))}
                            {product.variants.length > 2 && (
                              <span className="text-[9px] sm:text-[11px] text-slate-400 font-semibold self-center">
                                +{product.variants.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Price & Urgency */}
                          {(() => {
                            const cardOriginal =
                              primaryVariant?.originalPrice ||
                              Math.round((primaryVariant?.price || 0) * 1.15);
                            const cardPrice = primaryVariant?.price || 0;
                            const cardSavings =
                              cardOriginal > cardPrice ? cardOriginal - cardPrice : 0;
                            const cardPct =
                              cardOriginal > cardPrice
                                ? Math.round((cardSavings / cardOriginal) * 100)
                                : 0;

                            return (
                              <div className="pt-1.5 sm:pt-2 border-t border-slate-100 space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
                                    Harga Promo
                                  </span>
                                  {cardPct > 0 && (
                                    <span className="px-1 sm:px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] sm:text-[10px] font-black">
                                      -{cardPct}%
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                                  <div>
                                    <div className="text-xs sm:text-xl font-black text-rose-600">
                                      {formatRupiah(cardPrice)}
                                    </div>
                                    {cardOriginal > cardPrice && (
                                      <div className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                                        {formatRupiah(cardOriginal)}
                                      </div>
                                    )}
                                  </div>

                                  <span
                                    className={`text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-md w-fit ${
                                      totalStock > 0
                                        ? totalStock <= 3
                                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                                          : "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                    }`}
                                  >
                                    {totalStock > 0
                                      ? totalStock <= 3
                                        ? `Sisa ${totalStock}`
                                        : `Stok ${totalStock}`
                                      : "Habis"}
                                  </span>
                                </div>

                                {/* Live Viewers Counter (Desktop) */}
                                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-0.5">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                                  </span>
                                  <span className="text-rose-700 font-extrabold">
                                    {8 + (product.name.length % 9)} orang
                                  </span>{" "}
                                  sedang melihat unit ini
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="p-2 sm:px-5 sm:pb-5 sm:pt-2 grid grid-cols-2 gap-1.5 sm:gap-2.5">
                        <button
                          onClick={() => setDetailProduct(product)}
                          className="py-1.5 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] sm:text-xs text-center transition"
                        >
                          Detail
                        </button>
                        <button
                          disabled={!primaryVariant || primaryVariant.stock <= 0}
                          onClick={() =>
                            primaryVariant &&
                            addToCart(product, primaryVariant, 1)
                          }
                          className="py-1.5 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>+ Beli</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button for 100+ Catalog Performance */}
                {filteredProducts.length > visibleCount && (
                  <div className="col-span-full pt-6 pb-2 text-center space-y-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 transition active:scale-95 inline-flex items-center gap-2"
                    >
                      <span>Muat Lebih Banyak Unit (+12 Unit)</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
                        Tersisa {filteredProducts.length - visibleCount} Unit
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Menampilkan <strong>{Math.min(visibleCount, filteredProducts.length)}</strong> dari <strong>{filteredProducts.length}</strong> unit siap kirim
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                MOBILE SECTION: Promo Banners & Trust Badges (Placed below top 6 products on mobile)
               ======================================================== */}
            <div className="lg:hidden space-y-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Promo Spesial & Keunggulan Toko
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">100% Amanah</span>
              </div>

              {/* Mobile Promo Banners Carousel */}
              {store.banners.filter((b) => b.active).length > 0 && (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
                  {store.banners
                    .filter((b) => b.active)
                    .map((banner) => (
                      <div
                        key={banner.id}
                        className={`min-w-[85vw] snap-center rounded-2xl bg-gradient-to-br ${banner.bgGradient} text-white p-4 relative overflow-hidden shadow-md flex flex-col justify-between`}
                      >
                        <div className="relative z-10 space-y-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            {banner.badge}
                          </span>
                          <h4 className="text-base font-black tracking-tight leading-snug">
                            {banner.title}
                          </h4>
                          <p className="text-[11px] text-white/80 line-clamp-2">
                            {banner.subtitle}
                          </p>
                        </div>
                        <div className="relative z-10 pt-3 flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (banner.ctaFilterBrand) setSelectedBrand(banner.ctaFilterBrand);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-[11px] font-extrabold flex items-center gap-1 shadow-sm"
                          >
                            <span>{banner.ctaText}</span>
                            <ArrowRight className="w-3 h-3 text-brand-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Mobile Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-2">
                {store.brandConfig.trustBadges.slice(0, 4).map((tb, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold text-slate-900 leading-tight">
                        {tb.title}
                      </h5>
                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">
                        {tb.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Semua Jenis HP Modal */}
      <AllBrandsModal
        isOpen={isAllBrandsOpen}
        onClose={() => setIsAllBrandsOpen(false)}
        selectedBrand={selectedBrand}
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          setIsAllBrandsOpen(false);
        }}
        selectedCondition={selectedCondition}
        onSelectCondition={(cond) => {
          setSelectedCondition(cond);
          setIsAllBrandsOpen(false);
        }}
        selectedPriceRange={selectedPriceRange}
        onSelectPriceRange={(range) => {
          setSelectedPriceRange(range);
          setIsAllBrandsOpen(false);
        }}
        brandCounts={brandCounts}
        totalProducts={store.products.length}
      />

      {/* Wishlist Modal */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Daftar HP Favorit Saya ({wishlistProducts.length})
              </h3>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {wishlistProducts.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">
                Belum ada HP yang disimpan ke daftar favorit.
              </p>
            ) : (
              <div className="space-y-3">
                {wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{p.condition}</p>
                        <p className="text-xs font-black text-brand-700">
                          {formatRupiah(p.variants[0]?.price || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsWishlistOpen(false);
                          setDetailProduct(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating WhatsApp Customer Service (Desktop only, mobile has bottom bar) */}
      <a
        href={buildWhatsAppUrl(
          store.brandConfig.whatsappNumber,
          `Halo Admin *${store.brandConfig.name}*, saya ingin konsultasi pembelian / tukar tambah HP.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:flex fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 items-center gap-2 text-xs font-extrabold transition hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Chat WA Admin</span>
      </a>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              {store.brandConfig.logoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={store.brandConfig.logoUrl}
                    alt={store.brandConfig.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center">
                  {store.brandConfig.logoTextIcon || "RP"}
                </div>
              )}
              <span className="text-lg font-extrabold text-white">
                {store.brandConfig.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {store.brandConfig.tagline}. Setiap unit melalui proses inspeksi 35+ titik ketat dengan jaminan sinyal IMEI aman permanen.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-300 font-medium">{store.brandConfig.storeAddress}</span>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={
                          store.brandConfig.mapsUrl ||
                          `https://maps.google.com/?q=${encodeURIComponent(
                            store.brandConfig.storeAddress
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white text-[11px] font-bold border border-slate-700 shadow-sm transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-brand-400" />
                        <span>Buka di Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const targetMapsUrl =
                            store.brandConfig.mapsUrl ||
                            `https://maps.google.com/?q=${encodeURIComponent(
                              store.brandConfig.storeAddress
                            )}`;
                          navigator.clipboard.writeText(
                            `${store.brandConfig.name}\nAlamat: ${store.brandConfig.storeAddress}\nGoogle Maps: ${targetMapsUrl}`
                          );
                          showToast("Alamat & Link Google Maps berhasil disalin!");
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/80 transition"
                        title="Salin Alamat & Link Google Maps"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link Maps</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{store.brandConfig.operationalHours}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider">
              Menu Utama
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="hover:text-white transition"
                >
                  Katalog HP Baru & Second
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsCompareOpen(true)}
                  className="hover:text-white transition"
                >
                  Bandingkan Spesifikasi ({compareIds.length}/3)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="hover:text-white transition"
                >
                  Wishlist & Favorit ({wishlist.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider">
              Layanan CS & Jaminan Toko
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Seluruh unit telah melalui inspeksi ketat 35+ titik QC. Jaminan sinyal aman permanen, bebas blokir IMEI, dan siap kirim ke seluruh kota di Indonesia dengan packing kayu & asuransi penuh.
            </p>
            <div className="pt-1">
              <a
                href={buildWhatsAppUrl(
                  store.brandConfig.whatsappNumber,
                  `Halo Admin *${store.brandConfig.name}*, saya ingin tanya stok dan promo HP.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi WhatsApp Sekarang</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/80 py-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <span>© {new Date().getFullYear()} {store.brandConfig.name}. All rights reserved.</span>
          <a
            href="/admin"
            className="text-slate-600 hover:text-slate-400 transition ml-1 inline-flex items-center"
            title="Akses Pemilik Toko"
          >
            <Lock className="w-3 h-3 opacity-30 hover:opacity-100" />
          </a>
        </div>
      </footer>

      {/* Floating Live Purchase Notification (Social Proof Fiktif Otomatis) */}
      <LivePurchaseNotification
        products={store.products}
        onSelectProduct={(p) => setDetailProduct(p)}
      />

      {/* ========================================================
          MOBILE BOTTOM APP NAVIGATION BAR (Tokopedia / Shopee style)
         ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab("catalog");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition active:scale-95 ${
            activeTab === "catalog" ? "text-brand-600" : "text-slate-500"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Katalog</span>
        </button>

        <button
          onClick={() => setIsAllBrandsOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-600 hover:text-brand-600 transition active:scale-95"
        >
          <Smartphone className="w-5 h-5 text-brand-600" />
          <span>Semua HP</span>
        </button>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-500 hover:text-rose-600 transition active:scale-95"
        >
          <Heart className="w-5 h-5" />
          <span>Favorit</span>
          {wishlist.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-500 hover:text-brand-600 transition active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Keranjang</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-black flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>

        <a
          href={buildWhatsAppUrl(
            store.brandConfig.whatsappNumber,
            `Halo Admin *${store.brandConfig.name}*, saya ingin tanya ketersediaan stok smartphone.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 transition active:scale-95"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Chat WA</span>
        </a>
      </div>
    </div>
  );
}
