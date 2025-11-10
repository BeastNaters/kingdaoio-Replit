# KingDAO Treasury Dashboard - Design Guidelines

## Design Approach
**Reference-Based: Web3/DeFi Platforms**
Drawing inspiration from established Web3 interfaces: Uniswap's depth and clarity, Zapper's data density with visual appeal, and Rainbow Wallet's modern glassmorphism. This dashboard requires the sophisticated technical aesthetic of DeFi platforms while maintaining approachability for DAO members.

**Core Principle:** Crypto-native professionalism - trustworthy financial data presentation with cutting-edge Web3 visual language.

---

## Visual Language

### Dark Foundation
- **Primary Background:** `bg-slate-950` - deep, rich black base
- **Secondary Surfaces:** `bg-neutral-900/50` with backdrop blur for glassmorphism cards
- **Elevated Surfaces:** `bg-white/5` with `border border-white/10` for data containers

### Gradient System
**Purple/Cyan Accent Gradients** (use sparingly for emphasis):
- **Primary Gradient:** Purple (#8B5CF6) to Cyan (#06B6D4) - for CTAs, hero accents
- **Subtle Gradients:** Dark purple (#1E1B4B) to dark cyan (#164E63) - for section backgrounds
- **Glow Effects:** Soft purple/cyan radial gradients behind key stat cards

### Glassmorphism Treatment
- **Data Cards:** `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl`
- **Modals/Overlays:** `backdrop-blur-2xl bg-black/40 border border-white/5`
- **Hover States:** Increase to `bg-white/10` with smooth transition

---

## Typography

### Font Selection
- **Primary Font:** Inter (Google Fonts) - exceptional readability for data/numbers
- **Accent Font:** Space Grotesk - for headings, bold statements, crypto-native feel

### Hierarchy
- **Hero Headline:** 4xl-6xl, Space Grotesk Bold, gradient text treatment
- **Page Titles:** 3xl-4xl, Space Grotesk Semibold
- **Section Headers:** 2xl, Space Grotesk Medium
- **Data Labels:** sm uppercase tracking-wide, Inter Medium
- **Data Values:** 2xl-3xl, Inter Semibold (for stats/numbers)
- **Body Text:** base, Inter Regular
- **Micro Text:** xs-sm, Inter Regular, text-slate-400

---

## Layout System

### Spacing Primitives
**Tailwind units: 4, 6, 8, 12, 16**
- Component padding: `p-6` or `p-8`
- Section spacing: `py-12` to `py-16`
- Card gaps: `gap-6` or `gap-8`
- Micro spacing: `space-y-4`

### Grid Structure
- **Dashboard:** Max-width container `max-w-7xl` with 12-column grid
- **Stat Cards:** 3-column grid on desktop `grid-cols-1 md:grid-cols-3 gap-6`
- **Data Tables:** Full-width within container, responsive scroll
- **NFT Grid:** 3-4 columns `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

---

## Component Library

### Navigation
**Sticky Top Bar:**
- Dark background `bg-slate-950/80 backdrop-blur-md border-b border-white/5`
- Logo/brand left, nav links center, wallet button right
- Active link: purple underline glow
- Height: 16 (64px)

### Wallet Connect Button
- **Disconnected:** Gradient purple/cyan background, white text, rounded-xl, px-6 py-3
- **Connected:** Glassmorphic pill showing truncated address, avatar icon, dropdown on click
- Prominent placement in nav and landing hero

### Stat Cards
**3-Column Dashboard Header:**
- Glassmorphic card with subtle purple/cyan border glow
- Large numeric value (3xl, gradient or white)
- Label above (sm, uppercase, slate-400)
- Small trend indicator or icon
- Rounded-2xl, p-6

### Data Tables
- Dark header row `bg-white/5` with uppercase labels
- Alternating row backgrounds (transparent / `bg-white/[0.02]`)
- Hover: `bg-white/5`
- Borders: `border-t border-white/5` between rows
- Token symbols in badges with subtle color backgrounds
- Right-aligned numbers, monospace for consistency

### Charts
**Portfolio Donut Chart:**
- Centered composition with legend below or to side
- Custom colors for token segments (distinct, saturated)
- Glassmorphic container
- Hover: segment highlight with tooltip

**Performance Line Chart:**
- Gradient fill under line (purple/cyan)
- Grid lines: `stroke-white/5`
- Clean axis labels
- Responsive height

### Token-Gated Screen
**Full-Screen Centered Modal:**
- Backdrop blur with dark overlay
- Centered card with Kong NFT visual or icon
- Headline: "Kong NFT Required"
- Subtext explanation
- "Connect Different Wallet" button (outline style)
- Subtle purple glow around card

### NFT Cards
**Grid Layout:**
- Square aspect ratio for NFT image
- Image with rounded-xl, border border-white/10
- Collection name below (semibold)
- Floor price badge (small, glassmorphic, cyan accent)
- Estimated value (slate-400, smaller)
- Hover: scale-105 transform, increased glow

### Badges & Tags
- **Status Badges (Snapshot):** Rounded-full px-3 py-1, small text
  - Active: green-500/20 background, green-400 text
  - Closed: slate-500/20 background, slate-400 text
- **Source Tags (Treasury):** Small pills indicating data source (Dune/Safe/Sheets)

### Alerts & Banners
- Top of page positioning
- Icon left, message center, close button right
- Error: red-500/10 background, red-400 border
- Success: green-500/10 background, green-400 border
- Rounded-xl, p-4

---

## Page-Specific Layouts

### Landing Page (/)
**Hero Section:**
- Full viewport height (min-h-screen)
- Centered content with gradient background (purple to cyan radial)
- Large headline with gradient text
- Subheading (lg, slate-300)
- Connect Wallet button (large, prominent)
- Abstract Web3 illustration or Kong NFT hero image (optional background element)

**Features Section:**
- 3-column grid showing key dashboard capabilities
- Icon + title + description per feature
- Glassmorphic cards

### Dashboard (/dashboard)
**Layout Flow:**
1. **Stat Cards Row:** Total treasury value, wallet count, NFT count
2. **Two-Column Section:**
   - Left: Portfolio allocation donut chart
   - Right: Token balances table (top holdings)
3. **Full-Width:** Historical performance line chart
4. **Multi-Sig Section:** Safe assets with glassmorphic card treatment
5. **Off-Chain Section:** Google Sheets data table

### NFTs Page (/nfts)
- Page title with total NFT count
- Grid layout (responsive columns)
- Empty state: centered message with placeholder icon if no NFTs

### Community Page (/community)
**Two Sections:**
1. **Snapshot Proposals:** Card list with title, status badge, date range, link button
2. **Discord Feed:** Timeline-style list with announcement cards, timestamps

---

## Images & Assets

### Icons
**Heroicons CDN** - outline and solid variants
- Wallet, chart, grid, user group, document icons
- 20px for inline, 24px for cards, 32px+ for empty states

### Images
**Hero Image:** Optional abstract Web3/blockchain visualization or Kong NFT showcase - subtle, non-distracting background element with opacity overlay

**NFT Images:** Dynamic from API/blockchain - loaded with loading skeleton, fallback placeholder if load fails

**Empty States:** Simple iconography (no NFTs found, no data available)

---

## Animations
**Minimal, Performance-Focused:**
- Smooth transitions on hover (150-200ms)
- Skeleton loading for data tables and cards
- Fade-in for page loads (opacity transition)
- No scroll-triggered animations
- Wallet connection modal entrance (scale + fade)

---

## Accessibility & Polish
- High contrast white text on dark backgrounds
- Focus states with purple/cyan ring
- Loading states for all async data
- Error boundaries with user-friendly messages
- Responsive breakpoints: sm (640), md (768), lg (1024), xl (1280)