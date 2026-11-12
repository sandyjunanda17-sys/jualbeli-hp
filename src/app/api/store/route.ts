import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { INITIAL_STORE_DATA } from "@/data/initialData";
import { StoreData } from "@/types/store";
import {
  fetchStoreFromSupabase,
  saveStoreToSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

// Single unified store key so all devices (laptop, mobile, tablet) share the EXACT same database
const GLOBAL_STORE_KEY = "rphone_official_store_v1";

function getStorageKey(): string {
  return GLOBAL_STORE_KEY;
}

// Universal Upstash / Vercel KV environment variables auto-detection
function getKvConfig(): { url: string; token: string; source: string } | null {
  // 1. Check known common variable combinations (including STORAGE prefix created by Upstash integration)
  const knownPrefixes = [
    "STORAGE",
    "UPSTASH_REDIS",
    "KV",
    "VERCEL_KV",
    "REDIS",
    "RPHONE_DB",
  ];

  for (const prefix of knownPrefixes) {
    const url =
      process.env[`${prefix}_REST_API_URL`] ||
      process.env[`${prefix}_REST_URL`] ||
      process.env[`${prefix}_URL`];
    const token =
      process.env[`${prefix}_REST_API_TOKEN`] ||
      process.env[`${prefix}_TOKEN`] ||
      process.env[`${prefix}_REST_TOKEN`];

    if (url && token && url.startsWith("http")) {
      return {
        url: url.replace(/\/+$/, ""),
        token,
        source: `${prefix}_REST_API_URL`,
      };
    }
  }

  // 2. Fallback: Search all environment variables dynamically for any REST API URL + TOKEN pair
  let foundUrl = "";
  let foundToken = "";
  let source = "dynamic";

  for (const [key, val] of Object.entries(process.env)) {
    if (!val || typeof val !== "string") continue;
    if (
      (key.includes("REST_API_URL") || key.includes("REST_URL") || key.endsWith("_URL")) &&
      val.startsWith("http") &&
      (val.includes("upstash.io") || val.includes("vercel-storage.com"))
    ) {
      foundUrl = val;
      source = key;

      // Extract prefix from key
      const prefix = key
        .replace(/_REST_API_URL$/, "")
        .replace(/_REST_URL$/, "")
        .replace(/_URL$/, "");

      const candidates = [
        `${prefix}_REST_API_TOKEN`,
        `${prefix}_TOKEN`,
        `${prefix}_REST_TOKEN`,
      ];
      for (const c of candidates) {
        if (process.env[c]) {
          foundToken = process.env[c]!;
          break;
        }
      }
      if (foundUrl && foundToken) break;
    }
  }

  // 3. If URL found but token not found by prefix, find any long token variable
  if (foundUrl && !foundToken) {
    for (const [key, val] of Object.entries(process.env)) {
      if (
        key.includes("TOKEN") &&
        !key.includes("READ_ONLY") &&
        typeof val === "string" &&
        val.length > 20
      ) {
        foundToken = val;
        break;
      }
    }
  }

  if (foundUrl && foundToken) {
    return {
      url: foundUrl.replace(/\/+$/, ""),
      token: foundToken,
      source,
    };
  }

  return null;
}

// Data sanitizer to guarantee "NusaPhone" or blue default never slips through
function sanitizeStoreData(data: StoreData): { sanitized: StoreData; wasModified: boolean } {
  if (!data) return { sanitized: INITIAL_STORE_DATA, wasModified: true };
  let wasModified = false;
  const brand = { ...(data.brandConfig || INITIAL_STORE_DATA.brandConfig) };

  if (!brand.name || brand.name.toLowerCase().includes("nusaphone")) {
    brand.name = "R PHONE CELL";
    wasModified = true;
  }
  if (!brand.primaryColor || brand.primaryColor === "blue") {
    brand.primaryColor = "violet";
    wasModified = true;
  }
  if (!brand.logoTextIcon || brand.logoTextIcon === "NP") {
    brand.logoTextIcon = "RP";
    wasModified = true;
  }
  if (!brand.tagline || brand.tagline.toLowerCase().includes("nusa")) {
    brand.tagline = "Pusat Jual Beli & Tukar Tambah Smartphone Bergaransi";
    wasModified = true;
  }
  if (!brand.announcementBar || brand.announcementBar.includes("NUSAPROMO") || brand.announcementBar.toLowerCase().includes("nusaphone")) {
    brand.announcementBar = "🔥 PROMO SPESIAL: Gunakan kode R PHONE CELL untuk potongan Rp 250.000 + Gratis Ongkir Berasuransi ke Seluruh Indonesia!";
    wasModified = true;
  }
  if (!brand.whatsappNumber || brand.whatsappNumber === "6281234567890") {
    brand.whatsappNumber = "6283152106847";
    wasModified = true;
  }
  if (!brand.storeAddress || brand.storeAddress.includes("ITC Roxy Mas")) {
    brand.storeAddress = "Jakarta Utara, DKI Jakarta";
    wasModified = true;
  }

  let vouchers = data.vouchers;
  if (vouchers && vouchers.some((v) => v.code === "NUSAPROMO" || v.code.includes("NUSA"))) {
    vouchers = vouchers.map((v) =>
      v.code === "NUSAPROMO" || v.code.includes("NUSA")
        ? {
            ...v,
            code: "R PHONE CELL",
            description: "Potongan Rp 250.000 untuk semua smartphone baru & second berkualitas",
          }
        : v
    );
    wasModified = true;
  }

  const sanitized: StoreData = {
    ...data,
    brandConfig: brand,
    vouchers: vouchers || INITIAL_STORE_DATA.vouchers,
  };

  return { sanitized, wasModified };
}

// Read from Upstash KV using Command API
async function readFromKv(key: string): Promise<StoreData | null> {
  const cfg = getKvConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", key]),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[KV Read HTTP Error]:", res.status, res.statusText);
      return null;
    }
    const json = (await res.json()) as { result?: string | null };
    if (!json.result) {
      // Legacy key fallback check if main key not yet seeded
      if (key === GLOBAL_STORE_KEY) {
        const legacyKeys = [
          "nusaphone_store_rphonecell_jualbelihp_vercel_app",
          "nusaphone_store_default",
          "nusaphone_store_localhost_3000",
        ];
        for (const lk of legacyKeys) {
          try {
            const lRes = await fetch(cfg.url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${cfg.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(["GET", lk]),
              cache: "no-store",
            });
            if (lRes.ok) {
              const lJson = (await lRes.json()) as { result?: string | null };
              if (lJson.result) {
                const parsed =
                  typeof lJson.result === "string" ? JSON.parse(lJson.result) : lJson.result;
                const { sanitized } = sanitizeStoreData(parsed as StoreData);
                // Migrate legacy data to main unified key
                await writeToKv(GLOBAL_STORE_KEY, sanitized);
                return sanitized;
              }
            }
          } catch {
            // ignore fallback error
          }
        }
      }
      return null;
    }
    const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
    const { sanitized, wasModified } = sanitizeStoreData(parsed as StoreData);

    if (wasModified) {
      // Re-save sanitized data back to KV so it's permanently cleaned
      await writeToKv(key, sanitized);
    }

    return sanitized;
  } catch (err) {
    console.error("[KV Read Error]:", err);
    return null;
  }
}

