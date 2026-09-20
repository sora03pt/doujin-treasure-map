drop policy if exists "Users can select owned reference images"
on storage.objects;

create policy "Users can select owned reference images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reference-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
