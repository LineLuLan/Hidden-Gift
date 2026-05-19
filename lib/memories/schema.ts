/**
 * @file lib/memories/schema.ts
 * @description Validation for memory upload metadata. The file itself goes through
 *              Supabase Storage; this schema covers the row inserted in `memories`.
 */

import { z } from "zod";

export const memoryMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, "Tiêu đề tối đa 200 ký tự")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả tối đa 1000 ký tự")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  takenAt: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || !Number.isNaN(Date.parse(v)), "Ngày chụp không hợp lệ"),
});

export type MemoryMetadata = z.infer<typeof memoryMetadataSchema>;

export const memoryIdSchema = z.string().uuid("ID không hợp lệ");
