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

document.addEventListener("DOMContentLoaded", () => {
  const postContentBtn = document.getElementById("post-content-btn");

  postContentBtn.addEventListener("click", () => {
    postContentBtn.classList.toggle("active");
  });
});
