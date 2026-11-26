document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("lista-produtos");
  const formulario = document.getElementById("form-busca");
  const campoBusca = document.getElementById("input-busca");

  let produtosDisponiveis = [];

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function exibirProdutos(termo = "") {
    const busca = normalizar(termo);

    const produtosFiltrados = produtosDisponiveis.filter((produto) => {
      const textoProduto = normalizar(
        `${produto.title} ${produto.description} ${produto.category}`
      );

      return textoProduto.includes(busca);
    });

    container.replaceChildren();

    if (produtosFiltrados.length === 0) {
      const mensagem = document.createElement("p");
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

      const descricao = document.createElement("p");
      descricao.textContent = produto.description;

      const preco = document.createElement("p");
      preco.className = "produto-preco";
      preco.textContent = `US$ ${produto.price.toFixed(2)}`;

      info.append(titulo, descricao, preco);
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

      // Mantém a seleção original: produtos de índice 50 a 99.
      produtosDisponiveis = dados.products.slice(80, 100);

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
  const botaoProximo = document.getElementById("next");
  const botaoAnterior = document.getElementById("prev");

  if (slides && botaoProximo && botaoAnterior) {
    const totalSlides = slides.children.length;
    let indiceAtual = 0;

    function atualizarCarrossel() {
      slides.style.transform = `translateX(-${indiceAtual * 100}%)`;
    }

    if (totalSlides > 0) {
      botaoProximo.addEventListener("click", () => {
        indiceAtual = (indiceAtual + 1) % totalSlides;
        atualizarCarrossel();
      });

      botaoAnterior.addEventListener("click", () => {
        indiceAtual = (indiceAtual - 1 + totalSlides) % totalSlides;
        atualizarCarrossel();
      });
    }
  }

  carregarProdutos();
});