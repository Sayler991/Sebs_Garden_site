/* Seb’s Garden — contenu en direct (Supabase sebsgarden.site_content → content.json → HTML statique),
   formulaire réservation / message, animations. Script classique (fonctionne aussi en file://). */
(function () {
  'use strict';
  var C = window.SEBSGARDEN_CONFIG || {}, sb = null, DATA = null;
  try { if (window.supabase && C.SUPABASE_URL) sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { db: { schema: C.SCHEMA || 'sebsgarden' }, auth: { persistSession: false } }); } catch (e) { sb = null; }
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(t) { return esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
  function get(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  var DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var HOURS = { 0: ['12:00', '00:00'], 1: ['12:00', '00:00'], 2: ['12:00', '00:00'], 3: ['12:00', '00:00'], 4: ['12:00', '00:30'], 5: ['16:30', '00:30'], 6: ['12:00', '00:00'] };
  function hhmm(s) { return String(s || '').replace(':', 'h'); }
  function mins(s) { var p = String(s).split(':'); var m = (+p[0]) * 60 + (+p[1] || 0); return m < 360 ? m + 1440 : m; }
  function algiersNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Algiers', weekday: 'short', hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; f.forEach(function (x) { o[x.type] = x.value; });
      return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute), iso: o.year + '-' + o.month + '-' + o.day };
    } catch (e) { var d = new Date(); return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes(), iso: d.toISOString().slice(0, 10) }; }
  }

  /* ---------- contenu ---------- */
  function apply(d, src) {
    DATA = d; document.documentElement.setAttribute('data-live', src);
    $$('[data-c]').forEach(function (el) {
      var v = get(d, el.getAttribute('data-c')); if (typeof v !== 'string' || !v) return;
      if (el.id === 'hero-title') { if (el.getAttribute('aria-label') !== v.replace(/\*/g, '')) { el.innerHTML = rich(v); split(el); } } else el.innerHTML = rich(v);
    });
    var b = d.business || {};
    if (b.phone_intl) $$('a[href^="tel:"]').forEach(function (a) { a.setAttribute('href', 'tel:' + b.phone_intl); });
    if (b.phone) $$('.ph').forEach(function (e) { e.textContent = b.phone; });
    if (b.maps_url) $$('a[href*="google.com/maps"]').forEach(function (a) { a.setAttribute('href', b.maps_url); });
    var os = $('#openstate');
    if (b.open === false) { os.textContent = b.closed_text || 'Momentanément fermé.'; os.hidden = false; } else os.hidden = true;
    Object.keys(d.photos || {}).forEach(function (k) {
      var p = d.photos[k]; if (!p) return;
      $$('img[data-photo="' + k + '"]').forEach(function (img) {
        if (p.alt && img.alt) img.alt = p.alt;
        if (p.src && /^https:\/\//.test(p.src)) { var pic = img.parentNode; $$('source', pic).forEach(function (s) { s.remove(); }); img.src = p.src; }
      });
    });
    if (Array.isArray(d.specialities) && d.specialities.length) { $('#marquee').innerHTML = d.specialities.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join(''); marquee(); }
    var m = d.menu || {};
    (m.categories || []).forEach(function (c, i) {
      var tab = $('#mt-' + i), pan = $('#mp-' + i); if (!tab || !pan) return;
      if (c.title) { tab.textContent = c.title; $('h3', pan).textContent = c.title; }
      if (c.desc) $('.mtxt > p', pan).textContent = c.desc;
      $('.mitems', pan).innerHTML = (c.items || []).filter(function (it) { return it && it.name; }).map(function (it, j) {
        var price = String(it.price || '').trim();
        return '<li style="--i:' + j + '"><span><span class="n">' + esc(it.name) + '</span>' + (it.desc ? '<span class="d">' + esc(it.desc) + '</span>' : '') + '</span><span class="dots"></span>' + (price ? '<span class="p">' + esc(price) + (/^[0-9 .,]+$/.test(price) ? ' ' + esc(m.currency || 'DA') : '') + '</span>' : '') + '</li>';
      }).join('');
    });
    if (Array.isArray(d.hours) && d.hours.length === 7) {
      HOURS = {}; d.hours.forEach(function (h) { var i = DAYS.indexOf(h.day); if (i >= 0) HOURS[i] = h.closed ? null : [h.open, h.close]; });
      $('#hours').innerHTML = d.hours.map(function (h) { return '<li data-dow="' + DAYS.indexOf(h.day) + '"><span>' + esc(h.day) + '</span><b>' + (h.closed ? 'Fermé' : esc(hhmm(h.open)) + ' – ' + esc(hhmm(h.close))) + '</b></li>'; }).join('');
    }
    if (Array.isArray(d.reviews) && d.reviews.length) {
      $('#reviews').innerHTML = d.reviews.map(function (r) { return '<blockquote class="rv reveal"><span class="rq" aria-hidden="true">“</span><p>' + esc(r.text) + '</p><cite>' + esc(r.author) + '</cite></blockquote>'; }).join('');
    }
    var bk = d.booking || {}, t = $('#t-reservation');
    if (bk.open === false) { t.disabled = true; t.title = 'Réservations en ligne fermées'; setKind('message'); } else t.disabled = false;
    today(); fillTimes(); observe(); tabInk();
  }
  function load() {
    var fb = function () {
      if (location.protocol === 'file:') { document.documentElement.setAttribute('data-live', 'static'); return; }
      return fetch('content.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { apply(d, 'fallback'); }).catch(function () { document.documentElement.setAttribute('data-live', 'static'); });
    };
    if (!sb) return fb();
    var to = new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 6000); });
    Promise.race([sb.from('site_content').select('data').eq('id', 1).single(), to]).then(function (r) {
      if (r.error || !r.data) throw r.error || new Error('vide'); apply(r.data.data, 'supabase');
    }).catch(fb);
  }

  /* ---------- horaires ---------- */
  function today() {
    var n = algiersNow();
    $$('#hours li').forEach(function (li) { li.classList.toggle('today', +li.getAttribute('data-dow') === n.dow); });
    var h = HOURS[n.dow], el = $('#now-open'), open = false, txt;
    if (h) { open = n.min >= mins(h[0]) && n.min < mins(h[1]); }
    var prev = HOURS[(n.dow + 6) % 7];
    if (!open && prev && mins(prev[1]) > 1440 && n.min < mins(prev[1]) - 1440) open = true;
    if (DATA && DATA.business && DATA.business.open === false) open = false;
    var cl = h ? (h[1] === '00:00' ? 'minuit' : h[1] === '00:30' ? 'minuit et demie' : hhmm(h[1])) : '';
    txt = open ? 'Ouvert en ce moment' + (cl ? ' · jusqu’à ' + cl : '') : (h && n.min < mins(h[0]) ? 'Fermé · ouvre aujourd’hui à ' + hhmm(h[0]) : 'Fermé en ce moment');
    el.textContent = txt; el.classList.toggle('closed', !open);
  }

  /* ---------- titre lettre par lettre ---------- */
  function split(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var ws = document.createElement('span'); ws.className = 'w';
            w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    el.setAttribute('aria-label', el.textContent);
  }

  /* ---------- animations ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }) : null;
  function observe() {
    var groups = new Map ? new Map() : null;
    $$('.reveal:not(.in)').forEach(function (el) {
      if (groups) { var p = el.parentNode, k = groups.get(p) || 0; el.style.setProperty('--sd', Math.min(k, 6) * 0.09 + 's'); groups.set(p, k + 1); }
      if (io && !RM) io.observe(el); else el.classList.add('in');
    });
    $$('svg.draw:not(.in)').forEach(function (s) {
      var p = $('path', s); try { s.style.setProperty('--len', Math.ceil(p.getTotalLength() * 1.2)); } catch (e) {}
      if (s.classList.contains('hero-line')) return;
      if (io && !RM) io.observe(s); else s.classList.add('in');
    });
  }
  function marquee() {
    var t = $('#marquee'); if (RM || t.getAttribute('data-dup') === t.innerHTML.length + '') return;
    var html = t.innerHTML; t.innerHTML = html + html.replace(/<span>/g, '<span aria-hidden="true">'); t.setAttribute('data-dup', t.innerHTML.length + '');
  }
  // diaporama du haut de page (Ken Burns)
  var slides = $$('.slide'), dots = $$('#hero-dots i'), cur = 0;
  function nextSlide() {
    slides[cur].classList.remove('on'); dots[cur].classList.remove('on');
    cur = (cur + 1) % slides.length;
    var img = $('img', slides[cur]); img.loading = 'eager';
    slides[cur].classList.add('on'); void dots[cur].offsetWidth; dots[cur].classList.add('on');
  }
  if (!RM) setInterval(function () { if (!document.hidden) nextSlide(); }, 6000);
  // défilement : barre, nav, parallaxe, lien actif
  var nav = $('#nav'), sticky = $('#sticky'), hero = $('.hero'), media = $('#hero-media'), prog = $('#progress'), pars = $$('[data-par]'), ticking = false;
  var secs = ['maison', 'carte', 'ambiance', 'avis', 'reserver', 'horaires'].map(function (id) { return document.getElementById(id); });
  function frame() {
    ticking = false; var y = window.scrollY, vh = window.innerHeight, H = document.documentElement.scrollHeight - vh;
    nav.classList.toggle('solid', y > 40); sticky.classList.toggle('show', y > hero.offsetHeight * 0.6);
    prog.style.transform = 'scaleX(' + (H > 0 ? y / H : 0) + ')';
    if (!RM) {
      if (y < vh * 1.2) media.style.transform = 'translate3d(0,' + (y * 0.32) + 'px,0)';
      pars.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; var c = (r.top + r.height / 2 - vh / 2); el.style.translate = '0 ' + (c * +el.getAttribute('data-par')).toFixed(1) + 'px'; });
    }
    var act = null; secs.forEach(function (s) { if (s && s.getBoundingClientRect().top < vh * 0.4) act = s.id; });
    $$('.links a').forEach(function (a) { a.classList.toggle('act', a.getAttribute('href') === '#' + act); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', function () { tabInk(); frame(); });
  // lueur au survol des cartes
  $$('.feat').forEach(function (c) { c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // menu mobile
  var burger = $('#burger'), links = $('#links');
  burger.addEventListener('click', function () { var o = !links.classList.contains('open'); links.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; });
  $$('#links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }); });

  /* ---------- onglets de la carte ---------- */
  var mtabs = $$('#mtabs [role=tab]');
  function ink(btn, el) { if (!btn || !el) return; el.style.width = btn.offsetWidth + 'px'; el.style.transform = 'translateX(' + btn.offsetLeft + 'px)'; }
  function tabInk() { ink($('#mtabs [aria-selected=true]'), $('#mtabs-ink')); ink($('.ftabs [aria-selected=true]'), $('.ftabs-ink')); }
  function selTab(i, focus) {
    mtabs.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; var p = $('#mp-' + j); p.hidden = i !== j; p.classList.toggle('on', i === j); });
    var p = $('#mp-' + i); $$('.mitems li', p).forEach(function (li) { li.style.animation = 'none'; void li.offsetWidth; li.style.animation = ''; });
    tabInk(); if (focus) mtabs[i].focus();
  }
  mtabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selTab(i); });
    b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') selTab((i + 1) % mtabs.length, 1); if (e.key === 'ArrowLeft') selTab((i + mtabs.length - 1) % mtabs.length, 1); });
  });

  /* ---------- formulaire ---------- */
  var form = $('#p-form'), out = $('#f-out');
  function setKind(k) {
    form.setAttribute('data-kind', k); out.innerHTML = '';
    $$('.ftabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-kind') === k)); });
    $('#f-msg-l').textContent = k === 'message' ? 'Votre message *' : 'Précisions (facultatif)';
    tabInk();
  }
  $$('.ftabs button').forEach(function (b) { b.addEventListener('click', function () { setKind(b.getAttribute('data-kind')); }); });
  var N = algiersNow(), dmax = new Date(N.iso + 'T12:00:00Z'); dmax.setUTCDate(dmax.getUTCDate() + 60);
  $('#f-day').min = N.iso; $('#f-day').max = dmax.toISOString().slice(0, 10);
  var gs = ''; for (var g = 1; g <= 20; g++) gs += '<option value="' + g + '"' + (g === 2 ? ' selected' : '') + '>' + g + (g === 1 ? ' personne' : ' personnes') + '</option>'; $('#f-guests').innerHTML = gs;
  function fillTimes() {
    var d = $('#f-day').value, sel = $('#f-time'), keep = sel.value, html = '<option value="">' + (d ? 'Choisir…' : 'Choisir d’abord la date') + '</option>';
    if (d) {
      var dow = new Date(d + 'T12:00:00Z').getUTCDay(), h = HOURS[dow], n = algiersNow();
      if (h) for (var m = Math.ceil(mins(h[0]) / 30) * 30; m <= Math.min(mins(h[1]) - 60, 23 * 60); m += 30) {
        if (d === n.iso && m <= n.min + 15) continue;
        var v = ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); html += '<option value="' + v + '">' + v.replace(':', 'h') + '</option>';
      }
    }
    sel.innerHTML = html; if (keep && sel.querySelector('option[value="' + keep + '"]')) sel.value = keep;
  }
  $('#f-day').addEventListener('input', fillTimes); $('#f-day').addEventListener('change', fillTimes);
  function show(t, ok) { out.innerHTML = '<p class="msg ' + (ok ? 'ok' : 'err') + '">' + esc(t) + '</p>'; }
  function bad(el, t) { el.setAttribute('aria-invalid', 'true'); el.focus(); show(t, false); return false; }
  function validate(k) {
    $$('#p-form [aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
    if (k === 'reservation') {
      var d = $('#f-day').value; if (!d) return bad($('#f-day'), 'Choisissez une date.');
      if (d < $('#f-day').min || d > $('#f-day').max) return bad($('#f-day'), 'Date entre aujourd’hui et 60 jours.');
      if (!$('#f-time').value) return bad($('#f-time'), 'Choisissez une heure.');
    }
    if ($('#f-name').value.trim().length < 2) return bad($('#f-name'), 'Indiquez votre nom.');
    if (!/^\+?[0-9][0-9 .-]{7,18}[0-9]$/.test($('#f-phone').value.trim())) return bad($('#f-phone'), 'Numéro de téléphone invalide (ex. 05 55 12 34 56).');
    var em = $('#f-email').value.trim(); if (k === 'message' && em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return bad($('#f-email'), 'E-mail invalide.');
    if (k === 'message' && $('#f-msg').value.trim().length < 5) return bad($('#f-msg'), 'Écrivez votre message en quelques mots.');
    return true;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var k = form.getAttribute('data-kind');
    if (!validate(k)) return;
    var phone = (DATA && DATA.business && DATA.business.phone) || '0559 82 67 81';
    if (!sb) return show('Envoi indisponible pour le moment : appelez-nous au ' + phone + '.', false);
    var btn = $('#f-send'); btn.disabled = true; $('span', btn).textContent = 'Envoi…';
    var row = { kind: k, name: $('#f-name').value.trim(), phone: $('#f-phone').value.trim(), message: $('#f-msg').value.trim() || null, hp: $('#f-hp').value };
    if (k === 'reservation') { row.day = $('#f-day').value; row.at_time = $('#f-time').value; row.guests = +$('#f-guests').value; row.occasion = $('#f-occasion').value || null; }
    else row.email = $('#f-email').value.trim() || null;
    sb.from('requests').insert(row).then(function (r) {
      if (r.error) throw new Error(r.error.message);
      var tx = k === 'reservation' ? 'Merci ! Votre demande de réservation (' + row.guests + ' pers., ' + new Date(row.day + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) + ' à ' + row.at_time.replace(':', 'h') + ') est bien reçue. Nous vous rappelons pour confirmer.' : 'Merci ! Votre message est bien reçu. Nous vous recontactons rapidement.';
      form.reset(); $('#f-guests').value = '2'; fillTimes(); setKind(k); show(tx, true); form.setAttribute('data-sent', String((+form.getAttribute('data-sent') || 0) + 1));
    }).catch(function (err) { show((err && err.message) || ('Échec de l’envoi. Appelez-nous au ' + phone + '.'), false); })
      .then(function () { btn.disabled = false; $('span', btn).textContent = 'Envoyer la demande'; });
  });

  /* ---------- démarrage ---------- */
  split($('#hero-title')); marquee(); setKind('reservation'); fillTimes(); today(); observe(); frame();
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add('ready'); tabInk(); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tabInk);
  setInterval(today, 60000);
  load();
})();
