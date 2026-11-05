/* Loan Connect, pages site (Home, Emprunteur, Conseil, Prêteur) : UTM, calendrier intégré, popups profil et rendez-vous,
 * animations des illustrations Conseil (dossiers clients, prêteurs correspondants) et de la page Prêteur (hero, entonnoir, process épinglé, étape e-mail du RDV).
 * Remplace l'ancien code de pied de page et le script lcprofillinks. Vanilla JS, sans dépendance.
 *
 * Déclencheurs (même page uniquement, interceptés au capture) :
 *   #lc-profil-projet / #lc-profil-compte -> popup profil
 *   #lc-rdv, #contact, tout lien /meetings/ hors popup -> popup rendez-vous
 * À l'arrivée avec l'un de ces hash dans l'URL, le popup correspondant s'ouvre et le hash est retiré.
 */
(function () {
  'use strict';
  if (window.lcHome) return;
  window.lcHome = true;

  var CAL = 'https://pages.covalt.eu/meetings/fgladieux/loan-connect-prise-de-rdv-avec-un-sales-?embed=true';
  var DEST = {
    projet: { t: 'Déposer un projet', e: 'https://connect.covalt.eu/deposer-un-projet/entreprise', c: 'https://connect.covalt.eu/signup/advisor' },
    compte: { t: 'Créer un compte', e: 'https://connect.covalt.eu/signup?role=borrower', c: 'https://connect.covalt.eu/signup/advisor' }
  };
  var PRETEUR = '/loan-connect/preteur';

  /* ---------- UTM / gclid : URL, sinon cookie lc_attr posé par GTM ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
  var params = new URLSearchParams(location.search);
  var fromUrl = KEYS.some(function (k) { return params.get(k); });
  function readAttr() {
    if (fromUrl) return null;
    try { var m = document.cookie.match(/(?:^|;\s*)lc_attr=([^;]+)/); return m ? JSON.parse(decodeURIComponent(m[1])) : null; } catch (e) { return null; }
  }
  var attr = readAttr();
  function withParams(href, embed) {
    try {
      var u = new URL(href, location.href);
      KEYS.forEach(function (k) { var v = fromUrl ? params.get(k) : attr && attr[k]; if (v) u.searchParams.set(k, v); });
      if (embed) {
        u.searchParams.set('embed', 'true'); u.searchParams.delete('email');
        u.searchParams.set('parentHubspotUrl', location.href);
        var utk = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
        if (utk) u.searchParams.set('parentHubspotUtk', decodeURIComponent(utk[1]));
      }
      return u.toString();
    } catch (e) { return href; }
  }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function decorateLinks() {
    $$('a[href*="connect.covalt.eu"], a[href*="/meetings/"]').forEach(function (a) {
      if (a.closest('.lc-voile')) return;
      a.href = withParams(a.href.replace('/signup/entreprise', '/signup?role=borrower'), false);
    });
  }

  /* ---------- Déclencheurs ---------- */
  function samePage(a) {
    return a.origin === location.origin && a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
  }
  /* Les liens /loan-connect/home#lc-profil-… (footer, header) ouvrent le popup sur la page en cours. */
  function versHome(a) {
    return a.origin === location.origin && a.pathname.replace(/\/$/, '') === '/loan-connect/home';
  }
  function action(a) {
    var h = a.hash || '';
    if (samePage(a) || versHome(a)) {
      if (h === '#lc-profil-projet') return 'projet';
      if (h === '#lc-profil-compte') return 'compte';
    }
    if (samePage(a) && (h === '#lc-rdv' || h === '#contact')) return 'rdv';
    if (a.href.indexOf('/meetings/') > -1 && !a.closest('.lc-voile')) return 'meetings';
    return '';
  }

  /* ---------- Styles (spécification du design validé) ---------- */
  var TITRES = 'var(--_covalt-tokens---cv-police-titres, "Gerstner Programm"), serif';
  var MONO = 'var(--_covalt-tokens---cv-police-mono, "JetBrains Mono"), ui-monospace, monospace';
  var css = ''
    + '@keyframes lcBump{0%{opacity:0;transform:scale(.9)}55%{opacity:1;transform:scale(1.035)}78%{transform:scale(.99)}100%{opacity:1;transform:scale(1)}}'
    + '.lc-voile{position:fixed;inset:0;display:none;place-items:center;box-sizing:border-box;font-family:Inter,sans-serif;color:#081412;-webkit-font-smoothing:antialiased}'
    + '.lc-voile *{box-sizing:border-box}'
    + '.lc-voile.is-open{display:grid}'
    + '.lc-voile.is-open .lc-panneau{animation:lcBump 500ms cubic-bezier(.3,0,0,1) both}'
    + '@media (prefers-reduced-motion:reduce){.lc-voile.is-open .lc-panneau{animation:none}}'
    + '.lc-panneau{position:relative;width:100%;background:#fff;border-radius:4px;box-shadow:0 24px 64px rgba(8,20,18,.3)}'
    + '.lc-surtitre{font-family:' + MONO + ';font-size:11px;line-height:1.4;letter-spacing:.12em;text-transform:uppercase;color:#007AA3}'
    + '.lc-titre{margin:0;font-family:' + TITRES + ';font-weight:400;color:#081412}'
    + '.lc-croix{display:grid;place-items:center;flex:none;padding:0;border-radius:4px;background:#fff;color:#081412;cursor:pointer}'
    + '.lc-croix:hover{background:#F5F7F5}'
    + '.lc-croix:focus-visible,.lc-carte:focus-visible,.lc-pret:focus-visible{outline:2px solid #007AA3;outline-offset:2px}'
    /* popup profil */
    + '#lc-profil{z-index:200;background:rgba(8,20,18,.45);padding:24px}'
    + '#lc-profil .lc-panneau{max-width:520px;max-height:100%;overflow:auto;padding:clamp(22px,5vw,36px);display:flex;flex-direction:column;gap:24px}'
    + '#lc-profil .lc-croix{position:absolute;top:14px;right:14px;width:36px;height:36px;border:0}'
    + '#lc-profil .lc-tete{display:flex;flex-direction:column;gap:8px;padding-right:40px}'
    + '#lc-profil .lc-titre{font-size:28px;line-height:1.15;letter-spacing:-.01em}'
    + '.lc-cartes{display:flex;flex-direction:column;gap:12px}'
    + '.lc-carte{display:flex;align-items:center;gap:16px;padding:20px;border:1px solid #DCE2DF;border-radius:4px;background:#fff;color:#081412;text-decoration:none;transition:border-color .15s,background-color .15s}'
    + '.lc-carte:hover{border-color:#007AA3;background:#EEF6F9;color:#081412}'
    + '.lc-picto{width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:4px;background:#EEF6F9;border:1px solid #B8D8E6;color:#007AA3}'
    + '.lc-carte-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}'
    + '.lc-carte-titre{font-size:16px;line-height:1.3;font-weight:500}'
    + '.lc-carte-sous{font-size:13px;line-height:1.45;color:#4A5550}'
    + '.lc-fleche{display:flex;flex:none;color:#007AA3}'
    + '.lc-pret{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:4px;background:#F5F7F5;font-size:14px;line-height:1.4;color:#4A5550;text-decoration:none;transition:background-color .15s,color .15s}'
    + '.lc-pret:hover{background:#EEF6F9;color:#081412}'
    + '.lc-pret-txt{display:flex;flex-wrap:wrap;gap:2px 8px}'
    + '.lc-pret-fort{font-weight:500;color:#005A78}'
    + '.lc-pret .lc-fleche{color:#005A78}'
    /* popup rendez-vous */
    + '#lc-rdv-popup{z-index:210;background:rgba(8,20,18,.55);padding:clamp(0px,3vw,24px)}'
    + '#lc-rdv-popup .lc-panneau{max-width:760px;max-height:100%;overflow:hidden;display:flex;flex-direction:column}'
    + '#lc-rdv-popup .lc-tete{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px clamp(16px,3vw,24px);border-bottom:1px solid #DCE2DF}'
    + '#lc-rdv-popup .lc-tete-txt{display:flex;flex-direction:column;gap:6px;min-width:0}'
    + '#lc-rdv-popup .lc-titre{font-size:clamp(20px,2.4vw,24px);line-height:1.2;letter-spacing:-.01em}'
    + '#lc-rdv-popup .lc-croix{width:40px;height:40px;border:1px solid #DCE2DF}'
    + '#lc-rdv-popup .lc-corps{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch}'
    + '#lc-rdv-popup iframe{display:block;width:100%;height:680px;border:0}';

  /* Icônes Lucide : building-2, briefcase, arrow-right, x */
  function svg(size, paths) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var IC_ENTREPRISE = svg(22, '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>');
  var IC_CONSEIL = svg(22, '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>');
  function fleche(size) { return svg(size, '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'); }
  var CROIX = svg(18, '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');

  /* ---------- Ouverture / fermeture ---------- */
  var ouvert = null, retour = null;
  function voile(id, label) {
    var v = document.createElement('div');
    v.id = id; v.className = 'lc-voile';
    v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', label);
    v.addEventListener('click', function (e) { if (e.target === v) fermer(); });
    document.body.appendChild(v);
    return v;
  }
  function croix() {
    var c = document.createElement('button');
    c.type = 'button'; c.className = 'lc-croix'; c.setAttribute('aria-label', 'Fermer'); c.innerHTML = CROIX;
    c.addEventListener('click', fermer);
    return c;
  }
  function ouvrir(v) {
    if (ouvert && ouvert !== v) ouvert.classList.remove('is-open');
    retour = document.activeElement;
    ouvert = v;
    v.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    var c = v.querySelector('.lc-croix'); if (c) c.focus({ preventScroll: true });
  }
  function fermer() {
    if (!ouvert) return;
    ouvert.classList.remove('is-open');
    ouvert = null;
    document.documentElement.style.overflow = '';
    if (retour && retour.focus) retour.focus({ preventScroll: true });
  }

  /* ---------- Popup profil ---------- */
  var profil, profilSurtitre, profilCartes;
  function carte(href, ic, titre, sous) {
    return '<a class="lc-carte" href="' + href + '" target="_blank" rel="noopener">'
      + '<span class="lc-picto">' + ic + '</span>'
      + '<span class="lc-carte-txt"><span class="lc-carte-titre">' + titre + '</span><span class="lc-carte-sous">' + sous + '</span></span>'
      + '<span class="lc-fleche">' + fleche(18) + '</span></a>';
  }
  function ouvrirProfil(type) {
    var d = DEST[type] || DEST.projet;
    if (!profil) {
      profil = voile('lc-profil', 'Choisir votre profil');
      var p = document.createElement('div'); p.className = 'lc-panneau';
      p.innerHTML = '<div class="lc-tete"><span class="lc-surtitre"></span><h2 class="lc-titre">Quel est votre profil ?</h2></div>'
        + '<div class="lc-cartes"></div>'
        + '<a class="lc-pret" href="' + PRETEUR + '"><span class="lc-pret-txt"><span>Vous êtes prêteur ?</span>'
        + '<span class="lc-pret-fort">Sourcez de nouveaux dossiers qualifiés</span></span><span class="lc-fleche">' + fleche(15) + '</span></a>';
      p.insertBefore(croix(), p.firstChild);
      profil.appendChild(p);
      profilSurtitre = p.querySelector('.lc-surtitre');
      profilCartes = p.querySelector('.lc-cartes');
      /* Une carte ouvre un nouvel onglet : le popup se ferme derrière. */
      profilCartes.addEventListener('click', function (e) { if (e.target.closest('.lc-carte')) setTimeout(fermer, 0); });
    }
    profilSurtitre.textContent = d.t;
    profilCartes.innerHTML = carte(withParams(d.e, false), IC_ENTREPRISE, 'Je suis une entreprise', 'Je recherche un financement pour mon projet')
      + carte(withParams(d.c, false), IC_CONSEIL, 'Je suis un conseil en financement', 'J’accompagne mes clients dans leur recherche de financement');
    ouvrir(profil);
  }

  /* ---------- Popup rendez-vous ---------- */
  var rdv, rdvFrame;
  function hauteur(frame) {
    window.addEventListener('message', function (e) {
      if (e.source !== frame.contentWindow) return;
      var h = e.data && (e.data.height || e.data.meetingsHeight);
      if (h > 200) frame.style.height = h + 'px';
    });
  }
  function ouvrirRdv(url) {
    if (!rdv) {
      rdv = voile('lc-rdv-popup', 'Prendre rendez-vous avec un expert Loan Connect');
      var p = document.createElement('div'); p.className = 'lc-panneau';
      p.innerHTML = '<div class="lc-tete"><div class="lc-tete-txt"><span class="lc-surtitre">Rendez-vous · 30 min</span>'
        + '<h2 class="lc-titre">Échangez avec un expert Loan Connect</h2></div></div><div class="lc-corps"></div>';
      p.querySelector('.lc-tete').appendChild(croix());
      rdvFrame = document.createElement('iframe');
      rdvFrame.title = 'Choisir un créneau avec un expert Loan Connect';
      hauteur(rdvFrame);
      p.querySelector('.lc-corps').appendChild(rdvFrame);
      rdv.appendChild(p);
    }
    var src = withParams(url, true);
    if (rdvFrame.getAttribute('src') !== src) rdvFrame.src = src;
    ouvrir(rdv);
  }

  /* ---------- Calendrier intégré dans le bloc RDV de la page ---------- */
  var frames = [];
  function calendriers() {
    $$('[data-cv-anim="rdv"]').forEach(function (root) {
      var tpl = root.getAttribute('data-cv-url');
      if (!tpl) return;
      CAL = tpl;
      /* cv-site.js ignore les blocs marqués data-cv-pret : un seul calendrier par bloc. */
      root.setAttribute('data-cv-pret', '');
      if (root.querySelector('iframe')) return;
      if (document.querySelector('[data-lc-anim^="pr-"]')) { root.setAttribute('data-lc-rdv-email', ''); return prRdv(root, tpl); }
      var form = root.querySelector('form'); if (form) form.style.display = 'none';
      var frame = document.createElement('iframe');
      frame.title = 'Choisir un créneau avec un expert Loan Connect';
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('data-tpl', tpl);
      frame.style.cssText = 'display:block;width:100%;height:680px;border:0';
      frame.src = withParams(tpl, true);
      hauteur(frame);
      root.appendChild(frame);
      frames.push(frame);
    });
  }
  function rafraichirCalendriers() {
    frames.forEach(function (f) { f.src = withParams(f.getAttribute('data-tpl'), true); });
  }

  /* ---------- Animations des illustrations de la page Conseil ---------- */
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function mobile() { return window.innerWidth <= 767; }
  function visible(el, cb) {
    if (!('IntersectionObserver' in window)) return cb(true);
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: 0.2 }).observe(el);
  }
  css += '@keyframes lcLive{0%{box-shadow:0 0 0 0 rgba(0,122,163,.45)}100%{box-shadow:0 0 0 8px rgba(0,122,163,0)}}'
    + '.lc-toast-point{animation:lcLive 1.6s infinite}'
    + '.lc-dc-statut{transition:background-color .4s,border-color .4s,color .4s}'
    + '.lc-toast{transition:opacity .4s,transform .5s cubic-bezier(.2,0,0,1)}'
    + '.lc-pc-ligne{transition:opacity .35s,transform .45s cubic-bezier(.2,0,0,1)}'
    + '.lc-pc-jauge-plein{transition:width .6s cubic-bezier(.2,.7,.2,1)}'
    + '@media (prefers-reduced-motion:reduce){.lc-toast-point{animation:none}}'
    /* Hero mobile : la notification passe sous la carte, l'aplat s'arrête juste en dessous
       (la variante Hero de CV Illustration sur aplat réserve 164 px pour la notification superposée du desktop). */
    + '@media (max-width:767px){.cv-section--hero .cv-aplat.w-variant-b53a93c6-8d72-6000-5dc7-bf7bb35a3966{padding-bottom:24px}'
    + '.cv-section--hero .cv-aplat-carte.w-variant-b53a93c6-8d72-6000-5dc7-bf7bb35a3966{min-height:0}}';

  /* Hero Conseil : statuts des dossiers (data-lc-statuts « ms:Libellé|… ») et toast, boucle de 9 s. */
  var PASTILLE = {
    'Brouillon': ['#F5F7F5', '#DCE2DF', '#4A5550'],
    'En analyse': ['#fff', '#B8D8E6', '#005A78'],
    'En ligne': ['#EEF6F9', '#B8D8E6', '#005A78']
  };
  function dossiers() {
    $$('[data-lc-anim="dossiers"]').forEach(function (carte) {
      var zone = carte.closest('section') || document;
      var toast = zone.querySelector('[data-lc-toast]');
      var tToast = toast ? +toast.getAttribute('data-lc-toast') || 3800 : 0;
      var lignes = $$('[data-lc-statuts]', carte).map(function (el) {
        return { el: el, etapes: el.getAttribute('data-lc-statuts').split('|').map(function (s) { var i = s.indexOf(':'); return [+s.slice(0, i), s.slice(i + 1)]; }) };
      });
      var t = 0, enVue = false, survol = false;
      function rendu() {
        lignes.forEach(function (l) {
          var cur = l.etapes.filter(function (e) { return t >= e[0]; }).pop() || l.etapes[0];
          var p = PASTILLE[cur[1]] || ['#007AA3', '#007AA3', '#fff'];
          if (l.el.textContent !== cur[1]) l.el.textContent = cur[1];
          l.el.style.backgroundColor = p[0]; l.el.style.borderColor = p[1]; l.el.style.color = p[2];
        });
        if (toast) { var on = t >= tToast; toast.style.opacity = on ? '1' : '0'; toast.style.transform = on ? 'none' : 'translateY(10px)'; }
      }
      carte.addEventListener('mouseenter', function () { survol = true; });
      carte.addEventListener('mouseleave', function () { survol = false; });
      visible(carte, function (v) { enVue = v; });
      function fige() { return REDUCE || mobile(); }
      t = fige() ? 6000 : 0; rendu();
      setInterval(function () {
        if (fige()) { if (t !== 6000) { t = 6000; rendu(); } return; }
        if (!enVue || survol) return;
        t = (t + 100) % 9000; rendu();
      }, 100);
    });
  }

  /* Process Conseil, écran 3 : compteur, barre et prêteurs, rejoués à chaque affichage de l'écran. */
  function preteurs() {
    $$('[data-lc-anim="preteurs"]').forEach(function (bloc) {
      var panneau = bloc.closest('[data-cv-panneau]') || bloc;
      var nombre = bloc.querySelector('[data-lc-compte]'), max = nombre ? +nombre.getAttribute('data-lc-compte') || 0 : 0;
      var barre = bloc.querySelector('.lc-pc-barre-plein');
      var lignes = $$('.lc-pc-ligne', bloc);
      var jauges = lignes.map(function (l) { var j = l.querySelector('[data-lc-taux]'); return j; });
      function etat(t) {
        var k = clamp((t - 200) / 1600);
        if (nombre) nombre.textContent = String(Math.round(max * ease(k)));
        if (barre) barre.style.width = (k * 100).toFixed(1) + '%';
        lignes.forEach(function (l, i) {
          var on = t >= 700 + i * 450;
          l.style.opacity = on ? '1' : '0'; l.style.transform = on ? 'none' : 'translateY(8px)';
          if (jauges[i]) jauges[i].style.width = (on ? +jauges[i].getAttribute('data-lc-taux') : 0) + '%';
        });
      }
      etat(REDUCE ? 99999 : 0);
      if (REDUCE) return;
      var debut = 0, raf = 0;
      function boucle(now) { var t = now - debut; etat(t); if (t < 3000) raf = requestAnimationFrame(boucle); }
      function affiche() { return !panneau.classList.contains('cv-pp--cache') && panneau.offsetParent !== null; }
      var avant = false;
      function verifie() {
        var a = affiche();
        if (a && !avant) { cancelAnimationFrame(raf); etat(0); debut = performance.now(); raf = requestAnimationFrame(boucle); }
        avant = a;
      }
      new MutationObserver(verifie).observe(panneau, { attributes: true, attributeFilter: ['class'] });
      verifie();
    });
  }

  /* ---------- Page Prêteur (maquette « Loan Connect Prêteur ») ----------
   * [data-lc-anim="pr-hero"]       illustration du hero (critères, 2 dossiers, Security Package dépliable)
   * [data-lc-anim="pr-entonnoir"]  constat : 4 lignes de 20 carrés, une ligne toutes les 420 ms
   * [data-lc-anim="pr-process"]    process épinglé (300vh desktop, 260vh mobile) ou auto toutes les 6,5 s
   * [data-lc-rdv-email]            bloc RDV : étape e-mail puis calendrier HubSpot (?email=)
   */
  var BLEU = '#007AA3', TEINTE = '#EEF6F9', TBORD = '#B8D8E6', FONCE = '#005A78', GRIS = '#DCE2DF';
  var LOGO = 'https://cdn.prod.website-files.com/6878ed604188895c3c22b06d/6ad0e0e11a8cee5f6a2cf105_cv-logo-loan-connect.png';
  var I_CHECK = '<path d="M20 6 9 17l-5-5"/>';
  var I_SHIELD = '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>';
  var I_CHEV = '<path d="m6 9 6 6 6-6"/>';
  var I_LOCK = '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
  var I_DOC = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>';
  var I_USER = '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
  function ic(size, paths, stroke, extra) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + (stroke || 'currentColor')
      + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + paths + '</svg>';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function chip(el, on) {
    el.style.background = on ? TEINTE : '#fff';
    el.style.borderColor = on ? TBORD : 'var(--_covalt-tokens---cv-polar, #DCE2DF)';
    el.style.color = on ? FONCE : 'var(--_covalt-tokens---cv-texte-secondaire, #4A5550)';
  }
  function petitMobile() { return window.innerWidth <= 760; }
  /* Polices dans un attribut style="…" : guillemets simples. */
  var MONO_A = MONO.replace(/"/g, "'"), TITRES_A = TITRES.replace(/"/g, "'");

  css += '.lc-pr-logo{display:block;height:24px;width:auto;margin:0 0 28px}'
    /* Hero */
    + '.lc-ph{position:relative;padding:40px 0 40px 40px;font-family:var(--_covalt-tokens---cv-police-texte,inherit);color:#081412}'
    + '.lc-ph-aplat{position:absolute;inset:0;background:#007AA3}'
    + '.lc-ph-barre{position:absolute;top:22px;left:88px;right:16px;height:40px;background:rgba(255,255,255,.3)}'
    + '.lc-ph-pile{position:relative;margin-right:-24px;display:flex;flex-direction:column;gap:14px}'
    + '.lc-ph-carte{background:#fff;border:1px solid #DCE2DF;border-radius:4px;box-shadow:0 1px 2px rgba(23,33,28,.06),0 10px 28px -6px rgba(23,33,28,.16)}'
    + '.lc-ph-crit{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px 16px;padding:16px 20px}'
    + '.lc-ph-mono{font-family:' + MONO + ';font-size:10px;letter-spacing:.1em;color:#7A8682}'
    + '.lc-ph-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}'
    + '.lc-ph-tag{padding:4px 9px;border-radius:4px;background:#EEF6F9;border:1px solid #B8D8E6;font-size:12px;line-height:1.3;color:#005A78}'
    + '.lc-ph-live{display:inline-flex;align-items:center;gap:7px;flex:none;font-size:12px;color:#4A5550}'
    + '.lc-pr-pt{width:6px;height:6px;border-radius:50%;background:#007AA3;animation:lcLive 1.6s infinite;flex:none}'
    + '.lc-ph-deal,.lc-ph-sk{transition:opacity .4s,transform .5s cubic-bezier(.2,0,0,1)}'
    + '.lc-ph-haut{padding:14px 20px 12px;display:flex;flex-direction:column;gap:10px}'
    + '.lc-ph-nom{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.lc-pr-champs{display:grid;grid-template-columns:repeat(auto-fit,minmax(84px,1fr));gap:8px 12px}'
    + '.lc-pr-champ{display:flex;flex-direction:column;gap:3px;min-width:0}'
    + '.lc-pr-champ-k{font-size:11px;color:#7A8682;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.lc-pr-champ-v{font-family:' + TITRES + ';font-size:16px;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.lc-ph-sp{margin:0 20px 14px;border:1px solid #DCE2DF;border-radius:4px;transition:background .3s,border-color .3s}'
    + '.lc-ph-sp.lc-on{background:#EEF6F9;border-color:#B8D8E6}'
    + '.lc-ph-sp-btn{all:unset;box-sizing:border-box;width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 12px;cursor:pointer}'
    + '.lc-ph-sp-btn:focus-visible{outline:2px solid #007AA3;outline-offset:2px}'
    + '.lc-ph-sp-g{display:flex;gap:8px;align-items:center;min-width:0;font-size:13px;font-weight:500;color:#005A78}'
    + '.lc-ph-sp-d{display:flex;gap:10px;align-items:center;flex:none}'
    + '.lc-ph-sp-d svg{transition:transform .3s}.lc-ph-sp.lc-on .lc-ph-sp-d svg{transform:rotate(180deg)}'
    + '.lc-pli{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.2,0,0,1)}.lc-on>.lc-pli,.lc-pli.lc-on{grid-template-rows:1fr}'
    + '.lc-pli>div{overflow:hidden;min-height:0}'
    + '.lc-ph-sp-in{padding:0 12px 6px;display:flex;flex-direction:column}'
    + '.lc-ph-g{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-top:1px solid #B8D8E6;font-size:13px;opacity:0;transition:opacity .3s}'
    + '.lc-ph-sp.lc-on .lc-ph-g{opacity:1}.lc-ph-sp.lc-on .lc-ph-g+.lc-ph-g{transition-delay:.27s}.lc-ph-sp.lc-on .lc-ph-g:first-child{transition-delay:.15s}'
    + '.lc-ph-g span:last-child{font-family:' + MONO + ';font-size:12px;color:#005A78;white-space:nowrap}'
    + '.lc-ph-sk{box-shadow:0 1px 2px rgba(23,33,28,.05),0 6px 18px -6px rgba(23,33,28,.12);padding:16px 20px 18px;display:flex;flex-direction:column;gap:12px}'
    + '.lc-ph-sk i{display:block;height:7px;background:#E6EAE8;border-radius:2px}'
    + '@media (max-width:760px){.lc-ph{padding:20px 0 20px 20px}.lc-ph-barre,.lc-ph-sk{display:none}.lc-ph-pile{margin-right:-8px}}'
    /* Constat */
    + '.lc-pr-entonnoir .lc-pr-ligne{cursor:pointer}'
    + '.lc-pr-ligne-texte{transition:opacity .4s}'
    + '.lc-pr-carres{display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:5px;max-width:520px;width:100%}'
    + '.lc-pr-carres i{aspect-ratio:1;border-radius:2px;transition:background .35s,opacity .3s,transform .35s cubic-bezier(.2,0,0,1)}'
    + '.lc-pr-fin{transition:opacity .5s,transform .6s cubic-bezier(.2,0,0,1)}'
    + '.lc-pr-fin-boite img{height:16px;width:auto;display:block;flex:none}'
    /* Process */
    + '.lc-pr-etape{cursor:pointer;transition:opacity .4s}'
    + '.lc-pr-point{transition:background .4s,box-shadow .4s}'
    + '.lc-pr-etape-corps{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.2,0,0,1)}'
    + '.lc-pr-etape.lc-on .lc-pr-etape-corps{grid-template-rows:1fr}.lc-pr-etape-corps>div{overflow:hidden;min-height:0}'
    + '.lc-pr-ecran{position:relative;background:#fff;box-shadow:0 1px 2px rgba(23,33,28,.06),0 24px 48px -12px rgba(23,33,28,.22);margin-right:-24px;min-height:380px;display:flex;flex-direction:column}'
    + '@keyframes lcIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'
    + '.lc-in{animation:lcIn .5s cubic-bezier(.2,0,0,1) both}'
    + '.lc-pe{display:flex;flex-direction:column;flex:1;font-family:var(--_covalt-tokens---cv-police-texte,inherit);color:#081412}'
    + '.lc-pe-tete{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid #DCE2DF}'
    + '.lc-pe-titre{font-family:' + TITRES + ';font-size:18px}'
    + '.lc-pe-corps{display:flex;flex-direction:column;gap:22px;padding:22px 20px;flex:1}'
    + '.lc-pe-bloc{display:flex;flex-direction:column;gap:12px}'
    + '.lc-pe-rail{position:relative;height:6px;background:#F5F7F5;margin:4px 7px}'
    + '.lc-pe-plein{position:absolute;top:0;bottom:0;left:12%;background:#007AA3}'
    + '.lc-pe-bouton{position:absolute;top:-5px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#fff;border:2px solid #007AA3;box-sizing:border-box}'
    + '.lc-pe-bornes{display:flex;justify-content:space-between;font-family:' + MONO + ';font-size:12px;color:#4A5550}'
    + '.lc-pe-chips{display:flex;flex-wrap:wrap;gap:8px}'
    + '.lc-pe-chip{display:inline-flex;align-items:center;height:30px;padding:0 11px;border-radius:4px;font-size:12px;border:1px solid #DCE2DF;transition:background .3s,border-color .3s,color .3s}'
    + '.lc-pe-btn{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:4px;font-size:14px;font-weight:500;border:1px solid #007AA3;transition:background .3s,color .3s,transform .15s}'
    + '.lc-pe-pastille{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:4px;background:#EEF6F9;border:1px solid #B8D8E6;font-size:11px;color:#005A78}'
    + '.lc-pe-dossier{display:grid;grid-template-columns:36px 1fr auto;gap:14px;align-items:center;padding:16px 20px;border-bottom:1px solid #DCE2DF}'
    + '.lc-pe-ico{width:36px;height:36px;background:#F5F7F5;border:1px solid #DCE2DF;display:grid;place-items:center;color:#007AA3}'
    + '.lc-pe-docs{display:flex;gap:4px}.lc-pe-doc{width:18px;height:18px;border-radius:2px;display:grid;place-items:center;color:#fff;transition:background .3s}'
    + '.lc-pe-doc svg{transition:opacity .3s}'
    + '.lc-pe-gar{font-size:11px;color:#005A78;white-space:nowrap;transition:opacity .4s}'
    + '.lc-pe-pied{margin-top:auto;display:flex;gap:6px;align-items:center;padding:14px 20px;font-size:11px;color:#7A8682;border-top:1px solid #DCE2DF}'
    + '.lc-pe-rel{display:grid;grid-template-columns:auto minmax(16px,1fr) auto minmax(16px,1fr) auto;align-items:center;gap:8px;font-size:12px}'
    + '.lc-pe-trait{height:2px;background:#DCE2DF;position:relative;overflow:hidden}'
    + '.lc-pe-trait i{position:absolute;inset:0;background:#007AA3;transform-origin:left;transform:scaleX(0);transition:transform .35s}'
    + '.lc-pe-equipe{padding:4px 9px;border-radius:4px;background:#fff;border:1px solid #B8D8E6;color:#005A78;white-space:nowrap}'
    + '.lc-pe-ligne{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:7px 0;border-top:1px solid #DCE2DF;font-size:13px}'
    + '.lc-pe-fade{transition:opacity .3s,transform .35s}'
    + '.lc-pm{margin:14px 0 2px;background:#F5F7F5;border:1px solid #DCE2DF;border-radius:4px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;font-family:var(--_covalt-tokens---cv-police-texte,inherit);color:#081412}'
    + '.lc-pm .lc-pe-chip{height:26px;padding:0 9px;font-size:11px}'
    + '.lc-pm .lc-pe-rel{gap:6px;font-size:11px;grid-template-columns:auto minmax(10px,1fr) auto minmax(10px,1fr) auto}'
    + '.lc-pm .lc-pe-equipe{padding:3px 7px}'
    + '.lc-pm-dossier{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 10px;background:#fff;border:1px solid #DCE2DF;border-radius:4px}'
    + '.lc-pm .lc-pe-doc{width:14px;height:14px}'
    /* RDV : étape e-mail */
    + '.lc-pr-rdv{width:100%;max-width:480px;margin:0 auto;background:#fff;color:#081412;border-radius:4px;padding:clamp(24px,5vw,40px);display:flex;flex-direction:column;gap:24px;box-shadow:0 24px 48px -24px rgba(0,40,60,.45);box-sizing:border-box;font-family:var(--_covalt-tokens---cv-police-texte,inherit)}'
    + '.lc-pr-mcal{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:16px;padding:16px;background:#EEF6F9;border:1px solid #CFE4EC;border-radius:4px}'
    + '.lc-pr-mcal-j{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;text-align:center}'
    + '.lc-pr-mcal-j span{padding:4px 0;font-size:10px;color:#9AA8A4;border:1px solid transparent;border-radius:4px}'
    + '.lc-pr-mcal-j .lc-d{border-color:#007AA3;color:#005A78;background:#fff}.lc-pr-mcal-j .lc-s{background:#007AA3;border-color:#007AA3;color:#fff;font-weight:500}'
    + '.lc-pr-mcal-h{display:flex;flex-direction:column;gap:6px;padding-left:16px;border-left:1px solid #CFE4EC}'
    + '.lc-pr-mcal-h span{padding:5px 0;text-align:center;font-size:10px;border:1px solid #CFE4EC;border-radius:4px;background:#fff;color:#4A5550}'
    + '.lc-pr-mcal-h .lc-s{background:#007AA3;border-color:#007AA3;color:#fff;font-weight:500}'
    + '.lc-pr-rdv label{display:flex;flex-direction:column;gap:8px;font-size:13px;font-weight:500}'
    + '.lc-pr-rdv input{height:48px;padding:0 14px;border:1px solid #DCE2DF;border-radius:4px;font:inherit;font-size:15px;font-weight:400;color:#081412;background:#fff;outline:none;box-sizing:border-box;width:100%}'
    + '.lc-pr-rdv input:focus{border-color:#007AA3;box-shadow:0 0 0 3px rgba(0,122,163,.15)}'
    + '.lc-pr-rdv button{height:48px;border:0;border-radius:4px;background:#007AA3;color:#fff;font:inherit;font-size:15px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}'
    + '.lc-pr-rdv button:hover{background:#005A78}'
    + '.lc-pr-cal{width:100%;max-width:720px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;display:flex;flex-direction:column}'
    + '.lc-pr-cal-barre{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-bottom:1px solid #DCE2DF;font-size:13px;color:#4A5550}'
    + '.lc-pr-cal-barre button{background:none;border:0;padding:0;font:inherit;font-size:13px;font-weight:500;color:#005A78;cursor:pointer}'
    + '[data-lc-rdv-email]{background:transparent!important;box-shadow:none!important;border:0!important;padding:0!important}'
    + '.lc-pr-epingle .lc-pr-process-grille{padding:40px 32px}@media (max-width:760px){.lc-pr-epingle .lc-pr-process-grille{padding:16px 20px}}'
    + '.lc-pr-sp-lien:hover{color:#fff;text-decoration-color:#fff}'
    + '#faq .cv-faq-question{text-decoration:none;color:inherit}'
    + '@media (prefers-reduced-motion:reduce){.lc-pr-pt{animation:none}.lc-in{animation:none}}';

  /* Logo Loan Connect au-dessus du titre du hero (24 px), page Prêteur uniquement. */
  function prLogo() {
    var h1 = document.querySelector('.cv-section--hero .cv-h1');
    if (!h1 || h1.parentNode.querySelector('.lc-pr-logo')) return;
    var img = document.createElement('img');
    img.className = 'lc-pr-logo'; img.src = LOGO; img.alt = 'Loan Connect';
    h1.parentNode.insertBefore(img, h1);
  }

  /* Mobile : les chiffres du hero passent sous l'illustration. */
  function prChiffres(ill) {
    var ch = document.querySelector('.cv-section--hero .cv-chiffres');
    if (!ch) return;
    var home = ch.parentNode, nx = ch.nextSibling, t = ill;
    while (t.parentElement && !t.parentElement.contains(ch)) t = t.parentElement;
    function place() {
      var m = window.innerWidth <= 767;
      if (m && t.nextSibling !== ch) t.parentNode.insertBefore(ch, t.nextSibling);
      if (!m && ch.parentNode !== home) home.insertBefore(ch, nx && nx.parentNode === home ? nx : null);
    }
    place(); window.addEventListener('resize', place);
  }

  var H_CHIPS = ['Immobilier', '1 – 5 M€', '24 – 48 mois', 'In fine'];
  var H_DEAL = [
    { n: 'Promotion résidentielle · Lyon', f: [['Montant', '3 M€'], ['Type', 'Immobilier'], ['Durée', '36 mois'], ['Remboursement', 'In fine']], g: [['Fiducie-sûreté', '≈ 12 000 €/an'], ['Hypothèque + Agency', '≈ 6 500 €/an']] },
    { n: 'Réhabilitation de bureaux · Lille', f: [['Montant', '1,8 M€'], ['Type', 'Immobilier'], ['Durée', '24 mois'], ['Remboursement', 'In fine']], g: [['Fiducie-sûreté', '≈ 9 500 €/an'], ['Hypothèque + Agency', '≈ 5 000 €/an']] }
  ];
  function champs(f) {
    return '<div class="lc-pr-champs">' + f.map(function (x) {
      return '<div class="lc-pr-champ"><span class="lc-pr-champ-k">' + x[0] + '</span><span class="lc-pr-champ-v">' + x[1] + '</span></div>';
    }).join('') + '</div>';
  }
  function prHero() {
    $$('[data-lc-anim="pr-hero"]').forEach(function (root) {
      var M = petitMobile(), deals = M ? H_DEAL.slice(0, 1) : H_DEAL;
      root.setAttribute('aria-hidden', 'true');
      root.innerHTML = '<div class="lc-ph"><div class="lc-ph-aplat"></div><div class="lc-ph-barre"></div><div class="lc-ph-pile">'
        + '<div class="lc-ph-carte lc-ph-crit"><div style="min-width:0"><span class="lc-ph-mono">VOS CRITÈRES</span><div class="lc-ph-tags">'
        + H_CHIPS.map(function (c) { return '<span class="lc-ph-tag">' + c + '</span>'; }).join('')
        + '</div></div><span class="lc-ph-live"><span class="lc-pr-pt"></span><span class="lc-ph-n">Recherche en cours</span></span></div>'
        + deals.map(function (d) {
          return '<div class="lc-ph-carte lc-ph-deal"><div class="lc-ph-haut"><span class="lc-ph-nom">' + d.n + '</span>'
            + champs(M ? d.f.slice(0, 3) : d.f) + '</div><div class="lc-ph-sp"><button type="button" class="lc-ph-sp-btn" tabindex="-1">'
            + '<span class="lc-ph-sp-g">' + ic(16, I_SHIELD, BLEU, ' style="flex:none"') + 'Security Package proposé</span>'
            + '<span class="lc-ph-sp-d"><span class="lc-ph-mono">INDICATIF</span>' + ic(16, I_CHEV, FONCE) + '</span></button>'
            + '<div class="lc-pli"><div><div class="lc-ph-sp-in">' + d.g.map(function (g) { return '<div class="lc-ph-g"><span>' + g[0] + '</span><span>' + g[1] + '</span></div>'; }).join('')
            + '</div></div></div></div></div>';
        }).join('')
        + '<div class="lc-ph-carte lc-ph-sk"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><i style="width:46%;height:9px;background:#DCE2DF"></i><i style="width:64px"></i></div>'
        + '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px"><i style="width:70%"></i><i style="width:80%"></i><i style="width:60%"></i><i style="width:75%"></i></div></div>'
        + '</div></div>';
      var n = $$('.lc-ph-n', root)[0], cartes = $$('.lc-ph-deal', root), sk = $$('.lc-ph-sk', root)[0];
      var sps = $$('.lc-ph-sp', root), touche = {};
      var t = 0, fin = 3200, AT = [200, 550];
      function rendu() {
        var k = AT.filter(function (a, i) { return i < cartes.length && t >= a; }).length + (!M && t >= 900 ? 1 : 0);
        n.textContent = k ? k + (k > 1 ? ' nouveaux dossiers' : ' nouveau dossier') : 'Recherche en cours';
        cartes.forEach(function (c, i) { var on = t >= AT[i]; c.style.opacity = on ? '1' : '0'; c.style.transform = on ? 'none' : 'translateY(10px)'; });
        if (sk) { var s = t >= 900; sk.style.opacity = s ? '1' : '0'; sk.style.transform = s ? 'none' : 'translateY(10px)'; }
        if (!touche[0] && sps[0]) sps[0].classList.toggle('lc-on', t >= 1500);
      }
      sps.forEach(function (sp, i) {
        $$('.lc-ph-sp-btn', sp)[0].addEventListener('click', function () { touche[i] = true; sp.classList.toggle('lc-on'); });
      });
      prChiffres(root);
      if (REDUCE) { t = fin; return rendu(); }
      rendu();
      var lance = false;
      function go() {
        if (lance) return; lance = true;
        var h = setInterval(function () { t += 50; rendu(); if (t >= fin) clearInterval(h); }, 50);
      }
      if (!M || !('IntersectionObserver' in window)) return go();
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { threshold: 0.3 });
      io.observe(root);
    });
  }

  var LEG = [[20, '#C9D3CF'], [13, '#A9C4CE'], [7, '#5FA3BD'], [3, '#007AA3']];
  function prEntonnoir() {
    $$('[data-lc-anim="pr-entonnoir"]').forEach(function (root) {
      var lignes = $$('.lc-pr-ligne', root), fin = $$('.lc-pr-fin', root)[0], boite = $$('.lc-pr-fin-boite', root)[0];
      if (boite && !boite.querySelector('img')) {
        var img = document.createElement('img'); img.src = LOGO; img.alt = 'Loan Connect'; boite.insertBefore(img, boite.firstChild);
      }
      if (fin && !fin.querySelector('.lc-pr-fleche')) {
        var col = boite ? boite.parentNode : fin, fl = document.createElement('span');
        fl.className = 'lc-pr-fleche'; fl.style.cssText = 'display:block;margin-left:14px';
        fl.innerHTML = ic(20, '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>', BLEU);
        col.insertBefore(fl, col.firstChild);
      }
      var carres = lignes.map(function (l) {
        var box = $$('.lc-pr-carres', l)[0];
        if (!box) return [];
        box.innerHTML = new Array(21).join('<i></i>');
        return $$('i', box);
      });
      var cs = REDUCE ? 3 : 0, enVue = false;
      function rendu() {
        lignes.forEach(function (l, i) {
          var on = i <= cs, leg = LEG[i] || LEG[3], prev = LEG[Math.max(0, i - 1)][0], nb = on ? leg[0] : prev, der = i === 3;
          var tx = $$('.lc-pr-ligne-texte', l)[0];
          if (tx) tx.style.opacity = on ? '1' : '.4';
          var num = $$('.lc-pr-num', l)[0]; if (num) num.style.color = der && on ? BLEU : '';
          var ti = $$('.lc-pr-ligne-titre', l)[0]; if (ti) ti.style.color = der && on ? FONCE : '';
          carres[i].forEach(function (q, k) {
            var vis = k < nb;
            q.style.background = on ? leg[1] : '#E6EAE8';
            q.style.opacity = vis ? '1' : '0';
            q.style.transform = vis ? 'none' : 'scale(.6)';
            q.style.transitionDelay = (on ? k * 10 : 0) + 'ms';
          });
        });
        if (fin) { var f = cs >= 3; fin.style.opacity = f ? '1' : '0'; fin.style.transform = f ? 'none' : 'translateY(10px)'; }
      }
      lignes.forEach(function (l, i) { l.addEventListener('click', function () { cs = i; rendu(); }); });
      rendu();
      if (REDUCE) return;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { enVue = es[0].isIntersecting; }, { threshold: 0.25 }).observe(root);
      else enVue = true;
      setInterval(function () { if (enVue && cs < 3) { cs++; rendu(); } }, 420);
    });
  }

  var SECT = ['Immobilier', 'Industrie', 'Services', 'Santé', 'Distribution', 'Technologies'], SECT_ON = { 0: 1400, 2: 1800, 3: 2200 };
  var DEALS = [{ at: 300, w: '64%', m: '1,8 M€ · 36 mois · Immobilier' }, { at: 1500, w: '48%', m: '650 k€ · 24 mois · Croissance' }, { at: 2700, w: '56%', m: '3,2 M€ · 48 mois · Refinancement' }];
  var S3_DOCS = ['Business plan', 'Bilans financiers', 'Dossier de garanties', 'Security Package'];
  function docs(n, mini) {
    var h = '';
    for (var k = 0; k < n; k++) h += '<span class="lc-pe-doc" style="background:' + GRIS + '">' + ic(mini ? 9 : 10, I_CHECK, 'currentColor', ' stroke-width="3" style="opacity:0"') + '</span>';
    return '<span class="lc-pe-docs">' + h + '</span>';
  }
  function bouton(el, on, txtOn, txtOff) {
    el.textContent = on ? txtOn : txtOff;
    el.style.background = on ? TEINTE : BLEU; el.style.color = on ? FONCE : '#fff'; el.style.borderColor = on ? TBORD : BLEU;
  }
  function relation(mini) {
    return '<div class="lc-pe-rel"><span style="font-weight:500">Vous</span><span class="lc-pe-trait"><i data-l="1"></i></span>'
      + '<span class="lc-pe-equipe">Équipe Loan Connect</span><span class="lc-pe-trait"><i data-l="2"></i></span><span style="font-weight:500">Emprunteur</span></div>';
  }
  /* Écrans du process : HTML + fonction de mise à jour selon st (ms écoulées dans l'étape). */
  var ECRANS = [
    function (mini) {
      var h = mini
        ? '<div class="lc-pm"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><span class="lc-ph-mono">TICKET CIBLE</span><span style="font-family:' + MONO_A + ';font-size:12px;color:#005A78">500 k€ – <span data-tk>1 M€</span></span></div>'
          + '<div style="position:relative;height:4px;background:#fff"><div class="lc-pe-plein" data-tkw></div></div>'
          + '<div class="lc-pe-chips" style="gap:6px">' + SECT.map(function (s) { return '<span class="lc-pe-chip" data-sect>' + s + '</span>'; }).join('') + '</div></div>'
        : '<div class="lc-pe lc-in"><div class="lc-pe-tete"><span class="lc-pe-titre">Votre profil investisseur</span><span class="lc-ph-mono">ÉTAPE 1/3</span></div><div class="lc-pe-corps">'
          + '<div class="lc-pe-bloc"><span class="lc-ph-mono">TICKET CIBLE</span><div class="lc-pe-rail"><div class="lc-pe-plein" data-tkw></div><span class="lc-pe-bouton" style="left:12%"></span><span class="lc-pe-bouton" data-tkr style="box-shadow:0 2px 6px rgba(0,122,163,.35)"></span></div>'
          + '<div class="lc-pe-bornes"><span>500 k€</span><span style="color:#005A78" data-tk>1 M€</span></div></div>'
          + '<div class="lc-pe-bloc"><span class="lc-ph-mono">SECTEURS</span><div class="lc-pe-chips">' + SECT.map(function (s) { return '<span class="lc-pe-chip" data-sect>' + s + '</span>'; }).join('') + '</div></div>'
          + '<div class="lc-pe-bloc"><span class="lc-ph-mono">ZONE GÉOGRAPHIQUE</span><div class="lc-pe-chips"><span class="lc-pe-chip" data-zone="2700">France</span><span class="lc-pe-chip" data-zone="3100">Union européenne</span></div></div>'
          + '<div class="lc-pe-btn" data-b1 style="margin-top:auto;height:44px">Enregistrer mon profil</div></div></div>';
      return { html: h, maj: function (box, st) {
        var p = ease(clamp((st - 300) / 1300));
        $$('[data-tk]', box).forEach(function (e) { e.textContent = (1 + p * 4).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M€'; });
        $$('[data-tkw]', box).forEach(function (e) { e.style.width = (p * 54).toFixed(1) + '%'; });
        $$('[data-tkr]', box).forEach(function (e) { e.style.left = (12 + p * 54).toFixed(1) + '%'; });
        $$('[data-sect]', box).forEach(function (e, i) { chip(e, SECT_ON[i] !== undefined && st >= SECT_ON[i]); });
        $$('[data-zone]', box).forEach(function (e) { chip(e, st >= +e.getAttribute('data-zone')); });
        $$('[data-b1]', box).forEach(function (e) { bouton(e, st >= 3900, '✓ Profil actif', 'Enregistrer mon profil'); });
      } };
    },
    function (mini) {
      var h = mini
        ? '<div class="lc-pm">' + DEALS.slice(0, 2).map(function (d) {
          return '<div class="lc-pm-dossier lc-in" data-at="' + d.at + '"><span style="display:flex;flex-direction:column;gap:4px;min-width:0"><span style="font-family:' + MONO_A + ';font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + d.m + '</span>'
            + '<span class="lc-pe-gar" style="opacity:0">Garanties recommandées</span></span>' + docs(3, true) + '</div>';
        }).join('') + '</div>'
        : '<div class="lc-pe lc-in"><div class="lc-pe-tete"><span class="lc-pe-titre">Dossiers pour votre profil</span><span class="lc-pe-pastille"><span class="lc-pr-pt"></span><span data-cnt>0 nouveau</span></span></div><div style="display:flex;flex-direction:column;padding:6px 0">'
          + DEALS.map(function (d) {
            return '<div class="lc-pe-dossier lc-in" data-at="' + d.at + '"><div class="lc-pe-ico">' + ic(18, I_DOC) + '</div><div style="display:flex;flex-direction:column;gap:7px;min-width:0"><span style="display:block;width:' + d.w + ';height:8px;background:#DCE2DF;border-radius:2px"></span><span style="font-family:' + MONO_A + ';font-size:12px;color:#4A5550">' + d.m + '</span></div>'
              + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">' + docs(3) + '<span class="lc-pe-gar" style="opacity:0">Garanties recommandées</span></div></div>';
          }).join('') + '</div><div class="lc-pe-pied"><span style="width:10px;height:10px;border-radius:2px;background:#007AA3"></span>Mémorandum · Prévisionnel · Juridique</div></div>';
      return { html: h, maj: function (box, st) {
        var n = 0;
        $$('[data-at]', box).forEach(function (row) {
          var at = +row.getAttribute('data-at'), on = st >= at;
          row.style.display = on ? '' : 'none'; if (on) n++;
          $$('.lc-pe-doc', row).forEach(function (dc, k) { var d = st >= at + 400 + k * 200; dc.style.background = d ? BLEU : GRIS; dc.firstChild.style.opacity = d ? '1' : '0'; });
          $$('.lc-pe-gar', row).forEach(function (g) { g.style.opacity = st >= at + 1100 ? '1' : '0'; });
        });
        $$('[data-cnt]', box).forEach(function (e) { e.textContent = n + ' nouveau' + (n > 1 ? 'x' : ''); });
      } };
    },
    function (mini) {
      var h = mini
        ? '<div class="lc-pm"><span class="lc-pe-btn" data-b3 style="align-self:flex-start;height:32px;padding:0 12px;font-size:12px">Signaler mon intérêt</span>' + relation(true)
          + '<span class="lc-pe-fade" data-rel style="font-size:12px;line-height:1.4;color:#4A5550;opacity:0">Votre interlocuteur Loan Connect revient vers vous pour organiser l\'échange.</span></div>'
        : '<div class="lc-pe lc-in"><div style="padding:16px 20px;display:flex;flex-direction:column;gap:12px;border-bottom:1px solid #DCE2DF">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><span class="lc-ph-nom">Promotion résidentielle · Lyon</span><span style="flex:none;font-size:11px;color:#005A78;display:inline-flex;align-items:center;gap:5px">' + ic(12, I_CHECK, BLEU) + 'Dossier vérifié</span></div>'
          + champs(H_DEAL[0].f) + '<span class="lc-pe-btn" data-b3 style="align-self:flex-start;height:36px;padding:0 14px;font-size:13px">Signaler mon intérêt</span></div>'
          + '<div style="padding:14px 20px;display:flex;flex-direction:column;border-bottom:1px solid #DCE2DF"><span class="lc-ph-mono" style="padding-bottom:6px">ACCÈS AU DOSSIER COMPLET</span>'
          + S3_DOCS.map(function (d, k) { return '<div class="lc-pe-ligne" data-doc="' + (900 + k * 220) + '"><span>' + d + '</span><span style="display:grid;place-items:center;width:20px;height:20px" data-ic></span></div>'; }).join('')
          + '</div><div data-relbg style="padding:14px 20px 18px;display:flex;flex-direction:column;gap:12px;flex:1;transition:background .3s"><span class="lc-ph-mono">MISE EN RELATION</span>' + relation(false)
          + '<div class="lc-pe-fade" data-rel style="display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(6px)"><span style="width:28px;height:28px;flex:none;border-radius:50%;background:#EEF6F9;border:1px solid #B8D8E6;display:grid;place-items:center;color:#005A78">' + ic(15, I_USER) + '</span>'
          + '<span style="font-size:12px;line-height:1.4;color:#4A5550">Votre interlocuteur Loan Connect revient vers vous pour organiser l\'échange.</span></div></div></div>';
      return { html: h, maj: function (box, st) {
        $$('[data-b3]', box).forEach(function (e) { bouton(e, st >= 650, '✓ Intérêt signalé', 'Signaler mon intérêt'); e.style.transform = st >= 500 && st < 650 ? 'scale(.94)' : 'none'; });
        $$('[data-doc]', box).forEach(function (row) {
          var on = st >= +row.getAttribute('data-doc'), icn = row.querySelector('[data-ic]');
          if (row.getAttribute('data-on') !== String(on)) { row.setAttribute('data-on', String(on)); icn.innerHTML = ic(15, on ? I_CHECK : I_LOCK); }
          row.firstChild.style.color = on ? '#081412' : '#7A8682'; icn.style.color = on ? BLEU : '#B5BDB8';
        });
        $$('[data-l="1"]', box).forEach(function (e) { e.style.transform = 'scaleX(' + (st >= 1900 ? 1 : 0) + ')'; });
        $$('[data-l="2"]', box).forEach(function (e) { e.style.transform = 'scaleX(' + (st >= 2250 ? 1 : 0) + ')'; });
        $$('[data-rel]', box).forEach(function (e) { var on = st >= 2600; e.style.opacity = on ? '1' : '0'; if (e.tagName === 'DIV') e.style.transform = on ? 'none' : 'translateY(6px)'; });
        $$('[data-relbg]', box).forEach(function (e) { e.style.background = st >= 1900 ? '#F4F9FB' : '#fff'; });
      } };
    }
  ];

  function prProcess() {
    $$('[data-lc-anim="pr-process"]').forEach(function (sec) {
      var sticky = $$('.lc-pr-process-sticky', sec)[0] || sec, etapes = $$('.lc-pr-etape', sec);
      var plein = $$('.lc-pr-rail-plein', sec)[0], ecran = $$('.lc-pr-ecran', sec)[0], cta = $$('.lc-pr-process-cta', sec)[0];
      var etat = { p: 0, st: 0, auto: 0, actif: -1, mob: false, pin: false, vis: false, ecr: null, minis: [] };
      function mesure() {
        var mob = window.innerWidth <= 760, h = window.innerHeight;
        var pin = mob ? h >= 640 : (window.innerWidth >= 900 && h >= 640);
        if (pin === etat.pin && mob === etat.mob && etat.actif >= 0) return;
        etat.pin = pin; etat.mob = mob; etat.st = 0;
        sec.style.height = pin ? (mob ? '260vh' : '300vh') : 'auto';
        sec.classList.toggle('lc-pr-epingle', pin);
        sticky.style.position = pin ? 'sticky' : 'static';
        sticky.style.top = pin ? '72px' : '';
        sticky.style.height = pin ? 'calc(100vh - 72px)' : 'auto';
        sticky.style.minHeight = pin && !mob ? '600px' : '0';
        if (cta) cta.style.display = mob && pin ? 'none' : '';
        etat.actif = -1; scroll(); rendu(true);
      }
      function prog() {
        var r = sec.getBoundingClientRect(), vh = window.innerHeight;
        return clamp((72 - r.top) / Math.max(1, r.height - (vh - 72)));
      }
      function actifDe(p) { return p < 0.34 ? 0 : p < 0.67 ? 1 : 2; }
      function scroll() {
        if (!etat.pin) return;
        var p = prog();
        if (actifDe(p) !== actifDe(etat.p)) etat.st = 0;
        etat.p = p; rendu();
      }
      function rendu(force) {
        var a = etat.pin ? actifDe(etat.p) : etat.auto, chg = a !== etat.actif;
        if (plein) plein.style.height = (etat.pin ? etat.p * 100 : (etat.auto + etat.st / 6500) / 3 * 100).toFixed(1) + '%';
        if (chg || force) {
          etat.actif = a;
          etapes.forEach(function (e, i) {
            e.classList.toggle('lc-on', i === a);
            e.style.opacity = i === a ? '1' : '.45';
            var pt = $$('.lc-pr-point', e)[0];
            if (pt) { pt.style.background = i <= a ? BLEU : '#fff'; pt.style.boxShadow = '0 0 0 1px ' + (i <= a ? BLEU : GRIS); }
            var mini = $$('.lc-pr-mini', e)[0];
            if (mini) {
              if (etat.mob && i === a) { var m = ECRANS[i](true); mini.innerHTML = m.html; etat.minis[i] = m; }
              else { mini.innerHTML = ''; etat.minis[i] = null; }
            }
          });
          if (ecran && !etat.mob) { etat.ecr = ECRANS[a](false); ecran.innerHTML = etat.ecr.html; }
        }
        var st = REDUCE ? 5000 : etat.st;
        if (ecran && etat.ecr && !etat.mob) etat.ecr.maj(ecran, st);
        etapes.forEach(function (e, i) { var m = etat.minis[i]; if (m) m.maj($$('.lc-pr-mini', e)[0], st); });
      }
      etapes.forEach(function (e, i) {
        e.addEventListener('click', function () {
          if (!etat.pin) { etat.auto = i; etat.st = 0; return rendu(); }
          var top = sec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top - 72 + (sec.offsetHeight - window.innerHeight + 72) * (i / 3 + 0.12), behavior: REDUCE ? 'auto' : 'smooth' });
        });
      });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { etat.vis = es[0].isIntersecting; }, { threshold: 0.25 }).observe(sec);
      else etat.vis = true;
      window.addEventListener('scroll', scroll, { passive: true });
      window.addEventListener('resize', mesure);
      mesure();
      if (REDUCE) return;
      setInterval(function () {
        if (!etat.vis) return;
        etat.st = (etat.st + 100) % 6500;
        if (etat.st === 0 && !etat.pin) etat.auto = (etat.auto + 1) % 3;
        rendu();
      }, 100);
    });
  }

  /* Comparateur : 7e champ des scénarios = nom de la garantie 1 ; libellé « Actif » (data-lc-libelle). */
  function prComparateur() {
    $$('[data-lc-anim="pr-sp"] [data-cv-anim="comparateur"]').forEach(function (root) {
      var S = (root.getAttribute('data-cv-scenarios') || '').split(';').map(function (s) { return s.split('|').map(function (x) { return x.trim(); }); });
      var lib = root.closest('[data-lc-anim="pr-sp"]').getAttribute('data-lc-libelle');
      var libs = $$('.cv-comp-champ-libelle', root);
      if (lib && libs[2]) libs[2].textContent = lib;
      var m = $$('.cv-comp-champs .cv-comp-champ-valeur', root)[0], g = $$('.cv-comp-ligne .cv-comp-ligne-gauche .cv-comp-champ-valeur', root)[0];
      if (!m || !g) return;
      function maj() { S.forEach(function (s) { if (s[0] === m.textContent.trim() && s[6] && g.textContent !== s[6]) g.textContent = s[6]; }); }
      new MutationObserver(maj).observe(m, { childList: true, characterData: true, subtree: true });
      maj();
    });
  }

  /* Bloc RDV : étape e-mail (mini calendrier décoratif), puis calendrier HubSpot avec l'e-mail pré-rempli. */
  function prRdv(root, tpl) {
    var J = [['13'], ['14'], ['15', 'd'], ['16'], ['17', 'd'], ['20', 'd'], ['21', 's'], ['22'], ['23', 'd'], ['24']];
    var form = document.createElement('form');
    form.className = 'lc-pr-rdv'; form.noValidate = false;
    form.innerHTML = '<div aria-hidden="true" class="lc-pr-mcal"><div style="display:flex;flex-direction:column;gap:8px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:500"><span>Octobre</span><span style="display:flex;gap:6px;color:#005A78">' + ic(12, '<path d="m15 18-6-6 6-6"/>') + ic(12, '<path d="m9 18 6-6-6-6"/>') + '</span></div>'
      + '<div class="lc-pr-mcal-j" style="font-family:' + MONO_A + ';font-size:9px;color:#7A8682"><b style="font-weight:400">L</b><b style="font-weight:400">M</b><b style="font-weight:400">M</b><b style="font-weight:400">J</b><b style="font-weight:400">V</b></div>'
      + '<div class="lc-pr-mcal-j">' + J.map(function (j) { return '<span class="' + (j[1] ? 'lc-' + j[1] : '') + '">' + j[0] + '</span>'; }).join('') + '</div></div>'
      + '<div class="lc-pr-mcal-h"><span style="border:0;background:none;padding:0;text-align:left;font-size:11px;font-weight:500;color:#081412">Mar. 21</span><span>09:30</span><span class="lc-s">10:00</span><span>14:30</span></div></div>'
      + '<div style="display:flex;flex-direction:column;gap:10px"><span style="font-family:' + MONO_A + ';font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#005A78">Prise de rendez-vous · 30 min</span>'
      + '<span style="font-family:' + TITRES_A + ';font-size:30px;line-height:1.1;letter-spacing:-.02em">Rencontrons-nous</span>'
      + '<span style="font-size:15px;line-height:1.55;color:#4A5550">Indiquez votre e-mail professionnel, puis choisissez un créneau avec un expert Loan Connect.</span></div>'
      + '<label>Adresse e-mail professionnelle<input type="email" name="email" required autocomplete="email" placeholder="prenom.nom@societe.fr"></label>'
      + '<button type="submit">Choisir un créneau ' + fleche(16) + '</button>';
    var cal = document.createElement('div');
    cal.className = 'lc-pr-cal'; cal.style.display = 'none';
    cal.innerHTML = '<div class="lc-pr-cal-barre"><span></span><button type="button">Modifier</button></div>';
    var frame = document.createElement('iframe');
    frame.title = 'Choisir un créneau avec un expert Loan Connect';
    frame.style.cssText = 'display:block;width:100%;height:680px;border:0';
    hauteur(frame);
    cal.appendChild(frame);
    root.appendChild(form); root.appendChild(cal);
    var input = form.querySelector('input'), mail = cal.querySelector('span');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input.checkValidity()) { input.reportValidity(); return; }
      var v = input.value.trim(), u = new URL(withParams(tpl, true));
      u.searchParams.set('email', v);
      mail.textContent = v; frame.src = u.toString();
      form.style.display = 'none'; cal.style.display = 'flex';
    });
    cal.querySelector('button').addEventListener('click', function () { cal.style.display = 'none'; form.style.display = ''; input.focus(); });
  }

  function preteur() {
    if (!document.querySelector('[data-lc-anim^="pr-"]')) return;
    prLogo(); prHero(); prEntonnoir(); prProcess(); prComparateur();
    /* Navigation : « Prêteurs » actif (lien URL du header partagé). */
    $$('.lc-site-nav-lien, .lc-site-menu-lien').forEach(function (a) { if (samePage(a)) { a.classList.add('w--current'); a.setAttribute('aria-current', 'page'); } });
    $$('.lc-pr-sp-lien').forEach(function (a) { if (!a.querySelector('svg')) a.insertAdjacentHTML('beforeend', ic(16, '<path d="M5 12h14M13 6l6 6-6 6"/>')); });
  }

  /* ---------- Démarrage ---------- */
  function init() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    dossiers();
    preteurs();
    preteur();
    calendriers();
    decorateLinks();
    /* Les déclencheurs s'ouvrent sur place : jamais dans un nouvel onglet. */
    $$('a[href*="#lc-"], a[href*="#contact"], a[href*="/meetings/"]').forEach(function (a) { if (action(a)) a.removeAttribute('target'); });
    /* CTA d'inscription de la page : même onglet (le composant RDV partagé avec les LP impose _blank). */
    $$('a[href*="connect.covalt.eu"]').forEach(function (a) { a.removeAttribute('target'); });

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var act = action(a);
      if (!act) return;
      e.preventDefault(); e.stopPropagation();
      if (act === 'projet' || act === 'compte') ouvrirProfil(act);
      else ouvrirRdv(act === 'meetings' ? a.href : CAL);
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ouvert) fermer(); });

    /* Arrivée avec un hash (liens du footer depuis les autres pages Loan Connect). */
    var h = location.hash;
    var auto = h === '#lc-profil-projet' ? 'projet' : h === '#lc-profil-compte' ? 'compte' : h === '#lc-rdv' ? 'rdv' : '';
    if (auto) {
      history.replaceState(null, '', location.pathname + location.search);
      if (auto === 'rdv') ouvrirRdv(CAL); else ouvrirProfil(auto);
    }

    /* Cookie lc_attr posé par GTM après coup, ou consentement HubSpot donné ensuite. */
    if (!fromUrl && !attr) window.addEventListener('load', function () { attr = readAttr(); if (attr) { decorateLinks(); rafraichirCalendriers(); } });
    window._hsp = window._hsp || [];
    window._hsp.push(['addPrivacyConsentListener', function (consent) {
      if (!consent || !consent.allowed) return;
      setTimeout(function () {
        if (!/(?:^|;\s*)hubspotutk=/.test(document.cookie)) return;
        frames.forEach(function (f) { if (f.src.indexOf('parentHubspotUtk') === -1) f.src = withParams(f.getAttribute('data-tpl'), true); });
      }, 800);
    }]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
