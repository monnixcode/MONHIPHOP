# Mon HipHop — setup

The website lives in the repo root (no `public/` folder).

## Supabase (new project)
1. Authentication > Providers > Email: turn OFF "Confirm email". Authentication > Attack Protection: CAPTCHA off.
2. Authentication > URL Configuration: Site URL = https://monhiphop.de5.net
3. SQL Editor: open 5 tabs, paste and Run in order, wait for Success each time:
   `supabase/1-tables.sql` -> `2-signup.sql` -> `3-guards-stats.sql` -> `4-permissions-rls.sql` -> `5-storage.sql`
   (the last result should show 0,0,0,0,true,true)
   `0-reset-optional.sql` wipes everything if you ever want to start over.
4. Put Project URL + anon key in `assets/js/config.js` (never the secret key).

## Manage the site (no admin panel): Supabase dashboard
- News: Table Editor > news. About text: settings, key `about_body`.
- Red check / order: artists > `verified` / `sort`. Messages: `messages`.
- Remove a user: Authentication > Users > Delete (their profile, tracks, videos go too).
