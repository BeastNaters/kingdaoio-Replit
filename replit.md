# KingDAO Treasury Dashboard

## Overview

KingDAO Treasury Dashboard is a token-gated Web3 application that provides real-time treasury visibility exclusively for Kong NFT holders. The platform aggregates financial data from multiple sources (Gnosis Safe, Dune Analytics, Google Sheets, on-chain RPC), displays community governance information from Snapshot, and presents Discord announcements—all within a modern, glassmorphic dark-themed interface inspired by leading DeFi platforms like Uniswap and Zapper.

**Core Purpose:** Enable DAO members holding the Kong NFT (ERC721 contract: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328` on Ethereum mainnet) to monitor treasury assets, track portfolio allocation, view NFT holdings (including DAO-owned NFT collections: Rollbots, Sports Rollbots, KING), and engage with community governance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing:**
- React 18+ with TypeScript via Vite bundler
- Client-side routing using Wouter (lightweight alternative to React Router)
- Single-page application (SPA) architecture with component-based structure

**UI Component System:**
- shadcn/ui component library (Radix UI primitives) following the "new-york" style preset
- Tailwind CSS for styling with custom design tokens for Web3 aesthetics
- Design philosophy: Dark glassmorphism with purple/cyan gradients, inspired by modern DeFi platforms
- Custom fonts: Inter (data/numbers), Space Grotesk (headings/accent text)
- Component organization: `/client/src/components/` for reusable components, `/client/src/components/ui/` for base UI primitives

**State Management:**
- TanStack Query (React Query) for server state management and caching
- No global client state library (React context/hooks sufficient for local state)
- Query invalidation and refetching handled through React Query

**Data Visualization:**
- Recharts library for charts (PortfolioChart uses PieChart, PerformanceChart uses AreaChart)
- Responsive container design for mobile/desktop compatibility

### Web3 Integration

**Wallet Connection:**
- Wagmi v2 + Viem for Ethereum interactions (type-safe alternative to ethers.js)
- WalletConnect integration for multi-wallet support
- Injected connector (MetaMask, Rainbow, etc.) as primary connection method
- Configuration targets Ethereum mainnet (chain ID: 1)

**Token Gating Logic:**
- Kong NFT contract verification happens client-side via wagmi's `useReadContract` hook
- Contract: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328`
- Uses ERC721 `balanceOf` function to check ownership
- `ProtectedRoute` component wraps authenticated pages, redirecting non-holders to `TokenGated` component
- Server-side verification endpoint `/api/auth/holdings` provides additional validation layer

**Why this approach:**
- Client-side checks provide instant feedback without server round-trips
- Server-side verification adds security for sensitive operations
- Wagmi/Viem chosen over ethers.js for better TypeScript support and modern API design

### Backend Architecture

**Server Framework:**
- Express.js REST API running on Node.js
- TypeScript for type safety across frontend/backend boundary
- Route handlers in `/server/routes.ts` following RESTful conventions
- Development: Vite middleware for HMR; Production: Pre-built static assets served by Express

**API Design:**
- Route structure: `/api/{domain}/{action}` (e.g., `/api/treasury/snapshots`, `/api/auth/holdings`)
- JSON request/response format
- Error handling with appropriate HTTP status codes
- Logging middleware tracks API response times and payloads

**External Service Integration:**
The backend acts as a proxy/aggregator for multiple external services to avoid CORS issues and centralize authentication:

1. **Gnosis Safe API** (`/server/lib/safe.ts`):
   - Fetches multi-sig wallet balances via Safe Transaction Service API
   - Returns normalized token balance data with USD valuations

2. **Dune Analytics** (`/server/lib/dune.ts`):
   - Queries blockchain analytics data (token prices, NFT floor prices, wallet balances)
   - Uses Dune API v1 with parameterized query IDs
   - Fallback mock data when API unavailable

3. **Google Sheets** (`/server/lib/googleSheets.ts`):
   - Reads manual treasury entries from configured spreadsheet
   - Uses Replit Connectors pattern for OAuth authentication
   - googleapis library for Sheets API v4 access

4. **Snapshot Hub** (`/server/lib/snapshot.ts`):
   - GraphQL queries to Snapshot's governance platform
   - Fetches proposals for `kongsdao.eth` space
   - No authentication required (public data)

5. **Discord** (`/server/lib/discord.ts`):
   - Discord.js client for fetching announcements
   - Uses Replit Connectors for bot token management
   - Requires guild/channel configuration

6. **Supabase** (`/server/lib/supabase.ts`):
   - PostgreSQL-backed cache for treasury snapshots
   - Client-server architecture with service role key for backend
   - Used for historical data persistence and reducing external API calls

**Why proxy architecture:**
- Centralizes API key management (keeps secrets server-side)
- Provides data transformation/normalization layer
- Enables caching strategies to reduce external API costs
- Avoids browser CORS limitations

### Database & Caching

**Primary Database:**
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database operations
- Schema defined in `/shared/schema.ts` (currently minimal: users table)
- Migration-based schema evolution via `drizzle-kit`

**Caching Layer:**
- Supabase provides additional PostgreSQL instance for treasury snapshots
- React Query on frontend provides automatic request deduplication and background refetching
- Server could implement in-memory caching (not currently present)

**Storage Pattern:**
- In-memory storage implementation (`MemStorage` in `/server/storage.ts`) for development
- Placeholder for future database-backed storage
- User authentication schema exists but auth flow not fully implemented

### Authentication & Authorization

**Current State:**
- Token-gating is the primary access control mechanism
- NFT ownership verified via blockchain read (client + server)
- No traditional username/password authentication active
- Session management infrastructure present but unused

**Design Decision:**
- Web3-native authentication model: wallet signature proves identity
- Kong NFT ownership = authorization ticket
- Future enhancement: Sign-in with Ethereum (SIWE) for persistent sessions

### External Dependencies

**Development Tools:**
- Vite for fast development builds and HMR
- Replit-specific plugins for error overlay, dev banner, cartographer
- TypeScript compiler for type checking (`tsc` in check script)

**Production Build:**
- Vite builds client to `/dist/public`
- esbuild bundles server to `/dist/index.js`
- Static asset serving in production mode

**Key Third-Party Services:**
- **Ethereum RPC:** Mainnet access via configurable RPC URL (Infura, LlamaRPC, Alchemy, etc.)
- **Dune Analytics:** Blockchain data aggregation and custom queries
- **Gnosis Safe Transaction Service:** Multi-sig wallet balance tracking
- **Google Sheets API:** Manual/off-chain treasury data entry
- **Snapshot GraphQL API:** DAO governance proposal tracking
- **Discord API:** Community announcement feed
- **Supabase:** PostgreSQL database and cache
- **Replit Connectors:** OAuth/authentication management for Google Sheets and Discord

**Package Highlights:**
- `wagmi` + `viem`: Web3 wallet integration
- `@tanstack/react-query`: Server state management
- `recharts`: Data visualization
- `drizzle-orm`: Type-safe database queries
- `discord.js`: Discord bot client
- `@supabase/supabase-js`: Supabase client SDK
- `wouter`: Lightweight routing
- `@radix-ui/*`: Unstyled accessible UI primitives
- `tailwindcss`: Utility-first CSS framework
- `zod`: Schema validation (used with Drizzle)

**Environment Variables Required:**
- `DATABASE_URL`: PostgreSQL connection string for Drizzle
- `ETHEREUM_RPC_URL` / `NEXT_PUBLIC_RPC_URL`: Ethereum mainnet RPC endpoint
- `DUNE_API_KEY`: Dune Analytics authentication
- `SAFE_ADDRESS`: Gnosis Safe wallet address to monitor
- `SNAPSHOT_SPACE`: Snapshot DAO space identifier (default: `kongsdao.eth`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase admin key for server operations
- `REPLIT_CONNECTORS_HOSTNAME`: Replit-specific connector service
- `REPL_IDENTITY` / `WEB_REPL_RENEWAL`: Replit authentication tokens

**Design Rationale for Service Choices:**
- Dune Analytics chosen for complex blockchain queries without running own indexer
- Gnosis Safe for established multi-sig treasury standard in DAOs
- Snapshot as de facto DAO governance platform
- Supabase provides managed PostgreSQL with real-time capabilities for future enhancement
- Replit Connectors simplify OAuth flows in hosted environment

## Recent Features (November 2025)

### Dashboard Restructuring with Tabbed Interface

The Treasury Dashboard has been restructured to organize assets into distinct categories with a tabbed interface:

**Dashboard Layout:**
1. **Top Section (Preserved):**
   - Total Treasury Value
   - Wallet Count
   - NFT Holdings
   - Export functionality

2. **Tabbed Categories:**
   - **NFT Collections:** DAO-owned NFT collections with detailed token information
   - **Crypto:** Token holdings with portfolio distribution and performance charts
   - **Multi-Sig:** Gnosis Safe wallet balances (stub - integration pending)
   - **DAO Wallets:** Primary DAO-controlled wallets (stub - integration pending)
   - **Tactical:** Short-term operational wallets (stub - integration pending)

### NFT Collections Feature

**Implementation Location:** `client/src/components/tabs/NftCollectionsTab.tsx`

**Data Source:** `shared/daoNfts.ts` - Hardcoded collection data (future: load from Supabase or on-chain)

**DAO-Owned Collections:**
1. **Rollbots** (77 NFTs)
   - Contract: `0x2f102e69cbce4938cf7fb27adb40fad097a13668`
   - Links: OpenSea, Etherscan

2. **Sports Rollbots** (26 NFTs)
   - Contract: `0x1de7abda2d73a01aa8dca505bdcb773841211daf`
   - Links: Etherscan

3. **KING** (5 NFTs)
   - Contract: `0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328` (same as Kong NFT for token-gating)
   - Links: Etherscan

**Features:**
- Collection cards showing name, description, contract address, owned count
- Copy-to-clipboard functionality for contract addresses
- Expandable token ID lists showing all owned tokens
- OpenSea/Etherscan external links
- Total NFT count: 108 tokens across 3 collections
- Placeholder for floor price API integration (Dune Analytics)

**Future Integrations:**
- Connect to Dune Analytics for NFT floor prices (`/api/dune/nft-floors`)
- Load collection metadata from Supabase instead of hardcoding
- Fetch real-time NFT metadata via Moralis API
- Get collection stats from OpenSea API

### Crypto Tab (Enhanced)

**Implementation Location:** `client/src/components/tabs/CryptoTab.tsx`

**Features:**
- Total Crypto Holdings calculated from token balances
- Portfolio Chart (pie chart showing token distribution)
- DataTable showing top 10 token holdings
- Performance Chart tracking historical treasury value over time
- Loading states with skeleton components

**Data Sources:**
- `snapshot.tokens` for current holdings
- `historicalSnapshots` for performance trends
- Aggregates data from Safe, DAO wallets, and tactical wallets

### Technical Details

**Component Architecture:**
- Modular tab components in `/client/src/components/tabs/`
- Each tab receives props from Dashboard parent component
- Consistent layout pattern across all tabs
- Integration notes using Lightbulb icons (no emojis per design guidelines)

**Design System Compliance:**
- No emojis used (replaced with Lucide React icons)
- Proper button sizing (`size="icon"` for icon-only buttons)
- Comprehensive `data-testid` attributes for e2e testing
- Consistent card layouts with glassmorphic styling

**Data Flow:**
- Dashboard fetches `snapshot` and `historicalSnapshots` via React Query
- Props passed to CryptoTab for Portfolio/Performance charts
- NFT Collections tab uses static data from `shared/daoNfts.ts`
- Stub tabs show placeholder content with integration notes