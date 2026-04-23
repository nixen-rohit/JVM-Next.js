// app/api/projects/slugs/route.ts

import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [projects] = await dbQuery<RowDataPacket[]>(
      `SELECT slug FROM projects WHERE is_published = 1 AND status != 'sold'`
    );
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching slugs:", error);
    return NextResponse.json([], { status: 500 });
  }
}