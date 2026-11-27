/* ==========================================================================
   DESIGN SYSTEM 2027 — theme-init.js
   Cole INLINE no <head>, antes de qualquer CSS, para não piscar o tema errado.
   Expõe window.ds para trocar tema/modo/fonte/raio e lembrar a escolha.

   Padrões vêm dos atributos já escritos no <html> (ex.: data-theme="atlantico").
   Modo: "light" | "dark" | "system" (sistema resolve e acompanha o SO).
   Escreve data-mode e também a classe .dark (compatível com shadcn/next-themes).
   ========================================================================== */
(function () {
  var root = document.documentElement;
  var KEYS = { theme: "ds-theme", mode: "ds-mode", font: "ds-font", radius: "ds-radius", density: "ds-density" };
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function read(k) { try { return localStorage.getItem(KEYS[k]); } catch (e) { return null; } }
  function write(k, v) { try { v == null ? localStorage.removeItem(KEYS[k]) : localStorage.setItem(KEYS[k], v); } catch (e) {} }

  function applyMode(mode) {
    var resolved = mode === "system" || !mode ? (mq.matches ? "dark" : "light") : mode;
    root.setAttribute("data-mode", resolved);
    root.classList.toggle("dark", resolved === "dark");
    root.classList.toggle("light", resolved === "light");
    root.dataset.modePref = mode || "system";
  }

  ["theme", "font", "radius", "density"].forEach(function (k) {
    var v = read(k);
    if (v) root.setAttribute("data-" + k, v);
  });
  applyMode(read("mode") || root.dataset.modePref || root.getAttribute("data-mode") || "system");

  mq.addEventListener("change", function () {
    if ((root.dataset.modePref || "system") === "system") applyMode("system");
  });

  function set(k, v) {
    var run = function () {
      if (k === "mode") applyMode(v); else root.setAttribute("data-" + k, v);
      root.dispatchEvent(new CustomEvent("ds:change", { detail: { key: k, value: v } }));
    };
    write(k, v);
    // Transição suave entre temas onde houver View Transitions
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var t = document.startViewTransition(run);
      var noop = function () {};
      t.ready.catch(noop); t.finished.catch(noop); t.updateCallbackDone.catch(noop);
    } else { run(); }
  }

  window.ds = {
    setTheme: function (v) { set("theme", v); },
    setMode: function (v) { set("mode", v); },
    setFont: function (v) { set("font", v); },
    setRadius: function (v) { set("radius", v); },
    setDensity: function (v) { set("density", v); },
    toggleMode: function () { set("mode", root.getAttribute("data-mode") === "dark" ? "light" : "dark"); },
    get: function () {
      return {
        theme: root.getAttribute("data-theme") || "grafite",
        mode: root.dataset.modePref || "system",
        resolvedMode: root.getAttribute("data-mode"),
        font: root.getAttribute("data-font") || "system",
        radius: root.getAttribute("data-radius") || "default",
        density: root.getAttribute("data-density") || "default",
      };
    },
    themes: ["grafite", "atlantico", "mare", "mata", "cerrado", "ipe", "jabuticaba", "aurora"],
    fonts: ["geist", "inter", "jakarta", "manrope", "bricolage", "grotesk", "editorial", "fraunces", "plex"],
  };
})();
