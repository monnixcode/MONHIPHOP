/* Cloudflare Pages Function — serves /s/<username> (or /s/<artist id>)
 *
 * The per-artist SHARE PAGE: its own HTML + CSS + JS, shown only when a link is shared.
 * Built live from Supabase on every request, so a newly signed artist has a share page
 * the moment their profile exists — nothing to deploy.
 *
 *   <title> / og:title  →  "Tar2k4 - Mon HipHop"
 *   og:image            →  cover picture → profile picture → site logo
 *
 * Template: shared/artist-share.mjs (also used by scripts/gen-share-pages.mjs).
 * Optional env vars: SUPABASE_URL, SUPABASE_ANON_KEY (default to the public values in assets/js/config.js). */
import { renderArtistShare } from '../../shared/artist-share.mjs';

const DEFAULT_URL = 'https://fmxbjxypdtqcnxxwwucy.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteGJqeHlwZHRxY254eHd3dWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMDQ2NTksImV4cCI6MjEwODU4MDY1OX0.s9spCFEbZr8ArnJkdf-X5IIEKovsvduhOwzvV0rz6PU';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function sbGet(env, path) {
  const base = env.SUPABASE_URL || DEFAULT_URL, key = env.SUPABASE_ANON_KEY || DEFAULT_KEY;
  const r = await fetch(`${base}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!r.ok) return null;
  return r.json();
}

export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const handle = String(params.handle || '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(handle)) return Response.redirect(`${url.origin}/artists.html`, 302);

  let artist = null, rels = [];
  try {
    const col = UUID.test(handle) ? 'id' : 'username';
    const val = col === 'id' ? handle : handle.toLowerCase();
    const rows = await sbGet(env, `artists?select=id,name,username,role,bio,avatar_url,cover_url,links,verified&${col}=eq.${encodeURIComponent(val)}&limit=1`);
    artist = rows && rows[0];
    if (artist) rels = (await sbGet(env, `releases?select=title,type,cover_url,release_date&artist_id=eq.${artist.id}&order=release_date.desc.nullslast&limit=3`)) || [];
  } catch (e) { /* fall through */ }

  if (!artist) return Response.redirect(`${url.origin}/artists.html`, 302);

  const { html } = renderArtistShare(artist, rels, { origin: url.origin, inline: true });
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
