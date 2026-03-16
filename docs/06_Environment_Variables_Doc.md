# Atlas of Art — Environment Variables Doc

## Purpose
This document lists every environment variable needed for the Atlas of Art MVP, where it comes from, and where it should be used.

## MVP Rule
Only include environment variables that are actually needed for the focused MVP.

## Required for MVP

### `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
Purpose:
- Authenticates the client-side Mapbox map in the Next.js app.

Source:
- Your Mapbox account dashboard.

Used in:
- Frontend map component.
- Any file that initializes Mapbox GL JS.

Example:
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token_here
```

Why it is public:
- This is a browser-used token and is expected to be exposed to the frontend.
- Do not put secret admin keys in public env vars.

## Optional for later, not required on day one

### `NEXT_PUBLIC_SUPABASE_URL`
Purpose:
- Connects the frontend to your Supabase project.

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
Purpose:
- Public anon key used by the frontend to talk to Supabase.

Example:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Note:
- Supabase is not required for the very first local-seed MVP.
- Add these only when you begin moving from local data to remote data.

## Not needed for current MVP
Do not add these yet:
- Getty API keys
- geocoding service keys
- analytics keys
- auth provider secrets
- server-side admin keys

## File setup

### Local development file
Create:
```bash
.env.local
```

Suggested initial contents:
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token_here
```

### Production
In Vercel, add the same environment variables in the project settings.

## Security rules
- Never commit private secrets.
- Public keys that must be used in the browser should use the `NEXT_PUBLIC_` prefix.
- Secret server-only credentials should never use `NEXT_PUBLIC_`.

## MVP minimum
For the first build, you only need:
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
