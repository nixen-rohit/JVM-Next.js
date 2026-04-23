// types/env.d.ts
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DB_HOST: string;
      DB_PORT?: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_CONNECTION_LIMIT?: string;
      
      // Auth
      JWT_SECRET: string;
      
      // Next.js
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}