"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { formatRupiah, getConditionBadgeStyle } from "@/utils/format";
import { X, SlidersHorizontal, Trash2, ShoppingBag } from "lucide-react";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompareModal({ isOpen, onClose }: CompareModalProps) {
  const { store, compareIds, toggleCompare, clearCompare, addToCart } = useStore();

  if (!isOpen) return null;

  const products = store.products.filter((p) => compareIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Bandingkan Spesifikasi & Kondisi HP ({products.length}/3)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
              >
                Kosongkan Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-semibold">
                Belum ada HP yang dipilih untuk dibandingkan.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klik tombol ikon &quot;Bandingkan&quot; pada kartu produk di katalog untuk membandingkan hingga 3 HP sekaligus.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-44 p-3 bg-slate-50 rounded-tl-xl text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                      Parameter
                    </th>
                    {products.map((p) => {
                      const lowestVariant = p.variants[0];
                      const badge = getConditionBadgeStyle(p.condition);
                      return (
                        <th key={p.id} className="p-4 border-b border-slate-200 align-top">
                          <div className="relative space-y-2.5">
                            <button
                              onClick={() => toggleCompare(p.id)}
                              className="absolute top-0 right-0 p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                              title="Hapus dari perbandingan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mb-1 ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {badge.shortLabel}
                              </span>
                              <h4 className="font-extrabold text-slate-900 text-sm">
                                {p.name}
                              </h4>
                              <p className="text-brand-600 font-black text-base mt-0.5">
                                {formatRupiah(lowestVariant?.price || 0)}
                              </p>
                            </div>
                            {lowestVariant && (
                              <button
                                onClick={() => addToCart(p, lowestVariant, 1)}
                                className="w-full py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>+ Keranjang</span>
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Varian Tersedia</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">
                        {p.variants.map((v) => `${v.ram}/${v.storage} (${v.color})`).join(", ")}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Garansi</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 font-semibold text-emerald-700">
                        {p.warranty}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Battery Health</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 font-bold text-slate-800">
                        {p.inspection.batteryHealth}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Status IMEI</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-800">
                        {p.inspection.imeiStatus}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Kondisi Fisik</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">
                        {p.inspection.bodyCondition}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Layar</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">{p.specs.screen}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Chipset / CPU</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">{p.specs.processor}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Kamera</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">{p.specs.camera}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Baterai</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">{p.specs.battery}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Kelengkapan</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-slate-700">
                        {p.inspection.completeness.join(", ")}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
