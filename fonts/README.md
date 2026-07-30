# Fontes

O site usa duas famílias:

| Uso | Fonte | Onde aparece |
|---|---|---|
| Display / títulos | **Cormorant Garamond** | logo, títulos, nomes de produto, preços grandes |
| Interface / corpo | **Jost** | textos, botões, rótulos, menus |

## Hoje: carregadas pelo Google Fonts

No `index.html` elas são baixadas do Google Fonts de forma **não bloqueante**
(`media="print"` + `onload="this.media='all'"`). Se a rede falhar, o site cai
para Georgia / system-ui e continua legível — nada quebra.

## Se quiser hospedar localmente (recomendado para produção)

Vantagens: uma requisição externa a menos, independência do Google e privacidade.

1. Baixe as famílias em https://fonts.google.com (ou use o
   [google-webfonts-helper](https://gwfh.mranftl.com/fonts)) nos formatos
   **woff2**, com estes pesos:
   - Cormorant Garamond: 300, 400, 500 + itálico 300 e 400
   - Jost: 300, 400, 500
2. Coloque os arquivos `.woff2` nesta pasta.
3. Crie `css/fonts.css` com os `@font-face` (exemplo abaixo).
4. No `index.html`, troque o `<link>` do Google Fonts por
   `<link rel="stylesheet" href="css/fonts.css">` e adicione o preload dos
   dois pesos mais usados.

```css
@font-face {
  font-family: "Cormorant Garamond";
  src: url("../fonts/cormorant-garamond-300.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Jost";
  src: url("../fonts/jost-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
/* … repita para os outros pesos */
```

E o preload no `<head>`:

```html
<link rel="preload" as="font" type="font/woff2"
      href="fonts/cormorant-garamond-300.woff2" crossorigin>
```

Mantenha sempre `font-display: swap` para o texto aparecer imediatamente.
