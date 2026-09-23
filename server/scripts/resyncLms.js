// scripts/resyncLms.js
// Requeues paid orders that never reached the FOCAS LMS and pushes them now.
//
//   npm run lms:resync              # retry everything still pending
//   npm run lms:resync -- --failed  # also requeue ones that gave up
//   npm run lms:resync -- --all     # ...and orders that predate this feature
//   npm run lms:resync -- --status  # just report, change nothing
//
// The sweeper inside the running server only retries orders left 'pending'. An
// order that exhausted its attempts sits at 'failed' until someone looks — this
// is that look. Safe to run repeatedly: the LMS keys on (orderId, source), so a
// sale already recorded comes back as alreadyRecorded instead of double-counting.
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Order from '../models/Order.js';
import { sweepPendingLmsSyncs, lmsSyncConfigured } from '../services/lmsSync.js';

const args = process.argv.slice(2);
const includeAll = args.includes('--all');
const includeFailed = includeAll || args.includes('--failed');
const statusOnly = args.includes('--status');

await connectDB();

const counts = async () => ({
  paid:    await Order.countDocuments({ status: 'paid' }),
  synced:  await Order.countDocuments({ status: 'paid', 'lmsSync.status': 'synced' }),
  pending: await Order.countDocuments({ status: 'paid', 'lmsSync.status': 'pending' }),
  failed:  await Order.countDocuments({ status: 'paid', 'lmsSync.status': 'failed' }),
  never:   await Order.countDocuments({ status: 'paid', 'lmsSync.status': { $exists: false } }),
});

const before = await counts();
console.log('paid orders:', before.paid);
console.log(`  synced ${before.synced} | pending ${before.pending} | failed ${before.failed} | never attempted ${before.never}`);

if (before.failed) {
  const stuck = await Order.find({ status: 'paid', 'lmsSync.status': 'failed' })
    .select('_id lmsSync.error lmsSync.attempts').lean();
  console.log('\nfailed:');
  stuck.forEach((o) => console.log(`  ${o._id}  (${o.lmsSync?.attempts} attempts)  ${o.lmsSync?.error}`));
}

if (statusOnly) {
  await mongoose.disconnect();
  process.exit(0);
}

if (!lmsSyncConfigured()) {
  console.error('\nLMS_API_BASE / LMS_SYNC_SECRET not set — nothing to do.');
  await mongoose.disconnect();
  process.exit(1);
}

// Orders taken before this feature existed carry no lmsSync field at all, so
// the sweeper's `status: 'pending'` query cannot see them. --all opts them in.
if (includeAll && before.never) {
  const r = await Order.updateMany(
    { status: 'paid', 'lmsSync.status': { $exists: false } },
    { $set: { 'lmsSync.status': 'pending', 'lmsSync.attempts': 0, 'lmsSync.error': '' } }
  );
  console.log(`\nqueued ${r.modifiedCount} order(s) that predate the LMS sync`);
}

if (includeFailed && before.failed) {
  const r = await Order.updateMany(
    { status: 'paid', 'lmsSync.status': 'failed' },
    { $set: { 'lmsSync.status': 'pending', 'lmsSync.attempts': 0, 'lmsSync.error': '' } }
  );
  console.log(`\nrequeued ${r.modifiedCount} failed order(s)`);
}

console.log('\npushing…');
const { attempted, synced } = await sweepPendingLmsSyncs(500);
console.log(`  ${synced}/${attempted} synced`);

const after = await counts();
console.log(`\nnow: synced ${after.synced} | pending ${after.pending} | failed ${after.failed}`);
if (after.failed || after.pending) {
  console.log('Anything still stuck: check the error above, fix it, then run again with --failed.');
}

await mongoose.disconnect();
