"use client";

import React from "react";
import {
  X,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

interface AllBrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  selectedPriceRange: string;
  onSelectPriceRange: (range: string) => void;
  brandCounts: Record<string, number>;
  totalProducts: number;
}

const BRANDS = [
  { id: "ALL", name: "Semua Merek", icon: "✨", subtitle: "Seluruh Katalog HP" },
  { id: "Apple", name: "Apple iPhone", icon: "🍎", subtitle: "iBox & Inter All Operator" },
  { id: "Samsung", name: "Samsung Galaxy", icon: "📱", subtitle: "S Series, Z Fold & Flip, A Series" },
  { id: "Xiaomi", name: "Xiaomi / POCO", icon: "⚡", subtitle: "Flagship, Redmi & Gaming" },
  { id: "OPPO", name: "OPPO Series", icon: "🟢", subtitle: "Find N, Reno & A Series" },
  { id: "vivo", name: "vivo Series", icon: "🔵", subtitle: "X Series Zeiss & V Series" },
  { id: "ASUS", name: "ASUS ROG Gaming", icon: "🎮", subtitle: "ROG Phone & Zenfone" },
  { id: "Google", name: "Google Pixel", icon: "🔍", subtitle: "Pixel Kamera Flagship" },
  { id: "Infinix", name: "Infinix / Tecno", icon: "🚀", subtitle: "Gaming Budget Mantap" },
];

const CONDITIONS = [
  { id: "ALL", label: "Semua Kondisi" },
  { id: "Baru (BNIB)", label: "Baru Segel (BNIB Resmi)" },
  { id: "Bekas - Like New (Grade A+)", label: "Second Like New 99% Mulus" },
  { id: "Bekas - Mulus (Grade A)", label: "Second Mulus 95% Wajar" },
];

const PRICE_RANGES = [
  { id: "ALL", label: "Semua Harga" },
  { id: "under5m", label: "Di bawah Rp 5 Juta" },
  { id: "5m-10m", label: "Rp 5 Juta - Rp 10 Juta" },
  { id: "10m-20m", label: "Rp 10 Juta - Rp 20 Juta" },
  { id: "above20m", label: "Flagship di atas Rp 20 Juta" },
];

export default function AllBrandsModal({
  isOpen,
  onClose,
  selectedBrand,
  onSelectBrand,
  selectedCondition,
  onSelectCondition,
  selectedPriceRange,
  onSelectPriceRange,
  brandCounts,
  totalProducts,
}: AllBrandsModalProps) {
  if (!isOpen) return null;

  const handleReset = () => {
    onSelectBrand("ALL");
    onSelectCondition("ALL");
    onSelectPriceRange("ALL");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col justify-between">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Semua Jenis & Merek HP
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih kategori smartphone yang ingin Anda cari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Section 1: Brand Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Pilih Merek Smartphone</span>
              <span className="text-[10px] font-bold text-slate-400">
                Total {totalProducts} Unit Ready
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BRANDS.map((b) => {
                const count = brandCounts[b.id] ?? 0;
                const isSelected = selectedBrand === b.id;

                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectBrand(b.id)}
                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-brand-500/20"
                        : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{b.icon}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-black truncate">{b.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {count > 0 ? `${count} Unit Tersedia` : "Stok Kosong"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Condition Filter */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800">
              Kondisi Smartphone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => {
                const isSelected = selectedCondition === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCondition(c.id)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Price Range */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800">
              Rentang Harga
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((r) => {
                const isSelected = selectedPriceRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectPriceRange(r.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition active:scale-98"
          >
            <span>Terapkan Filter & Lihat Produk</span>
          </button>
        </div>
      </div>
    </div>
  );
}