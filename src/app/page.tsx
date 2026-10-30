"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import Navbar from "@/components/Navbar";
import ProductDetailModal from "@/components/ProductDetailModal";
import CompareModal from "@/components/CompareModal";
import CartCheckoutDrawer from "@/components/CartCheckoutDrawer";
import LivePurchaseNotification from "@/components/LivePurchaseNotification";
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
  const [onlyFlashSale, setOnlyFlashSale] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "popular"
  >("featured");

  // Modals & Drawers
  const [detailProduct, setDetailProduct] = useState<PhoneProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Live Flash Sale Urgency Countdown Timer (ticks every second)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 24, seconds: 18 });

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
    onlyFlashSale,
    searchQuery,
    sortBy,
  ]);

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
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
                    setOnlyFlashSale(false);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Reset Filter Katalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
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
                      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-brand-500/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Image Header */}
                        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            onClick={() => setDetailProduct(product)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          />

                          {/* Top Left Condition Badge */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.shortLabel}
                            </span>
                            {product.flashSale && (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-sm flex items-center gap-1 w-fit">
                                <Sparkles className="w-3 h-3" /> FLASH SALE
                              </span>
                            )}
                          </div>

                          {/* Bottom Right Photo Count Badge */}
                          {product.images.length > 1 && (
                            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 pointer-events-none">
                              📷 {product.images.length} Foto
                            </div>
                          )}

                          {/* Top Right Wishlist & Compare */}
                          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`p-2 rounded-full backdrop-blur-md shadow-sm transition ${
                                isWished
                                  ? "bg-rose-600 text-white"
                                  : "bg-white/90 text-slate-700 hover:bg-white"
                              }`}
                              title="Simpan ke Favorit"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isWished ? "fill-white" : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => toggleCompare(product.id)}
                              className={`p-2 rounded-full backdrop-blur-md shadow-sm transition ${
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
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 bg-slate-950/75 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px]">
                            <span className="flex items-center gap-1 font-semibold text-emerald-300">
                              <BatteryCharging className="w-3.5 h-3.5" /> BH:{" "}
                              {product.inspection.batteryHealth}
                            </span>
                            <span className="flex items-center gap-1 truncate text-slate-200">
                              <Radio className="w-3 h-3 text-sky-400 shrink-0" />
                              {product.inspection.imeiStatus.includes("Resmi")
                                ? "IMEI Resmi Indo"
                                : "IMEI Aman"}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3.5">
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span className="font-bold uppercase tracking-wider text-slate-500">
                                {product.brand}
                              </span>
                              <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {product.rating.toFixed(1)}{" "}
                                <span className="text-slate-400 font-normal">
                                  ({product.soldCount} terjual)
                                </span>
                              </span>
                            </div>

                            <h3
                              onClick={() => setDetailProduct(product)}
                              className="text-lg font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                            >
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                              ✓ {product.warranty}
                            </p>
                          </div>

                          {/* Available Variants Preview */}
                          <div className="flex flex-wrap gap-1.5">
                            {product.variants.map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                  style={{
                                    backgroundColor: v.colorHex || "#334155",
                                  }}
                                />
                                {v.ram}/{v.storage}
                              </span>
                            ))}
                          </div>

                          {/* Price & Strikethrough & High Urgency */}
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
                              <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">
                                    Harga Promo Spesial
                                  </span>
                                  {cardPct > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black tracking-wide">
                                      Hemat {cardPct}%
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-baseline justify-between gap-2">
                                  <div>
                                    <div className="text-xl font-black text-rose-600">
                                      {formatRupiah(cardPrice)}
                                    </div>
                                    {cardOriginal > cardPrice && (
                                      <div className="text-xs text-slate-400 line-through font-medium">
                                        {formatRupiah(cardOriginal)}
                                      </div>
                                    )}
                                  </div>

                                  <span
                                    className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                      totalStock > 0
                                        ? totalStock <= 3
                                          ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                          : "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                    }`}
                                  >
                                    {totalStock > 0
                                      ? totalStock <= 3
                                        ? `⚡ Sisa ${totalStock} Unit!`
                                        : `Stok ${totalStock}`
                                      : "Habis"}
                                  </span>
                                </div>

                                {/* Live Viewers Counter */}
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-0.5">
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
                      <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => setDetailProduct(product)}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                        >
                          Detail & Laporan QC
                        </button>
                        <button
                          disabled={!primaryVariant || primaryVariant.stock <= 0}
                          onClick={() =>
                            primaryVariant &&
                            addToCart(product, primaryVariant, 1)
                          }
                          className="py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/20 transition disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* Floating WhatsApp Customer Service */}
      <a
        href={buildWhatsAppUrl(
          store.brandConfig.whatsappNumber,
          `Halo Admin *${store.brandConfig.name}*, saya ingin konsultasi pembelian / tukar tambah HP.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 text-xs font-extrabold transition hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Chat WA Admin</span>
      </a>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
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
                  {store.brandConfig.logoTextIcon || "NP"}
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
    </div>
  );
}
