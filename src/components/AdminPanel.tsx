"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import {
  BrandConfig,
  Order,
  PhoneCondition,
  PhoneProduct,
  PhoneVariant,
  PromoBanner,
  TradeInSubmission,
  Voucher,
} from "@/types/store";
import { buildWhatsAppUrl, formatRupiah, formatShortDate } from "@/utils/format";
import { processImageFile } from "@/utils/imageOptimizer";
import {
  Palette,
  Smartphone,
  ShoppingBag,
  Repeat,
  Megaphone,
  Database,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  CheckCircle2,
  ExternalLink,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Cloud,
  Server,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

export default function AdminPanel({
  onBackToStore,
}: {
  onBackToStore: () => void;
}) {
  const {
    store,
    syncStatus,
    metaInfo,
    updateBrandConfig,
    saveProduct,
    deleteProduct,
    saveBanner,
    deleteBanner,
    saveVoucher,
    deleteVoucher,
    updateOrderStatus,
    updateTradeInStatus,
    resetToDefaultData,
    importStoreJson,
    showToast,
  } = useStore();

  const [subTab, setSubTab] = useState<
    "brand" | "products" | "marketing" | "database"
  >("brand");

  // Brand form state
  const [brandForm, setBrandForm] = useState<BrandConfig>(store.brandConfig);

  // Product Editor Modal state
  const [editingProduct, setEditingProduct] = useState<PhoneProduct | null>(null);
  const [completenessText, setCompletenessText] = useState("");
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [newImageUrlInput, setNewImageUrlInput] = useState("");

  // Banner & Voucher state
  const [newBanner, setNewBanner] = useState<Partial<PromoBanner>>({
    title: "",
    subtitle: "",
    badge: "PROMO SPESIAL",
    ctaText: "Lihat Promo",
    bgGradient: "from-slate-900 via-blue-950 to-indigo-950",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
    active: true,
  });

  const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({
    code: "",
    discountAmount: 200000,
    minPurchase: 3000000,
    description: "",
    active: true,
  });

  // Handle Logo Image Upload with auto-optimization (any format, max 400x400)
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await processImageFile(file, 400, 400, 0.9);
      setBrandForm((prev) => ({ ...prev, logoUrl: optimized }));
      showToast("Logo berhasil dimuat & dioptimasi otomatis!");
    } catch {
      showToast("Gagal memproses file gambar logo.");
    }
  };

  // Handle Product Images Upload with multi-file auto compression & max 5 photos limit
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    const currentCount = editingProduct.images.length;
    if (currentCount >= 5) {
      showToast("Maksimal 5 foto per produk sudah terpenuhi.");
      return;
    }

    const availableSlots = 5 - currentCount;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    setIsCompressingImage(true);
    try {
      const processed: string[] = [];
      for (const file of filesToProcess) {
        const dataUrl = await processImageFile(file, 1000, 1000, 0.82);
        processed.push(dataUrl);
      }
      setEditingProduct({
        ...editingProduct,
        images: [...editingProduct.images, ...processed],
      });
      showToast(`${processed.length} foto berhasil dioptimasi & ditambahkan!`);
    } catch {
      showToast("Gagal memproses beberapa file foto.");
    } finally {
      setIsCompressingImage(false);
      e.target.value = "";
    }
  };

  // Add Product Image via external URL
  const handleAddImageUrl = () => {
    if (!editingProduct) return;
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) {
      showToast("Masukkan link URL gambar terlebih dahulu.");
      return;
    }
    if (editingProduct.images.length >= 5) {
      showToast("Maksimal 5 foto per produk sudah terpenuhi.");
      return;
    }
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, trimmed],
    });
    setNewImageUrlInput("");
    showToast("Foto berhasil ditambahkan dari URL!");
  };

  // Make selected photo primary (slot 1)
  const handleSetPrimaryImage = (idx: number) => {
    if (!editingProduct || idx === 0) return;
    const imgs = [...editingProduct.images];
    const [selected] = imgs.splice(idx, 1);
    imgs.unshift(selected);
    setEditingProduct({ ...editingProduct, images: imgs });
    showToast("Foto utama produk berhasil diatur!");
  };

  // Move photo left/right
  const handleMoveImage = (idx: number, direction: "left" | "right") => {
    if (!editingProduct) return;
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editingProduct.images.length) return;
    const imgs = [...editingProduct.images];
    const temp = imgs[idx];
    imgs[idx] = imgs[targetIdx];
    imgs[targetIdx] = temp;
    setEditingProduct({ ...editingProduct, images: imgs });
  };

  const openNewProductModal = () => {
    const fresh: PhoneProduct = {
      id: `prod-${Date.now()}`,
      name: "",
      brand: "Apple",
      condition: "Bekas - Like New (Grade A+)",
      warranty: "Garansi Toko 30 Hari Full Coverage",
      featured: true,
      flashSale: false,
      rating: 5.0,
      soldCount: 0,
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Unit pilihan berkualitas tinggi, telah lulus 35+ titik inspeksi Quality Control. Sinyal & IMEI dijamin aman permanen.",
      variants: [
        {
          id: `v-${Date.now()}`,
          ram: "8GB",
          storage: "256GB",
          color: "Titanium Black",
          colorHex: "#27272a",
          price: 10999000,
          originalPrice: 11999000,
          stock: 5,
        },
      ],
      specs: {
        screen: "6.7\" OLED 120Hz",
        processor: "Flagship SoC",
        camera: "48 MP Triple Camera OIS",
        battery: "4500 mAh Fast Charging",
        os: "iOS / Android Terbaru",
        network: "5G All Operator",
        sim: "Dual SIM",
      },
      inspection: {
        batteryHealth: "96% Original",
        imeiStatus: "Resmi Indonesia (SEIN/iBox/TAM)",
        faceIdOrFingerprint: "Normal 100%",
        screenCondition: "Mulus 100% True Tone On",
        bodyCondition: "99% Mulus Like New",
        completeness: ["Unit HP", "Box Original", "Kabel Data", "Kartu Garansi"],
      },
      createdAt: new Date().toISOString(),
    };
    setCompletenessText(fresh.inspection.completeness.join(", "));
    setEditingProduct(fresh);
  };

  const openEditProductModal = (prod: PhoneProduct) => {
    setCompletenessText(prod.inspection.completeness.join(", "));
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
  };

  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      showToast("Nama HP tidak boleh kosong.");
      return;
    }
    if (editingProduct.images.length === 0) {
      showToast("Harap masukkan minimal 1 foto produk.");
      return;
    }
    const finalProd: PhoneProduct = {
      ...editingProduct,
      images: editingProduct.images.slice(0, 5),
      inspection: {
        ...editingProduct.inspection,
        completeness: completenessText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    };
    await saveProduct(finalProd);
    setEditingProduct(null);
  };

  // Export database as JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${store.brandConfig.name.toLowerCase().replace(/\s+/g, "-")}-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import database JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && parsed.brandConfig && Array.isArray(parsed.products)) {
          await importStoreJson(parsed);
          setBrandForm(parsed.brandConfig);
        } else {
          showToast("Format file JSON tidak valid.");
        }
      } catch {
        showToast("Gagal membaca file JSON.");
      }
    };
    reader.readAsText(file);
  };

  const totalRevenue = store.orders
    .filter((o) => o.status !== "Dibatalkan")
    .reduce((acc, o) => acc + o.total, 0);

  const totalStock = store.products.reduce(
    (acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stock, 0),
    0
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {syncStatus === "synced"
                ? "CMS Live • Tersimpan Otomatis di Server & Browser"
                : "CMS Live • Tersimpan Instan"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Panel Admin & Kustomisasi Toko Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Ubah Logo, Nama Brand, Tema Warna, Katalog HP Baru/Second, Varian Harga, hingga Pesanan & Tukar Tambah kapan saja secara real-time tanpa mematikan website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToStore}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
          >
            <ExternalLink className="w-4 h-4 text-brand-600" />
            <span>Lihat Tampilan Toko Live</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Katalog Smartphone</span>
          <div className="text-xl sm:text-2xl font-black text-brand-700 mt-1">
            {store.products.length} Tipe HP
          </div>
          <span className="text-[11px] text-slate-500">
            Tampil di halaman utama
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Stok Siap Jual</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalStock} Unit
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Tersedia untuk pembeli
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">WhatsApp Closing Toko</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate">
            {store.brandConfig.whatsappNumber}
          </div>
          <span className="text-[11px] text-slate-500">
            Tujuan pesanan & checkout
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Identitas Brand Aktif</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate mt-1">
            {store.brandConfig.name}
          </div>
          <span className="text-[11px] text-brand-600 font-semibold capitalize">
            Tema: {store.brandConfig.primaryColor}
          </span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "brand", label: "1. Logo, WhatsApp & Brand", icon: Palette },
          { id: "products", label: `2. Katalog HP (${store.products.length})`, icon: Smartphone },
          { id: "marketing", label: "3. Banner Promo & Voucher", icon: Megaphone },
          { id: "database", label: "4. Database & Cloud Sync", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND, LOGO & THEME EDITOR */}
      {subTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Pengaturan Identitas Brand, Logo & Warna
                </h2>
                <p className="text-xs text-slate-500">
                  Perubahan langsung diterapkan ke seluruh halaman website begitu disimpan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Brand / Nama Toko *
                  </label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, name: e.target.value })
                    }
                    placeholder="Contoh: IndoPhone Store"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inisial Ikon Logo (Jika Tanpa Gambar)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={brandForm.logoTextIcon}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        logoTextIcon: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="NP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Slogan Toko
                </label>
                <input
                  type="text"
                  value={brandForm.tagline}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, tagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                />
              </div>

              {/* Logo Upload & URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Logo Toko (Upload File Gambar dari Perangkat atau Tempel URL)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {brandForm.logoUrl ? (
                    <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1.5 flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brandForm.logoUrl}
                        alt="Preview Logo"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, logoUrl: "" })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow"
                        title="Hapus gambar logo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-xl">
                      {brandForm.logoTextIcon || "NP"}
                    </div>
                  )}

                  <div className="flex-1 space-y-2 min-w-[220px]">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition">
                      <Upload className="w-4 h-4 text-brand-600" />
                      <span>Upload Gambar Logo (PNG/JPG/SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={brandForm.logoUrl}
                      onChange={(e) =>
                        setBrandForm({ ...brandForm, logoUrl: e.target.value })
                      }
                      placeholder="Atau tempel URL gambar logo (https://...)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pilih Tema Warna Utama Website
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {(
                    [
                      { id: "blue", label: "Biru Royal", hex: "#2563eb" },
                      { id: "emerald", label: "Emerald", hex: "#059669" },
                      { id: "violet", label: "Ungu Pro", hex: "#7c3aed" },
                      { id: "rose", label: "Merah Rose", hex: "#e11d48" },
                      { id: "amber", label: "Gold Amber", hex: "#d97706" },
                      { id: "slate", label: "Titanium", hex: "#1e293b" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setBrandForm({ ...brandForm, primaryColor: c.id })
                      }
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        brandForm.primaryColor === c.id
                          ? "border-slate-900 bg-slate-900 text-white font-bold shadow"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px]">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact & Store Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Admin (Format 628...)
                  </label>
                  <input
                    type="text"
                    value={brandForm.whatsappNumber}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Akun Instagram Toko
                  </label>
                  <input
                    type="text"
                    value={brandForm.instagramHandle}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        instagramHandle: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Lengkap Toko Fisik
                  </label>
                  <input
                    type="text"
                    value={brandForm.storeAddress}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, storeAddress: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={brandForm.operationalHours}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        operationalHours: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Teks Pengumuman Promo di Bagian Paling Atas (Announcement Bar)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandForm.announcementActive}
                      onChange={(e) =>
                        setBrandForm({
                          ...brandForm,
                          announcementActive: e.target.checked,
                        })
                      }
                      className="rounded text-brand-600"
                    />
                    Tampilkan
                  </label>
                </div>
                <input
                  type="text"
                  value={brandForm.announcementBar}
                  onChange={(e) =>
                    setBrandForm({
                      ...brandForm,
                      announcementBar: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600"
                />
              </div>

              <button
                type="button"
                onClick={() => updateBrandConfig(brandForm)}
                className="w-full py-3.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Brand, Logo & Tema</span>
              </button>
            </div>
          </div>

          {/* Right: Security & WhatsApp Closing Settings */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Keamanan & PIN Panel Admin</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ganti PIN 4 digit untuk mengamankan akses pengaturan toko Anda dari orang lain.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                PIN Masuk Admin (4 Angka)
              </label>
              <input
                type="text"
                maxLength={8}
                value={brandForm.adminPin}
                onChange={(e) =>
                  setBrandForm({ ...brandForm, adminPin: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-widest bg-white outline-none focus:border-brand-600"
              />
              <p className="text-[11px] text-slate-500">
                Default PIN adalah <strong>1234</strong>. Pastikan Anda mengingat PIN baru setelah disimpan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Alur Closing WhatsApp Aktif</span>
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Setiap calon pembeli yang mengklik tombol <strong>Fast Order via WhatsApp</strong> atau <strong>Beli Sekarang</strong> otomatis langsung diarahkan ke nomor WhatsApp:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-mono font-bold text-emerald-900">
                wa.me/{brandForm.whatsappNumber.replace(/[^0-9]/g, "")}
              </div>
              <p className="text-[11px] text-emerald-700">
                Format pesanan, rincian varian HP, dan total harga otomatis terketik di chat pembeli sehingga Anda tinggal membalas nomor rekening & closing!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {subTab === "products" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Manajemen Katalog HP Baru & Second ({store.products.length} Produk)
              </h2>
              <p className="text-xs text-slate-500">
                Tambah unit HP baru/bekas, atur varian harga, stok, laporan QC, dan foto produk.
              </p>
            </div>
            <button
              onClick={openNewProductModal}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk HP Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {store.products.map((prod) => {
              const totalProdStock = prod.variants.reduce((a, b) => a + b.stock, 0);
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="p-4 flex gap-3.5 border-b border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {prod.brand}
                          </span>
                          {prod.flashSale && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                              Flash Sale
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm truncate mt-1">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-brand-700 font-semibold">
                          {prod.condition}
                        </p>
                        <p className="text-xs font-black text-slate-900 mt-1">
                          {formatRupiah(prod.variants[0]?.price || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 text-xs space-y-1.5 bg-slate-50/60">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jumlah Varian:</span>
                        <span className="font-bold text-slate-800">
                          {prod.variants.length} Varian ({totalProdStock} Unit Ready)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Battery Health:</span>
                        <span className="font-semibold text-emerald-700">
                          {prod.inspection.batteryHealth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status IMEI:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                          {prod.inspection.imeiStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openEditProductModal(prod)}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Lengkap</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}





      {/* TAB 5: BANNERS & VOUCHERS */}
      {subTab === "marketing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Promo Banners */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              Kelola Banner Hero Halaman Utama
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <input
                type="text"
                value={newBanner.title || ""}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, title: e.target.value })
                }
                placeholder="Judul Promo Banner..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
              />
              <input
                type="text"
                value={newBanner.subtitle || ""}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, subtitle: e.target.value })
                }
                placeholder="Subjudul penjelasan promo..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newBanner.badge || ""}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, badge: e.target.value })
                  }
                  placeholder="Teks Badge (PROMO)"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  value={newBanner.imageUrl || ""}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, imageUrl: e.target.value })
                  }
                  placeholder="URL Gambar Banner"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newBanner.title) return;
                  saveBanner({
                    id: `ban-${Date.now()}`,
                    title: newBanner.title,
                    subtitle: newBanner.subtitle || "",
                    badge: newBanner.badge || "PROMO",
                    ctaText: newBanner.ctaText || "Lihat Katalog",
                    bgGradient:
                      newBanner.bgGradient ||
                      "from-slate-900 via-blue-950 to-indigo-950",
                    imageUrl:
                      newBanner.imageUrl ||
                      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
                    active: true,
                  });
                  setNewBanner({ ...newBanner, title: "", subtitle: "" });
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
              >
                + Tambah Banner Promo
              </button>
            </div>

            <div className="space-y-3">
              {store.banners.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-brand-600 uppercase">
                        {b.badge}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{b.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Vouchers */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              Kelola Kode Voucher Diskon
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newVoucher.code || ""}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="KODE (HEMAT200)"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase bg-white"
                />
                <input
                  type="number"
                  step={50000}
                  value={newVoucher.discountAmount || 0}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      discountAmount: Number(e.target.value),
                    })
                  }
                  placeholder="Nominal Diskon"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="number"
                  step={500000}
                  value={newVoucher.minPurchase || 0}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      minPurchase: Number(e.target.value),
                    })
                  }
                  placeholder="Min. Belanja"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <input
                type="text"
                value={newVoucher.description || ""}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, description: e.target.value })
                }
                placeholder="Keterangan voucher..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newVoucher.code) return;
                  saveVoucher({
                    id: `voc-${Date.now()}`,
                    code: newVoucher.code.toUpperCase(),
                    discountAmount: newVoucher.discountAmount || 100000,
                    minPurchase: newVoucher.minPurchase || 0,
                    description:
                      newVoucher.description ||
                      `Potongan ${formatRupiah(newVoucher.discountAmount || 100000)}`,
                    active: true,
                  });
                  setNewVoucher({ ...newVoucher, code: "", description: "" });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                + Buat Kode Voucher
              </button>
            </div>

            <div className="space-y-2.5">
              {store.vouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {v.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 ml-2">
                      Potongan {formatRupiah(v.discountAmount)}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Min. Belanja {formatRupiah(v.minPurchase)} • {v.description}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteVoucher(v.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DATABASE EXPORT / IMPORT / RESET */}
      {subTab === "database" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Manajemen Database, Sinkronisasi Cloud & Backup
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kelola penyimpanan data, pantau status cloud database agar editan Anda langsung tampil ke customer, dan unduh cadangan toko Anda.
            </p>
          </div>

          {/* CLOUD PERSISTENCE STATUS BANNER */}
          <div className="p-5 rounded-2xl border space-y-3 bg-gradient-to-br from-slate-50 to-slate-100/70 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    metaInfo?.isCloudConnected
                      ? "bg-emerald-500 text-white"
                      : "bg-brand-600 text-white"
                  }`}
                >
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Status Penyimpanan Online (Live Sync)
                    </h3>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        metaInfo?.isCloudConnected
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {metaInfo?.isCloudConnected
                        ? "🟢 CLOUD KV AKTIF (ONLINE)"
                        : "🔵 SERVER FILE (data/store.json)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {metaInfo?.isCloudConnected
                      ? "Semua editan produk, stok, dan branding otomatis tersimpan di Cloud. Customer yang membuka link website ini akan langsung melihat perubahan Anda!"
                      : "Data tersimpan di server lokal (data/store.json). Untuk deployment di Vercel agar customer melihat editan Anda dari HP mereka, aktifkan Vercel KV (Gratis)."}
                  </p>
                </div>
              </div>

              {/* Action: Copy Link Toko */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.origin);
                    showToast("Link website toko berhasil disalin ke clipboard!");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Link Toko untuk Customer</span>
              </button>
            </div>

            {/* Vercel KV Guide if not connected */}
            {!metaInfo?.isCloudConnected && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">
                  💡 Tips Deploy di Vercel (100% Gratis & Beli Putus):
                </p>
                <p>
                  1. Di dashboard project Vercel Anda, klik tab <strong>Storage</strong> → klik <strong>Create Database</strong> → pilih <strong>KV (Upstash)</strong>.
                </p>
                <p>
                  2. Klik <strong>Connect</strong> ke project ini. Vercel otomatis mengisi variabel <code>KV_REST_API_URL</code> & <code>KV_REST_API_TOKEN</code>.
                </p>
                <p>
                  3. Klik <strong>Redeploy</strong> di Vercel. Status di atas akan otomatis berubah menjadi <strong>🟢 CLOUD KV AKTIF</strong> dan customer langsung melihat seluruh produk hasil editan Anda!
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <Download className="w-7 h-7 text-brand-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Export Backup Database (.JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Unduh seluruh konfigurasi brand, logo, katalog produk, dan pesanan ke file komputer Anda.
              </p>
              <button
                onClick={handleExportJson}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
              >
                Download File Backup JSON
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <Upload className="w-7 h-7 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Restore / Import Database (.JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Pulihkan atau pindahkan data toko dari file backup JSON dengan 1 klik.
              </p>
              <label className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer transition">
                <span>Pilih File JSON untuk Import</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <RotateCcw className="w-7 h-7 text-rose-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Reset ke Data Default Pabrik
              </h3>
              <p className="text-xs text-slate-500">
                Kembalikan contoh produk, banner, dan pengaturan ke kondisi awal demonstrasi.
              </p>
              <button
                onClick={resetToDefaultData}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Reset Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {store.products.some((p) => p.id === editingProduct.id)
                  ? `Edit Produk: ${editingProduct.name}`
                  : "Tambah Produk Smartphone Baru"}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Tipe HP *
                  </label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    placeholder="Contoh: iPhone 15 Pro Max"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merk / Brand
                  </label>
                  <select
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value as PhoneProduct["brand"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                  >
                    {[
                      "Apple",
                      "Samsung",
                      "Xiaomi",
                      "OPPO",
                      "vivo",
                      "ASUS",
                      "Google",
                      "Infinix",
                      "Lainnya",
                    ].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kondisi Unit (Baru / Grade Second)
                  </label>
                  <select
                    value={editingProduct.condition}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        condition: e.target.value as PhoneCondition,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    <option value="Baru (BNIB)">Baru (BNIB Segel)</option>
                    <option value="Bekas - Like New (Grade A+)">
                      Bekas - Like New (Grade A+)
                    </option>
                    <option value="Bekas - Mulus (Grade A)">
                      Bekas - Mulus (Grade A)
                    </option>
                    <option value="Bekas - Normal (Grade B)">
                      Bekas - Normal (Grade B)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan Garansi
                  </label>
                  <input
                    type="text"
                    value={editingProduct.warranty}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        warranty: e.target.value,
                      })
                    }
                    placeholder="Garansi Resmi iBox / Garansi Toko 30 Hari"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        featured: e.target.checked,
                      })
                    }
                  />
                  <span>Tampilkan di Produk Unggulan</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-rose-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.flashSale}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        flashSale: e.target.checked,
                      })
                    }
                  />
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Masukkan ke Promo Flash Sale</span>
                </label>
              </div>

              {/* Product Images (Maksimal 5 Foto, Slider & Auto Resizer) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Galeri Foto Produk ({editingProduct.images.length}/5 Foto)
                      </label>
                      <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-extrabold">
                        Maksimal 5 Foto
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Foto pertama (Slot 1) adalah <strong>Foto Utama</strong> di katalog. Foto 2–5 tampil saat pembeli menggeser (slider) foto produk.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingProduct.images.length < 5 ? (
                      <label
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition shadow-sm ${
                          isCompressingImage
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-brand-600 hover:bg-brand-700"
                        }`}
                      >
                        {isCompressingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengompres Foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Foto HP</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,.heic,.heif,.webp,.png,.jpg,.jpeg"
                          multiple
                          disabled={isCompressingImage}
                          onChange={handleProductImageUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold">
                        Slot 5 Foto Penuh
                      </span>
                    )}
                  </div>
                </div>

                {/* 5-Slot Grid Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const imgUrl = editingProduct.images[slotIdx];
                    const isOccupied = Boolean(imgUrl);
                    const isPrimary = slotIdx === 0;

                    return (
                      <div
                        key={slotIdx}
                        className={`aspect-square rounded-xl border relative overflow-hidden flex flex-col justify-between p-1.5 transition ${
                          isOccupied
                            ? isPrimary
                              ? "border-brand-500 bg-white shadow-sm ring-2 ring-brand-500/20"
                              : "border-slate-300 bg-white shadow-sm"
                            : "border-2 border-dashed border-slate-300 bg-slate-100/60 items-center justify-center text-center text-slate-400"
                        }`}
                      >
                        {isOccupied ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Foto Slot ${slotIdx + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Top Badge: Slot Label & Delete */}
                            <div className="relative z-10 flex items-center justify-between w-full">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow ${
                                  isPrimary
                                    ? "bg-amber-500 text-slate-950 font-black"
                                    : "bg-slate-900/80 text-white"
                                }`}
                              >
                                {isPrimary ? "★ Foto 1 (Utama)" : `Foto ${slotIdx + 1}`}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: editingProduct.images.filter(
                                      (_, i) => i !== slotIdx
                                    ),
                                  })
                                }
                                className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs flex items-center justify-center shadow"
                                title="Hapus foto ini"
                              >
                                ×
                              </button>
                            </div>

                            {/* Bottom Controls: Move & Set Primary */}
                            <div className="relative z-10 flex items-center justify-between w-full mt-auto pt-1 bg-slate-950/60 backdrop-blur-xs rounded-lg px-1 py-0.5">
                              {slotIdx > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(slotIdx)}
                                  className="text-[9px] font-bold text-amber-300 hover:text-amber-100 flex items-center gap-0.5"
                                  title="Jadikan Foto Utama (Slot 1)"
                                >
                                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                                  <span>Utamakan</span>
                                </button>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-300">
                                  Thumbnail Aktif
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                {slotIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(slotIdx, "left")}
                                    className="p-0.5 rounded text-white/90 hover:text-white hover:bg-white/20"
                                    title="Pindahkan ke kiri"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {slotIdx < editingProduct.images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(slotIdx, "right")}
                                    className="p-0.5 rounded text-white/90 hover:text-white hover:bg-white/20"
                                    title="Pindahkan ke kanan"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 p-2">
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400">
                              Slot {slotIdx + 1}
                            </span>
                            <span className="text-[9px] text-slate-400">Kosong</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional URL Input for Convenience */}
                {editingProduct.images.length < 5 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Atau tempel link URL foto langsung (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shrink-0"
                    >
                      + Tambah URL
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    <strong>Kompresor Otomatis Aktif:</strong> File foto kamera berukuran besar (10MB–20MB) dari iPhone/Samsung otomatis disesuaikan ukurannya secara lokal menjadi ~100KB agar website cepat & hemat penyimpanan.
                  </span>
                </div>
              </div>

              {/* Variants Editor */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Varian RAM / Storage / Warna & Harga ({editingProduct.variants.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newVar: PhoneVariant = {
                        id: `v-${Date.now()}`,
                        ram: "8GB",
                        storage: "256GB",
                        color: "Black",
                        colorHex: "#1e293b",
                        price: editingProduct.variants[0]?.price || 8000000,
                        originalPrice:
                          editingProduct.variants[0]?.originalPrice || 9000000,
                        stock: 3,
                      };
                      setEditingProduct({
                        ...editingProduct,
                        variants: [...editingProduct.variants, newVar],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                  >
                    + Tambah Varian
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editingProduct.variants.map((v, idx) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-2 sm:grid-cols-7 gap-2 bg-white p-3 rounded-xl border border-slate-200 items-center"
                    >
                      <input
                        type="text"
                        value={v.ram}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, ram: e.target.value };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="RAM (8GB)"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={v.storage}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, storage: e.target.value };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="ROM (256GB)"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, color: e.target.value };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Warna"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <input
                        type="number"
                        step={50000}
                        value={v.originalPrice || ""}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, originalPrice: Number(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Harga Coret (Rp)"
                        title="Harga Asli Sebelum Diskon (Dicoret)"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 line-through"
                      />
                      <input
                        type="number"
                        step={50000}
                        value={v.price}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, price: Number(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Harga Promo"
                        title="Harga Jual Aktif Toko"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-rose-600"
                      />
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, stock: Number(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Stok"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                      />
                      {editingProduct.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              variants: editingProduct.variants.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="text-rose-600 text-xs font-bold justify-self-end px-2"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* QC & Inspection Report */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Laporan Inspeksi Quality Control (QC) Unit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Battery Health
                    </label>
                    <input
                      type="text"
                      value={editingProduct.inspection.batteryHealth}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inspection: {
                            ...editingProduct.inspection,
                            batteryHealth: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Status IMEI & Sinyal
                    </label>
                    <select
                      value={editingProduct.inspection.imeiStatus}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inspection: {
                            ...editingProduct.inspection,
                            imeiStatus: e.target
                              .value as PhoneProduct["inspection"]["imeiStatus"],
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="Resmi Indonesia (SEIN/iBox/TAM)">
                        Resmi Indonesia (SEIN/iBox/TAM)
                      </option>
                      <option value="Terdaftar Bea Cukai / Resmi Kemenperin">
                        Terdaftar Bea Cukai / Resmi Kemenperin
                      </option>
                      <option value="Sinyal Aman Permanen">Sinyal Aman Permanen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Kondisi Fisik Bodi
                    </label>
                    <input
                      type="text"
                      value={editingProduct.inspection.bodyCondition}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inspection: {
                            ...editingProduct.inspection,
                            bodyCondition: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Kelengkapan Kotak (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={completenessText}
                    onChange={(e) => setCompletenessText(e.target.value)}
                    placeholder="Unit HP, Box Original, Kabel USB-C, Kartu Garansi"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spesifikasi Layar
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.screen}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs, screen: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chipset / Prosesor
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.processor}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: {
                          ...editingProduct.specs,
                          processor: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kamera
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.camera}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs, camera: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baterai & Charging
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.battery}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs, battery: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Lengkap Produk
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Produk ke Katalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
