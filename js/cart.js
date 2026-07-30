/* ============================================================
   CART — estado, painel lateral e microinterações
   Estado persiste em localStorage (chave af_cart_v1).
   API pública: AF.cart.add / remove / setQty / open / close / items
   ============================================================ */

window.AF = window.AF || {};

AF.cart = (function () {
  "use strict";

  var KEY = "af_cart_v1";
  var items = []; // [{ id, qty }]

  /* ---------- DOM ---------- */
  var el = {};

  function cacheDom() {
    el.drawer = document.getElementById("cart");
    el.scrim = document.getElementById("scrim");
    el.body = document.getElementById("cartBody");
    el.foot = document.getElementById("cartFoot");
    el.count = document.getElementById("cartCount");
    el.btn = document.getElementById("cartBtn");
    el.close = document.getElementById("cartClose");
    el.sub = document.getElementById("cartSub");
    el.total = document.getElementById("cartTotal");
    el.qtyLabel = document.getElementById("cartQtyLabel");
  }

  /* ---------- Persistência ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      // descarta itens cujo produto não existe mais
      items = parsed.filter(function (it) {
        return AF.findProduct(it.id);
      });
    } catch (e) {
      items = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      /* modo privado — segue sem persistir */
    }
  }

  /* ---------- Cálculos ---------- */
  function totalQty() {
    return items.reduce(function (n, it) {
      return n + it.qty;
    }, 0);
  }

  function subtotal() {
    return items.reduce(function (sum, it) {
      var p = AF.findProduct(it.id);
      return p ? sum + p.price * it.qty : sum;
    }, 0);
  }

  /* ---------- Render ---------- */
  function renderCount() {
    var n = totalQty();
    if (!el.count) return;
    el.count.textContent = n;
    el.count.classList.toggle("is-on", n > 0);
    if (el.btn) el.btn.setAttribute("aria-label", "Carrinho, " + n + " item(ns)");
  }

  function itemMarkup(it) {
    var p = AF.findProduct(it.id);
    if (!p) return "";
    var line = p.price * it.qty;
    return (
      '<article class="ci" data-ci="' + p.id + '">' +
      '<img class="ci__img" src="' + AF.imgThumb(p.slug) + '" alt="" loading="lazy" decoding="async" width="74" height="74">' +
      '<div class="ci__mid">' +
      '<span class="ci__cat">' + AF.catLabel(p.cat) + "</span>" +
      '<h3 class="ci__name">' + p.name + "</h3>" +
      '<span class="ci__price">' + AF.brl(p.price) + " / un.</span>" +
      '<div class="qty">' +
      '<button type="button" data-dec="' + p.id + '" aria-label="Diminuir quantidade">&minus;</button>' +
      "<span>" + it.qty + "</span>" +
      '<button type="button" data-inc="' + p.id + '" aria-label="Aumentar quantidade">+</button>' +
      "</div>" +
      "</div>" +
      '<div class="ci__right">' +
      '<strong class="ci__sum">' + AF.brl(line) + "</strong>" +
      '<button type="button" class="ci__del" data-del="' + p.id + '">Remover</button>' +
      "</div>" +
      "</article>"
    );
  }

  function emptyMarkup() {
    return (
      '<div class="cart__empty">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16l-1.4 12.1a2 2 0 0 1-2 1.9H7.4a2 2 0 0 1-2-1.9L4 7Z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/></svg>' +
      "<b>Sua seleção está vazia</b>" +
      "<p>Escolha uma peça no catálogo para começar.</p>" +
      '<button type="button" class="btn btn--ghost" data-close-cart data-scroll="#catalogo"><span>Ver catálogo</span></button>' +
      "</div>"
    );
  }

  function render() {
    if (!el.body) return;

    if (!items.length) {
      el.body.innerHTML = emptyMarkup();
      if (el.foot) el.foot.hidden = true;
    } else {
      el.body.innerHTML = items.map(itemMarkup).join("");
      if (el.foot) el.foot.hidden = false;
      var sub = subtotal();
      if (el.sub) el.sub.textContent = AF.brl(sub);
      if (el.total) el.total.textContent = AF.brl(sub);
      if (el.qtyLabel)
        el.qtyLabel.textContent =
          totalQty() + (totalQty() === 1 ? " peça" : " peças");
    }

    renderCount();
    save();
  }

  /* ---------- Ações ---------- */
  function add(id, sourceEl) {
    var p = AF.findProduct(id);
    if (!p) return;

    var existing = items.filter(function (it) {
      return it.id === id;
    })[0];

    if (existing) existing.qty += 1;
    else items.push({ id: id, qty: 1 });

    render();
    pulseCart();
    if (sourceEl) flyToCart(sourceEl);
    if (AF.toast) AF.toast(p.name + " adicionado");
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function setQty(id, qty) {
    var it = items.filter(function (i) {
      return i.id === id;
    })[0];
    if (!it) return;

    if (qty <= 0) return remove(id);
    it.qty = qty;
    render();
  }

  function remove(id) {
    var node = el.body && el.body.querySelector('[data-ci="' + id + '"]');
    var drop = function () {
      items = items.filter(function (i) {
        return i.id !== id;
      });
      render();
    };

    if (node) {
      node.classList.add("is-leaving");
      setTimeout(drop, 320);
    } else {
      drop();
    }
  }

  function clear() {
    items = [];
    render();
  }

  /* ---------- Painel ---------- */
  var lastFocus = null;

  function open() {
    if (!el.drawer) return;
    lastFocus = document.activeElement;
    el.drawer.classList.add("is-open");
    el.drawer.setAttribute("aria-hidden", "false");
    el.scrim.classList.add("is-on");
    document.body.classList.add("is-locked");
    if (AF.lenis) AF.lenis.stop();
    setTimeout(function () {
      if (el.close) el.close.focus();
    }, 320);
  }

  function close() {
    if (!el.drawer) return;
    el.drawer.classList.remove("is-open");
    el.drawer.setAttribute("aria-hidden", "true");
    el.scrim.classList.remove("is-on");
    document.body.classList.remove("is-locked");
    if (AF.lenis) AF.lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function isOpen() {
    return el.drawer && el.drawer.classList.contains("is-open");
  }

  /* ---------- Microinterações ---------- */
  function pulseCart() {
    if (!el.btn) return;
    el.btn.classList.remove("is-pulsing");
    // força reflow para reiniciar a animação
    void el.btn.offsetWidth;
    el.btn.classList.add("is-pulsing");
  }

  /* Miniatura voando do card até o ícone do carrinho */
  function flyToCart(sourceEl) {
    if (!el.btn) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var img = sourceEl.querySelector("img");
    if (!img || !img.currentSrc && !img.src) return;

    var from = img.getBoundingClientRect();
    var to = el.btn.getBoundingClientRect();

    var ghost = document.createElement("img");
    ghost.src = img.currentSrc || img.src;
    ghost.className = "flyer";
    ghost.alt = "";
    ghost.style.left = from.left + from.width / 2 - 34 + "px";
    ghost.style.top = from.top + from.height / 2 - 34 + "px";
    document.body.appendChild(ghost);

    var dx = to.left + to.width / 2 - (from.left + from.width / 2);
    var dy = to.top + to.height / 2 - (from.top + from.height / 2);

    var anim = ghost.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        {
          transform:
            "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 70) + "px) scale(0.7)",
          opacity: 0.95,
          offset: 0.55,
        },
        {
          transform: "translate(" + dx + "px," + dy + "px) scale(0.12)",
          opacity: 0,
        },
      ],
      { duration: 780, easing: "cubic-bezier(0.5, 0, 0.2, 1)" }
    );

    anim.onfinish = function () {
      ghost.remove();
    };
  }

  /* ---------- Eventos ---------- */
  function bind() {
    if (el.btn) el.btn.addEventListener("click", open);
    if (el.close) el.close.addEventListener("click", close);
    if (el.scrim) el.scrim.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) close();
    });

    // delegação dentro do painel
    if (el.body) {
      el.body.addEventListener("click", function (e) {
        var inc = e.target.closest("[data-inc]");
        var dec = e.target.closest("[data-dec]");
        var del = e.target.closest("[data-del]");
        var closer = e.target.closest("[data-close-cart]");

        if (inc) {
          var idI = inc.getAttribute("data-inc");
          setQty(idI, qtyOf(idI) + 1);
        } else if (dec) {
          var idD = dec.getAttribute("data-dec");
          setQty(idD, qtyOf(idD) - 1);
        } else if (del) {
          remove(del.getAttribute("data-del"));
        } else if (closer) {
          close();
        }
      });
    }

    // mantém o foco preso no painel enquanto aberto
    if (el.drawer) {
      el.drawer.addEventListener("keydown", function (e) {
        if (e.key !== "Tab" || !isOpen()) return;
        var focusables = el.drawer.querySelectorAll(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }
  }

  function qtyOf(id) {
    var it = items.filter(function (i) {
      return i.id === id;
    })[0];
    return it ? it.qty : 0;
  }

  /* ---------- Init ---------- */
  function init() {
    cacheDom();
    load();
    bind();
    render();
  }

  return {
    init: init,
    add: add,
    remove: remove,
    setQty: setQty,
    clear: clear,
    open: open,
    close: close,
    subtotal: subtotal,
    totalQty: totalQty,
    items: function () {
      return items.slice();
    },
  };
})();
