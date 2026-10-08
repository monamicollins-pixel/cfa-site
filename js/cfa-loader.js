/* =========================================================
   CFA COMPAS LOADER
   Early-render site-wide loader controller
   ========================================================= */

(function () {
  "use strict";

  function startCfaLoader() {
    const loader = document.getElementById("cfa-page-loader");

    if (!loader) {
      return;
    }

    let hidden = false;

    function hideCfaLoader() {
      if (hidden) return;

      hidden = true;
      loader.classList.add("cfa-loader-hidden");

      window.setTimeout(function () {
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 650);
    }

    /*
     * Hide as soon as the document structure is ready.
     * This is more reliable on mobile than waiting only
     * for the window load event.
     */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", hideCfaLoader, {
        once: true
      });
    } else {
      hideCfaLoader();
    }

    /*
     * Also hide on the normal browser load event.
     */
    window.addEventListener("load", hideCfaLoader, {
      once: true
    });

    /*
     * Absolute safety fallback.
     */
    window.setTimeout(hideCfaLoader, 8000);
  }

  startCfaLoader();
})();
