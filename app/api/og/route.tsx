// app/api/og/route.tsx - Dynamic OpenGraph image generation
// Phase 17: Social sharing with dynamic OG images

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Atlas of Art';
    const culture = searchParams.get('culture') || '';
    const year = searchParams.get('year') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            padding: '40px',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 'bold', color: '#f59e0b', marginBottom: 20 }}>
            {title}
          </div>
          {(culture || year) && (
            <div style={{ fontSize: 36, color: '#a3a3a3' }}>
              {[culture, year].filter(Boolean).join(' • ')}
            </div>
          )}
          <div style={{ marginTop: 60, fontSize: 24, color: '#737373' }}>
            Atlas of Art
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
