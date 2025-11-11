# KingDAO Treasury Dashboard - Development Integration Roadmap

## Overview

This document provides a comprehensive roadmap for integrating all external services and data sources into the KingDAO Treasury Dashboard. It outlines the current status, configuration requirements, and step-by-step integration process.

## Current Status

### ✅ Completed Integrations

1. **Authentication & Authorization**
   - Token-gating via Kong NFT ownership verification
   - Server-side admin authentication with wallet signature verification
   - Protected routes for holder-only content

2. **Database**
   - PostgreSQL via Neon serverless driver
   - Drizzle ORM with type-safe operations
   - Community messages table with rate limiting

3. **Web3 Infrastructure**
   - Wagmi v2 for wallet connection
   - Viem for type-safe Ethereum interactions
   - WalletConnect and injected wallet support

4. **Real-time Communication**
   - Socket.IO for community chat
   - Real-time treasury updates

### 🚧 Partially Configured

1. **Supabase**
   - Connection established
   - Missing `treasury_snapshots` table
   - Requires manual table creation

2. **Google Sheets**
   - OAuth configured via Replit connector
   - Incorrect sheet range (Treasury!A:E)
   - Needs correct range configuration

3. **Gnosis Safe API**
   - Integration code implemented
   - Missing wallet addresses configuration
   - Returns "Not Found" errors

4. **Discord API**
   - OAuth configured via Replit connector
   - Currently returning mock data
   - Needs channel/guild configuration

### ⏳ Not Started

1. **Dune Analytics**
   - API key available (DUNE_API_KEY)
   - Integration code implemented
   - Needs query ID configuration

2. **Snapshot Hub**
   - Integration code implemented
   - Hardcoded to 'kongsdao.eth'
   - May need additional configuration

3. **Moralis API**
   - API key available (MORALIS_API_KEY)
   - Not yet utilized
   - Potential for NFT metadata and wallet balances

## Configuration Issues to Resolve

### 1. Supabase Treasury Snapshots Table

**Issue**: Table `treasury_snapshots` does not exist in Supabase database

**Resolution Steps**:
1. Access Supabase dashboard
2. Navigate to SQL Editor
3. Create table with the following schema:
   ```sql
   CREATE TABLE IF NOT EXISTS treasury_snapshots (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     total_value DECIMAL(20, 2) NOT NULL,
     snapshot_data JSONB NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE INDEX idx_treasury_snapshots_timestamp ON treasury_snapshots(timestamp DESC);
   ```

**Verification**:
- Check server logs for successful snapshot upsert
- Query `/api/treasury/history` endpoint

### 2. Google Sheets Configuration

**Issue**: Unable to parse range `Treasury!A:E`

**Resolution Steps**:
1. Open the spreadsheet with ID `13YzEy6uyDtSKYpxeLn0vodNlPyDBzjKRxe98GsZozFc`
2. Verify sheet name (case-sensitive)
3. Update range in `server/lib/googleSheets.ts` if needed:
   - Correct format: `SheetName!A:E` (e.g., `Sheet1!A:E`)
   - Or remove sheet name: `A:E`

**Expected Data Format**:
| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| Asset    | Amount   | Value USD| Category | Notes    |

**Verification**:
- Check server logs for successful sheet fetch
- Query `/api/treasury/sheet-data` endpoint

### 3. Gnosis Safe Wallet Address

**Issue**: Safe API returns "Not Found" - missing or incorrect wallet address

**Resolution Steps**:
1. Identify the DAO's primary Gnosis Safe wallet address
2. Add to environment variable:
   ```
   SAFE_ADDRESS=0x...
   ```
3. Verify the address is correct and on Ethereum mainnet
4. Restart the application to apply changes

**Note**: Current implementation supports a single Safe address. To support multiple Safe wallets:
1. Update `SAFE_ADDRESS` to `SAFE_ADDRESSES` (comma-separated)
2. Modify `server/lib/safe.ts` to loop through addresses
3. Aggregate balances from all wallets

**Verification**:
- Check server logs for successful Safe balance fetch
- Verify multi-sig wallet data in dashboard

