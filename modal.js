(function () {
  const overlay = document.getElementById("overlay");
  const openBtn = document.getElementById("open-modal-btn");
  const closeBtn = document.getElementById("close-modal-btn");
  const form = document.getElementById("modal-form");

  if (!overlay || !openBtn || !closeBtn || !form) return;

  const emailInput = form.querySelector('input[name="email"]');
  const policyCheckbox = form.querySelector('input[type="checkbox"]');

  if (!emailInput || !policyCheckbox) return;

  let errorEl = null;

  function getErrorEl() {
    if (!errorEl) {
      errorEl = document.createElement("p");
      errorEl.className = "modal-form-error";
      errorEl.setAttribute("role", "alert");
      errorEl.hidden = true;
      form.prepend(errorEl);
    }
    return errorEl;
  }

  function setFormError(message) {
    const el = getErrorEl();
    if (message) {
      el.textContent = message;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function openModal() {
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    overlay.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    overlay.setAttribute("aria-hidden", "true");
    setFormError("");
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeModal();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setFormError("");

    const email = emailInput.value.trim();
    emailInput.value = email;

    if (!email || !emailInput.checkValidity()) {
      setFormError("Введите корректный адрес электронной почты.");
      emailInput.focus();
      return;
    }

    if (!policyCheckbox.checked) {
      setFormError("Необходимо принять условия обработки персональных данных.");
      policyCheckbox.focus();
      return;
    }

    form.reset();
    closeModal();
  });
})();
