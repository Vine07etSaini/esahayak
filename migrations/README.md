# Database Migrations

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize

### 2. Run Initial Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `001_initial_schema.sql`
4. Run the SQL script

### 3. Verify Setup
Check that tables were created:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('buyers', 'buyer_history');

-- Check sample data
SELECT count(*) FROM buyers;
```

### 4. Get API Keys
1. Go to Settings > API
2. Copy Project URL and anon/public key
3. Add to `.env.local`

## Migration Files

- `001_initial_schema.sql` - Creates buyers and buyer_history tables with constraints
- Future migrations will be numbered sequentially

## Database Constraints

### Buyers Table
- `full_name`: Minimum 2 characters
- `email`: Valid email format (optional)
- `phone`: 10-15 digits only
- `property_type`: Must be Apartment, Villa, Plot, or Commercial
- `bhk`: Required for Apartment/Villa types
- `budget_max`: Must be >= budget_min when both provided
- `timeline`: Predefined options only

### Indexes
- Performance indexes on commonly queried fields
- Foreign key indexes for joins

## Troubleshooting

### Common Issues
1. **UUID extension error**: Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
2. **Permission denied**: Ensure you're using the correct Supabase project
3. **Constraint violations**: Check sample data matches constraints

### Reset Database
```sql
-- WARNING: This will delete all data
DROP TABLE IF EXISTS buyer_history CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
-- Then re-run 001_initial_schema.sql
```