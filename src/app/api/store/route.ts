import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { INITIAL_STORE_DATA } from "@/data/initialData";
import { StoreData } from "@/types/store";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

// Helper to determine namespace key based on Host domain so multiple clients don't collide
function getStorageKey(request?: Request): string {
  try {
    const host = request?.headers.get("host") || "default";
    const clean = host.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    return `nusaphone_store_${clean}`;
  } catch {
    return "nusaphone_store_default";
  }
}

// Check Upstash / Vercel KV environment variables
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/+$/, ""), token };
  }
  return null;
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
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string | null };
    if (!json.result) return null;
    const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
    return parsed as StoreData;
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
    return res.ok;
  } catch (err) {
    console.error("[KV Write Error]:", err);
    return false;
  }
}

// Read local file fallback (VPS / localhost)
async function readStoreFile(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as StoreData;
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

export async function GET(request: Request) {
  const storageKey = getStorageKey(request);
  const kvCfg = getKvConfig();

  let data: StoreData | null = null;
  let storageType = "local-fs";

  if (kvCfg) {
    data = await readFromKv(storageKey);
    if (data) {
      storageType = "cloud-kv";
    }
  }

  // Fallback to local file or initial data if not found in KV
  if (!data) {
    data = await readStoreFile();
    // If KV is connected but empty, seed KV with initial data!
    if (kvCfg) {
      await writeToKv(storageKey, data);
      storageType = "cloud-kv";
    }
  }

  const isVercel = Boolean(process.env.VERCEL);

  return NextResponse.json(
    {
      ...data,
      _meta: {
        storageType,
        isCloudConnected: Boolean(kvCfg),
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
    const storageKey = getStorageKey(request);
    const kvCfg = getKvConfig();
    const body = (await request.json()) as StoreData;

    const updated: StoreData = {
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    let persistedOnCloud = false;
    let persistedOnDisk = false;

    // 1. Persist to Cloud KV if available
    if (kvCfg) {
      persistedOnCloud = await writeToKv(storageKey, updated);
    }

    // 2. Persist to local disk if writable (VPS / localhost)
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
      storageType: kvCfg ? "cloud-kv" : persistedOnDisk ? "local-fs" : "read-only-fallback",
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
