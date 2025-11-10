# KingDAO Treasury Dashboard

A token-gated Web3 application for Kong NFT holders to monitor DAO treasury assets, track portfolio allocation, view NFT holdings, and engage with community governance.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ or v20+ recommended
- **PostgreSQL**: Database for treasury snapshots and settings
- **Kong NFT**: Users must hold the Kong NFT (contract: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328`) to access protected pages

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section)

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📋 Environment Variables

### Required Variables

#### Database
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
**Where to get it**: Replit Database, [Neon](https://neon.tech), [Supabase](https://supabase.com), or any PostgreSQL provider

#### Ethereum RPC
```bash
ETHEREUM_RPC_URL=https://eth.llamarpc.com
VITE_ETHEREUM_RPC_URL=https://eth.llamarpc.com
```
**Where to get it**: [Infura](https://infura.io), [Alchemy](https://alchemy.com), or use free public endpoints like LlamaRPC

#### Supabase (for historical data caching)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
**Where to get it**: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

⚠️ **CRITICAL**: You must manually create these tables in Supabase (see Database Schema section)

#### Moralis (for NFT data)
```bash
MORALIS_API_KEY=your-moralis-api-key
```
**Where to get it**: [Moralis Admin Panel](https://admin.moralis.io/settings/api-keys)

#### Admin Addresses
```bash
ADMIN_ADDRESSES=0x1234...,0x5678...
VITE_ADMIN_ADDRESSES=0x1234...,0x5678...
```
**What it is**: Comma-separated Ethereum addresses that can access the admin panel

### Optional Variables

#### Dune Analytics (returns mock data if not configured)
```bash
DUNE_API_KEY=your-dune-api-key
DUNE_TOKEN_PRICES_QUERY_ID=12345
DUNE_NFT_FLOOR_PRICES_QUERY_ID=67890
DUNE_WALLET_BALANCES_QUERY_ID=24680
```
**Where to get it**: [Dune Settings](https://dune.com/settings/api)

**Query Requirements**:
- **Token Prices**: Must return `symbol`, `name`, `price`
- **NFT Floors**: Must return `collection`, `floor_price`
- **Wallet Balances**: Must return `address`, `tokens` (array)

#### Gnosis Safe (returns empty array if not configured)
```bash
SAFE_ADDRESS=0x...
SAFE_TX_SERVICE_URL=https://safe-transaction-mainnet.safe.global
```
**What it is**: Your multi-sig treasury wallet address on Ethereum mainnet

#### Google Sheets (uses Replit Connectors)
```bash
TREASURY_SPREADSHEET_ID=your-spreadsheet-id
```
**Setup**: 
1. In Replit, use the "Connect" button to add Google Sheets integration
2. The Replit Connectors will automatically handle OAuth
3. Share your spreadsheet with the connected Google account
4. Expected sheet name: `Treasury` with columns: Date, Description, Category, AmountUSD, Source

#### Snapshot
```bash
SNAPSHOT_SPACE=kongsdao.eth
```
**What it is**: Your Snapshot governance space (defaults to `kongsdao.eth`)

#### Discord (uses Replit Connectors)
**Setup**:
1. In Replit, use the "Connect" button to add Discord integration
2. Configure guild ID and channel ID in the Admin panel after first login
3. Connector handles authentication automatically

## 🗄️ Database Schema

### Drizzle (Local PostgreSQL)

The main database uses Drizzle ORM with these tables:

```typescript
// users table
id: varchar (UUID, primary key)
username: text (unique, not null)
password: text (not null)

// admin_settings table
id: varchar (UUID, primary key)
key: text (unique, not null)
value: jsonb (not null)
updated_at: timestamp (not null, default now())

// treasury_snapshots table
id: varchar (UUID, primary key)
timestamp: timestamp (not null, default now(), indexed)
total_usd_value: real (not null)
tokens: jsonb (not null)
nfts: jsonb (not null)
wallets: jsonb (not null)
metadata: jsonb (nullable)

// nft_assets table
id: varchar (UUID, primary key)
contract_address: text (not null)
token_id: text (not null)
collection: text (not null)
image: text (nullable)
floor_price: real (nullable)
estimated_value_usd: real (nullable)
last_updated: timestamp (not null, default now())
UNIQUE(contract_address, token_id)
```

**To push schema**:
```bash
npm run db:push
```

### Supabase Tables (Must Create Manually)

⚠️ **IMPORTANT**: You must manually create this table in your Supabase project:

**Table: `treasury_snapshots`**

```sql
CREATE TABLE treasury_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_usd_value NUMERIC NOT NULL,
  tokens JSONB NOT NULL,
  nfts JSONB NOT NULL,
  wallets JSONB NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_treasury_snapshots_timestamp ON treasury_snapshots(timestamp);
```

**Why Supabase?** The app uses Supabase for historical treasury snapshot caching to reduce external API calls and enable time-series analysis.

## 🏗️ Architecture

### Framework
- **Backend**: Express.js (REST API)
- **Frontend**: React 18 + Vite
- **Routing**: Wouter (client-side)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL + Drizzle ORM

### Web3 Stack
- **Wallet Connection**: wagmi v2 + viem
- **NFT Contract**: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328` (Kong NFT)
- **Token Gating**: ERC721 `balanceOf` check on Ethereum mainnet

### External Services
- **Gnosis Safe API**: Multi-sig wallet balances
- **Dune Analytics**: Blockchain data queries
- **Google Sheets API**: Manual treasury entries
- **Snapshot GraphQL**: DAO governance proposals
- **Discord API**: Community announcements
- **Moralis API**: NFT metadata and floor prices
- **Supabase**: Historical data persistence

## 📁 Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Dashboard, NFTs, Community, Admin)
│   │   ├── lib/           # Frontend utilities (wagmi, query client)
│   │   └── App.tsx        # Main app with routing
├── server/                # Backend Express server
│   ├── lib/               # Service integrations (Dune, Safe, Supabase, etc.)
│   ├── middleware/        # Auth middleware
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle schema definitions
└── package.json
```

## 🔐 Security Notes

### NEVER Commit These to Git

- `.env` files
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `DUNE_API_KEY`
- `MORALIS_API_KEY`
- `GOOGLE_PRIVATE_KEY`
- Database credentials

The `.gitignore` is configured to exclude all sensitive files.

### Token Gating

- **Kong NFT Contract**: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328`
- **Verification**: Client-side (wagmi) + Server-side (`/api/auth/holdings`)
- **Protected Routes**: `/dashboard`, `/nfts`, `/community`
- **Admin Routes**: `/admin` (requires wallet signature + address in `ADMIN_ADDRESSES`)

## 🚀 Deployment

### Build for Production

```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Ensure PostgreSQL database is accessible
4. Run `npm run db:push` to sync schema
5. Manually create Supabase tables (see Database Schema section)

### Port Configuration

- Default port: `5000`
- Override with `PORT` environment variable
- Frontend and backend served on same port in production

## 📊 Data Sources & Fallback Behavior

| Service | Behavior if Not Configured | Impact |
|---------|---------------------------|--------|
| Dune Analytics | Returns mock data | Token prices, NFT floors shown as placeholders |
| Gnosis Safe | Returns empty array | No Safe wallet balances displayed |
| Google Sheets | Throws error | Manual treasury entries unavailable |
| Discord | Returns mock announcements | Shows placeholder announcements |
| Moralis | Throws error, uses cache | NFT grid empty or shows cached data |
| Supabase | Logs warning, continues | No historical data or caching |

## 🧪 Testing

Run end-to-end tests with Playwright (test plan based testing):

```bash
# Tests are run via the run_test tool during development
```

## 📝 Known Limitations & TODOs

### Current State
✅ All core features implemented:
- NFT token gating with wallet connection
- Multi-source treasury data aggregation
- Historical performance tracking with charts
- Real-time WebSocket updates
- Snapshot voting interface
- Discord announcements integration
- Admin panel with wallet authentication
- CSV/PDF export functionality

### Future Enhancements
- [ ] Add unit tests for backend services
- [ ] Implement traditional username/password auth alongside Web3
- [ ] Add more granular permission system for admin panel
- [ ] Support multiple chains (currently Ethereum mainnet only)
- [ ] Add data export scheduling (daily/weekly automated reports)

## 🤝 Contributing

This is a private DAO treasury dashboard. For questions or issues, contact the KingDAO team.

## 📄 License

MIT

---

## 🎯 Give This to Your Dev Team

### Setup Checklist

- [ ] **Install Node.js 18+**
- [ ] **Clone repository**: `git clone <your-repo-url>`
- [ ] **Install dependencies**: `npm install`
- [ ] **Copy environment template**: `cp .env.example .env`
- [ ] **Fill in required env vars** (see Environment Variables section)
- [ ] **Push database schema**: `npm run db:push`
- [ ] **Manually create Supabase tables** (see Database Schema → Supabase section)
- [ ] **Start dev server**: `npm run dev`
- [ ] **Open browser**: `http://localhost:5000`

### External Services Setup

1. **Supabase**:
   - Create project at https://supabase.com
   - Get `NEXT_PUBLIC_SUPABASE_URL` and keys from Settings → API
   - **Manually run the SQL** in the "Supabase Tables" section above
   
2. **Moralis**:
   - Sign up at https://moralis.io
   - Get API key from Settings → API Keys
   - Required for NFT holdings display

3. **Ethereum RPC** (choose one):
   - Free tier at Infura or Alchemy
   - Or use public endpoint: `https://eth.llamarpc.com`

4. **Dune Analytics** (optional):
   - Create account at https://dune.com
   - Create 3 queries (token prices, NFT floors, wallet balances)
   - Get API key and query IDs

5. **Gnosis Safe** (optional):
   - Get your Safe address from https://app.safe.global
   - Use default transaction service URL

6. **Google Sheets** (optional):
   - If on Replit: Use "Connect" button for Google Sheets integration
   - If self-hosted: Set up service account, download JSON key, share sheet
   - Create sheet named "Treasury" with columns: Date, Description, Category, AmountUSD, Source

7. **Discord** (optional):
   - If on Replit: Use "Connect" button for Discord integration
   - If self-hosted: Create Discord bot, get token
   - Configure guild/channel IDs in admin panel

### Verification Steps

1. **Wallet Connection**: Connect MetaMask, verify it doesn't error
2. **NFT Gating**: Try accessing `/dashboard` without Kong NFT (should show "You need to hold a Kong NFT")
3. **Data Loading**: Check dashboard shows treasury values (may be mock data if services not configured)
4. **Admin Panel**: Add your address to `ADMIN_ADDRESSES`, sign message, verify access to `/admin`
5. **Export**: Try CSV/PDF export from dashboard

### Common Issues

**"ETHEREUM_RPC_URL not configured"**: Add `ETHEREUM_RPC_URL` or `VITE_ETHEREUM_RPC_URL` to `.env`

**"Supabase not configured"**: Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

**"Google Sheet not connected"**: In Replit, use the integrations panel. Self-hosted requires service account setup.

**Dashboard shows mock data**: This is expected if Dune/Safe/Sheets aren't configured. Check console for warnings.

**Port 5000 already in use**: Change `PORT=5001` in `.env`

---

**Built with ❤️ for KingDAO**
