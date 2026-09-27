# Dinno App: landing de conversão

Página única e estática, publicada em <https://dinnoapp.forjadev.app.br/>, cujo único trabalho é levar
o visitante para o app, <https://dinno-app.vercel.app/>. O Dinno App é um produto da ForjaDev.

**Não faz parte do app Next.js.** É HTML, CSS e um JavaScript puro: sem build, sem framework, sem
`npm install`. Publica no GitHub Pages sem pipeline, e mexer nela nunca derruba nem reimplanta o
produto. O repositório é `rodprado128/dinnoapp` (o nome antigo, `dinno-landing`, redireciona).

```
index.html              a página inteira, com o JSON-LD no <head>
assets/css/styles.css   todo o visual; a identidade inteira em custom properties no :root
assets/js/main.js       o único script: warp, entrada das peças, contador, confete e a demonstração
assets/img/             logo, mascotes, favicons e o cartão de compartilhamento
robots.txt              libera a indexação e aponta o sitemap
sitemap.xml             a única URL deste site, com o lastmod da última publicação
CNAME                   o domínio próprio servido pelo GitHub Pages
```

## A marca

A identidade visual é definitiva desde 26/09/2026: nome "Dinno App", mascote dino astronauta, wordmark,
paleta, tom de voz e tema espacial (Starcoin, missões, patentes, ofensiva). A fonte prescritiva é o
`BRANDING_DINNO.md` do repositório do app; os valores dos tokens vêm do `app/globals.css` e do
`DESIGN.md` de lá, lidos e copiados, nunca lembrados.

- **Tema escuro e só ele** (`color-scheme: dark`, `theme-color` `#140F26`). A landing já teve um tema
  claro por `prefers-color-scheme` e ele fazia a página renderizar clara para quem tinha o sistema no
  claro (16/09/2026). `color-scheme: dark` também impede o escurecimento forçado do Chromium de
  reprocessar as cores: medido com `--blink-settings=forceDarkModeEnabled=true`, as cores ficam iguais.
- **Accent por seção, como no app.** Cada `<section>` declara `data-secao` e só os quatro tokens de
  accent mudam: herói, missões, instalar, FAQ e chamada final em `missoes` (roxo); como funciona em
  `aprovacoes` (lima); dinheiro em `carteira` (dourado); criança em `amigos` (ciano); família e
  segurança em `dashboard` (azul). O dourado do Starcoin convive com todos.
- **Peça de plástico injetado:** borda de 2px, sombra dura deslocada para baixo, raio de 32px em card,
  pílula em botão. Nada de vidro, blur, `backdrop-filter`, sombra difusa, brilho ou gradiente como fundo
  de card. Os únicos gradientes são os do próprio app: o contorno de brasa da Super Missão, a chama da
  Meta e a aurora.
- **Nenhum hex fora do `:root`.** As oito seções do app estão lá como `--missoes-accent`,
  `--carteira-accent` e assim por diante; `[data-secao]` só aponta para elas. O JavaScript lê as cores
  das custom properties. Os tokens da ForjaDev ficam à parte, com prefixo `--cor-forjadev-*`.
- **Baloo 2** (500 a 800) e **Material Symbols Rounded** (`FILL 1`, `wght 600`, `opsz 24`), as duas do
  Google Fonts com `display=swap`. Os ícones vêm com `icon_names` (só os glifos usados, em ordem
  alfabética, que é o que a API exige).
- **Fallback com a métrica da Baloo 2.** `"Baloo 2 Fallback"` usa `local(Arial)` com os mesmos
  `ascent-override: 112.55%`, `descent-override: 54.71%`, `line-gap-override: 0%` e
  `size-adjust: 95.78%` que o `next/font` gera para o app. Com isso e com a caixa de cada bloco do
  wordmark fixada na largura medida da Baloo 2 800, a troca de fonte não mexe em nada: CLS 0.

## As peças mostram o app

As peças centrais de cada seção são recriações em HTML/CSS das telas reais, não capturas. Todo texto
dentro delas é string que existe no código do app; os dados (nomes, títulos de missão, valores, datas)
são fictícios e cada peça é um `<figure>` com `aria-label` começando por "Exemplo com dados fictícios".

