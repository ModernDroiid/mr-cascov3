/* ==========================================================================
   COMPORTAMIENTO DE LA PÁGINA
   Cada función init* controla una sola funcionalidad. Sin JavaScript la
   página sigue funcionando: los botones llevan a la sección de contacto y
   el antes/después responde al pasar el cursor.
   ========================================================================== */

(function () {
  "use strict";

  const config = window.MR_CASCO_CONFIG;
  const MOBILE_NAV_QUERY = "(max-width: 48em)";

  /* Convierte en enlaces de WhatsApp todo lo marcado con [data-whatsapp] */
  function initWhatsappLinks() {
    const { number, message } = config.whatsapp;
    const digits = number.replace(/\D/g, "");

    if (!digits) {
      console.warn("Mr. Casco: falta el número de WhatsApp en js/config.js");
      return;
    }

    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

    document.querySelectorAll("[data-whatsapp]").forEach((link) => {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
    });
  }

  /* Abre y cierra el menú en pantallas pequeñas */
  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia(MOBILE_NAV_QUERY).addEventListener("change", () => setOpen(false));
  }

  /* Resalta en el menú la sección que se está viendo */
  function initActiveNav() {
    const links = new Map(
      Array.from(document.querySelectorAll("[data-nav-link]")).map((link) => [
        link.getAttribute("href").slice(1),
        link,
      ])
    );

    function setActive(id) {
      links.forEach((link, key) => {
        if (key === id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    // Una línea imaginaria al 40 % de la pantalla decide qué sección manda
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -59% 0px" }
    );

    document.querySelectorAll("[data-nav-section]").forEach((section) => observer.observe(section));
    setActive("inicio");
  }

  /* Antes/después: tocar la foto alterna entre cómo llegó y cómo salió */
  function initBeforeAfter() {
    document.querySelectorAll(".card__media").forEach((button) => {
      button.addEventListener("click", () => {
        const pressed = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!pressed));
      });
    });
  }

  /* Marca en el horario la fila que aplica hoy, según la hora de Bogotá */
  function initTodayHours() {
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: config.timeZone,
    }).format(new Date());
    const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);

    document.querySelectorAll(".hours__row[data-days]").forEach((row) => {
      const days = row.dataset.days.split(",").map(Number);
      if (days.includes(today)) row.classList.add("is-today");
    });
  }

  /* Mantiene al día el año de los derechos reservados */
  function initCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = new Date().getFullYear();
    });
  }

  initWhatsappLinks();
  initMobileNav();
  initActiveNav();
  initBeforeAfter();
  initTodayHours();
  initCurrentYear();
})();
