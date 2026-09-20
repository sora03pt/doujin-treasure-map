create or replace function public.owns_reference_image_parent(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (storage.foldername(object_name))[2] = 'circles' then exists (
      select 1
      from public.circles
      where circles.id::text = (storage.foldername(object_name))[3]
        and circles.user_id = (select auth.uid())
    )
    when (storage.foldername(object_name))[2] = 'items' then exists (
      select 1
      from public.items
      where items.id::text = (storage.foldername(object_name))[3]
        and items.user_id = (select auth.uid())
    )
    else false
  end;
$$;

revoke all on function public.owns_reference_image_parent(text) from public;
grant execute on function public.owns_reference_image_parent(text) to authenticated;

drop policy if exists "Users can insert owned reference images"
on storage.objects;

create policy "Users can insert owned reference images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'reference-images'
  and name = concat(
    (select auth.uid())::text,
    '/',
    (storage.foldername(name))[2],
    '/',
    (storage.foldername(name))[3],
    '/reference'
  )
  and (select public.owns_reference_image_parent(name))
);

drop policy if exists "Users can update owned reference images"
on storage.objects;

create policy "Users can update owned reference images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'reference-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.owns_reference_image_parent(name))
)
with check (
  bucket_id = 'reference-images'
  and owner_id = (select auth.uid())::text
  and name = concat(
    (select auth.uid())::text,
    '/',
    (storage.foldername(name))[2],
    '/',
    (storage.foldername(name))[3],
    '/reference'
  )
  and (select public.owns_reference_image_parent(name))
);

drop policy if exists "Users can delete owned reference images"
on storage.objects;

create policy "Users can delete owned reference images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'reference-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.owns_reference_image_parent(name))
);
