/* ============================================================
   WHATSAPP — monta o pedido e abre a conversa
   Sem checkout: o carrinho vira uma mensagem formatada.
   ============================================================ */

window.AF = window.AF || {};

AF.wa = (function () {
  "use strict";

  /* ------------------------------------------------------------
     Número de atendimento da loja.
     Formato: código do país + DDD + número, só dígitos.

     Atual: (51) 98300-2113  ->  "5551983002113"

     Obs.: o número informado foi "51 8300-2113" (8 dígitos). Celular
     no Brasil tem 9 dígitos e começa com 9, por isso o 9 foi incluído.
     Se na verdade for um telefone fixo, use "555183002113" (sem o 9) —
     mas lembre que o WhatsApp normalmente exige linha móvel.
     ------------------------------------------------------------ */
  var PHONE = "5551983002113";

  var PLACEHOLDER = "5500000000000";

  function isConfigured() {
    return PHONE !== PLACEHOLDER && /^\d{12,13}$/.test(PHONE);
  }

  /* ---------- Montagem da mensagem ---------- */
  function buildMessage() {
    var items = AF.cart.items();
    if (!items.length) return "";

    var linhas = [];
    linhas.push("*USE AFRODITE PRATAS 925*");
    linhas.push("Novo pedido pelo site");
    linhas.push("");

    var total = 0;

    items.forEach(function (it, i) {
      var p = AF.findProduct(it.id);
      if (!p) return;

      var subtotal = p.price * it.qty;
      total += subtotal;

      linhas.push(i + 1 + ". *" + p.name + "*");
      linhas.push("   Categoria: " + AF.catLabel(p.cat));
      linhas.push("   Quantidade: " + it.qty);
      linhas.push("   Valor unitário: " + AF.brl(p.price));
      linhas.push("   Subtotal: " + AF.brl(subtotal));
      linhas.push("");
    });

    linhas.push("--------------------------------");
    linhas.push(
      "*Itens:* " + AF.cart.totalQty() + (AF.cart.totalQty() === 1 ? " peça" : " peças")
    );
    linhas.push("*TOTAL: " + AF.brl(total) + "*");
    linhas.push("--------------------------------");
    linhas.push("");
    linhas.push("Olá! Gostaria de finalizar este pedido.");

    return linhas.join("\n");
  }

  /* ---------- Abertura ---------- */
  function checkout() {
    if (!AF.cart.items().length) {
      if (AF.toast) AF.toast("Seu carrinho está vazio");
      return;
    }

    var msg = buildMessage();

    if (!isConfigured()) {
      console.warn(
        "[Afrodite] Número de WhatsApp não configurado. " +
          "Edite a constante PHONE em js/whatsapp.js.\n\n" +
          "Mensagem que seria enviada:\n\n" + msg
      );
      if (AF.toast) AF.toast("Configure o WhatsApp em js/whatsapp.js");
      return;
    }

    var url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank", "noopener");
  }

  /* Conversa avulsa (botão flutuante / contato) */
  function talk(context) {
    var msg = context || "Olá! Vim pelo site e gostaria de tirar uma dúvida.";

    if (!isConfigured()) {
      console.warn("[Afrodite] Configure PHONE em js/whatsapp.js");
      if (AF.toast) AF.toast("Configure o WhatsApp em js/whatsapp.js");
      return;
    }

    window.open(
      "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg),
      "_blank",
      "noopener"
    );
  }

  function bind() {
    var checkoutBtn = document.getElementById("checkout");
    if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-wa]");
      if (!trigger) return;
      e.preventDefault();
      talk(trigger.getAttribute("data-wa") || undefined);
    });
  }

  return {
    init: bind,
    buildMessage: buildMessage,
    checkout: checkout,
    talk: talk,
    isConfigured: isConfigured,
  };
})();
