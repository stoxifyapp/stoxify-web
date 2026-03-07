# STOXIFY — MASTER CONTEXT DOCUMENT
> Dokumen ini adalah konteks lengkap untuk AI coding assistant (Claude Code / Copilot).
> Baca seluruh dokumen ini sebelum generate kode apapun untuk project Stoxify.
> Last updated: Maret 2026

---

## 1. IDENTITAS PRODUK

| Field | Value |
|-------|-------|
| Nama | **Stoxify** |
| Tagline | "The market, simplified." |
| Kategori | AI-powered Investment BI + ML Platform |
| Coverage | Saham IDX + Global + Crypto |
| Platform | Web-first (Next.js) → Mobile (Flutter, Phase 2) |
| Target User | Investor muda 25–35 tahun Indonesia |
| Bahasa | Indonesia + Inggris (multi-bahasa) |
| Team | Fahmi (Backend + ML) + Nasywa (Frontend + Mobile) |
| Metodologi | Shape Up |

---

## 2. BRAND IDENTITY — FINAL LOCKED ⚠️

> **JANGAN UBAH** tanpa keputusan kedua co-founder.

### Dark Mode (Primary)
| Token | Hex | Kegunaan |
|-------|-----|----------|
| `bg` | `#010206` | Background utama |
| `surface` | `#03060F` | Card, panel |
| `surface2` | `#05091A` | Nested surface |
| `primary` | `#162444` | Button, CTA, primary element |
| `accent-gold` | `#F0B429` | ⭐ Accent ONLY — logo, badge, highlight |
| `text` | `#FFFEF8` | Teks utama |
| `text-muted` | `rgba(255,254,248,0.5)` | Teks sekunder |
| `success` | `#4ADE80` | Nilai naik, konfirmasi |
| `danger` | `#F87171` | Nilai turun, error |
| `warning` | `#FB923C` | Peringatan |
| `ai` | `#67E8F9` | Label/badge AI |
| `ml` | `#C4B5FD` | Label/badge ML |

### Light Mode
| Token | Hex |
|-------|-----|
| `bg` | `#FAFBFF` |
| `surface` | `#FFFFFF` |
| `surface2` | `#F0F4FF` |
| `primary` | `#0A1528` |
| `accent-gold` | `#B8860B` |
| `text` | `#080A14` |

### Typography
- **Heading**: Syne (400–800)
- **Data / Numbers**: DM Mono (300–500)
- **Button radius**: 8px
- **Feel**: Bloomberg × Robinhood × Linear
- **Gold**: ACCENT ONLY — bukan warna dominan

---

## 3. TECH STACK — FINAL LOCKED ⚠️

### Frontend
```
Web:      Next.js + Tailwind CSS  →  Vercel
Mobile:   Flutter (Phase 2)
Charts:   TradingView Lightweight Charts
```

### Backend
```
API:       FastAPI (Modular Monolith)  →  Railway
ML:        FastAPI terpisah            →  Railway
Migration: Alembic WAJIB (tidak boleh manual SQL di production)
```

### Database & Cache
```
Primary DB:  PostgreSQL + TimescaleDB  →  Supabase
Cache:       Redis                     →  Redis Cloud
```

### AI & External Services
```
Chat/Teks:   Groq (llama/mixtral)    — cepat, murah
Riset:       Gemini Flash            — konten panjang
Visual:      Imagen 3 ($0.03/gambar) — marketing
OAuth:       Google OAuth 2.0
Payment:     Midtrans
Email:       Resend (3.000/bln gratis)
OTP/WA:      Fonnte (fallback email)
Push:        Firebase FCM (gratis)
Monitoring:  Sentry
```

### Folder Structure — Backend
```
stoxify-backend/
├── app/
│   ├── modules/
│   │   ├── auth/           # register, login, JWT, OAuth
│   │   ├── portfolio/      # CRUD portfolio, holdings, P&L
│   │   ├── market/         # market data, price fetch, cache
│   │   ├── ml/             # ML predictions endpoint
│   │   ├── alerts/         # alert CRUD, checker background job
│   │   ├── news/           # scraper, sentiment pipeline
│   │   ├── screener/       # filter logic, screener engine
│   │   ├── chat/           # WebSocket, AI chatbot, CS routing
│   │   ├── consent/        # consent record, hash, admin
│   │   ├── community/      # feed, post, moderasi
│   │   ├── subscription/   # tier management, billing webhook
│   │   ├── admin/          # RBAC, admin endpoints
│   │   └── reports/        # PDF generator, scheduled reports
│   ├── core/
│   │   ├── config.py       # env vars, settings
│   │   ├── database.py     # DB session, engine
│   │   ├── security.py     # JWT, bcrypt, rate limit
│   │   └── dependencies.py # FastAPI dependencies
│   └── main.py
├── alembic/                # migrations WAJIB
├── tests/                  # min 70% coverage
└── requirements.txt

stoxify-ml/
├── app/
│   ├── models/             # LSTM, Prophet, XGBoost, Pattern
│   ├── pipelines/          # training, inference pipeline
│   ├── features/           # feature engineering
│   └── main.py
└── requirements.txt

stoxify-web/  (Next.js)
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/
│   │   ├── ui/             # design system components
│   │   ├── charts/         # TradingView wrappers
│   │   ├── dashboard/      # dashboard widgets
│   │   ├── portfolio/      # portfolio components
│   │   └── ...
│   ├── lib/                # utils, hooks, api client
│   └── styles/             # globals + theme tokens
└── package.json
```

---

## 4. DATABASE SCHEMA — LENGKAP

