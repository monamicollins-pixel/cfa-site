/* =========================================================
   CFA SHARED THEME CONTROLLER
   Single theme controller for all CFA pages.
   Uses the same cfa_theme value as the homepage.
   ========================================================= */

(function () {

    const html = document.documentElement;

    function getTheme() {
        return html.getAttribute("data-theme") === "dark"
            ? "dark"
            : "light";
    }

    function updateThemeButtons() {

        const dark = getTheme() === "dark";

        const desktopTheme =
            document.getElementById("themeToggle");

        const drawerTheme =
            document.getElementById("drawer-theme-toggle");

        if (desktopTheme) {
            desktopTheme.textContent =
                dark ? "Mode clair" : "Mode sombre";
        }

        if (drawerTheme) {
            drawerTheme.textContent =
                dark ? "Mode clair" : "Mode sombre";
        }
    }

    function applyTheme(theme) {

        const next =
            theme === "dark" ? "dark" : "light";

        html.setAttribute(
            "data-theme",
            next
        );

        localStorage.setItem(
            "cfa_theme",
            next
        );

        updateThemeButtons();
    }

    /* ---------------------------------------------------------
       Apply saved theme immediately.
       --------------------------------------------------------- */

    const savedTheme =
        localStorage.getItem("cfa_theme") || "light";

    applyTheme(savedTheme);

    /* ---------------------------------------------------------
       Wait for the header buttons to exist.
       --------------------------------------------------------- */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const desktopTheme =
                document.getElementById("themeToggle");

            const drawerTheme =
                document.getElementById("drawer-theme-toggle");

            /* Desktop theme button */
            if (
                desktopTheme &&
                !desktopTheme.dataset.cfaThemeBound
            ) {

                desktopTheme.dataset.cfaThemeBound = "true";

                desktopTheme.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        const next =
                            getTheme() === "dark"
                                ? "light"
                                : "dark";

                        applyTheme(next);
                    }
                );
            }

            /* The mobile drawer button is normally handled
               by the universal header drawer script.
               We only synchronize its label here. */

            updateThemeButtons();
        }
    );

})();
