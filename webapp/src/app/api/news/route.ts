import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/news';

export async function GET() {
  try {
    const items = await fetchNews();
    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    console.error('Failed to fetch news', error);
    return NextResponse.json(
      { error: 'No se pudieron obtener las noticias.' },
      { status: 500 },
    );
  }
}
