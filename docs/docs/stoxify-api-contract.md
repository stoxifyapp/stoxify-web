# STOXIFY — API CONTRACT
> Dokumen ini adalah kontrak antara Fahmi (backend) dan Nasywa (frontend).
> Semua endpoint didefinisikan di sini SEBELUM kode ditulis.
> Claude Code harus mengikuti format ini saat generate endpoint baru.
> Last updated: Maret 2026

---

## CONVENTIONS

### Base URL
```
Development:  http://localhost:8000/api/v1
Staging:      https://api-staging.stoxify.id/api/v1
Production:   https://api.stoxify.id/api/v1
```

### Auth Header
```
Authorization: Bearer {access_token}
```

### Standard Response
```json
// Success
{ "success": true, "data": { ... }, "message": "OK" }

// Success list
{ "success": true, "data": { "items": [...], "total": 100, "page": 1, "per_page": 20 } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Pesan error" } }
```

### Error Codes
| Code | HTTP | Keterangan |
|------|------|-----------|
| `UNAUTHORIZED` | 401 | Token invalid/expired |
| `FORBIDDEN` | 403 | Tier tidak cukup |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `TIER_REQUIRED` | 403 | Fitur butuh tier lebih tinggi |

### Tier Values
```
"lite" | "growth" | "apex"
```

---

## SIKLUS 0 — Setup & Infra
> Tidak ada endpoint di siklus ini. Focus: repo, CI/CD, Railway, Supabase, Redis.

---

## SIKLUS 1 — Auth + Payment + Landing

### AUTH

#### POST /auth/register
```json
// Request
{
  "email": "string",
  "phone_wa": "string",       // format: 628xxx
  "name": "string",
  "password": "string",       // min 8 karakter
  "channel": "wa" | "email"   // channel OTP
}

// Response 201
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "message": "OTP dikirim ke WA/email"
  }
}

// Errors
// 400 VALIDATION_ERROR — field tidak valid
// 409 — email/phone sudah terdaftar
```

#### POST /auth/verify-otp
```json
// Request
{
  "user_id": "uuid",
  "code": "string",     // 6 digit
  "purpose": "register" | "login" | "reset_password"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "string",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "tier": "lite",
      "is_trial": false,
      "profile_completed": false
    }
  }
}
// Note: refresh_token di-set via httpOnly cookie otomatis

// Errors
// 400 — OTP salah atau expired
```

#### POST /auth/login
```json
// Request
{
  "email": "string",
  "password": "string"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "string",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone_wa": "string",
      "avatar_url": "string | null",
      "tier": "lite" | "growth" | "apex",
      "is_trial": false,
      "trial_ends_at": "datetime | null",
      "profile_completed": true,
      "preferred_language": "id",
      "theme": "dark"
    }
  }
}

// Errors
// 401 — email/password salah
// 403 — akun suspended
```

#### POST /auth/login/google
```json
// Request
{
  "google_token": "string"    // token dari Google OAuth
}

// Response 200 — sama dengan /auth/login
```

#### POST /auth/refresh
```json
// Request: tidak perlu body
// refresh_token diambil dari httpOnly cookie otomatis

// Response 200
{
  "success": true,
  "data": {
    "access_token": "string"
  }
}

// Errors
// 401 — refresh token invalid/expired
```

#### POST /auth/logout
```json
// Request: JWT required
// Response 200
{ "success": true, "data": null, "message": "Logged out" }
```

#### POST /auth/forgot-password
```json
// Request
{ "email": "string" }

// Response 200
{ "success": true, "data": null, "message": "OTP dikirim" }
```

#### POST /auth/reset-password
```json
// Request
{
  "user_id": "uuid",
  "otp_code": "string",
  "new_password": "string"
}

// Response 200
{ "success": true, "data": null, "message": "Password berhasil diubah" }
```

#### POST /auth/resend-otp
```json
// Request
{
  "user_id": "uuid",
  "channel": "wa" | "email",
  "purpose": "register" | "login" | "reset_password"
}

// Response 200
{ "success": true, "data": null, "message": "OTP dikirim ulang" }
```

---

### USER PROFILE

#### GET /users/me
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone_wa": "string",
    "avatar_url": "string | null",
    "tier": "lite",
    "is_trial": false,
    "trial_ends_at": "datetime | null",
    "subscription": {
      "status": "active",
      "current_period_end": "datetime",
      "billing_cycle": "monthly"
    },
    "profile_completed": true,
    "preferred_language": "id",
    "theme": "dark",
    "created_at": "datetime"
  }
}
```

#### PATCH /users/me
```json
// Auth: JWT required
// Request (semua optional)
{
  "name": "string",
  "phone_wa": "string",
  "preferred_language": "id" | "en",
  "theme": "dark" | "light",
  "avatar_url": "string"
}

// Response 200
{ "success": true, "data": { /* updated user */ } }
```

#### POST /users/me/complete-profile
```json
// Auth: JWT required
// Request
{
  "investment_experience": "beginner" | "intermediate" | "advanced",
  "risk_tolerance": "low" | "medium" | "high",
  "investment_goals": ["growth", "dividend", "trading"],
  "preferred_assets": ["stocks_idx", "stocks_global", "crypto"]
}

// Response 200
{ "success": true, "data": { "profile_completed": true } }
```

---

### CONSENT

#### GET /consents/pending
```json
// Auth: JWT required
// Cek apakah ada consent yang belum disetujui

