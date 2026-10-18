import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSmoothScroll(): Lenis | null {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function irA(
  destino: number | string | HTMLElement,
  lenis: Lenis | null,
  extra = 0,
) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && lenis) {
    lenis.scrollTo(destino, { offset: extra, duration: 1.1 });
    return;
  }

  let y = 0;
  if (typeof destino === 'number') {
    y = destino;
  } else {
    const el =
      typeof destino === 'string' ? document.querySelector<HTMLElement>(destino) : destino;
    if (!el) return;
    y = el.getBoundingClientRect().top + window.scrollY + extra;
  }

  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}
