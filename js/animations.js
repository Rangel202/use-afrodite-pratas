/* ============================================================
   ANIMATIONS — motor de movimento do site
   ------------------------------------------------------------
   Tudo aqui é nativo (IntersectionObserver + requestAnimationFrame).
   Nenhuma biblioteca externa: menos peso, zero requisição de rede
   e nada quebra se o CDN cair.

   Módulos:
   1. reveal        entrada dos elementos no scroll
   2. splitText     texto surgindo palavra por palavra
   3. sparkles      partículas de prata no canvas da hero
   4. magnetic      botões que "puxam" o cursor
   5. tilt          cards 3D
   6. parallax      profundidade no scroll
   7. pointer       mouse move (desktop) + giroscópio (mobile)
   8. cursor        cursor customizado
   9. counters      números que sobem
   10. smooth       scroll com inércia (desktop)
   11. progress     barra de progresso do scroll
   ============================================================ */

window.AF = window.AF || {};

AF.anim = (function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var rafId = null;
  var tasks = []; // funções chamadas a cada frame

  /* Loop único de rAF — evita dezenas de loops concorrentes */
  function loop() {
    for (var i = 0; i < tasks.length; i++) tasks[i]();
    rafId = requestAnimationFrame(loop);
  }

  function addTask(fn) {
    tasks.push(fn);
    if (rafId === null) rafId = requestAnimationFrame(loop);
  }

  function lerp(a, b, n) {
    return a + (b - a) * n;
  }

  /* ==========================================================
     1. REVEAL — entrada no scroll
     ========================================================== */
  var io = null;

  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.documentElement.classList.remove("js");
      return;
    }

    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target); // anima uma vez só
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    observe(document);
  }

  function observe(root) {
    if (!io) return;
    root.querySelectorAll("[data-reveal], .mask-reveal, [data-split]").forEach(
      function (node) {
        if (node.classList.contains("is-in")) return;
        io.observe(node);
      }
    );
  }

  /* ==========================================================
     2. SPLIT TEXT — divide em palavras para revelar em cascata
     ========================================================== */
  function splitText() {
    document.querySelectorAll("[data-split]").forEach(function (node) {
      if (node.dataset.splitDone) return;

      var lines = node.querySelectorAll(".line");
      var targets = lines.length ? lines : [node];

      targets.forEach(function (line) {
        // Percorre os nós filhos em vez de usar textContent: assim
        // tags internas (<em>, <br>, <strong>) sobrevivem à divisão.
        var frag = document.createDocumentFragment();
        var index = 0;

        Array.prototype.slice.call(line.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            // nó de texto → uma palavra por span
            child.textContent
              .split(/(\s+)/)
              .forEach(function (chunk) {
                if (!chunk) return;
                if (/^\s+$/.test(chunk)) {
                  frag.appendChild(document.createTextNode(" "));
                  return;
                }
                var span = document.createElement("span");
                span.className = "split-word";
                span.style.setProperty("--i", index++);
                span.textContent = chunk;
                frag.appendChild(span);
              });
          } else if (child.nodeType === 1) {
            // elemento (ex.: <em>) → embrulha inteiro, preservando o estilo
            var wrap = document.createElement("span");
            wrap.className = "split-word";
            wrap.style.setProperty("--i", index++);
            wrap.appendChild(child.cloneNode(true));
            frag.appendChild(wrap);
          }
        });

        line.innerHTML = "";
        line.appendChild(frag);
        line.classList.add("split-line");
      });

      node.dataset.splitDone = "1";
      node.classList.add("split-ready");
    });
  }

  /* ==========================================================
     3. SPARKLES — partículas de prata na hero
     ========================================================== */
  function initSparkles() {
    var canvas = document.getElementById("sparkles");
    if (!canvas || reduced) return;

    var ctx = canvas.getContext("2d", { alpha: true });
    var hero = canvas.closest(".hero");
    var particles = [];
    var w = 0;
    var h = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var visible = true;

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      // densidade proporcional à área, com teto para não pesar no celular
      var count = Math.min(Math.round((w * h) / 26000), 54);
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.7 + 0.5,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(Math.random() * 0.22 + 0.06),
          a: Math.random(),
          da: Math.random() * 0.012 + 0.004,
        });
      }
    }

    function frame() {
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a > 1 || p.a < 0) p.da *= -1;

        // reciclagem
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        var alpha = Math.max(0, Math.min(1, p.a)) * 0.55;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(150,150,150," + alpha + ")";
        ctx.fill();

        // brilho central
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + alpha * 1.2 + ")";
        ctx.fill();
      }
    }

    resize();
    window.addEventListener("resize", debounce(resize, 200));
    addTask(frame);

    // pausa quando a hero sai da tela — economiza bateria
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(hero);
    }
  }

  /* ==========================================================
     4. MAGNETIC — botões que acompanham o cursor
     ========================================================== */
  function initMagnetic() {
    if (!fine || reduced) return;

    document.querySelectorAll(".magnetic").forEach(function (btn) {
      var bounds;
      var strength = parseFloat(btn.dataset.magnet || "0.34");

      btn.addEventListener("mouseenter", function () {
        bounds = btn.getBoundingClientRect();
        btn.classList.add("is-pulled");
      });

      btn.addEventListener("mousemove", function (e) {
        if (!bounds) return;
        var mx = e.clientX - bounds.left - bounds.width / 2;
        var my = e.clientY - bounds.top - bounds.height / 2;
        btn.style.transform =
          "translate(" + mx * strength + "px," + my * strength + "px)";
      });

      btn.addEventListener("mouseleave", function () {
        btn.classList.remove("is-pulled");
        btn.style.transform = "translate(0,0)";
        bounds = null;
      });
    });
  }

  /* ==========================================================
     5. TILT — cards com inclinação 3D
     ========================================================== */
  function bindTilt(root) {
    if (!fine || reduced) return;

    (root || document).querySelectorAll(".tilt").forEach(function (card) {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";

      var bounds = null;

      card.addEventListener("mouseenter", function () {
        bounds = card.getBoundingClientRect();
        card.classList.add("is-tilting");
      });

      card.addEventListener("mousemove", function (e) {
        if (!bounds) return;
        var px = (e.clientX - bounds.left) / bounds.width - 0.5;
        var py = (e.clientY - bounds.top) / bounds.height - 0.5;

        card.style.transform =
          "perspective(900px) rotateY(" + px * 7 + "deg) rotateX(" +
          -py * 7 + "deg) translateY(-8px)";
      });

      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-tilting");
        card.style.transform = "";
        bounds = null;
      });
    });
  }

  /* ==========================================================
     5b. TOQUE — o card reage ao dedo (brilho + zoom na imagem)
     Substitui o :hover, que não existe em telas de toque.
     ========================================================== */
  function initTouchCards() {
    if (fine) return;

    var current = null;
    var clearTimer = null;

    document.addEventListener(
      "touchstart",
      function (e) {
        var card = e.target.closest(".card, .coll, .reel__item");
        if (!card) return;

        if (current && current !== card) current.classList.remove("is-touch");
        card.classList.add("is-touch");
        current = card;

        clearTimeout(clearTimer);
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      function () {
        if (!current) return;
        var card = current;
        // segura o estado um instante para o brilho completar a passagem
        clearTimer = setTimeout(function () {
          card.classList.remove("is-touch");
          if (current === card) current = null;
        }, 900);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     6. PARALLAX — profundidade no scroll
     Uso: data-parallax="0.18" (fator de deslocamento)
     ========================================================== */
  function initParallax() {
    if (reduced) return;

    var nodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-parallax]")
    );
    if (!nodes.length) return;

    var items = nodes.map(function (node) {
      return {
        node: node,
        factor: parseFloat(node.dataset.parallax) || 0.15,
        current: 0,
        target: 0,
        visible: false,
      };
    });

    // só calcula os que estão na tela
    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          items.forEach(function (it) {
            if (it.node === entry.target) it.visible = entry.isIntersecting;
          });
        });
      }, { rootMargin: "20% 0px" });

      items.forEach(function (it) {
        pio.observe(it.node);
      });
    } else {
      items.forEach(function (it) {
        it.visible = true;
      });
    }

    addTask(function () {
      var vh = window.innerHeight;

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.visible) continue;

        var rect = it.node.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) / vh; // -1 .. 1

        it.target = offset * it.factor * 100;
        it.current = lerp(it.current, it.target, 0.09);

        if (Math.abs(it.current - it.target) < 0.01) it.current = it.target;
        it.node.style.transform = "translate3d(0," + it.current.toFixed(2) + "px,0)";
      }
    });
  }

  /* ==========================================================
     7. POINTER — mouse move (desktop) e giroscópio (mobile)
     Move as camadas da hero criando profundidade.
     ========================================================== */
  function initPointer() {
    if (reduced) return;

    var layers = document.querySelectorAll("[data-depth]");
    if (!layers.length) return;

    var tx = 0, ty = 0;   // alvo normalizado (-1 .. 1)
    var cx = 0, cy = 0;   // valor suavizado

    if (fine) {
      window.addEventListener(
        "mousemove",
        function (e) {
          tx = (e.clientX / window.innerWidth - 0.5) * 2;
          ty = (e.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
      );
    }

    /* Giroscópio — precisa de permissão explícita no iOS 13+ */
    function attachGyro() {
      window.addEventListener(
        "deviceorientation",
        function (e) {
          if (e.gamma === null || e.beta === null) return;
          tx = Math.max(-1, Math.min(1, e.gamma / 34));   // esquerda/direita
          ty = Math.max(-1, Math.min(1, (e.beta - 45) / 40)); // frente/trás
        },
        { passive: true }
      );
    }

    if (!fine && window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // iOS: só podemos pedir dentro de um gesto do usuário
        var ask = function () {
          DeviceOrientationEvent.requestPermission()
            .then(function (state) {
              if (state === "granted") attachGyro();
            })
            .catch(function () {});
          document.removeEventListener("touchend", ask);
        };
        document.addEventListener("touchend", ask, { once: true });
      } else {
        attachGyro();
      }
    }

    addTask(function () {
      cx = lerp(cx, tx, 0.055);
      cy = lerp(cy, ty, 0.055);

      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var depth = parseFloat(layer.dataset.depth) || 0.2;
        var rot = layer.dataset.depthRotate === "1";

        var x = -cx * depth * 34;
        var y = -cy * depth * 34;

        layer.style.transform = rot
          ? "translate3d(" + x + "px," + y + "px,0) rotateY(" +
            cx * depth * 9 + "deg) rotateX(" + -cy * depth * 9 + "deg)"
          : "translate3d(" + x + "px," + y + "px,0)";
      }
    });
  }

  /* ==========================================================
     8. CURSOR — ponto + anel que persegue
     ========================================================== */
  function initCursor() {
    if (!fine || reduced) return;

    var dot = document.querySelector(".cursor");
    var ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-cursor");

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;

    window.addEventListener(
      "mousemove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      },
      { passive: true }
    );

    addTask(function () {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
    });

    // aumenta sobre elementos interativos
    var hot = "a, button, .card, .coll, input, .chip, .faq__q, .insta__cell";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hot)) ring.classList.add("is-hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hot)) ring.classList.remove("is-hot");
    });
  }

  /* ==========================================================
     9. COUNTERS — números que sobem quando aparecem
     Uso: <b data-count="1200" data-suffix="+">0</b>
     ========================================================== */
  function initCounters() {
    var nodes = document.querySelectorAll("[data-count]");
    if (!nodes.length || !("IntersectionObserver" in window)) return;

    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          cio.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    nodes.forEach(function (n) {
      cio.observe(n);
    });

    function run(node) {
      var end = parseFloat(node.dataset.count) || 0;
      var suffix = node.dataset.suffix || "";
      var decimals = parseInt(node.dataset.decimals || "0", 10);
      var duration = 1500;

      if (reduced) {
        node.textContent = end.toFixed(decimals) + suffix;
        return;
      }

      var start = performance.now();

      function step(now) {
        var t = Math.min((now - start) / duration, 1);
        // easeOutExpo
        var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        var value = end * eased;

        node.textContent =
          value.toLocaleString("pt-BR", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) + suffix;

        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }
  }

  /* ==========================================================
     10. SMOOTH SCROLL — inércia no desktop
     No celular o scroll nativo já é suave e com momentum,
     então não interferimos: é mais leve e mais previsível.
     ========================================================== */
  var smooth = null;

  function initSmooth() {
    if (!fine || reduced) return;

    var target = window.scrollY;
    var current = window.scrollY;
    var running = false;
    var enabled = true;

    function maxScroll() {
      return document.documentElement.scrollHeight - window.innerHeight;
    }

    function onWheel(e) {
      if (!enabled) return;
      if (e.ctrlKey) return; // zoom do navegador
      e.preventDefault();

      target += e.deltaMode === 1 ? e.deltaY * 18 : e.deltaY;
      target = Math.max(0, Math.min(target, maxScroll()));

      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }

    function tick() {
      current = lerp(current, target, 0.11);

      if (Math.abs(target - current) < 0.4) {
        current = target;
        running = false;
      }

      window.scrollTo(0, current);
      if (running) requestAnimationFrame(tick);
    }

    // mantém em sincronia quando o scroll vem de outra fonte
    window.addEventListener(
      "scroll",
      function () {
        if (!running) {
          current = window.scrollY;
          target = window.scrollY;
        }
      },
      { passive: true }
    );

    window.addEventListener("wheel", onWheel, { passive: false });

    smooth = {
      stop: function () {
        enabled = false;
      },
      start: function () {
        current = window.scrollY;
        target = window.scrollY;
        enabled = true;
      },
      to: function (y) {
        target = Math.max(0, Math.min(y, maxScroll()));
        current = window.scrollY;
        if (!running) {
          running = true;
          requestAnimationFrame(tick);
        }
      },
    };

    AF.lenis = smooth; // nome mantido para quem já usa AF.lenis
  }

  /* ==========================================================
     11. PROGRESS — barra de leitura no topo
     ========================================================== */
  function initProgress() {
    var bar = document.getElementById("progress");
    if (!bar) return;

    var ticking = false;

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + pct.toFixed(4) + ")";
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

    update();
  }

  /* ==========================================================
     Utilitário
     ========================================================== */
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(null, args);
      }, wait);
    };
  }

  /* ==========================================================
     Init
     ========================================================== */
  function init() {
    splitText();
    initReveal();
    initSparkles();
    initMagnetic();
    bindTilt(document);
    initTouchCards();
    initParallax();
    initPointer();
    initCursor();
    initCounters();
    initSmooth();
    initProgress();
  }

  return {
    init: init,
    observe: observe,
    bindTilt: bindTilt,
    addTask: addTask,
    lerp: lerp,
  };
})();