// Response 200
{
  "success": true,
  "data": {
    "pending": [
      {
        "type": "tos" | "ai_features" | "recommendation" | "intraday_trading",
        "version": "1.0",
        "content": "string",
        "consent_version_id": "uuid"
      }
    ]
  }
}
```

#### POST /consents/agree
```json
// Auth: JWT required
// Request
{
  "consent_version_id": "uuid",
  "type": "tos" | "ai_features" | "recommendation" | "intraday_trading"
}

// Response 201
{
  "success": true,
  "data": {
    "consented_at": "datetime",
    "expires_at": "datetime | null"   // hanya untuk intraday_trading (30 hari)
  }
}
```

---

### SUBSCRIPTION & PAYMENT

#### GET /subscriptions/plans
```json
// Public endpoint (tidak perlu auth)

// Response 200
{
  "success": true,
  "data": {
    "plans": [
      {
        "tier": "lite",
        "price_monthly": 220000,
        "price_annual": 2112000,
        "price_annual_per_month": 176000,
        "savings_pct": 20,
        "features_summary": ["string"]
      },
      {
        "tier": "growth",
        "price_monthly": 550000,
        "price_annual": 5280000,
        "price_annual_per_month": 440000,
        "savings_pct": 20,
        "features_summary": ["string"]
      },
      {
        "tier": "apex",
        "price_monthly": 885000,
        "price_annual": 8496000,
        "price_annual_per_month": 708000,
        "savings_pct": 20,
        "features_summary": ["string"]
      }
    ],
    "trial": {
      "days": 3,
      "tier": "apex",
      "requires_card": false
    }
  }
}
```

#### POST /subscriptions/trial/start
```json
// Auth: JWT required

// Response 201
{
  "success": true,
  "data": {
    "tier": "apex",
    "trial_ends_at": "datetime",
    "days_remaining": 3
  }
}

// Errors
// 409 — sudah pernah trial sebelumnya
```

#### POST /subscriptions/checkout
```json
// Auth: JWT required
// Request
{
  "tier": "lite" | "growth" | "apex",
  "billing_cycle": "monthly" | "annual"
}

// Response 201
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "midtrans_token": "string",     // untuk Midtrans Snap
    "midtrans_redirect_url": "string",
    "amount": 220000,
    "expires_at": "datetime"
  }
}
```

#### POST /subscriptions/webhook/midtrans
```json
// Public — dipanggil Midtrans server
// Midtrans akan POST notification ke sini
// Backend verifikasi signature dan update status payment
```

#### GET /subscriptions/me
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "tier": "growth",
    "status": "active",
    "is_trial": false,
    "billing_cycle": "monthly",
    "current_period_start": "datetime",
    "current_period_end": "datetime",
    "next_billing_amount": 550000,
    "payment_history": [
      {
        "id": "uuid",
        "amount": 550000,
        "status": "success",
        "payment_method": "qris",
        "paid_at": "datetime"
      }
    ]
  }
}
```

#### POST /subscriptions/cancel
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "message": "Subscription akan berakhir pada akhir periode",
    "access_until": "datetime"
  }
}
```

---

## SIKLUS 2 — Data Pipeline + Hot News + Sentiment

### MARKET DATA

#### GET /market/assets
```json
// Auth: JWT required
// Query params: ?type=stock|crypto&exchange=IDX|NYSE|BINANCE&search=BBCA&page=1&per_page=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "symbol": "BBCA",
        "exchange": "IDX",
        "asset_type": "stock",
        "name": "Bank Central Asia Tbk",
        "sector": "Finance",
        "price": "9500.00000000",
        "change_abs": "100.00000000",
        "change_pct": "1.0638",
        "volume": 12500000,
        "market_cap": 1230000000000,
        "logo_url": "string",
        "last_updated": "datetime"
      }
    ],
    "total": 850,
    "page": 1,
    "per_page": 20
  }
}
```

#### GET /market/assets/{symbol}
```json
// Auth: JWT required
// Path: symbol = "BBCA" atau "BTCUSDT"
// Query: ?exchange=IDX

// Response 200
{
  "success": true,
  "data": {
    "symbol": "BBCA",
    "exchange": "IDX",
    "asset_type": "stock",
    "name": "Bank Central Asia Tbk",
    "name_id": "Bank Central Asia Tbk",
    "sector": "Finance",
    "industry": "Banking",
    "description": "string",
    "logo_url": "string",
    "price": {
      "current": "9500.00000000",
      "open": "9400.00000000",
      "high": "9550.00000000",
      "low": "9380.00000000",
      "close_prev": "9400.00000000",
      "change_abs": "100.00000000",
      "change_pct": "1.0638",
      "volume": 12500000,
      "vwap": "9485.00000000",
      "last_updated": "datetime"
    },
    "fundamental": {
      "market_cap": 1230000000000,
      "pe_ratio": "15.2",
      "pb_ratio": "3.1",
      "eps": "625.00",
      "dividend_yield": "2.5",
      "revenue": 95000000000000,
      "net_income": 40000000000000
    },
    "broker_links": [
      { "broker": "Stockbit", "url": "string" },
      { "broker": "IPOT", "url": "string" }
    ]
  }
}
```

#### GET /market/assets/{symbol}/chart
```json
// Auth: JWT required
// Query: ?exchange=IDX&timeframe=1D|1W|1M|3M|6M|1Y|ALL&interval=1m|5m|15m|1h|1D

