import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { Contact } from '@/types/contact';

// ✅ Required for Vercel + mysql2
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Fetch single contact by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const pool = getPool();
    if (!pool) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    const { id } = await params;
    
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, message, createdAt FROM contacts WHERE id = ?',
      [id]
    ) as [Contact[], any];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET contact error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

// DELETE: Remove contact by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const pool = getPool();
    if (!pool) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    const { id } = await params;

    const [result] = await pool.execute(
      'DELETE FROM contacts WHERE id = ?',
      [id]
    );

    // @ts-expect-error - mysql2 returns affectedRows in result
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE contact error:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}