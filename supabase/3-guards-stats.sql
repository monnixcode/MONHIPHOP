-- Mon HipHop database: PART 3 of 5. Run 1,2,3,4,5 in order, each in its own SQL Editor tab.

begin;

-- 4. GUARDS: what an artist may change ---------------------------------------
create or replace function public.guard_artist()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.username := nullif(lower(trim(coalesce(new.username, ''))), '');
    if public.is_dashboard() then
        return new;
    end if;

    if tg_op = 'UPDATE' then
        -- owner-only fields: changed in the dashboard, never from the website
        new.user_id    := old.user_id;
        new.verified   := old.verified;
        new.sort       := old.sort;
        new.created_at := old.created_at;
    end if;

    new.name := left(trim(coalesce(new.name, '')), 60);
    if new.name = '' then
        raise exception 'Artist name is required.';
    end if;

    if tg_op = 'UPDATE' then
        if new.name is distinct from old.name
           and exists (select 1 from public.artists a where lower(a.name) = lower(new.name) and a.id <> new.id) then
            raise exception 'That artist name is already taken.';
        end if;
        if new.username is distinct from old.username then
            if new.username is null or new.username !~ '^[a-z0-9_]{3,24}$' then
                raise exception 'Username must be 3-24 characters: letters, numbers or underscore.';
            end if;
            if new.username = any (array['admin','administrator','monhiphop','mon_hiphop','support','root','staff','official']) then
                raise exception 'That username is reserved.';
            end if;
            if exists (select 1 from public.artists a where lower(a.username) = new.username and a.id <> new.id) then
                raise exception 'That username is already taken.';
            end if;
        end if;
        if new.avatar_url is distinct from old.avatar_url and not public.is_own_media(new.avatar_url) then
            raise exception 'Invalid profile image.';
        end if;
        if new.cover_url is distinct from old.cover_url and not public.is_own_media(new.cover_url) then
            raise exception 'Invalid cover image.';
        end if;
    end if;

    new.role := left(trim(coalesce(new.role, '')), 40);
    new.bio  := left(new.bio, 600);
    return new;
end;
$$;
drop trigger if exists artists_guard on public.artists;
create trigger artists_guard
    before insert or update on public.artists
    for each row execute function public.guard_artist();

create or replace function public.guard_release()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if public.is_dashboard() then
        return new;
    end if;
    -- (play_count updates from log_play() change none of these columns, so they pass untouched)
    if tg_op = 'INSERT' or new.title is distinct from old.title then
        new.title := left(trim(coalesce(new.title, '')), 100);
        if new.title = '' then
            raise exception 'Track title is required.';
        end if;
    end if;
    if tg_op = 'INSERT' or new.type is distinct from old.type then
        if new.type is null or new.type not in ('Single', 'EP', 'Album', 'Mixtape') then
            new.type := 'Single';
        end if;
    end if;
    if tg_op = 'INSERT' or new.cover_url is distinct from old.cover_url then
        if not public.is_own_media(new.cover_url) then
            raise exception 'Invalid cover image.';
        end if;
    end if;
    if tg_op = 'INSERT' or new.audio_url is distinct from old.audio_url then
        if not public.is_own_media(new.audio_url) then
            raise exception 'Invalid audio file.';
        end if;
    end if;
    return new;
end;
$$;
drop trigger if exists releases_guard on public.releases;
create trigger releases_guard
    before insert or update on public.releases
    for each row execute function public.guard_release();

create or replace function public.guard_video()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.title       := left(trim(coalesce(new.title, '')), 100);
    new.youtube_url := nullif(trim(coalesce(new.youtube_url, '')), '');
    if public.is_dashboard() then
        return new;
    end if;
    if new.title = '' then
        raise exception 'Video title is required.';
    end if;
    if tg_op = 'UPDATE' then
        new.artist_id  := old.artist_id;
        new.created_at := old.created_at;
    end if;
    if tg_op = 'INSERT' or new.video_url is distinct from old.video_url then
        if not public.is_own_media(new.video_url) then
            raise exception 'Invalid video file.';
        end if;
    end if;
    if tg_op = 'INSERT' or new.thumb_url is distinct from old.thumb_url then
        if not public.is_own_media(new.thumb_url) then
            raise exception 'Invalid thumbnail image.';
        end if;
    end if;
    if new.youtube_url is not null
       and new.youtube_url !~* '^https://(www\.|m\.)?(youtube\.com/(watch\?([^ ]*&)?v=|shorts/|embed/|live/)|youtu\.be/)[A-Za-z0-9_-]{11}' then
        raise exception 'Please paste a normal YouTube link (youtube.com or youtu.be).';
    end if;
    return new;
end;
$$;
drop trigger if exists videos_guard on public.videos;
create trigger videos_guard
    before insert or update on public.videos
    for each row execute function public.guard_video();

-- 5. PLAY COUNTS + PUBLIC STATS -----------------------------------------------
create or replace function public.log_play(rid uuid, vid text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.play_events (release_id, visitor)
    values (rid, left(vid, 64))
    on conflict do nothing;
    if not found then
        return false;
    end if;
    update public.releases set play_count = play_count + 1 where id = rid;
    return found;
end;
$$;
grant execute on function public.log_play(uuid, text) to anon, authenticated;

create or replace function public.get_public_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
    select json_build_object(
        'artist_count', (select count(*) from public.artists),
        'user_count',   (select count(*) from auth.users),
        'site_visits',  (select count(*) from public.public_metrics where event_type = 'site_visit'),
        'video_views',  (select count(*) from public.public_metrics where event_type = 'video_view'),
        'music_plays',  (select coalesce(sum(play_count), 0) from public.releases)
    );
$$;
grant execute on function public.get_public_stats() to anon, authenticated;

commit;
