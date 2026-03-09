# COPILOT SESSION LOG
> Rekap percakapan Nasywa × GitHub Copilot
> Tanggal: 9 Maret 2026
> Disimpan agar bisa dilanjutkan di sesi berikutnya

---

## STRUKTUR TIM STOXIFY

| Role | Siapa |
|------|-------|
| Founder | Fahmi (Backend/ML) |
| Co-founder | Nasywa Alya Kamila (Frontend/Mobile) |
| Konsultan | Claude AI |
| Dev / Pekerja | GitHub Copilot + Claude Code |

---

## RULES & STANDAR KERJA (WAJIB DIIKUTI)

1. **GitHub Copilot adalah dev/pekerja** — bukan konsultan. Konsultan adalah Claude AI.
2. **Tidak boleh mengerjakan apapun tanpa izin Nasywa** — tunggu instruksi eksplisit.
3. **Sesuai docs** — semua implementasi harus mengikuti dokumen di `docs/docs/`.
4. **Tidak boleh melenceng** — kalau ada yang tidak ada di docs, **tanya Nasywa dulu** sebelum implement.
5. **Standar enterprise-grade** — kode harus mewah, terstruktur, konsisten, scalable.
6. **Brand Stoxify wajib dipakai** — Tailwind colors `stx-*`, font Syne + DM Mono.
7. **Kalau ragu / tidak ada di docs → tanya Nasywa dulu, jangan asumsi sendiri.**

---

## RINGKASAN PROJECT STOXIFY

### Deskripsi
Platform investasi saham & crypto berbasis web (Next.js) + mobile (Flutter).
Tagline: *"The market, simplified."*
Founders: Muhammad Fahmi & Nasywa Alya Kamila

### Platform Properties
| URL | Fungsi |
|-----|--------|
| `stoxify.com` | Landing page publik |
| `app.stoxify.com` | Web app utama (Next.js) |
| `admin.stoxify.com` | Dashboard internal tim |
| `api.stoxify.com` | Backend FastAPI |
| `ml.stoxify.com` | ML Service FastAPI |
| Stoxify iOS/Android | Flutter app |

### Tier & Harga
| Tier | Harga/bulan |
|------|-------------|
| Lite | Rp 220.000 |
| Growth | Rp 550.000 |
| Apex | Rp 885.000 |
> Free trial 3 hari Apex, tanpa kartu kredit. Auto downgrade ke Lite setelah trial habis.

---

## TECH STACK FRONTEND (stoxify-web)

| Kategori | Stack |
|----------|-------|
| Framework | Next.js App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui + tailwind-merge + clsx |
| Animasi | framer-motion |
| State | Zustand (client) + @tanstack/react-query (server) |
| HTTP | axios |
| Form | react-hook-form + zod + @hookform/resolvers |
| Notification | sonner |
| Utility | date-fns + numeral |
| Interaksi | react-copy-to-clipboard + hotkeys-js |

### Brand Colors (Tailwind)
```ts
colors: {
  'stx-bg':      '#010206',
  'stx-surface': '#03060F',
  'stx-surface2':'#05091A',
  'stx-primary': '#162444',
  'stx-gold':    '#F0B429',
  'stx-text':    '#FFFEF8',
  'stx-success': '#4ADE80',
  'stx-danger':  '#F87171',
  'stx-warning': '#FB923C',
  'stx-ai':      '#67E8F9',
  'stx-ml':      '#C4B5FD',
}
```

### Font
- Heading: **Syne**
- Mono/code: **DM Mono**

---

## SIKLUS BUILD (Shape Up)

| Siklus | Nama | Appetite |
|--------|------|----------|
| 0 | Setup & Infrastructure | Small Batch — 1 minggu |
| 1 | Auth + Payment + Landing Page | Big Batch — 4 minggu |
| 2 | Data Pipeline + Hot News + Sentiment | Big Batch — 4 minggu |
| 3 | Core User Features — MVP Beta | Big Batch — 4 minggu |
| 4 | ML Service — AI Score + Predictions | Big Batch — 4 minggu |
| 5 | Intraday Suite + Smart Recommendations (Apex) | Big Batch — 4 minggu |
| 6 | Chat Support + Community + Notifikasi | Big Batch — 4 minggu |
| 7 | Admin Dashboard + Marketing AI Suite | Big Batch — 4 minggu |
| 8 | Polish + Security Audit + Launch | Big Batch — 4 minggu |

---

## STATUS SAAT INI

**Siklus aktif: Siklus 0 — Setup & Infrastructure**
Nasywa sedang setup sendiri (bukan vibe coding dengan AI dulu).

### Progress Siklus 0 — Checklist Nasywa

| Deliverable | Status |
|-------------|--------|
| Setup Next.js + App Router + TypeScript | ✅ Done |
| Struktur folder `app/`, `components/`, `lib/` | ✅ Done |
| Halaman placeholder `/`, `/login`, `/register`, `/dashboard` | ✅ Done |
| Komponen dasar: Button, Input, Card | ✅ Done |
| Library Siklus 0 di-install (termasuk react-copy-to-clipboard + hotkeys-js) | ✅ Done |
| Tailwind brand colors Stoxify (`stx-*`) | ⬜ Todo |
| Font Syne + DM Mono via `next/font` | ⬜ Todo |
| ESLint + Prettier config | ⬜ Todo |
| CLAUDE.md di repo | ⬜ Todo |
| GitHub Actions: lint on PR | ⬜ Todo |
| Vercel auto-deploy dari branch staging | ⬜ Todo |

---

## API BASE FETCHER (Sudah Direncanakan di Siklus 0)

```ts
// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    credentials: 'include',  // untuk httpOnly cookie refresh token
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || "API error")
  }
  return res.json()
}
```

---

## KONVENSI API

- Base URL Dev: `http://localhost:8000/api/v1`
- Auth: `Authorization: Bearer {access_token}`
- Refresh token: httpOnly cookie (JANGAN simpan di localStorage)
- Response format:
```json
{ "success": true, "data": { ... }, "message": "OK" }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Pesan error" } }
```
- Harga: selalu `string DECIMAL`, bukan `float`
- Timestamp: selalu ISO 8601 UTC
- Delete: soft delete, tidak boleh hard delete

---

## CATATAN PENTING

- Nasywa akan menghubungi Copilot saat butuh bantuan
- Setiap sesi baru: paste file ini + docs yang relevan agar Copilot langsung paham konteks
- Docs lengkap ada di: `docs/docs/` (LIBRARIES.md, stoxify-api-contract.md, STOXIFY-feature-list.txt, STOXIFY-tier-distribution.txt, stoxify-pitch-semua-siklus.txt)
