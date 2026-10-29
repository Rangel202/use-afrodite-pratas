# Use Afrodite Pratas 925

Catálogo online de joias em prata 925, com filtro, busca, carrinho e finalização do pedido pelo WhatsApp.

🔗 **Site no ar:** https://use-afrodite-pratas.vercel.app

## Sobre o projeto

Projeto feito para cliente. É um site de uma página, mobile-first, **sem framework e sem dependência externa de JavaScript**. A cliente vende pelo WhatsApp, então o site não tem checkout: o carrinho monta uma mensagem formatada com produtos, quantidades, valores e total, e abre a conversa pronta.

### Funcionalidades

- Catálogo com **filtro por categoria e busca**
- **Carrinho lateral** com persistência em `localStorage`
- Pedido enviado pelo **WhatsApp** com o resumo completo da compra
- Produtos cadastrados em um único arquivo (`js/products.js`): catálogo, filtros e carrinho se atualizam sozinhos
- Animações de entrada, parallax e rolagem suave feitas à mão com `IntersectionObserver` e `requestAnimationFrame`
- Dados estruturados (JSON-LD) e meta tags Open Graph para busca e compartilhamento

## Tecnologias

- HTML5
- CSS3 (tokens de design em variáveis CSS)
- JavaScript puro
- Node.js + [sharp](https://sharp.pixelplumbing.com/) nos scripts de geração de imagens
- Hospedagem na Vercel

## Desempenho no celular

A carga inicial caiu de **~1,8 MB para ~170 KB**, e o LCP caiu de **2,5 s para 1,1 s** (CLS 0).

| Antes | Depois |
|---|---|
| JPEG em 500px e 900px | WebP em 320/480/640/900 + 1 JPEG de fallback |
| Celular baixava a imagem de 900px (~170 KB por card) | Escolhe a de 480px (~21 KB por card) |
| 3 vídeos tocavam sozinhos (1,2 MB) | Só carregam com toque |
| 8 arquivos de fonte | 6 (os não usados foram removidos) |
| Loader esperava a página inteira | Espera só a foto principal |

Além disso, os efeitos mais pesados para a GPU são desligados em telas de toque, para evitar rolagem engasgada.

## Acessibilidade

- Navegação por teclado e foco preso no carrinho aberto
- `aria-label` em botões de ícone
- `prefers-reduced-motion` desliga todo o movimento
- Contrastes ajustados para o nível AA

## Como rodar localmente

```bash
git clone https://github.com/Rangel202/use-afrodite-pratas.git
cd use-afrodite-pratas
npx serve -l 4321 .
```

Depois acesse `http://localhost:4321`.

## Estrutura

```
index.html        página única, todas as seções
css/
  variables.css   tokens: cor, tipografia, espaçamento, tempo
  style.css       layout e componentes
  animations.css  keyframes e estados de entrada
  responsive.css  ajustes para tablet e desktop
js/
  products.js     catálogo de produtos
  cart.js         carrinho e persistência
  catalog.js      grade, filtro e busca
  whatsapp.js     montagem da mensagem do pedido
  animations.js   reveals, parallax e rolagem suave
  app.js          menu, FAQ e orquestração
assets/           imagens, ícones e vídeos
tools/            scripts de geração das imagens
```

---

Desenvolvido por [Gabriel Rangel](https://github.com/Rangel202).
