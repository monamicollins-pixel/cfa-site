/* Header: ONE control. [current page v] opens: theme, then the other pages. */
(function () {
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var right = document.querySelector('header .nav-right');
    if (!right || document.getElementById('cfa-navdd')) return;
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
    var lastSig = '';

    function clean(t) { return (t || '').replace(/\s+/g, ' ').trim(); }
    function sources() {
      var out = Array.prototype.slice.call(document.querySelectorAll('header .nav-right > nav a'));
      var area = document.getElementById('accountArea');
      if (area) out = out.concat(Array.prototype.slice.call(area.querySelectorAll('a[href], button, .user-welcome')));
      return out;
    }

    function build() {
      var items = sources(), cur = '';
      var themeText = theme ? (clean(theme.textContent) || theme.getAttribute('aria-label') || 'Thème') : '';
      var sig = 'T:' + themeText + ';';
      items.forEach(function (s) {
        var t = clean(s.textContent); if (!t) return;
        var c = s.getAttribute('aria-current') === 'page';
        if (c && !cur) cur = t;
        sig += t + '|' + (s.getAttribute('href') || s.tagName) + '|' + (c ? 1 : 0) + ';';
      });
      if (sig === lastSig) return;                 /* nothing changed: stops observer loops */
      lastSig = sig;
      panel.textContent = '';

      if (theme) {                                 /* theme first, above the pages */
        var tb = document.createElement('button');
        tb.type = 'button'; tb.className = 'cfa-navdd-theme'; tb.textContent = themeText;
        tb.addEventListener('click', function () { theme.click(); setTimeout(build, 60); setTimeout(build, 500); });
        panel.appendChild(tb);
      }
      items.forEach(function (s) {
        var t = clean(s.textContent); if (!t) return;
        var el;
        if (s.tagName === 'A' && s.getAttribute('href')) {
          el = document.createElement('a'); el.setAttribute('href', s.getAttribute('href'));
        } else if (s.tagName === 'BUTTON') {
          el = document.createElement('button'); el.type = 'button';
          el.addEventListener('click', function () { s.click(); });      /* logout etc. runs the original button */
        } else {
          el = document.createElement('div'); el.className = 'cfa-navdd-note';
        }
        el.textContent = t;
        if (s.getAttribute('aria-current') === 'page') el.setAttribute('aria-current', 'page');
        panel.appendChild(el);
      });
      label.textContent = cur || 'Menu';
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
    var area = document.getElementById('accountArea');
    if (nav) mo.observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    if (area) mo.observe(area, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current', 'href'] });
    if (theme) mo.observe(theme, { subtree: true, childList: true, characterData: true });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    setTimeout(build, 400);
  });
})();
