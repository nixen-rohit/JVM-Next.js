// lib/id.ts
import { randomUUID } from 'crypto';

export function generateHashId(): string {
  // Standard UUIDv4: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  return randomUUID();
}

// Optional: Shorter 16-char hex ID if you prefer compact URLs
export function generateShortId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 16);
}

 