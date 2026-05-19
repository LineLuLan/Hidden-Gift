/**
 * @file lib/letters/schema.ts
 * @description Zod validation for letter compose/schedule.
 */

import { z } from "zod";

export const letterInputSchema = z.object({
  subject: z
    .string({ required_error: "Vui lòng nhập tiêu đề" })
    .trim()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  body: z
    .string({ required_error: "Vui lòng viết nội dung" })
    .min(1, "Vui lòng viết nội dung")
    .max(80000, "Nội dung quá dài")
    .transform((s, ctx) => {
      try {
        return JSON.parse(s) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Nội dung không hợp lệ" });
        return z.NEVER;
      }
    })
    .refine(
      (doc) => typeof doc === "object" && doc !== null && (doc as { type?: string }).type === "doc",
      "Nội dung phải là tài liệu hợp lệ",
    )
    .refine((doc) => textOf(doc).trim().length > 0, "Vui lòng viết nội dung"),
  scheduledFor: z
    .string()
    .min(1, "Vui lòng chọn ngày giao")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Ngày giao không hợp lệ"),
  recipientId: z.string().uuid("Người nhận không hợp lệ"),
  isDraft: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .default(true),
});

export type LetterInput = z.infer<typeof letterInputSchema>;

export const letterIdSchema = z.string().uuid("ID không hợp lệ");

/** Walk a Tiptap doc tree, collecting plain text from leaf text nodes. */
function textOf(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const obj = node as { type?: string; text?: string; content?: unknown[] };
  if (obj.type === "text" && typeof obj.text === "string") return obj.text;
  if (Array.isArray(obj.content)) {
    return obj.content
      .map((c) => textOf(c))
      .filter(Boolean)
      .join(obj.type === "paragraph" ? "" : " ");
  }
  return "";
}

export { textOf as extractDocText };
