# Ícones

Todos os ícones do site são **SVG inline**, escritos direto no `index.html`.

## Por que inline e não arquivos aqui?

- Zero requisições de rede (ganho direto no Lighthouse)
- Herdam a cor do texto via `stroke: currentColor` — mudam de cor no hover,
  no tema escuro das seções e no footer sem precisar de variantes
- Podem ser animados por CSS (veja `.pillar__icon svg` em `css/style.css`,
  que desenha o traço no hover usando `stroke-dasharray`)

## Padrão usado

```html
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="…"/>
</svg>
```

Regras:
- `viewBox="0 0 24 24"` sempre — mantém todos na mesma grade óptica
- `aria-hidden="true"` quando o ícone é decorativo (o texto ao lado já explica)
- quando o ícone é o único conteúdo de um botão, o botão recebe `aria-label`
- traço e preenchimento vêm do CSS (`stroke: currentColor; fill: none;
  stroke-width: 1.4`), nunca hardcoded no SVG

## Se precisar adicionar ícones como arquivo

Coloque nesta pasta e use `<img src="assets/icons/nome.svg" alt="">`.
Lembre que aí você perde a herança de cor e a animação por CSS.
