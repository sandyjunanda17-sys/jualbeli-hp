"use client";

import React, { useState } from "react";
import { PhoneProduct, PhoneVariant } from "@/types/store";
import { useStore } from "@/context/StoreContext";
import {
  buildWhatsAppUrl,
  formatRupiah,
  getConditionBadgeStyle,
} from "@/utils/format";
import {
  X,
  ShieldCheck,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  Camera,
  Smartphone,
  ShoppingBag,
  Repeat,
  MessageCircle,
  Star,
  Box,
  Radio,
  ScanFace,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductDetailModalProps {
  product: PhoneProduct | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onOpenCart,
}: ProductDetailModalProps) {
  const { store, addToCart } = useStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!product) return null;

  const currentVariant =
    product.variants[selectedVariantIdx] || product.variants[0];
  const badgeStyle = getConditionBadgeStyle(product.condition);
  const images =
    product.images.length > 0
      ? product.images
      : [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
        ];

  const handleBuyNow = () => {
    addToCart(product, currentVariant, 1);
    onClose();
    onOpenCart();
  };

  const waMessage = `Halo Admin *${store.brandConfig.name}*, saya tertarik dengan unit:\n\n📱 *${product.name}*\n• Kondisi: ${product.condition}\n• Varian: ${currentVariant.ram}/${currentVariant.storage} - ${currentVariant.color}\n• Harga: ${formatRupiah(currentVariant.price)}\n\nApakah unit ini masih ready?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {product.brand}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {product.condition}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery Slider (Up to 5 Photos, Swipeable) */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStart === null) return;
                const touchEnd = e.changedTouches[0].clientX;
                const diff = touchStart - touchEnd;
                if (diff > 35) {
                  // Swipe kiri -> foto berikutnya
                  setActiveImageIdx((prev) => (prev + 1) % images.length);
                } else if (diff < -35) {
                  // Swipe kanan -> foto sebelumnya
                  setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
                }
                setTouchStart(null);
              }}
              className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group select-none shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover bg-white transition-opacity duration-200"
              />

              {product.flashSale && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> FLASH SALE
                </div>
              )}

              {/* Photo Counter Badge */}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                📷 {activeImageIdx + 1}/{images.length}
              </div>

              {/* Slider Left & Right Arrow Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95"
                    title="Foto Sebelumnya (Geser Kiri)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95"
                    title="Foto Berikutnya (Geser Kanan)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Swipe Guide Hint for Mobile */}
              {images.length > 1 && (
                <div className="sm:hidden absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] text-white/90">
                  Geser layar untuk lihat foto lain
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Maksimal 5 Foto) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIdx === i
                        ? "border-brand-600 ring-2 ring-brand-500/20 scale-105"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-white bg-slate-900/70 px-1 rounded">
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Laporan QC & Inspeksi Transparan */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Laporan QC & Inspeksi Unit
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Lulus 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Battery Health
                  </span>
                  <p className="font-bold text-slate-800">
                    {product.inspection.batteryHealth}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Radio className="w-3.5 h-3.5 text-brand-600" /> Status IMEI & Sinyal
                  </span>
                  <p className="font-bold text-slate-800">
                    {product.inspection.imeiStatus}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <ScanFace className="w-3.5 h-3.5 text-indigo-600" /> Biometrik / Sensor
                  </span>
                  <p className="font-bold text-slate-800">
                    {product.inspection.faceIdOrFingerprint}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kondisi Fisik & Layar
                  </span>
                  <p className="font-bold text-slate-800">
                    {product.inspection.bodyCondition}
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                  <Box className="w-3.5 h-3.5 text-slate-600" /> Kelengkapan Dalam Kotak:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.inspection.completeness.map((item, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info, Variant Picker, Specs & CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" /> {product.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>Terjual {product.soldCount} unit</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{product.warranty}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {product.name}
                </h2>
              </div>

              {/* Price Box with Strikethrough & High Urgency */}
              {(() => {
                const effectiveOriginalPrice =
                  currentVariant.originalPrice || Math.round(currentVariant.price * 1.15);
                const savingsAmount =
                  effectiveOriginalPrice > currentVariant.price
                    ? effectiveOriginalPrice - currentVariant.price
                    : 0;
                const savingsPercent =
                  effectiveOriginalPrice > currentVariant.price
                    ? Math.round((savingsAmount / effectiveOriginalPrice) * 100)
                    : 0;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 via-slate-50 to-brand-50/50 border border-rose-200/80 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">
                            Harga Promo ({currentVariant.ram}/{currentVariant.storage} - {currentVariant.color}):
                          </span>
                          {savingsPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                              Diskon {savingsPercent}%
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 mt-1.5">
                          <span className="text-2xl sm:text-4xl font-black text-rose-600">
                            {formatRupiah(currentVariant.price)}
                          </span>
                          {effectiveOriginalPrice > currentVariant.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                                {formatRupiah(effectiveOriginalPrice)}
                              </span>
                              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                Hemat {formatRupiah(savingsAmount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${
                            currentVariant.stock > 0
                              ? currentVariant.stock <= 3
                                ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                : "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {currentVariant.stock > 0
                            ? currentVariant.stock <= 3
                              ? `⚡ Sisa ${currentVariant.stock} Unit Lagi!`
                              : `Stok Ready (${currentVariant.stock} Unit)`
                            : "Stok Habis"}
                        </span>
                      </div>
                    </div>

                    {/* Live Social Proof Urgency Banner */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="flex items-center gap-1.5 font-extrabold text-rose-700">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        14 orang sedang melihat unit ini sekarang
                      </span>
                      <span className="text-slate-500 font-medium">
                        ⚡ Permintaan tinggi, unit second mulus cepat laku!
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Variant Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Pilih Varian Memori & Warna:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v, idx) => {
                    const isSelected = idx === selectedVariantIdx;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-300 shrink-0 shadow-inner"
                            style={{ backgroundColor: v.colorHex || "#334155" }}
                          />
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {v.ram} / {v.storage}
                            </div>
                            <div className="text-[11px] text-slate-500">{v.color}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-brand-700">
                            {formatRupiah(v.price)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Stok: {v.stock}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Deskripsi & Catatan Unit
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Technical Specs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Spesifikasi Utama
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Layar</span>
                      <span className="font-semibold text-slate-800">{product.specs.screen}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Chipset / Prosesor</span>
                      <span className="font-semibold text-slate-800">{product.specs.processor}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Kamera</span>
                      <span className="font-semibold text-slate-800">{product.specs.camera}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                    <BatteryCharging className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Baterai & Pengisian</span>
                      <span className="font-semibold text-slate-800">{product.specs.battery}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={currentVariant.stock <= 0}
                onClick={() => addToCart(product, currentVariant, 1)}
                className="px-4 py-3.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-brand-200 transition disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang</span>
              </button>

              <button
                disabled={currentVariant.stock <= 0}
                onClick={handleBuyNow}
                className="px-4 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition disabled:opacity-50"
              >
                <span>Beli Sekarang</span>
              </button>

              <a
                href={buildWhatsAppUrl(store.brandConfig.whatsappNumber, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Tanya Video Fisik, Garansi & Nego via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