// Write to Upstash KV using Command API
async function writeToKv(key: string, data: StoreData): Promise<boolean> {
  const cfg = getKvConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, JSON.stringify(data)]),
    });
    if (!res.ok) {
      console.error("[KV Write HTTP Error]:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[KV Write Error]:", err);
    return false;
  }
}

// Read local file fallback (VPS / localhost)
async function readStoreFile(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    const { sanitized } = sanitizeStoreData(parsed);
    return sanitized;
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_STORE_DATA, null, 2), "utf-8");
    } catch {
      // Ignored on read-only serverless
    }
    return INITIAL_STORE_DATA;
  }
}

export async function GET() {
  const supabaseActive = isSupabaseConfigured();
  const kvCfg = getKvConfig();
  const storageKey = getStorageKey();

  let data: StoreData | null = null;
  let storageType = "local-fs";

  // 1. Primary: Try Supabase PostgreSQL (Supports 1000+ catalog products, never loses data)
  if (supabaseActive) {
    data = await fetchStoreFromSupabase();
    if (data) {
      storageType = "supabase-postgres";
    }
  }

  // 2. Secondary: Try Upstash KV if Supabase didn't return data
  if (!data && kvCfg) {
    data = await readFromKv(storageKey);
    if (data) {
      storageType = "cloud-kv";
      // If Supabase is active but empty, auto-migrate Upstash data into Supabase!
      if (supabaseActive) {
        await saveStoreToSupabase(data);
        storageType = "supabase-postgres";
      }
    }
  }

  // 3. Fallback: Local file or initial data
  if (!data) {
    data = await readStoreFile();
    // Seed database if connected but empty
    if (supabaseActive) {
      await saveStoreToSupabase(data);
      storageType = "supabase-postgres";
    } else if (kvCfg) {
      await writeToKv(storageKey, data);
      storageType = "cloud-kv";
    }
  }

  // Double check sanitization before responding
  const { sanitized, wasModified } = sanitizeStoreData(data);
  data = sanitized;
  if (wasModified) {
    if (supabaseActive) {
      await saveStoreToSupabase(data);
    } else if (kvCfg) {
      await writeToKv(storageKey, data);
    }
  }

  const isVercel = Boolean(process.env.VERCEL);

  return NextResponse.json(
    {
      ...data,
      _meta: {
        storageType,
        isCloudConnected: Boolean(supabaseActive || kvCfg),
        cloudSource: supabaseActive
          ? "supabase-postgres"
          : kvCfg?.source || "none",
        isVercel,
        storageKey,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const supabaseActive = isSupabaseConfigured();
    const kvCfg = getKvConfig();
    const storageKey = getStorageKey();
    const body = (await request.json()) as StoreData;

    // Sanitize before persisting
    const { sanitized } = sanitizeStoreData(body);

    const updated: StoreData = {
      ...sanitized,
      lastUpdated: new Date().toISOString(),
    };

    let persistedOnCloud = false;
    let persistedOnDisk = false;

    // 1. Primary: Persist to Supabase PostgreSQL
    if (supabaseActive) {
      persistedOnCloud = await saveStoreToSupabase(updated);
    }

    // 2. Secondary: Dual backup to Upstash KV if configured
    if (kvCfg) {
      const kvOk = await writeToKv(storageKey, updated);
      if (!persistedOnCloud) persistedOnCloud = kvOk;
    }

    // 3. Persist to local disk if writable (VPS / localhost)
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
      persistedOnDisk = true;
    } catch {
      persistedOnDisk = false;
    }

    const isVercel = Boolean(process.env.VERCEL);
    const persistedOnServer = persistedOnCloud || persistedOnDisk;

    return NextResponse.json({
      ok: true,
      persistedOnServer,
      persistedOnCloud,
      persistedOnDisk,
      storageType: supabaseActive
        ? "supabase-postgres"
        : kvCfg
        ? "cloud-kv"
        : persistedOnDisk
        ? "local-fs"
        : "read-only-fallback",
      cloudSource: supabaseActive ? "supabase-postgres" : kvCfg?.source || "none",
      isVercel,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
