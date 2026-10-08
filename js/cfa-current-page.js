/* Marks the header/menu link for the current page, and on index.html
   for the section you are looking at (accueil, cours, ressources). */
(function () {
  var SELECTOR = 'header .nav a, .cfa-mobile-link, .cfa-mobile-login';
  var SECTIONS = ['accueil', 'cours', 'ressources'];

  function fileOf(u) { return u.pathname.split('/').pop() || 'index.html'; }
  var here = fileOf(location);
  var onHome = here === 'index.html';
  /* Pages that belong to the Ressources section of the homepage */
  var RESOURCE_PAGES = ['compas.html'];
  function isResourcePage() {
    return RESOURCE_PAGES.indexOf(here) > -1 || /facile/i.test(document.title);
  }
  var currentId = 'accueil';

  function mark() {
    document.querySelectorAll(SELECTOR).forEach(function (a) {
      if (a.classList.contains('brand') || a.classList.contains('logo-container')) return;
      var href = a.getAttribute('href');
      if (!href) return;
      var u = new URL(href, location.href);
      var ok = fileOf(u) === here;
      if (!ok && !onHome && isResourcePage() && fileOf(u) === 'index.html' && u.hash === '#ressources') ok = true;
      if (ok && onHome) ok = (u.hash || '#accueil') === '#' + currentId;
      if (ok) {
        a.setAttribute('aria-current', 'page');
        a.style.setProperty('background', '#C8102E', 'important');
        a.style.setProperty('color', '#fff', 'important');
      } else {
        a.removeAttribute('aria-current');
        a.style.removeProperty('background');
        a.style.removeProperty('color');
      }
    });
  }

  function spy() {
    if (!onHome) return;
    var id = 'accueil';
    var last = null;
    SECTIONS.forEach(function (s) {
      var el = document.getElementById(s);
      if (!el) return;
      last = s;
      if (el.getBoundingClientRect().top <= 140) id = s;
    });
    if (last && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = last;
    if (id !== currentId) { currentId = id; mark(); }
  }

  function start() {
    mark();
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('hashchange', function () { setTimeout(spy, 150); });
    setTimeout(spy, 200);
    var h = document.querySelector('header');
    if (h) new MutationObserver(mark).observe(h, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* Phone menu: same font on every item (links and the Theme button) */
(function () {
  var SEL = '#site-mobile-drawer .cfa-mobile-link, #site-mobile-drawer .cfa-mobile-login, #site-mobile-drawer .cfa-mobile-theme';
  function fix() {
    document.querySelectorAll(SEL).forEach(function (e) {
      e.style.setProperty('font-weight', '700', 'important');
      e.style.setProperty('font-size', '14px', 'important');
      e.style.setProperty('font-family', 'inherit', 'important');
      e.style.setProperty('letter-spacing', '0', 'important');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix); else fix();
  var d = document.getElementById('site-mobile-drawer');
  if (d) new MutationObserver(fix).observe(d, { childList: true, subtree: true });
})();

/* Header takes the page's real background colour, in both themes */
(function () {
  var root = document.documentElement;
  function paint() {
    var els = [document.body, root];
    for (var i = 0; i < els.length; i++) {
      var c = els[i] && getComputedStyle(els[i]).backgroundColor;
      if (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') { root.style.setProperty('--cfa-page-bg', c); return; }
    }
    root.style.setProperty('--cfa-page-bg', '#fff');
  }
  function later() { paint(); setTimeout(paint, 450); }   /* themes fade, so read again after the fade */
  function start() {
    later();
    var o = new MutationObserver(later);
    o.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    o.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#themeToggle, #drawer-theme-toggle')) later(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
