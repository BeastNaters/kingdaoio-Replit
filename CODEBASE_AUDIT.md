# KingDAO Treasury Dashboard - Complete Codebase Audit

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Framework**: Express.js + React (Vite) - **NOT Next.js**

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Environment Variables](#2-environment-variables)
3. [Web3 Token-Gating](#3-web3-token-gating)
4. [External Service Integrations](#4-external-service-integrations)
5. [Database Schema](#5-database-schema)
6. [UI Components & Data Flow](#6-ui-components--data-flow)
7. [Setup Checklist for Dev Team](#7-setup-checklist-for-dev-team)
8. [Known Issues & TODOs](#8-known-issues--todos)
9. [Security Notes](#9-security-notes)

---

## 1. Repository Structure

### Framework & Architecture

**⚠️ IMPORTANT**: This is an **Express + React (Vite)** application, **NOT Next.js**.

- **Backend**: Express.js server (`/server`)
- **Frontend**: React 18+ with Vite bundler (`/client`)
- **Routing**: Wouter (lightweight client-side routing)
- **ORM**: Drizzle ORM with PostgreSQL
- **Build System**: Vite for frontend, esbuild for backend

### Top-Level Folders

```
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route pages (Dashboard, NFTs, Community, Admin)
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Client utilities (wagmi, queryClient)
│   └── index.html
│
├── server/                    # Express backend
│   ├── lib/                  # External service integrations
│   │   ├── dune.ts          # Dune Analytics API
│   │   ├── safe.ts          # Gnosis Safe API
│   │   ├── googleSheets.ts  # Google Sheets (via Replit Connectors)
│   │   ├── discord.ts       # Discord announcements (via Replit Connectors)
│   │   ├── snapshot.ts      # Snapshot governance
│   │   ├── moralis.ts       # Moralis NFT data
│   │   ├── supabase.ts      # Supabase caching layer
│   │   └── isKongHolder.ts  # NFT ownership verification
│   ├── middleware/
│   │   └── adminAuth.ts     # Admin wallet verification
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # In-memory storage interface
│   └── index.ts             # Server entry point
│
├── shared/                    # Shared TypeScript types
│   ├── schema.ts             # Drizzle database schemas
│   └── treasury-types.ts     # Treasury data interfaces
│
├── .env.example              # Environment variable template
└── README.md                 # User-facing documentation
```

### Placeholder/Mock Code

**Files with Mock Data Fallbacks:**

1. **`server/lib/dune.ts`**
   - Returns mock token prices if `DUNE_API_KEY` or query IDs not configured
   - Mock ETH: $2450.50, USDC: $1.00, DAI: $1.00

2. **`server/lib/discord.ts`**
   - Returns 3 mock announcements if Discord not connected or settings missing
   - Always falls back to mock data on errors

3. **`server/lib/safe.ts`**
   - Returns empty array `[]` if `SAFE_ADDRESS` not configured
   - No mock data - gracefully returns nothing

**Hardcoded Values:**

- **Kong NFT Contract**: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328` (hardcoded in 2 places)
  - `client/src/components/ProtectedRoute.tsx:5`
  - `server/lib/isKongHolder.ts:1`
  
- **Snapshot Space**: Defaults to `kongsdao.eth` if env var not set
  - `server/lib/snapshot.ts:2`
  
- **Safe Transaction Service URL**: Defaults to mainnet
  - `server/lib/safe.ts:1`

---

## 2. Environment Variables

### Complete List (27 Variables)

All environment variable usage has been audited by scanning `process.env.*` and `import.meta.env.*`.

#### **Required for Basic Functionality**

| Variable | Used In | Service | Type | Notes |
|----------|---------|---------|------|-------|
| `DATABASE_URL` | `server/db.ts`, `drizzle.config.ts` | PostgreSQL | Server | Drizzle ORM connection string |
| `ETHEREUM_RPC_URL` | `server/lib/isKongHolder.ts` | Ethereum Mainnet RPC | Server | NFT ownership verification (primary) |
| `NEXT_PUBLIC_RPC_URL` | `server/lib/isKongHolder.ts` | Ethereum Mainnet RPC | Server | **Fallback** if `ETHEREUM_RPC_URL` not set |
| `VITE_ETHEREUM_RPC_URL` | `client/src/lib/wagmi.ts` | Ethereum Mainnet RPC | **Public** | Frontend wallet connection (must have `VITE_` prefix) |
| `NEXT_PUBLIC_SUPABASE_URL` | `server/lib/supabase.ts` | Supabase | **Public** | Supabase project URL (legacy name, works with Vite) |
| `SUPABASE_SERVICE_ROLE_KEY` | `server/lib/supabase.ts` | Supabase | **Server-only** | **🔒 NEVER expose on client!** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend (unused) | Supabase | **Public** | Anon key for client-side queries (currently unused) |
| `MORALIS_API_KEY` | `server/lib/moralis.ts` | Moralis | Server | NFT holdings & floor prices |
| `ADMIN_ADDRESSES` | `server/middleware/adminAuth.ts` | Admin Auth | Server | Comma-separated wallet addresses |
| `VITE_ADMIN_ADDRESSES` | `client/src/components/AdminRoute.tsx` | Admin Auth | **Public** | Same addresses, client-side check (must have `VITE_` prefix) |

#### **Optional - Graceful Degradation**

| Variable | Used In | Service | Default Behavior |
|----------|---------|---------|------------------|
| `DUNE_API_KEY` | `server/lib/dune.ts` | Dune Analytics | Returns mock token prices |
| `DUNE_TOKEN_PRICES_QUERY_ID` | `server/lib/dune.ts` | Dune Analytics | Returns mock prices |
| `DUNE_NFT_FLOOR_PRICES_QUERY_ID` | `server/lib/dune.ts` | Dune Analytics | Returns mock floor prices |
| `DUNE_WALLET_BALANCES_QUERY_ID` | `server/lib/dune.ts` | Dune Analytics | Returns mock balances |
| `SAFE_ADDRESS` | `server/lib/safe.ts`, `server/routes.ts` | Gnosis Safe | Returns empty array `[]` |
| `SAFE_TX_SERVICE_URL` | `server/lib/safe.ts` | Gnosis Safe | Defaults to `https://safe-transaction-mainnet.safe.global` |
| `TREASURY_SPREADSHEET_ID` | `server/lib/googleSheets.ts` | Google Sheets | Throws error (service disabled) |
| `SNAPSHOT_SPACE` | `server/lib/snapshot.ts` | Snapshot | Defaults to `kongsdao.eth` |
| `SNAPSHOT_INTERVAL` | `server/lib/scheduler.ts` | Snapshot Scheduler | Defaults to `3600000` (1 hour) |
| `SESSION_SECRET` | Session encryption | Express Session | Random string recommended |
| `PORT` | `server/index.ts` | Express Server | Defaults to `5000` |

#### **Replit-Specific (Auto-populated by Platform)**

| Variable | Used In | Purpose | Required? |
|----------|---------|---------|-----------|
| `REPLIT_CONNECTORS_HOSTNAME` | `server/lib/googleSheets.ts:10`, `server/lib/discord.ts:18` | OAuth connector API endpoint | **Required for Google Sheets & Discord** |
| `REPL_IDENTITY` | `server/lib/googleSheets.ts:11`, `server/lib/discord.ts:19` | Replit OAuth token (dev environment) | **Required for Google Sheets & Discord** (OR `WEB_REPL_RENEWAL`) |
| `WEB_REPL_RENEWAL` | `server/lib/googleSheets.ts:13`, `server/lib/discord.ts:21` | Replit OAuth token (deployment) | **Required for Google Sheets & Discord** (OR `REPL_IDENTITY`) |
| `REPL_ID` | `vite.config.ts:11` | Replit project identifier | Auto-set (optional) |
| `NODE_ENV` | `vite.config.ts:10` | Environment detection | Auto-set (optional) |

### Complete Variable Count Breakdown

**Total**: 27 environment variables

**By Category**:
- Required for basic app functionality: 10 variables
  - `DATABASE_URL`
  - `ETHEREUM_RPC_URL`
  - `NEXT_PUBLIC_RPC_URL` (fallback)
  - `VITE_ETHEREUM_RPC_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `MORALIS_API_KEY`
  - `ADMIN_ADDRESSES`
  - `VITE_ADMIN_ADDRESSES`

- Optional (graceful degradation): 11 variables
  - `DUNE_API_KEY`
  - `DUNE_TOKEN_PRICES_QUERY_ID`
  - `DUNE_NFT_FLOOR_PRICES_QUERY_ID`
  - `DUNE_WALLET_BALANCES_QUERY_ID`
  - `SAFE_ADDRESS`
  - `SAFE_TX_SERVICE_URL`
  - `TREASURY_SPREADSHEET_ID`
  - `SNAPSHOT_SPACE`
  - `SNAPSHOT_INTERVAL`
  - `SESSION_SECRET`
  - `PORT`

- Replit platform (auto-populated): 5 variables
  - `REPLIT_CONNECTORS_HOSTNAME`
  - `REPL_IDENTITY`
  - `WEB_REPL_RENEWAL`
  - `REPL_ID`
  - `NODE_ENV`

- Frontend-accessible (must have `VITE_` or `NEXT_PUBLIC_` prefix): 1 variable
  - `VITE_ETHEREUM_RPC_URL` (required)
  - `VITE_ADMIN_ADDRESSES` (required)
  - `NEXT_PUBLIC_SUPABASE_URL` (required)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required but unused)
  - `NEXT_PUBLIC_RPC_URL` (fallback server-side check)

### Environment Variable Checklist

**Must be added to `.env.example`**: ✅ Already complete in `.env.example`

**Must be configured in `.env` for local dev (minimum viable setup)**:
1. `DATABASE_URL` - Get from Replit DB, Neon, or Supabase
2. `ETHEREUM_RPC_URL` OR `NEXT_PUBLIC_RPC_URL` - Server RPC (one required)
3. `VITE_ETHEREUM_RPC_URL` - Frontend RPC (required)
4. `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard
5. `MORALIS_API_KEY` - From Moralis admin panel
6. `ADMIN_ADDRESSES` and `VITE_ADMIN_ADDRESSES` - Your admin wallet addresses
7. Optional: Dune query IDs, `SAFE_ADDRESS`, `TREASURY_SPREADSHEET_ID`

**Replit Connector Variables** (only needed for Google Sheets & Discord):
- `REPLIT_CONNECTORS_HOSTNAME` - Auto-set by Replit
- `REPL_IDENTITY` OR `WEB_REPL_RENEWAL` - Auto-set by Replit
- **Outside Replit**: These integrations will NOT work (mock data will be used)

---

## 3. Web3 Token-Gating

### NFT Contract Verification

**Contract Address**: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328` (Kong NFT on Ethereum Mainnet)  
**Chain**: Ethereum Mainnet (Chain ID: 1)  
**Standard**: ERC721

### Implementation Locations

#### Client-Side Check (Primary)
**File**: `client/src/components/ProtectedRoute.tsx:5-60`

```typescript
const KONG_NFT_CONTRACT = '0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328';

// Uses wagmi's useReadContract hook
const { data: balance } = useReadContract({
  address: KONG_NFT_CONTRACT,
  abi: ERC721_ABI,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

**Mechanism**:
- Uses `wagmi` + `viem` for type-safe Ethereum interactions
- Calls ERC721 `balanceOf(address)` function
- Instantly checks NFT ownership without server round-trip
- Redirects to `<TokenGated />` component if balance === 0

#### Server-Side Check (Secondary)
**File**: `server/lib/isKongHolder.ts:1-62`

```typescript
const KONG_NFT_CONTRACT = '0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328';

// Direct RPC call via fetch
const response = await fetch(rpcUrl, {
  method: 'POST',
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [{ to: KONG_NFT_CONTRACT, data: encodedBalanceOf }, 'latest'],
  }),
});
```

**Used by API endpoint**: `GET /api/auth/holdings?address=...`

**RPC URL Priority**:
1. `process.env.ETHEREUM_RPC_URL`
2. Fallback to `process.env.NEXT_PUBLIC_RPC_URL`

### Security Assessment

**Client-Side Bypass Risk**: ⚠️ **Medium**
- Client checks can be bypassed with browser DevTools
- Currently there's no server-side enforcement on protected API routes

**Server-Side Enforcement**: ❌ **Not Implemented**
- `/api/treasury/*` routes do NOT verify NFT ownership
- Admin routes only check wallet address against `ADMIN_ADDRESSES`

**Recommendation**: Add `requireKongHolder` middleware to sensitive routes:

```typescript
// server/middleware/kongAuth.ts (TO BE CREATED)
export async function requireKongHolder(req, res, next) {
  const address = req.headers['x-wallet-address'];
  if (!await isKongHolder(address)) {
    return res.status(403).json({ error: 'Kong NFT required' });
  }
  next();
}
```

### If Contract Address Needs to Change

**Files to update**:
1. `client/src/components/ProtectedRoute.tsx:5`
2. `server/lib/isKongHolder.ts:1`
3. `README.md` (lines 11, 194, 240)
4. `replit.md` (lines 7, 48)

---

## 4. External Service Integrations

### 4.1 Dune Analytics

**File**: `server/lib/dune.ts`

**API Base**: `https://api.dune.com/api/v1`  
**Authentication**: Header `x-dune-api-key: <DUNE_API_KEY>`

#### Required Query IDs

The code expects **3 Dune query IDs** with specific output schemas:

1. **`DUNE_TOKEN_PRICES_QUERY_ID`**
   - **Expected columns**: `symbol` (string), `name` (string), `price` (number)
   - **Usage**: Token price data for portfolio valuation
   - **Fallback**: Returns mock data (ETH: $2450.50, USDC: $1.00, DAI: $1.00)

2. **`DUNE_NFT_FLOOR_PRICES_QUERY_ID`**
   - **Expected columns**: `collection` (string), `floor_price` (number)
   - **Usage**: NFT floor prices for portfolio valuation
   - **Fallback**: Returns mock data (Kong NFT: 0.5 ETH, Other: 0.3 ETH)

3. **`DUNE_WALLET_BALANCES_QUERY_ID`**
   - **Expected columns**: `address` (string), `tokens` (array of objects with `symbol`, `amount`)
   - **Usage**: Wallet-level token holdings
   - **Fallback**: Returns mock wallet with 10.5 ETH, 50,000 USDC

#### Error Handling

- If `DUNE_API_KEY` missing → Mock data returned
- If query ID missing → Mock data returned
- If API returns error → Logs error, returns empty array `[]`

#### UI Impact

**Components using Dune data**: None directly (all data flows through aggregated treasury snapshot)

**What happens if Dune fails**: UI shows $0 values for Dune-sourced tokens, but app doesn't crash

---

### 4.2 Google Sheets Integration

**File**: `server/lib/googleSheets.ts`

**API**: Google Sheets API v4  
**Authentication**: ❌ **NOT service account** - Uses **Replit Connectors OAuth**

#### How It Works (Replit-Specific)

1. User connects Google account via Replit integrations panel
2. Replit stores OAuth access token in secure connector service
3. Backend fetches token from `https://<REPLIT_CONNECTORS_HOSTNAME>/api/v2/connection?connector_names=google-sheet`
4. Uses token to initialize Google Sheets client

**Required Environment Variables**:
- `TREASURY_SPREADSHEET_ID` - The spreadsheet ID from URL
- `REPLIT_CONNECTORS_HOSTNAME` - Auto-set by Replit
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL` - OAuth tokens (auto-set)

#### Expected Sheet Structure

**Sheet Name**: `Treasury` (hardcoded in line 62)  
**Range**: `A:E` (columns A through E)

**Expected Columns** (inferred from code):

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | Date | string | Entry date |
| B | Description | string | Transaction description |
| C | Category | string | Category/label |
| D | Amount USD | number | USD value |
| E | Source | string | Data source identifier |

**Row 1**: Headers (skipped by code)  
**Row 2+**: Data entries

#### Error Behavior

- If `TREASURY_SPREADSHEET_ID` not set → Throws error, UI shows error banner
- If sheet empty → Returns `[]`
- If fetch fails → Throws error, caught by route handler

#### ⚠️ Setup Required

**On Google Cloud Console**:
- ❌ **NOT NEEDED** - Replit Connectors handle OAuth automatically

**On Replit**:
1. Go to **Integrations** panel
2. Connect **Google Sheets** integration
3. Grant permission to read spreadsheets
4. Add `TREASURY_SPREADSHEET_ID` to `.env`

**Share Permissions**: Spreadsheet must be accessible by the Google account connected via Replit

---

### 4.3 Gnosis Safe (Multi-Sig Treasury)

**File**: `server/lib/safe.ts`

**API Endpoint**: `<SAFE_TX_SERVICE_URL>/api/v1/safes/<SAFE_ADDRESS>/balances/usd/`  
**Default Service**: `https://safe-transaction-mainnet.safe.global`

#### Configuration

- `SAFE_ADDRESS` - Ethereum address of Gnosis Safe wallet
- `SAFE_TX_SERVICE_URL` - Optional, defaults to mainnet

#### Expected Response Shape

The code expects this structure from Safe API:

```json
[
  {
    "token": { "symbol": "ETH", "name": "Ethereum", "decimals": 18 },
    "balance": "1500000000000000000",
    "fiatConversion": "2450.50",
    "fiatBalance": "3675.75"
  }
]
```

**Data Transformation**:
- `balance` → Divided by `10^decimals` to get human-readable amount
- `fiatConversion` → Used as `usdPrice`
- `fiatBalance` → Used as `usdValue`
- Adds `source: 'safe'` tag

#### Error Behavior

- If `SAFE_ADDRESS` not configured → Returns `[]` (empty array)
- If API returns error → Logs error, returns `[]`

#### What You Need to Provide

1. **Real Gnosis Safe address** on Ethereum mainnet
2. Network must be mainnet (Chain ID: 1) - code assumes this

---

### 4.4 Supabase (Caching & Historical Data)

**File**: `server/lib/supabase.ts`

**Purpose**: Store treasury snapshots for historical performance charts

**⚠️ CRITICAL**: Supabase tables are **NOT auto-created** - you must create them manually!

#### Configuration

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key for server-side operations
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key (currently unused)

#### Functions Implemented

1. **`getLatestSnapshot()`** - Fetches most recent treasury snapshot
2. **`getHistoricalSnapshots(startDate?, endDate?, limit)`** - Historical data for charts
3. **`upsertSnapshot(snapshot)`** - Saves new snapshot

#### Expected Table Schema

**Table Name**: `treasury_snapshots`

**⚠️ YOU MUST CREATE THIS TABLE MANUALLY IN SUPABASE**

Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE treasury_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_usd_value NUMERIC NOT NULL,
  tokens JSONB NOT NULL,
  nfts JSONB NOT NULL,
  wallets JSONB NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_treasury_snapshots_timestamp ON treasury_snapshots(timestamp);
```

**Column Mapping** (code uses snake_case in Supabase, camelCase in TypeScript):

| Supabase Column | TypeScript Field | Type | Purpose |
|-----------------|------------------|------|---------|
| `id` | `id` | UUID | Primary key |
| `timestamp` | `timestamp` | timestamptz | Snapshot creation time |
| `total_usd_value` | `totalUsdValue` | number | Total portfolio value |
| `tokens` | `tokens` | JSONB | Array of `TokenBalance` objects |
| `nfts` | `nfts` | JSONB | Array of `NftHolding` objects |
| `wallets` | `wallets` | JSONB | Array of `WalletInfo` objects |
| `metadata` | `metadata` | JSONB | Optional extra data |

#### Data Shape Expected in JSONB Columns

**`tokens`**: Array of `TokenBalance`
```json
[
  {
    "symbol": "ETH",
    "amount": 10.5,
    "usdPrice": 2450.50,
    "usdValue": 25730.25,
    "source": "safe"
  }
]
```

**`nfts`**: Array of `NftHolding`
```json
[
  {
    "collection": "Kong NFT",
    "tokenId": "1234",
    "image": "https://...",
    "floorPrice": 0.5,
    "estimatedValueUsd": 1225.25
  }
]
```

**`wallets`**: Array of `WalletInfo`
```json
[
  {
    "address": "0x...",
    "chainId": 1
  }
]
```

#### Current Usage Status

**✅ Wired**: Code is fully implemented  
**✅ Used**: Backend stores snapshots via scheduler (`server/lib/scheduler.ts`)  
**✅ Used**: Frontend queries historical data for performance chart (`Dashboard.tsx`)

**If Supabase is down**: Historical charts show empty state, but app doesn't crash

---

### 4.5 Snapshot (Governance)

**File**: `server/lib/snapshot.ts`

**API Endpoint**: `https://hub.snapshot.org/graphql` (GraphQL)  
**Space**: `kongsdao.eth` (defaults if `SNAPSHOT_SPACE` not set)

#### GraphQL Query

The code queries for the latest 20 proposals with these fields:

**Expected Response Fields**:
- `id` - Proposal ID
- `title` - Proposal title
- `body` - Markdown content
- `choices` - Array of voting options
- `start` - Start timestamp (Unix)
- `end` - End timestamp (Unix)
- `state` - `active`, `closed`, `pending`
- `author` - Wallet address
- `space.id` - Space identifier
- `space.name` - Space name

**Transformed Output**:
```typescript
{
  id: string;
  title: string;
  state: string;
  start: number;
  end: number;
  link: string; // Auto-generated: https://snapshot.org/#/kongsdao.eth/proposal/{id}
  choices: string[];
  body: string;
}
```

#### Error Behavior

- If API fails → Logs error, returns `[]`
- No authentication required (public data)

#### Space Configuration

**Current Space**: `kongsdao.eth` (hardcoded default with env override)

**To change**: Set `SNAPSHOT_SPACE=your-space.eth` in `.env`

**Files that reference space**:
- `server/lib/snapshot.ts:2` - GraphQL query
- `client/src/pages/Community.tsx:52` - UI display
- `client/src/components/ProposalVoting.tsx:43` - Hardcoded in component

---

### 4.6 Discord (Announcements)

**File**: `server/lib/discord.ts`

**API**: Discord.js client library  
**Authentication**: ❌ **NOT bot token** - Uses **Replit Connectors OAuth**

#### How It Works (Replit-Specific)

Same OAuth pattern as Google Sheets:
1. Connect Discord bot via Replit integrations
2. Replit stores OAuth access token
3. Backend fetches token from connector service
4. Creates Discord.js client with token

#### Required Configuration

**Environment Variables**:
- `REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY`, `WEB_REPL_RENEWAL` - Auto-set by Replit

**Settings Object** (passed to `fetchDiscordAnnouncements`):
```typescript
{
  enabled: boolean;     // Must be true
  guildId: string;      // Discord server ID
  channelId: string;    // Announcement channel ID
}
```

These settings are stored in database via admin panel (`/api/admin/settings`).

#### Expected Behavior

**If configured correctly**:
- Fetches last 10 messages from specified channel
- Caches for 5 minutes
- Returns structured announcements

**If not configured** (missing settings or Replit connection):
- Returns 3 **mock announcements**:
  1. "New Treasury Dashboard Launch"
  2. "Governance Proposal #5 Now Live"
  3. "Monthly Community Call"

#### Output Shape

```typescript
{
  id: string;           // Message ID
  title: string;        // First line of message (max 100 chars)
  content: string;      // Full message content
  timestamp: string;    // ISO timestamp
  author: string;       // Username
}
```

#### UI Impact

**Component**: `client/src/pages/Community.tsx` displays announcements

**Current Status**: Always shows 3 mock announcements unless Discord is properly configured via admin panel

---

### 4.7 Moralis (NFT Data)

**File**: `server/lib/moralis.ts`

**API Endpoint**: `https://deep-index.moralis.io/api/v2.2`  
**Authentication**: Header `X-API-Key: <MORALIS_API_KEY>`

#### Functions Implemented

1. **`fetchWalletNFTs(walletAddress)`**
   - Endpoint: `/<address>/nft?chain=eth&format=decimal&normalizeMetadata=true`
   - Returns up to 50 NFTs with metadata and images
   - Filters out NFTs without images

2. **`fetchCollectionFloorPrice(contractAddress)`** (internal)
   - Endpoint: `/nft/<contract>/floor-price?chain=eth`
   - Returns floor price in ETH and USD

#### Expected Response Structure

**NFT Metadata**:
```json
{
  "token_address": "0x...",
  "token_id": "1234",
  "name": "Collection Name",
  "symbol": "SYMBOL",
  "normalized_metadata": {
    "name": "NFT #1234",
    "image": "https://...",
    "description": "...",
    "attributes": [...]
  }
}
```

**Floor Price**:
```json
{
  "floor_price": "0.5",           // ETH
  "floor_price_usd": 1225.25      // USD
}
```

#### Error Handling

- If `MORALIS_API_KEY` missing → Throws `MORALIS_API_KEY_MISSING` error
- If no NFTs found → Returns `[]`
- If floor price fetch fails → Returns `{ eth: 0, usd: 0 }`

#### Used By

**API Route**: `GET /api/nfts/holdings?address=...`  
**Frontend Component**: `client/src/pages/Nfts.tsx`

---

## 5. Database Schema

### Primary Database (Drizzle + PostgreSQL)

**File**: `shared/schema.ts`

**Connection**: Uses `DATABASE_URL` environment variable

#### Tables Defined

##### 1. `users` (Unused - Legacy Auth)

```typescript
{
  id: varchar (UUID primary key),
  username: text (unique),
  password: text
}
```

**Status**: ⚠️ Table defined but **not used** - no traditional auth implemented

---

##### 2. `admin_settings`

```typescript
{
  id: varchar (UUID primary key),
  key: text (unique),
  value: jsonb,
  updatedAt: timestamp (auto)
}
```

**Purpose**: Store admin panel configuration (Discord settings, wallet addresses, etc.)

**Used by**:
- `POST /api/admin/settings` - Save settings
- `GET /api/admin/settings` - Retrieve settings

**Example Data**:
```json
{
  "key": "discord",
  "value": {
    "enabled": true,
    "guildId": "1234567890",
    "channelId": "0987654321"
  }
}
```

---

##### 3. `treasury_snapshots` ⚠️ (Conflicts with Supabase)

```typescript
{
  id: varchar (UUID primary key),
  timestamp: timestamp (indexed),
  totalUsdValue: real,
  tokens: jsonb,
  nfts: jsonb,
  wallets: jsonb,
  metadata: jsonb
}
```

**⚠️ IMPORTANT**: This table is defined in Drizzle schema BUT...

**Actual Usage**: Code uses **Supabase** (`server/lib/supabase.ts`), NOT this table!

**Recommendation**: 
- **Option A**: Remove this table from `shared/schema.ts` to avoid confusion
- **Option B**: Migrate away from Supabase, use this table with Drizzle ORM
- **Current State**: Confusing - schema exists but not used

---

##### 4. `nft_assets`

```typescript
{
  id: varchar (UUID primary key),
  contractAddress: text,
  tokenId: text,
  collection: text,
  image: text,
  floorPrice: real,
  estimatedValueUsd: real,
  lastUpdated: timestamp (auto),
  
  UNIQUE(contractAddress, tokenId)
}
```

**Purpose**: Cache NFT metadata and floor prices

**Status**: ⚠️ Table defined but **not actively used** - NFT data comes from Moralis API directly

---

### Supabase Database (Separate Instance)

**File**: `server/lib/supabase.ts`

**Connection**: Uses `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

#### Table: `treasury_snapshots`

**⚠️ YOU MUST CREATE THIS MANUALLY** - See SQL in Section 4.4

**This is where historical snapshot data is actually stored!**

---

### Database Migration Commands

**Push schema changes**:
```bash
npm run db:push
```

**Force push (skip data loss warnings)**:
```bash
npm run db:push -- --force
```

**⚠️ Do NOT manually write SQL migrations** - Drizzle handles this

---

## 6. UI Components & Data Flow

### Dashboard Components (Data Dependencies)

#### Stat Cards
**Component**: `client/src/components/StatCard.tsx`  
**Used on**: Dashboard page

**Data Sources**:
1. Total Treasury Value → `snapshot.totalUsdValue`
2. Wallet Count → `snapshot.wallets.length`
3. NFT Holdings → `snapshot.nfts.length`

**Breaks if**: API returns `null` or missing fields → ❌ **Will crash**  
**Fix needed**: Add nullish coalescing (`snapshot?.totalUsdValue ?? 0`)

---

#### Token Table
**Component**: `client/src/components/DataTable.tsx`  
**Data Source**: `snapshot.tokens` (array of `TokenBalance`)

**Expected Fields**:
- `symbol` - Token ticker
- `amount` - Holdings amount
- `usdValue` - Total USD value

**Breaks if**: Empty array → ✅ Shows "No tokens found"

---

#### Portfolio Chart
**Component**: `client/src/components/PortfolioChart.tsx`  
**Data Source**: `snapshot.tokens`

**Uses**: Recharts `PieChart` to visualize token allocation

**Breaks if**: Empty array → ✅ Shows empty state

---

#### Performance Chart
**Component**: `client/src/components/PerformanceChart.tsx`  
**Data Source**: `/api/treasury/snapshots/history?limit=90`

**Expected Shape**:
```typescript
[
  {
    date: "Jan 1",      // Formatted date
    value: 1234567.89   // Total USD value
  }
]
```

**Breaks if**: Empty array → ✅ Shows "No historical data"

---

#### NFT Grid
**Component**: `client/src/components/NftGrid.tsx`  
**Data Source**: `/api/nfts/holdings?address=...`

**Expected Fields** per NFT:
- `collection` - Collection name
- `tokenId` - Token ID
- `image` - Image URL
- `floorPrice` - Floor price in ETH
- `estimatedValueUsd` - USD value

**Breaks if**: Empty array → ✅ Shows empty state

---

### Components Using Mock Data

1. **Dune-sourced tokens** - Shows mock prices if Dune not configured
2. **Discord announcements** - Always shows 3 mock announcements if not configured
3. **Safe balances** - Shows nothing (empty array) if not configured

### Loading & Error States

**✅ All components have loading states** using `<Skeleton />` from shadcn/ui

**✅ Error handling**:
- Query errors show `<AlertBanner type="error" />` 
- Empty states show friendly messages
- No crashes on `null` or `undefined` from APIs

---

## 7. Setup Checklist for Dev Team

### Prerequisites

- **Node.js**: v18+ or v20+ recommended
- **npm**: v9+ (comes with Node.js)
- **PostgreSQL**: Any provider (Replit, Neon, Supabase, local)
- **Git**: For version control

---

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd kingdao-treasury-dashboard
npm install
```

---

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

**Edit `.env` and fill in these REQUIRED variables**:

```bash
# Database (get from Replit DB, Neon, or Supabase)
DATABASE_URL=postgresql://user:password@host:port/database

# Ethereum RPC (get free from Infura, Alchemy, or use public)
ETHEREUM_RPC_URL=https://eth.llamarpc.com
VITE_ETHEREUM_RPC_URL=https://eth.llamarpc.com

# Supabase (create project at https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Moralis (get API key from https://admin.moralis.io)
MORALIS_API_KEY=your-moralis-api-key

# Admin Access (your wallet addresses, comma-separated)
ADMIN_ADDRESSES=0x1234...,0x5678...
VITE_ADMIN_ADDRESSES=0x1234...,0x5678...
```

**OPTIONAL but recommended**:
```bash
# Dune Analytics (create queries at https://dune.com)
DUNE_API_KEY=your-dune-key
DUNE_TOKEN_PRICES_QUERY_ID=your-query-id
DUNE_NFT_FLOOR_PRICES_QUERY_ID=your-query-id
DUNE_WALLET_BALANCES_QUERY_ID=your-query-id

# Gnosis Safe
SAFE_ADDRESS=0xYourMultiSigAddress

# Google Sheets (via Replit Connectors)
TREASURY_SPREADSHEET_ID=your-spreadsheet-id
```

---

### Step 3: Set Up External Services

#### 3.1 Supabase (REQUIRED)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and service role key to `.env`
4. **Run this SQL in Supabase SQL Editor**:

```sql
-- Create treasury_snapshots table
CREATE TABLE treasury_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_usd_value NUMERIC NOT NULL,
  tokens JSONB NOT NULL,
  nfts JSONB NOT NULL,
  wallets JSONB NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_treasury_snapshots_timestamp ON treasury_snapshots(timestamp);
```

#### 3.2 Moralis (REQUIRED)

1. Create account at [moralis.io](https://moralis.io)
2. Go to Settings → API Keys
3. Copy API key to `.env` as `MORALIS_API_KEY`

#### 3.3 Ethereum RPC (REQUIRED)

**Option A - Free Public RPC**:
- Use `https://eth.llamarpc.com` (already in `.env.example`)

**Option B - Dedicated Provider** (recommended for production):
1. Create account at [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
2. Create Ethereum mainnet project
3. Copy RPC URL to `.env`

#### 3.4 Dune Analytics (OPTIONAL)

1. Create account at [dune.com](https://dune.com)
2. Go to Settings → API
3. Generate API key
4. **Create 3 custom queries**:
   - **Token Prices**: Returns `symbol`, `name`, `price`
   - **NFT Floor Prices**: Returns `collection`, `floor_price`
   - **Wallet Balances**: Returns `address`, `tokens` (array)
5. Copy query IDs to `.env`

#### 3.5 Gnosis Safe (OPTIONAL)

1. Locate your Safe wallet address on Ethereum mainnet
2. Add to `.env` as `SAFE_ADDRESS`

#### 3.6 Google Sheets (OPTIONAL - Replit Only)

**⚠️ Only works on Replit platform**

1. In Replit, go to Integrations → Connect Google Sheets
2. Create spreadsheet with columns: Date, Description, Category, Amount USD, Source
3. Name sheet tab "Treasury"
4. Add spreadsheet ID to `.env`

#### 3.7 Discord (OPTIONAL - Replit Only)

**⚠️ Only works on Replit platform**

1. In Replit, go to Integrations → Connect Discord
2. Get server (guild) ID and announcement channel ID
3. Configure via Admin Panel after app is running

---

### Step 4: Database Setup

```bash
# Push Drizzle schema to database
npm run db:push
```

**If you see data loss warnings**:
```bash
npm run db:push -- --force
```

---

### Step 5: Run Development Server

```bash
npm run dev
```

**Application will start on**: `http://localhost:5000`

**Frontend**: Vite dev server with HMR  
**Backend**: Express server with auto-reload

---

### Step 6: Verify Setup

1. **Visit**: `http://localhost:5000`
2. **Connect wallet** with Kong NFT (or any wallet for testing)
3. **Check**:
   - Dashboard loads without errors
   - Stat cards show values (may be $0 if services not configured)
   - Charts render (may be empty)
   - No red error banners

---

## 8. Known Issues & TODOs

### Critical

1. **❌ Treasury Snapshots Table Duplication**
   - Defined in `shared/schema.ts` (Drizzle)
   - Actually uses Supabase table (separate DB)
   - **Action**: Choose one source of truth, remove the other

2. **❌ Server-Side Token Gating Not Enforced**
   - Protected routes only check client-side
   - API endpoints don't verify Kong NFT ownership
   - **Action**: Add `requireKongHolder` middleware to treasury routes

3. **⚠️ Supabase Table NOT Auto-Created**
   - Developers must manually run SQL
   - Easy to miss in setup
   - **Action**: Add migration script or better docs

### Medium Priority

4. **⚠️ Mock Data in Production**
   - Dune, Discord return mock data if not configured
   - Users might not realize data is fake
   - **Action**: Add visual indicator when using mock data

5. **⚠️ `nft_assets` Table Unused**
   - Table defined but not populated or queried
   - **Action**: Remove from schema or implement caching

6. **⚠️ `users` Table Unused**
   - Traditional auth not implemented
   - **Action**: Remove table or document future plans

### Low Priority

7. **📝 Hardcoded Values**
   - Kong NFT contract address in 2 files
   - Snapshot space in 3 files
   - **Action**: Centralize constants in `shared/constants.ts`

8. **📝 Environment Variable Naming**
   - Uses `NEXT_PUBLIC_*` (legacy from Next.js)
   - Should be `VITE_*` for Vite
   - **Action**: Rename and update docs (non-breaking)

9. **📝 Error Messages**
   - Some errors log to console only
   - **Action**: Surface more errors in UI

---

## 9. Security Notes

### Critical - Do NOT Expose These

**🔒 NEVER commit to Git**:
- `SUPABASE_SERVICE_ROLE_KEY` - Full database admin access
- `DUNE_API_KEY` - Can incur API costs
- `MORALIS_API_KEY` - Rate-limited resource
- `SESSION_SECRET` - Session encryption key

**✅ `.gitignore` already includes**: `.env`, `.env.local`, `.env.production`

---

### Client-Side vs Server-Side Variables

**❌ NEVER use on client (no `VITE_` prefix)**:
- Database credentials
- Service role keys
- API keys (Dune, Moralis, etc.)

**✅ Safe for client (`VITE_` prefix)**:
- Public RPC URLs
- Supabase anon key (read-only with RLS)
- Admin addresses (publicly verifiable on blockchain anyway)

---

### Token-Gating Security

**Current Implementation**:
- ✅ Client-side: Prevents UI access
- ❌ Server-side: API routes not protected

**Recommended**:
```typescript
// Protect sensitive routes
app.get('/api/treasury/snapshots', requireKongHolder, async (req, res) => {
  // ...
});
```

---

### Admin Panel Access

**Current Check**: Wallet address must be in `ADMIN_ADDRESSES`

**⚠️ Weakness**: No signature verification - relies on wallet connection

**Recommended Enhancement**:
```typescript
// server/middleware/adminAuth.ts
// Add signature verification to prove wallet ownership
```

---

### Rate Limiting

**Current Status**: ❌ No rate limiting implemented

**Recommended**:
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Final Notes for Dev Team

### What Works Out of the Box

✅ NFT-gated access (client-side)  
✅ Wallet connection (wagmi + WalletConnect)  
✅ Graceful degradation for missing services  
✅ Loading states and error handling  
✅ WebSocket real-time updates  
✅ CSV/PDF export functionality  
✅ Responsive design (mobile-friendly)  

### What Needs Configuration

⚠️ Supabase tables (manual SQL required)  
⚠️ Dune Analytics queries (custom queries needed)  
⚠️ Google Sheets (Replit-only, requires OAuth)  
⚠️ Discord (Replit-only, requires OAuth)  

### What's Missing

❌ Server-side token gating enforcement  
❌ Rate limiting  
❌ Admin signature verification  
❌ Traditional user authentication  

---

## Quick Start Command Summary

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your values

# 3. Setup Supabase table (run SQL from section 4.4)

# 4. Push DB schema
npm run db:push

# 5. Run
npm run dev
```

**Application URL**: `http://localhost:5000`

---

**Document End** - Last updated January 2025
