// app/api/hero-slides/route.ts - MAIN ROUTER (simplified)
import { NextRequest, NextResponse } from 'next/server';
import { handleGET } from './handlers/GET';
import { handlePOST } from './handlers/POST';
import { handlePUT } from './handlers/PUT';
import { handleDELETE } from './handlers/DELETE';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST request received');
    const result = await handlePOST(request);
    console.log('📤 POST response sent');
    return result;
  } catch (error: any) {
    console.error('💥 Uncaught POST error:', error);
    console.error('💥 Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error.stack },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📥 PUT request received');
    const result = await handlePUT(request);
    console.log('📤 PUT response sent');
    return result;
  } catch (error: any) {
    console.error('💥 Uncaught PUT error:', error);
    console.error('💥 Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error.stack },
      { status: 500 }
    );
  }
}

// Keep GET and DELETE as before
export async function GET(request: NextRequest) {
  return handleGET(request);
}

export async function DELETE(request: NextRequest) {
  return handleDELETE(request);
}