### 4. Discord Integration

**Issue**: Returns mock data instead of real announcements

**Resolution Steps**:
1. Verify Discord OAuth is properly configured
2. Identify Discord guild (server) ID
3. Identify announcement channel ID(s)
4. Update `server/lib/discord.ts`:
   - Remove mock data fallback
   - Configure guild and channel IDs
   - Set message fetch limit

**Verification**:
- Check server logs for successful Discord API calls
- Verify real announcements appear in Community page

## Integration Roadmap

### Phase 1: Core Treasury Data (Priority: High)

**Objective**: Display accurate treasury holdings and portfolio distribution

#### 1.1 Configure Gnosis Safe API
- [ ] Obtain the DAO's primary Gnosis Safe wallet address
- [ ] Add address to `SAFE_ADDRESS` environment variable
- [ ] Test balance fetching
- [ ] Verify data displays correctly in Multi-Sig Wallets tab
- [ ] (Optional) Extend to support multiple Safe addresses

#### 1.2 Set Up Supabase Caching
- [ ] Create `treasury_snapshots` table in Supabase
- [ ] Test snapshot generation and storage
- [ ] Verify historical data retrieval
- [ ] Confirm chart displays on Dashboard

#### 1.3 Configure Google Sheets
- [ ] Verify sheet structure and range
- [ ] Update range in googleSheets.ts if needed
- [ ] Test data fetching
- [ ] Verify manual entries display in dashboard

**Expected Outcome**: Dashboard displays real treasury data from Safe wallets and Google Sheets

### Phase 2: NFT & On-Chain Data (Priority: Medium)

**Objective**: Display DAO-owned NFTs and real-time on-chain balances

#### 2.1 Configure Dune Analytics
- [ ] Create Dune query for NFT floor prices
- [ ] Add query ID to configuration
- [ ] Test API call with DUNE_API_KEY
- [ ] Verify floor prices update in NFTs tab

#### 2.2 Implement Moralis Integration
- [ ] Set up Moralis API endpoints
- [ ] Fetch NFT metadata for DAO wallets
- [ ] Retrieve token balances for DAO wallets
- [ ] Display data in appropriate tabs

#### 2.3 RPC Integration
- [ ] Verify RPC URL configuration (NEXT_PUBLIC_RPC_URL)
- [ ] Test balance queries for tactical wallets
- [ ] Implement fallback RPC if needed

**Expected Outcome**: Real NFT holdings and on-chain balances displayed

### Phase 3: Community Features (Priority: Medium)

**Objective**: Connect live governance and announcements

#### 3.1 Configure Discord API
- [ ] Set guild and channel IDs
- [ ] Remove mock data fallback
- [ ] Test announcement fetching
- [ ] Implement error handling for missing permissions

#### 3.2 Verify Snapshot Integration
- [ ] Confirm 'kongsdao.eth' space name
- [ ] Test proposal fetching
- [ ] Verify data displays in Community tab

**Expected Outcome**: Live Discord announcements and Snapshot proposals

### Phase 4: Admin & Export Features (Priority: Low)

**Objective**: Enable admin data management and reporting

#### 4.1 Test Admin Panel
- [ ] Verify admin wallet address is configured
- [ ] Test signature authentication flow
- [ ] Test NFT asset management
- [ ] Verify wallet balance overrides

#### 4.2 Test Export Functionality
- [ ] Generate CSV export
- [ ] Generate PDF report
- [ ] Verify data accuracy
- [ ] Test download functionality

**Expected Outcome**: Fully functional admin panel and export features

## Environment Variables Checklist

Create a `.env` file with the following variables (see `.env.example`):

### Required
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Express session secret
- `SAFE_ADDRESS` - Primary Gnosis Safe wallet address
- `TREASURY_SPREADSHEET_ID` - Google Sheets ID

### API Keys
- `DUNE_API_KEY` - Dune Analytics API key
- `MORALIS_API_KEY` - Moralis API key
- `NEXT_PUBLIC_RPC_URL` - Ethereum RPC endpoint

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `ADMIN_ADDRESSES` - Comma-separated admin wallet addresses

