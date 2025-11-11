# KingDAO Treasury Dashboard - Security Guidelines

## Overview

This document outlines security best practices, threat models, and mitigation strategies for the KingDAO Treasury Dashboard. Following these guidelines is essential for protecting sensitive treasury data, user privacy, and admin access.

## Table of Contents

1. [Threat Model](#threat-model)
2. [Environment Variables & Secrets](#environment-variables--secrets)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database Security](#database-security)
5. [API Security](#api-security)
6. [Rate Limiting](#rate-limiting)
7. [Input Validation](#input-validation)
8. [Error Handling](#error-handling)
9. [Deployment Security](#deployment-security)
10. [Monitoring & Incident Response](#monitoring--incident-response)

---

## Threat Model

### Assets to Protect

1. **Treasury Data**: Wallet addresses, token balances, NFT holdings
2. **User Data**: Wallet addresses, Kong NFT ownership status
3. **Admin Access**: Management capabilities, data export, wallet overrides
4. **API Keys**: Gnosis Safe, Dune, Moralis, Supabase, Discord, Google Sheets
5. **Community Messages**: User-generated content, rate limiting enforcement

### Threat Actors

1. **Unauthorized Users**: Non-Kong holders attempting to access protected data
2. **Malicious Admins**: Compromised admin wallets attempting unauthorized changes
3. **Spammers**: Attempting to flood community chat despite rate limits
4. **API Abusers**: Excessive requests to drain rate limits or DoS the service
5. **Data Scrapers**: Automated bots attempting to extract treasury data

### Attack Vectors

1. Wallet signature spoofing or replay attacks
2. SQL injection through user inputs
3. API key exposure in frontend bundle
4. Rate limit bypass through concurrent requests
5. Admin impersonation via wallet address spoofing
6. Cross-Site Scripting (XSS) in community messages
7. Server-Side Request Forgery (SSRF) through URL inputs

---

## Environment Variables & Secrets

### Critical Secrets (NEVER Commit to Git)

These secrets must NEVER be committed to version control:

```bash
DATABASE_URL               # PostgreSQL connection string with credentials
SUPABASE_SERVICE_ROLE_KEY  # Full database access key
DUNE_API_KEY               # Blockchain analytics API key
MORALIS_API_KEY            # Web3 data API key
ETHEREUM_RPC_URL           # May contain authentication tokens
ADMIN_ADDRESSES            # List of privileged wallet addresses
```

### Secret Management Best Practices

**DO**:
- ✅ Use environment variables for all secrets
- ✅ Use `.env.local` for local development (git-ignored)
- ✅ Use Replit Secrets for production deployment
- ✅ Rotate API keys regularly (quarterly minimum)
- ✅ Use different keys for development and production
- ✅ Audit secret access logs regularly

**DON'T**:
- ❌ Hardcode secrets in source code
- ❌ Commit `.env` files to Git
- ❌ Share secrets via insecure channels (email, Slack, Discord)
- ❌ Use production keys in development
- ❌ Log secrets to console or error messages
- ❌ Include secrets in error responses

### Frontend Secret Exposure

**CRITICAL**: Only these variables should have `VITE_` or `NEXT_PUBLIC_` prefixes (meaning they're exposed to the frontend):

```bash
VITE_ETHEREUM_RPC_URL      # OK - Public RPC endpoint
```

**NEVER** prefix these with `VITE_` or `NEXT_PUBLIC_`:
```bash
❌ VITE_DATABASE_URL
❌ VITE_SUPABASE_SERVICE_ROLE_KEY
❌ VITE_DUNE_API_KEY
❌ VITE_ADMIN_ADDRESSES  # Removed in security hardening
```

**Note**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally public (anon-level access only).

### Secret Rotation Procedure

When rotating secrets:

1. **Generate new secret** (API key, database password, etc.)
2. **Update secret in production** (Replit Secrets or hosting platform)
3. **Restart application** to load new secret
4. **Verify functionality** with new secret
5. **Revoke old secret** after 24-hour grace period
6. **Document rotation** in security log

---

## Authentication & Authorization

### Token-Gating (Kong NFT Ownership)

**Implementation**: Kong NFT ownership verification via ERC721 balance check

**Security Measures**:
- ✅ Server-side verification on every protected route
- ✅ Client-side checks for UX (not security)
- ✅ Fallback to deny access if RPC fails
- ✅ No caching of ownership status (real-time check)

**Code Reference**: `server/lib/isKongHolder.ts`

```typescript
// Server-side verification (enforced)
const isHolder = await isKongHolder(walletAddress);
if (!isHolder) {
  return res.status(403).json({ message: 'Kong NFT required' });
}
```

**Vulnerabilities to Mitigate**:
- ❌ Never trust frontend ownership checks alone
- ❌ Don't cache ownership status (NFTs can be transferred)
- ❌ Validate wallet address format before RPC call

### Admin Authentication

**Implementation**: Server-side wallet signature verification

**Security Flow**:

1. **Client generates timestamp** → `Date.now()`
2. **Client constructs message** → `KingDAO Admin Check\nTimestamp: ${timestamp}`
3. **Client signs message** with MetaMask/wallet
4. **Client sends to server** → `POST /api/auth/is-admin` with `{walletAddress, signature, timestamp}`
5. **Server validates timestamp** → Must be within ±5 minutes of current time
6. **Server reconstructs same message** → `KingDAO Admin Check\nTimestamp: ${timestamp}`
7. **Server verifies signature** using `viem.verifyMessage()`
8. **Server checks wallet** against `ADMIN_ADDRESSES` env var
9. **Access granted** if signature valid, timestamp fresh, and address is admin

**Code Reference**: `server/routes.ts` (POST /api/auth/is-admin)

**Security Measures**:
- ✅ Timestamp validation prevents replay attacks (±5 minute window)
- ✅ Admin addresses stored server-side only (not in frontend bundle)
- ✅ Signature verification using cryptographically secure viem library
- ✅ No server-side challenge generation (client-generated timestamp)
- ✅ Deterministic message format prevents signature reuse
- ✅ No session tokens (wallet signature required for each admin verification)

**CRITICAL**: Admin addresses are now **server-side only**. Previous implementation exposed `VITE_ADMIN_ADDRESSES` in the frontend bundle, allowing anyone to see who the admins are.

**Vulnerabilities to Mitigate**:
- ❌ Never trust client-side admin checks
- ❌ Don't cache admin status indefinitely
- ❌ Validate signature format before verification
- ❌ Enforce timestamp freshness (currently ±5 minutes)
- ❌ Prevent timestamp manipulation (server validates against current time)

**Implementation Details**:
```typescript
// Client-side (example)
const timestamp = Date.now().toString();
const message = `KingDAO Admin Check\nTimestamp: ${timestamp}`;
const signature = await signer.signMessage(message);

await fetch('/api/auth/is-admin', {
  method: 'POST',
  body: JSON.stringify({ walletAddress, signature, timestamp }),
});

// Server-side (actual implementation)
const timestampNum = parseInt(timestamp, 10);
const currentTime = Date.now();
const fiveMinutes = 5 * 60 * 1000;

if (Math.abs(currentTime - timestampNum) > fiveMinutes) {
  return res.status(401).json({ message: 'Signature expired' });
}

const message = `KingDAO Admin Check\nTimestamp: ${timestamp}`;
const isValid = await verifyMessage({ address, message, signature });
```

---

## Database Security

### SQL Injection Prevention

**Protection**: Drizzle ORM with parameterized queries

**DO**:
```typescript
// ✅ Safe - Parameterized query via Drizzle
const messages = await db
  .select()
  .from(communityMessages)
  .where(eq(communityMessages.channel, userInput));
```

**DON'T**:
```typescript
// ❌ Dangerous - String concatenation
const query = `SELECT * FROM community_messages WHERE channel = '${userInput}'`;
```

### Database Access Control

**Principle**: Least Privilege Access

**Neon PostgreSQL**:
- Use connection pooling (prevents connection exhaustion)
- Enable SSL/TLS for all connections
- Restrict database user permissions:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE` only
  - No `CREATE TABLE`, `DROP TABLE` in production
  - No `CREATE USER` or admin privileges

**Supabase**:
- Use **service role key** server-side only
- Use **anon key** for frontend (limited access)
- Configure Row-Level Security (RLS) policies:
  ```sql
  -- Example RLS policy for treasury_snapshots
  ALTER TABLE treasury_snapshots ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Allow public read access"
  ON treasury_snapshots FOR SELECT
  USING (true);
  
  CREATE POLICY "Only service role can insert"
  ON treasury_snapshots FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
  ```

### Database Backup Strategy

**Required**:
- Daily automated backups (Neon provides this by default)
- Test restore procedures quarterly
- Keep backups encrypted and access-controlled
- Retain backups for 30 days minimum

### Connection String Security

**CRITICAL**: Database URLs contain credentials

```bash
# ✅ Correct - In .env file
DATABASE_URL=postgresql://user:pass@host:5432/db

# ❌ Wrong - Exposed in code
const connectionString = "postgresql://user:pass@host:5432/db";
```

**Protection**:
- Never log connection strings
- Never include in error messages
- Never commit to Git
- Use connection pooling to limit connections

---

## API Security

### API Key Protection

**Server-Side Only**:
```typescript
// ✅ Correct - Server-side API call
const duneApiKey = process.env.DUNE_API_KEY;
const response = await fetch(duneEndpoint, {
  headers: { 'X-Dune-API-Key': duneApiKey }
});
```

**Never in Frontend**:
```typescript
// ❌ Wrong - Exposed in bundle
const apiKey = import.meta.env.VITE_DUNE_API_KEY;
```

### CORS Configuration

**Current Setup**: Vite dev server handles CORS in development

**Production Recommendations**:
```typescript
// server/index.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### API Rate Limiting (Application-Level)

**Current Implementation**: Community chat has 30-second per-wallet-per-channel rate limit

**Recommendations for All Endpoints**:

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', apiLimiter);
```

### Content Security Policy (CSP)

**Recommended Headers**:

```typescript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://mainnet.infura.io https://*.supabase.co https://*.safe.global"
  );
  next();
});
```

---

## Rate Limiting

### Community Chat Rate Limiting

**Implementation**: Database-enforced window-based rate limiting

**Mechanism**:
```typescript
// 30-second window slot (server/schema.ts)
windowSlot: text("window_slot")
  .notNull()
  .generatedAlwaysAs(sql`floor(extract(epoch from created_at) / 30)::text`),

// Unique constraint prevents concurrent submissions
unique("rate_limit_unique").on(
  table.walletAddress,
  table.channel,
  table.windowSlot
)
```

**Security Properties**:
- ✅ Database-level enforcement (not bypassable)
- ✅ Per-wallet, per-channel rate limiting
- ✅ Prevents race conditions via unique constraint
- ✅ Graceful degradation on concurrent requests

**Vulnerabilities Mitigated**:
- ❌ Message flooding
- ❌ Spam attacks
- ❌ Rate limit bypass via concurrent requests
- ❌ Cross-channel spam (limits are per-channel)

### API Endpoint Rate Limiting

**Current Status**: No application-level rate limiting on API endpoints

**Recommendation**: Implement express-rate-limit

```typescript
// Per-endpoint rate limits
const treasuryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
});

const communityLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute  
  max: 10, // 10 requests per minute
});

app.get('/api/treasury/overview', treasuryLimiter, handler);
app.post('/api/community/messages', communityLimiter, handler);
```

---

## Input Validation

### Schema Validation (Zod)

**Current Implementation**: Community messages validated with Zod schema

```typescript
// ✅ Correct - Schema validation before processing
const validationResult = insertCommunityMessageSchema.safeParse(req.body);
if (!validationResult.success) {
  return res.status(400).json({ errors: validationResult.error.issues });
}
```

**Apply to All User Inputs**:
- Form submissions
- Query parameters
- Request bodies
- File uploads (if implemented)

### Wallet Address Validation

**Implementation**: `server/lib/validators.ts`

```typescript
// EVM address validation
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Solana address validation
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
```

**Usage**:
```typescript
// ✅ Validate before using
if (!isValidEvmAddress(walletAddress)) {
  return res.status(400).json({ error: 'Invalid wallet address' });
}
```

### XSS Prevention

**Community Chat Messages**:

**Current Protection**: React automatically escapes HTML in JSX

```typescript
// ✅ Safe - React escapes automatically
<p>{message.message}</p>
```

**DON'T**:
```typescript
// ❌ Dangerous - Allows XSS
<div dangerouslySetInnerHTML={{ __html: message.message }} />
```

**Additional Recommendations**:
- Sanitize user input with DOMPurify if HTML rendering needed
- Implement Content Security Policy headers
- Validate message length and character set

---

## Error Handling

### Error Message Sanitization

**Implementation**: `server/lib/errorHandler.ts`

**Purpose**: Prevent stack trace leakage in production

```typescript
// ✅ Correct - Sanitized error response
const error = new Error('Database query failed');
const response = createErrorResponse(error);
// Production: { success: false, message: 'Internal server error' }
// Development: { success: false, message: 'Database query failed', stack: '...' }
```

**DON'T**:
```typescript
// ❌ Dangerous - Exposes stack trace
return res.status(500).json({
  error: error.message,
  stack: error.stack,  // Leaks internal paths and logic
});
```

### Comprehensive Error Handling

All API routes use sanitized error responses:

```typescript
import { createErrorResponse } from './lib/errorHandler';

app.get('/api/endpoint', async (req, res) => {
  try {
    // ... logic
  } catch (error) {
    return res.status(500).json(createErrorResponse(error));
  }
});
```

---

## Deployment Security

### Production Environment Variables

**Required Security Variables**:

```bash
NODE_ENV=production              # Enables production optimizations
DATABASE_URL=postgresql://...    # Production database (separate from dev)
ETHEREUM_RPC_URL=https://...     # Production RPC (with rate limits)
ADMIN_ADDRESSES=0x...            # Production admin addresses only
```

**DO**:
- ✅ Use separate databases for dev/staging/production
- ✅ Use production-grade RPC providers (Infura/Alchemy paid plans)
- ✅ Enable SSL/TLS for all external connections
- ✅ Set `NODE_ENV=production` to disable debug features

**DON'T**:
- ❌ Use public RPC endpoints in production (rate limits)
- ❌ Share production credentials with development team
- ❌ Deploy with `NODE_ENV=development`

### HTTPS/TLS

**CRITICAL**: Always serve application over HTTPS in production

**Replit Deployments**:
- HTTPS enabled by default
- TLS certificates managed automatically
- Custom domains supported with automatic SSL

**Self-Hosting**:
- Use Let's Encrypt for free SSL certificates
- Configure web server (nginx/Apache) for HTTPS
- Force HTTPS redirects:
  ```nginx
  server {
    listen 80;
    return 301 https://$host$request_uri;
  }
  ```

### Security Headers

**Recommended Headers**:

```typescript
// server/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://mainnet.infura.io", "https://*.supabase.co"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

## Monitoring & Incident Response

### Security Monitoring

**Monitor for**:
- Unusual API request volumes (potential DoS)
- Failed authentication attempts (brute force)
- Rate limit violations
- Database query errors (potential SQL injection)
- Unexpected error spikes

**Logging Best Practices**:
```typescript
// ✅ Log security events
logger.warn('Failed admin authentication attempt', {
  wallet: req.body.walletAddress,
  ip: req.ip,
  timestamp: new Date(),
});

// ❌ Don't log sensitive data
logger.debug('Auth request', {
  signature: req.body.signature,  // Contains sensitive data
  adminAddresses: ADMIN_ADDRESSES, // Exposes admins
});
```

### Incident Response Plan

**1. Detection**
- Monitor error logs and alerts
- Review user reports of suspicious activity
- Check rate limit violations

**2. Containment**
- Disable affected endpoints if under attack
- Revoke compromised API keys immediately
- Block malicious IP addresses

**3. Investigation**
- Review server logs for attack vector
- Check database for unauthorized changes
- Audit admin access logs

**4. Recovery**
- Restore from backup if data corrupted
- Rotate all potentially compromised secrets
- Deploy security patches

**5. Post-Incident**
- Document attack details and response
- Update security measures to prevent recurrence
- Notify users if data was compromised

### Security Audit Checklist

**Monthly**:
- [ ] Review admin access logs
- [ ] Check for unusual API usage patterns
- [ ] Verify all secrets are still secure
- [ ] Test backup restore procedures

**Quarterly**:
- [ ] Rotate API keys and credentials
- [ ] Review and update dependencies (npm audit)
- [ ] Penetration testing (if budget allows)
- [ ] Security awareness training for team

**Annually**:
- [ ] Comprehensive security audit
- [ ] Update incident response plan
- [ ] Review and update this security document
- [ ] Third-party security assessment (if budget allows)

---

## Vulnerability Reporting

**If you discover a security vulnerability**:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** discuss publicly on Discord/Slack
3. **DO** email security concerns to: [security@kingdao.io]
4. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

**Response SLA**:
- Acknowledgment within 48 hours
- Initial assessment within 1 week
- Fix deployed within 2 weeks (for critical issues)

---

## Security Changelog

### 2025-11-11: Security Hardening Release

**Changes**:
1. ✅ **Removed VITE_ADMIN_ADDRESSES** - Admin addresses no longer exposed in frontend bundle
2. ✅ **Server-side admin authentication** - POST /api/auth/is-admin with wallet signature verification
3. ✅ **Error message sanitization** - createErrorResponse utility prevents stack trace leakage
4. ✅ **Community chat rate limiting** - Database-enforced 30-second window per wallet per channel
5. ✅ **Input validation** - insertCommunityMessageSchema validation on all chat messages

**Impact**: Significant improvement in admin security and spam prevention

---

## References

### External Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Ethereum Signature Security](https://eips.ethereum.org/EIPS/eip-191)

### Internal Documentation

- `docs/DEV_INTEGRATION_ROADMAP.md` - Integration security considerations
- `docs/INTEGRATION_GUIDE.md` - Secure setup procedures
- `.env.example` - Environment variable security notes

---

## Conclusion

Security is an ongoing process, not a one-time implementation. Regularly review this document, stay updated on security best practices, and prioritize security in all development decisions.

**Remember**: When in doubt, err on the side of security. It's easier to add convenience later than to recover from a security breach.
