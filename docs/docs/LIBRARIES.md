# STOXIFY WEB — FRONTEND LIBRARIES
> Daftar lengkap library yang digunakan di stoxify-web (Next.js)
> Install sesuai siklus — jangan install semua sekarang
> Last updated: Maret 2026

---

## SIKLUS 0 — Foundation
> Install semua ini saat setup awal stoxify-web

```bash
# UI & Styling
npx shadcn@latest init
npm install tailwind-merge clsx

# Animasi
npm install framer-motion

# Data Fetching & State
npm install @tanstack/react-query zustand axios

# Form & Validation
npm install react-hook-form zod @hookform/resolvers

# Notification
npm install sonner

# Utility
npm install date-fns numeral

# Interaksi
npm install react-copy-to-clipboard hotkeys-js
```

| Library | Kegunaan |
|---------|----------|
| `shadcn/ui` | Component library utama |
| `tailwind-merge` | Merge Tailwind classes tanpa konflik |
| `clsx` | Conditional classnames |
| `framer-motion` | Animasi utama (page transition, scroll, gesture) |
| `@tanstack/react-query` | Server state, fetching, caching |
| `zustand` | Client state management |
| `axios` | HTTP client ke backend |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |
| `@hookform/resolvers` | Penghubung React Hook Form + Zod |
| `sonner` | Toast notifications |
| `date-fns` | Manipulasi tanggal |
| `numeral` | Format angka (Rp 1.234.567) |
| `react-copy-to-clipboard` | Copy kode referral, salin data saham |
| `hotkeys-js` | Keyboard shortcut untuk power user trader |

---

## SIKLUS 1 — Auth + Landing Page

```bash
npm install next-auth js-cookie qrcode.react react-share
# Aceternity UI — ikuti panduan di https://ui.aceternity.com/docs
# Motion Number
npm install motion-number
```

| Library | Kegunaan |
|---------|----------|
| `aceternity-ui` | Animated components premium untuk hero section landing page |
| `motion-number` | Animasi angka berubah untuk stats di landing page |
| `next-auth` | Google OAuth + session management |
| `js-cookie` | Handle cookie JWT di client |
| `qrcode.react` | QR code untuk referral |
| `react-share` | Share ke WhatsApp, Twitter, dll |

---

## SIKLUS 2 — Data Pipeline + News + Sentiment

```bash
npm install recharts react-select @tanstack/react-table
npm install react-infinite-scroll-component next-intl
```

| Library | Kegunaan |
|---------|----------|
| `recharts` | Chart sederhana untuk preview data saham |
| `react-select` | Dropdown filter saham, sektor, exchange |
| `@tanstack/react-table` | Tabel data powerful dengan sorting, filtering, pagination |
| `react-infinite-scroll-component` | News feed panjang dengan infinite scroll |
| `next-intl` | Multi-bahasa (Bahasa Indonesia + English) |

---

## SIKLUS 3 — Core User Features

```bash
npm install lightweight-charts react-day-picker
npm install @tanstack/react-virtual socket.io-client
npm install react-dropzone browser-image-compression driver.js
```

| Library | Kegunaan |
|---------|----------|
| `lightweight-charts` | TradingView charts untuk candlestick |
| `react-day-picker` | Date range picker untuk filter data historis |
| `@tanstack/react-virtual` | Render list panjang (ribuan saham) tanpa lag |
| `socket.io-client` | WebSocket untuk data real-time |
| `react-dropzone` | Upload foto profil user |
| `browser-image-compression` | Kompres gambar sebelum upload |
| `driver.js` | Guided tour untuk user baru pertama masuk dashboard |

---

## SIKLUS 4 — ML Service + AI Score

```bash
npm install @nivo/core @nivo/heatmap @nivo/scatterplot
npm install nprogress react-loading-skeleton react-pdf
```

| Library | Kegunaan |
|---------|----------|
| `@nivo/core` | Base library Nivo |
| `@nivo/heatmap` | Heatmap korelasi untuk output ML |
| `@nivo/scatterplot` | Scatter plot prediksi ML |
| `nprogress` | Loading bar di top page |
| `react-loading-skeleton` | Skeleton loading untuk cards dan charts |
| `react-pdf` | Lihat laporan keuangan emiten langsung di platform |

---

## SIKLUS 5 — Intraday Intelligence Suite

```bash
npm install gsap react-spring tsparticles use-sound
```

| Library | Kegunaan |
|---------|----------|
| `gsap` | Animasi cinematic untuk dashboard intraday real-time |
| `react-spring` | Physics-based animation untuk transisi halus |
| `tsparticles` | Efek partikel untuk halaman premium APEX |
| `use-sound` | Sound effect subtle untuk alert sinyal trading |

---

## SIKLUS 6 — Chat + Community + Notifikasi

```bash
npm install react-scroll react-textarea-autosize auto-animate
npm install sweetalert2 emoji-mart react-joyride
```

| Library | Kegunaan |
|---------|----------|
| `react-scroll` | Auto scroll ke bawah di chat window |
| `react-textarea-autosize` | Textarea yang auto expand saat ketik pesan |
| `auto-animate` | Animasi otomatis untuk list pesan baru masuk |
| `sweetalert2` | Modal konfirmasi untuk aksi penting di community |
| `emoji-mart` | Emoji picker untuk chat |
| `react-joyride` | Onboarding tour untuk fitur community baru |

---

## SIKLUS 7 — Admin Dashboard

```bash
npm install @tremor/react react-csv jspdf jspdf-autotable
npm install @tiptap/react @tiptap/starter-kit react-colorful
```

| Library | Kegunaan |
|---------|----------|
| `@tremor/react` | Dashboard admin — charts, metric cards, tables |
| `react-csv` | Export data ke CSV untuk audit OJK |
| `jspdf` | Generate laporan PDF |
| `jspdf-autotable` | Tabel di dalam PDF |
| `@tiptap/react` | Rich text editor untuk disclaimer versi admin |
| `react-colorful` | Kustomisasi warna chart di admin |

---

## SIKLUS 8 — Polish + Security + Launch

```bash
npm install sharp next-sitemap @sentry/nextjs
npm install @vercel/analytics @vercel/speed-insights
```

| Library | Kegunaan |
|---------|----------|
| `sharp` | Optimasi gambar (perlu diinstall manual meski built-in Next.js) |
| `next-sitemap` | Generate sitemap otomatis untuk SEO |
| `@sentry/nextjs` | Error monitoring frontend (pasangan dari backend) |
| `@vercel/analytics` | Analytics Vercel |
| `@vercel/speed-insights` | Monitoring performance di production |

---

## SUMMARY

| Siklus | Jumlah Library |
|--------|---------------|
| 0 — Foundation | 15 |
| 1 — Auth + Landing | 6 |
| 2 — Data + News | 5 |
| 3 — Core Features | 7 |
| 4 — ML + AI Score | 6 |
| 5 — Intraday Suite | 4 |
| 6 — Chat + Community | 6 |
| 7 — Admin Dashboard | 6 |
| 8 — Launch | 5 |
| **Total** | **60 library** |

---

*Stoxify — "The market, simplified."*
*Fahmi + Nasywa — 2026*