| Peça | Tela do app |
| --- | --- |
| Tela de missões com a Super Missão | `/missoes` da criança (`app/(crianca)/missoes/page.tsx`, `mission-tabs.tsx`) |
| Aprovação com Reprovar e Aprovar | `components/dashboard/aprovar-missao-card.tsx` |
| Carteira Starcoin e a taxa | `app/(crianca)/carteira/page.tsx` |
| Formulário de missão | `components/dashboard/criar-missao-form.tsx` e a página `/dashboard/missoes` |
| Barra de aprovação em lote | `components/dashboard/fila-aprovacoes.tsx` |
| Saldo total, bloqueado e disponível | `app/(crianca)/carteira/page.tsx` |
| Meu extrato | `app/(crianca)/carteira/extrato/page.tsx` e `lib/extrato.ts` |
| Mesada fixa | `components/dashboard/configurar-mesada-fixa-form.tsx` |
| Você pode gastar e o item da loja | `app/(crianca)/loja/page.tsx` e `lib/loja.ts` |
| Minha meta | `app/(crianca)/meta/page.tsx` e `components/meta/barra-meta.tsx` (parada) |
| Ofensiva | `components/ofensiva/cartao-ofensiva.tsx` |
| Suas conquistas | `app/(crianca)/perfil/conquistas/page.tsx`; o emblema usa o ícone do catálogo (`emblemas.icone`), porque a arte PNG dos emblemas não é fonte autorizada para esta página |
| Ranking entre amigos | `app/(crianca)/amigos/page.tsx` |
| Autorização para o uso do Dinno pela criança | `components/consentimento/gate-consentimento.tsx` e `lib/consentimento.ts` |

## Movimento: de onde veio cada efeito

Nenhum efeito foi inventado. Cada um replica um da tabela "Movimento" do `BRANDING_DINNO.md` ou do app,
com os parâmetros lidos do código.

| Efeito | Origem | Parâmetros |
| --- | --- | --- |
| Press 3D | `BRANDING_DINNO.md`, `.pressavel` e `.btn-*` de `app/globals.css` | `translateY(4px)` no botão, `translateY(3px) scale(.985)` na peça, 90ms |
| Contador do saldo | `components/ui/valor-animado.tsx` | `easeOutCubic`, 700ms; conta de 0 ao valor quando a carteira entra na tela e de 1240 para 1290 ao aprovar |
| Confete | `components/ui/confete.tsx` e `app/globals.css` | 52 peças, oito cores das seções, 1200ms, largada em até 160ms, `confete-cai` e `confete-some` separados, limpeza em 1200 + 160 + 80ms |
| Contorno de brasa | `.super-missao` de `app/globals.css` | `conic-gradient` com `--angulo-brasa` registrada por `@property`, 3200ms linear; respiro em `scale` de 1 a 1.015, 3000ms. Sem o brilho de 20px e sem o pulso `brasa-brilho` do app, porque a landing não usa brilho nem sombra difusa. Pausa fora da tela |
| Aurora | `.aurora` de `app/globals.css` | três `radial-gradient`, `inset: -20%`, opacidade 12%, 78s alternado |
| Warp | `components/login/fundo-warp.tsx` | projeção com profundidade 1400; parâmetros da landing de 16/09: 800 estrelas por milhão de px, teto 460, velocidade 12, raio até 3,2px, alpha 0,45 + proximidade x 0,9, canvas a 0,9 |
| Entrada das peças | `.entra-item` e `.entra-marco` de `app/globals.css` | 260ms, `translateY(10px)`, 60ms por índice, só as 8 primeiras escalonam; marcos da linha do tempo em 320ms, `translateX(-8px)`, 70ms por índice |

Regras que valem para todos:

- **Um único `requestAnimationFrame`** serve o warp e o contador, e para com a aba oculta.
- **Entrada só com JavaScript:** o estado escondido existe apenas quando `main.js` marcou o `<html>` com
  `js-entra`, o que ele só faz com `IntersectionObserver` e sem pedido de menos movimento. Ao terminar, a
  classe da animação sai e fica `entrou` (opacidade 1, sem transform). O `<h1>`, o subtítulo, os CTAs e
  a tela de exemplo do herói não têm entrada.
- **`prefers-reduced-motion: reduce`:** nenhum rAF, nenhum canvas, nenhum confete, nenhuma entrada; o
  saldo mostra o valor final. O céu fica no campo estático em CSS.
- **Sem JavaScript:** a página inteira aparece com os números finais no HTML, e o FAQ é `<details>`
  nativo.

## O texto solto fica sobre chapas sólidas

O warp roda atrás da página inteira, então texto fora de card teria estrela por trás. O que protege a
leitura é a `.chapa`: o fundo do próprio elemento, na cor do fundo da página, sem `position`, sem
`isolation`, sem opacidade e sem sombra.

