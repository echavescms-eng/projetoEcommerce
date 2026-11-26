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

const slides = document.getElementById('slides');
const imgs = slides.querySelectorAll('img');
const dots = document.querySelectorAll('#indicadores .dot');
const carrossel = document.querySelector('.carrossel');
let atual = 0;

function irPara(i) {
  // loop infinito: depois do último volta ao primeiro e vice-versa
  atual = (i + imgs.length) % imgs.length;

  const img = imgs[atual];
  const gap = parseFloat(getComputedStyle(slides).gap) || 0;

  // posição que deixa o slide ativo centralizado no carrossel
  const deslocamento =
    img.offsetLeft - (carrossel.clientWidth - img.clientWidth) / 2;

  slides.style.transform = `translateX(${-deslocamento}px)`;

  imgs.forEach((el, idx) => el.classList.toggle('ativo', idx === atual));
  dots.forEach((d, idx) => {
    d.classList.toggle('ativo', idx === atual);
    d.setAttribute('aria-selected', idx === atual);
  });
}

document.getElementById('prev').addEventListener('click', () => irPara(atual - 1));
document.getElementById('next').addEventListener('click', () => irPara(atual + 1));
dots.forEach((d, idx) => d.addEventListener('click', () => irPara(idx)));

// recalcula ao redimensionar a janela
window.addEventListener('resize', () => irPara(atual));

// espera as imagens carregarem para medir corretamente
window.addEventListener('load', () => irPara(0));

// opcional: troca automática a cada 5 segundos
// setInterval(() => irPara(atual + 1), 5000);

carregarProdutos();
});