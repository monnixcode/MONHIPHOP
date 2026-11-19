-- Mon HipHop database: PART 1 of 5. Run 1,2,3,4,5 in order, each in its own SQL Editor tab.

begin;

-- 1. TABLES ---------------------------------------------------------------
create table if not exists public.artists (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid unique references auth.users(id) on delete cascade,
    name       text not null,
    username   text,
    role       text default 'Artist',
    bio        text,
    avatar_url text,
    cover_url  text,
    links      jsonb not null default '{}',
    verified   boolean not null default false,   -- red check mark (set in the dashboard)
    sort       int not null default 1000,        -- lower = earlier in the list (dashboard)
    created_at timestamptz not null default now(),
    constraint artists_username_format check (username is null or username ~ '^[a-z0-9_]{3,24}$')
);
create unique index if not exists artists_username_key on public.artists (lower(username)) where username is not null;
create unique index if not exists artists_name_key     on public.artists (lower(name));

create table if not exists public.releases (
    id           uuid primary key default gen_random_uuid(),
    artist_id    uuid not null references public.artists(id) on delete cascade,
    title        text not null,
    type         text not null default 'Single',
    release_date date,
    cover_url    text,
    audio_url    text,
    links        jsonb not null default '{}',
    play_count   integer not null default 0,
    created_at   timestamptz not null default now()
);
create index if not exists releases_artist_idx on public.releases (artist_id);

create table if not exists public.videos (
    id          uuid primary key default gen_random_uuid(),
    artist_id   uuid not null references public.artists(id) on delete cascade,
    title       text not null,
    video_url   text,      -- uploaded file in bucket "media"
    youtube_url text,      -- or a YouTube link
    thumb_url   text,
    created_at  timestamptz not null default now(),
    constraint videos_has_source check (video_url is not null or youtube_url is not null)
);
create index if not exists videos_artist_idx  on public.videos (artist_id, created_at desc);
create index if not exists videos_created_idx on public.videos (created_at desc);

create table if not exists public.news (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    body         text,
    image_url    text,
    published_at timestamptz not null default now()
);

create table if not exists public.messages (          -- contact form (read in the dashboard)
    id         uuid primary key default gen_random_uuid(),
    name       text not null check (length(name) between 1 and 120),
    email      text not null check (length(email) between 3 and 200),
    message    text not null check (length(message) between 1 and 5000),
    created_at timestamptz not null default now()
);

create table if not exists public.settings (          -- e.g. key = 'about_body'
    key   text primary key,
    value text
);

create table if not exists public.play_events (       -- one play per visitor / track / day
    release_id uuid references public.releases(id) on delete cascade,
    visitor    text not null check (length(visitor) <= 64),
    day        date not null default current_date,
    primary key (release_id, visitor, day)
);

create table if not exists public.public_metrics (    -- visits / video views (after cookie consent)
    id         bigint generated always as identity primary key,
    event_type text not null check (event_type in ('site_visit','music_play','video_view')),
    target_id  uuid,
    created_at timestamptz not null default now()
);

commit;
