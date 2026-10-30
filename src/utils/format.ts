import { PhoneCondition } from "@/types/store";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function getConditionBadgeStyle(condition: PhoneCondition): {
  bg: string;
  text: string;
  border: string;
  shortLabel: string;
} {
  switch (condition) {
    case "Baru (BNIB)":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        shortLabel: "BARU • SEGEL BNIB",
      };
    case "Bekas - Like New (Grade A+)":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        shortLabel: "SECOND • LIKE NEW A+",
      };
    case "Bekas - Mulus (Grade A)":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        shortLabel: "SECOND • GRADE A",
      };
    default:
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        shortLabel: "SECOND • GRADE B",
      };
  }
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const normalized = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
