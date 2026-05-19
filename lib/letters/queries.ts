/**
 * @file lib/letters/queries.ts
 * @description Read queries — sender sees always, recipient sees only delivered.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";
import { extractDocText } from "@/lib/letters/schema";

export interface Letter {
  id: string;
  account_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  /** Tiptap doc JSON ({type:"doc",content:[...]}) or legacy {type:"text",content:string}. */
  body: unknown;
  scheduled_for: string;
  delivered_at: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export async function listLetters(): Promise<Letter[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .order("scheduled_for", { ascending: false });

  if (error) throw new Error(`Không tải được thư: ${error.message}`);
  return (data ?? []) as unknown as Letter[];
}

export async function getLetter(id: string): Promise<Letter | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("letters").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Không tải được thư: ${error.message}`);
  return (data as unknown as Letter | null) ?? null;
}

/**
 * Extract plain-text body content for previews. Handles both Tiptap docs and
 * the legacy {type:"text",content:string} wrapper.
 */
export function getLetterText(letter: Letter): string {
  const body = letter.body;
  if (typeof body !== "object" || body === null) return "";
  const obj = body as { type?: string; content?: unknown };
  if (obj.type === "doc") return extractDocText(body);
  if (obj.type === "text" && typeof obj.content === "string") return obj.content;
  return "";
}
