/* ============ Site settings ============
   1) Paste the values from Supabase > Project Settings > API
   2) If left empty, the site shows empty lists (no sample data) */
const SUPABASE_URL = "https://qgqluynetevspjbpqbob.supabase.co";       // https://xxxx.supabase.co  (new project: Project Settings > API)
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWx1eW5ldGV2c3BqYnBxYm9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MzI5MTcsImV4cCI6MjExMDMwODkxN30.SnkgBWL47i_zWZ1uXDjg452cXVx_eBS6qGoWA5pT4go";  // anon public key (safe to expose)

const LINKS = {

  // Mon HipHop official channels (top of the page)
  label: {
    // Follow
    youtube:    "https://youtube.com/@monhiphop?si=I8sAI1r5LVYtQNVO",
    facebook:   "https://www.facebook.com/share/1KEp6zJRcE/",
    instagram:  "https://www.instagram.com/monhiphop_?xtok=eTNvazJlcXM5Y3Zz",
    x:          "https://x.com/monhiphop_",
    tiktok:     "https://www.tiktok.com/@monhiphop?_r=1&_t=ZS-9AqIS1BIjYY",
    // Listen on (streaming)
    spotify:    "https://open.spotify.com/artist/4JTkFROtJ0VLuuODg8UNN9?si=JduJbhBHSTOySAxaIUAAeg&utm_source=copy-link",
    apple:      "https://music.apple.com/us/artist/mon-hiphop-underground/6809851342",   // Apple Music
    soundcloud: "https://on.soundcloud.com/CR2xsIri4piWNIMrMD",
    ytmusic:    "https://music.youtube.com/@monhiphop?si=IpmlMVtqlcr6i8yr"    // YouTube Music
  }
};

window.MH = {
  SUPABASE_URL, SUPABASE_ANON_KEY, LINKS,
  FALLBACK: { artists: [], releases: [], videos: [], news: [] }
};