### Konvensi WAJIB
- Primary Key: **UUID** (bukan integer/serial)
- Naming: **snake_case**
- Tabel: **plural** (users, not user)
- Harga/nilai finansial: **DECIMAL(20,8)** — **JANGAN FLOAT**
- Soft delete: **deleted_at TIMESTAMPTZ NULL** (bukan hard delete)
- Migration: **Alembic WAJIB** setiap perubahan schema

### Core Tables

```sql
-- =============================================
-- USERS & AUTH
-- =============================================

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE,
    phone_wa            VARCHAR(20),
    name                VARCHAR(255) NOT NULL,
    hashed_password     VARCHAR(255),
    google_id           VARCHAR(255) UNIQUE,
    avatar_url          TEXT,
    preferred_language  VARCHAR(10) DEFAULT 'id',
    theme               VARCHAR(10) DEFAULT 'dark',
    is_active           BOOLEAN DEFAULT TRUE,
    is_verified         BOOLEAN DEFAULT FALSE,
    profile_completed   BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ NULL
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    is_revoked  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE otp_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    code        VARCHAR(6) NOT NULL,
    channel     VARCHAR(10) NOT NULL,  -- 'wa' | 'email'
    purpose     VARCHAR(30) NOT NULL,  -- 'register' | 'login' | 'reset_password'
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTIONS & BILLING
-- =============================================

CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    tier            VARCHAR(20) NOT NULL,       -- 'lite' | 'growth' | 'apex'
    billing_cycle   VARCHAR(10) NOT NULL,       -- 'monthly' | 'annual'
    status          VARCHAR(20) DEFAULT 'active', -- 'active' | 'expired' | 'trial' | 'cancelled'
    is_trial        BOOLEAN DEFAULT FALSE,
    trial_ends_at   TIMESTAMPTZ NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancelled_at    TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    subscription_id     UUID REFERENCES subscriptions(id),
    midtrans_order_id   VARCHAR(255) UNIQUE,
    midtrans_txn_id     VARCHAR(255),
    amount              DECIMAL(20,2) NOT NULL,
    currency            VARCHAR(5) DEFAULT 'IDR',
    status              VARCHAR(20) NOT NULL,   -- 'pending' | 'success' | 'failed' | 'expired'
    payment_method      VARCHAR(50),            -- 'qris' | 'gopay' | 'ovo' | 'bank_transfer' | 'credit_card'
    paid_at             TIMESTAMPTZ NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONSENT SYSTEM
-- =============================================

CREATE TABLE consent_versions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        VARCHAR(30) NOT NULL,   -- 'tos' | 'ai_features' | 'recommendation' | 'intraday_trading'
    version     VARCHAR(20) NOT NULL,   -- e.g. '1.0', '1.1'
    content     TEXT NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_consents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    consent_version_id  UUID REFERENCES consent_versions(id),
    type                VARCHAR(30) NOT NULL,
    ip_address          VARCHAR(45) NOT NULL,
    user_agent          TEXT,
    sha256_hash         VARCHAR(64) NOT NULL,  -- integrity proof untuk OJK
    consented_at        TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NULL       -- untuk tipe renewal 30 hari (intraday)
);

-- =============================================
-- ASSETS & MARKET DATA
-- =============================================

CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,   -- 'IDX' | 'NYSE' | 'NASDAQ' | 'BINANCE'
    asset_type      VARCHAR(15) NOT NULL,   -- 'stock' | 'crypto' | 'etf'
    name            VARCHAR(255) NOT NULL,
    name_id         VARCHAR(255),           -- nama dalam Bahasa Indonesia
    sector          VARCHAR(100),
    industry        VARCHAR(100),
    market_cap      DECIMAL(20,2),
    currency        VARCHAR(5) DEFAULT 'IDR',
    logo_url        TEXT,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, exchange)
);

-- TimescaleDB hypertable — partitioned by time
CREATE TABLE price_history (
    time            TIMESTAMPTZ NOT NULL,
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    open            DECIMAL(20,8) NOT NULL,
    high            DECIMAL(20,8) NOT NULL,
    low             DECIMAL(20,8) NOT NULL,
    close           DECIMAL(20,8) NOT NULL,
    volume          BIGINT NOT NULL,
    vwap            DECIMAL(20,8),
    num_trades      INTEGER,
    source          VARCHAR(20),   -- 'yfinance' | 'binance' | 'goapi' | 'twelvedata'
    PRIMARY KEY (time, symbol, exchange)
);
-- SELECT create_hypertable('price_history', 'time');
-- CREATE INDEX ON price_history (symbol, exchange, time DESC);

CREATE TABLE price_realtime_cache (
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    price           DECIMAL(20,8) NOT NULL,
    change_abs      DECIMAL(20,8),
    change_pct      DECIMAL(10,4),
    volume_today    BIGINT,
    high_today      DECIMAL(20,8),
    low_today       DECIMAL(20,8),
    bid             DECIMAL(20,8),
    ask             DECIMAL(20,8),
    last_updated    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (symbol, exchange)
);

-- =============================================
-- PORTFOLIO
-- =============================================

CREATE TABLE portfolios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    name            VARCHAR(255) NOT NULL,
    currency        VARCHAR(5) DEFAULT 'IDR',
    description     TEXT,
    is_default      BOOLEAN DEFAULT FALSE,
    is_paper        BOOLEAN DEFAULT FALSE,    -- paper trading
    initial_capital DECIMAL(20,8),           -- untuk paper trading
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ NULL
);

CREATE TABLE portfolio_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID REFERENCES portfolios(id),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    quantity        DECIMAL(20,8) NOT NULL,
    avg_buy_price   DECIMAL(20,8) NOT NULL,
    total_invested  DECIMAL(20,8) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, symbol, exchange)
);

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID REFERENCES portfolios(id),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    type            VARCHAR(10) NOT NULL,     -- 'buy' | 'sell' | 'dividend'
    quantity        DECIMAL(20,8) NOT NULL,
    price           DECIMAL(20,8) NOT NULL,
    total_amount    DECIMAL(20,8) NOT NULL,
    fee             DECIMAL(20,8) DEFAULT 0,
    notes           TEXT,
    transacted_at   TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WATCHLIST
-- =============================================

CREATE TABLE watchlists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    name        VARCHAR(255) NOT NULL,
    is_default  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ NULL
);

CREATE TABLE watchlist_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id    UUID REFERENCES watchlists(id),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    added_at        TIMESTAMPTZ DEFAULT NOW(),
    sort_order      INTEGER DEFAULT 0,
    UNIQUE(watchlist_id, symbol, exchange)
);

-- =============================================
-- ALERTS
-- =============================================

CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    -- 'price_above' | 'price_below' | 'change_pct' | 'volume_spike'
    -- 'ai_score_above' | 'sentiment_change' | 'hot_news' | 'earnings'
    -- 'portfolio_pl' | 'ml_signal'
    condition_value DECIMAL(20,8),
    is_active       BOOLEAN DEFAULT TRUE,
    triggered_count INTEGER DEFAULT 0,
    last_triggered  TIMESTAMPTZ NULL,
    notification_channels VARCHAR(50) DEFAULT 'push,email',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NEWS & SENTIMENT
-- =============================================

CREATE TABLE news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source          VARCHAR(100) NOT NULL,
    title           TEXT NOT NULL,
    url             TEXT UNIQUE NOT NULL,
    content         TEXT,
    ai_summary      TEXT,               -- Groq summary
    published_at    TIMESTAMPTZ NOT NULL,
    language        VARCHAR(5) DEFAULT 'id',
    hot_score       DECIMAL(10,4) DEFAULT 0,
    impact_score    DECIMAL(10,4) DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news_asset_relations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id      UUID REFERENCES news_articles(id),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    relevance_score DECIMAL(10,4),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sentiment_scores (
    time            TIMESTAMPTZ NOT NULL,
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    -- Component scores
    finbert_score       DECIMAL(10,4),   -- English news
    indobert_score      DECIMAL(10,4),   -- Indonesian news
    google_trends_score DECIMAL(10,4),
    gdelt_score         DECIMAL(10,4),
    social_score        DECIMAL(10,4),   -- CoinGecko social (crypto)
    volume_anomaly_score DECIMAL(10,4),
    internal_score      DECIMAL(10,4),   -- platform behavior
    -- Weighted aggregate
    composite_score DECIMAL(10,4) NOT NULL,  -- -1.0 to 1.0
    label           VARCHAR(20),             -- 'very_bullish'|'bullish'|'neutral'|'bearish'|'very_bearish'
    sample_size     INTEGER,
    PRIMARY KEY (time, symbol, exchange)
);
-- SELECT create_hypertable('sentiment_scores', 'time');

-- =============================================
-- ML PREDICTIONS & AI SCORES
-- =============================================

CREATE TABLE ml_predictions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    model_type      VARCHAR(20) NOT NULL,   -- 'lstm' | 'prophet' | 'xgboost'
    prediction_type VARCHAR(30) NOT NULL,   -- 'price_1d' | 'price_7d' | 'direction' | 'pattern'
    predicted_value DECIMAL(20,8),
    confidence      DECIMAL(5,4),           -- 0.0 to 1.0
    upper_bound     DECIMAL(20,8),
    lower_bound     DECIMAL(20,8),
    signal          VARCHAR(20),            -- 'strong_buy'|'buy'|'neutral'|'sell'|'strong_sell'
    features        JSONB,                  -- input features snapshot
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    valid_until     TIMESTAMPTZ
);

CREATE TABLE ai_scores (
    time        TIMESTAMPTZ NOT NULL,
    symbol      VARCHAR(20) NOT NULL,
    exchange    VARCHAR(20) NOT NULL,
    score       SMALLINT NOT NULL,          -- 0–100
    label       VARCHAR(20) NOT NULL,       -- 'strong_buy'|'buy'|'neutral'|'sell'|'strong_sell'
    -- Component breakdown
    technical_score     SMALLINT,
    fundamental_score   SMALLINT,
    sentiment_score     SMALLINT,
    ml_score            SMALLINT,
    momentum_score      SMALLINT,
    is_gold_badge       BOOLEAN DEFAULT FALSE,   -- score >= 90
    generated_at        TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (time, symbol, exchange)
);
-- SELECT create_hypertable('ai_scores', 'time');

CREATE TABLE pattern_detections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol      VARCHAR(20) NOT NULL,
    exchange    VARCHAR(20) NOT NULL,
    pattern     VARCHAR(50) NOT NULL,
    -- 'head_shoulders' | 'double_top' | 'double_bottom' | 'triangle' | 'flag'
    direction   VARCHAR(10),   -- 'bullish' | 'bearish'
    confidence  DECIMAL(5,4),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    timeframe   VARCHAR(10)    -- '1D' | '1W' | '1H'
);

-- =============================================
-- RECOMMENDATIONS (APEX)
-- =============================================

CREATE TABLE recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(30) NOT NULL,
    -- 'ai_pick_daily' | 'personalized' | 'opportunity_scanner' | 'portfolio_optimizer'
    -- 'scenario_planner' | 'intraday_signal'
    user_id         UUID REFERENCES users(id) NULL,  -- NULL = global pick
    symbol          VARCHAR(20),
    exchange        VARCHAR(20),
    title           TEXT NOT NULL,
    rationale       TEXT NOT NULL,
    entry_price     DECIMAL(20,8),
    target_price    DECIMAL(20,8),
    stop_loss       DECIMAL(20,8),
    risk_reward     DECIMAL(10,4),
    confidence      DECIMAL(5,4),
    signal          VARCHAR(20),
    valid_until     TIMESTAMPTZ,
    actual_outcome  VARCHAR(20) NULL,    -- 'hit_target'|'hit_sl'|'expired' (untuk accuracy tracking)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRADING JOURNAL (APEX)
-- =============================================

CREATE TABLE trading_journal_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    transaction_id  UUID REFERENCES transactions(id) NULL,
    symbol          VARCHAR(20) NOT NULL,
    direction       VARCHAR(10),    -- 'long' | 'short'
    entry_price     DECIMAL(20,8),
    exit_price      DECIMAL(20,8),
    quantity        DECIMAL(20,8),
    pnl             DECIMAL(20,8),
    pnl_pct         DECIMAL(10,4),
    emotion         VARCHAR(20),    -- 'confident'|'fearful'|'greedy'|'neutral'
    strategy_used   TEXT,
    notes           TEXT,
    ai_insight      TEXT,           -- AI auto-generated insight
    entered_at      TIMESTAMPTZ,
    exited_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT SUPPORT (WEBSOCKET)
-- =============================================

CREATE TABLE chat_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    agent_type  VARCHAR(20) NOT NULL,   -- 'ai' | 'human' | 'escalated'
    status      VARCHAR(20) DEFAULT 'open',  -- 'open' | 'closed' | 'pending_human'
    tier        VARCHAR(20),
    escalated_at TIMESTAMPTZ NULL,
    closed_at   TIMESTAMPTZ NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES chat_sessions(id),
    role            VARCHAR(20) NOT NULL,   -- 'user' | 'assistant' | 'system'
    content         TEXT NOT NULL,
    token_count     INTEGER DEFAULT 0,
    is_escalation_trigger BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMUNITY
-- =============================================

CREATE TABLE community_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    symbol      VARCHAR(20) NULL,       -- NULL = global feed
    exchange    VARCHAR(20) NULL,
    content     TEXT NOT NULL,
    media_urls  JSONB DEFAULT '[]',
    like_count  INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_pinned   BOOLEAN DEFAULT FALSE,
    is_flagged  BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'approved',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ NULL
);

CREATE TABLE community_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID REFERENCES community_posts(id),
    user_id     UUID REFERENCES users(id),
    content     TEXT NOT NULL,
    like_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ NULL
);

-- =============================================
-- ADMIN & RBAC
-- =============================================

CREATE TABLE admin_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) UNIQUE,
    role        VARCHAR(30) NOT NULL,
    -- 'super_admin'|'admin'|'finance'|'cs'|'content'|'ml_engineer'|'marketing'|'moderator'
    is_active   BOOLEAN DEFAULT TRUE,
    granted_by  UUID REFERENCES admin_users(id) NULL,
    granted_at  TIMESTAMPTZ DEFAULT NOW(),
    revoked_at  TIMESTAMPTZ NULL
);

CREATE TABLE admin_audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID REFERENCES admin_users(id),
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(50),
    resource_id UUID NULL,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. DATA ARCHITECTURE (Data Warehouse / BI Layer)

### Arsitektur Data Stoxify
```
Source Systems
├── Binance WebSocket          → crypto realtime
├── yfinance (MVP)             → saham IDX + Global (delay)
├── GOAPI.io / Twelve Data     → saham production (setelah ada revenue)
├── CoinGecko API              → crypto metadata + social
├── RSS Feed                   → berita (Kontan, Bisnis.com, CNBC ID)
├── GDELT                      → global news sentiment
└── Currentsapi                → aggregated news (MVP gratis)
         ↓
