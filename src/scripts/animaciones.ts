import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initSmoothScroll, irA } from './smooth-scroll';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initSitio() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('[data-bloque]', { autoAlpha: 1, y: 0 });
    gsap.set('[data-lugar]', { autoAlpha: 1, y: 0 });
    gsap.set('[data-cat-card]', { autoAlpha: 1, y: 0, scale: 1 });
    gsap.set('[data-mask-img]', { autoAlpha: 1, scale: 1 });
    initNavbar(null);
    initProgreso(null);
    initCategoriasClick(null);
    return () => undefined;
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = initSmoothScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    initCursor();
    initHeroTitulo();
    initBloques();
    initLugares();
    initContadores();
    initMaskImagenes();
    initNavbar(lenis);
    initProgreso(lenis);
    initCategorias(lenis);
    initAmbiente();
    return () => {
      lenis?.destroy();
    };
  });
}

function initAmbiente() {
  const fotos = gsap.utils.toArray<HTMLElement>('[data-fondo-foto]');
  if (fotos.length > 0) {
    gsap.to(fotos, {
      yPercent: (i) => (i % 2 === 0 ? 10 : -8),
      xPercent: (i) => (i % 2 === 0 ? -3 : 4),
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.6,
      },
    });
  }

  gsap.to('[data-fondo-blob]', {
    x: (i) => (i === 1 ? 64 : -48),
    y: (i) => (i === 2 ? 36 : -56),
    duration: (i) => 18 + i * 5,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    stagger: 1.6,
  });

  const orbita = document.querySelector('.hero-orbita');
  if (orbita) {
    gsap.to(orbita, {
      yPercent: 16,
      rotation: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }
}

function initCursor() {
  const anillo = document.querySelector<HTMLElement>('[data-cursor]');
  if (!anillo || !window.matchMedia('(pointer: fine)').matches) return;

  document.body.classList.add('cursor-custom');
  gsap.set(anillo, { xPercent: -50, yPercent: -50 });

  const xTo = gsap.quickTo(anillo, 'x', { duration: 0.28, ease: 'power3' });
  const yTo = gsap.quickTo(anillo, 'y', { duration: 0.28, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  const crece = (on: boolean) => {
    gsap.to(anillo, {
      width: on ? 36 : 12,
      height: on ? 36 : 12,
      background: on ? 'rgb(224 181 74 / 0.14)' : 'rgb(224 181 74 / 0.2)',
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  document.querySelectorAll('a, button, [data-cursor-grow]').forEach((el) => {
    el.addEventListener('pointerenter', () => crece(true));
    el.addEventListener('pointerleave', () => crece(false));
  });
}

function initHeroTitulo() {
  const titulo = document.querySelector('[data-hero-titulo]');
  if (!titulo) return;

  SplitText.create(titulo, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    aria: 'hidden',
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      });
    },
  });
}

function revelarLote(
  selector: string,
  varsIn: gsap.TweenVars,
  varsOut: gsap.TweenVars,
  start = 'top 88%',
) {
  const elementos = gsap.utils
    .toArray<HTMLElement>(selector)
    .filter((el) => !el.closest('[data-cat-panel]'));
  if (elementos.length === 0) return;

  gsap.set(elementos, varsOut);

  ScrollTrigger.batch(elementos, {
    start,
    interval: 0.08,
    batchMax: 8,
    onEnter: (lote) => gsap.to(lote, { ...varsIn, overwrite: true }),
    onLeaveBack: (lote) => gsap.to(lote, { ...varsOut, overwrite: true }),
  });
}

function initBloques() {
  revelarLote(
    '[data-bloque]',
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
    { autoAlpha: 0, y: 16, duration: 0.32, stagger: 0.03, ease: 'power2.in' },
  );
}

function initLugares() {
  revelarLote(
    '[data-lugar]',
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
    { autoAlpha: 0, y: 16, duration: 0.32, stagger: 0.04, ease: 'power2.in' },
    'top 82%',
  );
}

function initContadores() {
  document.querySelectorAll<HTMLElement>('[data-contador]').forEach((el) => {
    const fin = Number(el.dataset.contador ?? '0');
    const alCargar = el.hasAttribute('data-contador-carga');
    const obj = { n: 0 };

    const aplicar = () => {
      el.textContent = String(Math.round(obj.n)).padStart(2, '0');
    };

    if (alCargar) {
      gsap.to(obj, {
        n: fin,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: aplicar,
      });
      return;
    }

    ScrollTrigger.create({
      trigger: el,
      start: 'top 84%',
      onEnter: () => {
        obj.n = 0;
        gsap.to(obj, {
          n: fin,
          duration: 0.9,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: aplicar,
        });
      },
      onLeaveBack: () => {
        gsap.to(obj, {
          n: 0,
          duration: 0.35,
          ease: 'power2.in',
          overwrite: true,
          onUpdate: aplicar,
        });
      },
    });
  });
}

function initMaskImagenes() {
  revelarLote(
    '[data-mask-img]',
    { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
    { autoAlpha: 0, scale: 1.05, duration: 0.35, ease: 'power2.in' },
    'top 84%',
  );
}

function initNavbar(lenis: Lenis | null) {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const pista = nav?.querySelector<HTMLElement>('.navbar-links');
  const indicador = nav?.querySelector<HTMLElement>('[data-nav-indicador]');
  if (!nav || !pista || !indicador) return;

  const links = gsap.utils.toArray<HTMLAnchorElement>('[data-nav] .navbar-links a');

  const mover = (link: HTMLElement) => {
    const pistaBox = pista.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    gsap.to(indicador, {
      x: box.left - pistaBox.left,
      width: box.width,
      autoAlpha: 1,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  gsap.set(indicador, { width: 0, autoAlpha: 0 });

  const paginaActual = nav.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
  if (paginaActual) {
    requestAnimationFrame(() => mover(paginaActual));
  }

  links.forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const hash = href.includes('#') ? `#${href.split('#')[1]}` : '';
    const esHashLocal = href.startsWith('#');

    if (hash && esHashLocal) {
      const seccion = document.querySelector(hash);
      if (seccion) {
        ScrollTrigger.create({
          trigger: seccion,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (!self.isActive) return;
            links.forEach((l) => {
              if (l.getAttribute('aria-current') !== 'page') l.removeAttribute('aria-current');
            });
            link.setAttribute('aria-current', 'location');
            mover(link);
          },
        });
      }
    }

    if (esHashLocal) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        irA(href, lenis, -72);
        history.replaceState(null, '', href);
      });
    }
  });

  const diarioLink = links.find((l) => (l.getAttribute('href') ?? '').endsWith('/diario'));
  const diarioSeccion = document.querySelector('#diario');
  if (diarioLink && diarioSeccion) {
    ScrollTrigger.create({
      trigger: diarioSeccion,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return;
        links.forEach((l) => {
          if (l.getAttribute('aria-current') !== 'page') l.removeAttribute('aria-current');
        });
        diarioLink.setAttribute('aria-current', 'location');
        mover(diarioLink);
      },
    });
  }
}

