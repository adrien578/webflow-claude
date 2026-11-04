/* Loan Connect Home : UTM, calendrier intégré, popup de choix de profil, popup de rendez-vous.
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
  function action(a) {
    var h = a.hash || '';
    if (samePage(a)) {
      if (h === '#lc-profil-projet') return 'projet';
      if (h === '#lc-profil-compte') return 'compte';
      if (h === '#lc-rdv' || h === '#contact') return 'rdv';
    }
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

  /* ---------- Démarrage ---------- */
  function init() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    calendriers();
    decorateLinks();
    /* Les déclencheurs s'ouvrent sur place : jamais dans un nouvel onglet. */
    $$('a[href*="#lc-"], a[href*="#contact"], a[href*="/meetings/"]').forEach(function (a) { if (action(a)) a.removeAttribute('target'); });

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
