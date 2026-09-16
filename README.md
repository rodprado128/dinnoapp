# Dinno — landing de conversão

Página única, estática, publicada em <https://dinnoapp.forjadev.app.br/>, cujo
único trabalho é levar o visitante para <https://dinno-app.vercel.app/>.

**Não faz parte do app Next.js.** É HTML + CSS puro: sem build, sem framework,
sem `npm install`. O motivo é o deploy — ela publica no GitHub Pages sem
pipeline, e mexer nela nunca derruba nem reimplanta o produto.

```
index.html              a página inteira
assets/css/styles.css   TODO o visual
assets/js/main.js       o ÚNICO script: estrelas em warp + revelação no scroll
assets/img/             logo, mascote, favicons e o cartão de compartilhamento
robots.txt              libera a indexação e aponta o sitemap
sitemap.xml             a única URL deste site
CNAME                   o domínio próprio servido pelo GitHub Pages
```

`assets/js/main.js` é o único JavaScript da página: o fundo animado do herói e
da chamada final, e a revelação das peças no scroll — o mesmo efeito da tela de
login do app (`components/login/fundo-warp.tsx`), reimplementado em JS puro
porque os dois repositórios não compartilham build. Fora dele, nada precisa de
script: o FAQ é `<details>`/`<summary>` nativo.

**Com `prefers-reduced-motion: reduce`, nada é inicializado** — nem canvas, nem
`requestAnimationFrame`, nem listener — e a página cai no campo de estrelas
estático em CSS que sempre existiu. Sem JavaScript, o mesmo. Os dois céus nunca
aparecem juntos: quem monta o canvas marca a seção com `.ceu--animado`, e é essa
classe que desliga o estático.

## Rodar local

Qualquer servidor estático serve. Abrir o `index.html` com `file://` também
funciona, mas o `<picture>` e as fontes se comportam melhor via HTTP:

```bash
npx serve .          # ou: python -m http.server 8080
```

## Trocar a marca

**A marca inteira mora no `:root` de `assets/css/styles.css`.** Cores, raios,
sombras, fonte e ritmo — tudo em custom property, e nenhum hex solto no meio das
regras. Um rebranding é reescrever aquele bloco.

O que **não** está lá e precisa de mão:

- as imagens em `assets/img/`;
- o `<title>`, a `meta description`, as tags Open Graph e o JSON-LD no `<head>`;
- a palavra "Dinno" no cabeçalho, no rodapé e na copy.

Duas exceções no `:root` que **não** são da marca Dinno e não devem ser
reescritas num rebranding: `--cor-forjadev-corpo` e `--cor-forjadev-faisca`,
que pertencem à marca de quem desenvolve (ver abaixo).

**A fonte de verdade visual é o `BRANDING_DINNO.md` do repositório do app.** Não
existe um hex inventado nesta folha: todo token é cópia literal do guia, e onde
qualquer material antigo divergir dele, o guia manda.

O que o guia define e esta página segue à risca:

- **tema escuro como padrão** (`#140F26` de fundo, `#211A38` nas peças). O tema
  claro existe, é completo e passa AA igual — os dois são auditados;
- **peça de plástico injetado**: borda de 2px, sombra DURA deslocada para baixo,
  raio de 32px em card e pílula em botão. Nada de vidro, blur, `backdrop-filter`
  ou gradiente como fundo de card — a versão anterior desta página tinha essa
  estética e ela saiu por inteiro;
- **um accent por peça**: a landing inteira usa `missoes` (`#9A6BFF`), porque a
  missão é a metáfora central do produto. O dourado do Starcoin (`#FFC93C`) é a
  única cor que convive com qualquer accent e aparece sempre que a moeda é
  citada;
- **wordmark de quatro fills fixos** (`#88FF55` / `#0088FF` / `#6E52FF` /
  `#C1F120`). É a única peça da marca que não troca de cor por contexto — nem
  por tema, nem por accent;
- **Baloo 2** na escala do guia, sentence case em tudo. A marca não tem
  uppercase e Baloo 2 não tem itálico;
