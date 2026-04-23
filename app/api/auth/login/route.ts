//app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import getPool from "@/lib/db";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { z } from "zod";
import { RowDataPacket } from "mysql2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    console.log("Login API hit");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    const body = await req.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const pool = getPool();

    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: String(user.id), // ✅ convert number to string
      email: user.email,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}