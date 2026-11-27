/*! cv-site.js — animations des blocs Covalt (Webflow natif). Vanilla JS, sans dépendance.
 * Chaque bloc s'active via data-cv-anim : reveal, marquee, faq, rdv, comparateur, process, depot-projet.
 * Témoignages : chaque section .cv-tq (CV Témoignages) est initialisée seule.
 * Guides pratiques : guide (modèle /guide/…), guide-logos, guides (page liste : filtres, recherche).
 * Blog : article (modèle /blog/…) ; dates en français sur [data-cv-date].
 * Sans JS ou avec prefers-reduced-motion, la page garde l'état final statique livré par Webflow.
 */
(function () {
  'use strict';
  if (window.cvSite) return;
  window.cvSite = true;

  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BLUE = '#007AA3', TINT = '#EEF6F9', TBD = '#B8D8E6', DARK = '#005A78';
  var BONE = 'var(--_covalt-tokens---cv-bone, #F5F7F5)', POLAR = 'var(--_covalt-tokens---cv-polar, #DCE2DF)';
  var INK = 'var(--_covalt-tokens---cv-encre, #081412)', T2 = 'var(--_covalt-tokens---cv-texte-secondaire, #4A5550)';
  var T3 = 'var(--_covalt-tokens---cv-texte-tertiaire, #6E7873)';
  var CURVE = 'cubic-bezier(.2,0,0,1)';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  /* Chaque bloc n'est activé qu'une fois, même si le script est chargé deux fois (aperçu Webflow). */
  function anims(name) {
    return $$('[data-cv-anim="' + name + '"]').filter(function (el) {
      if (el.hasAttribute('data-cv-pret')) return false;
      el.setAttribute('data-cv-pret', ''); return true;
    });
  }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function css(el, o) { if (el) for (var k in o) el.style[k] = o[k]; }
  function txt(el, s) { if (el && el.textContent !== s) el.textContent = s; }
  function fr(n) { return Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' '); }

  // Enveloppe un élément dans une grille 0fr/1fr pour le replier sans connaître sa hauteur.
  function fold(el, dur) {
    var outer = document.createElement('div'), inner = document.createElement('div');
    css(outer, { display: 'grid', gridTemplateRows: '1fr', transition: 'grid-template-rows ' + dur + 'ms ' + CURVE });
    css(inner, { overflow: 'hidden', minHeight: '0' });
    el.parentNode.insertBefore(outer, el);
    inner.appendChild(el); outer.appendChild(inner);
    return outer;
  }

  // Lance cb(true/false) selon la visibilité du bloc.
  function watch(el, threshold, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: threshold }).observe(el);
  }

  // Horloge 100 ms : tick() n'est appelé que si running() est vrai.
  function clock(running, tick) { setInterval(function () { if (running()) tick(); }, 100); }

  /* reveal : opacité 0 → 1 et translateY(24px) → 0, 900 ms, seuil 0,12, délai data-cv-delay. */
  function reveal() {
    var els = anims('reveal');
    if (REDUCE || !els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        css(e.target, { opacity: '1', transform: 'none' });
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) {
      css(el, {
        opacity: '0', transform: 'translateY(24px)',
        transition: 'opacity 900ms ' + CURVE + ', transform 900ms ' + CURVE,
        transitionDelay: (el.getAttribute('data-cv-delay') || 0) + 'ms'
      });
      io.observe(el);
    });
  }

  /* marquee : liste dupliquée, translateX(-50%) en 40 s, pause au survol. */
  function marquee() {
    anims('marquee').forEach(function (root) {
      var track = root.firstElementChild, group = track && track.firstElementChild;
      if (REDUCE || !group || !track.animate) return;
      var copy = group.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      $$('img', copy).forEach(function (i) { i.alt = ''; });
      track.appendChild(copy);
      var a = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 40000, iterations: Infinity });
      root.addEventListener('mouseenter', function () { a.pause(); });
      root.addEventListener('mouseleave', function () { a.play(); });
      watch(root, 0, function (v) { v ? a.play() : a.pause(); });
    });
  }

  /* faq : accordéon, première question ouverte, une seule ouverte à la fois. */
  function faq() {
    var lists = [];
    $$('.cv-faq-item').forEach(function (it) { if (lists.indexOf(it.parentNode) < 0) lists.push(it.parentNode); });
    lists.forEach(function (list, n) {
      var items = $$('.cv-faq-item', list).filter(function (it) { return it.parentNode === list; });
      var open = 0;
      function render() {
        items.forEach(function (it, i) {
          var on = i === open, q = $('.cv-faq-question', it), r = $('.cv-faq-reponse', it), ic = $('.cv-faq-icone', it);
          if (r) r.style.gridTemplateRows = on ? '1fr' : '0fr';
          if (ic) ic.style.transform = on ? 'rotate(45deg)' : 'none';
          if (q) q.setAttribute('aria-expanded', on ? 'true' : 'false');
          if (r) r.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
      }
      items.forEach(function (it, i) {
        var q = $('.cv-faq-question', it), r = $('.cv-faq-reponse', it);
        if (!q || !r) return;
        r.id = r.id || 'cv-faq-' + n + '-' + i;
        q.setAttribute('aria-controls', r.id);
        if (REDUCE) r.style.transition = 'none';
        q.addEventListener('click', function () { open = open === i ? -1 : i; render(); });
      });
      render();
    });
  }

  /* Suivi des sources : recopie les UTM / gclid de la page sur une URL de prise de rendez-vous,
     plus la page d'origine et le cookie HubSpot (comme le code d'intégration officiel HubSpot). */
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  function suivi(href) {
    try {
      var u = new URL(href, location.href), p = new URLSearchParams(location.search);
      UTM.forEach(function (k) { if (p.get(k)) u.searchParams.set(k, p.get(k)); });
      if (u.searchParams.get('embed')) {
        u.searchParams.set('parentHubspotUrl', location.href);
        var utk = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
        if (utk) u.searchParams.set('parentHubspotUtk', decodeURIComponent(utk[1]));
      }
      return u.toString();
    } catch (e) { return href; }
  }

  /* Hauteur envoyée par le calendrier HubSpot (postMessage). */
  function hauteur(frame) {
    window.addEventListener('message', function (e) {
      if (e.source !== frame.contentWindow) return;
      var h = e.data && (e.data.height || e.data.meetingsHeight);
      if (h > 200) frame.style.height = h + 'px';
    });
  }

  /* rdv sans formulaire : calendrier HubSpot intégré directement dans [data-cv-calendrier],
     chargé à l'approche du bloc ; le lien de secours (sans JS) est alors masqué. */
  function calendrier(root, tpl) {
    var box = $('[data-cv-calendrier]', root) || $('.cv-rdv-carte', root) || root, secours = $('a', box);
    var url = suivi(tpl.replace(/([?&])email=\{email\}&?/, '$1').replace(/[?&]$/, ''));
    var frame = document.createElement('iframe');
    frame.title = 'Choisir un créneau avec un expert Loan Connect';
    css(frame, { width: '100%', height: '680px', border: '0', display: 'block' });
    hauteur(frame);
    function charger() {
      if (frame.src || $('iframe', root)) return;
      frame.src = url;
      if (secours) secours.style.display = 'none';
      box.appendChild(frame);
    }
    if (!('IntersectionObserver' in window)) return charger();
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); charger(); }
    }, { rootMargin: '600px 0px' });
    io.observe(root);
  }

  /* rdv : formulaire e-mail, puis iframe HubSpot (data-cv-url, {email} encodé), UTM transmis.
     Sans formulaire dans le bloc : calendrier intégré directement (voir calendrier()). */
  function rdv() {
    anims('rdv').forEach(function (root) {
      var form = $('form', root), input = form && $('input[type="email"]', form), tpl = root.getAttribute('data-cv-url');
      if (!tpl) return;
      $$('a[href*="/meetings/"]', root).forEach(function (a) { a.href = suivi(a.href); });
      if (!form) return calendrier(root, tpl);
      if (!input) return;
      var cal = document.createElement('div'), bar = document.createElement('div'), mail = document.createElement('span');
      var back = document.createElement('button'), frame = document.createElement('iframe');
      css(cal, { display: 'none', flexDirection: 'column', width: '100%', maxWidth: '720px', background: '#fff', borderRadius: '4px', overflow: 'hidden' });
      css(bar, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 20px', borderBottom: '1px solid ' + POLAR, color: INK });
      css(mail, { fontSize: '13px', color: T2 });
      back.type = 'button'; back.textContent = 'Modifier';
      css(back, { background: 'none', border: '0', padding: '0', font: 'inherit', fontSize: '13px', fontWeight: '500', color: DARK, cursor: 'pointer' });
      frame.title = 'Choisir un créneau avec un expert Loan Connect';
      css(frame, { width: '100%', height: '680px', border: '0', display: 'block' });
      bar.appendChild(mail); bar.appendChild(back); cal.appendChild(bar); cal.appendChild(frame); root.appendChild(cal);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.checkValidity && !form.checkValidity()) { form.reportValidity && form.reportValidity(); return; }
        var v = input.value.trim();
        mail.textContent = v;
        frame.src = suivi(tpl.replace('{email}', encodeURIComponent(v)));
        form.style.display = 'none'; cal.style.display = 'flex';
      });
      back.addEventListener('click', function () { cal.style.display = 'none'; form.style.display = ''; input.focus(); });
      hauteur(frame);
    });
  }

  /* comparateur : scénarios « montant|durée|secteur|mois|fiducie|garantie1 ; … », toutes les 3,6 s, fondu 250 ms. */
  function comparateur() {
    anims('comparateur').forEach(function (root) {
      var S = (root.getAttribute('data-cv-scenarios') || '').split(';').map(function (s) {
        var p = s.split('|');
        return p.length < 6 ? null : { m: p[0].trim(), d: p[1].trim(), a: p[2].trim(), n: +p[3], f: +p[4], g: +p[5] };
      }).filter(Boolean);
      if (!S.length) return;
      var fields = $$('.cv-comp-champs .cv-comp-champ-valeur', root), rows = $$('.cv-comp-ligne', root);
      var dotsBox = $('.cv-comp-points', root), dots = dotsBox ? $$('.cv-comp-point', dotsBox) : [];
      var max = Math.max.apply(null, S.map(function (x) { return x.f; }));
      var fade = fields.concat(rows.map(function (r) { return $('.cv-comp-ligne-droite', r); })).filter(Boolean);
      while (dotsBox && dots.length && dots.length < S.length) {
        var d = dots[dots.length - 1].cloneNode(true); d.classList.remove('cv-comp-point--actif'); dotsBox.appendChild(d); dots.push(d);
      }
      if (!REDUCE) fade.forEach(function (el) { el.style.transition = 'opacity 250ms ease'; });
      var i = 0;
      function show() {
        var c = S[i], costs = [c.g, c.f];
        txt(fields[0], c.m); txt(fields[1], c.d); txt(fields[2], c.a);
        rows.forEach(function (r, k) {
          var v = costs[k]; if (v == null) return;
          txt($('.cv-pp-cout', r), fr(v) + ' €/an');
          txt($('.cv-comp-ligne-droite .cv-comp-petit', r), fr(v * c.n / 12) + ' € sur ' + c.d);
          var b = $('.cv-comp-barre-plein', r); if (b) b.style.width = (v / max * 100) + '%';
        });
        dots.forEach(function (dt, k) { dt.classList.toggle('cv-comp-point--actif', k === i); });
      }
      show();
      if (REDUCE || S.length < 2) return;
      var vis = false;
      watch(root, 0.2, function (v) { vis = v; });
      setInterval(function () {
        if (!vis) return;
        fade.forEach(function (el) { el.style.opacity = '0'; });
        setTimeout(function () { i = (i + 1) % S.length; show(); fade.forEach(function (el) { el.style.opacity = '1'; }); }, 250);
      }, 3600);
    });
  }

  /* process : 4 étapes de 5,5 s, barre de 2 px, clic = étape figée, pause au survol de l'illustration. */
  var PDUR = 5500;
  function rise(el, on, y) {
    css(el, { opacity: on ? '1' : '0', transform: on ? 'none' : 'translateY(' + (y || 8) + 'px)' });
  }
  function processScreens(box) {
    var P = $$('[data-cv-panneau]', box).sort(function (a, b) { return a.getAttribute('data-cv-panneau') - b.getAttribute('data-cv-panneau'); });
    var p1 = P[0], p2 = P[1], p3 = P[2], p4 = P[3];
    var f1 = p1 ? $$('.cv-pp-champs .cv-depot-champ-valeur', p1) : [], v1 = f1.map(function (e) { return e.textContent; });
    var docs = p1 ? $$('.cv-pp-doc', p1) : [], btn1 = p1 && $('.cv-pp-bouton', p1);
    var o2 = p2 ? $$('.cv-pp-option', p2) : [];
    var scan = p3 && $('.cv-pp-barre .cv-pp-jauge-plein', p3), lab3 = p3 && $('.cv-pp-scan-tete .cv-pp-resume', p3);
    var st3 = p3 && $('.cv-pp-scan-tete .cv-depot-statut', p3), not3 = p3 && $('.cv-notif', p3);
    var m4 = p4 ? $$('.cv-pp-msg', p4) : [], end4 = p4 && $('.cv-pp-fin', p4);
    var st3txt = st3 && st3.lastElementChild;
    if (!REDUCE) {
      var tr = 'opacity 350ms ease, transform 450ms ' + CURVE;
      o2.concat(m4, [end4]).forEach(function (e) { if (e) e.style.transition = tr + ', background-color 400ms, border-color 400ms'; });
      f1.forEach(function (e) { e.style.transition = 'border-color 300ms'; });
      docs.forEach(function (d) {
        var j = $('.cv-pp-jauge-plein', d), c = $('.cv-pp-coche', d);
        if (j) j.style.transition = 'width 500ms cubic-bezier(.2,.7,.2,1)';
        if (c) c.style.transition = 'background-color 300ms';
      });
      if (btn1) btn1.style.transition = 'background-color 300ms, color 300ms';
      if (scan) scan.style.transition = 'width 120ms linear';
      if (not3) css(not3, { transformOrigin: 'left bottom', transition: 'opacity 400ms, transform 600ms cubic-bezier(.3,1.4,.5,1)' });
    }
    return function (s, t) {
      P.forEach(function (p, k) { p.classList.toggle('cv-pp--cache', k !== s); });
      function on(ms) { return t >= ms; }
      if (s === 0) {
        [300, 700, 1100].forEach(function (at, k) {
          if (!f1[k]) return;
          txt(f1[k], on(at) ? v1[k] : '');
          f1[k].style.borderColor = on(at) ? TBD : '';
        });
        [1500, 2100, 2700].forEach(function (at, k) {
          var d = docs[k]; if (!d) return;
          var j = $('.cv-pp-jauge-plein', d), c = $('.cv-pp-coche', d);
          if (j) j.style.width = (on(at) ? 100 : on(at - 500) ? 45 : 0) + '%';
          if (c) c.style.backgroundColor = on(at) ? BLUE : '#DCE2DF';
        });
        if (btn1) {
          txt(btn1, on(3600) ? 'Projet envoyé ✓' : 'Mettre en ligne');
          css(btn1, { backgroundColor: on(3300) ? BLUE : BONE, color: on(3300) ? '#fff' : T3 });
        }
      } else if (s === 1) {
        [300, 650, 1000].forEach(function (at, k) { if (o2[k]) rise(o2[k], on(at)); });
        if (o2[1]) {
          o2[1].classList.toggle('cv-pp-option--reco', on(2200));
          var r = $('.cv-pp-reco', o2[1]); if (r) r.style.opacity = on(2200) ? '1' : '0';
        }
      } else if (s === 2) {
        var k3 = clamp((t - 200) / 1600);
        if (scan) scan.style.width = (ease(k3) * 100).toFixed(1) + '%';
        txt(lab3, k3 < 1 ? 'Présentation du dossier aux prêteurs…' : 'Dossier présenté aux prêteurs');
        txt(st3txt, k3 < 1 ? 'En cours' : 'Présenté');
        if (not3) css(not3, { opacity: on(2200) ? '1' : '0', transform: on(2200) ? 'none' : 'translateY(16px) scale(.92)' });
      } else if (s === 3) {
        [300, 1500, 2700].forEach(function (at, k) { if (m4[k]) rise(m4[k], on(at)); });
        if (end4) rise(end4, on(3800));
      }
    };
  }
  function process() {
    anims('process').forEach(function (list) {
      var steps = $$('.cv-process-etape', list);
      if (!steps.length) return;
      var section = list.closest('section') || list.parentNode;
      var box = $('[data-cv-anim="process-ecrans"]', section);
      var screens = box ? processScreens(box) : function () {};
      var hover = box && (box.closest('.cv-aplat') || box);
      var s = 0, t = REDUCE ? PDUR : 0, lock = false, paused = false, vis = false;
      steps.forEach(function (st, i) {
        var body = $('.cv-process-corps', st);
        st.setAttribute('role', 'button'); st.setAttribute('tabindex', '0');
        if (body) { body.id = body.id || 'cv-process-' + i; st.setAttribute('aria-controls', body.id); }
        if (REDUCE) { st.style.transition = 'none'; if (body) body.style.transition = 'none'; }
        function pick() { s = i; t = REDUCE ? PDUR : 0; lock = true; render(); }
        st.addEventListener('click', pick);
        st.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      function render() {
        steps.forEach(function (st, i) {
          var on = i === s, body = $('.cv-process-corps', st), bar = $('.cv-process-barre', st);
          st.style.opacity = on ? '1' : '0.45';
          st.setAttribute('aria-expanded', on ? 'true' : 'false');
          if (body) body.style.gridTemplateRows = on ? '1fr' : '0fr';
          if (bar) bar.style.width = on ? (lock || REDUCE ? 100 : (t / PDUR * 100).toFixed(1)) + '%' : '0%';
        });
        screens(s, t);
      }
      if (hover) {
        hover.addEventListener('mouseenter', function () { paused = true; });
        hover.addEventListener('mouseleave', function () { paused = false; });
      }
      watch(section, 0.3, function (v) { vis = v; });
      render();
      if (REDUCE) return;
      clock(function () { return vis && !paused; }, function () {
        if (lock) { if (t < PDUR) t = Math.min(PDUR, t + 100); else return; }
        else if (t + 100 >= PDUR) { t = 0; s = (s + 1) % steps.length; }
        else t += 100;
        render();
      });
    });
  }

  /* depot-projet : boucle de 9,5 s du hero (remplissage, envoi, mise en ligne, Security Package, notification). */
  var LOOP = 9500, FROZEN = 9000;
  var WIN = [[200, 600], [700, 1000], [1100, 1400], [1500, 1800]], POS = [[22, 22], [72, 22], [22, 52], [72, 52]];
  function depot() {
    anims('depot-projet').forEach(function (root) {
      var stage = root.closest('.cv-aplat') || root.parentNode;
      var notif = $('.cv-notif', stage), status = $('.cv-depot-statut', root);
      var form = $('.cv-depot-form', root), body = form && $('.cv-depot-form-corps', form);
      var vals = $$('.cv-depot-champ-valeur', root), full = vals.map(function (e) { return e.textContent; });
      var list = vals.map(function (e) { return e.hasAttribute('data-cv-liste'); });
      var btn = $('.cv-depot-envoi', root), ok = $('.cv-depot-ok', root), resume = $('.cv-depot-resume', root);
      var sp = $('.cv-depot-sp', root), box = sp && $('.cv-depot-sp-boite', sp);
      var opts = box ? $$('.cv-depot-option', box) : [], reco = opts[0] && $('.cv-depot-reco', opts[0]);
      if (REDUCE || !form || !body) return;

      // Éléments créés par le script : curseur, caret, chevrons, barre de progression, replis.
      var caret = vals.map(function (v, k) {
        if (list[k]) {
          v.insertAdjacentHTML('beforeend', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E7873" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-left:auto" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
          return null;
        }
        var c = document.createElement('span');
        css(c, { width: '1px', height: '16px', background: BLUE, marginLeft: '1px', opacity: '0' });
        return c;
      });
      var texts = vals.map(function (v) { var s = document.createElement('span'); v.insertBefore(s, v.firstChild); return s; });
      vals.forEach(function (v, k) {
        Array.prototype.slice.call(v.childNodes).forEach(function (n) { if (n.nodeType === 3) v.removeChild(n); });
        if (caret[k]) v.insertBefore(caret[k], texts[k].nextSibling);
        v.style.transition = 'border-color 200ms, box-shadow 200ms';
      });
      var prog = document.createElement('div'), progIn = document.createElement('div');
      css(prog, { height: '3px', marginTop: '-10px', background: BONE });
      css(progIn, { height: '100%', width: '0', background: BLUE, transition: 'width 120ms linear' });
      prog.appendChild(progIn); if (btn) btn.parentNode.insertBefore(prog, btn.nextSibling);
      var cur = document.createElement('span');
      cur.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3l7 18 2.6-7.4L21 11z" fill="#081412" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
      css(cur, { position: 'absolute', display: 'block', width: '20px', height: '20px', pointerEvents: 'none', transformOrigin: '3px 3px',
        transition: 'left 550ms cubic-bezier(.4,0,.2,1), top 550ms cubic-bezier(.4,0,.2,1), opacity 300ms, transform 150ms', filter: 'drop-shadow(0 2px 3px rgba(8,20,18,.25))' });
      body.appendChild(cur);
      var sumFold = resume && fold(resume, 500), spFold = sp && fold(sp, 450);
      var head = box && $('.cv-depot-sp-tete', box), optWrap;
      if (box && opts.length) {
        optWrap = document.createElement('div'); box.insertBefore(optWrap, opts[0]);
        opts.forEach(function (o) { optWrap.appendChild(o); });
        optWrap = fold(optWrap, 450);
      }
      form.style.transition = 'grid-template-rows 500ms ' + CURVE;
      if (status) status.style.transition = 'background-color 400ms, border-color 400ms, color 400ms';
      if (btn) btn.style.transition = 'background-color 300ms, color 300ms, transform 150ms';
      if (ok) ok.style.transition = 'transform 450ms cubic-bezier(.3,1.6,.5,1)';
      if (sp) sp.style.transition = 'opacity 300ms, transform 400ms ' + CURVE;
      opts.forEach(function (o) { o.style.transition = 'opacity 300ms, background-color 300ms'; });
      if (reco) reco.style.transition = 'opacity 300ms';
      if (notif) css(notif, { transformOrigin: 'left bottom', transition: 'opacity 400ms, transform 600ms cubic-bezier(.3,1.4,.5,1)' });

      function render(t) {
        var act = -1;
        WIN.forEach(function (w, k) { if (act < 0 && t >= w[0] - 250 && t < w[1] + 100) act = k; });
        var sent = t >= 2150, qual = t >= 2700, spOn = t >= 3000;
        if (status) {
          var st = qual ? ['En ligne', TINT, TBD, DARK] : sent ? ['Analyse en cours', '#fff', TBD, DARK] : ['Brouillon', BONE, POLAR, T2];
          txt(status, st[0]); css(status, { backgroundColor: st[1], borderColor: st[2], color: st[3] });
        }
        form.style.gridTemplateRows = qual ? '0fr' : '1fr';
        if (sumFold) sumFold.style.gridTemplateRows = qual ? '1fr' : '0fr';
        if (ok) ok.style.transform = 'scale(' + (t >= 2850 ? 1 : 0.4) + ')';
        vals.forEach(function (v, k) {
          var a = WIN[k] ? WIN[k][0] : 0, b = WIN[k] ? WIN[k][1] : 0, s = full[k];
          var shown = list[k] ? (t >= a + 350 ? s : '') : t < a ? '' : t >= b ? s : s.slice(0, Math.ceil(s.length * (t - a) / (b - a)));
          txt(texts[k], shown);
          css(v, { borderColor: k === act ? BLUE : '', boxShadow: k === act ? '0 0 0 3px rgba(0,122,163,.12)' : 'none' });
          if (caret[k]) caret[k].style.opacity = k === act && t % 1000 < 600 ? '1' : '0';
        });
        if (btn) {
          txt(btn, sent ? 'Analyse du dossier…' : 'Soumettre le projet');
          css(btn, { backgroundColor: t >= 1950 ? BLUE : BONE, color: t >= 1950 ? '#fff' : T3, transform: 'scale(' + (t >= 2050 && t < 2200 ? 0.97 : 1) + ')' });
        }
        prog.style.opacity = sent ? '1' : '0';
        progIn.style.width = (ease(clamp((t - 2150) / 500)) * 100).toFixed(1) + '%';
        var p = t < 1950 ? (POS[act] || (t < 200 ? POS[0] : POS[3])) : [50, 80];
        css(cur, { left: p[0] + '%', top: p[1] + '%', opacity: t >= 2400 ? '0' : '1', transform: 'scale(' + (t >= 2050 && t < 2200 ? 0.82 : 1) + ')' });
        if (spFold) spFold.style.gridTemplateRows = spOn ? '1fr' : '0fr';
        if (sp) css(sp, { opacity: spOn ? '1' : '0', transform: spOn ? 'none' : 'translateY(6px)' });
        if (optWrap) optWrap.style.gridTemplateRows = t >= 3200 ? '1fr' : '0fr';
        [3350, 3500].forEach(function (at, k) { if (opts[k]) opts[k].style.opacity = t >= at ? '1' : '0'; });
        if (opts[0]) opts[0].classList.toggle('cv-depot-option--reco', t >= 3800);
        if (reco) reco.style.opacity = t >= 3800 ? '1' : '0';
        if (notif) css(notif, { opacity: t >= 4400 ? '1' : '0', transform: t >= 4400 ? 'none' : 'translateY(16px) scale(.92)' });
      }

      var t = 0, paused = false, vis = false, started = false;
      stage.addEventListener('mouseenter', function () { paused = true; });
      stage.addEventListener('mouseleave', function () { paused = false; });
      watch(root, 0.2, function (v) { vis = v; if (v && !started) { started = true; render(0); } });
      render(FROZEN);
      clock(function () { return started && vis && !paused; }, function () { t = (t + 100) % LOOP; render(t); });
    });
  }


  /* témoignages (CV Témoignages, classes cv-tq-*) : chaque section .cv-tq est autonome.
     1 slide : carte fixe, navigation masquée. 2 slides ou plus : slides superposées (grid-area 1/1, hauteur du plus long
     verbatim), 7 s par slide en boucle, barres de progression cliquables + compteur, pause au survol (desktop) ou à
     l'appui long (mobile), balayage horizontal ≥ 40 px, défilement seulement quand la section est visible (seuil 30 %).
     prefers-reduced-motion : ni défilement automatique ni glissé, fondu au clic. Fond : variante Bone du composant. */
  var TQ = 7000, tqStyle = false;
  function tqCss() {
    if (tqStyle) return; tqStyle = true;
    var s = document.createElement('style');
    s.textContent = '.cv-tq-nav{align-items:center;justify-content:space-between;gap:16px;margin-top:12px}'
      + '.cv-tq-barres{display:flex;min-width:0}'
      + '.cv-tq-barre{all:unset;box-sizing:border-box;cursor:pointer;flex:0 1 60px;min-width:44px;height:44px;padding:0 6px;display:flex;align-items:center}'
      + '.cv-tq-barre:focus-visible{outline:2px solid ' + BLUE + ';outline-offset:-2px}'
      + '.cv-tq-barre-fond{position:relative;display:block;width:100%;height:2px;overflow:hidden;background:' + POLAR + '}'
      + '.cv-tq-barre-plein{position:absolute;top:0;bottom:0;left:0;width:0;background:' + BLUE + '}'
      + '.cv-tq-compteur{flex:none;font-family:var(--_covalt-tokens---cv-police-mono,"JetBrains Mono"),ui-monospace,monospace;font-size:12px;letter-spacing:.04em;color:' + T3 + '}';
    document.head.appendChild(s);
  }
  function temoignages() {
    $$('.cv-tq').forEach(function (sec) {
      if (sec.hasAttribute('data-cv-pret')) return;
      sec.setAttribute('data-cv-pret', '');
      tqCss();
      var slides = $$('.cv-tq-slide', sec), nav = $('.cv-tq-nav', sec), carte = $('.cv-tq-carte', sec) || sec;
      var tags = slides.map(function (s) {
        var e = $('.cv-tq-etiquette', s), l = e ? e.textContent.trim() : '';
        if (e && !l) e.style.display = 'none';
        return l;
      });
      if (slides.length < 2) { if (nav) nav.style.display = 'none'; return; }
      var n = slides.length, i = 0, t = 0, vis = false, hover = false, hold = false, holdT = 0;
      var box = slides[0].parentNode;
      css(box, { display: 'grid', gridTemplateColumns: 'minmax(0,1fr)' });
      slides.forEach(function (s) {
        css(s, { gridArea: '1 / 1', minWidth: '0', transition: REDUCE ? 'opacity 500ms ease' : 'opacity 500ms ease, transform 600ms ' + CURVE });
      });
      if (!nav) { nav = document.createElement('div'); nav.className = 'cv-tq-nav'; carte.parentNode.insertBefore(nav, carte.nextSibling); }
      nav.innerHTML = '';
      var barres = document.createElement('div'), cpt = document.createElement('span');
      barres.className = 'cv-tq-barres'; cpt.className = 'cv-tq-compteur';
      var pleins = slides.map(function (s, k) {
        var b = document.createElement('button'), f = document.createElement('span'), p = document.createElement('span');
        b.type = 'button'; b.className = 'cv-tq-barre';
        b.setAttribute('aria-label', (tags[k] ? tags[k].charAt(0) + tags[k].slice(1).toLowerCase() : 'Témoignage') + ' (' + (k + 1) + ' sur ' + n + ')');
        f.className = 'cv-tq-barre-fond'; p.className = 'cv-tq-barre-plein';
        f.appendChild(p); b.appendChild(f); barres.appendChild(b);
        b.addEventListener('click', function () { aller(k); });
        return p;
      });
      nav.appendChild(barres); nav.appendChild(cpt);
      css(nav, { display: 'flex' });
      function deux(k) { return (k < 9 ? '0' : '') + (k + 1); }
      function barresRendu() {
        pleins.forEach(function (p, k) { p.style.width = (k < i ? 100 : k > i ? 0 : Math.min(100, t / TQ * 100)) + '%'; });
      }
      function etat(s, on) {
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.style.pointerEvents = on ? '' : 'none';
        s.style.opacity = on ? '1' : '0';
      }
      function aller(k, dir) {
        k = (k + n) % n;
        if (dir === undefined) dir = k >= i ? 1 : -1;
        var avant = slides[i], apres = slides[k];
        t = 0;
        if (k !== i) {
          if (!REDUCE) {
            apres.style.transition = 'none';
            apres.style.transform = 'translateX(' + (dir * 24) + 'px)';
            void apres.offsetWidth;
            apres.style.transition = 'opacity 500ms ease, transform 600ms ' + CURVE;
            avant.style.transform = 'translateX(' + (-dir * 24) + 'px)';
          }
          etat(avant, false);
          i = k;
        }
        etat(apres, true);
        if (!REDUCE) apres.style.transform = 'none';
        txt(cpt, deux(i) + ' / ' + deux(n - 1));
        barresRendu();
      }
      slides.forEach(function (s, k) { etat(s, k === 0); });
      txt(cpt, deux(0) + ' / ' + deux(n - 1));
      barresRendu();
      // Pause : survol (desktop), appui long (tactile).
      carte.addEventListener('mouseenter', function () { hover = true; });
      carte.addEventListener('mouseleave', function () { hover = false; });
      // Balayage horizontal, seulement si le geste est plus horizontal que vertical.
      var x0 = 0, y0 = 0, suivi = false;
      carte.addEventListener('touchstart', function (e) {
        var p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; suivi = true;
        clearTimeout(holdT); holdT = setTimeout(function () { hold = true; }, 350);
      }, { passive: true });
      carte.addEventListener('touchmove', function (e) {
        var p = e.touches[0];
        if (Math.abs(p.clientX - x0) > 10 || Math.abs(p.clientY - y0) > 10) clearTimeout(holdT);
      }, { passive: true });
      carte.addEventListener('touchend', function (e) {
        clearTimeout(holdT); hold = false;
        if (!suivi) return; suivi = false;
        var p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) aller(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }, { passive: true });
      carte.addEventListener('touchcancel', function () { clearTimeout(holdT); hold = false; suivi = false; }, { passive: true });
      if (REDUCE) return;
      watch(sec, 0.3, function (v) { vis = v; });
      var last = 0;
      (function boucle(now) {
        var dt = last ? Math.min(100, now - last) : 0; last = now;
        if (vis && !hover && !hold && !document.hidden) {
          t += dt;
          if (t >= TQ) aller(i + 1, 1); else barresRendu();
        }
        requestAnimationFrame(boucle);
      })(0);
    });
  }


  /* guide (modèle /guide/{slug}, section data-cv-anim="guide") :
     - --cv-hd = hauteur réelle du header fixe (.navbar) ; --cv-hd-pad = cette hauteur moins la marge haute du body
       (73 px / 64 px sur le site), pour caler la page et la barre de filtres dessous ;
     - formulaire [data-cv-hs-form] : envoi au formulaire HubSpot du guide (API Forms v3) avec le cookie hubspotutk,
       l'URL (UTM comprises) et le titre de la page, comme l'iframe HubSpot ; question « fiduciaire » si
       data-cv-fidu="Oui" (champ CMS Question fiduciaire), visible seulement pour les structures de FIDU_TYPES ; succès sur place (role=status) ;
     - lien [data-cv-extrait] : affiché seulement si l'URL de l'extrait est renseignée ; ouvre l'aperçu en popup ;
     - logos [data-cv-anim="guide-logos"] : rangée fixe, défilement 32 s sous 767 px (pause survol / toucher) ;
     - « Autres guides » [data-cv-guide-autres] : 3 cartes, jamais le guide courant ;
     - fil d'Ariane : JSON-LD BreadcrumbList. */
  var HS_API = 'https://api-eu1.hsforms.com/submissions/v3/integration/submit/139790115/';
  var FIDU = [['fiduciaire_actif', 'Oui, je suis déjà fiduciaire'], ['non_mais_interesse', 'Je réfléchis à le devenir à terme'],
    ['non_pas_interesse', 'Non, et je ne souhaite pas le devenir pour l\'instant'], ['non_connait_pas_fiducie', 'Je me renseigne sur la fiducie']];
  // Structures pour lesquelles la question est posée : même logique que les formulaires HubSpot
  // (« If typologie contains any of … then show Statut fiduciaire »). Valeurs de la liste « typologie ».
  var FIDU_TYPES = ['Avocat', 'Groupe bancaire', 'Banque indépendante', 'Fonds de dette', 'Fonds Private Equity', 'Family office'];
  function cookie(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }
  function headerOffset() {
    var nav = $('.navbar'), root = document.documentElement;
    if (!nav) return;
    function maj() {
      var h = Math.round(nav.getBoundingClientRect().height), m = parseFloat(getComputedStyle(document.body).marginTop) || 0;
      root.style.setProperty('--cv-hd', h + 'px');
      root.style.setProperty('--cv-hd-pad', Math.max(0, h - m) + 'px');
    }
    maj(); addEventListener('resize', maj); addEventListener('load', maj);
    if (window.ResizeObserver) new ResizeObserver(maj).observe(nav);
  }
  function guideForm(root) {
    var id = (root.getAttribute('data-cv-hs-form') || '').trim(), form = $('form', root), ok = $('.cv-gd-succes', root);
    if (!form || !ok || !id) return;
    var envoi = $('.cv-gd-envoyer', form), err = $('.cv-gd-erreur-envoi', form);
    if ((root.getAttribute('data-cv-fidu') || '').trim().toLowerCase() === 'oui') {
      var fs = document.createElement('fieldset');
      fs.className = 'cv-gd-champ cv-gd-radios';  // facultative, comme dans HubSpot
      fs.innerHTML = '<legend>Êtes-vous fiduciaire ?</legend>' + FIDU.map(function (o) {
        return '<label><input type="radio" name="statut_fiduciaire" value="' + o[0] + '"><span>' + o[1] + '</span></label>';
      }).join('') + '<span class="cv-gd-erreur" aria-live="polite"></span>';
      envoi.parentNode.insertBefore(fs, envoi);
      // Question affichée seulement pour les structures de FIDU_TYPES (facultative, comme dans HubSpot).
      var typo = $('select[name="typologie"]', form);
      var majFidu = function () {
        var on = !typo || FIDU_TYPES.indexOf(typo.value) >= 0;
        fs.style.display = on ? '' : 'none';
        if (!on) { $$('input', fs).forEach(function (i) { i.checked = false; }); erreur(fs, ''); }
      };
      if (typo) typo.addEventListener('change', majFidu);
      form.addEventListener('reset', function () { setTimeout(majFidu, 0); });
      majFidu();
    }
    function erreur(ch, msg) {
      var e = $('.cv-gd-erreur', ch), i = $('input,select', ch);
      if (e) e.textContent = msg || '';
      ch.classList.toggle('cv-gd-invalide', !!msg);
      if (i && i.type !== 'radio') i.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function valide(ch) {
      var t = ch.getAttribute('data-requis'), i = $('input,select', ch), v = i && i.value.trim();
      if (t === 'radio') return $('input:checked', ch) ? '' : 'Choisissez une réponse.';
      if (!v) return 'Champ obligatoire.';
      if (t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Adresse e-mail invalide.';
      return '';
    }
    $$('[data-requis]', form).forEach(function (ch) {
      ch.addEventListener('change', function () { if (ch.classList.contains('cv-gd-invalide')) erreur(ch, valide(ch)); });
      ch.addEventListener('input', function () { if (ch.classList.contains('cv-gd-invalide')) erreur(ch, valide(ch)); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var premier = null;
      $$('[data-requis]', form).forEach(function (ch) {
        if (ch.style.display === 'none') return;
        var m = valide(ch); erreur(ch, m); if (m && !premier) premier = ch;
      });
      if (premier) { var f = $('input,select', premier); if (f) f.focus(); return; }
      var champs = [];
      $$('input,select', form).forEach(function (i) {
        if (!i.name || (i.type === 'radio' && !i.checked) || i.value.trim() === '') return;
        champs.push({ objectTypeId: '0-1', name: i.name, value: i.value.trim() });
      });
      var ctx = { pageUri: location.href, pageName: document.title }, hutk = cookie('hubspotutk');
      if (hutk) ctx.hutk = hutk;
      envoi.disabled = true; envoi.setAttribute('aria-busy', 'true'); txt(err, '');
      fetch(HS_API + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: champs, context: ctx }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); })
        .then(function () {
          form.hidden = true; ok.hidden = false;
          if (!REDUCE) ok.style.animation = 'cvGdBump 500ms cubic-bezier(.3,0,0,1) both';
          var t = $('.cv-gd-succes-titre', ok); if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
        })
        .catch(function () { txt(err, 'L\'envoi n\'a pas abouti. Vérifiez votre connexion et réessayez.'); })
        .then(function () { envoi.disabled = false; envoi.removeAttribute('aria-busy'); });
    });
    var autre = $('.cv-gd-autre', ok);
    if (autre) autre.addEventListener('click', function () {
      form.reset(); ok.hidden = true; ok.style.animation = ''; form.hidden = false;
      var f = $('input', form); if (f) f.focus();
    });
  }
  function guideLogos(root) {
    var track = root.firstElementChild, group = track && track.firstElementChild;
    if (REDUCE || !group || !track.animate || !window.matchMedia) return;
    var mq = matchMedia('(max-width: 767px)'), copy = null, a = null;
    function maj() {
      if (mq.matches && !a) {
        copy = group.cloneNode(true); copy.setAttribute('aria-hidden', 'true');
        $$('img', copy).forEach(function (i) { i.alt = ''; });
        track.appendChild(copy); root.classList.add('cv-gd-defile');
        a = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 32000, iterations: Infinity });
      } else if (!mq.matches && a) {
        a.cancel(); a = null; track.removeChild(copy); copy = null; root.classList.remove('cv-gd-defile');
      }
    }
    function pause() { if (a) a.pause(); }
    function lecture() { if (a) a.play(); }
    root.addEventListener('mouseenter', pause); root.addEventListener('mouseleave', lecture);
    root.addEventListener('touchstart', pause, { passive: true }); root.addEventListener('touchend', lecture, { passive: true });
    root.addEventListener('touchcancel', lecture, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', maj); else mq.addListener(maj);
    maj();
  }
  function guideAutres(list) {
    var cur = location.pathname.replace(/\/$/, '').split('/').pop().toLowerCase(), n = 0;
    $$('a[data-cv-slug], a[href*="/guide/"]', list).forEach(function (a) {
      var ds = (a.getAttribute('data-cv-slug') || '').trim(), h = a.getAttribute('href') || '';
      // Lien « guide courant » non réglé dans Webflow : on le reconstruit à partir du slug CMS.
      if (ds && !/\/guide\/[^#?]/.test(h)) a.setAttribute('href', '/guide/' + ds);
      var it = a.closest('.w-dyn-item') || a, slug = (ds || a.getAttribute('href').replace(/\/$/, '').split('/').pop()).toLowerCase();
      var garde = slug !== cur && n < 3;
      if (garde) n++;
      it.style.display = garde ? 'block' : 'none';
    });
  }
  function guideAriane(sec) {
    var h = $('h1', sec);
    if (!h || $('script[data-cv-ariane]')) return;
    var o = location.origin, s = document.createElement('script');
    s.type = 'application/ld+json'; s.setAttribute('data-cv-ariane', '');
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: o + '/' },
      { '@type': 'ListItem', position: 2, name: 'Guides pratiques', item: o + '/guides-pratiques' },
      { '@type': 'ListItem', position: 3, name: h.textContent.trim(), item: o + location.pathname }] });
    document.head.appendChild(s);
  }

  /* Aperçu de l'extrait (modèle de guide) : un clic sur [data-cv-extrait] ouvre une popup qui affiche l'extrait sur la page.
     PDF (même mal nommé, ex. .png) : pdf.js (cdnjs, chargé au premier clic), lecture par morceaux (le PDF n'est pas téléchargé en entier), pages dessinées
     à l'approche, chaque page entière dans la hauteur de la zone de lecture. Image (.png, .jpg…) : affichée telle quelle. Fermeture : croix, voile, Échap ;
     « Recevoir le guide complet » ferme la popup et descend au formulaire. Sans JS : l'extrait s'ouvre dans un nouvel onglet. */
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/', mdStyle = false;
  function chargerPdfjs() {
    if (chargerPdfjs.p) return chargerPdfjs.p;
    chargerPdfjs.p = new Promise(function (ok, ko) {
      function pret() {
        var lib = window.pdfjsLib;
        if (!lib) return ko(new Error('pdfjs'));
        if (!lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
        ok(lib);
      }
      if (window.pdfjsLib) { pret(); return; }
      var s = document.createElement('script');
      s.src = PDFJS + 'pdf.min.js'; s.async = true; s.onload = pret; s.onerror = function () { ko(new Error('pdfjs')); };
      document.head.appendChild(s);
    });
    chargerPdfjs.p.catch(function () { chargerPdfjs.p = null; });
    return chargerPdfjs.p;
  }
  function mdCss() {
    if (mdStyle) return; mdStyle = true;
    var s = document.createElement('style');
    s.textContent = '.cv-gd-modal{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:24px}'
      + '.cv-gd-modal.cv-gd-modal-on{display:flex}'
      + '.cv-gd-modal-voile{position:absolute;inset:0;background:rgba(8,20,18,.62)}'
      + '.cv-gd-modal-panneau{position:relative;display:flex;flex-direction:column;width:min(920px,100%);height:min(calc(100dvh - 48px),1100px);background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 32px 64px -24px rgba(8,20,18,.45);font-family:Inter,sans-serif;color:#081412}'
      + '.cv-gd-modal-on .cv-gd-modal-panneau{animation:cvGdBump 500ms cubic-bezier(.3,0,0,1) both}'
      + '.cv-gd-modal-tete{display:flex;align-items:center;gap:16px;padding:12px 12px 12px 20px;border-bottom:1px solid #DCE2DF}'
      + '.cv-gd-modal-titre{flex:1;min-width:0;margin:0;font-family:"Gerstner Programm",Tahoma,sans-serif;font-size:18px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      + '.cv-gd-modal-compteur{flex:none;font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.04em;color:rgba(8,20,18,.40)}'
      + '.cv-gd-modal-fermer{flex:none;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:4px;background:transparent;color:#081412;cursor:pointer}'
      + '.cv-gd-modal-fermer:hover{background:#F5F7F5}'
      + '.cv-gd-modal-fermer:focus-visible,.cv-gd-modal-pied a:focus-visible{outline:2px solid #24826B;outline-offset:2px}'
      + '.cv-gd-modal-corps{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#F5F7F5;padding:24px;outline:none;scroll-snap-type:y proximity;scroll-padding:24px}'
      + '.cv-gd-modal-liste{display:flex;flex-direction:column;align-items:center;gap:16px}'
      + '.cv-gd-modal-page{position:relative;flex:none;width:min(100%,calc(var(--cv-md-h,70vh) * var(--r,.7071)));scroll-snap-align:start;background:#fff;box-shadow:0 0 0 1px rgba(8,20,18,.06),0 8px 24px -12px rgba(8,20,18,.25)}'
      + '.cv-gd-modal-page canvas,.cv-gd-modal-page img{display:block;width:100%;height:auto}'
      + '.cv-gd-modal-etat{margin:48px auto;max-width:44ch;text-align:center;font-size:14px;line-height:1.55;color:rgba(8,20,18,.62)}'
      + '.cv-gd-modal-etat a{color:#24826B;font-weight:500;text-decoration:underline;text-underline-offset:3px}'
      + '.cv-gd-modal-pied{display:flex;justify-content:flex-end;align-items:center;gap:16px;padding:12px 20px;border-top:1px solid #DCE2DF;background:#fff}'
      + '.cv-gd-modal-pied a{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:48px;padding:0 22px;border-radius:4px;background:#24826B;color:#fff;font-size:15px;font-weight:500;text-decoration:none;transition:background-color 200ms}'
      + '.cv-gd-modal-pied a:hover{background:#1E6E5A;color:#fff}'
      + '@media (max-width:767px){.cv-gd-modal{padding:0}.cv-gd-modal-panneau{width:100%;height:100%;border-radius:0}.cv-gd-modal-corps{padding:12px;scroll-padding:12px}.cv-gd-modal-pied a{flex:1}}'
      + '@media (prefers-reduced-motion:reduce){.cv-gd-modal-on .cv-gd-modal-panneau{animation:none}}';
    document.head.appendChild(s);
  }
  var md = null;
  function modale() {
    if (md) return md;
    mdCss();
    var el = document.createElement('div');
    el.className = 'cv-gd-modal';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'cv-gd-modal-titre');
    el.innerHTML = '<div class="cv-gd-modal-voile"></div><div class="cv-gd-modal-panneau">'
      + '<div class="cv-gd-modal-tete"><p class="cv-gd-modal-titre" id="cv-gd-modal-titre"></p><span class="cv-gd-modal-compteur" aria-hidden="true"></span>'
      + '<button type="button" class="cv-gd-modal-fermer" aria-label="Fermer l\'aperçu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>'
      + '<div class="cv-gd-modal-corps" tabindex="0" aria-label="Extrait du guide"><div class="cv-gd-modal-liste"></div></div>'
      + '<div class="cv-gd-modal-pied"><a href="#recevoir-le-guide">Recevoir le guide complet<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg></a></div></div>';
    document.body.appendChild(el);
    md = { el: el, corps: $('.cv-gd-modal-corps', el), liste: $('.cv-gd-modal-liste', el), titre: $('.cv-gd-modal-titre', el),
      cpt: $('.cv-gd-modal-compteur', el), url: '', retour: null, io: null, overflow: '' };
    function fermer() {
      if (!el.classList.contains('cv-gd-modal-on')) return;
      el.classList.remove('cv-gd-modal-on');
      document.documentElement.style.overflow = md.overflow;
      if (md.retour) md.retour.focus();
    }
    md.fermer = fermer;
    $('.cv-gd-modal-voile', el).addEventListener('click', fermer);
    $('.cv-gd-modal-fermer', el).addEventListener('click', fermer);
    $('.cv-gd-modal-pied a', el).addEventListener('click', function () { md.retour = null; fermer(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fermer(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('button, a[href], [tabindex="0"]', el).filter(function (x) { return x.getClientRects().length; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    md.corps.addEventListener('scroll', function () { compteur(); }, { passive: true });
    md.hauteur = function () {
      var c = md.corps, cs = getComputedStyle(c);
      c.style.setProperty('--cv-md-h', Math.max(200, c.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) + 'px');
    };
    addEventListener('resize', function () { if (el.classList.contains('cv-gd-modal-on')) md.hauteur(); });
    return md;
  }
  function compteur() {
    var pages = $$('.cv-gd-modal-page', md.liste);
    if (pages.length < 2) { txt(md.cpt, ''); return; }
    var haut = md.corps.getBoundingClientRect().top + md.corps.clientHeight * 0.4, k = 0;
    pages.forEach(function (p, i) { if (p.getBoundingClientRect().top <= haut) k = i; });
    txt(md.cpt, (k + 1) + ' / ' + pages.length);
  }
  function etat(html) { md.liste.innerHTML = '<p class="cv-gd-modal-etat">' + html + '</p>'; }
  function ouvrirExtrait(url, nom, lien) {
    var m = modale();
    m.retour = lien;
    txt(m.titre, 'Extrait · ' + nom);
    m.overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    m.el.classList.add('cv-gd-modal-on');
    m.hauteur();
    $('.cv-gd-modal-fermer', m.el).focus();
    if (m.url === url) return;
    m.url = url; txt(m.cpt, ''); m.corps.scrollTop = 0;
    if (m.io) { m.io.disconnect(); m.io = null; }
    var secours = 'L\'aperçu n\'a pas pu s\'afficher. <a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">Ouvrir l\'extrait dans un nouvel onglet</a>';
    // Image : si l'extrait n'est pas un PDF lisible (certains PDF sont nommés .png, d'où l'essai PDF d'abord).
    function image() {
      var img = new Image();
      img.alt = 'Extrait du guide ' + nom; img.decoding = 'async';
      img.onload = function () { if (m.url !== url) return; m.liste.innerHTML = ''; var d = document.createElement('div'); d.className = 'cv-gd-modal-page'; if (img.naturalHeight) d.style.setProperty('--r', img.naturalWidth / img.naturalHeight); d.appendChild(img); m.liste.appendChild(d); };
      img.onerror = function () { if (m.url === url) { m.url = ''; etat(secours); } };
      img.src = url;
    }
    etat('Chargement de l\'extrait…');
    if (/\.(jpe?g|webp|gif|avif)(\?|#|$)/i.test(url)) { image(); return; }
    chargerPdfjs().then(function (lib) {
      var tache = lib.getDocument({ url: url, disableAutoFetch: true, disableStream: true, rangeChunkSize: 262144 });
      tache.onProgress = function (pr) {
        if (m.url !== url || !pr.total) return;
        var e = $('.cv-gd-modal-etat', m.liste);
        if (e) txt(e, 'Chargement de l\'extrait… ' + Math.min(99, Math.round(pr.loaded / pr.total * 100)) + ' %');
      };
      return tache.promise;
    }).then(function (doc) {
      if (m.url !== url) return;
      return doc.getPage(1).then(function (p1) {
        var v = p1.getViewport({ scale: 1 }), ratio = v.width + ' / ' + v.height;
        m.liste.innerHTML = '';
        var pages = [];
        for (var k = 1; k <= doc.numPages; k++) {
          var d = document.createElement('div');
          d.className = 'cv-gd-modal-page'; d.style.aspectRatio = ratio; d.style.setProperty('--r', v.width / v.height);
          d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Page ' + k + ' sur ' + doc.numPages);
          d.setAttribute('data-page', k);
          m.liste.appendChild(d); pages.push(d);
        }
        compteur();
        function dessiner(d) {
          if (d.hasAttribute('data-ok')) return;
          d.setAttribute('data-ok', '');
          doc.getPage(+d.getAttribute('data-page')).then(function (p) {
            var base = p.getViewport({ scale: 1 }), dpr = Math.min(window.devicePixelRatio || 1, 2);
            var vp = p.getViewport({ scale: Math.max(d.clientWidth, 320) * dpr / base.width });
            var c = document.createElement('canvas');
            c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
            d.style.aspectRatio = base.width + ' / ' + base.height; d.style.setProperty('--r', base.width / base.height);
            return p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { d.appendChild(c); });
          }).catch(function () { d.removeAttribute('data-ok'); });
        }
        if ('IntersectionObserver' in window) {
          m.io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) { dessiner(e.target); m.io.unobserve(e.target); } });
          }, { root: m.corps, rootMargin: '600px 0px' });
          pages.forEach(function (d) { m.io.observe(d); });
        } else pages.forEach(dessiner);
      });
    }).catch(function () { if (m.url === url) image(); });
  }

  /* Liens d'ancre (#recevoir-le-guide…) sur les pages guides : le défilement de Webflow ignore la hauteur du header fixe
     (.navbar) ; on le reprend en capture pour arrêter le haut de la cible 16 px sous le header, puis on place le curseur
     dans le premier champ (ordinateur seulement). Un lien cliqué dans la popup d'extrait la ferme d'abord. */
  var ancresPretes = false;
  function ancres() {
    if (ancresPretes) return; ancresPretes = true;
    window.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      // Webflow réécrit href="#x" en adresse complète (page + #x) : on compare la page et on lit le hash.
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.host !== location.host || a.pathname !== location.pathname || !a.hash) return;
      var id = decodeURIComponent(a.hash.slice(1)), cible = id && document.getElementById(id);
      if (!cible) return;
      e.preventDefault(); e.stopPropagation();
      if (md && md.el.classList.contains('cv-gd-modal-on')) { md.retour = null; md.fermer(); }
      var nav = $('.navbar'), haut = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
      var y = cible.getBoundingClientRect().top + window.pageYOffset - haut - 16;
      window.scrollTo({ top: Math.max(0, y), behavior: REDUCE ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      var champ = $('input:not([type=hidden]), select, textarea', cible);
      // Curseur dans le 1er champ sur ordinateur seulement (sur mobile, le clavier s'ouvrirait sans demande).
      if (champ && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) setTimeout(function () { try { champ.focus({ preventScroll: true }); } catch (err) { champ.focus(); } }, REDUCE ? 0 : 700);
    }, true);
  }
  /* Liens « guide courant » des listes CMS : Webflow les publie en href="#". Tout lien qui porte data-cv-slug (champ Slug)
     et ne pointe pas déjà vers /guide/… reçoit /guide/{slug}. */
  function liensGuides() {
    $$('a[data-cv-slug]').forEach(function (a) {
      var ds = (a.getAttribute('data-cv-slug') || '').trim();
      if (ds && !/\/guide\/[^#?]/.test(a.getAttribute('href') || '')) a.setAttribute('href', '/guide/' + ds);
    });
  }
  function guide() {
    var secs = anims('guide');
    if (secs.length || $('[data-cv-anim="guides"]')) { headerOffset(); ancres(); liensGuides(); }
    secs.forEach(function (sec) {
      guideAriane(sec);
      $$('[data-cv-hs-form]').forEach(guideForm);
      $$('[data-cv-extrait]').forEach(function (a) {
        var u = (a.getAttribute('data-cv-extrait') || '').trim();
        if (!/^https?:\/\//.test(u)) return;
        a.href = u; a.classList.add('cv-gd-extrait-on'); a.setAttribute('aria-haspopup', 'dialog');
        a.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
          e.preventDefault();
          var h = $('h1', sec);
          ouvrirExtrait(u, h ? h.textContent.trim() : 'Guide pratique', a);
        });
      });
    });
    anims('guide-logos').forEach(guideLogos);
    $$('[data-cv-guide-autres]').forEach(guideAutres);
  }


  /* guides (page liste, section data-cv-anim="guides") : filtre par thème ([data-cv-guides-theme], correspondance exacte,
     vide = Tous), recherche ([data-cv-guides-search]) sur le nom et la description, sans casse ni accents, à chaque frappe ;
     compteurs calculés sur tous les guides, à la une compris ; titre [data-cv-guides-titre] (« Tous nos guides », « 1 guide »,
     « N guides ») ; état vide [data-cv-guides-vide] ; [data-cv-guides-reset] remet Tous et vide la recherche.
     Cartes : [data-cv-guide] avec data-cv-theme et data-cv-slug (CMS). Le guide à la une (liste [data-cv-guides-une]) est
     masqué en CSS (aucun doublon sans JS) et ne réapparaît dans la grille que si un filtre ou une recherche est actif. */
  function norm(s) {
    s = String(s || '');
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return s.toLowerCase().replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function guides() {
    anims('guides').forEach(function (sec) {
      var puces = $$('[data-cv-guides-theme]', sec), champ = $('[data-cv-guides-search]', sec);
      var titre = $('[data-cv-guides-titre]', sec), vide = $('[data-cv-guides-vide]', sec), theme = '', q = '';
      var cartes = $$('[data-cv-guide]', sec).map(function (c) {
        var nom = $('.cv-gl-carte-nom', c), desc = $('.cv-gl-carte-desc', c), ds = (c.getAttribute('data-cv-slug') || '').trim();
        if (ds && !/\/guide\/[^#?]/.test(c.getAttribute('href') || '')) c.setAttribute('href', '/guide/' + ds);
        return {
          el: c.closest('.w-dyn-item') || c, theme: (c.getAttribute('data-cv-theme') || '').trim(),
          txt: norm((nom ? nom.textContent : '') + ' ' + (desc ? desc.textContent : '')), une: !!c.closest('[data-cv-guides-une]')
        };
      });
      function rendu() {
        var actif = !!(theme || q), n = 0;
        cartes.forEach(function (c) {
          var ok = (!theme || c.theme === theme) && (!q || c.txt.indexOf(q) >= 0) && (actif || !c.une);
          c.el.style.display = ok ? 'block' : 'none';
          if (ok) n++;
        });
        puces.forEach(function (p) { p.setAttribute('aria-pressed', p.getAttribute('data-cv-guides-theme') === theme ? 'true' : 'false'); });
        txt(titre, !actif ? 'Tous nos guides' : n === 1 ? '1 guide' : n + ' guides');
        if (vide) vide.classList.toggle('cv-gl-vide-on', n === 0);
      }
      puces.forEach(function (p) {
        var t = p.getAttribute('data-cv-guides-theme') || '';
        txt($('.cv-gl-puce-n', p), String(t ? cartes.filter(function (c) { return c.theme === t; }).length : cartes.length));
        p.addEventListener('click', function () { theme = t; rendu(); });
      });
      if (champ) champ.addEventListener('input', function () { q = norm(champ.value); rendu(); });
      $$('[data-cv-guides-reset]', sec).forEach(function (b) {
        b.addEventListener('click', function () { theme = ''; q = ''; if (champ) champ.value = ''; rendu(); });
      });
      rendu();
    });
  }


  /* Dates en français : tout élément [data-cv-date] (date CMS au format Webflow, ex. « January 8, 2026 » ou ISO)
     devient « 8 janvier 2026 » (« 1er » pour le premier du mois). Sans JS : format de Webflow. */
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MOIS_EN = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  function dateFr(s) {
    s = String(s || '').trim();
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/), j, mo, a;
    if (m) { a = +m[1]; mo = +m[2] - 1; j = +m[3]; }
    else {
      m = s.match(/([A-Za-zéû]+)\.?\s+(\d{1,2}),?\s+(\d{4})/) || s.match(/(\d{1,2})\s+([A-Za-zéû]+)\.?\s+(\d{4})/);
      if (!m) return '';
      var nom = isNaN(+m[1]) ? m[1] : m[2]; j = +(isNaN(+m[1]) ? m[2] : m[1]); a = +m[3];
      mo = MOIS_EN.indexOf(nom.slice(0, 3).toLowerCase());
      if (mo < 0) mo = MOIS.map(function (x) { return norm(x).slice(0, 3); }).indexOf(norm(nom).slice(0, 3));
      if (mo < 0) return '';
    }
    return (j === 1 ? '1er' : j) + ' ' + MOIS[mo] + ' ' + a;
  }
  function dates() {
    $$('[data-cv-date]').forEach(function (el) {
      if (el.getAttribute('data-cv-date-ok')) return;
      var d = dateFr(el.getAttribute('datetime') || el.textContent);
      if (d) { txt(el, d); el.setAttribute('data-cv-date-ok', ''); }
    });
  }

  /* article (modèle /blog/{slug}, section data-cv-anim="article") :
     - texte [data-cv-ar-texte] (Rich Text) : paragraphes vides retirés, H1 du texte ramenés en H2 (une seule H1 par page),
       liens externes dans un nouvel onglet (rel noopener), images en chargement différé ;
     - sommaire [data-cv-ar-sommaire] : H2 (numérotés 01, 02…, numéro de tête « 1. » retiré) et leurs H3, ancres s1, s1-1… ;
       masqué si moins de 2 H2 ; intertitre actif = dernier dont le haut est à moins de 140 px du haut de l'écran ;
       progression 0–100 % dans [data-cv-ar-pct] et [data-cv-ar-barre] ; clic : défilement doux, 88 px sous le header ;
       ≤ 991 px : replié, bouton [data-cv-ar-bascule] (« Afficher » / « Masquer », aria-expanded), un clic sur un intertitre le replie ;
     - temps de lecture [data-cv-ar-lecture] : mots / 230, 1 min minimum (masqué sans JS) ;
     - initiales [data-cv-ar-initiales] depuis [data-cv-ar-auteur] ;
     - partage : [data-cv-ar-linkedin] (share-offsite), [data-cv-ar-copier] (URL canonique, « Lien copié » 2 s, role=status) ;
     - articles similaires [data-cv-ar-similaires] : 3 cartes, jamais l'article courant ;
     - JSON-LD BlogPosting + BreadcrumbList. Rien ne casse sans intertitre, sans image ou sans auteur. */
  var arStyle = false;
  function arCss() {
    if (arStyle) return; arStyle = true;
    var s = document.createElement('style'), e = 'cubic-bezier(.2,.8,.2,1)';
    s.textContent = '.cv-ar-toc-liste,.cv-ar-toc-sous{margin:0;padding:0;list-style:none}'
      + '.cv-ar-toc-liste{display:flex;flex-direction:column;gap:2px}'
      + '.cv-ar-toc-liste>li{display:flex;flex-direction:column;gap:2px}'
      + '.cv-ar-toc-h2{display:flex;gap:10px;padding:8px 10px;margin:0 -10px;border-radius:4px;border-left:2px solid transparent;font-size:14px;line-height:1.4;color:' + T2 + ';text-decoration:none;transition:background 350ms ease,color 350ms ease,border-color 350ms ease}'
      + '.cv-ar-toc-h2:hover{color:#081412}'
      + '.cv-ar-toc-num{flex:none;font-family:"JetBrains Mono",monospace;font-size:12px;line-height:1.65;color:' + T3 + '}'
      + '.cv-ar-toc-on>.cv-ar-toc-h2{background:#fff;border-left-color:#24826B;font-weight:600;color:#081412}'
      + '.cv-ar-toc-on>.cv-ar-toc-h2 .cv-ar-toc-num{color:#24826B}'
      + '.cv-ar-toc-pli{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows 450ms ' + e + ',opacity 300ms ease}'
      + '.cv-ar-toc-on>.cv-ar-toc-pli{grid-template-rows:1fr;opacity:1}'
      + '.cv-ar-toc-sous{min-height:0;overflow:hidden;display:flex;flex-direction:column;margin-left:2px;padding-left:14px;border-left:1px solid ' + POLAR + '}'
      + '.cv-ar-toc-sous li{transform:translateY(-6px);transition:transform 400ms ' + e + ' var(--d,0ms)}'
      + '.cv-ar-toc-on .cv-ar-toc-sous li{transform:none}'
      + '.cv-ar-toc-h3{display:block;padding:5px 0 5px 4px;font-size:13px;line-height:1.4;color:' + T3 + ';text-decoration:none;transition:color 250ms,padding 250ms}'
      + '.cv-ar-toc-h3:hover{color:#081412;padding-left:8px}'
      + '.cv-ar-toc-h3.cv-ar-toc-on{color:#24826B;font-weight:500}'
      + '.cv-ar-toc-h2:focus-visible,.cv-ar-toc-h3:focus-visible{outline:2px solid #24826B;outline-offset:2px}'
      + '[data-cv-ar-barre]{transition:width 150ms linear}'
      + '@media (max-width:991px){[data-cv-ar-sommaire].cv-ar-ferme .cv-ar-toc-liste{display:none}}'
      + '@media (prefers-reduced-motion:reduce){.cv-ar-toc-pli,.cv-ar-toc-sous li{transition:none}}';
    document.head.appendChild(s);
  }
  function arNettoie(t) {
    $$('p', t).forEach(function (p) {
      if (!p.querySelector('img,iframe,video,embed,object,br+*') && !p.textContent.replace(/[\s​-‍ ﻿]/g, '')) p.remove();
    });
    $$('h1', t).forEach(function (h) {
      var n = document.createElement('h2');
      for (var i = 0; i < h.attributes.length; i++) n.setAttribute(h.attributes[i].name, h.attributes[i].value);
      while (h.firstChild) n.appendChild(h.firstChild);
      h.parentNode.replaceChild(n, h);
    });
    $$('a[href]', t).forEach(function (a) {
      if (/^https?:/i.test(a.getAttribute('href')) && a.host && a.host !== location.host && !/(^|\.)covalt\.eu$/i.test(a.hostname)) {
        a.target = '_blank'; a.rel = 'noopener';
      } else if (a.target === '_blank' && a.host === location.host) a.removeAttribute('target');
    });
    $$('img', t).forEach(function (i) { if (!i.getAttribute('loading')) i.setAttribute('loading', 'lazy'); });
  }
  function arSommaire(sec, t) {
    var box = $('[data-cv-ar-sommaire]', sec), liste = box && $('[data-cv-ar-liste]', box);
    if (!box || !liste) return;
    var h2s = $$('h2', t);
    if (h2s.length < 2) { box.style.display = 'none'; return; }
    arCss();
    var items = [], ol = document.createElement('ol'), i2 = 0, cur = null;
    ol.className = 'cv-ar-toc-liste';
    function libelle(h) { return h.textContent.replace(/\s+/g, ' ').trim().replace(/^(\d{1,2}|[IVX]{1,4})\s*[.)\-–—:]\s*/, ''); }
    $$('h2, h3', t).forEach(function (h) {
      var lab = libelle(h);
      if (!lab) return;
      if (h.tagName === 'H2') {
        i2++; h.id = 's' + i2;
        var li = document.createElement('li'), a = document.createElement('a');
        a.className = 'cv-ar-toc-h2'; a.href = '#' + h.id;
        a.innerHTML = '<span class="cv-ar-toc-num">' + (i2 < 10 ? '0' : '') + i2 + '</span><span></span>';
        a.lastChild.textContent = lab;
        li.appendChild(a); ol.appendChild(li);
        cur = { h: h, li: li, a: a, subs: [] }; items.push(cur);
      } else if (cur) {
        h.id = cur.h.id + '-' + (cur.subs.length + 1);
        if (!cur.ul) {
          var pli = document.createElement('div'); pli.className = 'cv-ar-toc-pli'; pli.setAttribute('aria-hidden', 'true');
          cur.ul = document.createElement('ol'); cur.ul.className = 'cv-ar-toc-sous';
          pli.appendChild(cur.ul); cur.li.appendChild(pli); cur.pli = pli;
        }
        var sl = document.createElement('li'), sa = document.createElement('a');
        sa.className = 'cv-ar-toc-h3'; sa.href = '#' + h.id; sa.textContent = lab; sa.tabIndex = -1;
        sl.style.setProperty('--d', (120 + 50 * cur.subs.length) + 'ms');
        sl.appendChild(sa); cur.ul.appendChild(sl); cur.subs.push({ h: h, a: sa });
      }
    });
    liste.innerHTML = ''; liste.appendChild(ol);
    var pct = $('[data-cv-ar-pct]', box), barre = $('[data-cv-ar-barre]', box), bascule = $('[data-cv-ar-bascule]', box);
    var mq = window.matchMedia ? matchMedia('(max-width: 991px)') : { matches: false }, actif = -1, actif3 = null;
    function ouvrir(on) {
      box.classList.toggle('cv-ar-ferme', !on);
      if (bascule) {
        bascule.setAttribute('aria-expanded', on ? 'true' : 'false');
        txt($('[data-cv-ar-bascule-txt]', bascule), on ? 'Masquer' : 'Afficher');
        var ch = $('svg', bascule); if (ch) ch.style.transform = on ? 'rotate(180deg)' : '';
      }
    }
    if (bascule) {
      bascule.setAttribute('aria-controls', liste.id || (liste.id = 'cv-ar-sommaire-liste'));
      bascule.addEventListener('click', function () { if (mq.matches) ouvrir(box.classList.contains('cv-ar-ferme')); });
    }
    function majMq() { ouvrir(!mq.matches); }
    if (mq.addEventListener) mq.addEventListener('change', majMq); else if (mq.addListener) mq.addListener(majMq);
    majMq();
    function maj() {
      var a = -1, a3 = null, r = t.getBoundingClientRect(), vh = window.innerHeight;
      items.forEach(function (it, k) { if (it.h.getBoundingClientRect().top < 140) a = k; });
      if (a >= 0) items[a].subs.forEach(function (s) { if (s.h.getBoundingClientRect().top < 140) a3 = s; });
      if (a !== actif) {
        items.forEach(function (it, k) {
          var on = k === a;
          it.li.classList.toggle('cv-ar-toc-on', on);
          if (on) it.a.setAttribute('aria-current', 'location'); else it.a.removeAttribute('aria-current');
          if (it.pli) it.pli.setAttribute('aria-hidden', on ? 'false' : 'true');
          it.subs.forEach(function (s) { s.a.tabIndex = on ? 0 : -1; });
        });
        actif = a;
      }
      if (a3 !== actif3) { if (actif3) actif3.a.classList.remove('cv-ar-toc-on'); if (a3) a3.a.classList.add('cv-ar-toc-on'); actif3 = a3; }
      var total = r.height - vh + 140, p = total > 0 ? clamp((140 - r.top) / total) : (r.top < 140 ? 1 : 0);
      txt(pct, Math.round(p * 100) + ' %');
      if (barre) barre.style.width = (p * 100).toFixed(1) + '%';
    }
    var tick = false;
    function planifie() { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; maj(); }); } }
    addEventListener('scroll', planifie, { passive: true }); addEventListener('resize', planifie);
    maj();
    ol.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      var h = document.getElementById(a.hash.slice(1)); if (!h) return;
      e.preventDefault(); e.stopPropagation();
      if (mq.matches) ouvrir(false);
      window.scrollTo({ top: Math.max(0, h.getBoundingClientRect().top + window.pageYOffset - 88), behavior: REDUCE ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + h.id);
    });
  }
  function arPartage(sec) {
    var c = $('link[rel="canonical"]'), url = (c && c.href) || location.origin + location.pathname;
    $$('[data-cv-ar-linkedin]', sec).forEach(function (a) {
      a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-cv-ar-copier]', sec).forEach(function (b) {
      var lab = $('[data-cv-ar-copier-txt]', b) || b, base = lab.textContent, minuterie;
      lab.setAttribute('role', 'status');
      b.addEventListener('click', function (e) {
        e.preventDefault();
        function fait() { txt(lab, 'Lien copié'); clearTimeout(minuterie); minuterie = setTimeout(function () { txt(lab, base); }, 2000); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(fait, function () { prompt('Copiez le lien :', url); });
        else { var z = document.createElement('textarea'); z.value = url; document.body.appendChild(z); z.select(); try { document.execCommand('copy'); fait(); } catch (er) { prompt('Copiez le lien :', url); } z.remove(); }
      });
    });
  }
  function arSimilaires(list) {
    var cur = location.pathname.replace(/\/$/, '').split('/').pop().toLowerCase(), n = 0;
    $$('a[href*="/blog/"], a[data-cv-slug]', list).forEach(function (a) {
      var ds = (a.getAttribute('data-cv-slug') || '').trim();
      if (ds && !/\/blog\/[^#?]/.test(a.getAttribute('href') || '')) a.setAttribute('href', '/blog/' + ds);
      var it = a.closest('.w-dyn-item') || a, slug = (ds || a.getAttribute('href').replace(/\/$/, '').split('/').pop()).toLowerCase();
      var garde = slug !== cur && n < 3;
      if (garde) n++;
      it.style.display = garde ? '' : 'none';
    });
  }
  function arJsonLd(sec, t) {
    if ($('script[data-cv-article]')) return;
    var h = $('h1', sec), o = location.origin, u = o + location.pathname, img = $('[data-cv-ar-image]', sec);
    var aut = $('[data-cv-ar-auteur]', sec), d = $('[data-cv-ar-datepub]', sec), nom = h ? h.textContent.trim() : document.title;
    var post = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: nom, mainEntityOfPage: u,
      publisher: { '@type': 'Organization', name: 'Covalt', url: o + '/' } };
    var iso = d && (d.getAttribute('datetime') || ''), dt = iso ? new Date(iso) : d ? new Date(d.textContent) : null;
    if (dt && !isNaN(dt)) post.datePublished = dt.toISOString();
    if (img && img.currentSrc || img && img.src) post.image = img.currentSrc || img.src;
    if (aut && aut.textContent.trim()) post.author = { '@type': 'Person', name: aut.textContent.trim() };
    var s = document.createElement('script');
    s.type = 'application/ld+json'; s.setAttribute('data-cv-article', '');
    s.textContent = JSON.stringify([post, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: o + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: o + '/blog' },
      { '@type': 'ListItem', position: 3, name: nom, item: u }] }]);
    document.head.appendChild(s);
  }
  function article() {
    anims('article').forEach(function (sec) {
      headerOffset();
      var t = $('[data-cv-ar-texte]', sec);
      if (t) {
        arNettoie(t);
        var mots = (t.textContent.match(/[A-Za-zÀ-ÿ0-9’'-]+/g) || []).length;
        $$('[data-cv-ar-lecture]', sec).forEach(function (el) {
          txt($('[data-cv-ar-lecture-txt]', el) || el, Math.max(1, Math.round(mots / 230)) + ' min de lecture');
          el.style.display = '';
          el.removeAttribute('hidden');
        });
        arSommaire(sec, t);
      }
      var aut = $('[data-cv-ar-auteur]', sec), ini = $('[data-cv-ar-initiales]', sec), nom = aut ? aut.textContent.trim() : '';
      if (ini) {
        if (nom) txt(ini, nom.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(''));
        else ini.style.display = 'none';
      }
      arPartage(sec);
      arJsonLd(sec, t);
    });
    $$('[data-cv-ar-similaires]').forEach(arSimilaires);
  }

  function init() { dates(); article(); guide(); guides(); reveal(); marquee(); faq(); rdv(); comparateur(); process(); depot(); temoignages(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
