"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppUrl } from "@/utils/format";
import {
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  ShieldCheck,
  Search,
  Sparkles,
  Smartphone,
  MessageCircle,
} from "lucide-react";

interface NavbarProps {
  activeTab?: "catalog" | "admin";
  setActiveTab?: (tab: "catalog" | "admin") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCart: () => void;
  onOpenCompare: () => void;
  onOpenWishlistModal: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenCart,
  onOpenCompare,
  onOpenWishlistModal,
}: NavbarProps) {
  const { store, cart, wishlist, compareIds, syncStatus } = useStore();
  const { brandConfig } = store;

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Announcement Bar */}
      {brandConfig.announcementActive && brandConfig.announcementBar && (
        <div className="bg-brand-600 text-white text-xs sm:text-sm py-2 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{brandConfig.announcementBar}</span>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs text-white/95">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Garansi Toko & Sinyal IMEI Permanen
              </span>
              <span className="text-white/50">•</span>
              <span className="font-semibold text-amber-200">
                Fast Response CS WhatsApp
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab?.("catalog");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              {brandConfig.logoUrl ? (
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brandConfig.logoUrl}
                    alt={brandConfig.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-brand-500/20 shrink-0 group-hover:scale-105 transition-transform">
                  {brandConfig.logoTextIcon || <Smartphone className="w-6 h-6" />}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                    {brandConfig.name}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    <ShieldCheck className="w-3 h-3" /> Verified Store
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{brandConfig.tagline}</p>
              </div>
            </button>

            {/* Mobile quick actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={onOpenWishlistModal}
                className="relative p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition"
                aria-label="Wishlist HP Favorit"
              >
                <Heart className="w-5 h-5 text-slate-600" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition"
                aria-label="Keranjang"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "catalog") setActiveTab?.("catalog");
                }}
                placeholder="Cari iPhone 15 Pro, Galaxy S24 Ultra, ROG Phone, iBox..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-xl text-sm text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenCompare}
              className="relative px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Bandingkan Spesifikasi HP"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>Bandingkan</span>
              {compareIds.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                  {compareIds.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenWishlistModal}
              className="relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              title="HP Favorit Saya"
            >
              <Heart className="w-5 h-5 text-slate-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-brand-600/20 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Keranjang</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-brand-700 text-[11px] font-extrabold">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Pills (Desktop & Tablet) */}
        <nav className="hidden sm:flex items-center gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab("catalog");
              const el = document.getElementById("catalog-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 bg-brand-600 text-white shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>Katalog HP Baru & Second</span>
          </button>

          <button
            onClick={onOpenCompare}
            className="lg:hidden px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 text-slate-600 hover:bg-slate-100 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bandingkan ({compareIds.length})</span>
          </button>

          <a
            href={buildWhatsAppUrl(
              brandConfig.whatsappNumber,
              `Halo CS *${brandConfig.name}*, saya ingin tanya stok dan info promo HP hari ini.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shrink-0 flex items-center gap-1.5 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat CS WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
