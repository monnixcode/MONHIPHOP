-- Mon HipHop database: PART 5 of 5. Run 1,2,3,4,5 in order, each in its own SQL Editor tab.

begin;

-- 8. STORAGE: bucket "media" (50 MB per file = Supabase free plan maximum) ------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do update set public = true;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
        'image/jpeg','image/png','image/webp','image/gif',
        'audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/wave','audio/mp4','audio/x-m4a',
        'audio/aac','audio/ogg','audio/flac','audio/x-flac','audio/webm',
        'video/mp4','video/webm','video/quicktime','video/x-m4v'
    ]
where id = 'media';

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media owner insert" on storage.objects;
drop policy if exists "media owner update" on storage.objects;
drop policy if exists "media owner delete" on storage.objects;

create policy "media public read" on storage.objects for select to anon, authenticated
    using (bucket_id = 'media');

create policy "media owner insert" on storage.objects for insert to authenticated
    with check (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'u'
        and (storage.foldername(name))[2] = (select auth.uid())::text
        and (
            select count(*) from storage.objects o
            where o.bucket_id = 'media'
              and (storage.foldername(o.name))[1] = 'u'
              and (storage.foldername(o.name))[2] = (select auth.uid())::text
        ) < 150
    );

create policy "media owner update" on storage.objects for update to authenticated
    using (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'u'
        and (storage.foldername(name))[2] = (select auth.uid())::text
    )
    with check (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'u'
        and (storage.foldername(name))[2] = (select auth.uid())::text
    );

create policy "media owner delete" on storage.objects for delete to authenticated
    using (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'u'
        and (storage.foldername(name))[2] = (select auth.uid())::text
    );

commit;


-- CHECK: everything below should be 0 / true on a brand-new project
select
    (select count(*) from public.artists)  as artists,
    (select count(*) from public.releases) as releases,
    (select count(*) from public.videos)   as videos,
    (select count(*) from auth.users)      as users,
    exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname = 'create_my_artist') as create_my_artist_ready,
    exists (select 1 from storage.buckets where id = 'media' and public)     as media_bucket_ready;
