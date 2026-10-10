(function () {
  "use strict";

  window.cfaShowAdminAccessDenied = function () {
    document.body.classList.add("cfa-admin-denied-view");

    const header = document.querySelector(".admin-header");

    if (header) {
      const actions = header.querySelector("#admin-header-actions");
      const menuToggle = header.querySelector(".admin-menu-toggle");
      const subtitle = header.querySelector(".admin-brand-subtitle");

      if (actions) actions.remove();
      if (menuToggle) menuToggle.remove();
      if (subtitle) subtitle.textContent = "ACCÈS RESTREINT";

      // Disable the remaining brand link as well.
      header.querySelectorAll("a").forEach(function (link) {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("tabindex", "-1");
        link.style.pointerEvents = "none";
        link.style.cursor = "default";
      });
    }

    const main = document.querySelector("main");
    if (!main) return;

    main.innerHTML = `
      <section class="cfa-admin-access-denied"
               aria-labelledby="cfa-admin-access-title">
        <div class="cfa-admin-access-kicker">CFA · CENTRE D’ADMINISTRATION</div>

        <h1 id="cfa-admin-access-title">
          Accès réservé aux administrateurs
        </h1>

        <p>
          Votre compte ne dispose pas des droits nécessaires pour gérer
          ou modifier les contenus de Collins French Academy.
        </p>

        <p>
          Vous pouvez poursuivre votre apprentissage ou nous transmettre
          une suggestion pour contribuer à l’amélioration de CFA.
        </p>

        <div class="cfa-admin-access-actions">
          <a class="cfa-admin-access-button cfa-admin-access-button--suggestion"
             href="../pages/suggestions.html">
            Envoyer une suggestion
          </a>

          <a class="cfa-admin-access-button cfa-admin-access-button--learner"
             href="../dashboard.html">
            Espace apprenant
          </a>
        </div>

        <p class="cfa-admin-access-note">
          La gestion et la modification des cours et des leçons sont
          réservées aux comptes administrateurs autorisés.
        </p>
      </section>
    `;
  };
})();
