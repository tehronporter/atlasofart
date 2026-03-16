# Atlas of Art — Deployment Checklist

## Purpose
This checklist covers the clean path from local MVP to a live Vercel deployment.

## Before deploy
- [ ] Code is committed locally
- [ ] GitHub repo exists
- [ ] Project is pushed to GitHub
- [ ] `.env.local` works locally
- [ ] Required environment variables are identified
- [ ] Local production build has been tested if possible

## Required environment variables
For MVP:
- [ ] `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

Optional later:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Vercel steps
- [ ] Import the GitHub repo into Vercel
- [ ] Add environment variables in Vercel project settings
- [ ] Trigger first deployment
- [ ] Verify successful production build

## After deploy
- [ ] Open the deployed app
- [ ] Confirm map loads in production
- [ ] Confirm markers render
- [ ] Confirm drawer works
- [ ] Confirm timeline works
- [ ] Confirm there are no missing environment variable issues

## MVP deploy rule
Do not block deployment waiting for:
- Supabase integration
- Getty ingestion
- advanced polish
- non-essential features
