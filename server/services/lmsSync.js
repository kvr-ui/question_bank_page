// services/lmsSync.js
// Pushes each paid order into the FOCAS LMS, which records it as a Purchase with
// source 'qbstore'. That's what makes the sale appear in the admin app's All
// Orders, Dashboard counts and every sales report, and what grants the buyer
// their LMS access.
//
// Design rule: a payment must never fail because the LMS is unreachable. The
// push runs after the money is already banked, records its outcome on the order,
// and a sweeper retries what didn't land. Without that retry this repeats the
// "paid but no order" hole the main store already has.
import Order from '../models/Order.js';

// Trimmed on purpose. Node's --env-file (and Docker's --env-file) keep trailing
// whitespace and carriage returns inside the value, so `KEY=https://host ` gives
// a base URL with a space in it — which becomes %20 in the path and 404s, and a
// secret with a stray space silently fails the 401 check. Both look like the
// integration is broken rather than the config.
const LMS_API_BASE    = (process.env.LMS_API_BASE    || '').trim();
const LMS_SYNC_SECRET = (process.env.LMS_SYNC_SECRET || '').trim();

const MAX_ATTEMPTS  = 6;
const REQUEST_MS    = 15_000;
const SWEEP_EVERY_MS = 5 * 60_000;

export function lmsSyncConfigured() {
  return Boolean(LMS_API_BASE && LMS_SYNC_SECRET);
}

/** The payload shape the LMS endpoint expects. Prices stay in paise. */
function toPayload(order) {
  return {
    orderId:  String(order._id),
    amount:   order.amount,
    currency: order.currency || 'INR',
    paidAt:   order.paidAt,
    razorpayPaymentId: order.razorpayPaymentId,
    customer: {
      name:    order.customer?.name,
      phone:   order.customer?.phone,
      email:   order.customer?.email,
      caLevel: order.customer?.caLevel,
    },
    shipping: {
      address: order.shipping?.address,
      city:    order.shipping?.city,
      state:   order.shipping?.state,
      pincode: order.shipping?.pincode,
    },
    items: (order.items || []).map((i) => ({ productId: i.productId, slug: i.slug, title: i.title, price: i.price })),
  };
}

/**
 * One attempt. Returns { ok, purchaseId } or { ok: false, error, retryable }.
 * A 4xx other than 409 is a payload the LMS will never accept, so it isn't
 * retried — 409 means "SKU not linked yet", which an admin can still fix.
 */
async function pushOnce(order) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_MS);
  try {
    const res = await fetch(`${LMS_API_BASE.replace(/\/$/, '')}/api/purchase/qb-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-qb-secret': LMS_SYNC_SECRET },
      body: JSON.stringify(toPayload(order)),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, purchaseId: body.purchaseId || null };

    // 409 = SKU not linked in the catalogue yet; 404 = the LMS doesn't have this
    // route yet (pointed at a deployment that predates it). Both look permanent
    // but are really "not ready", and both are fixed without the customer ever
    // knowing — so both are worth retrying rather than stranding a paid order.
    const retryable = [404, 409, 429].includes(res.status) || res.status >= 500;
    const detail = body.unmapped?.length ? `${body.error}: ${body.unmapped.join(', ')}` : body.error;
    return { ok: false, error: `HTTP ${res.status} ${detail || ''}`.trim(), retryable };
  } catch (err) {
    // Network error / timeout — always worth another go.
    return { ok: false, error: err.name === 'AbortError' ? 'LMS request timed out' : err.message, retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

/** Push one order and record the outcome on it. Never throws. */
export async function syncOrderToLms(order) {
  if (!lmsSyncConfigured()) return { ok: false, error: 'LMS sync not configured' };

  const attempts = (order.lmsSync?.attempts || 0) + 1;
  const result = await pushOnce(order);

  const update = result.ok
    ? { 'lmsSync.status': 'synced', 'lmsSync.at': new Date(), 'lmsSync.attempts': attempts,
        'lmsSync.error': '', 'lmsSync.purchaseId': result.purchaseId }
    : { 'lmsSync.status': result.retryable && attempts < MAX_ATTEMPTS ? 'pending' : 'failed',
        'lmsSync.attempts': attempts, 'lmsSync.error': result.error };

  await Order.updateOne({ _id: order._id }, { $set: update });

  if (!result.ok) {
    console.error(`[lms-sync] order=${order._id} attempt=${attempts} ${result.error}`);
  }
  return result;
}

/**
 * Retry everything paid that hasn't landed yet. Runs on an interval and is also
 * safe to call by hand. Orders are pushed one at a time — this is a trickle of
 * stragglers, not a throughput path.
 */
export async function sweepPendingLmsSyncs(limit = 25) {
  if (!lmsSyncConfigured()) return { attempted: 0, synced: 0 };

  const stuck = await Order.find({ status: 'paid', 'lmsSync.status': 'pending' })
    .sort({ paidAt: 1 })
    .limit(limit);

  let synced = 0;
  for (const order of stuck) {
    const r = await syncOrderToLms(order);
    if (r.ok) synced++;
  }
  if (stuck.length) console.log(`[lms-sync] sweep: ${synced}/${stuck.length} synced`);
  return { attempted: stuck.length, synced };
}

export function startLmsSyncSweeper() {
  if (!lmsSyncConfigured()) {
    console.log('[lms-sync] disabled — set LMS_API_BASE and LMS_SYNC_SECRET to enable');
    return null;
  }
  console.log(`[lms-sync] enabled → ${LMS_API_BASE}`);
  const timer = setInterval(() => { sweepPendingLmsSyncs().catch(() => {}); }, SWEEP_EVERY_MS);
  timer.unref?.();
  return timer;
}
