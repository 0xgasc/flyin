# FlyInGuate Session Changes Documentation
**Date:** January 23, 2026

---

## Transport Map UX Overhaul & Codebase Audit (v2.3.0)
**Date:** January 29, 2026

### Map & Modal Improvements

#### 1. Destination Selector Modal Cleanup
**File:** `src/components/destination-selector-modal.tsx`

**Changes:**
- **Removed "Available Experiences" section** — modal now shows only Airports, Cities & Destinations, and Custom Location
- **Added Custom Location input** — users can type any location when the predefined list doesn't cover their needs
  - Toggle button activates a text input field with auto-focus
  - Selecting a preset destination deactivates custom mode and vice versa
  - Footer button label updates dynamically to show the selected/typed value
- **Portal rendering** — modal renders via `createPortal` to `document.body` to escape WebGL stacking contexts
- **z-index set to 200** on the overlay for reliable layering

#### 2. Map Marker Selection Matching (Department-Level)
**Files:** `src/components/guatemala-maplibre.tsx`, `src/components/guatemala-leaflet-map.tsx`

**Problem:** When a user selected "Guatemala City" from the modal, the map marker named "Ciudad de Guatemala" wouldn't turn green because of a direct name comparison mismatch.

**Solution:** Selection matching now uses department-level lookup:
```
1. Find which department contains the selected destination/airport name
2. For each map marker, check if it belongs to that department
3. Highlight all markers in the matched department
```
This handles all naming mismatches (English vs Spanish names, abbreviated names, airport names vs city names).

**MapLibre (`guatemala-maplibre.tsx`):**
- `addMarkers()` now computes `fromDept` and `toDept` by searching `guatemalaDepartments` for matching destination or airport names
- Each marker checks: direct name match OR airportName match OR department-level match
- Route line drawing also uses the same fallback matching

**Leaflet (`guatemala-leaflet-map.tsx`):**
- Same pattern: markers check `dept.destinations.includes(selectedFrom)` and `dept.airports.some(a => a.name === selectedFrom)` in addition to ID-based matching

#### 3. Enhanced Map Tooltip
**File:** `src/components/guatemala-maplibre.tsx`

**Changes:**
- Airport tooltip now shows **full airport name**: `✈ GUA — La Aurora International` (was just `✈ GUA`)
- Added **"Selected as Origin"** badge (emerald green) when hovering a marker that's the departure point
- Added **"Selected as Destination"** badge (amber) when hovering a marker that's the destination
- Selection status uses the same department-level matching as markers

#### 4. Auto-Collapse Map After Selection
**File:** `src/app/book/transport/page.tsx`

**Changes:**
- Added `mapCollapsed` state that auto-triggers when both `fromLocation` and `toLocation` are set in map mode
- When collapsed, map is replaced with a compact "Show Map" button
- Users can re-expand the map at any time by clicking the button
- Selected Route display remains visible below the collapsed/expanded map

#### 5. Modal vs WebGL Canvas Z-Index Fix
**File:** `src/app/book/transport/page.tsx`

**Problem:** The destination selector modal appeared behind the WebGL map canvas despite z-index 200 and portal rendering. WebGL GPU compositing layers paint above normal DOM elements regardless of z-index.

