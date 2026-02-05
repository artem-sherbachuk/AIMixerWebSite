(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const bg = document.querySelector('.bg-layer');
  const heroPhone = document.querySelector('.hero-phone');
  if (!bg || !heroPhone) return;

  let latestY = 0;
  let ticking = false;

  const update = () => {
    const y = latestY;
    const bgShiftY = Math.min(y * 0.05, 35);
    const bgShiftX = Math.min(y * 0.02, 16);
    const phoneShiftY = Math.min(y * 0.09, 48);

    bg.style.transform = `translate3d(${bgShiftX}px, ${bgShiftY}px, 0)`;
    heroPhone.style.transform = `translate3d(0, ${phoneShiftY}px, 0)`;

    ticking = false;
  };

  const onScroll = () => {
    latestY = window.scrollY || window.pageYOffset;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const revealItems = document.querySelectorAll('.reveal');
  if (!revealItems.length) return;

  revealItems.forEach((item, index) => {
    if (index === 0) item.classList.add('reveal-pop');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.22, rootMargin: '0px 0px -6% 0px' }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
