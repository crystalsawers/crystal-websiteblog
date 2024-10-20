// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchAllCollections } from '../../../lib/searchUtils';

export async function POST(req: NextRequest) {
  const { keyword } = await req.json();

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    const results = await searchAllCollections(keyword);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
