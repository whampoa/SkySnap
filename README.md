# SkySnap - Drone Services Marketplace

A marketplace MVP for drone photography services in NSW, Australia. Built with Next.js 16, Supabase, Tailwind CSS, and Mapbox.

## Features

- **Role-Based Authentication**: Users sign up as either Clients or Pilots
- **Job Posting**: Clients can post drone service jobs with location selection via Mapbox
- **Job Categories**: Real Estate, Roof Inspections, Agriculture
- **Bidding System**: Pilots browse and bid on jobs; clients can accept bids
- **CASA Compliance**: Safety disclosure component with Australian drone regulations
- **Trust Badges**: Verified RePL pilots display trust badges with ARN numbers
- **NSW Focus**: Region filtering for Sydney, Newcastle, Wollongong, and more

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **Icons**: Lucide React

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable the PostGIS extension in Database → Extensions
3. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`

### 4. Get a Mapbox Token

1. Create an account at [mapbox.com](https://www.mapbox.com)
2. Create a new access token with default public scopes
3. Add it to your `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── jobs/
│   │   ├── [id]/page.tsx
│   │   ├── new/page.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/           # Base UI components
│   ├── bid-form.tsx
│   ├── bids-list.tsx
│   ├── header.tsx
│   ├── job-card.tsx
│   ├── job-map.tsx
│   ├── jobs-filter.tsx
│   ├── location-picker.tsx
│   ├── safety-disclosure.tsx
│   └── trust-badge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── types/
│   └── database.ts
└── middleware.ts
```

## Database Schema

### Tables

- **profiles**: User profiles with role (client/pilot), ARN number, verification status
- **jobs**: Job listings with category, location (PostGIS), budget range, deadline
- **bids**: Pilot bids on jobs with amount, delivery time, status

### Row Level Security

- Users can only view/edit their own profiles
- Open jobs are visible to everyone
- Bids are only visible to the pilot who placed them and the job owner
- Only clients can post jobs; only pilots can place bids

## CASA Compliance Notice

This application includes information about CASA (Civil Aviation Safety Authority) regulations for drone operations in Australia:

- Maximum height: 120 metres (400 feet) above ground level
- Minimum distance: 30 metres from other people
- Airport restriction: 5.5km from controlled aerodromes

For full regulations, visit [casa.gov.au/drones](https://www.casa.gov.au/drones)

## License

MIT
