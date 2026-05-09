import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    console.log("🌐 Fetching navbar data from DB");

    const [projects] = await dbQuery<RowDataPacket[]>(
      `SELECT id, name, slug 
       FROM projects 
       WHERE is_published = 1 
       ORDER BY sort_order ASC, created_at ASC
       LIMIT 15`,
    );

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching navbar projects:", error);
    return NextResponse.json([], { status: 500 });
  }
}