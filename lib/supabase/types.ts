/**
 * @file lib/supabase/types.ts
 * @description Generated Supabase types — regenerate after every migration:
 *                pnpm db:types
 *              Until first migration runs, this file exposes a stub Database type
 *              so the rest of the code compiles. DO NOT hand-edit after migrations land.
 * @phase 0/1
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Stub Database type — replaced by `pnpm db:types` once migrations land.
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
