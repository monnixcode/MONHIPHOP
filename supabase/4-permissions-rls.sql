-- Mon HipHop database: PART 4 of 5. Run 1,2,3,4,5 in order, each in its own SQL Editor tab.

begin;

-- 6. TABLE PERMISSIONS (start from nothing, grant only what the site needs) ---
revoke all on public.artists, public.releases, public.videos, public.news,
              public.messages, public.settings, public.play_events, public.public_metrics
    from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on public.artists, public.releases, public.videos, public.news, public.settings
    to anon, authenticated;
grant update on public.artists to authenticated;     -- owner only (policy) + guard_artist
grant insert (title, artist_id, type, release_date, cover_url, audio_url, links) on public.releases to authenticated;
grant update (title, artist_id, type, release_date, cover_url, audio_url, links) on public.releases to authenticated;
grant delete on public.releases to authenticated;
grant insert, update, delete on public.videos to authenticated;
grant insert on public.messages       to anon, authenticated;
grant insert on public.public_metrics to anon, authenticated;

-- 7. ROW LEVEL SECURITY -------------------------------------------------------
alter table public.artists        enable row level security;
alter table public.releases       enable row level security;
alter table public.videos         enable row level security;
alter table public.news           enable row level security;
alter table public.messages       enable row level security;
alter table public.settings       enable row level security;
alter table public.play_events    enable row level security;
alter table public.public_metrics enable row level security;

drop policy if exists "artists public read"  on public.artists;
drop policy if exists "artists owner update" on public.artists;
create policy "artists public read"  on public.artists for select to anon, authenticated using (true);
create policy "artists owner update" on public.artists for update to authenticated
    using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "releases public read"  on public.releases;
drop policy if exists "releases owner insert" on public.releases;
drop policy if exists "releases owner update" on public.releases;
drop policy if exists "releases owner delete" on public.releases;
create policy "releases public read" on public.releases for select to anon, authenticated using (true);
create policy "releases owner insert" on public.releases for insert to authenticated
    with check (
        artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid()))
        and (select count(*) from public.releases r where r.artist_id = releases.artist_id) < 60
    );
create policy "releases owner update" on public.releases for update to authenticated
    using      (artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid())))
    with check (artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid())));
create policy "releases owner delete" on public.releases for delete to authenticated
    using (artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid())));

drop policy if exists "videos public read"  on public.videos;
drop policy if exists "videos owner insert" on public.videos;
drop policy if exists "videos owner update" on public.videos;
drop policy if exists "videos owner delete" on public.videos;
create policy "videos public read" on public.videos for select to anon, authenticated using (true);
create policy "videos owner insert" on public.videos for insert to authenticated
    with check (
        artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid()))
        and (select count(*) from public.videos v where v.artist_id = videos.artist_id) < 20
    );
create policy "videos owner update" on public.videos for update to authenticated
    using      (artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid())))
    with check (artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid())));
create policy "videos owner delete" on public.videos for delete to authenticated
    using (artist_id in (select a.id from public.artists a where a.user_id = (select auth.uid())));

drop policy if exists "news public read"     on public.news;
drop policy if exists "settings public read" on public.settings;
create policy "news public read"     on public.news     for select to anon, authenticated using (true);
create policy "settings public read" on public.settings for select to anon, authenticated using (true);

-- contact form: anyone may send, nobody can read through the API (read in the dashboard)
drop policy if exists "messages public insert" on public.messages;
create policy "messages public insert" on public.messages for insert to anon, authenticated
    with check (length(message) < 5000);

-- play_events: no policies = closed; only log_play() (security definer) writes
drop policy if exists "public can add metrics" on public.public_metrics;
create policy "public can add metrics" on public.public_metrics for insert to anon, authenticated
    with check (
        (event_type = 'site_visit' and target_id is null)
        or (event_type = 'music_play' and exists (select 1 from public.releases r where r.id = target_id))
        or (event_type = 'video_view' and exists (select 1 from public.videos v where v.id = target_id))
    );

commit;