function initProgreso(lenis: Lenis | null) {
  const barra = document.querySelector<HTMLElement>('[data-progreso]');
  if (!barra) return;

  const actualizar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = lenis?.scroll ?? window.scrollY;
    const p = max > 0 ? y / max : 0;
    gsap.set(barra, { scaleX: Math.min(1, Math.max(0, p)) });
  };

  if (lenis) lenis.on('scroll', actualizar);
  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

function panelesCategoria() {
  return {
    seccion: document.querySelector<HTMLElement>('#categorias'),
    cards: gsap.utils.toArray<HTMLElement>('[data-cat-card]'),
    panels: gsap.utils.toArray<HTMLElement>('[data-cat-panel]'),
    cerrar: document.querySelectorAll<HTMLButtonElement>('[data-cerrar-categoria]'),
  };
}

let categoriaAbierta: number | null = null;
let refrescoPendiente = 0;

function refrescarScroll() {
  window.clearTimeout(refrescoPendiente);
  refrescoPendiente = window.setTimeout(() => ScrollTrigger.refresh(), 200);
}

function abrirPanel(i: number) {
  const { seccion, cards, panels } = panelesCategoria();
  if (categoriaAbierta === i) {
    cerrarPaneles();
    return;
  }
  categoriaAbierta = i;
  seccion?.classList.add('es-panel-abierto');

  panels.forEach((panel, j) => {
    const abierto = j === i;
    panel.classList.toggle('es-abierto', abierto);
    panel.setAttribute('aria-hidden', abierto ? 'false' : 'true');
  });

  cards.forEach((card, j) => {
    card.setAttribute('aria-expanded', j === i ? 'true' : 'false');
  });

  const panel = panels[i];
  if (panel) {
    gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out', overwrite: true },
    );

    const entradas = panel.querySelectorAll('.cat-entrada');
    if (entradas.length) {
      gsap.fromTo(
        entradas,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.4,
          delay: 0.06,
          ease: 'power2.out',
          overwrite: true,
        },
      );
    }
  }

  refrescarScroll();
  panels[i]?.querySelector<HTMLButtonElement>('[data-cerrar-categoria]')?.focus({
    preventScroll: true,
  });
}

function cerrarPaneles() {
  const { seccion, cards, panels } = panelesCategoria();
  categoriaAbierta = null;
  seccion?.classList.remove('es-panel-abierto');

  panels.forEach((panel) => {
    panel.classList.remove('es-abierto');
    panel.setAttribute('aria-hidden', 'true');
    gsap.set(panel, { clearProps: 'opacity,visibility,transform' });
  });
  cards.forEach((card) => card.setAttribute('aria-expanded', 'false'));

  gsap.fromTo(
    cards,
    { autoAlpha: 0, y: 10 },
    {
      autoAlpha: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: true,
    },
  );

  refrescarScroll();
}

function initCategoriasClick(_lenis: Lenis | null) {
  const { cards, cerrar } = panelesCategoria();
  if (cards.length === 0) return;

  cards.forEach((card, i) => {
    card.addEventListener('click', () => abrirPanel(i));
  });

  cerrar.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarPaneles();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && categoriaAbierta !== null) cerrarPaneles();
  });
}

function initCategorias(lenis: Lenis | null) {
  const seccion = document.querySelector<HTMLElement>('#categorias');
  const { cards } = panelesCategoria();
  if (!seccion || cards.length === 0) {
    initCategoriasClick(lenis);
    return;
  }

  revelarLote(
    '[data-cat-card]',
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
    { autoAlpha: 0, y: 20, scale: 0.97, duration: 0.32, stagger: 0.04, ease: 'power2.in' },
    'top 78%',
  );

  initCategoriasClick(lenis);
}
