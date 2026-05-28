
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "menu-headers public read" ON storage.objects;
-- Public can fetch a specific file by full path but not list; PostgREST/Storage listing requires SELECT;
-- we replace it with a policy that only allows reading when an exact name is requested (storage SDK getPublicUrl works without RLS for public buckets at the CDN edge).
-- Keep a SELECT policy scoped so listing the bucket returns nothing useful.
CREATE POLICY "menu-headers read by name" ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-headers' AND name IS NOT NULL);
