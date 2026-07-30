/* ============================================================
   APP — orquestra o site
   Loader · navegação · menu · FAQ · ripple · toast ·
   carrossel de avaliações · vídeos sob demanda · âncoras
   ============================================================ */

window.AF = window.AF || {};

(function () {
  "use strict";

  var html = document.documentElement;
  html.classList.add("js");

  /* ==========================================================
     TOAST — avisos discretos no rodapé
     ========================================================== */
  var toastEl = null;
  var toastTimer = null;

  AF.toast = function (message) {
    if (!toastEl) toastEl = document.getElementById("toast");
    if (!toastEl) return;

    toastEl.querySelector("span").textContent = message;
    toastEl.classList.add("is-on");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  };

  /* ==========================================================
     LOADER — barra de progresso e revelação da hero
     ========================================================== */
  function initLoader() {
    var loader = document.getElementById("loader");
    if (!loader) {
      html.classList.add("is-ready");
      return;
    }

    var bar = loader.querySelector(".loader__bar span");
    var pct = loader.querySelector(".loader__pct");
    var value = 0;
    var done = false;

    // progresso simulado — sobe rápido e desacelera perto do fim
    var timer = setInterval(function () {
      var step = value < 60 ? 9 : value < 85 ? 4 : 1.4;
      value = Math.min(value + Math.random() * step, 96);
      paint();
    }, 110);

    function paint() {
      if (bar) bar.style.width = value + "%";
      if (pct) pct.textContent = Math.floor(value).toString().padStart(2, "0");
    }

    function finish() {
      if (done) return;
      done = true;
      clearInterval(timer);

      value = 100;
      paint();

      setTimeout(function () {
        loader.classList.add("is-done");
        html.classList.add("is-ready");
        document.body.classList.remove("is-locked");

        // remove do DOM depois da transição
        setTimeout(function () {
          loader.remove();
        }, 800);
      }, 380);
    }

    document.body.classList.add("is-locked");

    // espera a página carregar, com teto de segurança
    if (document.readyState === "complete") {
      setTimeout(finish, 500);
    } else {
      window.addEventListener("load", function () {
        setTimeout(finish, 420);
      });
    }
    setTimeout(finish, 4200); // rede lenta não pode travar o site
  }

  /* ==========================================================
     NAVEGAÇÃO — fundo ao rolar + esconde ao descer
     ========================================================== */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    var last = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;

      nav.classList.toggle("is-stuck", y > 30);

      // esconde ao descer, mostra ao subir (só depois da hero)
      var menuOpen = document
        .getElementById("menu")
        .classList.contains("is-open");

      if (!menuOpen && y > 400) {
        nav.classList.toggle("is-hidden", y > last + 6);
      } else {
        nav.classList.remove("is-hidden");
      }

      last = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     MENU MOBILE
     ========================================================== */
  function initMenu() {
    var menu = document.getElementById("menu");
    var burger = document.getElementById("burger");
    var close = document.getElementById("menuClose");
    if (!menu || !burger) return;

    function open() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      burger.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
      if (AF.lenis) AF.lenis.stop();
    }

    function shut() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
      if (AF.lenis) AF.lenis.start();
    }

    burger.addEventListener("click", open);
    if (close) close.addEventListener("click", shut);

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) shut();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) shut();
    });
  }

  /* ==========================================================
     ÂNCORAS — rolagem suave respeitando o header fixo
     ========================================================== */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"], [data-scroll]');
      if (!link) return;

      var hash = link.getAttribute("data-scroll") || link.getAttribute("href");
      if (!hash || hash === "#") return;

      var target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      var nav = document.getElementById("nav");
      var offset = nav ? nav.offsetHeight - 1 : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - offset;

      if (AF.lenis && AF.lenis.to) {
        AF.lenis.to(y);
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }

      // fecha o carrinho se o clique veio de dentro dele
      if (link.closest("#cart") && AF.cart) AF.cart.close();
    });
  }

  /* ==========================================================
     COLEÇÕES — cada card leva ao catálogo já filtrado
     ========================================================== */
  function initCollections() {
    document.addEventListener("click", function (e) {
      var card = e.target.closest("[data-collection]");
      if (!card) return;

      e.preventDefault();
      var cat = card.getAttribute("data-collection");

      if (AF.catalog) AF.catalog.setCategory(cat);

      var target = document.getElementById("catalogo");
      if (!target) return;

      var nav = document.getElementById("nav");
      var offset = nav ? nav.offsetHeight - 1 : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - offset;

      if (AF.lenis && AF.lenis.to) AF.lenis.to(y);
      else window.scrollTo({ top: y, behavior: "smooth" });
    });
  }

  /* ==========================================================
     FAQ — acordeão (um aberto por vez)
     ========================================================== */
  function initFaq() {
    var list = document.getElementById("faqList");
    if (!list) return;

    list.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__q");
      if (!btn) return;

      var item = btn.closest(".faq__item");
      var isOpen = item.classList.contains("is-open");

      list.querySelectorAll(".faq__item").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ==========================================================
     RIPPLE — feedback tátil nos botões
     ========================================================== */
  function initRipple() {
    document.addEventListener(
      "pointerdown",
      function (e) {
        var btn = e.target.closest(".btn, .chip, .icon-btn");
        if (!btn) return;

        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);

        var ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left + "px";
        ripple.style.top = e.clientY - rect.top + "px";

        btn.appendChild(ripple);
        setTimeout(function () {
          ripple.remove();
        }, 650);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     AVALIAÇÕES — setas do carrossel
     ========================================================== */
  function initReviews() {
    var rail = document.getElementById("revRail");
    var prev = document.getElementById("revPrev");
    var next = document.getElementById("revNext");
    if (!rail) return;

    function step(dir) {
      var card = rail.querySelector(".rev");
      var amount = card ? card.offsetWidth + 16 : rail.clientWidth * 0.8;
      rail.scrollBy({ left: amount * dir, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
  }

  /* ==========================================================
     VÍDEOS — só baixam quando chegam perto da tela
     ========================================================== */
  function initVideos() {
    var videos = document.querySelectorAll("video[data-src]");
    if (!videos.length) return;

    if (!("IntersectionObserver" in window)) {
      videos.forEach(load);
      return;
    }

    var vio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            load(video);
            var playing = video.play();
            if (playing && playing.catch) playing.catch(function () {});
          } else if (!video.paused) {
            video.pause();
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.25 }
    );

    videos.forEach(function (v) {
      vio.observe(v);
    });

    function load(video) {
      if (video.dataset.loaded) return;
      video.src = video.dataset.src;
      video.dataset.loaded = "1";
    }
  }

  /* ==========================================================
     MARQUEE — duplica o conteúdo para o loop ficar contínuo
     ========================================================== */
  function initMarquee() {
    document.querySelectorAll(".marquee__track").forEach(function (track) {
      track.innerHTML += track.innerHTML;
      track.setAttribute("aria-hidden", "true");
    });
  }

  /* ==========================================================
     BOTÃO FLUTUANTE — aparece depois da hero
     ========================================================== */
  function initFloat() {
    var float = document.getElementById("waFloat");
    if (!float) return;

    var ticking = false;

    function update() {
      float.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.7);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     DETECÇÃO DE TOQUE
     A media query (hover:none) já cobre celulares, mas notebooks
     com tela sensível ao toque relatam "hover: hover". Ao primeiro
     toque marcamos o documento para garantir que os controles
     dependentes de hover fiquem visíveis nesses aparelhos também.
     ========================================================== */
  function initTouchFlag() {
    window.addEventListener(
      "touchstart",
      function () {
        html.classList.add("is-touch-device");
      },
      { once: true, passive: true }
    );
  }

  /* ==========================================================
     Ano no rodapé
     ========================================================== */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ==========================================================
     BOOT
     ========================================================== */
  function boot() {
    initLoader();
    initNav();
    initMenu();
    initAnchors();
    initCollections();
    initFaq();
    initRipple();
    initReviews();
    initVideos();
    initMarquee();
    initFloat();
    initTouchFlag();
    initYear();

    AF.cart.init();
    AF.catalog.init();
    AF.wa.init();
    AF.anim.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
