/* CFA "Bientôt" tags: pill at the end of the title line + caption, for cards without content yet.
   Usage: add data-cfa-soon (optional data-soon-caption="...") to any card.
   On the COMPAS page it also adds a teaser for the next entry number. */
(function () {
  var BADGE = 'Bientôt';
  var CAPTION = 'Ce contenu est en préparation. Revenez bientôt !';

  var css = [
    '.cfa-soon-badge{display:inline-flex;align-items:center;margin-left:auto;padding:2px 10px;border-radius:999px;background:#ff6600;color:#000;-webkit-text-fill-color:#000;font-size:12px;font-weight:800;line-height:1.6;letter-spacing:0;text-transform:none;white-space:nowrap;font-style:normal}',
    '.cfa-soon-head{display:flex !important;align-items:center;gap:10px}',
    '.cfa-card-soon{border-style:dashed !important;cursor:default}',
    '.cfa-card-soon:hover{transform:none !important;box-shadow:none !important;border-color:var(--line,var(--cfa-line,#e5eaf2)) !important}',
    '.cfa-soon-caption{margin:10px 0 0;font-size:12.5px;line-height:1.45;font-style:italic;color:var(--muted,var(--cfa-muted,#64748b))}',
    '.cfa-soon-card{margin:24px 0 0;padding:22px 24px;border:1px dashed var(--line,var(--cfa-line,#e5eaf2));border-radius:18px;background:var(--card-bg,var(--cfa-surface,#fff));color:var(--ink,var(--cfa-ink,#10203a))}',
    '.cfa-soon-card-top{display:flex;align-items:center;gap:12px}',
    '.cfa-soon-card-number{font-weight:800;font-size:15px;color:var(--blue,var(--cfa-blue,#174ea6))}',
    '.cfa-soon-nav{display:inline-flex;align-items:center;gap:8px;cursor:default}',
    '.cfa-card-soon.course-disabled{opacity:1 !important}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'cfa-soon-style';
  st.textContent = css;
  document.head.appendChild(st);

  function badge() {
    var b = document.createElement('span');
    b.className = 'cfa-soon-badge';
    b.textContent = BADGE;
    return b;
  }

  function decorate(card) {
    if (card.getAttribute('data-soon-done')) return;
    card.setAttribute('data-soon-done', '1');
    card.classList.add('cfa-card-soon');
    if (card.tagName === 'A') {
      card.removeAttribute('href');
      card.setAttribute('aria-disabled', 'true');
    }
    var head = card.querySelector('h1,h2,h3,h4');
    var b = badge();
    if (head) {
      head.classList.add('cfa-soon-head');
      head.appendChild(b);
    } else {
      b.style.float = 'right';
      card.insertBefore(b, card.firstChild);
    }
    var cap = document.createElement('p');
    cap.className = 'cfa-soon-caption';
    cap.textContent = card.getAttribute('data-soon-caption') || CAPTION;
    card.appendChild(cap);
  }

  function compas() {
    var entries = document.querySelectorAll('.compass-entry[id^="compas-"]');
    if (!entries.length) return;
    var max = 0;
    Array.prototype.forEach.call(entries, function (e) {
      var n = parseInt(e.id.replace('compas-', ''), 10);
      if (n > max) max = n;
    });
    var label = ('00' + (max + 1)).slice(-3);
    var maxLabel = ('00' + max).slice(-3);

    if (!document.getElementById('compas-soon')) {
      var card = document.createElement('div');
      card.id = 'compas-soon';
      card.className = 'cfa-soon-card';
      var top = document.createElement('div');
      top.className = 'cfa-soon-card-top';
      var num = document.createElement('span');
      num.className = 'cfa-soon-card-number';
      num.textContent = 'COMPAS du jour — ' + label;
      top.appendChild(num);
      top.appendChild(badge());
      var cap = document.createElement('p');
      cap.className = 'cfa-soon-caption';
      cap.textContent = 'Le prochain COMPAS est en préparation. Revenez bientôt !';
      card.appendChild(top);
      card.appendChild(cap);
      entries[entries.length - 1].insertAdjacentElement('afterend', card);
    }

    var list = document.getElementById('compas-navigation-list');
    if (list && list.firstElementChild && !document.getElementById('compas-soon-nav')) {
      var first = list.firstElementChild;
      var item = document.createElement(first.tagName === 'A' ? 'span' : first.tagName.toLowerCase());
      item.id = 'compas-soon-nav';
      item.className = first.className + ' cfa-soon-nav';
      item.setAttribute('aria-disabled', 'true');
      item.appendChild(document.createTextNode('COMPAS ' + label + ' '));
      var nb = badge();
      nb.style.marginLeft = '0';
      item.appendChild(nb);
      var newestFirst = first.textContent.indexOf(maxLabel) !== -1;
      if (newestFirst) list.insertBefore(item, first); else list.appendChild(item);
    }
  }

  function run() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-cfa-soon]'), decorate);
    compas();
  }
  run();
  window.addEventListener('load', function () { run(); setTimeout(run, 600); });
})();
