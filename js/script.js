async function carregaProdutos(){
    const container = document.getElementById("lista-produtos");

    //busca dados na api
    const resposta = await fetch('https://dummyjson.com/products?limit=100');
    const dados = await resposta.json();
const produtos = dados.products.slice(50, 100);

produtos.forEach((produto) => {
  const card = document.createElement("article");
  card.className = "produto-card";

  const imagem = document.createElement("img");
  imagem.src = produto.thumbnail;
  imagem.alt = produto.title;

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
  container.append(card);
});
}

//BUSCA INICIAL
carregaProdutos();

//CARROSSEL DAS PROMOÇÕES
const slides = document.getElementById('slides');
    const total = slides.children.length;
    let index = 0;

    function atualizar() {
      slides.style.transform = `translateX(-${index * 100}%)`;
    }

    document.getElementById('next').addEventListener('click', () => {
      index = (index + 1) % total;
      atualizar();
    });

    document.getElementById('prev').addEventListener('click', () => {
      index = (index - 1 + total) % total;
      atualizar();
    });