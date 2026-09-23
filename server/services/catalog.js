// services/catalog.js
// The product catalogue, read from the FOCAS LMS instead of a local collection.
//
// This site used to keep its own `products`, which meant every price and stock
// count had to be kept in step with the LMS by hand. The LMS now owns them and
// this fetches them over /api/store/products, so there is one place to edit a
// price and one place that knows what's in stock.
//
// The items come back in exactly the shape the old Product documents had —
// slug, title, price/mrp in paise, stock, sortOrder — plus `productId`, the
// LMS's own id, which orders quote back so a sale can never be matched to the
// wrong product.
//
// Availability rule: the shop must keep selling through an LMS hiccup, so every
// successful fetch is kept in memory AND written to disk. The disk copy is what
// covers the nasty case — this server restarting while the LMS is down, which
// with a memory-only cache would take the whole shop offline. It refuses to
// serve nothing at all: you cannot price a cart from a catalogue you don't have,
// and guessing would mean charging the wrong amount.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LMS_API_BASE = (process.env.LMS_API_BASE || '').trim();

// Mirrors what the old local Product model exported; the admin dashboard's
// low-stock panel still uses it, now against the LMS-owned stock numbers.
export const LOW_STOCK_THRESHOLD = 10;

// Last-known-good catalogue, so a cold start without the LMS still has prices.
const DISK_CACHE = path.join(os.tmpdir(), 'focas-qb-catalogue.json');

const FRESH_MS   = 60_000;      // serve from memory for this long
const STALE_MS   = 24 * 3600_000; // keep using a failed-refresh copy up to this long
const REQUEST_MS = 10_000;

let cache = { at: 0, items: null };
let inFlight = null;

export function catalogConfigured() {
  return Boolean(LMS_API_BASE);
}

async function fetchFromLms() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_MS);
  try {
    const res = await fetch(`${LMS_API_BASE.replace(/\/$/, '')}/api/store/products`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`LMS catalogue returned HTTP ${res.status}`);
    const items = await res.json();
    if (!Array.isArray(items)) throw new Error('LMS catalogue response was not a list');
    return items;
  } finally {
    clearTimeout(timer);
  }
}

function saveToDisk(items) {
  // Best effort — a read-only or full disk must never break a sale.
  try {
    fs.writeFileSync(DISK_CACHE, JSON.stringify({ at: Date.now(), items }));
  } catch (err) {
    console.error('[catalog] could not write the disk copy:', err.message);
  }
}

function loadFromDisk() {
  try {
    const { items } = JSON.parse(fs.readFileSync(DISK_CACHE, 'utf8'));
    return Array.isArray(items) && items.length ? items : null;
  } catch {
    return null;   // never existed, or unreadable — the caller handles it
  }
}

/**
 * Every active product, in shop order. Throws only when there is nothing
 * usable at all — never returns a partial or empty catalogue on failure,
 * because an empty catalogue looks exactly like "everything sold out".
 */
export async function getCatalog({ maxAgeMs = FRESH_MS } = {}) {
  if (!catalogConfigured()) throw new Error('LMS_API_BASE is not set — the catalogue lives in the LMS');

  const age = Date.now() - cache.at;
  if (cache.items && age < maxAgeMs) return cache.items;

  // Collapse concurrent refreshes into one request.
  if (!inFlight) {
    inFlight = fetchFromLms()
      .then((items) => {
        cache = { at: Date.now(), items };
        saveToDisk(items);
        return items;
      })
      .finally(() => { inFlight = null; });
  }

  try {
    return await inFlight;
  } catch (err) {
    if (cache.items && age < STALE_MS) {
      console.error(`[catalog] refresh failed, serving cached copy (${Math.round(age / 1000)}s old): ${err.message}`);
      return cache.items;
    }
    // Nothing in memory — a cold start with the LMS down. Fall back to the last
    // catalogue this server ever saw rather than taking the shop offline.
    const fromDisk = loadFromDisk();
    if (fromDisk) {
      console.error(`[catalog] refresh failed, serving last-known-good from disk: ${err.message}`);
      cache = { at: Date.now() - FRESH_MS, items: fromDisk };  // usable, but retried next call
      return fromDisk;
    }
    console.error(`[catalog] refresh failed and no usable copy: ${err.message}`);
    throw new Error('The shop is temporarily unavailable. Please try again in a moment.');
  }
}

/**
 * Active products only, sorted — the shape routes used to get from Mongo.
 * Pass { maxAgeMs: 0 } to insist on a re-fetch: use that wherever the number
 * becomes a charge, so an edited price is never billed at the old figure. It
 * still falls back to the cached copy if the LMS can't be reached.
 */
export async function findActive(opts) {
  const items = await getCatalog(opts);
  return items.filter((p) => p.active !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** One active product by its storefront slug, or null. */
export async function findBySlug(slug, opts) {
  const wanted = String(slug || '').trim().toLowerCase();
  const items = await findActive(opts);
  return items.find((p) => String(p.slug).toLowerCase() === wanted) || null;
}

/** Active products for a list of slugs, in shop order. Missing ones are absent. */
export async function findBySlugs(slugs = [], opts) {
  const wanted = new Set(slugs.map((s) => String(s || '').trim().toLowerCase()).filter(Boolean));
  const items = await findActive(opts);
  return items.filter((p) => wanted.has(String(p.slug).toLowerCase()));
}

/** Prices that are about to be charged are always read fresh. */
export const LIVE = { maxAgeMs: 0 };

/** Drops the memo so the next read re-fetches (used after a known change). */
export function clearCatalogCache() {
  cache = { at: 0, items: null };
}
