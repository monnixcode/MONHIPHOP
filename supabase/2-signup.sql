-- Mon HipHop database: PART 2 of 5. Run 1,2,3,4,5 in order, each in its own SQL Editor tab.

begin;

-- 2. HELPERS ----------------------------------------------------------------
-- true only for the Supabase dashboard / SQL editor / service key (no signed-in user,
-- not the public API roles). Used so the owner can edit anything by hand.
create or replace function public.is_dashboard()
returns boolean
language sql
stable
set search_path = ''
as $$
    select auth.uid() is null and current_user not in ('anon', 'authenticated');
$$;
grant execute on function public.is_dashboard() to anon, authenticated;

create or replace function public.is_own_media(url text)
returns boolean
language sql
stable
set search_path = public
as $$
    select url is null
        or position('/storage/v1/object/public/media/u/' || auth.uid()::text || '/' in url) > 0;
$$;
grant execute on function public.is_own_media(text) to anon, authenticated;

-- 3. SIGN-UP / ARTIST PROFILE ---------------------------------------------
create or replace function public.check_signup(nm text, un text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    n text := trim(coalesce(nm, ''));
    u text := lower(trim(coalesce(un, '')));
begin
    if n = '' or length(n) > 60 then
        return 'Enter your artist name (max 60 characters).';
    end if;
    if u !~ '^[a-z0-9_]{3,24}$' then
        return 'Username must be 3-24 characters: letters, numbers or underscore.';
    end if;
    if u = any (array['admin','administrator','monhiphop','mon_hiphop','support','root','staff','official']) then
        return 'That username is reserved.';
    end if;
    if exists (select 1 from public.artists where lower(name) = lower(n)) then
        return 'That artist name is already on Mon HipHop.';
    end if;
    if exists (select 1 from public.artists where lower(username) = u) then
        return 'That username is already taken.';
    end if;
    return null;
end;
$$;
grant execute on function public.check_signup(text, text) to anon, authenticated;

create or replace function public.make_profile(uid uuid, nm text, un text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    msg text;
begin
    if exists (select 1 from public.artists where user_id = uid) then
        return;
    end if;
    msg := public.check_signup(nm, un);
    if msg is not null then
        raise exception '%', msg;
    end if;
    insert into public.artists (name, username, user_id, role, verified, sort)
    values (trim(nm), lower(trim(un)), uid, 'Artist', false, 1000);
end;
$$;
revoke all on function public.make_profile(uuid, text, text) from public, anon, authenticated;

create or replace function public.create_my_artist(nm text, un text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    uid uuid := auth.uid();
begin
    if uid is null then
        raise exception 'Please sign in first.';
    end if;
    if exists (select 1 from public.artists where user_id = uid) then
        raise exception 'You already have an artist profile.';
    end if;
    perform public.make_profile(uid, nm, un);
end;
$$;
revoke all on function public.create_my_artist(text, text) from public, anon;
grant execute on function public.create_my_artist(text, text) to authenticated;

commit;
