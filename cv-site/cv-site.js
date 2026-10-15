/*! cv-site.js — animations des blocs Covalt (Webflow natif). Vanilla JS, sans dépendance.
 * Chaque bloc s'active via data-cv-anim : reveal, marquee, faq, rdv, comparateur, process, depot-projet.
 * Sans JS ou avec prefers-reduced-motion, la page garde l'état final statique livré par Webflow.
 */
(function () {
  'use strict';

  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BLUE = '#007AA3', TINT = '#EEF6F9', TBD = '#B8D8E6', DARK = '#005A78';
  var BONE = 'var(--_covalt-tokens---cv-bone, #F5F7F5)', POLAR = 'var(--_covalt-tokens---cv-polar, #DCE2DF)';
  var INK = 'var(--_covalt-tokens---cv-encre, #081412)', T2 = 'var(--_covalt-tokens---cv-texte-secondaire, #4A5550)';
  var T3 = 'var(--_covalt-tokens---cv-texte-tertiaire, #6E7873)';
  var CURVE = 'cubic-bezier(.2,0,0,1)';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function anims(name) { return $$('[data-cv-anim="' + name + '"]'); }
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

  /* rdv : formulaire e-mail, puis iframe HubSpot (data-cv-url, {email} encodé). */
  function rdv() {
    anims('rdv').forEach(function (root) {
      var form = $('form', root), input = form && $('input[type="email"]', form), tpl = root.getAttribute('data-cv-url');
      if (!form || !input || !tpl) return;
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
        frame.src = tpl.replace('{email}', encodeURIComponent(v));
        form.style.display = 'none'; cal.style.display = 'flex';
      });
      back.addEventListener('click', function () { cal.style.display = 'none'; form.style.display = ''; input.focus(); });
      window.addEventListener('message', function (e) {
        if (e.source !== frame.contentWindow) return;
        var h = e.data && (e.data.height || e.data.meetingsHeight);
        if (h > 200) frame.style.height = h + 'px';
      });
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

  function init() { reveal(); marquee(); faq(); rdv(); comparateur(); process(); depot(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
