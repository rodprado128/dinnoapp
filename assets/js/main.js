/* ==========================================================================
   Dinno App — landing: revelação no scroll + campo de estrelas em warp
   ==========================================================================

   Único JavaScript da página. Sem dependência, sem build step.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Revelação no scroll — leve, uma vez por elemento.
   --------------------------------------------------------------------------
   A marca `.js-revela` é o contrato com o CSS: só com ela o estado escondido
   existe. Sem JavaScript, sem `IntersectionObserver` ou com
   `prefers-reduced-motion`, a classe nunca entra e a página nasce visível.
   -------------------------------------------------------------------------- */
(function () {
  "use strict";

  var reduzido =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzido || typeof window.IntersectionObserver !== "function") return;

  var alvos = document.querySelectorAll(".revela");
  if (!alvos.length) return;

  document.documentElement.classList.add("js-revela");

  var observador = new IntersectionObserver(
    function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (!entradas[i].isIntersecting) continue;
        entradas[i].target.classList.add("visivel");
        observador.unobserve(entradas[i].target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  for (var j = 0; j < alvos.length; j++) observador.observe(alvos[j]);
})();

/* --------------------------------------------------------------------------
   2. Campo de estrelas em warp — o parabrisa da nave
   --------------------------------------------------------------------------
   Mesma ideia do fundo da tela de login do app
   (`components/login/fundo-warp.tsx`): projeção em perspectiva, rastro ligando
   a posição anterior à atual, Canvas 2D. O app e a landing são repositórios
   separados, sem build compartilhado — isto é reimplementação, não import.
   Mexeu num, confira o outro.

   DIFERENÇA DELIBERADA EM RELAÇÃO À VERSÃO ANTERIOR DESTA PÁGINA: antes eram
   dois canvas presos ao herói e à chamada final, com 400 estrelas por milhão
   de pixels, teto de 300, velocidade 7,5 e opacidade 0,55. O resto da página
   não tinha céu, e o efeito passava despercebido. Agora é UM canvas fixo atrás
   da página inteira, com o dobro da densidade, teto maior, velocidade maior e
   estrela maior e mais brilhante. O que protege a leitura não é apagar o
   efeito — é o `.scrim` atrás do texto.

   O que este arquivo TEM de manter:
     - `prefers-reduced-motion: reduce` não inicializa nada. Nem canvas, nem
       rAF, nem listener. A página fica com o campo ESTÁTICO em CSS, que já
       está no HTML. Não é opcional.
     - loop parado quando a aba está oculta (`visibilitychange`);
     - devicePixelRatio respeitado, com teto de 2;
     - teto de estrelas, para não custar caro em tela grande nem em Android
       médio;
     - cor lida de `--cor-estrela` no `:root`. Nenhum hex solto aqui.
   -------------------------------------------------------------------------- */
(function () {
  "use strict";

  /** Plano mais distante. A projeção multiplica por PROFUNDIDADE / z. */
  var PROFUNDIDADE = 1400;
  /** Densidade e teto. O dobro da versão anterior: é o pedido de "mais evidente". */
  var ESTRELAS_POR_MILHAO_DE_PX = 800;
  var MAXIMO_ESTRELAS = 460;
  var VELOCIDADE = 12;
  var COR_PADRAO = "#f2edff";

  var reduzido =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzido) return;
  if (!document.createElement("canvas").getContext) return;

  var cor =
    getComputedStyle(document.documentElement).getPropertyValue("--cor-estrela").trim() ||
    COR_PADRAO;

  var canvas = document.createElement("canvas");
  canvas.className = "estrelas-warp";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  document.body.appendChild(canvas);
  // Só agora o campo estático sai: se o canvas não tivesse entrado, a página
  // continuaria com as estrelas de radial-gradient.
  document.documentElement.classList.add("js-warp");

  var largura = 0;
  var altura = 0;
  var estrelas = [];
  var frame = null;
  var timerResize = null;

  /** Uma estrela em coordenadas de câmera; z é a profundidade. */
  function sortear(z) {
    var zi = typeof z === "number" ? z : Math.random() * PROFUNDIDADE;
    return {
      // Faixa de exatamente uma tela no plano do fundo: como k vale 1 lá e
      // cresce à medida que a estrela se aproxima, tudo que vem para a frente
      // se espalha para fora do quadro.
      x: (Math.random() - 0.5) * largura,
      y: (Math.random() - 0.5) * altura,
      z: zi,
      zAnterior: zi,
    };
  }

  function dimensionar() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = Math.floor(largura * dpr);
    canvas.height = Math.floor(altura * dpr);
    canvas.style.width = largura + "px";
    canvas.style.height = altura + "px";
    // Desenha em pixels CSS; o dpr entra só na escala.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var quantidade = Math.min(
      MAXIMO_ESTRELAS,
      Math.round((largura * altura * ESTRELAS_POR_MILHAO_DE_PX) / 1000000)
    );
    estrelas = [];
    for (var i = 0; i < quantidade; i++) estrelas.push(sortear());
  }

  function desenhar(comRastro) {
    var cx = largura / 2;
    var cy = altura / 2;

    ctx.clearRect(0, 0, largura, altura);
    ctx.strokeStyle = cor;
    ctx.fillStyle = cor;
    ctx.lineCap = "round";

    for (var i = 0; i < estrelas.length; i++) {
      var e = estrelas[i];
      var k = PROFUNDIDADE / e.z;
      var x = cx + e.x * k;
      var y = cy + e.y * k;
      if (x < -60 || x > largura + 60 || y < -60 || y > altura + 60) continue;

      // Perto = maior e mais opaca. Maior e mais brilhante que antes.
      var proximidade = 1 - e.z / PROFUNDIDADE;
      var raio = Math.max(0.6, proximidade * 3.2);

      ctx.globalAlpha = Math.min(1, 0.45 + proximidade * 0.9);

      if (comRastro) {
        var kAnterior = PROFUNDIDADE / e.zAnterior;
        ctx.lineWidth = raio;
        ctx.beginPath();
        ctx.moveTo(cx + e.x * kAnterior, cy + e.y * kAnterior);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  function passo() {
    for (var i = 0; i < estrelas.length; i++) {
      var e = estrelas[i];
      e.zAnterior = e.z;
      e.z -= VELOCIDADE;
      // Renasce no fundo, em outro ponto.
      if (e.z <= 1) estrelas[i] = sortear(PROFUNDIDADE);
    }
    desenhar(true);

    if (document.hidden) {
      frame = null;
      return;
    }
    frame = window.requestAnimationFrame(passo);
  }

  function iniciar() {
    if (frame !== null || document.hidden) return;
    frame = window.requestAnimationFrame(passo);
  }

  function parar() {
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
  }

  function aoRedimensionar() {
    if (timerResize) clearTimeout(timerResize);
    timerResize = setTimeout(dimensionar, 150);
  }

  dimensionar();
  iniciar();

  window.addEventListener("resize", aoRedimensionar);
  window.addEventListener("orientationchange", aoRedimensionar);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) parar();
    else iniciar();
  });
})();
