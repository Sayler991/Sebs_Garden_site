const p = require('/workspace/terrasse/ibis_tlemcen_site/work/node_modules/puppeteer-core');
const [,, URL, OUT, W, H] = process.argv; const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await p.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'], headless: 'new' });
  const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.setViewport({ width: +W || 1440, height: +H || 900, deviceScaleFactor: 1, isMobile: (+W) < 500, hasTouch: (+W) < 500 });
  await pg.goto(URL, { waitUntil: 'networkidle2' }); await sleep(2500);
  await pg.screenshot({ path: OUT + '_0.png' });
  const ids = ['maison', 'carte', 'ambiance', 'avis', 'reserver', 'horaires'];
  for (const id of ids) { await pg.evaluate(id => document.getElementById(id).scrollIntoView(), id); await sleep(1600); await pg.screenshot({ path: OUT + '_' + id + '.png' }); }
  console.log(JSON.stringify({ errs, live: await pg.evaluate(() => document.documentElement.getAttribute('data-live')), overflow: await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth) }));
  await b.close();
})();