Data Pipeline / ETL Layer (FastAPI + Pandas + APScheduler)
├── Extract: pull dari sources
├── Transform: clean, normalize, validate
└── Load: insert ke PostgreSQL
         ↓
Data Warehouse (PostgreSQL + TimescaleDB @ Supabase)
├── Hypertables: price_history, sentiment_scores, ai_scores
└── Regular tables: semua tabel lainnya
         ↓
Data Marts (logical grouping, bukan physical separation)
├── Price Data Mart       → price_history, price_realtime_cache
├── News & Sentiment Mart → news_articles, sentiment_scores
├── ML Predictions Mart   → ml_predictions, ai_scores, pattern_detections
├── User Data Mart        → users, subscriptions, consents
├── Portfolio Data Mart   → portfolios, transactions
└── Recommendation Mart   → recommendations, trading_journal_entries
         ↓
Redis Cache Layer
├── Realtime prices (TTL: 60s untuk Growth/Apex, 900s untuk Lite)
├── AI Scores (TTL: 15 menit)
├── Hot News (TTL: 5 menit)
├── Dashboard data (TTL: sesuai tier)
└── Session data (TTL: sesuai JWT)
         ↓
BI & Analytics Layer
├── Dashboard Stoxify (web + mobile)
├── ML Models (stoxify-ml service)
└── Report Generator (PDF)
         ↓
