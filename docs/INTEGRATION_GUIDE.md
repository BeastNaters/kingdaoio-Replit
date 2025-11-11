# KingDAO Treasury Dashboard - Integration Guide

## Overview

This guide provides detailed, step-by-step instructions for setting up and integrating all external services required for the KingDAO Treasury Dashboard. Follow these instructions in the recommended order to minimize configuration dependencies.

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Replit account (if deploying on Replit)
- [ ] Access to the project repository
- [ ] Ethereum wallet (MetaMask, WalletConnect, etc.)
- [ ] Admin access to DAO resources (if applicable)

## Quick Start Checklist

For a minimal working setup, you need:

1. ✅ **PostgreSQL Database** (Neon) - Required
2. ✅ **Ethereum RPC URL** - Required
3. ⚠️ **Gnosis Safe Address** - Recommended
4. ⚠️ **Google Sheets** - Recommended

Everything else is optional and will return mock data if not configured.

---

## 1. Database Setup (PostgreSQL via Neon)

**Required for**: Data persistence, community messages, admin settings

### Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **"New Project"**
3. Enter project name: `kingdao-treasury`
4. Select region closest to your users
5. Click **"Create Project"**

### Step 2: Get Connection String

1. In project dashboard, click **"Connection Details"**
2. Copy the connection string (starts with `postgresql://`)
3. It will look like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb
   ```

### Step 3: Configure Environment Variable

Add to your `.env` file:

```bash
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb
```

### Step 4: Initialize Database Schema

Run the following command to create all required tables:

```bash
npm run db:push
```

### Verification

Check that tables were created:

```bash
# Connect to your database and list tables
# You should see: admin_settings, nft_assets, community_messages
```

**Troubleshooting**:
- **Error: "DATABASE_URL must be set"** - Ensure `.env` file exists and DATABASE_URL is set
- **Connection refused** - Check your IP is allowlisted in Neon dashboard (default: allow all)
- **SSL error** - Neon requires SSL, ensure connection string includes `?sslmode=require`

---

## 2. Ethereum RPC Configuration

**Required for**: NFT ownership verification, wallet connection

### Option A: Infura (Recommended)

1. Go to [Infura.io](https://infura.io/)
2. Sign up for free account
3. Click **"Create New API Key"**
4. Select **"Web3 API"** (Ethereum)
5. Enter key name: `kingdao-treasury`
6. Copy your endpoint URL

### Option B: Alchemy

1. Go to [Alchemy.com](https://www.alchemy.com/)
2. Sign up for free account
3. Click **"Create App"**
4. Select **"Ethereum"** → **"Mainnet"**
5. Copy your HTTP endpoint

### Option C: Public RPC (Development Only)

Use free public endpoints (not recommended for production):
```
https://eth.llamarpc.com
https://rpc.ankr.com/eth
```

### Configuration

Add to your `.env` file:

```bash
# Server-side: NFT ownership verification
# Use ETHEREUM_RPC_URL (preferred) or NEXT_PUBLIC_RPC_URL (fallback)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Client-side: Required for wallet connection (must have VITE_ prefix)
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

**Note**: The server will use `ETHEREUM_RPC_URL` first, falling back to `NEXT_PUBLIC_RPC_URL` if not set. For consistency, use `ETHEREUM_RPC_URL` for server-side operations.

### Verification

Test NFT verification:

```bash
curl "http://localhost:5000/api/auth/holdings?address=0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328"
```

Expected response:
```json
{
  "success": true,
  "isHolder": true,
  "address": "0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328"
}
```

---

## 3. Gnosis Safe Integration

**Required for**: Multi-sig wallet balances

### Step 1: Identify Safe Address

