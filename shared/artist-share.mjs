/* Per-artist SHARE PAGE — its own HTML, CSS and JS for every artist.
 *
 * Opened only through a shared link:   /s/<username>
 * (it is not in the menu, not in sitemap.xml and is marked noindex — people only land here
 *  when somebody shares the link on Facebook / LINE / X / Instagram / TikTok / WhatsApp ...)
 *
 * Used by:
 *   functions/s/[handle].js        → Cloudflare Pages, built live on every request (new artists work instantly)
 *   scripts/gen-share-pages.mjs    → GitHub Pages, pre-built as index.html + share.css + share.js per artist
 *
 * Page / preview title format:  "Tar2k4 - Mon HipHop"
 */

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const http = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : '');
const hueOf = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

export const shareTitle = (a) => `${a.name} - Mon HipHop`;

const ICON = {
  spotify: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
};
const STROKE = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/>',
  soundcloud: '<path d="M2 14v3M4.6 12v5M7.2 10.5V17M9.8 9v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path fill="currentColor" d="M12.4 17V8.6A5.4 5.4 0 0 1 16 8.1A4.2 4.2 0 0 1 20.4 11.5A2.8 2.8 0 0 1 20.2 17z"/>',
  apple: '<path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/>',
  ytmusic: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M10 8.2v7.6l6-3.8z"/>',
};
const LABEL = { spotify: 'Spotify', apple: 'Apple Music', soundcloud: 'SoundCloud', ytmusic: 'YouTube Music', youtube: 'YouTube', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', x: 'X' };
const ORDER = ['spotify', 'apple', 'soundcloud', 'ytmusic', 'youtube', 'facebook', 'instagram', 'tiktok', 'x'];
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${STROKE[k] || `<path fill="currentColor" d="${ICON[k]}"/>`}</svg>`;

/* ---------- CSS (own stylesheet for the share page) ---------- */
export const SHARE_CSS = `
:root{--h:40;--acc:hsl(var(--h) 85% 62%);--acc2:hsl(calc(var(--h) + 24) 82% 56%);--bg:#0b0b0e;--text:#f4f2ec;--mute:rgba(244,242,236,.64);
 --glass:rgba(255,255,255,.07);--glass-b:rgba(255,255,255,.16);--px:0px;--py:0px}
*{margin:0;padding:0;box-sizing:border-box}[hidden]{display:none!important}
html{background:var(--bg);color-scheme:dark}
body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px 16px;color:var(--text);font:400 16px/1.6 Inter,"Noto Sans Thai",system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}button{font:inherit;color:inherit}
a:focus-visible,button:focus-visible{outline:2px solid var(--acc);outline-offset:3px}

/* living glass background */
.bg{position:fixed;inset:0;z-index:-1;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,#17141c 0%,var(--bg) 62%)}
.bg .pic{position:absolute;inset:-12%;background-size:cover;background-position:center;filter:blur(46px) saturate(1.5) brightness(.55);opacity:.7;transform:translate(var(--px),var(--py)) scale(1.08);transition:transform .5s ease-out}
.bg i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5;will-change:transform;animation:float 18s ease-in-out infinite}
.bg i:nth-child(2){width:46vmax;height:46vmax;left:-14vmax;top:-12vmax;background:var(--acc)}
.bg i:nth-child(3){width:40vmax;height:40vmax;right:-12vmax;bottom:-10vmax;background:var(--acc2);animation-duration:24s;animation-direction:reverse}
.bg i:nth-child(4){width:26vmax;height:26vmax;left:38%;top:44%;background:#ff2a45;opacity:.22;animation-duration:30s}
@keyframes float{0%,100%{transform:translate3d(0,0,0) scale(1)}33%{transform:translate3d(6vmax,4vmax,0) scale(1.12)}66%{transform:translate3d(-4vmax,7vmax,0) scale(.94)}}

/* glass card */
.card-s{--rx:0deg;--ry:0deg;--mx:50%;--my:0%;position:relative;width:min(440px,100%);padding:0 0 22px;border-radius:30px;overflow:hidden;
 background:linear-gradient(160deg,rgba(255,255,255,.13),rgba(255,255,255,.04) 55%);
 border:1px solid var(--glass-b);backdrop-filter:blur(26px) saturate(165%);-webkit-backdrop-filter:blur(26px) saturate(165%);
 box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(255,255,255,.04);
 transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));transition:transform .25s ease-out;animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
