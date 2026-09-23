# FOCAS Infinite Question Bank: website

MERN stack: **React (Vite + Tailwind)** front end, **Express + MongoDB** back end, **Razorpay** payments.

## Run locally
```bash
cp .env.example .env        # then fill in values
npm install                 # installs root + server deps
npm install --prefix client
npm run dev                 # site on http://localhost:5173, API on :5000
```
Admin panel: http://localhost:5173/admin (password = `ADMIN_PASSWORD`).

## Pages
| URL | What |
|---|---|
| `/` | Landing page. **No prices anywhere.** The CTA is a call-back form, and the success message is the executive script. |
| `/checkout/<slug>` | "Buy now" checkout. Price shown here only. |
| `/pay/<token>` | Payment link created by an executive in admin (optional custom price, expires). |
| `/order/success/<id>` | Confirmation page. |
| `/admin` | Leads (status, notes, CSV export), Orders (dispatch + CA Guru.ai access toggle), Payment links, Products & prices (read-only mirror), Testimonials. |

## Things to plug in
- **Logo:** save a light/transparent logo as `client/public/logo/focas.png`. A text wordmark shows until then.
- **Header animation:** replace the contents of `client/src/components/HeroAnimation.jsx`.
- **Testimonials:** upload each video to Bunny Stream, then paste its link (play/embed URL or iframe code) in **Admin → Testimonials**.
- **Products & prices:** set in the **FOCAS LMS admin**, not here. This site has no product
  catalogue of its own — it reads `GET /api/store/products` on the LMS, so a price or stock
  count is changed in one place. Put a product on this shop from the LMS Products drawer →
  **Storefront** panel (turn it on and give it a slug). The `/admin/products` page here is a
  read-only mirror.
- **LMS link:** `LMS_API_BASE` and `LMS_SYNC_SECRET` in `.env` are required — without them the
  shop has no catalogue and paid orders never reach the LMS. `LMS_SYNC_SECRET` must match
  `QB_SYNC_SECRET` on the LMS. Every paid order is pushed to the LMS as a Purchase with
  source `market`; `npm run lms:resync -- --status` shows anything that hasn't landed.
- **Razorpay:** put test keys in `.env`. Add a webhook at `https://<your-domain>/api/payments/webhook` for `payment.captured`, `order.paid` and `payment.failed`, using `RAZORPAY_WEBHOOK_SECRET`. Swap in live keys at launch.

## Deploy (Hostinger Node.js app)
- Build command: `npm run build`
- Start command: `npm start`
- Env vars: everything in `.env.example`, with `NODE_ENV=production`, `PUBLIC_URL=https://<your-domain>` and a MongoDB Atlas `MONGODB_URI`.

In production, Express serves the built React app and the API from one process.
# question_bank_page