## Testing & Validation

### Automated Tests

Run the following tests after each integration:

```bash
# Test database connectivity
npm run db:push

# Test API endpoints
curl http://localhost:5000/api/treasury/overview
curl http://localhost:5000/api/nfts
curl http://localhost:5000/api/snapshot/proposals
curl http://localhost:5000/api/discord/announcements
```

### Manual Verification

1. **Dashboard Tab**
   - [ ] Total treasury value displays correctly
   - [ ] Portfolio chart shows distribution
   - [ ] Performance chart shows historical data
   - [ ] Multi-sig, DAO, and Tactical wallet tabs load

2. **NFTs Tab**
   - [ ] NFT collections display with metadata
   - [ ] Floor prices update correctly
   - [ ] Token IDs and links work

3. **Community Tab**
   - [ ] Snapshot proposals load
   - [ ] Discord announcements display
   - [ ] Community chat works (posting, rate limiting)

4. **Admin Panel** (admin only)
   - [ ] Authentication flow works
   - [ ] NFT asset management functions
   - [ ] Wallet balance overrides work
   - [ ] CSV/PDF export generates correctly

## Migration from Mock Data to Live Data

### Current Mock Data Locations

The following files contain mock data that should be replaced with live API calls:

1. `shared/mockData.ts` - All wallet balances and NFT data
2. `server/lib/discord.ts` - Mock announcements
3. `client/src/pages/Dashboard.tsx` - Mock portfolio/performance data

### Migration Strategy

1. **Incremental Replacement**
   - Replace one data source at a time
   - Keep mock data as fallback during development
   - Test each integration thoroughly before removing mocks

2. **Feature Flags** (Optional)
   - Add environment variable `USE_MOCK_DATA=true/false`
   - Allow switching between mock and live data
   - Useful for development and testing

3. **Error Handling**
   - Implement graceful degradation if API fails
   - Show loading states and error messages
   - Log errors for debugging

## Post-Integration Checklist

- [ ] All API endpoints return real data
- [ ] Mock data removed or disabled
- [ ] Error handling tested for all integrations
- [ ] Loading states work correctly
- [ ] Data refreshes on configured intervals
- [ ] Performance is acceptable (no excessive API calls)
- [ ] Security: No API keys exposed in frontend
- [ ] Documentation updated (README, integration guides)
- [ ] Environment variables documented

## Known Issues & Workarounds

### Issue: Supabase exec_sql Function Not Found

**Symptom**: `Could not find the function public.exec_sql(sql) in the schema cache`

**Workaround**: Create tables manually via SQL Editor instead of using stored procedures

### Issue: Safe API "Not Found"

**Symptom**: `Safe API error: Not Found`

**Workaround**: Verify wallet addresses are correct and on supported networks

### Issue: Google Sheets Range Parse Error

**Symptom**: `Unable to parse range: Treasury!A:E`

**Workaround**: Update sheet name or use simpler range format (e.g., `A:E`)

## Support & Resources

### External Documentation
- [Gnosis Safe API](https://docs.safe.global/safe-core-api/available-services)
- [Dune Analytics API](https://docs.dune.com/api-reference/overview/introduction)
- [Moralis API](https://docs.moralis.io/)
- [Snapshot GraphQL](https://docs.snapshot.org/graphql-api)
- [Discord API](https://discord.com/developers/docs/intro)
- [Supabase](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

### Internal Documentation
- See `docs/INTEGRATION_GUIDE.md` for detailed integration instructions
- See `docs/SECURITY.md` for security best practices
- See `replit.md` for project overview and architecture

## Maintenance

### Regular Tasks
- Monitor API rate limits
- Update Snapshot proposals (auto-fetch)
- Verify treasury snapshot generation (15-minute intervals)
- Check Discord announcements (auto-fetch)
- Update NFT floor prices (daily)

### Quarterly Reviews
- Review API key usage and costs
- Audit data accuracy
- Update integration documentation
- Review and optimize caching strategies
