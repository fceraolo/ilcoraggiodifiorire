/* Il Coraggio di Fiorire — POC. Nessuna dipendenza: JS puro. */
(function () {
  'use strict';

  /* ===== Configurazione (da compilare prima della pubblicazione) ===== */
  var CONFIG = {
    // Numero WhatsApp di Martina in formato internazionale senza + (es. 393331234567).
    // Se vuoto, WhatsApp apre la scelta del contatto con il testo già scritto (utile per la prova).
    whatsapp: '393317972905',
    instagram: 'https://ig.me/m/ilcoraggiodifiorire',                                   // apre la chat DM
    facebook: 'https://www.facebook.com/share/17t61dgn73/?mibextid=wwXIfr',              // pagina (poi «Messaggio»)
    tiktok: 'https://www.tiktok.com/@il.coraggio.di.fi?_r=1&_t=ZG-98pMKdzc0kz'           // profilo (poi messaggio)
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var smooth = reduce ? 'auto' : 'smooth';

  var CAT = JSON.parse($('#catalog').textContent), META = JSON.parse($('#meta').textContent);
  var BYID = {}; CAT.forEach(function (i) { BYID[i.id] = i; });

  /* ===== Petali nell'hero ===== */
  (function petals() {
    var box = $('.petals'); if (!box || reduce) return;
    var n = innerWidth < 700 ? 9 : 16, cols = ['#C99AA0', '#E3B7B3', '#9C5760', '#EBC9C3', '#D9A5A5'], h = '';
    for (var i = 0; i < n; i++) {
      var s = 14 + Math.random() * 22;
      h += '<span class="petal" style="--x:' + (Math.random() * 100).toFixed(1) + '%;--s:' + s.toFixed(0) + 'px;--c:' + cols[i % cols.length] +
        ';--t:' + (14 + Math.random() * 12).toFixed(1) + 's;--dl:-' + (Math.random() * 24).toFixed(1) + 's;--dx:' + ((Math.random() - .5) * 220).toFixed(0) +
        'px;--r0:' + (Math.random() * 360).toFixed(0) + 'deg;--r1:' + (Math.random() * 720 - 360).toFixed(0) + 'deg"><svg viewBox="0 0 40 60"><use href="#petal"/></svg></span>';
    }
    box.innerHTML = h;
    new IntersectionObserver(function (e) { box.classList.toggle('paused', !e[0].isIntersecting); }).observe($('#hero'));
  })();

  /* ===== Parole che si accendono con lo scroll ===== */
  var wrs = [];
  $$('.wr').forEach(function (el) {
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.nodeName !== 'BR') split(c);
      });
    })(el);
    wrs.push({ el: el, w: $$('.w', el) });
  });
  function updateWords() {
    var vh = innerHeight;
    wrs.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var p = clamp((vh * .86 - r.top) / (r.height + vh * .3), 0, 1), n = o.w.length, k = p * (n + 3);
      for (var i = 0; i < n; i++) o.w[i].style.opacity = reduce ? 1 : (.2 + .8 * clamp(k - i, 0, 1)).toFixed(2);
    });
  }

  /* ===== Comparsa degli elementi ===== */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });
  var cardIo = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; cardIo.unobserve(el);
      var cls = el.classList.contains('acard') ? '.acard' : '.card';
      var idx = $$(cls + ':not([hidden])', el.parentNode).indexOf(el);
      el.style.setProperty('--d', ((idx % 4) * .09) + 's');
      el.classList.remove('pre');
    });
  }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
  function armCards() { $$('.card, .acard').forEach(function (c) { if (!c.hidden) { c.classList.add('pre'); cardIo.observe(c); } }); }
  armCards();

  /* ===== I fiori: scorrimento orizzontale con frecce, trascinamento e swipe ===== */
  var fWrap = $('#fWrap'), fTrack = $('#ftrack'), fPrev = $('#fPrev'), fNext = $('#fNext'), fcards = $$('.fcard');
  function fStep() {
    var c = fcards[0]; if (!c) return 300;
    return c.getBoundingClientRect().width + (parseFloat(getComputedStyle(fTrack).columnGap) || 20);
  }
  function fUpdate() {
    var max = fWrap.scrollWidth - fWrap.clientWidth, x = fWrap.scrollLeft;
    fPrev.disabled = x < 4; fNext.disabled = x > max - 4;
    $('#fbar').style.transform = 'scaleX(' + (max > 0 ? clamp(x / max, 0, 1) : 1).toFixed(3) + ')';
    var cur = Math.min(fcards.length, Math.round(x / fStep()) + 1);
    $('#fcur').textContent = (cur < 10 ? '0' : '') + cur;
  }
  function fGo(dir) {
    var step = fStep(), n = Math.max(1, Math.floor(fWrap.clientWidth / step));
    fWrap.scrollBy({ left: dir * n * step, behavior: smooth });
  }
  fPrev.onclick = function () { fGo(-1); }; fNext.onclick = function () { fGo(1); };
  fWrap.addEventListener('scroll', fUpdate, { passive: true });
  (function drag() {
    var down = false, sx = 0, sl = 0, moved = false;
    fWrap.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = fWrap.scrollLeft;
    });
    addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; fWrap.classList.add('drag'); }
      if (moved) fWrap.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () {
      if (!down) return; down = false; fWrap.classList.remove('drag');
      if (moved) setTimeout(function () { moved = false; }, 0);
    });
    fWrap.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  })();

  /* ===== Recensioni: scorrimento con frecce e avanzamento automatico ===== */
  var rT = $('#rTrack'), rHover = false, rVis = false;
  function rStep() { var c = $('.rcard', rT); return c ? c.getBoundingClientRect().width + 17 : 380; }
  function rGo(dir) {
    var max = rT.scrollWidth - rT.clientWidth;
    if (dir > 0 && rT.scrollLeft > max - 8) rT.scrollTo({ left: 0, behavior: smooth });
    else if (dir < 0 && rT.scrollLeft < 8) rT.scrollTo({ left: max, behavior: smooth });
    else rT.scrollBy({ left: dir * rStep(), behavior: smooth });
  }
  $('#rPrev').onclick = function () { rGo(-1); }; $('#rNext').onclick = function () { rGo(1); };
  rT.addEventListener('mouseenter', function () { rHover = true; }); rT.addEventListener('mouseleave', function () { rHover = false; });
  rT.addEventListener('touchstart', function () { rHover = true; }, { passive: true });
  new IntersectionObserver(function (e) { rVis = e[0].isIntersecting; }).observe(rT);
  if (!reduce) setInterval(function () { if (rVis && !rHover && !openDlg) rGo(1); }, 6000);

  /* ===== Album: mostra tutto ===== */
  $('#aMore').addEventListener('click', function () {
    $('#aWrap').classList.add('open'); this.parentNode.hidden = true; setTimeout(armCards, 50);
  });

  /* ===== Scroll unico (rAF) ===== */
  var hdr = $('#hdr'), prog = $('#progress'), hero = $('#heroIn'), totop = $('#totop'), ticking = false, hdrH = 60;
  var secs = ['recensioni', 'fiori', 'catalogo', 'album', 'storie', 'ordina'].map(function (id) { return { id: id, el: document.getElementById(id) }; });
  var navA = $$('.nav a');
  function onScroll() {
    ticking = false;
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    hdrH = hdr.offsetHeight;
    hdr.classList.toggle('solid', y > 30);
    prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    totop.classList.toggle('show', y > innerHeight * .8);
    if (!reduce && y < innerHeight * 1.2) {
      hero.style.transform = 'translate3d(0,' + (y * .22).toFixed(1) + 'px,0)';
      hero.style.opacity = clamp(1 - y / (innerHeight * .75), 0, 1).toFixed(2);
    }
    var cur = '';
    secs.forEach(function (s) { if (s.el.getBoundingClientRect().top < innerHeight * .45) cur = s.id; });
    navA.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
    updateWords();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { fUpdate(); req(); });
  addEventListener('load', function () { fUpdate(); onScroll(); });
  fUpdate(); onScroll();

  /* ===== Catalogo: gruppi, ricerca, occasione ===== */
  var F = { g: 'all', q: '', occ: '' };
  var cards = $$('.card'), groups = $$('.group'), resEl = $('#results'), emptyEl = $('#empty');
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function applyFilters(animate) {
    var q = norm(F.q.trim()), shown = 0;
    cards.forEach(function (c) {
      var it = BYID[c.dataset.id];
      var ok = (F.g === 'all' || c.dataset.g === F.g) &&
        (!F.occ || c.dataset.occ.split('|').indexOf(F.occ) > -1) &&
        (!q || norm(it.title + ' ' + it.desc + ' ' + it.occ.join(' ')).indexOf(q) > -1);
      c.hidden = !ok; if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !$('.card:not([hidden])', g); });
    emptyEl.hidden = shown > 0;
    var filtered = F.g !== 'all' || F.q || F.occ;
    resEl.textContent = filtered ? shown + (shown === 1 ? ' idea trovata' : ' idee trovate') : '';
    if (animate) armCards();
  }
  function scrollToCatalog() {
    var top = $('#groups').getBoundingClientRect().top + scrollY - hdrH - $('#toolbar').offsetHeight - 14;
    if (scrollY > top) scrollTo({ top: top, behavior: smooth });
  }
  $('#chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    $$('.chip').forEach(function (c) { c.classList.toggle('on', c === b); });
    F.g = b.dataset.g; applyFilters(true); scrollToCatalog();
  });
  var qEl = $('#q'), qT;
  qEl.addEventListener('input', function () { clearTimeout(qT); qT = setTimeout(function () { F.q = qEl.value; applyFilters(true); }, 160); });
  $('#occ').addEventListener('change', function (e) { F.occ = e.target.value; applyFilters(true); scrollToCatalog(); });
  $('#resetF').addEventListener('click', function () {
    F = { g: 'all', q: '', occ: '' }; qEl.value = ''; $('#occ').value = '';
    $$('.chip').forEach(function (c) { c.classList.toggle('on', c.dataset.g === 'all'); }); applyFilters(true);
  });

  /* ===== Le Storie: schede emozione ===== */
  var stabs = $$('.stab');
  function pickStory(b) {
    stabs.forEach(function (t) { var on = t === b; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    $$('.spanel').forEach(function (p) {
      var on = p.id === b.dataset.s; p.hidden = !on; p.classList.toggle('on', on);
    });
    if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: smooth });
    req();
  }
  $('#stabs').addEventListener('click', function (e) { var b = e.target.closest('.stab'); if (b) pickStory(b); });
  $('#stabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var i = stabs.findIndex(function (t) { return t.classList.contains('on'); });
    var n = stabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + stabs.length) % stabs.length]; pickStory(n); n.focus();
  });

  /* ===== Finestre (modale e carrello) ===== */
  var openDlg = null;
  function showDlg(d) {
    if (openDlg) hideDlg(openDlg, true);
    d.showModal(); openDlg = d; updSticky();
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('show'); }); });
    history.pushState({ dlg: d.id }, '');
  }
  function hideDlg(d, silent) {
    if (!d.open) return;
    d.classList.remove('show'); closeLb();
    setTimeout(function () { if (d.open) d.close(); if (openDlg === d) { openDlg = null; document.documentElement.style.overflow = ''; } updSticky(); }, reduce ? 0 : 380);
    if (silent) openDlg = null;
  }
  function closeDlg(d) {
    if (history.state && history.state.dlg === d.id) history.back(); else hideDlg(d);
  }
  addEventListener('popstate', function () { if (openDlg) hideDlg(openDlg); });
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) closeDlg(d); });
    d.addEventListener('cancel', function (e) { e.preventDefault(); if (!$('#lb').hidden) closeLb(); else closeDlg(d); });
    $$('[data-close]', d).forEach(function (b) {
      b.addEventListener('click', function () {
        var go = b.dataset.goto; closeDlg(d);
        if (go) setTimeout(function () { var t = $(go); if (t) t.scrollIntoView({ behavior: smooth }); }, 420);
      });
    });
  });

  /* ===== Richiesta (carrello senza pagamento) ===== */
  var KEY = 'cdf_richiesta_v1', REQ = {};
  try { REQ = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { REQ = {}; }
  Object.keys(REQ).forEach(function (k) { if (!BYID[k]) delete REQ[k]; });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(REQ)); } catch (e) { /* navigazione privata */ } }
  function count() { return Object.keys(REQ).length; }
  var toastEl = $('#toast'), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600); }
  var noQty = function (it) { return it.kind === 'storia' || it.kind === 'album'; };

  function updSticky() { $('#stickyCart').hidden = !count() || !!openDlg; }
  function syncUI(bump) {
    var n = count(), b = $('#badge');
    b.hidden = !n; b.textContent = n;
    $$('[data-add]').forEach(function (btn) {
      var inn = !!REQ[btn.dataset.add]; btn.classList.toggle('in', inn);
      var lab = $('b', btn); if (lab && !btn.dataset.l0) btn.dataset.l0 = lab.textContent;
      if (lab) lab.textContent = inn ? (BYID[btn.dataset.add].kind === 'storia' ? 'Aggiunta' : 'Aggiunto') : btn.dataset.l0;
      btn.setAttribute('aria-pressed', inn);
    });
    updSticky(); $('#stickyN').textContent = n;
    $('#fab').classList.toggle('nocart', !n);
    if (bump) { var cb = $('#openCart'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
    renderCart();
  }
  function addItem(id, q, note) { REQ[id] = { q: q || 1, note: note || '' }; save(); syncUI(true); }
  function rmItem(id) { delete REQ[id]; save(); syncUI(false); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]'); if (!b) return;
    e.stopPropagation(); e.preventDefault();
    var id = b.dataset.add, it = BYID[id];
    if (REQ[id]) { rmItem(id); toast('Tolto dalla richiesta: ' + it.title); }
    else { addItem(id, 1, ''); b.classList.add('pop'); setTimeout(function () { b.classList.remove('pop'); }, 500); toast('Aggiunto alla tua richiesta: ' + it.title); }
  }, true);

  /* --- modale --- */
  var M = { list: [], i: 0, s: 0, qty: 1 };
  var mEl = $('#modal');
  function ctxList(id) {
    var it = BYID[id];
    if (it.kind === 'fiore' || it.kind === 'album') return CAT.filter(function (x) { return x.kind === it.kind; }).map(function (x) { return x.id; });
    return $$('.card:not([hidden])').map(function (c) { return c.dataset.id; });
  }
  function openItem(id) {
    M.list = ctxList(id); M.i = Math.max(0, M.list.indexOf(id)); fillModal();
    if (!mEl.open) showDlg(mEl);
  }
  function fillModal() {
    var it = BYID[M.list[M.i]], inReq = REQ[it.id];
    $('#mGroup').textContent = it.kind === 'fiore' ? 'Un fiore che posso realizzare' : it.kind === 'album' ? 'Dall\'album · ' + META.albumTitle : it.group;
    $('#mTitle').textContent = it.title;
    var sk = $('#mSku'); sk.hidden = !it.sku; if (it.sku) $('span', sk).textContent = it.sku;
    // Descrizione: quella pubblicata (StockBase); per i fiori ancora senza descrizione, il testo del sito sui fiori.
    $('#mDesc').textContent = it.desc || (it.kind === 'fiore' ? META.fioriFallback : '');
    $('#mDesc').hidden = !$('#mDesc').textContent;
    $('#mOccWrap').hidden = !it.occ.length;
    $('#mOcc').innerHTML = ''; it.occ.forEach(function (o) { var li = document.createElement('li'); li.textContent = o; $('#mOcc').appendChild(li); });
    M.qty = inReq ? inReq.q : 1; $('#mQty').textContent = M.qty; $('#mNote').value = inReq ? inReq.note : '';
    $('#mQtyBox').hidden = noQty(it);
    $('#mNote').placeholder = it.kind === 'album' ? 'Cosa cambieresti? (colori, fiori, dedica…)' : 'Colori, dimensioni, dedica…';
    $('#mAdd').textContent = inReq ? 'Aggiorna la richiesta' : (it.kind === 'album' ? 'Chiedi un lavoro così' : 'Aggiungi alla richiesta');
    var sl = $('#mSlides'); sl.innerHTML = ''; M.s = 0; sl.style.transform = '';
    if (it.imgs.length) it.imgs.forEach(function (src, k) {
      var d = document.createElement('div'), im = new Image(); im.src = src; im.alt = it.title; im.onclick = function () { openLb(k); };
      d.appendChild(im); sl.appendChild(d);
    }); else sl.innerHTML = '<div><div class="ph ph' + (M.i % 5) + '"><svg viewBox="0 0 100 100"><use href="#flower"/></svg><span>foto in arrivo</span></div></div>';
    var many = it.imgs.length > 1; $('#mPrev').hidden = $('#mNext').hidden = $('#mDots').hidden = !many;
    $('#mZoom').hidden = !it.imgs.length;
    $('#mDots').innerHTML = it.imgs.map(function (_, k) { return '<i' + (k ? '' : ' class="on"') + '></i>'; }).join('');
    var multi = M.list.length > 1; $('#mPrevP').style.visibility = $('#mNextP').style.visibility = multi ? '' : 'hidden';
    $('#mPos').textContent = multi ? (M.i + 1) + ' / ' + M.list.length : '';
    $('.mscroll', mEl).scrollTop = 0;
  }
  function slide(d) {
    var n = BYID[M.list[M.i]].imgs.length; if (n < 2) return;
    M.s = (M.s + d + n) % n; $('#mSlides').style.transform = 'translateX(' + (-100 * M.s) + '%)';
    $$('#mDots i').forEach(function (x, k) { x.classList.toggle('on', k === M.s); });
  }
  $('#mPrev').onclick = function () { slide(-1); }; $('#mNext').onclick = function () { slide(1); };
  $('#mZoom').onclick = function () { openLb(M.s); };
  var tx = null;
  $('#mGal').addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  $('#mGal').addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 40) slide(dx < 0 ? 1 : -1); });
  $('#mPrevP').onclick = function () { M.i = (M.i - 1 + M.list.length) % M.list.length; fillModal(); };
  $('#mNextP').onclick = function () { M.i = (M.i + 1) % M.list.length; fillModal(); };
  $('#mMinus').onclick = function () { M.qty = Math.max(1, M.qty - 1); $('#mQty').textContent = M.qty; };
  $('#mPlus').onclick = function () { M.qty = Math.min(99, M.qty + 1); $('#mQty').textContent = M.qty; };
  $('#mAdd').onclick = function () {
    var it = BYID[M.list[M.i]], upd = !!REQ[it.id];
    addItem(it.id, noQty(it) ? 1 : M.qty, $('#mNote').value.trim());
    toast((upd ? 'Richiesta aggiornata: ' : 'Aggiunto alla tua richiesta: ') + it.title);
    closeDlg(mEl);
  };
  document.addEventListener('click', function (e) {
    var c = e.target.closest('.card, .fcard, .acard'); if (c) openItem(c.dataset.id);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.card, .fcard, .acard')) { e.preventDefault(); openItem(e.target.dataset.id); }
  });

  /* --- foto a tutto schermo (con zoom) --- */
  var LB = { i: 0 }, lb = $('#lb'), lbImg = $('#lbImg');
  function lbList() { return BYID[M.list[M.i]].imgs; }
  function lbShow(i) {
    var l = lbList(); LB.i = (i + l.length) % l.length;
    lbImg.classList.remove('zoom'); lbImg.style.transformOrigin = ''; lbImg.src = l[LB.i]; lbImg.alt = BYID[M.list[M.i]].title;
    $('#lbC').textContent = l.length > 1 ? (LB.i + 1) + ' / ' + l.length : '';
    $('#lbP').hidden = $('#lbN').hidden = l.length < 2;
    M.s = LB.i; var sl = $('#mSlides'); sl.style.transform = 'translateX(' + (-100 * M.s) + '%)';
    $$('#mDots i').forEach(function (x, k) { x.classList.toggle('on', k === M.s); });
  }
  function openLb(i) { if (!lbList().length) return; lb.hidden = false; lbShow(i); }
  function closeLb() { lb.hidden = true; lbImg.removeAttribute('src'); }
  $('#lbX').onclick = closeLb; $('#lbP').onclick = function () { lbShow(LB.i - 1); }; $('#lbN').onclick = function () { lbShow(LB.i + 1); };
  lbImg.addEventListener('click', function (e) {
    var r = lbImg.getBoundingClientRect();
    lbImg.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
    lbImg.classList.toggle('zoom');
  });
  $('#lbStage').addEventListener('click', function (e) { if (e.target === this) closeLb(); });
  var lx = null;
  $('#lbStage').addEventListener('touchstart', function (e) { lx = e.touches[0].clientX; }, { passive: true });
  $('#lbStage').addEventListener('touchend', function (e) { if (lx === null) return; var dx = e.changedTouches[0].clientX - lx; lx = null; if (Math.abs(dx) > 50 && !lbImg.classList.contains('zoom')) lbShow(LB.i + (dx < 0 ? 1 : -1)); });
  addEventListener('keydown', function (e) {
    if (openDlg !== mEl) return;
    if (!lb.hidden) { if (e.key === 'ArrowRight') lbShow(LB.i + 1); else if (e.key === 'ArrowLeft') lbShow(LB.i - 1); return; }
    if (e.key === 'ArrowRight') slide(1); else if (e.key === 'ArrowLeft') slide(-1);
  });

  /* --- carrello --- */
  var cEl = $('#cart'), dirty = false;
  var LAB = { fiore: 'I fiori', prodotto: 'I prodotti', album: 'Dall\'album «' + META.albumTitle + '» (qualcosa di simile)', storia: 'Le Storie che Fioriscono' };
  function renderCart() {
    var ids = Object.keys(REQ), has = ids.length > 0;
    $('#cEmpty').hidden = has; $('#cFull').hidden = !has; $('#cFoot').hidden = !has;
    var ul = $('#cList'); ul.innerHTML = '';
    ids.forEach(function (id) {
      var it = BYID[id], r = REQ[id], li = document.createElement('li'), th = document.createElement('div');
      th.className = 'th'; th.innerHTML = it.thumb ? '' : '<svg viewBox="0 0 100 100"><use href="#flower"/></svg>';
      if (it.thumb) { var im = new Image(); im.src = it.thumb; im.alt = ''; th.appendChild(im); }
      var mid = document.createElement('div'), b = document.createElement('b'), sm = document.createElement('small');
      b.textContent = it.title; sm.textContent = it.sku ? 'Codice ' + it.sku : (it.kind === 'storia' ? 'Storia · ' + it.group : it.group);
      mid.appendChild(b); mid.appendChild(sm);
      var rm = document.createElement('button'); rm.className = 'rm'; rm.type = 'button'; rm.setAttribute('aria-label', 'Togli ' + it.title); rm.innerHTML = '&times;';
      rm.onclick = function () { rmItem(id); };
      var row = document.createElement('div'); row.className = 'row2';
      if (!noQty(it)) {
        var q = document.createElement('div'); q.className = 'qty';
        var mi = document.createElement('button'), ou = document.createElement('output'), pl = document.createElement('button');
        mi.type = pl.type = 'button'; mi.textContent = '−'; pl.textContent = '+'; ou.textContent = r.q; mi.setAttribute('aria-label', 'Meno'); pl.setAttribute('aria-label', 'Più');
        mi.onclick = function () { r.q = Math.max(1, r.q - 1); ou.textContent = r.q; save(); upMsg(); };
        pl.onclick = function () { r.q = Math.min(99, r.q + 1); ou.textContent = r.q; save(); upMsg(); };
        q.appendChild(mi); q.appendChild(ou); q.appendChild(pl); row.appendChild(q);
      }
      var nt = document.createElement('input'); nt.type = 'text'; nt.maxLength = 140; nt.placeholder = 'Nota (colori, dimensioni…)'; nt.value = r.note || '';
      nt.setAttribute('aria-label', 'Nota per ' + it.title);
      nt.oninput = function () { r.note = nt.value.trim(); save(); upMsg(); };
      row.appendChild(nt);
      li.appendChild(th); li.appendChild(mid); li.appendChild(rm); li.appendChild(row); ul.appendChild(li);
    });
    dirty = false; upMsg();
  }
  function buildMsg() {
    var L = ['Ciao! Ho visto il sito Il Coraggio di Fiorire e vorrei qualche informazione 🌸', ''];
    ['fiore', 'prodotto', 'album', 'storia'].forEach(function (k) {
      var ids = Object.keys(REQ).filter(function (id) { return BYID[id].kind === k; });
      if (!ids.length) return;
      L.push(LAB[k].toUpperCase());
      ids.forEach(function (id) {
        var it = BYID[id], r = REQ[id];
        L.push('• ' + it.title + (it.sku ? ' (' + it.sku + ')' : '') + (!noQty(it) && r.q > 1 ? ' ×' + r.q : '') + (r.note ? ' — ' + r.note : ''));
      });
      L.push('');
    });
    var occ = $('#fOcc').value.trim(), when = $('#fWhen').value.trim(), nm = $('#fName').value.trim();
    if (occ) L.push('Per chi / occasione: ' + occ);
    if (when) L.push('Per quando: ' + when);
    L.push('Mi aiuti a scegliere e mi dici tempi e costi?');
    if (nm) L.push('', 'Grazie, ' + nm);
    return L.join('\n');
  }
  function waUrl(text) { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text); }
  function upMsg() {
    if (!dirty) $('#cMsg').value = buildMsg();
    $('#sendWa').href = waUrl($('#cMsg').value);
  }
  ['fName', 'fOcc', 'fWhen'].forEach(function (id) { $('#' + id).addEventListener('input', function () { dirty = false; upMsg(); }); });
  $('#cMsg').addEventListener('input', function () { dirty = true; $('#sendWa').href = waUrl($('#cMsg').value); });
  $('#cClear').onclick = function () { REQ = {}; save(); syncUI(false); toast('Richiesta svuotata'); };
  function openCart() { renderCart(); showDlg(cEl); }
  $('#openCart').onclick = openCart; $('#stickyCart').onclick = openCart;
  $$('[data-open-cart]').forEach(function (b) { b.onclick = openCart; });
  $('#sendWa').addEventListener('click', function () { $('#sendWa').href = waUrl($('#cMsg').value); });

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* niente */ } document.body.removeChild(t); return ok;
  }
  $$('[data-send]').forEach(function (b) {
    b.onclick = function () {
      var ch = b.dataset.send, msg = $('#cMsg').value, url = CONFIG[ch];
      var w = window.open(url, '_blank', 'noopener');
      copy(msg).then(function (ok) {
        var where = { instagram: 'la chat di Instagram', facebook: 'la pagina Facebook (tocca «Messaggio»)', tiktok: 'il profilo TikTok (tocca «Messaggio»)' }[ch];
        toast(ok ? 'Messaggio copiato: incollalo nel DM — ' + where : 'Copia il messaggio dalla casella e incollalo nel DM');
      });
      if (!w) toast('Apri a mano ' + ch + ' e incolla il messaggio');
    };
  });
  $$('[data-wa-direct]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = count() ? buildMsg() : 'Ciao! Ho visto il sito Il Coraggio di Fiorire e vorrei qualche informazione 🌸';
      window.open(waUrl(t), '_blank', 'noopener');
    });
  });

  /* navigazione ancore fluida con compensazione dell'header */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.hasAttribute('data-wa-direct')) return;
      var t = $(id); if (!t) return; e.preventDefault();
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - hdrH, behavior: smooth });
    });
  });

  syncUI(false);
})();
