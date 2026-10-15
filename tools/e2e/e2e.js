// E2E site en ligne : node e2e.js BASE_URL OUTDIR — bureau 1440 + mobile 390 ; envoie 3 demandes « TEST E2E » (à supprimer ensuite)
const p = require('/workspace/terrasse/ibis_tlemcen_site/work/node_modules/puppeteer-core');
const BASE = (process.argv[2] || 'https://sayler991.github.io/Sebs_Garden_site/').replace(/\/?$/, '/');
const OUT = (process.argv[3] || '/workspace/sebsgarden_shots/').replace(/\/?$/, '/');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const inDays = n => { const d = new Date(Date.now() + n * 864e5); return d.toISOString().slice(0, 10); };
const SECS = [['maison', 2], ['carte', 3], ['ambiance', 4], ['avis', 5], ['reserver', 6], ['horaires', 7]];
async function setDate(pg, v) { await pg.$eval('#f-day', (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, v); }
async function submit(pg) { await pg.$eval('#f-out', e => { e.innerHTML = ''; }); await pg.click('#f-send'); await pg.waitForSelector('#f-out .msg', { timeout: 20000 }); await sleep(300); return pg.$eval('#f-out', e => e.textContent.trim()); }
(async () => {
  const b = await p.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'], headless: 'new' });
  const res = {};
  const pg = await b.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(BASE + '?e2e=' + Date.now(), { waitUntil: 'networkidle2' });
  await pg.waitForFunction(() => document.documentElement.getAttribute('data-live') === 'supabase', { timeout: 20000 });
  res.live = 'supabase'; await sleep(2600);
  res.anim = await pg.evaluate(() => ({ ready: document.documentElement.classList.contains('ready'), heroChars: document.querySelectorAll('.hero-title .ch').length,
    heroCharVisible: getComputedStyle(document.querySelector('.hero-title .ch')).opacity, heroLine: getComputedStyle(document.querySelector('.hero-line path')).strokeDashoffset,
    kenBurns: getComputedStyle(document.querySelector('.slide.on img')).animationName, marquee: getComputedStyle(document.querySelector('#marquee')).animationName, marqueeItems: document.querySelectorAll('#marquee span').length }));
  res.telLinks = await pg.$$eval('a[href^="tel:"]', e => [...new Set(e.map(a => a.getAttribute('href')))]);
  await pg.screenshot({ path: OUT + 'desktop_1_hero.png' });
  await sleep(4500); res.anim.slideAdvanced = await pg.evaluate(() => [...document.querySelectorAll('.slide')].findIndex(s => s.classList.contains('on')));
  const before = await pg.evaluate(() => document.querySelectorAll('.reveal.in').length);
  for (const [id, n] of SECS) { await pg.evaluate(id => document.getElementById(id).scrollIntoView(), id); await sleep(1500); await pg.screenshot({ path: OUT + 'desktop_' + n + '_' + id + '.png' }); }
  res.anim.reveals = before + ' -> ' + await pg.evaluate(() => document.querySelectorAll('.reveal.in').length + '/' + document.querySelectorAll('.reveal').length);
  res.anim.linesDrawn = await pg.evaluate(() => document.querySelectorAll('svg.draw.in').length + '/' + document.querySelectorAll('svg.draw:not(.hero-line)').length);
  res.anim.navSolid = await pg.evaluate(() => document.getElementById('nav').classList.contains('solid'));
  res.anim.progress = await pg.evaluate(() => document.getElementById('progress').style.transform);
  // onglets de la carte
  await pg.evaluate(() => document.getElementById('carte').scrollIntoView()); await sleep(800);
  await pg.click('#mt-2'); await sleep(900);
  res.menuTab = await pg.evaluate(() => ({ visible: [...document.querySelectorAll('.mpanel')].map(p => !p.hidden), ink: document.getElementById('mtabs-ink').style.transform, note: document.getElementById('mnote').textContent.trim().slice(0, 60) }));
  await pg.screenshot({ path: OUT + 'desktop_3b_carte_boissons.png' });
  // formulaire : validation vide
  await pg.evaluate(() => document.getElementById('reserver').scrollIntoView()); await sleep(600);
  await pg.click('#f-send'); await sleep(400); res.emptyValidation = await pg.$eval('#f-out', e => e.textContent.trim());
  // 1) réservation
  await setDate(pg, inDays(3)); await sleep(200); await pg.select('#f-time', '20:00'); await pg.select('#f-guests', '4'); await pg.select('#f-occasion', 'En famille');
  await pg.type('#f-name', 'TEST E2E SebsGarden resa'); await pg.type('#f-phone', '0555 00 00 91'); await pg.type('#f-msg', 'Réservation de test automatique — à supprimer');
  await pg.evaluate(() => document.querySelector('#p-form').scrollIntoView({ block: 'center' })); await sleep(300);
  await pg.screenshot({ path: OUT + 'desktop_8_form_reservation.png' });
  res.reservation = await submit(pg); await pg.screenshot({ path: OUT + 'desktop_9_form_sent.png' });
  // 2) message
  await pg.click('#t-message'); await sleep(300);
  await pg.type('#f-name', 'TEST E2E SebsGarden message'); await pg.type('#f-phone', '0555 00 00 92'); await pg.type('#f-email', 'test@example.com'); await pg.type('#f-msg', 'Message de test automatique — à supprimer');
  res.message = await submit(pg);
  // 3) hors horaires refusé côté serveur (vendredi 08:00 injecté)
  res.siteErrors = errs.slice();
  // mobile 390
  const m = await b.newPage(); const merr = []; m.on('pageerror', e => merr.push(e.message)); m.on('console', x => { if (x.type() === 'error') merr.push(x.text()); });
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await m.goto(BASE + '?m=' + Date.now(), { waitUntil: 'networkidle2' }); await sleep(2600);
  await m.screenshot({ path: OUT + 'mobile_1_hero.png' });
  res.mobileOverflow = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await m.click('#burger'); await sleep(900); await m.screenshot({ path: OUT + 'mobile_1b_menu.png' });
  res.mobileMenu = await m.evaluate(() => document.getElementById('links').classList.contains('open'));
  await m.click('#burger'); await sleep(600);
  for (const [id, n] of SECS) { await m.evaluate(id => document.getElementById(id).scrollIntoView(), id); await sleep(1500); await m.screenshot({ path: OUT + 'mobile_' + n + '_' + id + '.png' }); }
  res.stickyVisible = await m.$eval('#sticky', e => e.classList.contains('show') && getComputedStyle(e).display !== 'none');
  await m.evaluate(() => document.getElementById('reserver').scrollIntoView()); await sleep(800);
  await setDate(m, inDays(5)); await sleep(200); await m.select('#f-time', '20:00'); await m.type('#f-name', 'TEST E2E SebsGarden mobile'); await m.type('#f-phone', '0555 00 00 93');
  res.mobileReservation = await submit(m); await m.evaluate(() => document.querySelector('#f-out').scrollIntoView({ block: 'center' })); await sleep(400);
  await m.screenshot({ path: OUT + 'mobile_8_form_sent.png' });
  res.mobileOverflowEnd = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  res.mobileErrors = merr;
  // admin (en ligne) : page de connexion + mauvais mot de passe
  const a = await b.newPage(); const aerr = []; a.on('pageerror', e => aerr.push(e.message));
  await a.setViewport({ width: 1440, height: 900 });
  await a.goto(BASE + 'admin/', { waitUntil: 'networkidle2' });
  await a.waitForSelector('#login:not([hidden])', { timeout: 15000 }); await sleep(400);
  await a.screenshot({ path: OUT + 'admin_login.png' });
  await a.type('#login-email', 'benduy0@gmail.com'); await a.type('#login-pw', 'mauvais-mot-de-passe-test');
  await a.click('#login-form button'); await a.waitForSelector('#login-err:not([hidden])', { timeout: 15000 });
  res.adminWrongPw = await a.$eval('#login-err', e => e.textContent); res.adminErrors = aerr;
  const am = await b.newPage(); await am.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await am.goto(BASE + 'admin/', { waitUntil: 'networkidle2' }); await am.waitForSelector('#login:not([hidden])'); await am.screenshot({ path: OUT + 'admin_login_mobile.png' });
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
