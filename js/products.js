/* ============================================================
   PRODUCTS — fonte única de dados do catálogo
   ------------------------------------------------------------
   Todas as fotos são da própria marca (@use.afroditepratas).
   Para adicionar um produto, acrescente um objeto na lista.

   id     string  identificador único (usado no carrinho)
   name   string  nome exibido
   cat    string  categoria (precisa existir em AF.CATEGORIES)
   price  number  preço em reais
   old    number  preço "de" riscado (opcional)
   img    string  imagem 900px
   thumb  string  imagem 500px (srcset — telas pequenas)
   badge  string  selo do card (opcional)
   note   string  linha curta de detalhe técnico
   tags   array   termos extras que a busca também considera

   >>> CONFIRA OS PREÇOS ANTES DE PUBLICAR <<<
   Somente "Pulseira Baby" tem preço confirmado (R$ 149,90,
   retirado do story). Os demais são estimativas coerentes e
   precisam ser revisados por você.
   ============================================================ */

window.AF = window.AF || {};

AF.CATEGORIES = [
  { id: "all", label: "Tudo" },
  { id: "colares", label: "Colares" },
  { id: "aneis", label: "Anéis" },
  { id: "pulseiras", label: "Pulseiras" },
  { id: "brincos", label: "Brincos" },
  { id: "conjuntos", label: "Conjuntos" },
  { id: "personalizados", label: "Personalizados" },
];