// Response 200
{
  "success": true,
  "data": {
    "symbol": "BBCA",
    "timeframe": "1M",
    "interval": "1D",
    "candles": [
      {
        "time": 1704067200,    // Unix timestamp
        "open": "9200.00000000",
        "high": "9350.00000000",
        "low": "9150.00000000",
        "close": "9300.00000000",
        "volume": 11200000
      }
    ]
  }
}
```

#### GET /market/overview
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "idx": {
      "ihsg": { "value": "7250.50", "change_pct": "0.85", "status": "up" },
      "top_gainers": [ /* 5 aset */ ],
      "top_losers": [ /* 5 aset */ ],
      "most_active": [ /* 5 aset */ ]
    },
    "global": {
      "sp500": { "value": "5100.25", "change_pct": "-0.32" },
      "nasdaq": { "value": "16200.00", "change_pct": "0.15" },
      "dow": { "value": "38500.00", "change_pct": "-0.10" }
    },
    "crypto": {
      "btc": { "price": "65000.00", "change_pct": "2.15" },
      "eth": { "price": "3500.00", "change_pct": "1.80" },
      "total_market_cap": "2500000000000"
    },
    "fear_greed": {
      "value": 65,
      "label": "Greed",
      "prev_value": 60,
      "prev_label": "Greed"
    }
  }
}
```

#### GET /market/top-movers
```json
// Auth: JWT required
// Query: ?type=gainer|loser|active&exchange=IDX|GLOBAL|CRYPTO&limit=10

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "symbol": "GOTO",
        "exchange": "IDX",
        "name": "GoTo Gojek Tokopedia",
        "price": "85.00000000",
        "change_pct": "8.50",
        "volume": 2500000000
      }
    ]
  }
}
```

---

### HOT NEWS

#### GET /news/hot
```json
// Auth: JWT required
// Query: ?category=all|market|crypto|idx|global|macro&page=1&per_page=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "source": "Kontan",
        "url": "string",
        "ai_summary": "string",
        "hot_score": "8.5",
        "impact_score": "7.2",
        "published_at": "datetime",
        "related_assets": [
          { "symbol": "BBCA", "exchange": "IDX", "relevance": "0.95" }
        ]
      }
    ],
    "total": 150,
    "page": 1,
    "per_page": 20
  }
}
```

#### GET /news/asset/{symbol}
```json
// Auth: JWT required
// Query: ?exchange=IDX&page=1&per_page=10

// Response 200
{
  "success": true,
  "data": {
    "items": [ /* sama dengan /news/hot items */ ]
  }
}
```

#### GET /news/morning-brief
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "date": "2026-03-07",
    "generated_at": "datetime",
    "sections": [
      {
        "title": "Market Outlook Hari Ini",
        "content": "string"
      },
      {
        "title": "Berita Utama",
        "items": [ /* news items */ ]
      },
      {
        "title": "Aset yang Perlu Diperhatikan",
        "items": [ /* asset brief */ ]
      },
      {
        "title": "Jadwal Penting",
        "items": [ /* economic events */ ]
      }
    ]
  }
}
```

---

### SENTIMENT (Growth+)

#### GET /sentiment/{symbol}
```json
// Auth: JWT required, Tier: growth+
// Query: ?exchange=IDX&period=1D|7D|30D

// Response 200
{
  "success": true,
  "data": {
    "symbol": "BBCA",
    "exchange": "IDX",
    "current": {
      "composite_score": "0.65",
      "label": "bullish",
      "finbert_score": "0.70",
      "indobert_score": "0.60",
      "google_trends_score": "0.55",
      "gdelt_score": "0.72",
      "social_score": null,
      "volume_anomaly_score": "0.80",
      "sample_size": 245,
      "generated_at": "datetime"
    },
    "history": [
      {
        "time": "datetime",
        "composite_score": "0.60",
        "label": "bullish"
      }
    ],
    "vs_price": [
      {
        "time": "datetime",
        "sentiment": "0.60",
        "price": "9300.00000000"
      }
    ]
  }
}
```

#### GET /sentiment/heatmap
```json
// Auth: JWT required, Tier: growth+
// Query: ?sector=Finance|Technology|all

// Response 200
{
  "success": true,
  "data": {
    "sectors": [
      {
        "sector": "Finance",
        "sentiment_score": "0.65",
        "label": "bullish",
        "top_assets": [
          { "symbol": "BBCA", "score": "0.80" }
        ]
      }
    ]
  }
}
```

#### GET /sentiment/ranking
```json
// Auth: JWT required, Tier: growth+
// Query: ?exchange=IDX&limit=20&order=desc

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "rank": 1,
        "symbol": "BBCA",
        "exchange": "IDX",
        "sentiment_score": "0.85",
        "label": "very_bullish",
        "change_7d": "0.15"
      }
    ]
  }
}
```

---

## SIKLUS 3 — Core User Features (MVP Beta)

### WATCHLIST

#### GET /watchlists
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "My Watchlist",
        "is_default": true,
        "item_count": 8,
        "items": [
          {
            "symbol": "BBCA",
            "exchange": "IDX",
            "name": "Bank Central Asia",
            "price": "9500.00000000",
            "change_pct": "1.06",
            "ai_score": 82,            // null untuk Lite
            "ai_label": "buy",         // null untuk Lite
            "sentiment_label": "bullish" // null untuk Lite
          }
        ]
      }
    ]
  }
}
```

#### POST /watchlists
```json
// Auth: JWT required
// Request
{ "name": "string" }

// Response 201
{ "success": true, "data": { "id": "uuid", "name": "string" } }

// Errors
// 403 TIER_REQUIRED — Lite max 1 watchlist default
```

#### POST /watchlists/{watchlist_id}/items
```json
// Auth: JWT required
// Request
{
  "symbol": "string",
  "exchange": "string"
}

// Response 201
{ "success": true, "data": { "id": "uuid", "symbol": "BBCA", "exchange": "IDX" } }

// Errors
// 409 — aset sudah ada di watchlist
// 403 — limit watchlist tercapai (10 untuk Lite, 30 untuk Growth, unlimited Apex)
```

