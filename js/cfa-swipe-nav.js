/* Swipe left/right (touch screens) = go to the next/previous header button */
(function () {
  var MIN_X = 70, MAX_MS = 700;
  var sx = 0, sy = 0, st = 0, skip = false;

  function fileOf(u) { return u.pathname.split('/').pop() || 'index.html'; }
  function links() {
    return Array.prototype.slice.call(document.querySelectorAll('header .nav-right > nav a, header .account-links a[href$="connexion.html"]'))
      .filter(function (a) { return a.getAttribute('href'); });
  }
  function drawerOpen() {
    var d = document.getElementById('site-mobile-drawer');
    return !!d && (d.getAttribute('aria-hidden') === 'false' || /open|active|show/i.test(d.className));
  }
  /* Do not steal swipes from forms, sliders or sideways-scrolling tables */
  function blocked(el) {
    while (el && el !== document.body && el.nodeType === 1) {
      if (/^(INPUT|TEXTAREA|SELECT|VIDEO|IFRAME)$/.test(el.tagName) || el.isContentEditable) return true;
      var cs = getComputedStyle(el);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 2) return true;
      el = el.parentElement;
    }
    return false;
  }
  function go(a) {
    var u = new URL(a.href, location.href);
    if (fileOf(u) === fileOf(location) && u.hash) {
      var t = document.getElementById(u.hash.slice(1));
      if (t) {
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', u.hash);
        return;
      }
    }
    location.href = u.href;
  }

  document.addEventListener('touchstart', function (e) {
    skip = e.touches.length !== 1 || drawerOpen() || blocked(e.target);
    if (skip) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (skip || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Date.now() - st > MAX_MS || Math.abs(dx) < MIN_X || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    var list = links();
    var i = -1;
    list.forEach(function (a, n) { if (a.getAttribute('aria-current') === 'page') i = n; });
    if (i < 0) return;                                 /* page is not one of the header buttons */
    var next = dx < 0 ? i + 1 : i - 1;                 /* swipe left = next, right = previous */
    if (next >= 0 && next < list.length) go(list[next]);
  }, { passive: true });
})();
