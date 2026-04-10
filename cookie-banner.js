(function () {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-banner-accept");
  const CLOSE_MS = 400;

  if (!banner || !acceptBtn) return;

  document.body.classList.add("has-cookie-banner");
  banner.setAttribute("aria-hidden", "false");

  let closeTimer = 0;

  function finishClose() {
    clearTimeout(closeTimer);
    closeTimer = 0;
    banner.hidden = true;
    banner.classList.remove("cookie-banner--closing");
    document.body.classList.remove(
      "has-cookie-banner",
      "has-cookie-banner--retracting"
    );
    document.body.removeEventListener("transitionend", onBodyPaddingEnd);
  }

  function onBodyPaddingEnd(e) {
    if (e.target !== document.body || e.propertyName !== "padding-bottom") {
      return;
    }
    finishClose();
  }

  acceptBtn.addEventListener("click", function () {
    if (banner.classList.contains("cookie-banner--closing")) return;
    banner.setAttribute("aria-hidden", "true");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose();
      return;
    }

    document.body.classList.add("has-cookie-banner--retracting");
    banner.classList.add("cookie-banner--closing");
    document.body.addEventListener("transitionend", onBodyPaddingEnd);
    closeTimer = window.setTimeout(finishClose, CLOSE_MS);
  });
})();
