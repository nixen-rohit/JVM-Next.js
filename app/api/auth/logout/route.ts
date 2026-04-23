import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

// ✅ Required for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}