A versão anterior (`.scrim`) era um `::before` posicionado, a 92%, com sombra difusa de até 1,3em. Cada
bloco com scrim virava um contexto de empilhamento pintado na ordem do documento, e o scrim de um bloco
posterior pintava por cima do texto do anterior: foi o que apagou o selo do herói, a segunda linha do
`<h1>` e a linha "Grátis para começar" no Edge do Android (DECISIONS.md do app, rodada de 26/09/2026,
5ª). Fundo de bloco em fluxo é sempre pintado antes de todo texto, então chapa nenhuma cobre texto, nem
o da vizinha.

## Prova social

Os números saem de medição no banco de produção (somente leitura), nunca de estimativa. Na página, o
número é o medido arredondado PARA BAIXO (dezena para contas, centena para Starcoin), com "+" na frente.
Número que não pode ser medido com colunas verificadas, ou que dá zero, sai da página.

Medição de 26/09/2026, 21:41 em Brasília, excluindo as contas `@dinno.test` e quem está em
`administradores`:

| Número | Medido | Na página |
| --- | --- | --- |
| Contas de responsáveis e crianças | 15 (9 responsáveis, 6 crianças) | +10 |
| Missões criadas nos últimos 7 dias | 0 | saiu da página |
| Starcoin de missões aprovadas nos últimos 30 dias | 1312,50 (21 lançamentos, 2 crianças) | +1.300 |

```sql
-- contas
select count(*) as contas,
       count(*) filter (where p.tipo = 'responsavel') as responsaveis,
       count(*) filter (where p.tipo = 'crianca') as criancas
  from public.perfis p join auth.users u on u.id = p.id
 where p.tipo in ('responsavel','crianca')
   and coalesce(u.email, '') not like '%@dinno.test'
   and p.id not in (select a.perfil_id from public.administradores a);

-- missões criadas nos últimos 7 dias
with excluidos as (
  select u.id from auth.users u where coalesce(u.email,'') like '%@dinno.test'
  union select a.perfil_id from public.administradores a)
select count(*) from public.missoes m
 where m.created_at >= now() - interval '7 days'
   and m.criada_por is not null and m.criada_por not in (select id from excluidos)
   and (m.atribuida_a is null or m.atribuida_a not in (select id from excluidos));

-- Starcoin de missões aprovadas nos últimos 30 dias
with excluidos as (
  select u.id from auth.users u where coalesce(u.email,'') like '%@dinno.test'
  union select a.perfil_id from public.administradores a)
select coalesce(sum(t.valor), 0) from public.transacoes_starcoin t
 where t.tipo = 'missao' and t.created_at >= now() - interval '30 days'
   and t.crianca_id not in (select id from excluidos);
```

Os números envelhecem sozinhos: medir de novo antes de cada mudança de texto e atualizar esta tabela.

## Imagens

Vieram de `Dinno app/Landing Page/`, com nomes normalizados; três tinham o fundo branco chapado dentro
do pixel e foram limpas por flood fill a partir das bordas (15/09/2026). Cada uma tem um `.webp` ao lado,
servido por `<picture>`, com o `.png` de fallback.

| Arquivo | Onde aparece |
| --- | --- |
| `logo-marca.png` / `.webp` | cabeçalho e rodapé |
| `logo-dinno.png` / `.webp` | origem dos favicons (não aparece na página) |
| `mascote-dupla*.png` / `.webp` | seção da criança |
| `mascote-em-pe.png` / `.webp` | seção de família e segurança |
| `mascote-moeda*.png` / `.webp` | chamada final e cartão de compartilhamento |
| `og-dinno.png` | cartão de compartilhamento, 1200×630 |

`og-dinno.png` é renderizado num Chromium headless a partir das próprias peças da página (aurora,
estrelas, wordmark, a frase do herói, a taxa, o mascote e o card de aprovação). Refazer é montar a
mesma composição com `assets/css/styles.css` e tirar a captura a 1200×630, DPR 1. `mascote-sentada`
saiu em 26/09/2026, sem referência.

## Instalar na tela inicial