**Previous failed attempts:**
1. z-index 50 → 200 (didn't work)
2. `createPortal` to document.body (didn't work alone)
3. Map wrapper with `zIndex: -1` (didn't work)

**Final fix:** Hide the map container entirely with `display: none` when the modal is open. This removes the WebGL canvas from the rendering pipeline completely, allowing the modal to render above everything.

### Codebase Audit Cleanup (v2.2.0)
**Date:** January 28, 2026

#### Phase 1: Z-Index Stacking Normalization
**Files:** `globals.css`, `mobile-nav.tsx`, `guatemala-maplibre.tsx`
- Normalized scale: map(40) < modals(50) < nav(60) < overlay(65) < panel(70) < toast(100)
- MapLibre popup/marker/ctrl z-index: 9999 → 40
- Mobile nav overlay: z-55 → z-65
- Map tooltip: z-99999 → z-40

#### Phase 2: Unused CSS Removal
**File:** `src/styles/globals.css`
- Removed 20 unused utility classes (~80 lines): `.btn-soft`, `.btn-link`, `.card-glass`, `.card-elevated`, `.text-heading`, `.text-body`, `.text-muted`, `.form-label`, `.table-container`, `.table-header`, `.table-body`, `.table-cell`, `.nav-link`, `.nav-link-active`, `.status-badge`, `.gold-shimmer`, `.hover-lift`, `.hover-scale`, `.dark-card-bg`, `.loading-spinner-sm`
- Kept `.card-bordered` (used by `.card-feature` via `@apply`)

#### Phase 3: i18n Key Maintenance
**File:** `src/lib/i18n.ts`
- Added 13 nav keys (`nav.home`, `nav.experiences`, `nav.executive_services`, `nav.faq`, `nav.pilot_opportunities`, `nav.dashboard`, `nav.admin`, `nav.pilot_dashboard`, `nav.profile`, `nav.sign_in`, `nav.register`, `nav.sign_out`, `nav.switch_language`) in both `en` and `es`
- Removed 6 unused category keys (`category.scenic`, `.romantic`, `.cultural`, `.volcano`, `.beach`, `.adventure`)

#### Phase 4: Mobile Nav i18n Migration
**File:** `src/components/mobile-nav.tsx`
- Migrated all 13 inline `locale === 'es' ? ... : ...` patterns to `t('nav.*')` calls
- Imported `useTranslation` from `@/lib/i18n`

#### Phase 5: Dark Mode Fixes
**Files:** `pilot/join/page.tsx` (~20 changes), `book/transport/page.tsx` (~8 changes), `faq/page.tsx` (~1 change)
- Added `dark:` variants to backgrounds, text colors, badges, and info boxes
- Pages no longer flash white in dark mode

#### Phase 6: Console.log Leak Removal
**Files:** `login/page.tsx`, `register/page.tsx`
- Removed `console.log('Login successful, token received:', ...)`
- Removed `console.log('Redirecting to:', targetUrl)`
- Removed `console.log('User registered successfully:', ...)`

#### Phase 7: Admin Improvements
**Files:** `admin/page.tsx`, `admin/components/AdminLayout.tsx`, `i18n.ts`
- Fixed dark mode text visibility across admin tables, modals, forms
- Translated admin sidebar labels and section headings to support i18n
- Removed duplicate "Pilot Opportunities" from navigation

#### Phase 8: Admin Refactor TODO
**File:** `README.md`
- Added TODO note: `src/app/admin/page.tsx` is a 4000+ line monolith that should be split into separate components per tab

### Navigation & Home Page Fixes (v2.1.5)
**Date:** January 27, 2026

- **Fixed hero section blocking clicks** on MobileNav overlay and burger menu
- **Moved nav panel to right side** and fixed menu links not closing the panel
- **Added Pilot Opportunities and Executive Services** to mobile nav
- **Fixed hidden nav panel** intercepting click events on home page

### Files Modified (v2.2.0–v2.3.0)

| File | Changes |
|------|---------|
| `src/components/destination-selector-modal.tsx` | Removed experiences, added custom input, portal + z-index |
| `src/components/guatemala-maplibre.tsx` | Department-level selection matching, enhanced tooltip |
| `src/components/guatemala-leaflet-map.tsx` | Department-level selection matching |
| `src/app/book/transport/page.tsx` | Auto-collapse map, hide map when modal open |
| `src/styles/globals.css` | Z-index normalization, removed 20 unused classes |
| `src/components/mobile-nav.tsx` | Z-index fix, i18n migration |
| `src/lib/i18n.ts` | Added nav keys, removed unused category keys |
| `src/app/pilot/join/page.tsx` | Dark mode fixes |
| `src/app/faq/page.tsx` | Dark mode fix |
| `src/app/login/page.tsx` | Removed console.logs |
| `src/app/register/page.tsx` | Removed console.log |
| `src/app/admin/page.tsx` | Dark mode text visibility |
| `src/app/admin/components/AdminLayout.tsx` | i18n sidebar labels |
| `README.md` | Added admin refactor TODO |

### Build Status
```
Build successful — no TypeScript or compilation errors
All routes compiled successfully
Deployed to Vercel via main branch auto-deploy
```

---

## 🔒 Security Audit & Design Refresh (v2.1.0)
**Date:** January 23, 2026

### Security Hardening

#### 1. JWT Library Standardization
**File:** `src/middleware.ts`
- Replaced `jose` library with `jsonwebtoken` for consistency across codebase
- Removed async overhead (jose requires async, jsonwebtoken is synchronous)
- Unified JWT verification using `@/lib/jwt` utilities
- Improved performance and maintainability

#### 2. Security Measures Already in Place (Verified)
The following security best practices were confirmed to be implemented:

**JWT Secret Validation** (`src/lib/jwt.ts:4-13`)
- Application throws error on startup if `JWT_SECRET` environment variable not set
- No hardcoded fallback secrets
- Prevents deployment with default/weak secrets

**Error Sanitization** (All auth routes)
- Generic error messages returned to clients
- No stack traces or internal details exposed
- Files: `login/route.ts:72`, `me/route.ts:51`, `register/route.ts:106`

**Atomic Payment Operations** (`src/app/api/bookings/[id]/pay/route.ts:46-57`)
- Prevents TOCTOU (Time-of-check to Time-of-use) race conditions
- Uses MongoDB `findOneAndUpdate` with balance check in single atomic operation
- Concurrent payment requests cannot cause negative balances

**NoSQL Injection Prevention** (`src/app/api/bookings/route.ts:8-20`)
- Query parameters validated against enum whitelists
- Only valid status/type values accepted
- Prevents malicious query object injection

### Design System Overhaul: Sharp Corners

Completely redesigned UI from rounded corners to sharp edges for a modern, premium aesthetic.

#### Core Styles Updated (`src/styles/globals.css`)
```css
.btn-primary: rounded → rounded-none
.btn-luxury: rounded → rounded-none
.card-luxury: rounded → rounded-none
.modal-content: rounded → rounded-none
.status-badge: rounded → rounded-none
Form inputs: rounded → rounded-none
```

**Preserved:** `rounded-full` for loading spinners and avatars (functional requirement)

#### Components Updated (12 files)
1. **Modal.tsx** - All modal containers and buttons → `rounded-none`
2. **StatusBadge.tsx** - Badge borders → `rounded-none`
3. **booking-success-modal.tsx** - Modal and containers → `rounded-none`
4. **guest-booking-modal.tsx** - All inputs and buttons → `rounded-none`
5. **destination-selector-modal.tsx** - Modal, buttons, selection cards → `rounded-none`
6. **PhotoGallery.tsx** - Hover previews and control buttons → `rounded-none`

#### Pages Updated (6 major pages, 185 total changes)
| Page | Updates | Key Changes |
|------|---------|-------------|
| `page.tsx` (Landing) | 9 | Hero sections, booking form, service cards |
| `login/page.tsx` | 3 | Login form container and inputs |
| `register/page.tsx` | 8 | Registration form and buttons |
| `dashboard/page.tsx` | 25 | Dashboard cards, booking cards, action buttons |
| `admin/page.tsx` | 137 | Admin tables, modals, forms, status badges |
| `faq/page.tsx` | 3 | FAQ accordion panels |

#### Design Philosophy
- **Sharp edges** convey precision, professionalism, luxury
- **Consistent** across all UI elements (buttons, cards, modals, inputs)
- **Circular elements preserved** only where functionally necessary (spinners, avatars)
- **Modern aesthetic** aligned with premium helicopter service brand

### Build Verification
```bash
✓ Build successful (no TypeScript errors)
✓ 42 static pages generated
✓ All routes compiled successfully
```

### Files Modified
**Security:** 1 file
- `src/middleware.ts`

**Design:** 14 files
- `src/styles/globals.css`
- 6 components: `Modal.tsx`, `StatusBadge.tsx`, `booking-success-modal.tsx`, `guest-booking-modal.tsx`, `destination-selector-modal.tsx`, `PhotoGallery.tsx`
- 6 pages: `page.tsx`, `login/page.tsx`, `register/page.tsx`, `dashboard/page.tsx`, `admin/page.tsx`, `faq/page.tsx`

---

## 📦 Previous Updates (v2.0.0)
**Session Summary:** Admin features, bulk operations, FAQ page, and invoice/receipt system

---

## 🎨 Design Updates

### 1. Removed Emojis from UI
**Files Modified:**
- `src/app/admin/page.tsx`
- `src/app/admin/components/tabs/BookingsTab.tsx`
- `src/app/admin/components/tabs/UsersTab.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/book/passenger-details/page.tsx`

**Changes:**
- Removed all emojis (✓, ✗, ✏️, 🗑️, 💳, 📝, etc.) from admin interface
- Removed emojis from booking action buttons
- Removed emojis from user management buttons
- Removed addon category emoji icons

### 2. Landing Page Redesign
**File:** `src/app/page.tsx`

**Major Changes:**
- Full-screen hero section with helicopter background image
- Hero image from Unsplash (configured in `next.config.js`)
- Integrated booking mini-form with interactive map side-by-side
- Map allows clicking to select From/To destinations
- Form pre-fills data and navigates to `/book/transport` with query params
- Added scroll indicator (bouncing chevron)
- Cleaner services section layout
- Dual CTA buttons in footer

**Background Image:**
- Source: `https://images.unsplash.com/photo-1540962351504-03099e0a754b`
- Added to `next.config.js` remotePatterns for images.unsplash.com

### 3. Photo Gallery Re-added
**Component:** `src/components/PhotoGallery.tsx` (already existed)

**Integration:**
- Added back to landing page between Services and Footer sections
- Dynamic loading from experience/destination images
- Hover preview effects
- Full-screen lightbox with keyboard navigation
- Shuffle and "Show More" functionality

---

## 📋 New Features

### 1. FAQ Page
**Route:** `/faq`
**File:** `src/app/faq/page.tsx`

**Features:**
- Bilingual content (Spanish/English based on locale)
- Accordion-style interface with smooth animations
- Icons for each question (MapPin, Calendar, Plane, CreditCard, HelpCircle)
- Fully responsive design
- Contact CTA section at bottom

**FAQ Topics:**
1. ¿Adónde puedo ir? / Where can I fly to?
2. ¿Hay vuelos todo el año? / Year-round flights?
3. ¿Avión o Helicóptero? / Airplane or Helicopter?
4. ¿Métodos de pago? / Payment methods (50% deposit, Visacuotas)
5. ¿Cómo coordino mi vuelo? / How to coordinate flights
6. ¿Qué paquetes ofrecemos? / Available packages

**Navigation:**
- Added FAQ link to mobile navigation burger menu (`src/components/mobile-nav.tsx`)
- Available to all users (logged in or not)

### 2. Automated Pricing Calculator
**Route:** `POST /api/pricing/calculate`
**File:** `src/app/api/pricing/calculate/route.ts`

**Features:**
- Haversine formula for distance calculation between GPS coordinates
- Tiered pricing based on distance ranges:
  - 0-50km: $300 base + $5/km
  - 50-150km: $500 base + $4/km
  - 150-300km: $800 base + $3.5/km
  - 300km+: $1200 base + $3/km
- Passenger modifiers (+20% per additional passenger)
- Round-trip discounts (10% off total)
- GET endpoint to view pricing tiers and destinations

**Request Example:**
```json
POST /api/pricing/calculate
{
  "from": "GUA",
  "to": "ATITLAN",
  "passengers": 2,
  "roundTrip": true
}
```

**Response:**
```json
{
  "success": true,
  "pricing": {
    "from": "Guatemala City",
    "to": "Lake Atitlan",
    "distance": 120,
    "distanceUnit": "km",
    "passengers": 2,
    "roundTrip": true,
    "basePrice": 960,
    "totalPrice": 1152,
    "pricePerPassenger": 576,
    "breakdown": {
      "tierBasePrice": 500,
      "perKmRate": 4,
      "distanceCost": 480,
      "passengerModifier": "+20%",
      "roundTripDiscount": "-10%"
    }
  }
}
```

### 3. Invoice Generation (PDF)
**Route:** `GET /api/bookings/[id]/invoice`
**File:** `src/app/api/bookings/[id]/invoice/route.ts`

**Features:**
- Professional PDF invoice generation using jsPDF
- Can be generated for ANY booking status (pending, approved, paid)
- Includes:
  - Booking details
  - Customer information
  - Flight details (from, to, date, time, passengers)
  - Pricing breakdown (base price + add-ons)
  - Payment status
  - Special requests
- Authorization: User can view their own invoice, admin can view any
- Downloads as `invoice-{bookingId}.pdf`

**Use Case:** Bill requesting payment

### 4. Receipt Generation (PDF)
**Route:** `GET /api/bookings/[id]/receipt`
**File:** `src/app/api/bookings/[id]/receipt/route.ts`

**Features:**
- Professional PDF receipt with green "PAID" badge
- **ONLY for paid bookings** (returns error if booking not paid)
- Includes:
  - Payment date and method
  - Transaction ID
  - "PAYMENT RECEIVED" badge
  - Full payment summary
  - Thank you message
- Downloads as `receipt-{bookingId}.pdf`

**Use Case:** Proof of payment received

**Invoice vs Receipt:**
- **Invoice**: Any booking status - requesting payment
- **Receipt**: Paid bookings only - proof payment received

### 5. Refund Workflow
**Routes:**
- `POST /api/bookings/[id]/refund` - Process refund
- `GET /api/bookings/[id]/refund` - Get refund status

**File:** `src/app/api/bookings/[id]/refund/route.ts`

**Features:**
- Full and partial refund support
- Creates refund transaction record
- Updates booking status to 'cancelled'
- Stores refund reason, amount, and date
- Supports refund methods: 'original', 'wallet', 'bank_transfer'
- Validates refund amount doesn't exceed booking price
- Admin-only access

**Request Example:**
```json
POST /api/bookings/[booking-id]/refund
{
  "amount": 500,
  "reason": "Customer request",
  "refundMethod": "original"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    "bookingId": "...",
    "amount": 500,
    "method": "original",
    "transactionId": "...",
    "status": "partial_refund",
    "totalRefunded": 500
  }
}
```

**Note:** Wallet balance feature commented out (User model doesn't have wallet_balance field yet)

### 6. Bulk Export (Experiences & Destinations)
**Routes:**
- `GET /api/experiences/bulk-export?format=xlsx` (or `format=csv`)
- `GET /api/destinations/bulk-export?format=xlsx` (or `format=csv`)

**Files:**
- `src/app/api/experiences/bulk-export/route.ts`
- `src/app/api/destinations/bulk-export/route.ts`

**Features:**
- Export to Excel (.xlsx) with instructions sheet
- Export to CSV format
- Exports ALL fields including arrays (highlights, tags, images, etc.)
- Array fields shown as semicolon-separated values
- Includes helpful instructions sheet explaining:
  - How to edit the file
  - Field descriptions
  - Data format requirements
- Downloads as `experiences-export-{timestamp}.xlsx`
- Admin-only access

**Excel Structure:**
- Sheet 1: "Experiences" or "Destinations" - actual data
- Sheet 2: "Instructions" - detailed usage guide

### 7. Bulk Import (Experiences & Destinations)
**Routes:**
- `POST /api/experiences/bulk-import`
- `POST /api/destinations/bulk-import`

**Files:**
- `src/app/api/experiences/bulk-import/route.ts`
- `src/app/api/destinations/bulk-import/route.ts`

**Features:**
- Upload Excel or CSV files
- Create, Update, or Delete records
- Row-by-row validation with detailed error reporting
- Supports array fields (semicolon-separated in Excel)
- Boolean fields accept "Yes"/"No", "true"/"false", "1"/"0"
- Action column for deletions (set Action="DELETE")

**Request:**
```
POST /api/experiences/bulk-import
Content-Type: multipart/form-data
file: [Excel or CSV file]
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk import completed",
  "results": {
    "created": 5,
    "updated": 3,
    "deleted": 1,
    "errors": [
      "Row missing required field: Name"
    ]
  }
}
```

**How to Use:**
1. Export current data using bulk-export endpoint
2. Edit Excel file (add/modify/delete rows)
3. Upload modified file using bulk-import endpoint
4. Review results (created/updated/deleted counts + errors)

**Excel Field Formats:**
- **Arrays** (Highlights, Tags, etc.): Separate with semicolons (`;`)
  - Example: `highlight 1; highlight 2; highlight 3`
- **Booleans** (Is Active, Featured): Use "Yes" or "No"
- **Images**: Semicolon-separated URLs
- **ID**: Leave blank for new records, populate for updates
- **Action**: Add "DELETE" to delete a row

---

## 📦 Dependencies Installed

```bash
npm install jspdf papaparse xlsx
```

**Packages:**
- **jspdf** (v2.5.2) - PDF generation for invoices and receipts
- **papaparse** (v5.4.1) - CSV parsing (for bulk operations)
- **xlsx** (v0.18.5) - Excel file reading/writing

---

## 🗂️ File Structure Summary

### New API Routes
```
src/app/api/
├── bookings/[id]/
│   ├── invoice/route.ts          # Generate invoice PDF
│   ├── receipt/route.ts          # Generate receipt PDF (paid only)
│   └── refund/route.ts           # Process/view refunds
├── pricing/
│   └── calculate/route.ts        # Distance-based pricing calculator
├── experiences/
│   ├── bulk-export/route.ts      # Export experiences to Excel/CSV
│   └── bulk-import/route.ts      # Import experiences from Excel/CSV
└── destinations/
    ├── bulk-export/route.ts      # Export destinations to Excel/CSV
    └── bulk-import/route.ts      # Import destinations from Excel/CSV
```

### New Pages
```
src/app/
└── faq/
    └── page.tsx                  # FAQ page with bilingual content
```

### Modified Files
```
src/app/
├── page.tsx                      # Landing page redesign
├── admin/
│   ├── page.tsx                  # Removed emojis
│   └── components/tabs/
│       ├── BookingsTab.tsx       # Removed emojis
│       └── UsersTab.tsx          # Removed emojis
├── dashboard/page.tsx            # Removed emojis
└── book/
    └── passenger-details/page.tsx # Removed emojis

src/components/
├── mobile-nav.tsx                # Added FAQ link
└── PhotoGallery.tsx              # Already existed, re-added to landing

next.config.js                    # Added Unsplash remote image pattern
```

---

## 🔐 Security & Authorization

All new endpoints require authentication:
- **Admin-only routes:**
  - Bulk export/import
  - Refund processing
- **User/Admin routes:**
  - Invoice generation (user can view own, admin can view any)
  - Receipt generation (user can view own, admin can view any)
  - Pricing calculator (any authenticated user)

---

## 🚀 Deployment Status

All changes committed and pushed to GitHub:
- Commit 1: Removed emojis from UI
- Commit 2: Redesigned landing page with hero + booking form + map
- Commit 3: Fixed hero background image loading
- Commit 4: Added comprehensive admin features and bulk operations
- Commit 5: Added FAQ page and receipt generation

**Build Status:** ✅ All builds successful
**GitHub:** All commits pushed to `main` branch

---

## 📝 Usage Examples

### Admin Bulk Operations Workflow
```bash
# 1. Export current experiences
GET /api/experiences/bulk-export?format=xlsx
# Downloads: experiences-export-{timestamp}.xlsx

# 2. Edit the Excel file
# - Add new rows (leave ID blank)
# - Modify existing rows (keep ID)
# - Add Action="DELETE" to delete rows
# - Use semicolons for array fields

# 3. Import modified file
POST /api/experiences/bulk-import
FormData: { file: modified-file.xlsx }

# 4. Review results
{
  "created": 5,
  "updated": 10,
  "deleted": 2,
  "errors": []
}
```

### Customer Invoice/Receipt Workflow
```bash
# Generate invoice (any booking status)
GET /api/bookings/{bookingId}/invoice
# Downloads: invoice-{bookingId}.pdf

# Generate receipt (paid bookings only)
GET /api/bookings/{bookingId}/receipt
# Downloads: receipt-{bookingId}.pdf
```

### Pricing Calculator Usage
```bash
# Calculate flight price
POST /api/pricing/calculate
{
  "from": "GUA",
  "to": "TIKAL",
  "passengers": 4,
  "roundTrip": true
}

# Get available destinations and pricing tiers
GET /api/pricing/calculate
```

---

## 🐛 Known Issues / TODOs

1. **User Wallet Balance**: Refund to wallet commented out because User model doesn't have `wallet_balance` field
   - Location: `src/app/api/bookings/[id]/refund/route.ts` lines 94-102
   - Need to add wallet_balance field to User model if wallet refunds are needed

2. **Payment Integration**: Invoice and receipt generation assume payment_date and transaction_id exist
   - May need to update based on actual payment gateway integration

---

## 🎯 Key Improvements Made

1. **User Experience:**
   - Cleaner UI without emojis
   - Professional invoice/receipt PDFs
   - Interactive landing page with booking form + map
   - Comprehensive FAQ in both languages

2. **Admin Efficiency:**
   - Bulk export/import for managing experiences and destinations
   - Excel-based workflow with instructions
   - Refund workflow with transaction tracking
   - Automated pricing calculator

3. **Business Operations:**
   - Proper invoice vs receipt distinction
   - Distance-based automated pricing
   - Full refund tracking and history
   - Professional PDF documents for customers

---

## 📞 Support

For questions or issues with these features:
- Check API endpoint documentation in respective route files
- Review error responses for validation issues
- Consult Excel export instructions sheet for bulk operations
- Refer to this document for feature overview

---

**Session Duration:** ~2 hours
**Total Files Modified:** 15
**Total Files Created:** 8
**Lines of Code Added:** ~1,900
**Co-Authored-By:** Claude Sonnet 4.5
