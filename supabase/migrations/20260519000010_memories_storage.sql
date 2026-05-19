-- Hidden Gift — Memories storage bucket + RLS
--
-- MVP uses Supabase Storage (free tier 1GB) for media. When Cloudflare R2
-- keys land, code will swap to presigned URLs against R2; this bucket stays
-- as fallback / dev-only.
--
-- Path scheme: <account_id>/<uuid>.<ext>
-- RLS: account members see all media in their account folder; only uploader
--      can delete; insert restricted to authenticated members of the account.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memories',
  'memories',
  false,
  10485760, -- 10MB per object
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      public = EXCLUDED.public;

-- Read: account members of the path-prefix account_id
CREATE POLICY "memories_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories'
    AND public.is_account_member(
      ((storage.foldername(name))[1])::uuid
    )
  );

-- Insert: must be authenticated AND member of the account in the path
CREATE POLICY "memories_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories'
    AND auth.uid() IS NOT NULL
    AND public.is_account_member(
      ((storage.foldername(name))[1])::uuid
    )
  );

-- Delete: only original uploader (owner column tracks user_id)
CREATE POLICY "memories_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories'
    AND owner = auth.uid()
  );
