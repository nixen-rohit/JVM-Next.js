//app/api/projects/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleGET } from "./handlers/GET";
import { handlePUT } from "./handlers/PUT";
import { handleDELETE } from "./handlers/DELETE";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleGET(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handlePUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleDELETE(request, { params });
}