AF.PRODUCTS = [
  {
    id: "af-olho-grego",
    name: "Colar Olho Grego Madrepérola",
    cat: "colares",
    price: 139.9,
    old: 169.9,
    img: "assets/images/produtos/colar-olho-grego.jpg",
    thumb: "assets/images/produtos/colar-olho-grego-sm.jpg",
    badge: "Mais vendido",
    note: "Corrente veneziana 45cm · madrepérola natural",
    tags: ["olho grego", "protecao", "madreperola", "veneziana", "amuleto"],
  },
  {
    id: "af-solitario",
    name: "Anel Solitário Cravejado",
    cat: "aneis",
    price: 129.9,
    img: "assets/images/produtos/anel-solitario.jpg",
    thumb: "assets/images/produtos/anel-solitario-sm.jpg",
    note: "Zircônia central · aro cravejado",
    tags: ["solitario", "zirconia", "noivado", "pedido"],
  },
  {
    id: "af-borboleta",
    name: "Colar Borboleta Cravejada",
    cat: "colares",
    price: 119.9,
    img: "assets/images/produtos/colar-borboleta.jpg",
    thumb: "assets/images/produtos/colar-borboleta-sm.jpg",
    badge: "Novo",
    note: "Pingente fixo · asa cravejada em zircônias",
    tags: ["borboleta", "delicado", "zirconia", "leveza"],
  },
  {
    id: "af-inicial",
    name: "Anel Inicial Cravejado",
    cat: "aneis",
    price: 159.9,
    img: "assets/images/produtos/anel-inicial.jpg",
    thumb: "assets/images/produtos/anel-inicial-sm.jpg",
    badge: "Personalizável",
    note: "Escolha a letra · chapa oval cravejada",
    tags: ["inicial", "letra", "monograma", "personalizado", "signet"],
  },
  {
    id: "af-conj-coracao",
    name: "Conjunto Coração Vazado",
    cat: "conjuntos",
    price: 189.9,
    old: 219.9,
    img: "assets/images/produtos/conjunto-coracao.jpg",
    thumb: "assets/images/produtos/conjunto-coracao-sm.jpg",
    note: "Colar + brincos · zircônias cravejadas",
    tags: ["coracao", "conjunto", "presente", "namorada"],
  },
  {
    id: "af-malha",
    name: "Colar Malha Fita",
    cat: "colares",
    price: 179.9,
    img: "assets/images/produtos/colar-malha.jpg",
    thumb: "assets/images/produtos/colar-malha-sm.jpg",
    note: "Malha lisa espelhada · 45cm",
    tags: ["malha", "fita", "herringbone", "espelhado", "liso"],
  },
  {
    id: "af-pulseiras-mix",
    name: "Pulseira Ajustável Veneziana",
    cat: "pulseiras",
    price: 109.9,
    img: "assets/images/produtos/pulseiras-mix.jpg",
    thumb: "assets/images/produtos/pulseiras-mix-sm.jpg",
    note: "Fecho deslizante · serve em qualquer pulso",
    tags: ["pulseira", "ajustavel", "veneziana", "mix", "camadas"],
  },
  {
    id: "af-medalha",
    name: "Colar Medalha São Bento",
    cat: "colares",
    price: 149.9,
    img: "assets/images/produtos/colares-medalhas.jpg",
    thumb: "assets/images/produtos/colares-medalhas-sm.jpg",
    note: "Medalha em prata · corrente cartier",
    tags: ["sao bento", "medalha", "fe", "pai nosso", "religioso"],
  },
  {
    id: "af-conj-esmeralda",
    name: "Conjunto Esmeralda Real",
    cat: "conjuntos",
    price: 249.9,
    old: 289.9,
    img: "assets/images/produtos/conjunto-esmeralda.jpg",
    thumb: "assets/images/produtos/conjunto-esmeralda-sm.jpg",
    badge: "Edição limitada",
    note: "Colar + brincos + anel · zircônia verde",
    tags: ["esmeralda", "verde", "conjunto", "formatura", "realeza"],
  },
  {
    id: "af-pulseira-baby",
    name: "Pulseira Baby Personalizada",
    cat: "personalizados",
    price: 149.9,
    img: "assets/images/produtos/pulseira-baby.jpg",
    thumb: "assets/images/produtos/pulseira-baby-sm.jpg",
    badge: "Gravação inclusa",
    note: "Nome gravado a laser · tamanho infantil",
    tags: ["baby", "bebe", "nome", "gravacao", "personalizado", "maternidade"],
  },
  {
    id: "af-pulseira-nome",
    name: "Pulseira Nome com Símbolo",
    cat: "personalizados",
    price: 169.9,
    img: "assets/images/produtos/pulseira-nome.jpg",
    thumb: "assets/images/produtos/pulseira-nome-sm.jpg",
    note: "Nome + símbolo vazado à escolha",
    tags: ["nome", "personalizada", "borboleta", "gravacao", "presente"],
  },
  {
    id: "af-brinco-coracao",
    name: "Brinco Coração Cravejado",
    cat: "brincos",
    price: 89.9,
    img: "assets/images/produtos/brinco-coracao.jpg",
    thumb: "assets/images/produtos/brinco-coracao-sm.jpg",
    note: "Tarraxa de pressão · uso diário",
    tags: ["brinco", "coracao", "pequeno", "zirconia", "delicado"],
  },
  {
    id: "af-anel-esmeralda",
    name: "Anel Esmeralda Cravejado",
    cat: "aneis",
    price: 169.9,
    img: "assets/images/produtos/anel-esmeralda.jpg",
    thumb: "assets/images/produtos/anel-esmeralda-sm.jpg",
    note: "Zircônia verde oval · aro cravejado",
    tags: ["esmeralda", "verde", "anel", "formatura"],
  },
  {
    id: "af-anel-duplo",
    name: "Duo de Anéis Cravejados",
    cat: "aneis",
    price: 199.9,
    old: 239.9,
    img: "assets/images/produtos/anel-duplo.jpg",
    thumb: "assets/images/produtos/anel-duplo-sm.jpg",
    badge: "Kit",
    note: "Dois anéis para empilhar · zircônias",
    tags: ["duo", "kit", "empilhavel", "falange", "aparador"],
  },
];

/* ---------- Utilitários ---------- */

AF.brl = function (value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/* Normaliza texto para busca: minúsculo e sem acento */
AF.norm = function (str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    // remove marcas diacríticas combinantes (U+0300–U+036F)
    .replace(/[\u0300-\u036f]/g, "");
};

AF.findProduct = function (id) {
  return AF.PRODUCTS.find(function (p) {
    return p.id === id;
  });
};

AF.catLabel = function (id) {
  var found = AF.CATEGORIES.filter(function (c) {
    return c.id === id;
  })[0];
  return found ? found.label : id;
};
