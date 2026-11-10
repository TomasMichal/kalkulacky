// Přepínač světlého a tmavého režimu. Bez volby se řídí nastavením systému.
(function () {
  var KLIC = "kalkulacky-tema";
  var koren = document.documentElement;
  function nacti() {
    try { return localStorage.getItem(KLIC); } catch (e) { return null; }
  }
  function uloz(h) {
    try { if (h) localStorage.setItem(KLIC, h); else localStorage.removeItem(KLIC); } catch (e) { /* bez úložiště */ }
  }
  function systemTmavy() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function pouzij(h) {
    if (h === "light" || h === "dark") koren.setAttribute("data-theme", h);
    else koren.removeAttribute("data-theme");
  }
  pouzij(nacti());

  document.addEventListener("DOMContentLoaded", function () {
    var tlacitka = document.querySelectorAll(".prepinac-tematu");
    function aktualniTmavy() {
      var h = koren.getAttribute("data-theme");
      return h ? h === "dark" : systemTmavy();
    }
    function popis() {
      tlacitka.forEach(function (t) {
        t.textContent = aktualniTmavy() ? "☀ Světlý režim" : "☾ Tmavý režim";
        t.hidden = false;
      });
    }
    tlacitka.forEach(function (t) {
      t.addEventListener("click", function () {
        var nove = aktualniTmavy() ? "light" : "dark";
        pouzij(nove);
        uloz(nove);
        popis();
      });
    });
    popis();
  });
})();
