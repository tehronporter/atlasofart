# Phase 11: Supabase Setup Instructions

## Step 1: Run SQL Schema in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `bcowrwjtruoprerpiyzg`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `lib/supabase/schema.sql`
6. Click **Run** (or Ctrl+Enter)

This will create:
- `artworks` table
- `tags` table  
- `artwork_tags` junction table
- `user_profiles` table
- `collections` table
- `collection_items` table
- `favorites` table
- `view_history` table
- `ingestion_log` table
- All indexes and RLS policies

## Step 2: Run Seed Data Migration

After the schema is created, run:

```bash
npm run migrate-seed
```

This will migrate the 25 seed artworks to your Supabase database.

## Step 3: Verify Migration

Check your Supabase dashboard:
- Go to **Table Editor**
- Select `artworks` table
- You should see 25 rows

## Step 4: Continue Build

After migration succeeds:

```bash
npm run build
```

---

## Manual Alternative

If you prefer to set up manually without the migration script:

1. In Supabase Table Editor, click **Insert** on `artworks` table
2. Manually add artworks using the schema fields
3. Add tags to `tags` table
4. Link them in `artwork_tags` table

But using the migration script is recommended.
