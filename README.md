# Esahayak - Buyer Lead Management System

A comprehensive buyer lead management system built with Next.js 15, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone & Install
```bash
git clone <repository-url>
cd esahayak
npm install --legacy-peer-deps
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup
Run the migration scripts in your Supabase SQL editor:
```bash
# Copy contents from migrations/001_initial_schema.sql
# Run in Supabase Dashboard > SQL Editor
```

### 4. Run Locally
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── buyers/        # Buyer CRUD operations
│   │   └── hello/         # Test endpoint
│   ├── buyers/            # Buyer management pages
│   │   └── new/           # Create new buyer form
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utilities
│   └── supabase.ts        # Supabase client config
└── components/            # React components (future)
```

## 🗄️ Database Schema

### Buyers Table
```sql
buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  city text,
  property_type text,
  bhk integer,
  purpose text,
  budget_min integer,
  budget_max integer,
  timeline text,
  source text,
  notes text,
  tags text[],
  owner_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Buyer History Table
```sql
buyer_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES buyers(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
)
```

## 🏗️ Design Architecture

### Validation Strategy
- **Client-side**: Real-time form validation using React state
- **Server-side**: API route validation before database operations
- **Schema**: Zod schemas for type-safe validation (future enhancement)

### Rendering Strategy
- **SSR**: Server components for data fetching and SEO
- **Client**: Interactive forms and dynamic UI components
- **API Routes**: Server-side business logic and database operations

### Ownership Enforcement
- **User Context**: All records tied to `owner_id`
- **API Security**: Server-side ownership checks on all operations
- **History Tracking**: Audit trail for all data modifications

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📋 Features

### ✅ Implemented
- Create new buyer leads with validation
- Supabase integration
- Form validation (client + server)
- Database schema with history tracking
- TypeScript support
- Tailwind CSS styling
- Authentication system
- Lead listing and search
- Edit/delete operations
- CSV import/export
- Advanced filtering
- Dashboard analytics

## 🔧 API Endpoints

### Buyers
- `POST /api/buyers` - Create new buyer lead
- `GET /api/hello` - Test Supabase connection

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Components**: Custom components with Tailwind classes
- **Theme**: CSS variables for consistent theming
- **Responsive**: Mobile-first responsive design

## 🔒 Security

- Environment variables for sensitive data
- Server-side validation on all inputs
- Ownership-based access control
- SQL injection protection via Supabase client

## 🐛 Troubleshooting

### Tailwind CSS not working
1. Restart development server: `npm run dev`
2. Check `tailwind.config.ts` syntax
3. Verify `globals.css` imports Tailwind directives

### Supabase connection issues
1. Verify credentials in `.env.local`
2. Check Supabase project status
3. Ensure database tables exist

### Form validation errors
1. Check browser console for client errors
2. Verify API response in Network tab
3. Check server logs for validation failures

## 📝 Development Notes

- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Implement server-side validation for all forms
- Add history tracking for data changes
- Use Supabase RLS for production security