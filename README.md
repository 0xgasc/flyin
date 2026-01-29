# FlyInGuate - Premium Helicopter Services Platform

A comprehensive booking and management platform for helicopter flight services in Guatemala, built with Next.js 16, TypeScript, and MongoDB.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚁 Live Site
**Production:** [https://flyinguate.vercel.app](https://flyinguate.vercel.app)

---

## ✨ Features

### Customer Features
- **Interactive Booking System** - Book helicopter flights with real-time availability
- **Interactive Map Integration** - MapLibre-based route selection with clickable destinations
- **Multi-language Support** - Full Spanish/English localization
- **Payment Processing** - Secure payment with multiple methods (50% deposit, Visacuotas)
- **Booking Management** - Track and manage all your flight bookings
- **PDF Documents** - Professional invoices and receipts
- **FAQ Section** - Comprehensive bilingual help and information
- **Photo Gallery** - Browse stunning aerial photography

### Admin Features
- **Booking Management** - Approve, edit, cancel, and delete bookings
- **Pilot Assignment** - Assign pilots and aircraft to bookings
- **Refund Processing** - Full and partial refund workflows with transaction tracking
- **Bulk Operations** - Import/export experiences and destinations via Excel/CSV
- **Automated Pricing** - Distance-based pricing calculator using Haversine formula
- **User Management** - Manage customers, pilots, and admins with KYC verification
- **Analytics Dashboard** - Track revenue, bookings, and performance
- **Invoice & Receipt Generation** - Professional PDF documents

### Pilot Features
- **Flight Schedule** - View assigned flights and schedules
- **Aircraft Management** - Manage helicopter fleet
- **Maintenance Tracking** - Log and track maintenance records

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/0xgasc/flyin.git
cd flyin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/flyinguate
MONGODB_DB=flyinguate

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking (admin only)
- `GET /api/bookings/[id]/invoice` - Generate invoice PDF (any status)
- `GET /api/bookings/[id]/receipt` - Generate receipt PDF (paid only)
- `POST /api/bookings/[id]/refund` - Process refund (admin only)
- `GET /api/bookings/[id]/refund` - Get refund status
- `POST /api/bookings/[id]/pay` - Process payment

### Pricing
- `POST /api/pricing/calculate` - Calculate flight price based on distance
- `GET /api/pricing/calculate` - Get pricing tiers and destinations

### Experiences
- `GET /api/experiences` - List all experiences
- `POST /api/experiences` - Create experience (admin only)
- `GET /api/experiences/[id]` - Get experience details
- `PUT /api/experiences/[id]` - Update experience (admin only)
- `DELETE /api/experiences/[id]` - Delete experience (admin only)
- `GET /api/experiences/bulk-export?format=xlsx` - Export to Excel/CSV (admin only)
- `POST /api/experiences/bulk-import` - Import from Excel/CSV (admin only)

### Destinations
- `GET /api/destinations` - List all destinations
- `POST /api/destinations` - Create destination (admin only)
- `GET /api/destinations/[id]` - Get destination details
- `PUT /api/destinations/[id]` - Update destination (admin only)
- `DELETE /api/destinations/[id]` - Delete destination (admin only)
- `GET /api/destinations/bulk-export?format=xlsx` - Export to Excel/CSV (admin only)
- `POST /api/destinations/bulk-import` - Import from Excel/CSV (admin only)

### Users
- `GET /api/users` - List users (admin only)
- `GET /api/users/[id]` - Get user details (admin only)
- `PUT /api/users/[id]` - Update user (admin only)

---

## 💡 Usage Examples

### Calculate Flight Price

```javascript
const response = await fetch('/api/pricing/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    from: 'GUA',           // Guatemala City
    to: 'ATITLAN',         // Lake Atitlan
    passengers: 4,
    roundTrip: true
  })
})

const { pricing } = await response.json()
// {
//   from: "Guatemala City",
//   to: "Lake Atitlan",
//   distance: 120,
//   totalPrice: 1152,
//   breakdown: { ... }
// }
```

### Generate Invoice & Receipt

```javascript
// Invoice (any booking status)
const invoice = await fetch(`/api/bookings/${bookingId}/invoice`, {
  credentials: 'include'
})
const invoiceBlob = await invoice.blob()
// Download as invoice-{bookingId}.pdf

// Receipt (paid bookings only)
const receipt = await fetch(`/api/bookings/${bookingId}/receipt`, {
  credentials: 'include'
})
const receiptBlob = await receipt.blob()
// Download as receipt-{bookingId}.pdf
```

### Bulk Import Experiences

```javascript
const formData = new FormData()
formData.append('file', excelFile)

const response = await fetch('/api/experiences/bulk-import', {
  method: 'POST',
  credentials: 'include',
  body: formData
})

const { results } = await response.json()
// { created: 5, updated: 3, deleted: 1, errors: [] }
```

---

## 🏗️ Project Structure

```
flyin/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── bookings/      # Booking management + invoices/receipts/refunds
│   │   │   ├── pricing/       # Automated price calculator
│   │   │   ├── experiences/   # Experience management + bulk ops
│   │   │   ├── destinations/  # Destination management + bulk ops
│   │   │   └── users/         # User management
│   │   ├── admin/             # Admin dashboard
│   │   ├── dashboard/         # User dashboard
│   │   ├── book/              # Booking flow
│   │   ├── faq/               # FAQ page (bilingual)
│   │   └── page.tsx           # Landing page (hero + booking form + map)
│   ├── components/            # Reusable components
│   │   ├── mobile-nav.tsx     # Navigation with FAQ link
│   │   ├── PhotoGallery.tsx   # Image gallery with lightbox
│   │   ├── guatemala-maplibre.tsx  # Interactive map
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── mongodb.ts         # Database connection
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── auth-client.ts     # Auth helpers
│   │   └── i18n.ts            # Internationalization
│   ├── models/                # MongoDB Mongoose schemas
│   │   ├── User.ts            # User/Profile model
│   │   ├── Booking.ts         # Bookings with refund tracking
│   │   ├── Experience.ts      # Tour packages
│   │   ├── Destination.ts     # Locations
│   │   ├── Transaction.ts     # Payments and refunds
│   │   ├── Helicopter.ts      # Fleet management
│   │   └── ...
│   └── styles/                # Global styles
├── public/                    # Static assets
├── next.config.js             # Next.js config (remote images)
├── tailwind.config.js         # Design system (black/slate blue)
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
├── README.md                  # This file
└── SESSION_CHANGES.md         # Detailed changelog
```

---

## 🎨 Design System

### Colors
- **Primary Black**: `#000000` - Main backgrounds
- **Near Black**: `#161616` - Secondary backgrounds
- **Slate Blue**: `#455A64` - Accent color (matching flyinguate.com)
- **White**: `#F7F7F7` - Text on dark backgrounds

### Typography
- **Font Family**: Inter, system-ui
- **Headings**: Bold, tracking-wide
- **Body**: Normal weight, leading-relaxed

### Components
- **Border Radius**: `0px` (sharp corners) - Modern, premium aesthetic
- **Shadows**: Soft, layered elevation
- **Transitions**: `150ms ease` for interactions
- **Buttons**: Slate blue with hover states
- **Exception**: Circular elements (spinners, avatars) use `rounded-full`

---

## 📊 Automated Pricing

The pricing system uses the **Haversine formula** to calculate great-circle distances between GPS coordinates:

### Pricing Tiers

| Distance Range | Base Price | Per KM Rate |
|---------------|------------|-------------|
| 0-50 km       | $300       | $5/km       |
| 50-150 km     | $500       | $4/km       |
| 150-300 km    | $800       | $3.5/km     |
| 300+ km       | $1,200     | $3/km       |

### Modifiers
- **Additional Passengers**: +20% per passenger (after first)
- **Round Trip**: -10% discount on total

### Example Calculation
```
Route: Guatemala City → Lake Atitlan (120 km)
Passengers: 4
Round Trip: Yes

Base (50-150km tier): $500
Distance cost: 120 km × $4/km = $480
Subtotal: $980
Round trip (×2 - 10%): $1,764
Passengers (+60% for 3 extra): $2,822
```

---

## 📦 Bulk Operations Guide

### Export Workflow
1. Admin navigates to `/admin`
2. Clicks "Export Experiences" or "Export Destinations"
3. Selects format (Excel recommended, or CSV)
4. Downloads file with two sheets:
   - **Data sheet**: Current records
   - **Instructions sheet**: Field descriptions and formatting rules

### Import Workflow
1. Open exported Excel file
2. Edit data:
   - **New records**: Leave ID column blank
   - **Update records**: Keep existing ID
   - **Delete records**: Set `Action` column to "DELETE"
   - **Arrays**: Use semicolons (e.g., `tag1; tag2; tag3`)
   - **Booleans**: Use "Yes" or "No"
3. Save and upload via bulk import
4. Review results summary

### Field Formatting

**Array Fields** (Highlights, Tags, Images):
```
highlight 1; highlight 2; highlight 3
```

**Boolean Fields** (Is Active, Featured):
```
Yes, No, true, false, 1, 0  (all accepted)
```

**Image URLs**:
```
https://example.com/image1.jpg; https://example.com/image2.jpg
```

---

## 🔐 Security Features

- **JWT Authentication** - Secure, stateless sessions with required secret validation
- **Role-based Access Control** - User, Pilot, Admin roles
- **MongoDB Validation** - Schema-level data validation
- **Input Sanitization** - Prevents NoSQL injection with enum whitelisting
- **XSS Protection** - Sanitized outputs
- **CSRF Protection** - Built into Next.js
- **Secure Password Storage** - bcrypt hashing
- **Admin-only Routes** - Protected bulk operations and refunds
- **Atomic Operations** - Race condition prevention in payment processing
- **Error Sanitization** - Generic error messages (no stack traces exposed)
- **Standardized JWT Library** - Consistent jsonwebtoken usage across codebase

---

## 🌍 Internationalization

Full Spanish/English support:

```typescript
import { useTranslation } from '@/lib/i18n'

const { t, locale, setLocale } = useTranslation()

// Usage
<h1>{t('hero.title')}</h1>

// Switch language
setLocale('es') // or 'en'
```

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🚢 Deployment

### Vercel (Recommended)

The project auto-deploys to Vercel on push to main:

```bash
# Push to deploy
git add .
git commit -m "feat: your changes"
git push origin main
```

### Environment Variables on Vercel

Set these in Vercel dashboard:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/flyinguate
MONGODB_DB=flyinguate
JWT_SECRET=your-production-secret-change-this
NEXT_PUBLIC_APP_URL=https://flyinguate.vercel.app
```

---

## 📝 Recent Updates

### v2.1.0 - Security Audit & Design Refresh
- ✅ **Security Hardening** - Standardized JWT library, verified security measures
- ✅ **Sharp Corners Design** - Complete UI refresh from rounded to sharp edges
- ✅ **Atomic Payment Operations** - Race condition prevention verified
- ✅ **NoSQL Injection Prevention** - Enum validation for all query params
- ✅ **Error Sanitization** - Generic error messages across all routes
- ✅ 185 design updates across 6 pages, 12 components, core styles

### v2.0.0 - Admin Features & Bulk Operations
- ✅ Removed all emojis from UI for cleaner interface
- ✅ Redesigned landing page with full-screen hero
- ✅ Integrated booking form + interactive map side-by-side
- ✅ Added photo gallery with lightbox
- ✅ **FAQ Page** - Bilingual accordion-style FAQ (`/faq`)
- ✅ **Pricing Calculator** - Automated distance-based pricing
- ✅ **Invoice Generation** - PDF invoices for any booking
- ✅ **Receipt Generation** - PDF receipts for paid bookings
- ✅ **Refund Workflow** - Full/partial refunds with tracking
- ✅ **Bulk Export** - Excel/CSV export for experiences & destinations
- ✅ **Bulk Import** - Excel/CSV import with create/update/delete
- ✅ Installed: jspdf, papaparse, xlsx
- ✅ 8 new API endpoints
- ✅ MongoDB transaction support for refunds
- ✅ Next.js 15+ async params support

See [SESSION_CHANGES.md](SESSION_CHANGES.md) for complete details.

---

## 🐛 Known Issues / TODOs

1. **User Wallet Balance**: Refund to wallet feature commented out
   - User model needs `wallet_balance` field
   - Location: `src/app/api/bookings/[id]/refund/route.ts`

2. **Email Notifications**: Not yet implemented
   - Need SMTP configuration
   - Booking confirmations, status updates

3. **Payment Gateway**: Integration needed
   - Stripe or local payment processor
   - Currently manual payment tracking

4. **Admin Page Refactor**: `src/app/admin/page.tsx` is a 4000+ line monolith
   - Split into separate components per tab (bookings, users, pilots, etc.)
   - Add dark mode variants to all tables, modals, and form elements
   - Extract inline modals into reusable components

---

## 📞 Support

- **GitHub Issues**: [github.com/0xgasc/flyin/issues](https://github.com/0xgasc/flyin/issues)
- **Email**: info@flyinguate.com
- **Documentation**: See [SESSION_CHANGES.md](SESSION_CHANGES.md)

---

## 🙏 Acknowledgments

- **Next.js** - React framework with App Router
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Tailwind CSS** - Utility-first CSS framework
- **MapLibre GL** - Open-source interactive maps
- **OpenStreetMap** - Free map tiles
- **jsPDF** - Client-side PDF generation
- **XLSX** - Excel file processing

---

## 📄 License

Private repository - All rights reserved

---

**Built with ❤️ for FlyInGuate**

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
