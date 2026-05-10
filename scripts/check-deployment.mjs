#!/usr/bin/env node
/**
 * בדיקת טעינה אוטומטית לאתר ב-GitHub Pages.
 * מוודא ש:
 *  1. דף הבית נטען תחת /poker-tuter/
 *  2. ה-base path נכון (assets ו-favicon תחת /poker-tuter/)
 *  3. כל מסלולי ה-React Router מחזירים את ה-SPA (בזכות 404.html fallback)
 *  4. קבצי ה-JS/CSS שנטענים מ-index.html זמינים בפועל (200)
 *
 * שימוש:  node scripts/check-deployment.mjs [BASE_URL]
 * ברירת מחדל: https://sivanrab-eng.github.io/poker-tuter/
 */

const BASE = (process.argv[2] || "https://sivanrab-eng.github.io/poker-tuter/").replace(/\/?$/, "/");

const ROUTES = [
  "",                  // /
  "lessons",
  "lessons/preflop",   // dynamic :slug
  "hand-rankings",
  "glossary",
  "guided",
  "quiz",
  "probability",
  "practice",
  "multiplayer",
  "bot-battle",
  "non-existent-route", // צריך להחזיר 200 (SPA fallback) - NotFound יטופל ב-client
];

const results = [];
let failed = 0;

function log(ok, msg) {
  const tag = ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`${tag} ${msg}`);
  if (!ok) failed++;
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { status: res.status, text, url: res.url };
}

function isSpaHtml(html) {
  return (
    html.includes("<div id=\"root\"") &&
    html.includes("/poker-tuter/assets/") &&
    /<script[^>]+type="module"/.test(html)
  );
}

console.log(`\n🔎 בדיקת אתר: ${BASE}\n`);

// 1. דף הבית
const home = await fetchText(BASE);
log(home.status === 200, `GET / → ${home.status}`);
log(isSpaHtml(home.text), `דף הבית מכיל את ה-SPA bundle עם base /poker-tuter/`);
log(home.text.includes("/poker-tuter/favicon.png"), `favicon משתמש ב-base הנכון`);

// 2. בדיקת הנכסים שמופיעים ב-index.html
const assetMatches = [...home.text.matchAll(/(?:src|href)="(\/poker-tuter\/assets\/[^"]+)"/g)].map((m) => m[1]);
log(assetMatches.length > 0, `נמצאו ${assetMatches.length} assets ב-index.html`);
const origin = new URL(BASE).origin;
for (const a of assetMatches.slice(0, 4)) {
  const r = await fetch(origin + a, { method: "HEAD" });
  log(r.status === 200, `asset ${a} → ${r.status}`);
}

// 3. בדיקת SPA fallback לכל מסלולי React Router
console.log("\n— בדיקת מסלולי React Router (SPA fallback) —");
for (const route of ROUTES) {
  const url = BASE + route;
  try {
    const r = await fetchText(url);
    // GitHub Pages מחזיר 404 על נתיבים לא-פיזיים אך עם תוכן 404.html (ה-SPA),
    // והדפדפן עדיין מריץ את React Router. לכן מקבלים גם 200 וגם 404 כל עוד התוכן הוא ה-SPA.
    const statusOk = r.status === 200 || r.status === 404;
    const ok = statusOk && isSpaHtml(r.text);
    log(ok, `${route || "(home)"} → ${r.status}${ok ? " (SPA נטען, React Router יטפל)" : ""}`);
    results.push({ route, status: r.status, ok });
  } catch (e) {
    log(false, `${route} → שגיאה: ${e.message}`);
  }
}

// 4. וידוא שיש 404.html שמשמש כ-SPA fallback
const fallback = await fetch(BASE + "404.html", { method: "HEAD" });
log(fallback.status === 200, `404.html (SPA fallback) קיים → ${fallback.status}`);

console.log(`\n${failed === 0 ? "✅ כל הבדיקות עברו" : `❌ ${failed} בדיקות נכשלו`}\n`);
process.exit(failed === 0 ? 0 : 1);
