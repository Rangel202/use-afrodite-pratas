# Use Afrodite Pratas 925 — site

Site de uma página, mobile-first, sem framework e sem dependência externa de
JavaScript. Catálogo com filtro e busca, carrinho lateral e finalização por
WhatsApp (sem checkout).

---

## ⚠️ Antes de publicar

### 1. Confirmar o número do WhatsApp

Configurado em `js/whatsapp.js` como:

```js
var PHONE = "5551983002113";   // (51) 98300-2113
```

O número informado foi `51 8300-2113` — 8 dígitos. Celular no Brasil tem 9 e
começa com 9, então **o 9 foi acrescentado**. Faça um pedido de teste no site
para confirmar que a conversa abre no número certo.

Se for telefone fixo, use `"555183002113"` (sem o 9) — mas o WhatsApp
normalmente exige linha móvel.

Formato geral: **código do país + DDD + número, só dígitos**.

### 2. Revisar os preços

Os preços estão em `js/products.js`. **Só a "Pulseira Baby" (R$ 149,90) tem
preço confirmado** — foi o que apareceu no story. Todos os outros são
estimativas coerentes com esse valor e precisam da sua revisão.

---

### 3. ~~Trocar o placeholder das meta tags~~ ✅ feito

As URLs já apontam para `https://rangel202.github.io/use-afrodite-pratas/`
nas tags `canonical`, `og:*`, `twitter:*` e no JSON-LD.

**Ao migrar para domínio próprio**, troque as 7 ocorrências:

```powershell
$p = "index.html"
(Get-Content $p -Raw -Encoding UTF8).Replace(
  "https://rangel202.github.io/use-afrodite-pratas",
  "https://useafroditepratas.com.br"
) | Set-Content $p -Encoding UTF8 -NoNewline
```

Lembre que **Open Graph exige URL absoluta** — com caminho relativo o link
compartilhado no WhatsApp e no Instagram aparece sem imagem de prévia.

---

## Como abrir o site localmente

É HTML estático. Basta abrir o `index.html`. Para o carrinho e as imagens
funcionarem 100%, prefira servir por HTTP:

```bash
npx serve -l 4321 .
```

Depois acesse `http://localhost:4321`.

---

## Publicar no GitHub Pages

Repositório: https://github.com/Rangel202/use-afrodite-pratas

O `origin` já está configurado e os commits estão prontos na branch `main`.

**1. Envie:**

```bash
git push -u origin main
```

Na primeira vez o Git abre o navegador para você autorizar a conta
(Git Credential Manager) — a autenticação acontece no site do GitHub.

**2. Ligue o Pages**: no repositório → **Settings** → **Pages** →
em "Source" escolha **Deploy from a branch** → branch `main`, pasta `/ (root)`
→ **Save**.

Em 1–2 minutos o site fica no ar em:
`https://rangel202.github.io/use-afrodite-pratas/`

O arquivo `.nojekyll` na raiz desliga o processamento Jekyll, que é
desnecessário aqui e só deixaria o deploy mais lento.

### Atualizações depois

```bash
git add -A
git commit -m "descrição do que mudou"
git push
```

O Pages reconstrói sozinho a cada push.

### ⚠️ Repositório público — o que fica visível

O repo é público, então **as fotos e os 3 vídeos de clientes ficam acessíveis
e indexáveis por buscadores**, junto com os depoimentos. O material bruto
(52 MB, incluindo 24 prints de conversa de WhatsApp com clientes) está
protegido pelo `.gitignore` e **não** sobe — mas confirme que você tem o aceite
das clientes que aparecem no que vai ao ar.

Se preferir fechar depois: Settings → General → Danger Zone → Change
visibility. Nesse caso o Pages gratuito para de funcionar; hospede na
Vercel ou Netlify, que servem repo privado de graça.

---

## Estrutura