#### DELETE /watchlists/{watchlist_id}/items/{symbol}
```json
// Auth: JWT required
// Query: ?exchange=IDX

// Response 200
{ "success": true, "data": null }
```

---

### PORTFOLIO

#### GET /portfolios
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Main Portfolio",
        "is_paper": false,
        "currency": "IDR",
        "summary": {
          "total_value": "125000000.00",
          "total_invested": "110000000.00",
          "pnl_unrealized": "15000000.00",
          "pnl_pct": "13.64",
          "pnl_today": "1250000.00",
          "pnl_today_pct": "1.01",
          "asset_count": 5
        }
      }
    ]
  }
}
```

#### GET /portfolios/{portfolio_id}
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Main Portfolio",
    "currency": "IDR",
    "summary": { /* sama dengan list */ },
    "benchmark": {
      "symbol": "IHSG",
      "return_pct": "8.5",
      "vs_portfolio": "+5.14"
    },
    "allocation": [
      {
        "symbol": "BBCA",
        "exchange": "IDX",
        "name": "Bank Central Asia",
        "quantity": "1000.00000000",
        "avg_buy_price": "8500.00000000",
        "current_price": "9500.00000000",
        "current_value": "9500000.00",
        "pnl": "1000000.00",
        "pnl_pct": "11.76",
        "weight_pct": "7.60"
      }
    ],
    "performance": [
      { "date": "2026-01-01", "value": "110000000.00", "return_pct": "0.00" }
    ],
    "risk_metrics": {        // null untuk Lite
      "sharpe_ratio": "1.45",
      "volatility_annual": "18.5",
      "max_drawdown": "-12.3",
      "var_95": "-3250000.00"
    }
  }
}
```

#### POST /portfolios
```json
// Auth: JWT required
// Request
{
  "name": "string",
  "currency": "IDR",
  "description": "string"   // optional
}

// Response 201
{ "success": true, "data": { "id": "uuid", "name": "string" } }

// Errors
// 403 — limit portfolio (1 Lite, 3 Growth, unlimited Apex)
```

#### POST /portfolios/{portfolio_id}/transactions
```json
// Auth: JWT required
// Request
{
  "symbol": "string",
  "exchange": "string",
  "type": "buy" | "sell" | "dividend",
  "quantity": "1000",
  "price": "8500",
  "fee": "25000",           // optional, default 0
  "transacted_at": "datetime",
  "notes": "string"         // optional
}

// Response 201
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "portfolio_summary": { /* updated summary */ }
  }
}
```

#### GET /portfolios/{portfolio_id}/transactions
```json
// Auth: JWT required
// Query: ?symbol=BBCA&type=buy|sell&page=1&per_page=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "symbol": "BBCA",
        "exchange": "IDX",
        "type": "buy",
        "quantity": "1000.00000000",
        "price": "8500.00000000",
        "total_amount": "8500000.00",
        "fee": "25000.00",
        "notes": "string",
        "transacted_at": "datetime"
      }
    ],
    "total": 25,
    "page": 1,
    "per_page": 20
  }
}
```

---

### SCREENER

#### GET /screener/presets
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "presets": [
      {
        "id": "undervalued_idx",
        "name": "Saham IDX Undervalued",
        "description": "PE rendah, fundamental kuat",
        "filter_count": 4
      }
    ]
  }
}
```

#### POST /screener/run
```json
// Auth: JWT required
// Request
{
  "preset_id": "undervalued_idx",  // atau null kalau custom filter
  "filters": [                      // custom filters (Growth+)
    {
      "field": "pe_ratio",
      "operator": "lt",
      "value": 15
    },
    {
      "field": "change_pct_1d",
      "operator": "gt",
      "value": 0
    },
    {
      "field": "ai_score",           // Growth+ only
      "operator": "gte",
      "value": 70
    }
  ],
  "sort_by": "change_pct",
  "sort_order": "desc",
  "exchange": "IDX",
  "page": 1,
  "per_page": 20
}

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "symbol": "BBCA",
        "exchange": "IDX",
        "name": "Bank Central Asia",
        "price": "9500.00",
        "change_pct": "1.06",
        "pe_ratio": "12.5",
        "pb_ratio": "2.8",
        "market_cap": 1230000000000,
        "ai_score": 82,             // null untuk Lite
        "ai_label": "buy",          // null untuk Lite
        "ml_signal": "bullish"      // null untuk Lite
      }
    ],
    "total": 42,
    "page": 1,
    "per_page": 20
  }
}

// Errors
// 403 TIER_REQUIRED — custom filters butuh Growth+
```

#### POST /screener/presets/save
```json
// Auth: JWT required, Tier: growth+
// Request
{
  "name": "My Custom Screener",
  "filters": [ /* array filter */ ]
}

// Response 201
{ "success": true, "data": { "id": "uuid", "name": "string" } }
```

---

### ALERTS

#### GET /alerts
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "symbol": "BBCA",
        "exchange": "IDX",
        "type": "price_above",
        "condition_value": "10000.00",
        "is_active": true,
        "triggered_count": 2,
        "last_triggered": "datetime | null",
        "notification_channels": ["push", "email"],
        "created_at": "datetime"
      }
    ]
  }
}
```

