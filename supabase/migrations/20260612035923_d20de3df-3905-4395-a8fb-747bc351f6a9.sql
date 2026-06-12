
-- Public read for location-assets (so booking pages can show images even though bucket is private)
CREATE POLICY "Public read location-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'location-assets');

-- Authenticated upload: file path must start with a location id the user has access to
CREATE POLICY "Location access can upload location-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'location-assets'
    AND public.has_location_access(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid
    )
  );

CREATE POLICY "Location access can update location-assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'location-assets'
    AND public.has_location_access(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid
    )
  );

CREATE POLICY "Location access can delete location-assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'location-assets'
    AND public.has_location_access(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid
    )
  );