```
index.html              página única, todas as seções

/css
  variables.css         tokens: cor, tipografia, espaçamento, tempo
  style.css             layout e componentes
  animations.css        keyframes e estados de entrada
  responsive.css        incrementos para tablet e desktop

/js
  products.js           ← catálogo (preços e produtos ficam aqui)
  cart.js               carrinho + persistência em localStorage
  catalog.js            grade, filtro por categoria, busca
  whatsapp.js           ← número do WhatsApp e montagem do pedido
  animations.js         reveals, partículas, parallax, tilt, cursor
  app.js                loader, menu, FAQ, ripple, orquestração

/assets
  /images               fotos otimizadas usadas no site
    /produtos           900px + versão 500px (-sm) para srcset
  /icons                README (os ícones são SVG inline)
  /videos               vídeos de clientes
  /_originais           TODAS as suas fotos e vídeos originais, intactos

/fonts                  README com instruções de auto-hospedagem
```

Nada foi apagado: os 84 arquivos que você enviou estão em
`assets/_originais/`. As versões do site são cópias reduzidas.

---

## Tarefas comuns

### Adicionar um produto

Em `js/products.js`, acrescente um objeto na lista `AF.PRODUCTS`:

```js
{
  id: "af-novo-item",              // único, sem espaços
  name: "Colar Ponto de Luz",
  cat: "colares",                  // precisa existir em AF.CATEGORIES
  price: 129.9,
  old: 149.9,                      // opcional: preço riscado
  img: "assets/images/produtos/colar-ponto-luz.jpg",
  thumb: "assets/images/produtos/colar-ponto-luz-sm.jpg",
  badge: "Novo",                   // opcional
  note: "Zircônia 4mm · corrente 45cm",
  tags: ["ponto de luz", "delicado"],   // ajudam na busca
}
```

Não precisa mexer em HTML: o catálogo, os filtros e o carrinho se atualizam
sozinhos.

### Trocar a foto de um produto

Salve a nova imagem em `assets/images/produtos/` em **duas versões**
(900×900 e 500×500, quadradas) e aponte `img` e `thumb` para elas. A versão
menor é a que carrega no celular.

### Criar uma categoria

Adicione em `AF.CATEGORIES` (`js/products.js`) e use o mesmo `id` no campo
`cat` dos produtos. O filtro aparece automaticamente.

### Mudar cores, fontes ou espaçamentos

Tudo em `css/variables.css`. Alterar `--c-ink` ou `--f-display` reflete no
site inteiro.

---

## Decisões técnicas

**Sem Lenis nem GSAP.** O scroll suave (com inércia no desktop, nativo no
celular), os reveals e o parallax são implementados em `js/animations.js` com
`IntersectionObserver` e `requestAnimationFrame`. Motivo: as duas bibliotecas
somam ~80 KB e viriam de CDN — o site quebraria offline e o Lighthouse cairia.
A API ficou compatível (`AF.lenis.stop()` / `.start()` / `.to()`).

**Sem checkout.** O carrinho monta uma mensagem formatada com produtos,
quantidades, valores unitários, subtotais e total, e abre `wa.me`.

**Performance.** Imagens com `srcset` + `loading="lazy"`, hero com `preload` e
`fetchpriority="high"`, vídeos com `preload="none"` (só baixam ao entrar na
tela), partículas do canvas pausadas quando a hero sai de vista, um único loop
de `requestAnimationFrame` para todas as animações, fontes sem bloquear a
renderização.

**Acessibilidade.** Navegação por teclado, foco preso no carrinho aberto,
`aria-label` em botões de ícone, `prefers-reduced-motion` desliga todo o
movimento, contrastes ajustados para AA.

---

## Conteúdo — confirmar antes de publicar

Alguns textos foram tirados do seu Instagram e da embalagem:

- **Garantia vitalícia** (pilar 01 e FAQ): transcrito do cartão de garantia
- **História da marca** (seção "A marca"): resumida do seu story de 2024
- **Avaliações**: mensagens reais de clientes (highlights e reposts).
  Estão identificadas apenas por primeiro nome — **confirme se você tem o
  aceite delas** para uso no site.
- **Vídeos "Recebidos"**: stories de clientes. Mesma observação sobre permissão.
- **Parcelamento em 3x sem juros**: veio de um story; confirme se segue válido.

O domínio nas meta tags e no Schema.org está como
`https://useafroditepratas.com.br/` — troque em `index.html` (nas tags
`canonical`, `og:url` e no JSON-LD) quando tiver o domínio real.
