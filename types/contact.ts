// types/contact.ts

// ✅ Input type for POST /api/contacts (form submissions)
export type CreateContactInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

// ✅ Output type for GET /api/contacts (database records)
export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;   // DB returns null, not undefined
  message: string;
  createdAt: string;      // mysql2 returns DATETIME as string
};

// ✅ Optional: API Response Types (for stricter typing)
export type ContactSuccessResponse = {
  success: true;
  id: string;
};

export type ContactErrorResponse = {
  error: string;
};