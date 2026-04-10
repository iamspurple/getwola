(function () {
  const PRODUCTS_GAP_PX = 8;
  const BLOG_GAP_PX = 24;

  /** @type {{ maxWidth: number; slides: number }[]} */
  const BREAKPOINTS_PRODUCTS = [
    { maxWidth: 580, slides: 2 },
    { maxWidth: 920, slides: 3 },
    { maxWidth: Infinity, slides: 4 },
  ];

  /** @type {{ maxWidth: number; slides: number }[]} */
  const BREAKPOINTS_BLOG = [
    { maxWidth: 580, slides: 1 },
    { maxWidth: 920, slides: 2 },
    { maxWidth: Infinity, slides: 3 },
  ];

  /**
   * @param {number} width
   * @param {{ maxWidth: number; slides: number }[]} rules
   */
  function slidesPerViewForWidth(width, rules) {
    for (const rule of rules) {
      if (width < rule.maxWidth) {
        return Math.max(1, Math.floor(rule.slides));
      }
    }
    const last = rules[rules.length - 1];
    return Math.max(1, Math.floor(last.slides));
  }

  /**
   * @param {unknown} raw
   * @param {Element} trackEl
   * @param {number} fallbackPx
   */
  function resolveGapPx(raw, trackEl, fallbackPx) {
    if (raw !== undefined && raw !== null && raw !== "") {
      const n = typeof raw === "number" ? raw : parseFloat(String(raw), 10);
      if (Number.isFinite(n) && n >= 0) return n;
    }
    const cssGap = parseFloat(getComputedStyle(trackEl).gap);
    if (Number.isFinite(cssGap) && cssGap >= 0) return cssGap;
    return fallbackPx;
  }

  /**
   * @param {{
   *   wrapper: Element | null;
   *   track: Element | null;
   *   slideSelector: string;
   *   btnPrev: Element | null;
   *   btnNext: Element | null;
   *   step?: number;
   *   breakpoints?: { maxWidth: number; slides: number }[];
   *   gapPx?: number | string;
   *   gapFallbackPx?: number;
   * }} opts
   */
  function initHorizontalSlider(opts) {
    const {
      wrapper,
      track,
      slideSelector,
      btnPrev,
      btnNext,
      step: stepRaw,
      breakpoints: breakpointsRaw,
      gapPx: gapPxRaw,
      gapFallbackPx: gapFallbackRaw,
    } = opts;
    const step = Math.max(1, Math.floor(stepRaw ?? 1));
    const breakpoints = breakpointsRaw ?? BREAKPOINTS_PRODUCTS;
    const gapFallbackPx = gapFallbackRaw ?? PRODUCTS_GAP_PX;
    if (!wrapper || !track) return;

    const gapPx = resolveGapPx(gapPxRaw, track, gapFallbackPx);
    track.style.gap = `${gapPx}px`;

    const slides = () => Array.from(track.querySelectorAll(slideSelector));

    let index = 0;

    function countPerView() {
      return slidesPerViewForWidth(wrapper.offsetWidth, breakpoints);
    }

    function maxIndex() {
      const n = slides().length;
      const per = countPerView();
      return Math.max(0, n - per);
    }

    function slideWidthPx() {
      const per = countPerView();
      return (wrapper.clientWidth - (per - 1) * gapPx) / per;
    }

    function sync() {
      const w = slideWidthPx();
      const cap = maxIndex();

      index = Math.min(Math.max(0, index), cap);

      slides().forEach((slide) => {
        slide.style.flex = `0 0 ${w}px`;
      });

      const offset = index * (w + gapPx);
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;

      if (btnPrev) btnPrev.disabled = index <= 0;
      if (btnNext) btnNext.disabled = index >= cap;
    }

    btnPrev?.addEventListener("click", () => {
      index -= step;
      sync();
    });

    btnNext?.addEventListener("click", () => {
      index += step;
      sync();
    });

    const SWIPE_MIN_PX = 48;
    const SWIPE_DOMINANCE = 1.2;

    let touchSwipeActive = false;
    let touchStartX = 0;
    let touchStartY = 0;

    wrapper.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        touchSwipeActive = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    wrapper.addEventListener(
      "touchcancel",
      () => {
        touchSwipeActive = false;
      },
      { passive: true }
    );

    wrapper.addEventListener(
      "touchend",
      (e) => {
        if (!touchSwipeActive) return;
        touchSwipeActive = false;
        if (e.changedTouches.length !== 1) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.abs(dx) < SWIPE_MIN_PX) return;
        if (Math.abs(dx) < Math.abs(dy) * SWIPE_DOMINANCE) return;

        if (dx < 0) {
          index += step;
        } else {
          index -= step;
        }
        sync();
      },
      { passive: true }
    );

    const ro = new ResizeObserver(() => sync());
    ro.observe(wrapper);

    sync();
  }

  initHorizontalSlider({
    wrapper: document.querySelector(".products-list-wrapper"),
    track: document.getElementById("products-slider"),
    slideSelector: ".products-slide",
    btnPrev: document.getElementById("products-slider-btn-prev"),
    btnNext: document.getElementById("products-slider-btn-next"),
    step: 2,
    breakpoints: BREAKPOINTS_PRODUCTS,
    gapPx: PRODUCTS_GAP_PX,
    gapFallbackPx: PRODUCTS_GAP_PX,
  });

  initHorizontalSlider({
    wrapper: document.querySelector(".blog-list-wrapper"),
    track: document.getElementById("blog-slider"),
    slideSelector: ".blog-slide",
    btnPrev: document.getElementById("blog-slider-btn-prev"),
    btnNext: document.getElementById("blog-slider-btn-next"),
    breakpoints: BREAKPOINTS_BLOG,
    gapPx: BLOG_GAP_PX,
    gapFallbackPx: BLOG_GAP_PX,
  });
})();

