# 🏛️ Atlas of Art

**Explore art history across time and space** — from ancient civilizations to modern masterpieces, all on an interactive world map.

🔗 **Live Demo:** [Deploy to Vercel](#deployment)  
📁 **Tech Stack:** Next.js 16, Supabase, Mapbox GL, TypeScript  
🎨 **Data Source:** Getty Museum Open Content API + Custom Seed Data

---

## ✨ Features

- 🗺️ **Interactive World Map** - Dark-themed globe with artwork markers
- 🕐 **Timeline Filtering** - Filter by time period (2500 BCE - Present)
- 🔍 **Advanced Search** - Search by title, culture, medium, region, tags
- ❤️ **Favorites & Collections** - Save and organize your favorite artworks
- 👤 **User Authentication** - Email/password sign-up and login
- 🤖 **AI Chat Assistant** - Art history Q&A (LLM-ready)
- 📊 **Analytics Dashboard** - Track views and engagement
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Related Works** - Discover connected artworks automatically

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Mapbox access token (free)

### 1. Clone & Install

```bash
git clone https://github.com/tehronporter/atlasofart.git
cd atlasofart
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### 3. Setup Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql`
3. Run `supabase/schema-14-auth.sql`

### 4. Seed Test Data

```bash
node scripts/seed-test-data.js
```

### 5. Run Dev Server

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
atlasofart/
├── app/
│   ├── page.tsx              # Main map view
│   ├── admin/page.tsx        # Admin dashboard
│   ├── analytics/page.tsx    # Analytics
│   ├── chat/page.tsx         # AI chat
│   ├── collections/page.tsx  # User collections
│   ├── favorites/page.tsx    # Bookmarks
│   ├── login/page.tsx        # Authentication
│   └── api/                  # API routes
├── components/
│   ├── map/                  # Map components
│   ├── drawer/               # Artwork detail drawer
│   ├── search/               # Search UI
│   ├── auth/                 # Auth components
│   └── controls/             # Timeline, filters
├── lib/
│   ├── supabase/             # Database client
│   ├── getty/                # Getty API client
│   ├── auth.ts               # Auth utilities
│   └── utils.ts              # Helpers
├── scripts/
│   ├── seed-test-data.js     # Test data seeder
│   └── ingest-getty.ts       # Getty ingestion
└── supabase/
    ├── schema.sql            # Main schema
    └── schema-14-auth.sql    # Auth schema
```

---

## 🗂️ Database Schema

### Tables

- **artworks** - Artwork metadata (Getty + custom)
- **profiles** - User profiles (extends auth.users)
- **collections** - User-created collections
- **collection_items** - Artworks in collections
- **favorites** - User bookmarked artworks
- **artwork_views** - View analytics
- **ingestion_logs** - Getty import logs

### Key Features

- Row Level Security (RLS) enabled
- Full-text search indexes
- Automatic profile creation on signup
- Geospatial queries supported

---

## 🎨 Getty Ingestion

Import 1000s of artworks from Getty Museum:

```bash
# Via admin UI
Visit http://localhost:3000/admin
Click "Start Ingestion"

# Via API
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"batchSize":100,"maxPages":10}'
```

**Note:** Getty API rate limits to ~100 requests/minute

---

## 🔐 Authentication

### Sign Up / Login

- Email/password authentication
- Automatic profile creation
- Secure password hashing (Supabase Auth)

### User Features

- Create public/private collections
- Bookmark favorites
- Track viewing history
- Share collections

---

## 📊 Analytics

Track engagement:

- Total artworks and views
- Most viewed artworks
- Geographic distribution
- User activity (favorites, collections)

Visit `/analytics` for dashboard.

---

## 🤖 AI Chat

Ready for LLM integration:

```typescript
// Add to .env.local
OPENAI_API_KEY=sk-...

// Then update app/chat/page.tsx
import OpenAI from 'openai';
```

Supported providers:
- OpenAI GPT-4
- Anthropic Claude
- Together AI
- Ollama (self-hosted)

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Vercel)

Set in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

### Post-Deploy Checklist

- [ ] Run Supabase migrations
- [ ] Trigger Getty ingestion
- [ ] Test authentication
- [ ] Verify map loads
- [ ] Check mobile responsiveness

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

### Adding More Artworks

```sql
INSERT INTO artworks (title, date, date_start, culture, region, medium, latitude, longitude, description)
VALUES ('Your Artwork', 'c. 2000', 2000, 'Culture', 'Region', 'Medium', lat, lng, 'Description');
```

---

## 📸 Screenshots

### Main Map
Interactive globe with artwork markers

### Artwork Detail
Rich metadata with related works

### User Dashboard
Collections and favorites management

---

## 📄 License

MIT License - feel free to use for personal or commercial projects

---

## 🙏 Acknowledgments

- **Getty Museum** - Open Content API
- **Mapbox** - World map rendering
- **Supabase** - Database and auth
- **Next.js** - React framework

---

## 📞 Support

- **Issues:** GitHub Issues
- **Documentation:** `/docs` folder
- **Demo:** Deploy to Vercel with one click

---

**Built with ❤️ by Hermes Agent**  
*Phases 1-17 Complete | Production Ready*
