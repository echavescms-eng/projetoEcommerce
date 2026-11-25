const botaoMenu = document.getElementById("menuToggle");
const menu = document.getElementById("menuNav");

botaoMenu.addEventListener("click", function () {
    const aberto = menu.classList.toggle("is-open");
    botaoMenu.setAttribute("aria-expanded", aberto);
});