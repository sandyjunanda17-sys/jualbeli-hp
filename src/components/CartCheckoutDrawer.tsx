"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppUrl, formatRupiah } from "@/utils/format";
import { Order, ShippingOption } from "@/types/store";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  Repeat,
  Truck,
  CreditCard,
  MessageCircle,
  ArrowRight,
  Flame,
  Sparkles,
} from "lucide-react";

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartCheckoutDrawer({ isOpen, onClose }: CartCheckoutDrawerProps) {
  const {
    store,
    cart,
    removeFromCart,
    updateCartQty,
    clearCart,
    createOrder,
    activeTradeInCredit,
    setActiveTradeInCredit,
    showToast,
  } = useStore();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank / Virtual Account");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Active shipping options from store or fallback
  const availableShippingOptions: ShippingOption[] = useMemo(() => {
    const list = store.shippingOptions?.filter((o) => o.active);
    if (list && list.length > 0) return list;
    return [
      {
        id: "ship-1",
        name: "Ongkir Dikonfirmasi via WhatsApp (Sesuai Alamat)",
        cost: 0,
        type: "calculated_via_wa",
        description: "Admin mengecek ongkir sesuai kecamatan Anda saat konfirmasi chat WhatsApp",
        active: true,
      },
      {
        id: "ship-2",
        name: "Promo Gratis Ongkir Seluruh Indonesia",
        cost: 0,
        type: "free",
        description: "Gratis Ongkir + Packing Kayu & Asuransi ditanggung penuh oleh Toko",
        active: true,
      },
    ];
  }, [store.shippingOptions]);

  useEffect(() => {
    if (availableShippingOptions.length > 0 && !availableShippingOptions.some((o) => o.id === selectedShippingId)) {
      setSelectedShippingId(availableShippingOptions[0].id);
    }
  }, [availableShippingOptions, selectedShippingId]);

  if (!isOpen) return null;

  const currentShipping = availableShippingOptions.find((o) => o.id === selectedShippingId) || availableShippingOptions[0];
  const shippingCost = currentShipping?.type === "fixed" ? (currentShipping.cost || 0) : 0;
  const isShippingViaWa = currentShipping?.type === "calculated_via_wa";
  const isShippingFree = currentShipping?.type === "free";

  const subtotal = cart.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
  const totalOriginalPrice = cart.reduce((acc, item) => {
    const orig = item.variant.originalPrice || Math.round(item.variant.price * 1.15);
    return acc + orig * item.quantity;
  }, 0);
  const voucherDiscount = appliedVoucher ? appliedVoucher.amount : 0;
  const tradeInDiscount = activeTradeInCredit ? activeTradeInCredit.amount : 0;
  const totalDiscount = voucherDiscount + tradeInDiscount;
  const finalTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  const totalSavings = (totalOriginalPrice - subtotal) + totalDiscount;

  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    const found = store.vouchers.find((v) => v.active && v.code.toUpperCase() === code);
    if (!found) {
      showToast("Kode voucher tidak ditemukan atau sudah tidak aktif.");
      return;
    }
    if (subtotal < found.minPurchase) {
      showToast(`Minimal belanja untuk voucher ${found.code} adalah ${formatRupiah(found.minPurchase)}`);
      return;
    }
    setAppliedVoucher({ code: found.code, amount: found.discountAmount });
    showToast(`Voucher ${found.code} berhasil dipasang! Hemat ${formatRupiah(found.discountAmount)}`);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsapp.trim() || !address.trim()) {
      showToast("Mohon lengkapi nama, nomor WhatsApp, dan alamat pengiriman.");
      return;
    }
    const order = await createOrder({
      customerName,
      whatsapp,
      address,
      shippingMethod: currentShipping?.name || "Kurir Toko",
      paymentMethod,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0] || "",
        condition: item.product.condition,
        variantLabel: `${item.variant.ram} / ${item.variant.storage} - ${item.variant.color}`,
        price: item.variant.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount: totalDiscount,
      shippingCost,
      total: finalTotal,
      voucherCode: [
        appliedVoucher?.code,
        activeTradeInCredit ? `TRADEIN(${activeTradeInCredit.model})` : undefined,
      ]
        .filter(Boolean)
        .join(" + "),
      status: "Menunggu Pembayaran",
    });

    setCreatedOrder(order);
    clearCart();
    setActiveTradeInCredit(null);
    setAppliedVoucher(null);
    setStep("success");
  };

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-extrabold text-slate-900">
              {step === "cart"
                ? "Keranjang Belanja"
                : step === "checkout"
                ? "Checkout & Pengiriman"
                : "Pesanan Berhasil Dibuat"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800">Keranjang Anda Masih Kosong</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Pilih smartphone impian Anda di katalog Baru & Second bergaransi kami.
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Booking Urgency Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/90 flex items-center gap-2.5 text-xs text-amber-950 font-semibold shadow-sm">
                    <Flame className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
                    <div>
                      <span className="font-extrabold text-rose-700">Slot Unit Direservasi: </span>
                      Selesaikan pesanan WhatsApp Anda sekarang sebelum stok diambil pembeli lain!
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const orig = item.variant.originalPrice || Math.round(item.variant.price * 1.15);
                      return (
                      <div
                        key={`${item.product.id}-${item.variant.id}`}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3.5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                {item.product.condition}
                              </span>
                              <h4 className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-slate-500">
                                {item.variant.ram} / {item.variant.storage} • {item.variant.color}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.variant.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <div className="text-sm font-black text-rose-600">
                                {formatRupiah(item.variant.price * item.quantity)}
                              </div>
                              {orig > item.variant.price && (
                                <div className="text-[11px] text-slate-400 line-through">
                                  {formatRupiah(orig * item.quantity)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                              <button
                                onClick={() =>
                                  updateCartQty(
                                    item.product.id,
                                    item.variant.id,
                                    item.quantity - 1
                                  )
                                }
                                className="text-slate-600 hover:text-brand-600"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQty(
                                    item.product.id,
                                    item.variant.id,
                                    item.quantity + 1
                                  )
                                }
                                className="text-slate-600 hover:text-brand-600"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ); })}
                  </div>


                  {/* Voucher Code Input */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-600" /> Punya Kode Voucher Promo?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        placeholder="Contoh: R PHONE CELL"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-bold outline-none focus:border-brand-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                      >
                        Pakai
                      </button>
                    </div>
                    {store.vouchers.filter((v) => v.active).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {store.vouchers
                          .filter((v) => v.active)
                          .map((v) => (
                            <button
                              key={v.id}
                              onClick={() => {
                                setVoucherInput(v.code);
                              }}
                              className="text-[11px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-semibold hover:bg-brand-100"
                            >
                              Klik: {v.code} (-{formatRupiah(v.discountAmount)})
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {step === "checkout" && (
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Penerima *
                </label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  required
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Pengiriman / Catatan COD *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, kecamatan, kota, kode pos..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-600" /> Metode & Pilihan Pengiriman
                </label>
                <div className="space-y-2">
                  <select
                    value={selectedShippingId}
                    onChange={(e) => setSelectedShippingId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-brand-600 font-medium"
                  >
                    {availableShippingOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} — {opt.type === "free" ? "GRATIS" : opt.type === "calculated_via_wa" ? "Dihitung via WhatsApp" : formatRupiah(opt.cost)}
                      </option>
                    ))}
                  </select>

                  {currentShipping && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">{currentShipping.name}: </span>
                        <span>{currentShipping.description}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-600" /> Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-brand-600"
                >
                  <option value="Transfer Bank / Virtual Account">
                    Transfer Bank BCA / Mandiri / BNI / BRI
                  </option>
                  <option value="QRIS Instan / E-Wallet">QRIS Instan (GoPay, OVO, Dana, ShopeePay)</option>
                  <option value="Rekber Marketplace (Tokopedia / Shopee)">
                    Link Checkout Rekber (Tokopedia / Shopee)
                  </option>
                  <option value="Bayar di Tempat (COD di Toko)">
                    Bayar di Tempat saat Cek Unit di Toko
                  </option>
                </select>
              </div>
            </form>
          )}

          {step === "success" && createdOrder && (
            <div className="space-y-5 py-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  Pesanan Berhasil Diterima!
                </h4>
                <p className="text-xs text-slate-500">
                  Simpan Nomor Invoice Anda untuk melacak status pengiriman & QC:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm tracking-wider">
                  {createdOrder.id}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pemesan:</span>
                  <span className="font-bold text-slate-800">{createdOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-semibold text-slate-800">{createdOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengiriman:</span>
                  <span className="font-semibold text-slate-800">{createdOrder.shippingMethod}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-brand-700">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(createdOrder.total)}</span>
                </div>
              </div>

              <a
                href={buildWhatsAppUrl(
                  store.brandConfig.whatsappNumber,
                  `Halo Admin *${store.brandConfig.name}*, saya ingin konfirmasi pesanan baru:\n\n🧾 *No. Invoice:* ${createdOrder.id}\n👤 *Nama Pemesan:* ${createdOrder.customerName}\n📞 *WhatsApp:* ${createdOrder.whatsapp}\n📍 *Alamat:* ${createdOrder.address}\n📱 *Item Unit:* ${createdOrder.items.map((i) => `${i.productName} (${i.variantLabel}) x${i.quantity}`).join(", ")}\n🚚 *Metode Kirim:* ${createdOrder.shippingMethod}\n📦 *Ongkos Kirim:* ${createdOrder.shippingCost > 0 ? formatRupiah(createdOrder.shippingCost) : (createdOrder.shippingMethod.includes("WhatsApp") ? "Menunggu Hitungan Admin via WA" : "GRATIS / Rp 0")}\n💰 *Total Pembayaran:* ${formatRupiah(createdOrder.total)}${createdOrder.shippingMethod.includes("WhatsApp") ? " (+ Ongkir sesuai kurir)" : ""}\n💳 *Metode Pembayaran:* ${createdOrder.paymentMethod}\n\nMohon info nomor rekening / proses selanjutnya ya kak. Terima kasih!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Konfirmasi Pesanan via WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Totals & CTA */}
        {step !== "success" && cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50/70 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk</span>
                <span className="font-semibold">{formatRupiah(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Voucher ({appliedVoucher?.code})</span>
                  <span>- {formatRupiah(voucherDiscount)}</span>
                </div>
              )}
              {tradeInDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Potongan Tukar Tambah ({activeTradeInCredit?.model})</span>
                  <span>- {formatRupiah(tradeInDiscount)}</span>
                </div>
              )}
              {step === "checkout" && (
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Pengiriman & Asuransi</span>
                  <span className="font-bold">
                    {isShippingViaWa ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-extrabold border border-amber-200">
                        Dihitung via WhatsApp
                      </span>
                    ) : isShippingFree ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-black border border-emerald-200">
                        GRATIS (Promo)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-800">{formatRupiah(shippingCost)}</span>
                    )}
                  </span>
                </div>
              )}
              {totalSavings > 0 && (
                <div className="flex justify-between text-rose-600 font-extrabold text-xs bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                  <span>Total Penghematan Anda</span>
                  <span>Hemat {formatRupiah(totalSavings)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
                <span>Total Bayar</span>
                <span className="text-xl text-brand-700">{formatRupiah(finalTotal)}</span>
              </div>
            </div>

            {step === "cart" ? (
              <div className="space-y-2">
                <button
                  onClick={() => setStep("checkout")}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition"
                >
                  <span>Lanjut ke Pengiriman & Pembayaran</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={buildWhatsAppUrl(
                    store.brandConfig.whatsappNumber,
                    `Halo Admin *${store.brandConfig.name}*, saya ingin order langsung via WhatsApp:\n\n🛒 *Daftar Pesanan:*\n${cart
                      .map(
                        (i) =>
                          `• ${i.product.name} (${i.variant.ram}/${i.variant.storage} - ${i.variant.color}) x${i.quantity} = ${formatRupiah(i.variant.price * i.quantity)}`
                      )
                      .join("\n")}\n\n💰 *Total Belanja:* ${formatRupiah(finalTotal)}\n\nMohon info ketersediaan stok unit dan rekening pembayaran. Terima kasih!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-600 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:text-white" />
                  <span>⚡ Fast Order Langsung via WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/20 transition"
                >
                  Buat Pesanan Sekarang
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
