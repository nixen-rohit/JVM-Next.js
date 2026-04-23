// app/api/projects/navbar/route.ts

import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    // ✅ Single query - much faster than multiple requests
    const [projects] = await dbQuery<RowDataPacket[]>(
      `SELECT id, name, slug, status 
       FROM projects 
       WHERE is_published = 1 AND status != 'sold'
       ORDER BY name ASC
       LIMIT 10`
    );
    
    // Cache headers for browser
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Error fetching navbar projects:", error);
    return NextResponse.json([], { status: 500 });
  }
}