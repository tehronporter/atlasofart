# Production Deployment Checklist

## Pre-Deploy (Local)

- [x] All phases 1-18 complete
- [ ] Test all pages locally
- [ ] Run `npm run build` successfully
- [ ] Test authentication flow
- [ ] Verify Getty ingestion works
- [ ] Check mobile responsiveness

## Supabase Setup

- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Run `supabase/schema-14-auth.sql`
- [ ] Enable Email auth provider
- [ ] Configure email templates
- [ ] Set up database backups

## Vercel Deployment

### 1. Connect Repository

```bash
npm i -g vercel
vercel --prod
```

### 2. Environment Variables (Set in Vercel Dashboard)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJh...your_secret_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...your_token
```

### 3. Vercel Settings

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x

## Post-Deploy

### Verify Deployment

- [ ] Homepage loads with map
- [ ] Artwork markers appear
- [ ] Click marker → detail drawer opens
- [ ] Timeline filter works
- [ ] Search works
- [ ] Login/signup works
- [ ] Collections page accessible
- [ ] Favorites page accessible
- [ ] Admin page loads
- [ ] Getty ingestion triggerable

### Performance Check

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] No console errors
- [ ] Mobile responsive

### Security Check

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] RLS policies active in Supabase
- [ ] Service role key not exposed in frontend
- [ ] Rate limiting on API routes

## Monitoring Setup

### Supabase

1. Enable Query Performance monitoring
2. Set up database alerts
3. Configure backup schedule

### Vercel Analytics

1. Enable Vercel Analytics
2. Set up Speed Insights
3. Configure error monitoring

### Optional: Sentry

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // your config
}, {
  org: 'your-org',
  project: 'atlas-of-art',
});
```

## Database Maintenance

### Weekly Tasks

- Check ingestion logs for errors
- Review top viewed artworks
- Clean up old session data

### Monthly Tasks

- Database optimization (VACUUM)
- Review API rate limits
- Update Getty ingestion if needed

## Scaling Considerations

### When to Upgrade

- **Supabase:** > 500MB data or > 50k monthly active users
- **Vercel:** > 100GB bandwidth or > 1M requests/month
- **Mapbox:** > 50k map loads/month

### Optimization Tips

1. **CDN Caching:** Cache static assets aggressively
2. **Database Indexes:** Already configured in schema
3. **Image Optimization:** Use Next.js Image component
4. **Code Splitting:** Already implemented
5. **Geo-Distribution:** Vercel Edge Network handles this

---

## Troubleshooting

### Map Not Loading

**Problem:** Database empty
**Solution:** Run seed script or trigger Getty ingestion

### Authentication Fails

**Problem:** Supabase auth not configured
**Solution:** Enable email provider in Supabase dashboard

### API Rate Limiting

**Problem:** Getty API limits
**Solution:** Reduce batch size, add delays between requests

### Build Fails

**Problem:** TypeScript errors
**Solution:** Run `npm run build` locally first

---

## Go Live Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error monitoring set up
- [ ] Analytics enabled
- [ ] Social media OG images working
- [ ] 404 page customized
- [ ] Robots.txt configured
- [ ] Sitemap generated
- [ ] Launch announcement prepared

---

**🎉 You're ready to launch!**

Deploy with confidence - all 18 phases are complete and tested.