End Users (Web + Mobile)
```

### Data Refresh Strategy per Tier
| Data | Lite | Growth | Apex |
|------|------|--------|------|
| Saham IDX/Global | 15 menit | 1 menit | 1 menit |
| Crypto | Realtime (Binance WS) | Realtime | Realtime |
| AI Score | 15 menit | 15 menit | 15 menit |
| Sentiment | 1 jam | 15 menit | 15 menit |
| Hot News | 5 menit | 5 menit | 5 menit |

> ⚠️ "1 menit" = polling yfinance, **BUKAN WebSocket realtime**. Jangan pakai kata "realtime" untuk saham.

### Redis Cache Keys Convention
```
price:{symbol}:{exchange}          → harga terkini
aiscore:{symbol}:{exchange}        → AI score terkini
sentiment:{symbol}:{exchange}:1h   → sentiment 1 jam terakhir
hotnews:global                     → list hot news global
hotnews:asset:{symbol}             → news per aset
dashboard:user:{user_id}           → dashboard cache per user
session:{user_id}                  → session data
```

---

## 6. SUBSCRIPTION TIERS

### Harga
| Tier | Bulanan | Tahunan/bln | Total Tahunan |
|------|---------|-------------|---------------|
| **Lite** | Rp 220.000 | Rp 176.000 | Rp 2.112.000 |
| **Growth** | Rp 550.000 | Rp 440.000 | Rp 5.280.000 |
| **Apex** | Rp 885.000 | Rp 708.000 | Rp 8.496.000 |

**Free Trial**: 3 hari akses penuh Apex, tanpa kartu kredit. Setelah expired → turun ke Lite.
**Refund Policy**: **TIDAK ADA REFUND** dalam kondisi apapun. Wajib ada disclaimer di checkout + ToS.

### Fitur per Tier

#### LITE
**Platform & UX**
- Landing page responsif + SEO
- Multi-bahasa (ID + EN)
- Dark / Light mode toggle
- Multi-device sync (max 2 device)
- Broker redirect + affiliate tag

**Auth & Akun**
- Register email + WA
- OTP via Fonnte WA (fallback email)
- Google OAuth
- JWT 15 menit + refresh 24 jam
- Profile completion wizard
- Lupa password via email/WA

**Market Data**
- Saham IDX, Global, Crypto — delay 15 menit (saham), realtime (crypto via Binance WS)
- Asset detail page: chart TradingView, technical indicators, fundamental data

**Hot News Engine** (FULL di Lite)
- Semua kategori berita
- Hot Score algoritma
- AI Summary per artikel (Groq)
- Impact Tracker
- Hot News Alert

**Dashboard**
- Portfolio overview widget
- Market overview (IDX/US/Crypto)
- Watchlist widget
- Hot News feed
- Fear & Greed Index
- Top Mover daily
- Morning Brief harian

**Watchlist**
- Maks 10 aset
- Alert dari watchlist

**Portfolio**
- 1 portfolio
- P&L realtime (unrealized + realized)
- Return calculation (daily/weekly/monthly/all-time)
- Benchmark IHSG
- Asset allocation chart

**Screener**
- Filter basic preset
- IPO Tracker

**Alerts**
- Price alert + Hot News alert
- Maks 10 alert

**Chat AI**
- 500 token/hari
- Groq 24/7
- Streaming response

**Notifikasi**
- Email only (Resend)

**Community**
- Baca semua post
- Buat post: 5/hari
- Diskusi per aset

**Education**
- Semua konten education

**Consent**
- ToS saat register
- AI Features
- Audit log tersimpan

#### GROWTH (semua Lite +)
**Market Data**
- Refresh 1 menit (saham) — polling, bukan WebSocket

**Sentiment Analysis** (FULL)
- FinBERT (English news)
- IndoBERT (Indonesian news)
- Google Trends integration
- GDELT data
- Volume anomaly detection
- CoinGecko social sentiment (crypto)
- Internal platform behavior
- Weighted score aggregation
- Sentiment heatmap per sektor
- Sentiment vs price chart overlay
- Global vs local sentiment comparison
- Sentiment history chart
- Sentiment alert
- AI summary of sentiment

**AI Score**
- Skor 0–100 per aset
- Update setiap 15 menit
- Label: STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL
- Breakdown 5 komponen
- Gold badge ⭐ untuk score ≥ 90

**ML Predictions**
- LSTM — price forecasting
- Prophet — trend jangka panjang
- XGBoost — klasifikasi sinyal beli/jual
- Pattern Recognition: Head & Shoulders, Double Top/Bottom, Triangle, Flag
- Anomaly Detection

**Portfolio**
- 3 portfolio
- Risk metrics: Sharpe Ratio, VaR, Max Drawdown
- Dividend tracker

**Watchlist**
- Maks 30 aset
- Sentiment badge per aset
- AI Score di watchlist

**Screener**
- Custom filter + simpan preset
- Filter by AI Score
- Filter by ML signal
- Filter by sentiment

**Alerts**
- Semua jenis alert (AI Score, sentiment, volume, earnings, portfolio P&L)
- Maks 30 alert

**Paper Trading**
- 3 simulasi
- Portfolio simulasi
- Simulasi vs real portfolio comparison

**Chat AI**
- 2.000 token/hari

**Notifikasi**
- Email + Push FCM

**Community**
- 20 post/hari

**Consent**
- + Rekomendasi consent

#### APEX (semua Growth +)
**Smart Recommendation Engine**
- AI Pick of the Day (1 rekomendasi terbaik global/hari)
- Personalized For You (belajar dari behavior)
- Opportunity Scanner — 6 jenis:
  1. Breakout Scanner
  2. Oversold Bounce
  3. Momentum Shift
  4. Volume Surge Alert
  5. Sector Rotation Signal
  6. Risk/Reward Optimizer
- Portfolio Optimizer (rebalancing suggestion)
- Scenario Planner (simulasi "what if")
- Halaman analisis lengkap per rekomendasi
- Accuracy tracking historis

**Intraday Intelligence Suite** *(consent renewal 30 hari)*
- Pre-Market Brief 08.00 (4 komponen: market outlook, key events, watchlist preview, risk level hari ini)
- Intraday Signal realtime (entry price, target, stop loss, alasan, validitas)
- Market Radar live (momentum, volume, breakout detector)
- AI Trade Planner (kalkulasi lot, risk/reward, fee, max risk per trade)
- Trading Journal auto (auto-fill dari transaksi)
- AI Insight bulanan dari journal

**Institutional Data**
- On-chain whale tracking (crypto)
- Exchange flow data (in/out flow exchange)
- Smart money sentiment
- Smart money flow per broker (IDX)
- Insider transaction IDX
- Dark pool activity indicator

**Personalization & Tools**
- Personalized AI Model (fine-tuned behavior per user)
- Custom Automation Rules (if-this-then-that)
- Professional Report PDF per aset
- Professional Report PDF portfolio
- API Access
- Priority data feed
- Multi-device 5 (vs 2 untuk Lite/Growth)

**Watchlist / Portfolio / Paper Trading**
- Unlimited

**Alerts**
- Unlimited
- Priority delivery

**Chat AI**
- Unlimited token
- CS Manusia jam kerja (Senin–Jumat 09.00–17.00)
- Eskalasi otomatis
- Dedicated Account Manager
- Early access fitur baru

**Notifikasi**
- Email + Push + WhatsApp (Fonnte)

**Community**
- Unlimited post
- Badge ⚡ Apex di profil

**Monthly Report**
- Auto-generated PDF setiap bulan

**Consent**
- + Trading Harian (renewal 30 hari)

---

## 7. CONSENT SYSTEM

4 tipe consent, semua disimpan dengan data berikut:
- Timestamp (ISO 8601 UTC)
- IP Address
- User Agent (device info)
- Versi teks consent saat itu
- SHA-256 hash (untuk integrity proof audit OJK)

| Tipe | Trigger | Tier | Renewal |
|------|---------|------|---------|
| `tos` | Registrasi | Semua | Sekali |
| `ai_features` | Akses fitur AI pertama | Lite+ | Sekali |
| `recommendation` | Akses Smart Recommendation | Growth+ | Sekali |
| `intraday_trading` | Akses Intraday Suite | Apex | Setiap 30 hari |

---

## 8. AUTH & SECURITY

### JWT Config
```
Access Token:   15 menit
Refresh Token:  24 jam
Rotasi:         Otomatis saat refresh
Storage:        httpOnly cookie (JANGAN localStorage)
```

### Security Rules (WAJIB)
- HTTPS everywhere
- httpOnly + Secure cookie
- Rate limiting: 100 req/menit per user
- CORS: hanya origin Stoxify
- Pydantic validation semua input
- bcrypt cost factor 12 untuk password
- Token rotasi otomatis saat refresh

### Performance SLA
| Endpoint | Target |
|----------|--------|
| Dashboard load | < 500ms |
| Chart render | < 300ms |
| AI response | < 3 detik |
| ML prediction | < 5 detik |

---

## 9. API STANDARDS

### Response Format
```python
# Success
{
    "success": True,
    "data": { ... },
    "message": "OK"
}

