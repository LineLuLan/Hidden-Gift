/**
 * @file lib/utils/cn.ts
 * @description Tailwind class merger. Combines clsx (conditional classes) and
 *              tailwind-merge (resolve conflicting Tailwind classes).
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
