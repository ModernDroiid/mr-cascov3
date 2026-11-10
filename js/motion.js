/* ==========================================================================
   EFECTOS DE SCROLL
   Revela los elementos con [data-reveal] cuando entran a la pantalla.
   Los estilos de cada efecto están en css/motion.css.

   - [data-reveal-group]: sus [data-reveal] entran uno tras otro.
   ========================================================================== */

(function () {
  "use strict";

  const root = document.documentElement;
  if (!root.classList.contains("motion")) return;

  // Avisa al script del <head> que todo cargó bien (si no, apaga .motion)
  window.__motionReady = true;

  function reveal(element) {
    element.classList.add("is-revealed");
  }

  // Orden de entrada dentro de cada grupo
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((element, index) => {
      element.style.setProperty("--reveal-i", index);
    });
  });

  // Elemento vigilado -> elementos que se revelan cuando él entra
  const pending = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        pending.get(entry.target).forEach(reveal);
        pending.delete(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
  );

  function watch(target, element) {
    if (!pending.has(target)) {
      pending.set(target, []);
      observer.observe(target);
    }
    pending.get(target).push(element);
  }

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    // Lo que ya quedó arriba (al recargar a mitad de página) se muestra directo
    if (element.getBoundingClientRect().bottom < 0) {
      reveal(element);
      return;
    }

    // El telón empieza recortado del todo y el observador lo vería con área
    // cero, así que para ese efecto se vigila a su contenedor
    const target = element.dataset.reveal === "clip" ? element.parentElement : element;
    watch(target, element);
  });
})();