#### POST /alerts
```json
// Auth: JWT required
// Request
{
  "symbol": "string",
  "exchange": "string",
  "type": "price_above" | "price_below" | "change_pct" | "volume_spike"
        | "ai_score_above" | "sentiment_change" | "hot_news"
        | "earnings" | "portfolio_pl" | "ml_signal",
  "condition_value": "10000",
  "notification_channels": ["push", "email", "wa"]   // wa hanya Apex
}

// Response 201
{ "success": true, "data": { "id": "uuid" } }

// Errors
// 403 — limit alert tercapai (10 Lite, 30 Growth, unlimited Apex)
// 403 TIER_REQUIRED — type tertentu butuh Growth+
```

#### PATCH /alerts/{alert_id}
```json
// Auth: JWT required
// Request (semua optional)
{
  "is_active": false,
  "condition_value": "11000",
  "notification_channels": ["push"]
}

// Response 200
{ "success": true, "data": { /* updated alert */ } }
```

#### DELETE /alerts/{alert_id}
```json
// Auth: JWT required
// Response 200
{ "success": true, "data": null }
```

---

### PAPER TRADING (Growth+)

#### GET /paper-trading
```json
// Auth: JWT required, Tier: growth+

// Response 200 — sama dengan GET /portfolios tapi is_paper: true
```

#### POST /paper-trading
```json
// Auth: JWT required, Tier: growth+
// Request
{
  "name": "string",
  "initial_capital": "100000000"
}

// Response 201
{ "success": true, "data": { "id": "uuid", "name": "string", "balance": "100000000.00" } }

// Errors
// 403 — limit paper trading (3 Growth, unlimited Apex)
```

#### POST /paper-trading/{portfolio_id}/order
```json
// Auth: JWT required, Tier: growth+
// Request (sama dengan transaksi portfolio biasa)
// Note: harga diambil dari harga real market saat itu

// Response 201
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "executed_price": "9500.00",
    "remaining_balance": "90500000.00"
  }
}
```

---

## SIKLUS 4 — ML Service

### AI SCORE

#### GET /ai-score/{symbol}
```json
// Auth: JWT required, Tier: growth+
// Query: ?exchange=IDX

// Response 200
{
  "success": true,
  "data": {
    "symbol": "BBCA",
    "exchange": "IDX",
    "score": 82,
    "label": "buy",
    "is_gold_badge": false,
    "breakdown": {
      "technical": 85,
      "fundamental": 78,
      "sentiment": 80,
      "ml": 83,
      "momentum": 84
    },
    "key_catalysts": ["string"],
    "generated_at": "datetime",
    "next_update": "datetime"
  }
}
```

#### GET /ai-score/top
```json
// Auth: JWT required, Tier: growth+
// Query: ?exchange=IDX&label=strong_buy|buy&limit=10

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "symbol": "BBCA",
        "exchange": "IDX",
        "score": 92,
        "label": "strong_buy",
        "is_gold_badge": true,
        "change_1h": "+2"
      }
    ]
  }
}
```

---

### ML PREDICTIONS

#### GET /ml/predictions/{symbol}
```json
// Auth: JWT required, Tier: growth+
// Query: ?exchange=IDX

// Response 200
{
  "success": true,
  "data": {
    "symbol": "BBCA",
    "exchange": "IDX",
    "predictions": {
      "lstm": {
        "price_1d": "9620.00",
        "price_7d": "9850.00",
        "confidence": "0.78",
        "upper_1d": "9750.00",
        "lower_1d": "9490.00"
      },
      "prophet": {
        "trend": "upward",
        "price_30d": "10200.00",
        "confidence": "0.65"
      },
      "xgboost": {
        "signal": "buy",
        "confidence": "0.82",
        "valid_hours": 24
      }
    },
    "patterns": [
      {
        "pattern": "bull_flag",
        "direction": "bullish",
        "confidence": "0.75",
        "detected_at": "datetime",
        "timeframe": "1D"
      }
    ],
    "anomalies": [
      {
        "type": "volume_spike",
        "severity": "medium",
        "description": "Volume 3.5x rata-rata 20 hari",
        "detected_at": "datetime"
      }
    ],
    "generated_at": "datetime"
  }
}
```

---

## SIKLUS 5 — Intraday Suite + Recommendations (Apex)

### RECOMMENDATIONS

#### GET /recommendations/daily-pick
```json
// Auth: JWT required, Tier: apex

// Response 200
{
  "success": true,
  "data": {
    "date": "2026-03-07",
    "pick": {
      "id": "uuid",
      "symbol": "BBCA",
      "exchange": "IDX",
      "title": "BBCA: Momentum Breakout Terkonfirmasi",
      "rationale": "string",
      "entry_price": "9480.00",
      "target_price": "9800.00",
      "stop_loss": "9350.00",
      "risk_reward": "2.46",
      "confidence": "0.85",
      "signal": "buy",
      "valid_until": "datetime"
    }
  }
}
```

#### GET /recommendations/personalized
```json
// Auth: JWT required, Tier: apex

// Response 200
{
  "success": true,
  "data": {
    "items": [ /* array recommendation objects */ ],
    "based_on": "Portfolio dan watchlist kamu"
  }
}
```

#### GET /recommendations/opportunity-scanner
```json
// Auth: JWT required, Tier: apex
// Query: ?type=breakout|oversold_bounce|momentum_shift|volume_surge|sector_rotation|risk_reward

// Response 200
{
  "success": true,
  "data": {
    "type": "breakout",
    "items": [ /* array recommendation objects */ ],
    "generated_at": "datetime"
  }
}
```

#### GET /recommendations/{recommendation_id}/analysis
```json
// Auth: JWT required, Tier: apex

// Response 200
{
  "success": true,
  "data": {
    "recommendation": { /* full rec object */ },
    "technical_analysis": "string",
    "fundamental_analysis": "string",
    "sentiment_analysis": "string",
    "risk_assessment": "string",
    "historical_accuracy": {
      "total": 150,
      "hit_target": 112,
      "accuracy_pct": "74.67"
    }
  }
}
```