1. Go to [Gnosis Safe App](https://app.safe.global/)
2. Connect your wallet
3. Navigate to your DAO's Safe
4. Copy the Safe address from the URL:
   ```
   https://app.safe.global/eth:0x1234...5678/home
                              ^^^^^^^^^^^^^^^^
   ```

### Step 2: Verify Safe on Ethereum Mainnet

Ensure the Safe is on Ethereum mainnet (not testnet or other chains).

### Configuration

Add to your `.env` file:

```bash
SAFE_ADDRESS=0x1234567890123456789012345678901234567890
```

### Verification

Test Safe balance fetching:

```bash
curl http://localhost:5000/api/treasury/overview
```

Check server logs for:
```
✓ Safe balances fetched: 5 tokens
```

**Important**: Even with Safe configured, you may still see mock data for other treasury components (NFTs, DCA wallets) until you configure Dune Analytics or Moralis. Each data source is independent.

**Troubleshooting**:
- **"Not Found" error** - Verify Safe address is correct and on Ethereum mainnet
- **Empty balances** - Safe may have no assets, or address is incorrect
- **Network error** - Check Safe Transaction Service is accessible

---

## 4. Google Sheets Integration

**Required for**: Manual treasury entries

### Step 1: Connect Google Sheets via Replit Connector

**If using Replit:**

1. Go to **Replit Workspace** → **Tools** → **Secrets**
2. Find **"Google Sheets"** integration
3. Click **"Connect"**
4. Authorize with Google account that owns the spreadsheet
5. Replit will auto-populate: `REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY`, `WEB_REPL_RENEWAL`

**If not using Replit:**

You'll need to set up Google OAuth manually:
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Implement OAuth flow (see `server/lib/googleSheets.ts` for implementation)

### Step 2: Create Treasury Spreadsheet

1. Create new Google Sheet
2. Name first sheet: `Sheet1` (or your preferred name)
3. Set up columns:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| Asset    | Amount   | Value USD| Category | Notes    |
| BTC      | 10       | 450000   | Crypto   | Cold storage |
| ETH      | 500      | 1500000  | Crypto   | Main treasury |

4. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/13YzEy6uyDtSKYpxeLn0vodNlPyDBzjKRxe98GsZozFc/edit
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ```

### Step 3: Update Range in Code

Edit `server/lib/googleSheets.ts` if your sheet name is not "Sheet1":

```typescript
const range = 'YourSheetName!A:E';  // Update this line
```

### Configuration

Add to your `.env` file:

```bash
TREASURY_SPREADSHEET_ID=13YzEy6uyDtSKYpxeLn0vodNlPyDBzjKRxe98GsZozFc
```

### Verification

Test sheet data fetching:

```bash
curl http://localhost:5000/api/treasury/overview
```

Check server logs for:
```
✓ Fetched 10 rows from Google Sheets
```

**Troubleshooting**:
- **"Unable to parse range"** - Check sheet name matches code (case-sensitive)
- **Permission denied** - Ensure OAuth account has access to spreadsheet
- **Empty data** - Verify spreadsheet has data in columns A-E

---

## 5. Supabase Setup (Optional - Treasury Caching)

**Required for**: Historical treasury snapshots, performance charts

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New Project"**
3. Enter project details:
   - Name: `kingdao-treasury`
   - Database Password: (generate strong password)
   - Region: (closest to users)
4. Click **"Create new project"**

### Step 2: Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key
   - **service_role** secret key

### Step 3: Create Treasury Snapshots Table

1. Go to **SQL Editor** in Supabase dashboard
2. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS treasury_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_usd_value NUMERIC NOT NULL,
  tokens JSONB NOT NULL DEFAULT '[]'::jsonb,
  nfts JSONB NOT NULL DEFAULT '[]'::jsonb,
  wallets JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_treasury_snapshots_timestamp ON treasury_snapshots(timestamp DESC);
```

**Schema Details**:
- `total_usd_value`: Total treasury value in USD
- `tokens`: Array of token balances with symbol, amount, price data
- `nfts`: Array of NFT holdings with collection, tokenId, floor price
- `wallets`: Array of wallet addresses with chain metadata
- `metadata`: Additional snapshot metadata (optional)

3. Click **"Run"**

### Configuration

Add to your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # REQUIRED for snapshots
```

**Critical**: `SUPABASE_SERVICE_ROLE_KEY` is **required** for treasury snapshots to persist. Without it, the application will log a warning and skip snapshot storage, even if the table exists.

### Verification

Check server logs after restart:
```
✓ Snapshot saved to Supabase
```

Test historical data:
```bash
curl http://localhost:5000/api/treasury/history
```

---

## 6. Dune Analytics Integration (Optional)

**Required for**: NFT floor prices, on-chain analytics

### Step 1: Create Dune Account

1. Go to [Dune Analytics](https://dune.com/)
2. Sign up for free account
3. Verify email address

### Step 2: Get API Key

1. Go to **Settings** → **API**
2. Click **"Create API Key"**
3. Copy the API key

### Step 3: Create Queries

Create three queries for:

1. **Token Prices Query**
   - Returns: `symbol`, `name`, `price`
   - Example query:
     ```sql
     SELECT 
       token_symbol as symbol,
       token_name as name,
       price_usd as price
     FROM prices.usd
     WHERE blockchain = 'ethereum'
       AND minute >= NOW() - INTERVAL '1' HOUR
     ORDER BY minute DESC
     LIMIT 100
     ```

2. **NFT Floor Prices Query**
   - Returns: `collection`, `floor_price`
   - Example for KING NFT:
     ```sql
     SELECT 
       collection,
       floor_price_eth as floor_price
     FROM nft.trades
     WHERE collection = 'Kong'
     GROUP BY collection
     ```

3. **Wallet Balances Query**
   - Returns: `address`, `tokens[]`

Save each query and copy the Query ID from the URL.

### Configuration

Add to your `.env` file:

```bash
DUNE_API_KEY=your-dune-api-key-here
DUNE_TOKEN_PRICES_QUERY_ID=1234567
DUNE_NFT_FLOOR_PRICES_QUERY_ID=2345678
DUNE_WALLET_BALANCES_QUERY_ID=3456789
```

### Verification

Test Dune integration:
```bash
curl http://localhost:5000/api/nfts
```

---

## 7. Discord Integration (Optional)

**Required for**: Community announcements

### Step 1: Create Discord Bot (via Replit Connector)

**If using Replit:**

1. Go to **Replit Workspace** → **Tools** → **Secrets**
2. Find **"Discord"** integration
3. Click **"Connect"**
4. Follow OAuth flow

**If not using Replit:**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Go to **"Bot"** → **"Add Bot"**
4. Copy bot token
5. Enable required intents: Message Content, Guild Messages

### Step 2: Invite Bot to Server

1. Go to **OAuth2** → **URL Generator**
2. Select scopes: `bot`
3. Select permissions: `Read Messages`, `Read Message History`
4. Copy generated URL
5. Open URL and invite bot to your Discord server

### Step 3: Get Guild and Channel IDs

1. Enable Developer Mode in Discord: Settings → Advanced → Developer Mode
2. Right-click server name → **Copy ID** (Guild ID)
3. Right-click announcement channel → **Copy ID** (Channel ID)

### Step 4: Configure Discord Client

Edit `server/lib/discord.ts`:

```typescript
const DISCORD_GUILD_ID = 'your-guild-id';
const DISCORD_CHANNEL_ID = 'your-channel-id';
```

Remove mock data fallback after configuration.

### Verification

Test Discord announcements:
```bash
curl http://localhost:5000/api/discord/announcements
```

---

## 8. Moralis Integration (Optional)

**Required for**: Enhanced NFT metadata, wallet analytics

### Step 1: Create Moralis Account

1. Go to [Moralis Admin](https://admin.moralis.io/)
2. Sign up for free account
3. Verify email

### Step 2: Get API Key

1. Go to **Account Settings** → **API Keys**
2. Copy your Web3 API Key

### Configuration

Add to your `.env` file:

```bash
MORALIS_API_KEY=your-moralis-api-key-here
```

### Usage

Moralis can be used to enhance existing integrations:
- NFT metadata (images, descriptions)
- Wallet token balances
- Transaction history

Implementation is currently stubbed in the codebase.

---

## 9. Snapshot Integration

**Required for**: DAO governance proposals

### Configuration

The Snapshot integration is pre-configured for `kongsdao.eth` space.

To change the space, edit `server/lib/snapshot.ts`:

```typescript
const SNAPSHOT_SPACE = 'your-dao.eth';
```

Or add to `.env`:

```bash
SNAPSHOT_SPACE=your-dao.eth
```

### Verification

Test Snapshot proposals:
```bash
curl http://localhost:5000/api/snapshot/proposals
```

Expected response: Array of active and recent proposals

---

## 10. Admin Panel Configuration

**Required for**: Admin access to management features

### Step 1: Get Your Wallet Address

1. Open MetaMask (or your wallet)
2. Copy your Ethereum address

### Step 2: Add Admin Address

Add to your `.env` file:

```bash
ADMIN_ADDRESSES=0xYourWalletAddress,0xAnotherAdminAddress
```

**Format Requirements**:
- Lowercase addresses
- Comma-separated for multiple admins
- No spaces

### Step 3: Test Admin Access

1. Start the application
2. Connect wallet at `/admin`
3. Sign the authentication message
4. Verify access granted

### Verification

Admin panel should show:
- NFT asset management
- Wallet balance overrides  
- CSV/PDF export functionality

---

## Complete .env File Example

```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Ethereum RPC (Required)
# Server-side
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
# Client-side
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Treasury
SAFE_ADDRESS=0x1234567890123456789012345678901234567890
TREASURY_SPREADSHEET_ID=13YzEy6uyDtSKYpxeLn0vodNlPyDBzjKRxe98GsZozFc

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Dune Analytics
DUNE_API_KEY=your-dune-key
DUNE_TOKEN_PRICES_QUERY_ID=1234567
DUNE_NFT_FLOOR_PRICES_QUERY_ID=2345678
DUNE_WALLET_BALANCES_QUERY_ID=3456789

# Moralis
MORALIS_API_KEY=your-moralis-key

# Admin
ADMIN_ADDRESSES=0xabc...,0xdef...

# Optional
SNAPSHOT_INTERVAL=900000
PORT=5000
NODE_ENV=development
```

---

## Testing Your Setup

### 1. Start the Application

```bash
npm run dev
```

### 2. Test Public Endpoints

```bash
# Health check
curl http://localhost:5000/

# Treasury overview
curl http://localhost:5000/api/treasury/overview

# NFT holdings
curl http://localhost:5000/api/nfts

# Snapshot proposals
curl http://localhost:5000/api/snapshot/proposals

# Discord announcements
curl http://localhost:5000/api/discord/announcements
```

### 3. Test Token Gating

1. Visit `http://localhost:5000`
2. Connect wallet (must hold Kong NFT)
3. Verify access to dashboard

### 4. Test Admin Features

1. Visit `http://localhost:5000/admin`
2. Connect admin wallet
3. Sign authentication message
4. Verify admin panel access

### 5. Test Community Chat

1. Visit `http://localhost:5000/community`
2. Connect wallet (Kong holder)
3. Post a message
4. Verify 30-second rate limiting
5. Check real-time updates (open in two browsers)

---

## Common Issues & Solutions

### Database Connection Errors

**Issue**: `ENOTFOUND` or connection refused

**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure SSL mode is enabled for Neon

### NFT Verification Fails

**Issue**: All wallets shown as non-holders

**Solution**:
- Check `ETHEREUM_RPC_URL` is set
- Verify RPC endpoint is working (try in browser)
- Ensure Kong NFT contract address is correct in `shared/constants.ts`

### Gnosis Safe "Not Found"

**Issue**: Safe API returns 404

**Solution**:
- Verify `SAFE_ADDRESS` is correct
- Ensure Safe is on Ethereum mainnet (not testnet)
- Check Safe Transaction Service URL is correct

### Google Sheets Permission Error

**Issue**: "Permission denied" when fetching sheet

**Solution**:
- Verify OAuth account has access to spreadsheet
- Share spreadsheet with service account
- Re-authorize Replit connector

### Supabase Connection Failed

**Issue**: Unable to connect to Supabase

**Solution**:
- Verify project URL and API keys
- Check table exists (run SQL from Step 3)
- Ensure service role key is used server-side

### Admin Panel Access Denied

**Issue**: Cannot access /admin after wallet signature

**Solution**:
- Ensure wallet address is in `ADMIN_ADDRESSES`
- Addresses must be lowercase
- Clear browser cache and retry
- Check server logs for authentication errors

---

## Next Steps

After completing integration:

1. ✅ Review `docs/SECURITY.md` for security best practices
2. ✅ Set up monitoring and alerts
3. ✅ Configure backup strategy for database
4. ✅ Review `docs/DEV_INTEGRATION_ROADMAP.md` for production readiness
5. ✅ Test all features end-to-end
6. ✅ Deploy to production (see Replit Deployments)

---

## Support Resources

- **Replit Docs**: https://docs.replit.com/
- **Neon Docs**: https://neon.tech/docs
- **Gnosis Safe Docs**: https://docs.safe.global/
- **Dune Analytics**: https://docs.dune.com/
- **Supabase Docs**: https://supabase.com/docs
- **Wagmi Docs**: https://wagmi.sh/
- **Discord.js Guide**: https://discordjs.guide/

For project-specific issues, see:
- `replit.md` - Project architecture
- `docs/DEV_INTEGRATION_ROADMAP.md` - Integration roadmap
- `docs/SECURITY.md` - Security guidelines