# Error
{
    "success": False,
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Token expired or invalid"
    }
}
```

### HTTP Status Codes
| Code | Use Case |
|------|----------|
| 200 | Success GET/PUT/PATCH |
| 201 | Created (POST) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden (tier tidak cukup) |
| 404 | Not Found |
| 429 | Rate limit exceeded |
| 500 | Internal Server Error |

### Tier Check (WAJIB di setiap endpoint dengan tier gate)
```python
from app.core.dependencies import require_tier

@router.get("/ai-score/{symbol}")
async def get_ai_score(
    symbol: str,
    current_user: User = Depends(require_tier("growth"))  # minimum tier
):
    ...
```

---

## 10. CHAT SUPPORT (WebSocket)

```
Stack: FastAPI + websockets + asyncpg + groq + redis + python-jose
```

### Jalur Chat
1. **AI Chatbot (Groq)** — 24/7, otomatis, semua tier
2. **CS Manusia** — Apex only, jam kerja, eskalasi

### Eskalasi Triggers
- Kata kunci: billing, refund, bug, tidak bisa login
- AI confidence rendah
- User eksplisit minta CS manusia
- Topik di luar kapabilitas AI

### Token Limit per Tier
| Tier | Token/hari |
|------|-----------|
| Lite | 500 |
| Growth | 2.000 |
| Apex | Unlimited |

---

## 11. MARKETING AI SUITE (Admin Tool)

Stack: Groq (teks cepat) + Gemini Flash (long-form) + Imagen 3 ($0.03/gambar)

12 kategori — 42 sub-fitur:
1. **Content Generator**: IG caption, Twitter thread, LinkedIn, TikTok script, Blog SEO, YouTube desc, Press release, Infographic copy, Newsletter
2. **Content Calendar**: jadwal posting bulanan otomatis
3. **Repurpose Engine**: 1 artikel → 5 format berbeda
4. **Visual Suite**: Imagen 3 — banner, thumbnail, sosmed
5. **Email Marketing**: template + personalisasi
6. **WA/Push Copy**: notifikasi marketing
7. **Sales Copy**: landing page, pricing page
8. **Campaign Manager**: multi-channel tracking
9. **Trend Monitor**: topik investasi trending
10. **SEO Tools**: keyword research, meta tags
11. **Testimonial Manager**: collect & display
12. **Analytics**: performa konten + konversi

---

## 12. ADMIN RBAC

8 Role — diaktifkan bertahap:

| Role | Person | Akses |
|------|--------|-------|
| `super_admin` | Fahmi | Full access |
| `admin` | Nasywa | Full kecuali infra |
| `finance` | TBD | Billing, payment |
| `cs` | TBD | User, chat, tiket |
| `content` | TBD | Education, news |
| `ml_engineer` | TBD | Model monitoring |
| `marketing` | TBD | Marketing AI Suite |
| `moderator` | TBD | Community |

---

## 13. SHAPE UP ROADMAP

**Metodologi**: 4–5 minggu build (siklus) + 1–2 minggu cooldown (jeda).
**Aturan**: Tidak boleh build tanpa Pitch document yang diapprove kedua co-founder.
**Timeline estimasi**: ~38–51 hari dengan vibe coding (3–4× speedup).

| Siklus | Nama | Durasi | Output |
|--------|------|--------|--------|
| **0** | Setup & Infra | 1–2 minggu | Repo, CI/CD, Railway/Supabase/Redis, domain, SSL |
| **1** | Auth + Payment + Landing | 4–5 minggu | Auth full, Midtrans, landing page, consent ToS |
| **2** | Data Pipeline + Hot News + Sentiment | 4–5 minggu | Market data, Hot News Engine, Sentiment Analysis |
| **3** | Core User Features → MVP Beta | 4–5 minggu | Dashboard, portfolio, watchlist, screener, alerts |
| **4** | ML Service | 4–5 minggu | LSTM+Prophet+XGBoost, AI Score, Pattern Recognition |
| **5** | Intraday Suite → Early Adopter | 4–5 minggu | Smart Recommendation, Intraday Intelligence |
| **6** | Chat + Community + Notif | 4–5 minggu | WebSocket chat, community, notification full |
| **7** | Admin + Marketing AI | 4–5 minggu | Admin dashboard, Marketing AI Suite |
| **8** | Polish + Security + 🚀 Launch | 3–4 minggu | Security audit, optimization, public launch |

### Parallel Work per Siklus
**Fahmi (Backend + ML)**: DB schema, API endpoints, ML models, data pipeline
**Nasywa (Frontend)**: UI components, pages, chart integration, mobile

---

## 14. ENGINEERING STANDARDS

### Git
```
Conventional commits WAJIB:
  feat:     fitur baru
  fix:      bug fix
  chore:    maintenance, dependency
  docs:     dokumentasi
  refactor: refactor tanpa perubahan behavior
  test:     tambah/edit test
  perf:     performance improvement