---

### INTRADAY INTELLIGENCE

#### GET /intraday/pre-market-brief
```json
// Auth: JWT required, Tier: apex

// Response 200
{
  "success": true,
  "data": {
    "date": "2026-03-07",
    "generated_at": "08:00:00",
    "market_outlook": {
      "summary": "string",
      "risk_level": "low" | "medium" | "high",
      "bias": "bullish" | "neutral" | "bearish"
    },
    "key_events": [
      {
        "time": "10:00",
        "event": "Rapat FOMC",
        "impact": "high",
        "affected_assets": ["DXY", "GOLD"]
      }
    ],
    "watchlist_preview": [
      {
        "symbol": "BBCA",
        "overnight_change": "+0.5%",
        "key_level": "9500",
        "note": "string"
      }
    ],
    "strategy_suggestion": "string"
  }
}
```

#### GET /intraday/signals
```json
// Auth: JWT required, Tier: apex
// Query: ?exchange=IDX&limit=10

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "symbol": "BBCA",
        "exchange": "IDX",
        "direction": "long" | "short",
        "entry_price": "9480.00",
        "target_price": "9650.00",
        "stop_loss": "9400.00",
        "risk_reward": "2.13",
        "rationale": "string",
        "valid_until": "datetime",
        "confidence": "0.78",
        "generated_at": "datetime"
      }
    ]
  }
}
```

#### POST /intraday/trade-planner
```json
// Auth: JWT required, Tier: apex
// Request
{
  "symbol": "string",
  "exchange": "string",
  "direction": "long" | "short",
  "entry_price": "9480",
  "target_price": "9650",
  "stop_loss": "9400",
  "capital": "10000000",
  "risk_per_trade_pct": "2"    // max loss per trade dalam %
}

// Response 200
{
  "success": true,
  "data": {
    "recommended_lots": 10,
    "max_lots": 12,
    "position_size": "9480000.00",
    "max_loss": "200000.00",
    "potential_profit": "1700000.00",
    "risk_reward": "2.13",
    "fee_estimate": "47400.00",
    "net_profit_after_fee": "1652600.00",
    "capital_used_pct": "94.8"
  }
}
```

---

### TRADING JOURNAL (Apex)

#### GET /journal
```json
// Auth: JWT required, Tier: apex
// Query: ?month=2026-03&symbol=BBCA&page=1&per_page=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "symbol": "BBCA",
        "direction": "long",
        "entry_price": "9480.00",
        "exit_price": "9650.00",
        "quantity": "1000.00",
        "pnl": "170000.00",
        "pnl_pct": "1.79",
        "emotion": "confident",
        "strategy_used": "string",
        "notes": "string",
        "ai_insight": "string",
        "entered_at": "datetime",
        "exited_at": "datetime"
      }
    ],
    "monthly_summary": {
      "total_trades": 15,
      "win_rate": "66.67",
      "total_pnl": "3250000.00",
      "avg_rr": "1.85"
    }
  }
}
```

#### POST /journal
```json
// Auth: JWT required, Tier: apex
// Request
{
  "symbol": "string",
  "exchange": "string",
  "direction": "long" | "short",
  "entry_price": "9480",
  "exit_price": "9650",          // optional (bisa diisi nanti)
  "quantity": "1000",
  "emotion": "confident",
  "strategy_used": "string",
  "notes": "string",
  "entered_at": "datetime",
  "exited_at": "datetime"        // optional
}

// Response 201
{ "success": true, "data": { "id": "uuid", "ai_insight": "string" } }
```

#### GET /journal/monthly-insight
```json
// Auth: JWT required, Tier: apex
// Query: ?month=2026-03

// Response 200
{
  "success": true,
  "data": {
    "month": "2026-03",
    "ai_insight": "string",   // analisis AI dari semua entry bulan ini
    "patterns_found": ["string"],
    "improvement_suggestions": ["string"],
    "stats": { /* monthly_summary */ }
  }
}
```

---

## SIKLUS 6 — Chat + Community + Notification

### CHAT (WebSocket)

#### WS /ws/chat
```
// Connect: ws://api.stoxify.id/ws/chat
// Auth: ?token={access_token} di query string

// Client → Server
{
  "type": "message",
  "content": "string",
  "session_id": "uuid | null"   // null untuk session baru
}

// Server → Client (streaming)
{
  "type": "chunk",
  "content": "string",          // streaming token demi token
  "session_id": "uuid"
}

// Server → Client (done)
{
  "type": "done",
  "session_id": "uuid",
  "tokens_used": 150,
  "tokens_remaining": 350,      // null untuk Apex unlimited
  "agent_type": "ai"
}

// Server → Client (escalated)
{
  "type": "escalated",
  "message": "Menghubungkan ke CS...",
  "estimated_wait": "5 menit"
}

// Server → Client (error)
{
  "type": "error",
  "code": "TOKEN_LIMIT_REACHED",
  "message": "Limit token harian tercapai"
}
```

#### GET /chat/sessions
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "agent_type": "ai" | "human",
        "status": "open" | "closed",
        "last_message": "string",
        "created_at": "datetime"
      }
    ]
  }
}
```

#### GET /chat/sessions/{session_id}/messages
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "messages": [
      {
        "id": "uuid",
        "role": "user" | "assistant",
        "content": "string",
        "created_at": "datetime"
      }
    ],
    "tokens_used_today": 350,
    "tokens_limit": 500          // null untuk Apex
  }
}
```

