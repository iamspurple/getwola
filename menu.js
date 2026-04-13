(function () {
  const openMenuBtn = document.getElementById("open-menu-btn");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const menu = document.getElementById("nav-menu");

  openMenuBtn.addEventListener("click", () => {
    menu.classList.add("open");
  });

  closeMenuBtn.addEventListener("click", () => {
    menu.classList.remove("open");
  });
})();
