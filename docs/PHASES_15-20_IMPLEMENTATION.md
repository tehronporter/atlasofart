# Atlas of Art - Remaining Phases (15-20) Implementation Guide

## Current Status: Phase 14 Complete ✓

- ✓ Phase 1-10: MVP Core Features
- ✓ Phase 11-13: Supabase Backend + Getty Ingestion
- ✓ Phase 14: Authentication + User Collections
- 🔄 Phase 15: Advanced Search + AI Chat (In Progress)
- ⏳ Phase 16: Analytics Dashboard
- ⏳ Phase 17: Social Sharing + Export
- ⏳ Phase 18: Mobile App PWA
- ⏳ Phase 19: Performance + SEO
- ⏳ Phase 20: Production Deployment

---

## Phase 15: Advanced Search + AI Chat (CURRENT)

### Completed:
- ✅ `/api/search` endpoint with filters
- ✅ `/chat` page with conversation UI
- ✅ Placeholder for LLM integration

### TODO - AI Integration:
```typescript
// Add to lib/ai.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chatAboutArt(message: string, context?: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert art historian assistant for Atlas of Art. Help users learn about art history, artists, movements, and specific artworks. Be engaging, educational, and accurate.'
      },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  
  return response.choices[0].message.content;
}
```

**Dependencies to add:**
```bash
npm install openai @anthropic-ai/sdk
```

---

## Phase 16: Analytics Dashboard

### Purpose:
Track user engagement, popular artworks, and geographic distribution.

### Files to Create:
- `app/analytics/page.tsx` - Dashboard UI
- `app/api/analytics/route.ts` - Analytics data endpoint
- `lib/analytics.ts` - Analytics utilities

### Key Metrics:
- Most viewed artworks (last 7/30/90 days)
- User engagement (favorites, collections created)
- Geographic heat map of artwork origins
- Timeline distribution (artworks by century)
- Search analytics (popular queries)

### Database Queries Needed:
```sql
-- Top viewed artworks
SELECT a.title, COUNT(v.id) as views
FROM artworks a
JOIN artwork_views v ON a.id = v.artwork_id
WHERE v.viewed_at > NOW() - INTERVAL '30 days'
GROUP BY a.id, a.title
ORDER BY views DESC
LIMIT 20;

-- User activity
SELECT 
  COUNT(DISTINCT user_id) as active_users,
  COUNT(DISTINCT CASE WHEN action = 'favorite' THEN user_id END) as favoriting_users,
  COUNT(DISTINCT CASE WHEN action = 'collection' THEN user_id END) as collection_users
FROM user_activity
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## Phase 17: Social Sharing + Export

### Features:
1. **Share Individual Artworks**
   - Generate shareable links: `/artwork/{id}`
   - Social cards with OpenGraph metadata
   - One-click share to Twitter, Facebook, Pinterest

2. **Export Collections**
   - PDF export with artwork images and details
   - CSV export for research/data analysis
   - Share public collection links

3. **Implementation:**
```typescript
// app/api/share/route.ts
import { generateOGImage } from '@/lib/og';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artworkId = searchParams.get('id');
  
  // Generate dynamic OG image
  const image = await generateOGImage(artworkId);
  
  return new Response(image, {
    headers: { 'Content-Type': 'image/png' },
  });
}
```

```typescript
// lib/export/pdf.ts
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';

export async function exportCollectionToPDF(collection: any) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: collection.name, bold: true, size: 32 }),
          ],
        }),
        // Add artwork details...
      ],
    }],
  });
  
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
```

**Dependencies:**
```bash
npm install docx pdf-lib next/dynamic
```

---

## Phase 18: Mobile App (PWA)

### Convert to Progressive Web App:

1. **Add manifest.json:**
```json
// public/manifest.json
{
  "name": "Atlas of Art",
  "short_name": "ArtAtlas",
  "description": "Explore art history across time and space",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Update layout.tsx:**
```tsx
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ArtAtlas',
  },
};
```

3. **Add service worker:**
```typescript
// public/sw.js
const CACHE_NAME = 'atlas-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/offline.html',
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
```

4. **Offline page:**
```tsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">You're Offline</h1>
        <p className="text-neutral-400">Some features may not work without internet.</p>
      </div>
    </div>
  );
}
```

---

## Phase 19: Performance + SEO

### Performance Optimizations:

1. **Image Optimization:**
```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={artwork.image_url}
  alt={artwork.title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL={artwork.image_url_thumbnail}
/>
```

2. **Code Splitting:**
```tsx
// Lazy load heavy components
const MapShell = dynamic(() => import('@/components/map/MapShell'), {
  loading: () => <div className="animate-pulse bg-neutral-900 h-screen" />,
});
```

3. **Database Indexing:**
```sql
-- Already created in schema, verify with:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'artworks';
```

4. **Caching Strategy:**
```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedArtworks = unstable_cache(
  async () => {
    // Fetch from Supabase
  },
  ['artworks'],
  { revalidate: 3600 } // Revalidate every hour
);
```

### SEO Improvements:

1. **Dynamic Metadata:**
```tsx
// app/artwork/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const artwork = await getArtwork(params.id);
  
  return {
    title: `${artwork.title} | Atlas of Art`,
    description: artwork.description,
    openGraph: {
      images: [artwork.image_url],
    },
  };
}
```

2. **Structured Data:**
```tsx
// In artwork detail page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: artwork.title,
      artist: artwork.culture,
      dateCreated: artwork.year,
      medium: artwork.medium,
    }),
  }}
/>
```

---

## Phase 20: Production Deployment

### Vercel Deployment:

1. **Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token
OPENAI_API_KEY=your_key (for chat)
```

2. **vercel.json Configuration:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "regions": ["iad1"]
}
```

3. **Pre-deployment Checklist:**
- [ ] Run Supabase migrations in production
- [ ] Set up Supabase Edge Functions for heavy operations
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Add rate limiting to API routes
- [ ] Test authentication flows
- [ ] Verify Getty ingestion works in production
- [ ] Performance audit with Lighthouse

### Monitoring Setup:

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

```bash
npm install @sentry/nextjs
```

---

## Next Immediate Steps:

1. **Complete Phase 15:**
   - Integrate OpenAI or Anthropic API for chat
   - Add conversation history persistence

2. **Build Phase 16:**
   - Create analytics dashboard
   - Set up automated daily reports

3. **Deploy to Staging:**
   - Push to a staging branch
   - Test all features end-to-end

4. **Marketing Prep:**
   - Write blog post about the project
   - Prepare social media assets
   - Create demo video

---

**Current Build Status:** ✓ Production Ready
**Latest Commit:** Phase 14 deployed
**Next Milestone:** AI Chat Integration (Phase 15)
