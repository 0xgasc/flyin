# FlyInGuate - Helicopter Tour & Transport Platform

## Overview
FlyInGuate is a comprehensive platform for managing helicopter tours and transport services in Guatemala. Built with Next.js 15, TypeScript, Supabase, and IRYS decentralized storage.

## Live Site
🚁 **Production:** [https://flyinguate.vercel.app](https://flyinguate.vercel.app)

## Key Features

### Public Features
- **Helicopter Booking System** - Book transport or tour experiences
- **Experience Catalog** - Browse helitours with photos and details  
- **Destinations Directory** - Explore locations across Guatemala
- **Real-time Availability** - Check pilot and helicopter schedules
- **Multi-language Support** - English and Spanish interfaces

### Admin Panel (`/admin`)
- **Booking Management** - Approve/reject bookings, assign pilots
- **Experience Management** - CRUD operations with IRYS image uploads
- **Destination Management** - Manage locations and images
- **User Management** - Handle clients, pilots, and admin roles
- **Helicopter Fleet** - Track maintenance and availability
- **Financial Analytics** - Revenue tracking and reporting
- **Calendar View** - Visual booking schedule

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Storage:** IRYS decentralized storage for images
- **Deployment:** Vercel
- **Maps:** Mapbox GL

## Database Schema

### Core Tables
- `profiles` - User profiles with roles (client, pilot, admin)
- `bookings` - Transport and experience bookings
- `experiences` - Helitour packages with pricing tiers
- `destinations` - Location information with coordinates
- `helicopters` - Fleet information
- `financial_transactions` - Payment tracking
- `maintenance_records` - Helicopter maintenance logs
- `experience_images` - Multiple images per experience
- `destination_images` - Multiple images per destination

### Pricing Tiers
Experiences support multiple helicopter configurations:
- Robinson R66 (1-2 passengers)
- Robinson R66 (3-4 passengers)  
- Airbus H125 (4-5 passengers)
- Robinson R66 x2 (6 passengers)
- Robinson + Airbus (8-10 passengers)

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# IRYS Storage
PRIVATE_KEY=
SEPOLIA_RPC=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Authentication Troubleshooting

### Clearing Persistent Auth Issues
If you experience login issues or infinite loading:

1. **Quick Clear:** Visit `/clear-auth` - Clears Supabase session and auth store
2. **Force Clear:** Visit `/force-clear` - Nuclear option that clears everything:
   - Supabase auth tokens
   - localStorage/sessionStorage
   - Cookies
   - IndexedDB
   - Service worker cache
3. **Admin Bypass:** Visit `/admin-bypass` - Complete auth reset with redirect

### Debug Mode
In development, a debug panel appears in bottom-right showing:
- Current auth state
- User email
- Profile role
- Force sign out button

## Data Import

### Bulk Import Script
Import experiences and destinations from CSV with images:

```bash
# Ensure CSV is at: scripts/experiences-data.csv
# Images in: /Users/gs/Downloads/FlyInGuate Paquetes/
npm run import-experiences
```

The script:
- Parses CSV data with pricing tiers
- Uploads images to IRYS
- Creates database records
- Handles metadata and relationships

## Admin Features

### Experience Management
- Create/edit/delete experiences
- Upload multiple images via IRYS
- Set primary images
- Manage pricing for different helicopters
- Toggle active/inactive status

### Booking Management  
- Filter by status (pending, approved, completed, cancelled)
- Assign pilots to bookings
- Add admin notes
- Update payment status
- View client details

### Destinations
- Add new destinations with coordinates
- Upload destination images
- Manage metadata
- Set featured destinations

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

## Deployment

The project auto-deploys to Vercel on push to main branch.

```bash
# Manual deployment
git add .
git commit -m "feat: your changes"
git push origin main
```

## Security

- Row Level Security (RLS) enabled on all tables
- Admin-only access for management features
- Public read access for experiences/destinations
- Authenticated access for bookings
- Service role key only used for admin operations

## Known Issues & Solutions

### Auth State Persistence
- Chrome may cache auth aggressively
- Use `/force-clear` for complete reset
- Clear Chrome site data manually if needed

### Experience Deletion
- Check for related bookings first
- System warns about foreign key constraints
- Deletes cascade for experience_images

### Image Upload
- IRYS has 50MB file size limit
- Fallback to URL input if IRYS fails
- Images stored on Arweave blockchain

## Support

For issues or questions:
- GitHub Issues: [github.com/0xgasc/flyin/issues](https://github.com/0xgasc/flyin/issues)
- Admin Support: Contact system administrator

## License

Private repository - All rights reserved