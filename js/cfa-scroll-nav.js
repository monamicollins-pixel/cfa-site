/* Scrolling past the bottom of a page moves to the next header button:
   Accueil > Cours > Ressources > A propos > Connexion.
   First push shows a hint, a second push within 4 s goes there. */
(function () {
  var GAP = 900, ARM = 4000, armedAt = 0, lastTry = 0, tsY = 0, tsX = 0, tsOK = false;

  function fileOf(u) { return u.pathname.split('/').pop() || 'index.html'; }
  function links() {
    return Array.prototype.slice.call(document.querySelectorAll(
      'header .nav-right > nav a, header .account-links a[href$="connexion.html"]'
    )).filter(function (a) { return a.getAttribute('href'); });
  }
  function atBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  }
  function drawerOpen() {
    var d = document.getElementById('site-mobile-drawer');
    return !!d && (d.getAttribute('aria-hidden') === 'false' || /open|active|show/i.test(d.className));
  }
  function nextPage() {
    var list = links(), cur = -1;
    list.forEach(function (a, n) { if (a.getAttribute('aria-current') === 'page') cur = n; });
    if (cur < 0) return null;
    var here = fileOf(new URL(list[cur].href, location.href));
    for (var i = cur + 1; i < list.length; i++) {
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
      'bottom:calc(16px + env(safe-area-inset-bottom,0px));background:#174ea6;color:#fff;' +
      'font:700 14px/1.3 sans-serif;padding:10px 14px;border-radius:10px;max-width:90%;text-align:center';
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2500);
  }
  function attempt() {
    var now = Date.now();
    if (now - lastTry < GAP) return;            /* ignore trackpad inertia */
    lastTry = now;
    var a = nextPage();
    if (!a) return;
    if (now - armedAt < ARM) { location.href = new URL(a.href, location.href).href; return; }
    armedAt = now;
    toast('Faites défiler encore pour aller à : ' + a.textContent.trim());
  }

  window.addEventListener('wheel', function (e) {
    if (e.deltaY > 0 && atBottom() && !drawerOpen() &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) attempt();
  }, { passive: true });

  document.addEventListener('touchstart', function (e) {
    tsOK = e.touches.length === 1 && atBottom() && !drawerOpen() &&
           !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '');
    if (tsOK) { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; }
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!tsOK || !e.changedTouches.length) return;
    var dy = e.changedTouches[0].clientY - tsY, dx = e.changedTouches[0].clientX - tsX;
    if (dy < -60 && Math.abs(dy) > Math.abs(dx) * 1.5) attempt();   /* swipe up at the bottom */
  }, { passive: true });
})();