.card-s::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(260px circle at var(--mx) var(--my),rgba(255,255,255,.18),transparent 60%);mix-blend-mode:soft-light}
.card-s::after{content:"";position:absolute;top:0;bottom:0;width:60%;left:-80%;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(255,255,255,.16),transparent);transform:skewX(-18deg);animation:sheen 6s 1.2s ease-in-out infinite}
@keyframes sheen{0%,55%{left:-80%}100%{left:140%}}
@keyframes rise{from{opacity:0;transform:perspective(900px) translateY(36px) scale(.96)}}
@keyframes pop{from{opacity:0;transform:translateY(14px)}}

.cov{height:150px;background:linear-gradient(135deg,hsl(var(--h) 40% 22%),#14141a);position:relative}
.cov img{width:100%;height:100%;object-fit:cover}
.cov::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(11,11,14,.55))}
.brandline{position:absolute;z-index:2;top:12px;left:14px;display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border-radius:99px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font:400 13px 'Isometra',Inter,serif;letter-spacing:.05em}
.brandline img{height:18px;filter:invert(1)}

.who{position:relative;z-index:1;margin-top:-52px;padding:0 24px;text-align:center}
.ava{position:relative;width:108px;height:108px;margin:0 auto 14px;border-radius:50%;padding:3px;background:conic-gradient(from 0deg,var(--acc),#ff2a45,var(--acc2),var(--acc));animation:spin 8s linear infinite}
.ava>div{width:100%;height:100%;border-radius:50%;overflow:hidden;background:#24242b;border:3px solid #0d0d11;animation:spin 8s linear infinite reverse}
.ava img{width:100%;height:100%;object-fit:cover}
.ava b{display:grid;place-items:center;width:100%;height:100%;font:800 40px Inter,sans-serif;color:var(--acc)}
@keyframes spin{to{transform:rotate(360deg)}}
.tag{display:inline-block;margin-bottom:8px;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);background:hsl(var(--h) 80% 60% / .12);border:1px solid hsl(var(--h) 80% 60% / .35)}
h1{font-size:clamp(30px,9vw,42px);line-height:1.08;letter-spacing:-.03em;font-weight:800;overflow-wrap:anywhere}
h1 span{display:block;margin-top:6px;font:400 15px 'Isometra',Inter,serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.role{margin-top:10px;color:var(--mute);font-size:14px}
.bio{margin:14px auto 0;max-width:34ch;color:rgba(244,242,236,.82);font-size:14.5px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-line}

.links{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:22px 24px 0}
.links a{width:46px;height:46px;display:grid;place-items:center;border-radius:50%;color:var(--text);background:var(--glass);border:1px solid var(--glass-b);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:transform .25s cubic-bezier(.2,.8,.2,1),background .2s,color .2s,box-shadow .25s;animation:pop .6s both}
.links a svg{width:21px;height:21px}
.links a:hover,.links a:focus-visible{transform:translateY(-4px) scale(1.08);background:var(--acc);color:#111;box-shadow:0 10px 26px hsl(var(--h) 90% 55% / .45)}

.rel{margin:22px 24px 0;display:grid;gap:8px;text-align:left}
.rel h2{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);font-weight:700;margin-bottom:2px}
.rel div{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);animation:pop .6s both}
.rel img,.rel em{width:42px;height:42px;border-radius:10px;object-fit:cover;background:#2a2a30;flex:none}
.rel b{display:block;font-size:14px;font-weight:600;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel small{color:var(--mute);font-size:12px}.rel span{min-width:0}

.cta{display:grid;grid-template-columns:1fr auto auto;gap:10px;margin:24px 24px 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 20px;border-radius:99px;font-weight:700;font-size:14px;cursor:pointer;border:1px solid var(--glass-b);background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:transform .2s,background .2s,box-shadow .25s}
.btn:hover{transform:translateY(-2px)}.btn:active{transform:scale(.97)}
.btn.main{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#111;border-color:transparent;box-shadow:0 10px 28px hsl(var(--h) 90% 55% / .35)}
.btn.main:hover{box-shadow:0 14px 34px hsl(var(--h) 90% 55% / .5)}
.btn.ic{width:48px;padding:0}.btn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.foot{margin-top:18px;text-align:center;font-size:12px;color:var(--mute)}.foot a{color:var(--text);text-decoration:underline;text-underline-offset:3px}
.toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);padding:10px 20px;border-radius:99px;background:rgba(255,255,255,.9);color:#111;font-weight:700;font-size:14px;opacity:0;pointer-events:none;transition:.3s;z-index:9}
.toast.on{opacity:1;transform:translate(-50%,0)}
@media(max-width:420px){.cta{grid-template-columns:1fr 48px 48px}.cov{height:128px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

/* ---------- JS (own script for the share page) ---------- */
export const SHARE_JS = `(function(){
var card=document.querySelector('.card-s'),root=document.documentElement,toast=document.getElementById('toast');
var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
function say(m){if(!toast)return;toast.textContent=m;toast.classList.add('on');clearTimeout(say.t);say.t=setTimeout(function(){toast.classList.remove('on')},1800)}
/* pointer motion: card tilt + moving light + parallax background */
if(card&&!reduce&&window.matchMedia('(hover:hover)').matches){var raf;
 window.addEventListener('pointermove',function(e){cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){
  var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5,r=card.getBoundingClientRect();
  card.style.setProperty('--rx',(-y*7).toFixed(2)+'deg');card.style.setProperty('--ry',(x*9).toFixed(2)+'deg');
  card.style.setProperty('--mx',(e.clientX-r.left)+'px');card.style.setProperty('--my',(e.clientY-r.top)+'px');
  root.style.setProperty('--px',(x*-34).toFixed(1)+'px');root.style.setProperty('--py',(y*-34).toFixed(1)+'px')})});
 document.addEventListener('pointerleave',function(){card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg')})}
/* phones: tilt with the device */
if(card&&!reduce&&window.DeviceOrientationEvent&&!window.matchMedia('(hover:hover)').matches){
 window.addEventListener('deviceorientation',function(e){if(e.gamma==null)return;
  card.style.setProperty('--ry',Math.max(-8,Math.min(8,e.gamma/6)).toFixed(2)+'deg');
  card.style.setProperty('--rx',Math.max(-6,Math.min(6,((e.beta||0)-50)/10)).toFixed(2)+'deg')},{passive:true})}
/* stagger the entrance */
[].forEach.call(document.querySelectorAll('.links a,.rel div'),function(el,i){el.style.animationDelay=(0.35+i*0.07)+'s'});
/* copy + native share */
var holder=document.querySelector('[data-url]'),url=holder?holder.getAttribute('data-url'):location.href;
function copy(){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(function(){say('Link copied')},fallback)}else fallback()}
function fallback(){var t=document.createElement('textarea');t.value=url;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');say('Link copied')}catch(e){say(url)}t.remove()}
var c=document.querySelector('[data-copy]'),s=document.querySelector('[data-native]');
if(c)c.addEventListener('click',copy);
if(s){if(navigator.share){s.addEventListener('click',function(){navigator.share({title:document.title,url:url}).catch(function(){})})}else s.hidden=true}
})();`;

/* ---------- HTML ---------- */
/**
 * @param {object} a         artist row {id,name,username,role,bio,avatar_url,cover_url,links,verified}
 * @param {object[]} rels    latest releases [{title,type,cover_url,release_date}]
 * @param {{origin:string, inline?:boolean}} o  inline=true → CSS/JS inside the HTML (Cloudflare function);
 *                                              false → <link>/<script src> to share.css / share.js (static files)
 */
export function renderArtistShare(a, rels, o) {
  const origin = String(o.origin).replace(/\/$/, '');
  const handle = a.username || a.id;
  const title = shareTitle(a);
  const pageUrl = `${origin}/s/${encodeURIComponent(handle)}`;
  const profile = `${origin}/a/${encodeURIComponent(handle)}`;
  const cover = http(a.cover_url), avatar = http(a.avatar_url);
  const ogImg = cover || avatar || `${origin}/logo.png`;
  const desc = (a.bio ? String(a.bio).replace(/\s+/g, ' ').trim() : `${a.role || 'Artist'} on Mon HipHop. Listen to music and watch videos.`).slice(0, 180);
  const card = cover ? 'summary_large_image' : 'summary';
  const links = (a.links && typeof a.links === 'object') ? a.links : {};
  const icons = ORDER.filter((k) => http(links[k])).map((k) => `<a href="${esc(http(links[k]))}" target="_blank" rel="noopener" title="${LABEL[k]}" aria-label="${LABEL[k]}">${svg(k)}</a>`).join('');
  const rows = (rels || []).slice(0, 3).map((r) => {
    const c = http(r.cover_url);
    return `<div>${c ? `<img src="${esc(c)}" alt="" loading="lazy">` : '<em></em>'}<span><b>${esc(r.title)}</b><small>${esc([r.type, r.release_date && String(r.release_date).slice(0, 4)].filter(Boolean).join(' · '))}</small></span></div>`;
  }).join('');
  const hue = hueOf(a.name || handle);
  const css = SHARE_CSS, js = SHARE_JS;
  const enc = encodeURIComponent;
  const cssUrl = (u) => u.replace(/['()\\\s"]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
  const styleTag = o.inline ? `<style>${css}</style>` : `<link rel="stylesheet" href="/s/${enc(handle)}/share.css">`;
  const scriptTag = o.inline ? `<script>${js}</script>` : `<script src="/s/${enc(handle)}/share.js" defer></script>`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="${esc(pageUrl)}">
<link rel="icon" href="${esc(origin)}/logo.png">
<meta property="og:type" content="profile"><meta property="og:site_name" content="Mon HipHop">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(pageUrl)}"><meta property="og:image" content="${esc(ogImg)}">
<meta name="twitter:card" content="${card}"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(ogImg)}">
<meta name="theme-color" content="#0b0b0e">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+Thai:wght@400;600&family=Isometra&display=swap" rel="stylesheet">
${styleTag}
</head>
<body style="--h:${hue}">
<div class="bg" aria-hidden="true"><div class="pic"${(cover || avatar) ? ` style="background-image:url('${esc(cssUrl(cover || avatar))}')"` : ''}></div><i></i><i></i><i></i></div>
<main class="card-s" data-url="${esc(pageUrl)}">
  <div class="cov">${cover ? `<img src="${esc(cover)}" alt="">` : ''}<a class="brandline" href="${esc(origin)}/"><img src="${esc(origin)}/logo.png" alt="">MON HIPHOP</a></div>
  <section class="who">
    <div class="ava"><div>${avatar ? `<img src="${esc(avatar)}" alt="${esc(a.name)}">` : `<b>${esc(String(a.name || '?').trim().charAt(0).toUpperCase())}</b>`}</div></div>
    <span class="tag">${a.verified ? 'Verified artist' : 'Artist'}</span>
    <h1>${esc(a.name)}<span>Mon HipHop</span></h1>
    ${a.role ? `<p class="role">${esc(a.role)}</p>` : ''}
    ${a.bio ? `<p class="bio">${esc(a.bio)}</p>` : ''}
  </section>
  ${icons ? `<nav class="links" aria-label="${esc(a.name)} links">${icons}</nav>` : ''}
  ${rows ? `<section class="rel"><h2>Latest releases</h2>${rows}</section>` : ''}
  <div class="cta">
    <a class="btn main" href="${esc(profile)}">Open full profile</a>
    <button type="button" class="btn ic" data-copy aria-label="Copy link" title="Copy link"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/></svg></button>
    <button type="button" class="btn ic" data-native aria-label="Share" title="Share"><svg viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></button>
  </div>
  <p class="foot">${esc(a.name)} on <a href="${esc(origin)}/">Mon HipHop</a></p>
</main>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
${scriptTag}
</body>
</html>`;
  return { html, css, js, title, pageUrl };
}
