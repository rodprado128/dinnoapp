# Dinno — landing de conversão

Página única, estática, cujo único trabalho é levar o visitante para
<https://dinno-app.vercel.app/>.

**Não faz parte do app Next.js.** É HTML + CSS puro: sem build, sem framework,
sem `npm install`. O motivo é o deploy — ela publica no GitHub Pages sem
pipeline, e mexer nela nunca derruba nem reimplanta o produto.

```
index.html              a página inteira
assets/css/styles.css   TODO o visual
assets/img/             logo, mascote, favicons e o cartão de compartilhamento
```

Não existe `assets/js/`: nada na página precisa de JavaScript. O FAQ é
`<details>`/`<summary>` nativo. Isso é de propósito — é uma página de conversão,
e o melhor script é o que não existe.

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
- o `<title>`, a `meta description` e as tags Open Graph no `<head>`;
- a palavra "Dinno" no cabeçalho, no rodapé e na copy.

A paleta atual não foi inventada: são os tokens reais do app (`app/globals.css`,
tema escuro) cruzados com as cores dominantes amostradas das próprias imagens do
mascote. A landing é mais vibrante que o app, mas é o mesmo produto.

## Imagens

Vieram de `Dinno app/Landing Page/`, com nomes normalizados (minúsculas, sem
espaço, sem acento). Três delas tinham o fundo branco **chapado dentro do
pixel** — não era transparência de verdade. O fundo foi removido por *flood
fill* a partir das bordas, nunca por *color key*: o traje espacial do mascote é
branco e um color key o deixaria furado.

| Original | Aqui | Onde aparece |
| --- | --- | --- |
| `logo.png` | `logo-dinno.png` | cartão de compartilhamento; origem dos favicons |
| `logo.png` (recorte) | `logo-marca.png` | cabeçalho e rodapé |
| `dino logo com moeda.png` | `mascote-moeda.png` | herói |
| `dupla dino pulando.png` | `mascote-dupla.png` | seção "Do outro lado da tela" |
| `dino em pe.png` | `mascote-em-pe.png` | seção "Privacidade" |
| `dino menina sentada.png` | `mascote-sentada.png` | chamada final |

Cada uma tem um `.webp` ao lado, servido por `<picture>` com o `.png` de
fallback. Todas abaixo de 400 KB. `og-dinno.png` (1200×630) é composição das
duas primeiras sobre o fundo da marca — nenhuma imagem foi gerada do nada.

Se precisar reprocessar, os scripts são descartáveis e rodam **fora** deste
repositório, com o `sharp` que já é dependência do app.

## Todo CTA abre na mesma aba

Decisão consciente: a página existe para converter, não para ser lida em
paralelo. Abrir o app em aba nova deixa o visitante com duas abas e nenhuma
sensação de ter avançado — em celular, que é a maioria do tráfego aqui, é pior
ainda. Os links mantêm `rel="noopener"` mesmo sem `target="_blank"`, que é
inofensivo e sobrevive a alguém acrescentar o `target` depois.

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