- **Material Symbols Rounded**, `FILL 1` / `wght 600`, carregado com
  `icon_names` para vir só com os glifos usados aqui;
- **aurora** de fundo a 12% no escuro e 6% no claro, em loop de 78s;
- `prefers-reduced-motion: reduce` desliga tudo. O guia trata isso como
  não-negociável.

## Imagens

Vieram de `Dinno app/Landing Page/`, com nomes normalizados (minúsculas, sem
espaço, sem acento). Três delas tinham o fundo branco **chapado dentro do
pixel** — não era transparência de verdade. O fundo foi removido por *flood
fill* a partir das bordas, nunca por *color key*: o traje espacial do mascote é
branco e um color key o deixaria furado.

| Original | Aqui | Onde aparece |
| --- | --- | --- |
| `logo.png` | `logo-dinno.png` | origem dos favicons |
| `logo.png` (recorte) | `logo-marca.png` | cabeçalho e rodapé |
| `dino logo com moeda.png` | `mascote-moeda.png` | herói |
| `dupla dino pulando.png` | `mascote-dupla.png` | seção "Do outro lado da tela" |
| `dino em pe.png` | `mascote-em-pe.png` | seção "Privacidade" |
| `dino menina sentada.png` | `mascote-sentada.png` | chamada final |

Cada uma tem um `.webp` ao lado, servido por `<picture>` com o `.png` de
fallback. Todas abaixo de 400 KB.

`og-dinno.png` (1200×630) é o cartão de compartilhamento, RENDERIZADO a partir
das próprias peças da página (aurora, estrelas, wordmark, mascote e o chip do
Starcoin) num Chromium headless — nenhuma imagem foi gerada do nada, e ele
reflete o visual atual. Refazer é rodar de novo o mesmo render depois de mexer
no design.

Se precisar reprocessar, os scripts são descartáveis e rodam **fora** deste
repositório, com o `sharp` que já é dependência do app.

## Todo CTA abre na mesma aba

Decisão consciente: a página existe para converter, não para ser lida em
paralelo. Abrir o app em aba nova deixa o visitante com duas abas e nenhuma
sensação de ter avançado — em celular, que é a maioria do tráfego aqui, é pior
ainda. Os links mantêm `rel="noopener"` mesmo sem `target="_blank"`, que é
inofensivo e sobrevive a alguém acrescentar o `target` depois.

## Crédito de desenvolvimento no rodapé

O símbolo ao lado de "Desenvolvido por ForjaDev" é a marca de outra empresa e
segue o guia dela, não este arquivo:

- é a **versão reduzida, de 2 faíscas** — a única autorizada abaixo de 32px;
- corpo **branco** no tema escuro e **`#141A20`** no claro, conforme a tabela de
  variação do guia dela; faísca **laranja `#FF6A00`** intocada nos dois (trocar
  a cor da faísca é proibido);
- sem rotação, sombra, contorno ou gradiente: a inclinação de −18° já está na
  geometria;
- grafia oficial `ForjaDev`, uma palavra, F e D maiúsculos.

## Publicar de novo

O repositório é servido pelo GitHub Pages a partir da **raiz da branch `main`**.
Publicar é empurrar:

```bash
git add -A
git commit -m "..."
git push
```

O Pages reconstrói sozinho em um ou dois minutos.

## O que esta página promete

Só o que o app faz hoje. Em particular: **o Dinno não movimenta dinheiro.** Não
há gateway de pagamento, conta ou carteira real — ele registra o combinado,
calcula o saldo em Starcoin e avisa o responsável quando a criança pede um saque.
A transferência acontece fora do app. Qualquer texto novo aqui tem de continuar
respeitando isso.

A taxa de conversão citada no FAQ (100 Starcoin = R$ 10,00) espelha
`STARCOIN_POR_PACOTE` / `VALOR_PACOTE_BRL` em `lib/constants.ts` do app. Mudou lá,
muda aqui.
