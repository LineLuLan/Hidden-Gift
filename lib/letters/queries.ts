/**
 * @file lib/letters/queries.ts
 * @description Read queries — sender sees always, recipient sees only delivered.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface Letter {
  id: string;
  account_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  /** JSON shape: {type: "text", content: string}. Store as-is. */
  body: { type?: string; content?: string } | unknown;
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

/** Extract plain-text body content. Letter body stored as {type:"text",content:string}. */
export function getLetterText(letter: Letter): string {
  if (typeof letter.body === "object" && letter.body !== null && "content" in letter.body) {
    const c = (letter.body as { content?: string }).content;
    return typeof c === "string" ? c : "";
  }
  return "";
}
