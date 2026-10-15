// Interface patron + alertes (faux client Supabase). node admin_test.js OUTDIR PORT (serveur : racine du dépôt)
const p = require('/workspace/terrasse/ibis_tlemcen_site/work/node_modules/puppeteer-core');
const OUT = (process.argv[2] || '/workspace/sebsgarden_shots/').replace(/\/?$/, '/');
const BASE = 'http://127.0.0.1:' + (process.argv[3] || '8894') + '/tools/e2e/admin_harness.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await p.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'], headless: 'new' });
  const res = {}; const pg = await b.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('dialog', d => d.accept());
  await pg.evaluateOnNewDocument(() => { window.NOTIFS = []; const N = function (t, o) { NOTIFS.push(t + ' | ' + o.body); }; N.permission = 'granted'; N.requestPermission = () => Promise.resolve('granted'); window.Notification = N;
    const AC = window.AudioContext; window.BEEPS = 0; window.AudioContext = function () { const a = new AC(); const o = a.createOscillator.bind(a); a.createOscillator = function () { window.BEEPS++; return o(); }; return a; }; });
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(BASE + '#reservation', { waitUntil: 'networkidle0' }); await sleep(900);
  for (const t of ['reservation', 'message', 'clients', 'stats', 'contenu', 'carte', 'horaires', 'photos', 'historique']) {
    await pg.evaluate(t => document.querySelector('.side button[data-tab="' + t + '"]').click(), t); await sleep(600);
    res[t] = await pg.$eval('#main', e => ({ h2: e.querySelector('h2').textContent, cards: e.querySelectorAll('.card').length }));
    await pg.screenshot({ path: OUT + 'admin_' + t + '.png' });
  }
  // statut, note client, prix, horaires, restauration
  await pg.evaluate(() => document.querySelector('.side button[data-tab="reservation"]').click()); await sleep(400);
  await pg.evaluate(() => { const s = document.querySelector('.card.req select'); s.value = 'confirmé'; s.dispatchEvent(new Event('change')); }); await sleep(300);
  await pg.evaluate(() => document.querySelector('.side button[data-tab="clients"]').click()); await sleep(400);
  await pg.evaluate(() => { const t = document.querySelector('.card textarea'); t.value = 'Aime la table près de la fenêtre'; document.querySelector('.card .btn-line').click(); }); await sleep(300);
  await pg.evaluate(() => document.querySelector('.side button[data-tab="carte"]').click()); await sleep(500);
  await pg.evaluate(() => { const i = [...document.querySelectorAll('#main .item input')].find(x => x.placeholder === 'ex. 250'); i.value = '999'; i.dispatchEvent(new Event('input')); document.querySelector('#save').click(); }); await sleep(400);
  await pg.evaluate(() => document.querySelector('.side button[data-tab="horaires"]').click()); await sleep(400);
  await pg.evaluate(() => { const i = document.querySelector('#main input[type=time]'); i.value = '07:00'; i.dispatchEvent(new Event('input')); document.querySelector('#save').click(); }); await sleep(400);
  await pg.evaluate(() => document.querySelector('.side button[data-tab="contenu"]').click()); await sleep(500);
  await pg.evaluate(() => { const c = document.querySelector('#main .switch input'); c.click(); document.querySelector('#save').click(); }); await sleep(400);
  await pg.evaluate(() => document.querySelector('.side button[data-tab="historique"]').click()); await sleep(400);
  await pg.evaluate(() => { const b = document.querySelector('#main .card button'); if (b) b.click(); }); await sleep(500);
  // alertes : réservation via temps réel (onglet Clients ouvert) + message via relève 30 s
  await pg.evaluate(() => document.querySelector('.side button[data-tab="clients"]').click()); await sleep(300);
  await pg.evaluate(() => rtHandler({ new: { id: 901, kind: 'reservation', name: 'Client Fictif (temps réel)', day: '2026-10-21', at_time: '20:30', guests: 3 } })); await sleep(500);
  await pg.evaluate(() => { pollRows.push({ id: 902, kind: 'message', name: 'Client Fictif (relève)' }); window.__poll(); }); await sleep(600);
  Object.assign(res, await pg.evaluate(() => ({ title: document.title, badges: [...document.querySelectorAll('.al-badge')].map(e => e.parentNode.getAttribute('data-tab') + '=' + e.textContent), banners: [...document.querySelectorAll('.al-banner b')].map(e => e.textContent), notifs: NOTIFS, beeps: BEEPS, rt: document.documentElement.getAttribute('data-realtime'), log: LOG })));
  await pg.screenshot({ path: OUT + 'admin_alerts.png' });
  const m = await b.newPage(); await m.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await m.goto(BASE + '#reservation', { waitUntil: 'networkidle0' }); await sleep(900); await m.screenshot({ path: OUT + 'admin_mobile_reservations.png' });
  res.mobileOverflow = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  res.errors = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
