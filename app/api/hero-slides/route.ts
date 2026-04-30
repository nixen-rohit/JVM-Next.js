// app/api/hero-slides/route.ts - MAIN ROUTER (simplified)
import { NextRequest, NextResponse } from 'next/server';
import { handleGET } from './handlers/GET';
import { handlePOST } from './handlers/POST';
import { handlePUT } from './handlers/PUT';
import { handleDELETE } from './handlers/DELETE';

export async function GET(request: NextRequest) {
  return handleGET(request);
}

export async function POST(request: NextRequest) {
  return handlePOST(request);
}

export async function PUT(request: NextRequest) {
  return handlePUT(request);
}

export async function DELETE(request: NextRequest) {
  return handleDELETE(request);
}