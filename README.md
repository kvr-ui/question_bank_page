# FOCAS Infinite Question Bank: website

MERN stack: **React (Vite + Tailwind)** front end, **Express + MongoDB** back end, **Razorpay** payments.

## Run locally
```bash
cp .env.example .env        # then fill in values
npm install                 # installs root + server deps
npm install --prefix client
npm run seed                # adds 8 subjects + Group 1 / Group 2 / All-8 sets (placeholder prices)
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
| `/admin` | Leads (status, notes, CSV export), Orders (dispatch + CA Guru.ai access toggle), Payment links, Products & prices, Testimonials. |

## Things to plug in
- **Logo:** save a light/transparent logo as `client/public/logo/focas.png`. A text wordmark shows until then.
- **Header animation:** replace the contents of `client/src/components/HeroAnimation.jsx`.
- **Testimonials:** upload each video to Bunny Stream, then paste its link (play/embed URL or iframe code) in **Admin → Testimonials**.
- **Prices:** Admin → Products & prices. The seeded prices are placeholders.
- **Razorpay:** put test keys in `.env`. Add a webhook at `https://<your-domain>/api/payments/webhook` for `payment.captured`, `order.paid` and `payment.failed`, using `RAZORPAY_WEBHOOK_SECRET`. Swap in live keys at launch.

## Deploy (Hostinger Node.js app)
- Build command: `npm run build`
- Start command: `npm start`
- Env vars: everything in `.env.example`, with `NODE_ENV=production`, `PUBLIC_URL=https://<your-domain>` and a MongoDB Atlas `MONGODB_URI`.

In production, Express serves the built React app and the API from one process.
# question_bank_page