O texto do Chrome segue a ajuda oficial do Google conferida em 26/09/2026 ("À direita da barra de
endereço, toque em Mais > Instalar e criar atalho > Instalar"). A Microsoft não tem página oficial para
o Edge no Android; o texto do Edge é o conferido em 15/09/2026. Os desenhos são esquemáticos e
originais, rotulados por texto: nenhuma captura de tela e nenhum logo de terceiro.

## Todo CTA abre na mesma aba

A página existe para converter. Abrir o app em aba nova deixa o visitante com duas abas e nenhuma
sensação de ter avançado. Os links mantêm `rel="noopener"` mesmo sem `target="_blank"`.

## Crédito de desenvolvimento: ForjaDev

O bloco da ForjaDev fica numa faixa própria no fim do rodapé, separado do Dinno por divisória e respiro,
e segue o `FORJADEV-BRAND-GUIDE` (edição 2026.2), não o guia do Dinno:

- **assinatura horizontal** (símbolo de 3 faíscas mais o wordmark), em SVG embutido com os caminhos
  copiados do guia, na versão para fundo aço escuro: corpo e wordmark `#FFFFFF`, faísca `#FF6A00`
  intocada, sobre `#141A20`;
- **32px de altura:** acima do mínimo de 24px da assinatura e sem levar a versão de 3 faíscas para
  baixo de 32px;
- **área de respiro** igual à altura da cabeça do martelo (16px a essa altura) nos quatro lados;
- sem rotação, sombra, brilho, contorno ou gradiente sobre o logo; foco em 2px laranja, que é o foco do
  sistema da ForjaDev;
- texto "Desenvolvido por" em Baloo 2, cor `#F4F5F6` (o guia não traz frase de crédito aprovada) e
  "Orgulhosamente feito em Maringá." (o guia dá a base em Maringá/PR);
- nenhum token, raio, sombra dura ou accent do Dinno no bloco.

No JSON-LD, a `Organization` da ForjaDev leva só o que o guia traz e é público: nome, URL, a frase de
posicionamento e o endereço de cidade e estado. Os contatos do guia não estão marcados como públicos e
ficaram de fora; o guia não traz perfis sociais nem arquivo de logo com URL pública, então não há
`sameAs` nem `logo`.

## O que esta página promete

Só o que o app faz hoje, com a evidência no README, no DECISIONS e no código do app. Em particular:
**o Dinno não movimenta dinheiro.** Ele registra o combinado, calcula o saldo em Starcoin e avisa quando a
criança pede um saque; a transferência acontece fora do app. Nada de assinatura, plano, preço, "grátis",
loja de aplicativos, depoimento, nota ou selo.

A taxa aparece exatamente como `100 Starcoin = R$ 10,00`. Ela espelha `STARCOIN_POR_PACOTE` e
`VALOR_PACOTE_BRL` em `lib/constants.ts` e `taxa_starcoin_brl()` no banco do app. Mudou lá, muda aqui.

## Rodar local e auditar

Qualquer servidor estático serve (por exemplo `python -m http.server 8080`, ou um servidor Node de
poucas linhas). A auditoria usa o Playwright que já está em `node_modules` do app e roda de fora deste
repositório, com os scripts em uma pasta temporária. Ela cobre:

- contraste AA pelo método de máscara de glifo (fundo congelado, captura com e sem texto, fundo lido nos
  pixels das letras) a 320, 360, 375, 768, 1440 e 1920, com os `<details>` abertos, depois de as
  animações terminarem, comparando a cor computada e a cor pintada;
- os três elementos do incidente de 26/09 a 360×800 DPR 2, com e sem o escurecimento forçado;
- zero rolagem horizontal, zero erro e warning no console, zero cookie, nenhum host além de
  `fonts.googleapis.com` e `fonts.gstatic.com`, alvos de toque de 44px, foco visível por Tab e a
  demonstração operada por teclado;
- `prefers-reduced-motion` (sem rAF, canvas, animação nem confete) e sem JavaScript;
- um `<h1>`, headings sem pulo, landmarks, Open Graph, Twitter Card, imagens, JSON-LD (parse, `@id`
  referenciados e FAQ igual ao visível), CTAs, status dos links externos;
- o texto: nenhum travessão, nenhum "seu filho", "sua filha", "dele" ou "dela", no máximo um "!", nenhum
  termo proibido e a taxa exata;
- LCP e CLS a 360×800 pelo `PerformanceObserver`.

Resultado de 26/09/2026, local e na URL publicada: 48 de 48 itens; menor razão de contraste 4,97:1
(texto `accent-on` sobre `accent` de `missoes`); LCP de 580ms no `<p>` do herói e CLS 0.

## Publicar de novo

O GitHub Pages serve a raiz da branch `main`. Publicar é `git add` só dos arquivos mudados,
`git commit` e `git push`; o Pages reconstrói em segundos a poucos minutos. Depois, compare o SHA-256 do
HTML servido com o do `index.html` local.
