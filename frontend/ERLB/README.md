# ERLB MERN Commerce Platform

Production-focused MERN e-commerce platform for ERLB (Eat Right Live Bright).

## Implemented Scope

- Real payments: Razorpay/Stripe-ready flow + webhook verification
- Admin dashboard: product catalog management, stock updates, order shipping states, refund processing
- Security hardening: Helmet, rate limiting, anti-NoSQL injection sanitize, HPP, input validation, audit logs
- Legal/compliance pages: Privacy, Terms, Refund/Shipping, FSSAI page scaffold
- Transactional notifications: order confirmation, shipping updates, password reset via SMTP + Twilio
- Shipping integration layer: shipping quote by zone, courier/tracking generation endpoint
- Analytics + SEO: GA4 + Meta Pixel hooks, react-helmet tags, sitemap, robots, schema JSON-LD
- Monitoring/Ops: metrics endpoint, structured app logs, CI workflow, Render blueprint, backup script
- QA: backend and frontend unit tests + Playwright smoke test scaffold
- Performance: compression, static cache headers, lazy-loaded images, manifest/favicon assets

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, Vite, React Router

## Local Setup

1. Copy env templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Install dependencies:

```bash
npm run install:all
```

3. Seed database:

```bash
npm run seed
```

4. Run app:

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5001

Demo users:
- Admin: `admin@erlb.com / admin123`
- User: `user@erlb.com / user123`

## Critical Env Vars

### Backend (`server/.env`)

- `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
- Payment:
  - `PAYMENT_PROVIDER=razorpay` or `stripe`
  - Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
  - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Notification:
  - SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
  - SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Frontend (`client/.env`)

- `VITE_API_URL`
- Optional analytics: `VITE_GA4_ID`, `VITE_META_PIXEL_ID`

## Major API Endpoints

- Auth/Profile:
  - `POST /api/users`
  - `POST /api/users/login`
  - `POST /api/users/forgot-password`
  - `POST /api/users/reset-password`
  - `GET/PUT /api/users/profile`
- Products:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/products` (admin)
  - `PUT/DELETE /api/products/:id` (admin)
- Orders:
  - `POST /api/orders`
  - `GET /api/orders/myorders`
  - `GET /api/orders` (admin)
  - `PUT /api/orders/:id/shipping` (admin)
  - `POST /api/orders/:id/refund` (customer)
  - `PUT /api/orders/:id/refund` (admin)
- Payments:
  - `GET /api/payments/config`
  - `POST /api/payments/create-order`
  - `POST /api/payments/confirm`
  - `POST /api/payments/webhook`
- Shipping:
  - `POST /api/shipping/quote`
  - `GET /api/shipping/tracking/:id`
- Admin/Monitoring:
  - `GET /api/admin/dashboard`
  - `GET /api/monitoring/metrics`

## Deployment

### Render

- Use `render.yaml` in repo root.
- Set env vars in Render dashboard (especially DB, JWT, payment, SMTP/SMS).
- Configure Razorpay/Stripe webhook URL:
  - `https://<api-domain>/api/payments/webhook`

### CDN + Images

- For go-live, move product images from external links to Cloudinary/S3 + CDN.
- Add transformed image URLs (webp/avif, width variants) in product records.

## Testing

```bash
npm run test
npm run test:e2e
```

## Ops

- Metrics: `GET /api/monitoring/metrics` (admin token required)
- Logs: `server/logs/app.log`
- Mongo backup script: `scripts/backup-mongodb.sh`

## Required Before Real Launch

- Replace placeholder FSSAI/license and legal text with your finalized legal copy.
- Configure live payment keys + verified webhooks.
- Configure production SMTP/Twilio credentials.
- Run end-to-end QA on staging domain with real delivery pin codes.