---

### COMMUNITY

#### GET /community/feed
```json
// Auth: JWT required
// Query: ?symbol=BBCA&exchange=IDX&page=1&per_page=20
// Note: symbol null = global feed

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "string",
          "avatar_url": "string",
          "tier": "apex",
          "is_apex": true
        },
        "symbol": "BBCA | null",
        "exchange": "IDX | null",
        "content": "string",
        "media_urls": [],
        "like_count": 15,
        "reply_count": 3,
        "is_liked": false,
        "is_pinned": false,
        "created_at": "datetime"
      }
    ],
    "total": 200,
    "page": 1,
    "per_page": 20
  }
}
```

#### POST /community/posts
```json
// Auth: JWT required
// Request
{
  "content": "string",
  "symbol": "string | null",
  "exchange": "string | null",
  "media_urls": []
}

// Response 201
{ "success": true, "data": { "id": "uuid" } }

// Errors
// 429 — daily post limit (5 Lite, 20 Growth, unlimited Apex)
```

#### POST /community/posts/{post_id}/like
```json
// Auth: JWT required
// Response 200
{ "success": true, "data": { "like_count": 16, "is_liked": true } }
```

#### POST /community/posts/{post_id}/comments
```json
// Auth: JWT required
// Request
{ "content": "string" }

// Response 201
{ "success": true, "data": { "id": "uuid" } }
```

---

### NOTIFICATION PREFERENCES

#### GET /notifications/preferences
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "channels": {
      "email": true,
      "push": true,         // false untuk Lite
      "wa": false           // true hanya Apex
    },
    "types": {
      "price_alert": true,
      "hot_news": true,
      "morning_brief": true,
      "ai_score_change": true,
      "sentiment_change": true,
      "ml_signal": true,
      "portfolio_pnl": true,
      "system": true
    }
  }
}
```

#### PATCH /notifications/preferences
```json
// Auth: JWT required
// Request — semua optional
{
  "channels": { "push": false },
  "types": { "morning_brief": false }
}

// Response 200
{ "success": true, "data": { /* updated preferences */ } }
```

---

## SIKLUS 7 — Admin Dashboard

### ADMIN (semua endpoint prefix /admin — role check WAJIB)

#### GET /admin/users
```json
// Auth: JWT required, Role: admin+

// Query: ?tier=growth&status=active&search=fahmi&page=1&per_page=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "tier": "growth",
        "status": "active",
        "subscription_ends": "datetime",
        "created_at": "datetime",
        "last_active": "datetime"
      }
    ],
    "total": 1250,
    "stats": {
      "total_users": 1250,
      "active_subscriptions": 380,
      "trial_users": 45,
      "revenue_monthly": 209000000
    }
  }
}
```

#### PATCH /admin/users/{user_id}/tier
```json
// Auth: JWT required, Role: super_admin | admin

// Request
{
  "tier": "growth",
  "reason": "Manual upgrade - customer request"
}

// Response 200
{ "success": true, "data": { /* updated user */ } }
```

#### GET /admin/consents
```json
// Auth: JWT required, Role: admin+
// Query: ?type=intraday_trading&user_id=uuid&page=1

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "user_email": "string",
        "type": "intraday_trading",
        "version": "1.0",
        "ip_address": "string",
        "sha256_hash": "string",
        "consented_at": "datetime",
        "expires_at": "datetime"
      }
    ]
  }
}
```

#### GET /admin/consents/export
```json
// Auth: JWT required, Role: admin+
// Query: ?format=csv|pdf&type=all|intraday_trading&date_from=2026-01-01

// Response: file download (CSV atau PDF)
```

#### GET /admin/dashboard/stats
```json
// Auth: JWT required, Role: admin+

// Response 200
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "new_today": 12,
      "new_this_month": 185,
      "by_tier": { "lite": 870, "growth": 280, "apex": 100 }
    },
    "revenue": {
      "today": 4425000,
      "this_month": 209000000,
      "mrr": 209000000,
      "arr": 2508000000
    },
    "engagement": {
      "dau": 450,
      "mau": 980,
      "avg_session_minutes": 8.5
    }
  }
}
```

---

## SIKLUS 8 — Polish + Launch

> Tidak ada endpoint baru. Focus: security audit, performance, rate limit tuning, monitoring.

---

## MISC ENDPOINTS

### IPO TRACKER

#### GET /market/ipo
```json
// Auth: JWT required
// Query: ?status=upcoming|ongoing|completed&page=1

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "symbol": "NEWCO",
        "name": "PT New Company Tbk",
        "sector": "Technology",
        "offering_price": "500.00",
        "offering_shares": 500000000,
        "total_proceeds": "250000000000",
        "book_building_start": "datetime",
        "book_building_end": "datetime",
        "listing_date": "datetime",
        "status": "upcoming"
      }
    ]
  }
}
```

### EDUCATION

#### GET /education/contents
```json
// Auth: JWT required
// Query: ?category=basic|technical|fundamental|crypto&level=beginner|intermediate|advanced&page=1

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "category": "technical",
        "level": "beginner",
        "estimated_minutes": 10,
        "thumbnail_url": "string",
        "is_completed": false
      }
    ]
  }
}
```

#### GET /education/contents/{content_id}
```json
// Auth: JWT required

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "content": "string",   // markdown
    "category": "string",
    "level": "string",
    "estimated_minutes": 10
  }
}
```

### INSTITUTIONAL DATA (Apex)

#### GET /institutional/whale-tracker
```json
// Auth: JWT required, Tier: apex
// Query: ?symbol=BTCUSDT&limit=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "tx_hash": "string",
        "from_address": "string",
        "to_address": "string",
        "amount": "1500.00000000",
        "usd_value": "97500000.00",
        "type": "transfer" | "exchange_inflow" | "exchange_outflow",
        "timestamp": "datetime"
      }
    ]
  }
}
```

#### GET /institutional/smart-money
```json
// Auth: JWT required, Tier: apex
// Query: ?symbol=BBCA&exchange=IDX

