alter table public.circles
  add column image_path text,
  add column distribution_post_url text;

alter table public.items
  add column image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reference-images',
  'reference-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can select owned reference images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reference-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (
    (
      (storage.foldername(name))[2] = 'circles'
      and exists (
        select 1
        from public.circles
        where circles.id::text = (storage.foldername(name))[3]
          and circles.user_id = (select auth.uid())
      )
    )
    or
    (
      (storage.foldername(name))[2] = 'items'
      and exists (
        select 1
        from public.items
        where items.id::text = (storage.foldername(name))[3]
          and items.user_id = (select auth.uid())
      )
    )
  )
);

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
  and (
    (
      (storage.foldername(name))[2] = 'circles'
      and exists (
        select 1
        from public.circles
        where circles.id::text = (storage.foldername(name))[3]
          and circles.user_id = (select auth.uid())
      )
    )
    or
    (
      (storage.foldername(name))[2] = 'items'
      and exists (
        select 1
        from public.items
        where items.id::text = (storage.foldername(name))[3]
          and items.user_id = (select auth.uid())
      )
    )
  )
);

create policy "Users can update owned reference images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'reference-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (
    (
      (storage.foldername(name))[2] = 'circles'
      and exists (
        select 1 from public.circles
        where circles.id::text = (storage.foldername(name))[3]
          and circles.user_id = (select auth.uid())
      )
    )
    or
    (
      (storage.foldername(name))[2] = 'items'
      and exists (
        select 1 from public.items
        where items.id::text = (storage.foldername(name))[3]
          and items.user_id = (select auth.uid())
      )
    )
  )
)
with check (
  bucket_id = 'reference-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name = concat(
    (select auth.uid())::text,
    '/',
    (storage.foldername(name))[2],
    '/',
    (storage.foldername(name))[3],
    '/reference'
  )
  and (
    (
      (storage.foldername(name))[2] = 'circles'
      and exists (
        select 1 from public.circles
        where circles.id::text = (storage.foldername(name))[3]
          and circles.user_id = (select auth.uid())
      )
    )
    or
    (
      (storage.foldername(name))[2] = 'items'
      and exists (
        select 1 from public.items
        where items.id::text = (storage.foldername(name))[3]
          and items.user_id = (select auth.uid())
      )
    )
  )
);

create policy "Users can delete owned reference images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'reference-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (
    (
      (storage.foldername(name))[2] = 'circles'
      and exists (
        select 1 from public.circles
        where circles.id::text = (storage.foldername(name))[3]
          and circles.user_id = (select auth.uid())
      )
    )
    or
    (
      (storage.foldername(name))[2] = 'items'
      and exists (
        select 1 from public.items
        where items.id::text = (storage.foldername(name))[3]
          and items.user_id = (select auth.uid())
      )
    )
  )
);
