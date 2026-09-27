/* ==========================================================================
   Dinno App: landing. Único JavaScript da página, sem dependência e sem build.
   ==========================================================================

   O que mora aqui, e de onde cada efeito vem no app:
     1. Um único requestAnimationFrame para tudo que anima por quadro (warp e
        contador), parado com a aba oculta.
     2. Warp: reimplementação de components/login/fundo-warp.tsx, com os
        parâmetros da landing decididos em 16/09/2026.
     3. Entrada das peças: .entra-item (260ms, 10px, 60ms por índice) e
        .entra-marco (320ms, -8px, 70ms por índice) de app/globals.css.
     4. Contador: components/ui/valor-animado.tsx (easeOutCubic, 700ms).
     5. Confete: components/ui/confete.tsx (52 peças, 1200ms, largada em até
        160ms, limpeza em 1200 + 160 + 80ms).
     6. Demonstração de aprovação: os botões Aprovar, Reprovar e Repetir.

   Com prefers-reduced-motion: reduce, nada disso anima. Sem canvas, sem rAF,
   sem confete, sem entrada; o contador mostra o valor final. Sem JavaScript,
   a página inteira aparece com os números finais que já estão no HTML.

   Nenhum hex aqui: toda cor é lida das custom properties do :root.
   ========================================================================== */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var reduzido =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temObservador = typeof window.IntersectionObserver === "function";

  function token(nome) {
    return getComputedStyle(raiz).getPropertyValue(nome).trim();
  }

  /* ------------------------------------------------------------------------
     1. Agenda: um rAF só
     ------------------------------------------------------------------------ */
  var tarefas = [];
  var quadro = null;

  function laco(agora) {
    quadro = null;
    var vivas = [];
    for (var i = 0; i < tarefas.length; i++) {
      if (tarefas[i](agora) !== false) vivas.push(tarefas[i]);
    }
    tarefas = vivas;
    if (tarefas.length && !document.hidden) quadro = window.requestAnimationFrame(laco);
  }

  function agendar(tarefa) {
    tarefas.push(tarefa);
    if (quadro === null && !document.hidden) quadro = window.requestAnimationFrame(laco);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (quadro !== null) window.cancelAnimationFrame(quadro);
      quadro = null;
    } else if (tarefas.length && quadro === null) {
      quadro = window.requestAnimationFrame(laco);
    }
  });

  /* ------------------------------------------------------------------------
     2. Warp: o parabrisa da nave, atrás da página inteira
     ------------------------------------------------------------------------
     Mesma projeção do login do app (profundidade 1400, rastro da posição
     anterior à atual). Parâmetros da landing, de 16/09/2026: 800 estrelas por
     milhão de px, teto de 460, velocidade 12, raio até 3,2px, alpha
     0,45 + proximidade x 0,9 e opacidade 0,9 no canvas (no CSS). O canvas só
     entra se der para desenhar; aí o <html> ganha `js-warp` e o céu estático
     sai. */
  (function warp() {
    if (reduzido) return;
    var PROFUNDIDADE = 1400;
    var ESTRELAS_POR_MILHAO_DE_PX = 800;
    var MAXIMO_ESTRELAS = 460;
    var VELOCIDADE = 12;

    var canvas = document.createElement("canvas");
    if (!canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var cor = token("--cor-estrela");
    if (!cor) return;

    canvas.className = "estrelas-warp";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    raiz.classList.add("js-warp");

    var largura = 0;
    var altura = 0;
    var estrelas = [];
    var espera = null;

    function sortear(z) {
      var zi = typeof z === "number" ? z : Math.random() * PROFUNDIDADE;
      return { x: (Math.random() - 0.5) * largura, y: (Math.random() - 0.5) * altura, z: zi, zAnterior: zi };
    }

    function dimensionar() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = window.innerWidth;
      altura = window.innerHeight;
      canvas.width = Math.floor(largura * dpr);
      canvas.height = Math.floor(altura * dpr);
      canvas.style.width = largura + "px";
      canvas.style.height = altura + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var quantidade = Math.min(MAXIMO_ESTRELAS, Math.round((largura * altura * ESTRELAS_POR_MILHAO_DE_PX) / 1000000));
      estrelas = [];
      for (var i = 0; i < quantidade; i++) estrelas.push(sortear());
    }

    function desenhar() {
      var cx = largura / 2;
      var cy = altura / 2;
      ctx.clearRect(0, 0, largura, altura);
      ctx.strokeStyle = cor;
      ctx.lineCap = "round";
      for (var i = 0; i < estrelas.length; i++) {
        var e = estrelas[i];
        e.zAnterior = e.z;
        e.z -= VELOCIDADE;
        if (e.z <= 1) {
          estrelas[i] = e = sortear(PROFUNDIDADE);
        }
        var k = PROFUNDIDADE / e.z;
        var x = cx + e.x * k;
        var y = cy + e.y * k;
        if (x < -60 || x > largura + 60 || y < -60 || y > altura + 60) continue;
        var proximidade = 1 - e.z / PROFUNDIDADE;
        var kAnterior = PROFUNDIDADE / e.zAnterior;
        ctx.globalAlpha = Math.min(1, 0.45 + proximidade * 0.9);
        ctx.lineWidth = Math.max(0.6, proximidade * 3.2);
        ctx.beginPath();
        ctx.moveTo(cx + e.x * kAnterior, cy + e.y * kAnterior);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return true;
    }

    dimensionar();
    agendar(desenhar);

    function aoRedimensionar() {
      if (espera) clearTimeout(espera);
      espera = setTimeout(dimensionar, 150);
    }
    window.addEventListener("resize", aoRedimensionar);
    window.addEventListener("orientationchange", aoRedimensionar);
  })();

  /* ------------------------------------------------------------------------
     4. Contador (usado pela entrada e pela demonstração)
     ------------------------------------------------------------------------ */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function contar(el, de, ate) {
    el.setAttribute("data-valor", String(ate));
    if (reduzido || de === ate) {
      el.textContent = String(ate);
      return;
    }
    var inicio = null;
    agendar(function (agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min((agora - inicio) / 700, 1);
      el.textContent = String(Math.round(de + (ate - de) * easeOutCubic(t)));
      return t < 1;
    });
  }

  /* ------------------------------------------------------------------------
     3. Entrada das peças + pausa da brasa fora da tela
     ------------------------------------------------------------------------ */
  if (temObservador && !reduzido) {
    var pecas = document.querySelectorAll("[data-entra]");
    raiz.classList.add("js-entra");

    var entrada = new IntersectionObserver(
      function (itens) {
        var ordem = 0;
        for (var i = 0; i < itens.length; i++) {
          if (!itens[i].isIntersecting) continue;
          var alvo = itens[i].target;
          entrada.unobserve(alvo);
          if (alvo.getAttribute("data-entra") !== "marco") {
            // Só as 8 primeiras de uma leva escalonam (indiceDeEntrada do app).
            alvo.style.setProperty("--i", String(ordem < 8 ? ordem : 0));
            ordem++;
          }
          alvo.classList.add("entrando");
          var contador = alvo.querySelector("[data-contador]");
          if (contador) {
            var final = Number(contador.getAttribute("data-valor")) || 0;
            contar(contador, 0, final);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    for (var p = 0; p < pecas.length; p++) entrada.observe(pecas[p]);

    // Ao terminar, sai a classe da animação e fica o estado normal.
    document.addEventListener("animationend", function (ev) {
      var el = ev.target;
      if (!el.classList || !el.classList.contains("entrando")) return;
      if (ev.animationName !== "entra-item" && ev.animationName !== "entra-marco") return;
      el.classList.remove("entrando");
      el.classList.add("entrou");
      el.style.removeProperty("--i");
    });
  }

  if (temObservador) {
    var brasas = document.querySelectorAll(".super-missao");
    var vigia = new IntersectionObserver(function (itens) {
      for (var i = 0; i < itens.length; i++) {
        itens[i].target.classList.toggle("pausado", !itens[i].isIntersecting);
      }
    });
    for (var b = 0; b < brasas.length; b++) vigia.observe(brasas[b]);
  }

  /* ------------------------------------------------------------------------
     5. Confete
     ------------------------------------------------------------------------ */
  var CORES_CONFETE = [
    "--missoes-accent",
    "--carteira-accent",
    "--amigos-accent",
    "--perfil-accent",
    "--dashboard-accent",
    "--aprovacoes-accent",
    "--multas-accent",
    "--saques-accent",
  ];

  function confete() {
    if (reduzido) return;
    var cores = [];
    for (var c = 0; c < CORES_CONFETE.length; c++) {
      var valor = token(CORES_CONFETE[c]);
      if (valor) cores.push(valor);
    }
    if (!cores.length) return;
    var camada = document.createElement("div");
    camada.className = "confete";
    camada.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 52; i++) {
      var peca = document.createElement("span");
      peca.className = "confete-peca";
      peca.style.left = Math.random() * 100 + "%";
      peca.style.width = 6 + Math.random() * 6 + "px";
      peca.style.height = 8 + Math.random() * 10 + "px";
      peca.style.background = cores[Math.floor(Math.random() * cores.length)];
      peca.style.borderRadius = Math.random() < 0.35 ? "9999px" : "2px";
      peca.style.animationDelay = Math.random() * 160 + "ms";
      peca.style.setProperty("--desvio", (Math.random() - 0.5) * 220 + "px");
      peca.style.setProperty("--giro", 360 + Math.random() * 720 + "deg");
      camada.appendChild(peca);
    }
    document.body.appendChild(camada);
    setTimeout(function () {
      camada.remove();
    }, 1200 + 160 + 80);
  }

  /* ------------------------------------------------------------------------
     6. Demonstração de aprovação
     ------------------------------------------------------------------------ */
  var demo = document.querySelector("[data-demo='aprovacao']");
  if (demo) {
    var acoes = demo.querySelector("[data-demo-acoes]");
    var resultado = demo.querySelector("[data-demo-resultado]");
    var aprovada = demo.querySelector("[data-demo-aprovada]");
    var reprovada = demo.querySelector("[data-demo-reprovada]");
    var motivo = demo.querySelector("[data-demo-motivo]");
    var saldo = demo.querySelector("[data-contador]");
    var anuncio = demo.querySelector("[data-demo-anuncio]");
    var SALDO_INICIAL = 1240;
    var VALOR_MISSAO = 50;

    demo.addEventListener("click", function (ev) {
      var botao = ev.target.closest("[data-acao]");
      if (!botao) return;
      var acao = botao.getAttribute("data-acao");
      if (acao === "aprovar") {
        acoes.hidden = true;
        resultado.hidden = false;
        aprovada.hidden = false;
        reprovada.hidden = true;
        motivo.hidden = true;
        confete();
        contar(saldo, Number(saldo.getAttribute("data-valor")) || SALDO_INICIAL, SALDO_INICIAL + VALOR_MISSAO);
        anuncio.textContent = "Aprovada. Saldo da carteira: " + (SALDO_INICIAL + VALOR_MISSAO) + " Starcoin.";
      } else if (acao === "reprovar") {
        acoes.hidden = true;
        resultado.hidden = false;
        aprovada.hidden = true;
        reprovada.hidden = false;
        motivo.hidden = false;
        anuncio.textContent = "Reprovada. Motivo: Faltou arrumar a cama";
      } else if (acao === "repetir") {
        acoes.hidden = false;
        resultado.hidden = true;
        aprovada.hidden = true;
        reprovada.hidden = true;
        motivo.hidden = true;
        contar(saldo, Number(saldo.getAttribute("data-valor")) || SALDO_INICIAL, SALDO_INICIAL);
        anuncio.textContent = "";
      }
    });
  }
})();
