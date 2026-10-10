/* Header: ONE control. [current page v] opens: theme, pages, account, Espace CFA.
   Identical on every CFA page. Account state comes from Supabase here, not from page scripts. */
(function () {
  var me = document.currentScript;
  var BASE = (me && me.src) ? me.src.replace(/js\/cfa-nav-dropdown\.js.*$/, '') : '';

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function clean(t) { return (t || '').replace(/\s+/g, ' ').trim(); }
  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
    });
  }
  function getClient() {                       /* uses the page's client, or loads Supabase when the page has none */
    if (window.cfaSupabase) return Promise.resolve(window.cfaSupabase);
    if (!BASE) return Promise.resolve(null);
    var chain = window.supabase ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    return chain.then(function () { return loadScript(BASE + 'js/supabase.js'); })
      .then(function () { return window.cfaSupabase || null; })
      .catch(function () { return null; });
  }

  ready(function () {
    var right = document.querySelector('header .nav-right');
    if (!right || document.getElementById('cfa-navdd')) return;
    var brand = document.querySelector('header .brand');
    var rel = brand ? (brand.getAttribute('href') || '').replace(/index\.html.*$/, '') : '';
    var here = location.pathname.split('/').pop() || 'index.html';
    var theme = document.getElementById('themeToggle');
    if (theme) theme.style.setProperty('display', 'none', 'important');   /* kept in the page for the theme script */

    var wrap = document.createElement('div');
    wrap.id = 'cfa-navdd'; wrap.className = 'cfa-navdd';
    wrap.innerHTML =
      '<button type="button" class="cfa-navdd-btn" id="cfa-navdd-btn" aria-expanded="false" aria-controls="cfa-navdd-panel">' +
        '<span class="cfa-navdd-label">Menu</span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="cfa-navdd-panel" id="cfa-navdd-panel" hidden></div>';
    right.insertBefore(wrap, theme && theme.parentNode === right ? theme : null);

    var btn = wrap.querySelector('.cfa-navdd-btn');
    var label = wrap.querySelector('.cfa-navdd-label');
    var panel = wrap.querySelector('.cfa-navdd-panel');
    var user = null, accountReady = false, lastSig = '';

    function logout() {
      getClient().then(function (c) { return c ? c.auth.signOut() : null; })
        .catch(function () {})
        .then(function () { location.href = rel + 'index.html'; });
    }

    function items() {
      var out = [];
      var navLinks = Array.from(
        document.querySelectorAll('header .nav-right > nav a')
      );

      function findLink(test, fallback) {
        var a = navLinks.find(function (link) {
          return test(
            clean(link.textContent),
            link.getAttribute('href') || ''
          );
        });
        return a ? a.getAttribute('href') : fallback;
      }

      function addPage(text, href, file) {
        var current = here === file;

        if (here === 'index.html') {
          if (text === 'Accueil') {
            current = !location.hash || location.hash === '#accueil';
          } else if (text === 'Cours') {
            current = location.hash === '#cours';
          } else if (text === 'Ressources') {
            current = location.hash === '#ressources';
          }
        }

        out.push({
          text: text,
          href: href,
          current: current
        });
      }

      if (accountReady && user) {
        var hour = new Date().getHours();
        var greeting = hour >= 5 && hour < 12 ? 'Bonjour'
          : hour >= 12 && hour < 18 ? 'Bon après-midi' : 'Bonsoir';
        var rawName = (user.user_metadata && (
          user.user_metadata.first_name || user.user_metadata.full_name
        )) || (user.email ? user.email.split('@')[0] : 'COLLINS');
        var name = String(rawName).trim().toUpperCase();
        out.push({ note: true, text: greeting + ', ' + name });
      }

      addPage(
        'Accueil',
        findLink(function (text, href) {
          return /^accueil$/i.test(text) || /(^|\/)index\.html(?:$|[?#])/i.test(href);
        }, rel + 'index.html#accueil'),
        'index.html'
      );

      addPage(
        'Cours',
        findLink(function (text, href) {
          return /^cours$/i.test(text) || /#cours(?:$|[&])/i.test(href);
        }, rel + 'index.html#cours'),
        'cours.html'
      );

      addPage(
        'Ressources',
        findLink(function (text, href) {
          return /^ressources?$/i.test(text) || /#ressources(?:$|[&])/i.test(href);
        }, rel + 'index.html#ressources'),
        'index.html'
      );

      addPage(
        'À propos',
        findLink(function (text, href) {
          return /à propos|a propos/i.test(text) || /apropos\.html/i.test(href);
        }, rel + 'pages/apropos.html'),
        'apropos.html'
      );

      if (accountReady) {
        if (user) {
          out.push({ text: 'Déconnexion', action: logout });
        } else {
          out.push({
            text: 'Connexion',
            href: rel + 'pages/connexion.html',
            current: here === 'connexion.html'
          });
        }
      }

      out.push({
        text: 'Espace CFA',
        href: rel + 'pages/choix-espace.html',
        current: here === 'choix-espace.html'
      });

      return out;
    }

    function build() {
      var list = items();
      var themeText = '';
      if (theme) {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          || document.documentElement.classList.contains('dark');
        themeText = isDark ? 'Mode clair' : 'Mode sombre';
      }
      var sig = themeText + '#' + JSON.stringify(list.map(function (i) { return [i.text, i.href || '', !!i.current, !!i.note]; }));
      if (sig === lastSig) return;                 /* nothing changed: stops observer loops */
      lastSig = sig;
      panel.textContent = '';
      if (theme) {                                 /* theme first, above the pages */
        var tb = document.createElement('button');
        tb.type = 'button'; tb.className = 'cfa-navdd-theme'; tb.textContent = themeText;
        tb.addEventListener('click', function () { theme.click(); setTimeout(build, 60); setTimeout(build, 500); });
        panel.appendChild(tb);
      }
      var cur = '';
      list.forEach(function (it) {
        if (it.current && !cur) cur = it.text;
        var el;
        if (it.note) { el = document.createElement('div'); el.className = 'cfa-navdd-note'; }
        else if (it.href) { el = document.createElement('a'); el.setAttribute('href', it.href); }
        else { el = document.createElement('button'); el.type = 'button'; el.addEventListener('click', it.action); }
        el.textContent = it.text;
        if (it.current) el.setAttribute('aria-current', 'page');
        panel.appendChild(el);
      });
      var pageNames = {
        'index.html': 'Accueil',
        'cours.html': 'Cours',
        'apropos.html': 'À propos',
        'choix-espace.html': 'Espace CFA',
        'communaute.html': 'Communauté',
        'compas.html': 'COMPAS',
        'connexion.html': 'Connexion',
        'espace-etudiant.html': 'Espace étudiant',
        'inscription.html': 'Inscription',
        'ma-progression.html': 'Ma progression',
        'mes-cours.html': 'Mes cours',
        'mot-de-passe-oublie.html': 'Réinitialisation',
        'nouveau-mot-de-passe.html': 'Nouveau mot de passe',
        'sinscrire.html': "S'inscrire",
        'suggestions.html': 'Suggestions'
      };
      if (here === 'index.html' && location.hash === '#cours') cur = 'Cours';
      if (here === 'index.html' && location.hash === '#ressources') cur = 'Ressources';
      label.textContent = cur || pageNames[here] || 'Menu';
    }

    function open() { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    function close(focusBtn) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focusBtn) btn.focus(); }

    btn.addEventListener('click', function (e) { e.stopPropagation(); if (panel.hidden) open(); else close(); });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a, button')) close(); });
    wrap.addEventListener('focusout', function (e) { if (e.relatedTarget && !wrap.contains(e.relatedTarget)) close(); });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); close(true); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var els = panel.querySelectorAll('a, button'); if (!els.length) return;
      e.preventDefault(); if (panel.hidden) open();
      var i = Array.prototype.indexOf.call(els, document.activeElement);
      i = e.key === 'ArrowDown' ? (i + 1) % els.length : (i <= 0 ? els.length - 1 : i - 1);
      els[i].focus();
    });

    var pending = false;
    function later() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; build(); }); }
    build();
    var mo = new MutationObserver(later);
    var nav = document.querySelector('header .nav-right > nav');
    if (nav) mo.observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    if (theme) mo.observe(theme, { subtree: true, childList: true, characterData: true });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    setTimeout(build, 400);

    getClient().then(function (c) {
      if (!c) return null;
      return c.auth.getSession().then(function (r) {
        user = (r && r.data && r.data.session && r.data.session.user) || null;
      });
    }).catch(function () {}).then(function () { accountReady = true; build(); });
    setTimeout(function () { if (!accountReady) { accountReady = true; build(); } }, 5000);
  });
})();
