/* Scrolling past the bottom/top of a page moves to the next/previous header button:
   Accueil > Cours > Ressources > A propos > Connexion.
   First push shows a hint, a second push within 4 s goes there. */
(function () {
  var GAP = 900, ARM = 4000;
  var armed = { 1: 0, '-1': 0 }, lastTry = 0, tsY = 0, tsX = 0, tsDir = 0;

  function fileOf(u) { return u.pathname.split('/').pop() || 'index.html'; }
  function links() {
    return Array.prototype.slice.call(document.querySelectorAll(
      'header .nav-right > nav a, header .account-links a[href$="connexion.html"]'
    )).filter(function (a) { return a.getAttribute('href'); });
  }
  function atBottom() { return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4; }
  function atTop() { return window.scrollY <= 0; }
  function drawerOpen() {
    var d = document.getElementById('site-mobile-drawer');
    return !!d && (d.getAttribute('aria-hidden') === 'false' || /open|active|show/i.test(d.className));
  }
  function inField(t) { return /^(INPUT|TEXTAREA|SELECT)$/.test((t || {}).tagName || ''); }

  /* dir = 1 next page, -1 previous page (skips links that stay on the same file) */
  function adjacent(dir) {
    var list = links(), cur = -1;
    list.forEach(function (a, n) { if (a.getAttribute('aria-current') === 'page') cur = n; });
    if (cur < 0) return null;
    var here = fileOf(new URL(list[cur].href, location.href));
    for (var i = cur + dir; i >= 0 && i < list.length; i += dir) {
      if (fileOf(new URL(list[i].href, location.href)) !== here) return list[i];
    }
    return null;
  }
  function toast(text) {
    var old = document.getElementById('cfa-scroll-hint');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'cfa-scroll-hint'; t.setAttribute('role', 'status'); t.textContent = text;
    t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);z-index:1100;' +
      'background:#174ea6;color:#fff;font:700 14px/1.3 sans-serif;padding:10px 14px;' +
      'border-radius:10px;max-width:90%;text-align:center;' +
      'bottom:calc(16px + env(safe-area-inset-bottom,0px));';
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2500);
  }
  function attempt(dir) {
    var now = Date.now();
    if (now - lastTry < GAP) return;                 /* ignore trackpad inertia */
    lastTry = now;
    var a = adjacent(dir);
    if (!a) return;
    if (now - armed[dir] < ARM) { location.href = new URL(a.href, location.href).href; return; }
    armed[dir] = now;
    toast((dir > 0 ? 'Faites défiler encore pour aller à : ' : 'Faites défiler vers le haut pour aller à : ') + a.textContent.trim());
  }
  function edge(dir) { return dir > 0 ? atBottom() : atTop(); }

  window.addEventListener('wheel', function (e) {
    var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (dir && edge(dir) && !drawerOpen() && !inField(e.target)) attempt(dir);
  }, { passive: true });

  document.addEventListener('touchstart', function (e) {
    tsDir = 0;
    if (e.touches.length !== 1 || drawerOpen() || inField(e.target)) return;
    tsX = e.touches[0].clientX; tsY = e.touches[0].clientY;
    tsDir = atBottom() ? 1 : atTop() ? -1 : 0;       /* which edge the finger started on */
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!tsDir || !e.changedTouches.length) return;
    var dy = e.changedTouches[0].clientY - tsY, dx = e.changedTouches[0].clientX - tsX;
    if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.5) return;
    /* swipe up at the bottom = next page, swipe down at the top = previous page */
    if ((tsDir > 0 && dy < 0) || (tsDir < 0 && dy > 0)) attempt(tsDir);
  }, { passive: true });
})();
