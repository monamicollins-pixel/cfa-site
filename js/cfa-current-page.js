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
