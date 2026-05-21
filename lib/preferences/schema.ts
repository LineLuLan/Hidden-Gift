/**
 * @file lib/preferences/schema.ts
 * @description Plain types + defaults for email preferences. Kept out of the
 *              "use server" actions file because that file may only export
 *              async functions.
 */

export interface EmailPrefs {
  letter_delivered: boolean;
  invite_accepted: boolean;
  wrapped_yearly: boolean;
  ping_summary: boolean;
}

export const DEFAULT_PREFS: EmailPrefs = {
  letter_delivered: true,
  invite_accepted: true,
  wrapped_yearly: true,
  ping_summary: false,
};
