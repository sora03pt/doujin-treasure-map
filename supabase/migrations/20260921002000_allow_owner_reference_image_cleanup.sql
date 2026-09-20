drop policy if exists "Users can delete owned reference images"
on storage.objects;

create policy "Users can delete owned reference images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'reference-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