const SHARE_DESKTOP_MIN_WIDTH_PX = 769;

document.addEventListener("DOMContentLoaded", () => {
  const postContentBtn = document.getElementById("post-content-btn");

  postContentBtn.addEventListener("click", () => {
    postContentBtn.classList.toggle("active");
  });

  const shareBtn = document.getElementById("post-share-btn");
  const sharePopup = document.getElementById("post-share-popup");
  const shareWrap = document.querySelector(".post-share-wrap");

  if (shareBtn && sharePopup && shareWrap) {
    function getShareUrl() {
      const fromSchema =
        document.querySelector('link[itemprop="url"]')?.getAttribute("href") ||
        document
          .querySelector('link[itemprop="mainEntityOfPage"]')
          ?.getAttribute("href");
      if (fromSchema) return fromSchema;
      return window.location.href;
    }

    function getShareTitle() {
      const h1 = document.querySelector(".post-title");
      const t = h1?.textContent?.trim();
      return t || document.title;
    }

    function syncShareLinks() {
      const url = getShareUrl();
      const encUrl = encodeURIComponent(url);
      const encTitle = encodeURIComponent(getShareTitle());

      const tg = sharePopup.querySelector('a[href*="telegram"]');
      if (tg)
        tg.href = `https://telegram.me/share/url?url=${encUrl}&text=${encTitle}`;

      const vk = sharePopup.querySelector('a[href*="vk.com"]');
      if (vk) vk.href = `https://vk.com/share.php?url=${encUrl}`;

      const max = sharePopup.querySelector('a[href*="max.com"]');
      if (max) max.href = `https://max.com/share?url=${encUrl}`;
    }

    function isDesktopShare() {
      return window.matchMedia(`(min-width: ${SHARE_DESKTOP_MIN_WIDTH_PX}px)`)
        .matches;
    }

    function closeSharePopup() {
      sharePopup.classList.remove("is-open");
      sharePopup.setAttribute("aria-hidden", "true");
      shareBtn.setAttribute("aria-expanded", "false");
    }

    function openSharePopup() {
      syncShareLinks();
      sharePopup.setAttribute("aria-hidden", "false");
      sharePopup.classList.add("is-open");
      shareBtn.setAttribute("aria-expanded", "true");
    }

    function toggleSharePopup() {
      if (sharePopup.classList.contains("is-open")) closeSharePopup();
      else openSharePopup();
    }

    syncShareLinks();

    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isDesktopShare()) {
        toggleSharePopup();
        return;
      }
      const shareData = {
        title: getShareTitle(),
        url: getShareUrl(),
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        syncShareLinks();
        openSharePopup();
      }
    });

    document.addEventListener("click", (e) => {
      if (!sharePopup.classList.contains("is-open")) return;
      if (!shareWrap.contains(e.target)) closeSharePopup();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSharePopup();
    });

    window.addEventListener("resize", () => {
      if (!isDesktopShare() && sharePopup.classList.contains("is-open")) {
        closeSharePopup();
      }
    });
  }
});
