-- OPTIONAL. Run ONLY if you want to wipe the database and start again from zero.
-- Deletes ALL artists, tracks, videos, news, messages and ALL user accounts. Cannot be undone.
-- Uploaded files in Storage > media are NOT removed here: empty that bucket in the dashboard.
-- After this, run 1 -> 5 again.

drop table if exists public.play_events, public.public_metrics, public.videos,
                     public.releases, public.messages, public.news,
                     public.settings, public.artists cascade;
drop function if exists public.log_play(uuid, text);
drop function if exists public.get_public_stats();
drop function if exists public.create_my_artist(text, text);
drop function if exists public.make_profile(uuid, text, text);
drop function if exists public.check_signup(text, text);
drop function if exists public.guard_artist();
drop function if exists public.guard_release();
drop function if exists public.guard_video();
drop function if exists public.is_own_media(text);
drop function if exists public.is_dashboard();
drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media owner insert" on storage.objects;
drop policy if exists "media owner update" on storage.objects;
drop policy if exists "media owner delete" on storage.objects;
delete from auth.users;
