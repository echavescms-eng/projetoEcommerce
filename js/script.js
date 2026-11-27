document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("lista-produtos");
  const formulario = document.getElementById("form-busca");
  const campoBusca = document.getElementById("input-busca");
  const containerTags = document.getElementById("filtros");

  let produtosDisponiveis = [];

  // Categorias selecionadas nas tags (vazio = mostra todas)
  const categoriasAtivas = new Set();

  // Tradução das categorias da API (slug) para nomes em português.
  // Categoria que não estiver aqui aparece com o slug formatado.
  const nomesCategorias = {
    "beauty": "Beleza",
    "fragrances": "Fragrâncias",
    "furniture": "Móveis",
    "groceries": "Mercado",
    "home-decoration": "Decorações",
    "kitchen-accessories": "Cozinha",
    "laptops": "Notebooks",
    "mens-shirts": "Camisas Masculinas",
    "mens-shoes": "Calçados Masculinos",
    "mens-watches": "Relógios Masculinos",
    "mobile-accessories": "Acessórios para Celular",
    "motorcycle": "Motos",
    "skin-care": "Cuidados com a Pele",
    "smartphones": "Celulares",
    "sports-accessories": "Esportes",
    "sunglasses": "Óculos de Sol",
    "tablets": "Tablets",
    "tops": "Blusas",
    "vehicle": "Veículos",
    "womens-bags": "Bolsas",
    "womens-dresses": "Vestidos",
    "womens-jewellery": "Joias",
    "womens-shoes": "Calçados Femininos",
    "womens-watches": "Relógios Femininos"
  };

  function nomeCategoria(slug) {
    if (nomesCategorias[slug]) return nomesCategorias[slug];

    // Fallback: "kitchen-accessories" -> "Kitchen Accessories"
    return slug
      .split("-")
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(" ");
  }

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // ---------- Tags de filtro ----------

  function criarBotaoTag(texto, categoria) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "tag";
    botao.textContent = texto;
    botao.dataset.categoria = categoria;
    botao.setAttribute("aria-pressed", "false");
    return botao;
  }

  function criarTags() {
    if (!containerTags) return;

    const categorias = [
      ...new Set(produtosDisponiveis.map((produto) => produto.category))
    ].sort((a, b) => nomeCategoria(a).localeCompare(nomeCategoria(b), "pt-BR"));

    containerTags.replaceChildren();
    containerTags.appendChild(criarBotaoTag("Todos", ""));

    categorias.forEach((categoria) => {
      containerTags.appendChild(criarBotaoTag(nomeCategoria(categoria), categoria));
    });

    atualizarVisualTags();
  }

  function atualizarVisualTags() {
    if (!containerTags) return;

    containerTags.querySelectorAll(".tag").forEach((botao) => {
      const categoria = botao.dataset.categoria;
      const ativa =
        categoria === ""
          ? categoriasAtivas.size === 0
          : categoriasAtivas.has(categoria);

      botao.classList.toggle("tag--ativa", ativa);
      botao.setAttribute("aria-pressed", String(ativa));
    });
  }

  if (containerTags) {
    containerTags.addEventListener("click", (evento) => {
      const botao = evento.target.closest(".tag");
      if (!botao) return;

      const categoria = botao.dataset.categoria;

      if (categoria === "") {
        categoriasAtivas.clear();
      } else if (categoriasAtivas.has(categoria)) {
        categoriasAtivas.delete(categoria);
      } else {
        categoriasAtivas.add(categoria);
      }

      atualizarVisualTags();
      exibirProdutos(campoBusca.value);
    });
  }

  // ---------- Lista de produtos ----------

  function exibirProdutos(termo = "") {
    const busca = normalizar(termo);

    const produtosFiltrados = produtosDisponiveis.filter((produto) => {
      const textoProduto = normalizar(
        `${produto.title} ${produto.description} ${produto.category} ${nomeCategoria(produto.category)}`
      );

      const passaTexto = textoProduto.includes(busca);
      const passaTag =
        categoriasAtivas.size === 0 || categoriasAtivas.has(produto.category);

      return passaTexto && passaTag;
    });

    container.replaceChildren();

    if (produtosFiltrados.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.className = "sem-resultados";
      mensagem.textContent = "Nenhum produto encontrado nessa seleção.";
      container.appendChild(mensagem);
      return;
    }

    produtosFiltrados.forEach((produto) => {
      const card = document.createElement("article");
      card.className = "produto-card";

      const imagem = document.createElement("img");
      imagem.src = produto.thumbnail;
      imagem.alt = produto.title;
      imagem.loading = "lazy";

      const info = document.createElement("div");
      info.className = "produto-info";

      const titulo = document.createElement("h3");
      titulo.textContent = produto.title;

      const categoria = document.createElement("span");
      categoria.className = "produto-categoria";
      categoria.textContent = nomeCategoria(produto.category);

      const descricao = document.createElement("p");
      descricao.textContent = produto.description;

      const preco = document.createElement("p");
      preco.className = "produto-preco";
      preco.textContent = `US$ ${produto.price.toFixed(2)}`;

      info.append(titulo, categoria, descricao, preco);
      card.append(imagem, info);
      container.appendChild(card);
    });
  }

  async function carregarProdutos() {
    container.textContent = "Carregando produtos...";

    try {
      const resposta = await fetch(
        "https://dummyjson.com/products?limit=100"
      );

      if (!resposta.ok) {
        throw new Error(`Erro na consulta: ${resposta.status}`);
      }

      const dados = await resposta.json();

      // Produtos de índice 80 a 99.
      produtosDisponiveis = dados.products.slice(80, 100);

      criarTags();
      exibirProdutos(campoBusca.value);
    } catch (erro) {
      console.error("Não foi possível carregar os produtos:", erro);
      container.textContent = "Erro ao carregar os produtos. Tente novamente.";
    }
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    exibirProdutos(campoBusca.value);
  });

  campoBusca.addEventListener("input", () => {
    exibirProdutos(campoBusca.value);
  });

  // Menu responsivo
  const botaoMenu = document.getElementById("menuToggle");
  const menu = document.getElementById("menuNav");

  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", () => {
      const aberto = menu.classList.toggle("is-open");
      botaoMenu.setAttribute("aria-expanded", String(aberto));
    });
  }

  // Carrossel de promoções

  const slides = document.getElementById("slides");
  const imgs = slides.querySelectorAll("img");
  const dots = document.querySelectorAll("#indicadores .dot");
  const carrossel = document.querySelector(".carrossel");
  let atual = 0;

  function irPara(i) {
    // loop infinito: depois do último volta ao primeiro e vice-versa
    atual = (i + imgs.length) % imgs.length;

    const img = imgs[atual];

    // posição que deixa o slide ativo centralizado no carrossel
    const deslocamento =
      img.offsetLeft - (carrossel.clientWidth - img.clientWidth) / 2;

    slides.style.transform = `translateX(${-deslocamento}px)`;

    imgs.forEach((el, idx) => el.classList.toggle("ativo", idx === atual));
    dots.forEach((d, idx) => {
      d.classList.toggle("ativo", idx === atual);
      d.setAttribute("aria-selected", idx === atual);
    });
  }

  document.getElementById("prev").addEventListener("click", () => irPara(atual - 1));
  document.getElementById("next").addEventListener("click", () => irPara(atual + 1));
  dots.forEach((d, idx) => d.addEventListener("click", () => irPara(idx)));

  // recalcula ao redimensionar a janela
  window.addEventListener("resize", () => irPara(atual));

  // espera as imagens carregarem para medir corretamente
  window.addEventListener("load", () => irPara(0));

  // opcional: troca automática a cada 5 segundos
  // setInterval(() => irPara(atual + 1), 5000);

  carregarProdutos();
});