// Response 200
{
  "success": true,
  "data": {
    "symbol": "BBCA",
    "net_flow_today": "15000000000.00",
    "flow_label": "accumulation" | "distribution" | "neutral",
    "broker_flows": [
      {
        "broker": "Mandiri Sekuritas",
        "net_buy": "8500000000.00",
        "label": "accumulation"
      }
    ],
    "insider_transactions": [
      {
        "date": "2026-03-01",
        "type": "buy",
        "shares": 500000,
        "price": "9200.00",
        "insider_role": "Direktur Utama"
      }
    ]
  }
}
```

---

## NOTES UNTUK CLAUDE CODE

1. Semua endpoint butuh JWT kecuali yang ditandai "Public"
2. Gunakan dependency `require_tier("growth")` untuk gate tier
3. Semua response WAJIB pakai format `{ success, data, message/error }`
4. Rate limit 100 req/menit per user — sudah ada di middleware global
5. Pagination selalu pakai `page` + `per_page`, response include `total`
6. Timestamp selalu ISO 8601 UTC
7. Harga selalu string DECIMAL (bukan float/number)
8. Soft delete — jangan hard delete resource user
9. WebSocket auth via query param `?token=` karena header tidak support di WS
10. Setiap perubahan schema → buat Alembic migration dulu sebelum test


---

## BACKLOG — Fitur Terencana (Belum Ada Siklus)

> Semua item di sini sudah direncanakan dan akan diimplementasi di siklus mendatang.
> Update kolom "Target Siklus" saat Pitch siklus tersebut diapprove.

### PORTFOLIO

| ID | Fitur | Deskripsi | Tier | Target Siklus |
|----|-------|-----------|------|---------------|
| B001 | Export Portfolio CSV | Download semua transaksi dan holdings sebagai file CSV | Semua | Siklus 5 |
| B002 | Export Portfolio Excel | Download dalam format .xlsx dengan formatting rapi | Growth+ | Siklus 5 |
| B003 | Import Portfolio dari CSV/Excel | Upload file CSV atau Excel dari platform lain (Stockbit, Grow, IPOT, dll) — auto-parse ke transaksi Stoxify | Semua | Siklus 5 |
| B004 | Dividend Tracker | Catat dan track dividen yang diterima, hitung dividend yield realisasi | Growth+ | Siklus 4 |
| B005 | Portfolio Sharing | Share portofolio ke publik tanpa nominal (hanya % alokasi dan return) | Growth+ | Siklus 6 |
| B006 | Multi-currency Portfolio | Support portfolio dalam USD dan SGD selain IDR | Apex | Siklus 7+ |
| B007 | Export PDF Report | Laporan portofolio lengkap dalam format PDF (per aset + summary) | Apex | Siklus 7 |

### CHART & DATA HISTORIS

| ID | Fitur | Deskripsi | Tier | Target Siklus |
|----|-------|-----------|------|---------------|
| B008 | Chart Historis Panjang (10+ tahun) | Data harga saham hingga 15 tahun ke belakang — contoh: BBCA 2010–2025. Sumber: yfinance IDX, Polygon.io global | Semua | Siklus 2 |
| B009 | Analisis Trend Historis | Trendline otomatis, MA jangka panjang (MA50/MA200), support-resistance dari data historis | Growth+ | Siklus 4 |
| B010 | Perbandingan Periode | Banding performa aset antar periode — contoh: return BBCA 2010–2015 vs 2015–2020 vs 2020–2025 | Growth+ | Siklus 4 |
| B011 | CAGR Calculator | Hitung Compound Annual Growth Rate otomatis untuk rentang tanggal yang dipilih user | Semua | Siklus 4 |
| B012 | Heatmap Return Historis | Kalender heatmap return bulanan/tahunan seperti GitHub contribution graph | Growth+ | Siklus 5 |
| B013 | Overlay Multi-Aset di Chart | Tampilkan 2–3 aset sekaligus di satu chart untuk perbandingan performa | Growth+ | Siklus 4 |

### ALERTS & NOTIFIKASI

| ID | Fitur | Deskripsi | Tier | Target Siklus |
|----|-------|-----------|------|---------------|
| B014 | Alert via Telegram | Tambah channel notifikasi Telegram selain WA dan email | Growth+ | Siklus 6 |
| B015 | Scheduled Alert | Alert dikirim di waktu tertentu — contoh: "briefing tiap pagi jam 8" | Growth+ | Siklus 6 |

### SCREENER & DISCOVERY

| ID | Fitur | Deskripsi | Tier | Target Siklus |
|----|-------|-----------|------|---------------|
| B016 | Screener Template Community | User bisa share preset screener ke komunitas | Growth+ | Siklus 6 |
| B017 | Earnings Calendar | Jadwal rilis laporan keuangan semua emiten IDX | Semua | Siklus 3 |

### KOMUNITAS

| ID | Fitur | Deskripsi | Tier | Target Siklus |
|----|-------|-----------|------|---------------|
| B018 | Portfolio Sharing ke Feed | Post snapshot portfolio (tanpa nominal) ke community feed | Growth+ | Siklus 6 |
| B019 | Follow User | Follow investor lain, lihat update portofolio publik mereka | Apex | Siklus 7+ |