Branch strategy:
  main          → production only, protected
  staging        → pre-production testing
  siklus-X/     → per siklus
  fahmi/*       → branch personal Fahmi
  nasywa/*      → branch personal Nasywa

PR flow: personal branch → siklus-X → staging → (jeda review) → main
```

### Code Quality
- Test coverage: minimum 70%
- Type hints Python: WAJIB di semua fungsi
- Docstring: WAJIB di semua service functions
- Pydantic: WAJIB untuk semua request/response model
- Sentry: error tracking aktif di staging + production
- Alembic: WAJIB setiap perubahan schema DB

### Naming Conventions
```python
# Models (Pydantic & SQLAlchemy) — PascalCase
class UserCreate(BaseModel): ...
class Portfolio(Base): ...

# Functions — snake_case
def get_user_by_email(): ...
async def calculate_portfolio_pnl(): ...

# Constants — SCREAMING_SNAKE_CASE
MAX_WATCHLIST_ITEMS_LITE = 10
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Env vars — SCREAMING_SNAKE_CASE
DATABASE_URL=
REDIS_URL=
GROQ_API_KEY=
```

---

## 15. VIBE CODING GUIDE — CLAUDE CODE + COPILOT

### Setup yang Dibutuhkan

#### Install
```bash
# Claude Code (CLI)
npm install -g @anthropic-ai/claude-code

# GitHub Copilot
# → Install di VSCode: Extension "GitHub Copilot"
# → Login dengan akun GitHub yang punya Copilot subscription
```

#### CLAUDE.md (Buat di root setiap repo)
```markdown
# CLAUDE.md — Stoxify Context

## Project
Stoxify — AI-powered investment BI + ML platform
Coverage: Saham IDX + Global + Crypto
Team: Fahmi (backend/ML) + Nasywa (frontend/mobile)

## Tech Stack
Backend: FastAPI + PostgreSQL + TimescaleDB + Redis
Frontend: Next.js + Tailwind
Mobile: Flutter (Phase 2)
AI: Groq (chat) + Gemini Flash (riset)

## Conventions
- UUID PRIMARY KEY (BUKAN integer)
- DECIMAL(20,8) untuk harga (BUKAN float)
- Soft delete: deleted_at TIMESTAMPTZ NULL
- snake_case untuk semua naming DB
- Plural tabel (users, not user)
- Alembic untuk semua migration
- Pydantic validation semua endpoint
- httpOnly cookie untuk JWT (BUKAN localStorage)
- Rate limit: 100 req/menit per user
- bcrypt cost 12 untuk password

## Response Format
Success: { "success": true, "data": {...}, "message": "OK" }
Error:   { "success": false, "error": { "code": "...", "message": "..." } }

## Tier Gates
Tiers: lite | growth | apex
Gunakan dependency require_tier("growth") untuk gate fitur

## Important Rules
- JANGAN hardcode API keys — gunakan env vars
- JANGAN skip Alembic migration
- JANGAN pakai float untuk harga
- JANGAN simpan token di localStorage
- SELALU tulis type hints
- SELALU tulis docstring di service functions
- SELALU handle error dengan proper HTTP status code
```

### MCP Setup untuk Stoxify

MCP = Model Context Protocol — jembatan antara Claude Code dan tools lokal.
Tanpa MCP: Claude jawab teks → lo copy paste manual.
Dengan MCP: Claude langsung baca file, edit kode, jalankan test.

```json
// claude_mcp_config.json (taruh di root project)
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/stoxify"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/stoxify_dev"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

### Workflow Vibe Coding yang Efektif

#### Fahmi (Backend + ML)
```
Copilot  → autocomplete saat nulis baris per baris
           (ketik fungsi, dia sugges implementasi)

Claude Code + MCP → task besar:
  - "Buatkan endpoint FastAPI untuk portfolio tracker
     dengan model SQLAlchemy, schema Pydantic, CRUD service,
     dan unit test, konsisten dengan codebase yang ada"
  
  - "Buat Alembic migration untuk menambahkan tabel
     sentiment_scores sebagai hypertable TimescaleDB"
  
  - "Implementasi LSTM prediction pipeline untuk
     saham IDX — training, inference, dan caching ke Redis"

Claude Code akan:
  1. Baca struktur folder project
  2. Lihat model existing untuk konsistensi
  3. Generate kode sesuai conventions
  4. Save langsung ke file yang benar
  5. Jalankan test otomatis
```

#### Nasywa (Frontend)
```
Copilot  → autocomplete komponen, props, styling

Claude Code + MCP → komponen kompleks:
  - "Buat komponen React untuk AI Score display
     sesuai design system Stoxify (warna, font, radius)"
  
  - "Implementasi TradingView chart wrapper dengan
     dark theme Abyss Navy dan support untuk semua timeframe"
  
  - "Generate halaman portfolio lengkap berdasarkan
     komponen existing di /components/ui/"

Claude Code akan:
  1. Baca design tokens yang ada
  2. Baca komponen existing untuk konsistensi
  3. Generate sesuai brand Stoxify
  4. Save ke lokasi yang benar
```

### Prompt Templates yang Efektif

#### Backend endpoint baru:
```
Buatkan endpoint FastAPI [GET/POST/PUT/DELETE] untuk [fitur].
Requirements:
- Path: /api/v1/[path]
- Auth: JWT required
- Tier gate: [lite/growth/apex]
- Input: [field dan tipe]
- Output: [field dan tipe]
- Business logic: [jelaskan]
- Konsisten dengan pola di modules/[modul lain]
Sertakan: Pydantic schema, service function, router, dan unit test.
```

#### Database migration:
```
Buat Alembic migration untuk:
[deskripsi perubahan schema]
Gunakan UUID, snake_case, soft delete jika relevan.
Jika tabel time-series → buat sebagai TimescaleDB hypertable.
```

#### Frontend komponen:
```
Buat komponen React [nama] untuk [fungsi].
Design tokens: gunakan CSS variables dari globals.css
Font: Syne untuk heading, DM Mono untuk angka
Warna: primary #162444, gold #F0B429 (accent only), bg #010206
Radius: 8px
State: [jelaskan state yang dibutuhkan]
Props: [interface]
Tampilkan loading state dan error state.
```

### Hal yang JANGAN Dilakukan saat Vibe Coding
- Jangan accept semua suggestion Copilot mentah-mentah — review dulu
- Jangan biarkan Claude generate tanpa CLAUDE.md — hasilnya tidak konsisten
- Jangan skip review kode yang di-generate untuk security (JWT, password, SQL injection)
- Jangan lupa Alembic migration setelah Claude generate model baru
- Jangan biarkan float untuk harga meski Claude suggest — selalu koreksi ke DECIMAL(20,8)

---

## 16. BILLING & PAYMENT

- **Payment**: Midtrans (QRIS, GoPay, OVO, ShopeePay, transfer bank, kartu kredit)
- **Billing cycle**: bulanan + tahunan (hemat ~20%)
- **Cancel**: akses tetap sampai akhir periode, tidak ada uang kembali
- **Refund**: **TIDAK ADA DALAM KONDISI APAPUN**
- Disclaimer wajib di: (1) checkout page, (2) ToS saat register

---

## 17. COST ESTIMATES

| Fase | Users | Estimasi/bulan |
|------|-------|---------------|
| MVP | 0–50 | ~Rp 280.000 |
| Growth | 50–500 | ~Rp 1.500.000–2.000.000 |
| Scale | 500+ | ~Rp 10.000.000–12.000.000 |

**Break-even**: 10 subscriber Growth = Rp 5.500.000/bln → sudah cover semua biaya awal.

### Data Source Cost per Fase
| Fase | Provider | Estimasi |
|------|----------|---------|
| 0 revenue | yfinance | Gratis (personal use, risiko di-block) |
| Ada revenue | GOAPI.io + Twelve Data | ~$8–55/bln |
| Scale | IDX Official + Polygon.io | ~$199+/bln |

---

## 18. PENDING ACTION ITEMS

- [ ] Cek GOAPI.io pricing + coverage IDX detail
- [ ] Keputusan final data source production saham
- [ ] Buat Pitch Siklus 0
- [ ] Buat CLAUDE.md di masing-masing repo
- [ ] Setup MCP servers di mesin lokal
- [ ] Mobile Flutter detail — Siklus 9

---

## 19. CRITICAL NOTES — JANGAN LUPA

1. **"Realtime" saham** = polling 1 menit via yfinance — bukan WebSocket. Jangan mispromise.
2. **Crypto** = true realtime via Binance WebSocket, gratis semua tier.
3. **yfinance ToS** = personal use only — upgrade ke paid API setelah ada revenue.
4. **Redis cache** = 1 fetch untuk semua user — JANGAN fetch per request.
5. **No refund** = disclaimer WAJIB di checkout + ToS sebelum bayar.
6. **SHA-256 hash** di consent = wajib untuk audit OJK.
7. **DECIMAL(20,8)** untuk semua nilai finansial — JANGAN FLOAT.
8. **Soft delete** = gunakan deleted_at, JANGAN hard delete data user.
9. **Alembic** = WAJIB setiap perubahan schema — JANGAN manual SQL di production.
10. **Gold color** = accent ONLY — bukan warna dominan UI.

---

*Stoxify — "The market, simplified."*
*Fahmi + Nasywa — 2026*
