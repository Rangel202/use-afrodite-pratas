/* ============================================================
   CATALOG — grade, filtro por categoria e busca instantânea
   Renderiza a partir de AF.PRODUCTS (products.js).
   ============================================================ */

window.AF = window.AF || {};

AF.catalog = (function () {
  "use strict";

  var STEP = 8; // quantos cards por lote

  var state = {
    cat: "all",
    query: "",
    shown: STEP,
  };

  var el = {};

  function cacheDom() {
    el.grid = document.getElementById("grid");
    el.chips = document.getElementById("chips");
    el.search = document.getElementById("search");
    el.clear = document.getElementById("searchClear");
    el.count = document.getElementById("catCount");
    el.more = document.getElementById("catMore");
    el.moreBtn = document.getElementById("catMoreBtn");
  }

  /* ---------- Filtro ---------- */
  function filtered() {
    var q = AF.norm(state.query).trim();

    return AF.PRODUCTS.filter(function (p) {
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      if (!q) return true;

      var haystack = AF.norm(
        [p.name, AF.catLabel(p.cat), p.note || "", (p.tags || []).join(" ")].join(" ")
      );

      // todos os termos digitados precisam aparecer
      return q.split(/\s+/).every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });
  }

  /* ---------- Templates ---------- */
  /* Largura real do card na tela, por breakpoint. Precisa bater com o
     grid do CSS: o navegador escolhe a imagem a partir DESTE valor —
     se ele mentir, ou baixa demais ou renderiza borrado. */
  var SIZES =
    "(min-width:1600px) 340px, " +
    "(min-width:1024px) 23vw, " +
    "(min-width:820px) 30vw, " +
    "46vw";

  function cardMarkup(p, i) {
    var delay = (i % 4) + 1;
    // as 4 primeiras imagens aparecem sem rolar: carregam logo
    var eager = i < 4;

    return (
      '<article class="card tilt" data-reveal="up" data-delay="' + delay +
      '" data-card="' + p.id + '">' +
        '<div class="card__media">' +
          "<picture>" +
            '<source type="image/webp" srcset="' + AF.imgSet(p.slug) +
                   '" sizes="' + SIZES + '">' +
            '<img src="' + AF.imgFallback(p.slug) + '" ' +
                 'alt="' + p.name + ' em prata 925" ' +
                 'loading="' + (eager ? "eager" : "lazy") + '" ' +
                 'fetchpriority="' + (eager ? "high" : "auto") + '" ' +
                 'decoding="async" width="900" height="900">' +
          "</picture>" +
          '<span class="card__gleam" aria-hidden="true"></span>' +
          (p.badge ? '<span class="card__badge">' + p.badge + "</span>" : "") +
          '<button type="button" class="card__add" data-add="' + p.id + '" ' +
                  'aria-label="Adicionar ' + p.name + ' ao carrinho">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
            "<span>Adicionar</span>" +
          "</button>" +
        "</div>" +
        '<div class="card__body">' +
          '<span class="card__cat">' + AF.catLabel(p.cat) + "</span>" +
          '<h3 class="card__name">' + p.name + "</h3>" +
          (p.note ? '<span class="card__note">' + p.note + "</span>" : "") +
          '<p class="card__price">' +
            "<strong>" + AF.brl(p.price) + "</strong>" +
            (p.old ? "<s>" + AF.brl(p.old) + "</s>" : "") +
          "</p>" +
        "</div>" +
      "</article>"
    );
  }

  function emptyMarkup() {
    return (
      '<div class="card__empty">' +
        "<b>Nada encontrado por aqui</b>" +
        "<p>Tente outra palavra ou volte para “Tudo”.</p>" +
      "</div>"
    );
  }

  /* ---------- Render ---------- */
  function render() {
    if (!el.grid) return;

    var list = filtered();
    var visible = list.slice(0, state.shown);

    el.grid.innerHTML = visible.length
      ? visible.map(cardMarkup).join("")
      : emptyMarkup();

    if (el.count) {
      el.count.textContent =
        list.length + (list.length === 1 ? " peça" : " peças");
    }

    if (el.more) {
      el.more.hidden = list.length <= state.shown;
    }

    // liga as animações de entrada nos cards recém-criados
    if (AF.anim && AF.anim.observe) AF.anim.observe(el.grid);
    if (AF.anim && AF.anim.bindTilt) AF.anim.bindTilt(el.grid);
  }

  function renderChips() {
    if (!el.chips) return;
    el.chips.innerHTML = AF.CATEGORIES.map(function (c) {
      return (
        '<button type="button" class="chip' +
        (c.id === state.cat ? " is-on" : "") +
        '" data-cat="' + c.id + '" aria-pressed="' +
        (c.id === state.cat) + '">' + c.label + "</button>"
      );
    }).join("");
  }

  /* ---------- Eventos ---------- */
  var searchTimer = null;

  function bind() {
    // categorias
    if (el.chips) {
      el.chips.addEventListener("click", function (e) {
        var chip = e.target.closest("[data-cat]");
        if (!chip) return;
        state.cat = chip.getAttribute("data-cat");
        state.shown = STEP;
        renderChips();
        render();
      });
    }

    // busca instantânea (com debounce curto)
    if (el.search) {
      el.search.addEventListener("input", function () {
        var value = el.search.value;
        if (el.clear) el.clear.classList.toggle("is-on", value.length > 0);

        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          state.query = value;
          state.shown = STEP;
          render();
        }, 140);
      });
    }

    if (el.clear) {
      el.clear.addEventListener("click", function () {
        el.search.value = "";
        el.clear.classList.remove("is-on");
        state.query = "";
        state.shown = STEP;
        render();
        el.search.focus();
      });
    }

    // ver mais
    if (el.moreBtn) {
      el.moreBtn.addEventListener("click", function () {
        state.shown += STEP;
        render();
      });
    }

    // adicionar ao carrinho (delegação)
    if (el.grid) {
      el.grid.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-add]");
        if (!btn) return;

        var id = btn.getAttribute("data-add");
        var card = btn.closest(".card");

        AF.cart.add(id, card);

        // feedback visual no próprio botão
        btn.classList.add("is-added");
        var label = btn.querySelector("span");
        var original = label.textContent;
        label.textContent = "Adicionado";
        if (card) {
          card.classList.add("flash");
          setTimeout(function () {
            card.classList.remove("flash");
          }, 700);
        }
        setTimeout(function () {
          btn.classList.remove("is-added");
          label.textContent = original;
        }, 1500);
      });
    }
  }

  /* Filtra a partir de um link externo (ex.: cards de coleção) */
  function setCategory(cat) {
    state.cat = cat;
    state.query = "";
    state.shown = STEP;
    if (el.search) el.search.value = "";
    if (el.clear) el.clear.classList.remove("is-on");
    renderChips();
    render();
  }

  function init() {
    cacheDom();
    renderChips();
    render();
    bind();
  }

  return { init: init, setCategory: setCategory };
})();
