# Notes for AI assistants working on this repo
- Static site in the repo ROOT: *.html, `assets/css`, `assets/js` (config.js, app.js, auth.js). No build step. supabase-js is loaded from jsDelivr (pinned 2.45.4) in every html.
- Edit only the root files. Keys go in `assets/js/config.js` (URL + anon key only).
- `functions/` (+ `shared/`) = Cloudflare Pages share-preview functions (/a, /v, /s). `_redirects` hides repo-only files.
- Database: `supabase/1..5-*.sql` run in order (idempotent). No admin panel / admins table: owner tasks are done in the Supabase dashboard.
- GitHub Pages: `.github/workflows/static.yml` publishes only site files (`_site`). CNAME = monhiphop.de5.net.
- Keep it simple: plain HTML/CSS/JS, English UI text.
