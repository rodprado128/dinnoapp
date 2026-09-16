/* ==========================================================================
   Campo de estrelas em warp — o parabrisa da nave em velocidade da luz.
   ==========================================================================

   É a MESMA ideia (e os mesmos parâmetros) do fundo da tela de login do app
   Next.js — `components/login/fundo-warp.tsx`: profundidade 1400, 400 estrelas
   por milhão de pixels com teto de 300, velocidade 7,5 e rastro ligando a
   posição anterior à atual. O app e a landing são repositórios separados, sem
   build compartilhado, então isto é uma reimplementação em JS puro, não um
   import. Mexeu num, confira o outro.

   O que este arquivo TEM de manter:
     - `prefers-reduced-motion: reduce` não inicializa nada. Nem canvas, nem
       rAF, nem listener. A página cai no campo estático em CSS que já existia
       (`.ceu::after`). Não é opcional.
     - um único requestAnimationFrame para TODAS as seções de céu;
     - loop parado quando a aba está oculta (`visibilitychange`) e quando
       nenhuma seção de céu está na tela (IntersectionObserver);
     - devicePixelRatio respeitado, com teto de 2;
     - contagem de estrelas proporcional à área, com teto baixo, para rodar
       liso em Android médio;
     - cor lida de `--cor-estrela` no `:root`. Nenhum hex solto aqui: a marca
       inteira continua morando no CSS.

   É a única linha de JavaScript da página. O FAQ segue em `<details>` nativo.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Revelação no scroll — leve, uma vez por elemento.
   --------------------------------------------------------------------------
   Vem ANTES do campo de estrelas de propósito: é a parte que mexe em conteúdo
   de verdade, e quanto antes a classe entrar no <html>, menor a chance de o
   usuário ver o conteúdo aparecer e sumir.

   A marca `.js-revela` é o contrato com o CSS: só com ela o estado escondido
   existe. Sem JavaScript, sem `IntersectionObserver` ou com
   `prefers-reduced-motion`, a classe nunca entra e a página fica visível do
   jeito que sempre esteve.
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

(function () {
  "use strict";

  /** Plano mais distante. A projeção multiplica por PROFUNDIDADE / z. */
  var PROFUNDIDADE = 1400;
  /** Densidade e teto: o teto é o que segura o custo em tela grande. */
  var ESTRELAS_POR_MILHAO_DE_PX = 400;
  var MAXIMO_ESTRELAS = 300;
  var VELOCIDADE = 7.5;
  var COR_PADRAO = "#e2dcff";

  var reduzido =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzido) return;

  var secoes = document.querySelectorAll(".ceu");
  if (!secoes.length) return;
  if (!document.createElement("canvas").getContext) return;

  var cor =
    getComputedStyle(document.documentElement).getPropertyValue("--cor-estrela").trim() ||
    COR_PADRAO;

  var campos = [];
  var frame = null;
  var timerResize = null;

  /** Uma estrela em coordenadas de câmera; z é a profundidade. */
  function sortear(largura, altura, z) {
    var zi = typeof z === "number" ? z : Math.random() * PROFUNDIDADE;
    return {
      // Faixa de exatamente uma tela no plano do fundo: como k vale 1 lá e
      // cresce à medida que a estrela se aproxima, tudo que vem para a frente
      // se espalha para fora do quadro. Com um fator maior, a maioria das
      // estrelas nasceria fora da tela e o céu ficaria vazio.
      x: (Math.random() - 0.5) * largura,
      y: (Math.random() - 0.5) * altura,
      z: zi,
      zAnterior: zi,
    };
  }

  function dimensionar(campo) {
    var caixa = campo.secao.getBoundingClientRect();
    var largura = Math.max(1, Math.round(caixa.width));
    var altura = Math.max(1, Math.round(caixa.height));
    if (largura === campo.largura && altura === campo.altura) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    campo.largura = largura;
    campo.altura = altura;
    campo.canvas.width = Math.floor(largura * dpr);
    campo.canvas.height = Math.floor(altura * dpr);
    // Desenha em pixels CSS; o dpr entra só na escala.
    campo.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var quantidade = Math.min(
      MAXIMO_ESTRELAS,
      Math.round((largura * altura * ESTRELAS_POR_MILHAO_DE_PX) / 1000000)
    );
    campo.estrelas = [];
    for (var i = 0; i < quantidade; i++) campo.estrelas.push(sortear(largura, altura));
  }

  function desenhar(campo) {
    var ctx = campo.ctx;
    var cx = campo.largura / 2;
    var cy = campo.altura / 2;

    ctx.clearRect(0, 0, campo.largura, campo.altura);
    ctx.strokeStyle = cor;
    ctx.lineCap = "round";

    for (var i = 0; i < campo.estrelas.length; i++) {
      var e = campo.estrelas[i];
      var k = PROFUNDIDADE / e.z;
      var x = cx + e.x * k;
      var y = cy + e.y * k;
      if (x < -50 || x > campo.largura + 50 || y < -50 || y > campo.altura + 50) continue;

      // Perto = maior e mais opaco.
      var proximidade = 1 - e.z / PROFUNDIDADE;
      var raio = Math.max(0.5, proximidade * 2.4);
      var kAnterior = PROFUNDIDADE / e.zAnterior;

      ctx.globalAlpha = Math.min(1, 0.35 + proximidade * 0.9);
      ctx.lineWidth = raio;
      ctx.beginPath();
      ctx.moveTo(cx + e.x * kAnterior, cy + e.y * kAnterior);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  function passo() {
    var algumVisivel = false;

    for (var i = 0; i < campos.length; i++) {
      var campo = campos[i];
      if (!campo.visivel) continue;
      algumVisivel = true;

      for (var j = 0; j < campo.estrelas.length; j++) {
        var e = campo.estrelas[j];
        e.zAnterior = e.z;
        e.z -= VELOCIDADE;
        // Renasce no fundo, em outro ponto.
        if (e.z <= 1) campo.estrelas[j] = sortear(campo.largura, campo.altura, PROFUNDIDADE);
      }

      desenhar(campo);
    }

    // Nenhuma seção de céu na tela: não há o que animar até alguma voltar.
    if (!algumVisivel || document.hidden) {
      frame = null;
      return;
    }
    frame = window.requestAnimationFrame(passo);
  }

  function iniciar() {
    if (frame !== null || document.hidden) return;
    var algumVisivel = false;
    for (var i = 0; i < campos.length; i++) if (campos[i].visivel) algumVisivel = true;
    if (!algumVisivel) return;
    frame = window.requestAnimationFrame(passo);
  }

  function parar() {
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
  }

  // --- Montagem ------------------------------------------------------------
  for (var i = 0; i < secoes.length; i++) {
    var secao = secoes[i];
    var canvas = document.createElement("canvas");
    canvas.className = "ceu__estrelas";
    canvas.setAttribute("aria-hidden", "true");
    var ctx = canvas.getContext("2d");
    if (!ctx) continue;

    secao.insertBefore(canvas, secao.firstChild);
    // Só agora o campo estático do CSS sai de cena: se o canvas não tivesse
    // entrado, a página continuaria com as estrelas de radial-gradient.
    secao.classList.add("ceu--animado");

    var campo = {
      secao: secao,
      canvas: canvas,
      ctx: ctx,
      largura: 0,
      altura: 0,
      estrelas: [],
      visivel: true,
    };
    dimensionar(campo);
    campos.push(campo);
  }

  if (!campos.length) return;

  // --- Só anima o que está na tela ----------------------------------------
  if (typeof window.IntersectionObserver === "function") {
    var observador = new IntersectionObserver(
      function (entradas) {
        for (var i = 0; i < entradas.length; i++) {
          for (var j = 0; j < campos.length; j++) {
            if (campos[j].secao === entradas[i].target) campos[j].visivel = entradas[i].isIntersecting;
          }
        }
        iniciar();
      },
      { rootMargin: "120px" }
    );
    for (var k = 0; k < campos.length; k++) observador.observe(campos[k].secao);
  }

  // --- Redimensionamento ---------------------------------------------------
  function aoRedimensionar() {
    if (timerResize) clearTimeout(timerResize);
    timerResize = setTimeout(function () {
      for (var i = 0; i < campos.length; i++) dimensionar(campos[i]);
    }, 150);
  }

  window.addEventListener("resize", aoRedimensionar);
  window.addEventListener("orientationchange", aoRedimensionar);
  // A altura de uma seção muda quando as imagens carregam e quando o FAQ abre.
  window.addEventListener("load", aoRedimensionar);
  if (typeof window.ResizeObserver === "function") {
    var observadorDeTamanho = new ResizeObserver(aoRedimensionar);
    for (var m = 0; m < campos.length; m++) observadorDeTamanho.observe(campos[m].secao);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) parar();
    else iniciar();
  });

  iniciar();
})();
