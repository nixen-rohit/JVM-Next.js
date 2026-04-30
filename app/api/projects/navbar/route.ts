// app/api/projects/navbar/route.ts

import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { serverCache } from "@/lib/serverCache";

// Cache for 5 minutes (300 seconds)
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  try {
    // ✅ Check server cache first
    const cachedData = serverCache.get('navbar-projects', CACHE_DURATION);
    
    if (cachedData) {
      console.log("📦 Returning cached navbar data");
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }
    
    console.log("🌐 Fetching fresh navbar data from DB");
    
    // Only fetch minimal fields needed for navbar
    const [projects] = await dbQuery<RowDataPacket[]>(
      `SELECT id, name, slug 
       FROM projects 
       WHERE is_published = 1 
       ORDER BY name ASC
       LIMIT 15`  // Limit for performance
    );
    
    // Store in cache
    serverCache.set('navbar-projects', projects);
    
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error("Error fetching navbar projects:", error);
    return NextResponse.json([], { status: 500 });
  }
}