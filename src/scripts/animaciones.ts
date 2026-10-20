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
    initRecorrido(null, true);
    initCategoriasClick(null);
    return () => undefined;
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = initSmoothScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    initCursor();
    initHeroTitulo();
    initCarruselHero();
    initBloques();
    initLugares();
    initContadores();
    initMaskImagenes();
    initNavbar(lenis);
    initRecorrido(lenis, false);
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

  const manchas = gsap.utils.toArray<HTMLElement>('[data-fondo-blob]');
  manchas.forEach((mancha, i) => {
    const recorrido = [
      { x: 240, y: -170 },
      { x: -280, y: 190 },
      { x: 200, y: 230 },
      { x: -210, y: -180 },
    ][i % 4];
    const ciclo = [34, 40, 30, 46][i % 4];

    gsap.to(mancha, {
      x: recorrido.x,
      duration: ciclo,
      delay: i * 1.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to(mancha, {
      y: recorrido.y,
      duration: ciclo * 1.35,
      delay: i * 0.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to(mancha, {
      scale: i % 2 === 0 ? 1.2 : 0.84,
      duration: ciclo * 0.55,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to(mancha, {
      rotation: i % 2 === 0 ? 360 : -360,
      duration: ciclo * 2.4,
      ease: 'none',
      repeat: -1,
    });
  });

  const luces = gsap.utils.toArray<HTMLElement>('[data-fondo-luz]');
  luces.forEach((luz, i) => {
    const recorrido = [
      { x: 180, y: 140 },
      { x: -210, y: 160 },
      { x: -140, y: -190 },
    ][i % 3];
    const ciclo = [28, 36, 32][i % 3];

    gsap.to(luz, {
      x: recorrido.x,
      duration: ciclo,
      delay: i * 2.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to(luz, {
      y: recorrido.y,
      duration: ciclo * 1.45,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to(luz, {
      scale: 1.16,
      duration: ciclo * 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });

  gsap.to('[data-fondo-mancha-scroll]', {
    y: (i) => (i % 2 === 0 ? 72 : -64),
    x: (i) => (i % 2 === 0 ? -36 : 44),
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4,
    },
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

function initCarruselHero() {
  const caja = document.querySelector<HTMLElement>('[data-hero-carrusel]');
  if (!caja) return;

  const pistaA = caja.querySelector<HTMLElement>('[data-hero-track="a"]');
  const pistaB = caja.querySelector<HTMLElement>('[data-hero-track="b"]');

  const deslizar = (pista: HTMLElement | null, inverso: boolean) => {
    if (!pista) return;
    const mitad = pista.scrollWidth / 2;
    if (mitad < 8) return;
    gsap.fromTo(
      pista,
      { x: inverso ? -mitad : 0 },
      {
        x: inverso ? 0 : -mitad,
        duration: inverso ? 34 : 28,
        ease: 'none',
        repeat: -1,
      },
    );
  };

  deslizar(pistaA, false);
  deslizar(pistaB, true);

  gsap.fromTo(
    caja,
    { autoAlpha: 1, x: 0 },
    {
      autoAlpha: 0,
      x: 72,
      ease: 'none',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.7,
      },
    },
  );
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
        const seccion = document.querySelector<HTMLElement>(href);
        const ancla = seccion?.querySelector<HTMLElement>('h2, h1') ?? seccion;
        if (ancla) irA(ancla, lenis, extraAlCentro(ancla));
        else irA(href, lenis, -window.innerHeight / 2);
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

function acotar(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function puntosOla(yFin: number) {
  const y0 = 12;
  const y1 = Math.max(y0 + 120, yFin);
  const puntos: { x: number; y: number }[] = [];
  const tramos = Math.max(28, Math.round((y1 - y0) / 120));
  for (let i = 0; i <= tramos; i++) {
    const t = i / tramos;
    const y = y0 + t * (y1 - y0);
    const x =
      100 +
      Math.sin(y / 250) * 54 +
      Math.sin(y / 580 + 0.6) * 10;
    puntos.push({ x: acotar(x, 40, 160), y });
  }
  return puntos;
}

function curvaCatmull(puntos: { x: number; y: number }[]) {
  if (puntos.length === 0) return '';
  let d = `M ${puntos[0].x.toFixed(1)} ${puntos[0].y.toFixed(1)}`;

  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const c1x = acotar(p1.x + (p2.x - p0.x) / 5.5, 28, 172);
    const c1y = p1.y + (p2.y - p0.y) / 5.5;
    const c2x = acotar(p2.x - (p3.x - p1.x) / 5.5, 28, 172);
    const c2y = p2.y - (p3.y - p1.y) / 5.5;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function yDocumento(seccion: HTMLElement, ancla: HTMLElement) {
  const desplazamiento = Number(gsap.getProperty(seccion, 'y')) || 0;
  const cajaSeccion = seccion.getBoundingClientRect();
  const cajaAncla = ancla.getBoundingClientRect();
  return (
    cajaSeccion.top +
    window.scrollY -
    desplazamiento +
    (cajaAncla.top - cajaSeccion.top) +
    cajaAncla.height / 2
  );
}

function puntoEnY(path: SVGPathElement, y: number) {
  const total = path.getTotalLength();
  if (total === 0) return { x: 100, y, dist: 0 };

  let lo = 0;
  let hi = total;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < y) lo = mid;
    else hi = mid;
  }

  const punto = path.getPointAtLength((lo + hi) / 2);
  return { x: punto.x, y: punto.y, dist: (lo + hi) / 2 };
}

function tablaDistancia(path: SVGPathElement) {
  const total = path.getTotalLength();
  const n = 72;
  const muestras: { y: number; dist: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const dist = (total * i) / n;
    muestras.push({ y: path.getPointAtLength(dist).y, dist });
  }
  return { total, muestras };
}

function distEnY(tabla: ReturnType<typeof tablaDistancia>, y: number) {
  const s = tabla.muestras;
  if (s.length === 0) return 0;
  if (y <= s[0].y) return s[0].dist;
  if (y >= s[s.length - 1].y) return s[s.length - 1].dist;
  for (let i = 1; i < s.length; i++) {
    if (y <= s[i].y) {
      const span = s[i].y - s[i - 1].y || 1;
      const t = (y - s[i - 1].y) / span;
      return s[i - 1].dist + t * (s[i].dist - s[i - 1].dist);
    }
  }
  return s[s.length - 1].dist;
}

function extraAlCentro(el: HTMLElement) {
  return el.offsetHeight / 2 - window.innerHeight / 2;
}

function initRecorrido(lenis: Lenis | null, reduce: boolean) {
  const raiz = document.querySelector<HTMLElement>('[data-recorrido]');
  const svg = document.querySelector<SVGSVGElement>('[data-recorrido-svg]');
  const trazo = document.querySelector<SVGPathElement>('[data-recorrido-trazo]');
  const glow = document.querySelector<SVGPathElement>('[data-recorrido-glow]');
  const burbujas = gsap.utils.toArray<HTMLAnchorElement>('[data-recorrido-parada]');
  if (!raiz || !svg || !trazo || !glow || burbujas.length === 0) return;

  const degradado = svg.querySelector('#serpiente-tono');
  let disparo: ScrollTrigger | undefined;
  let tabla: ReturnType<typeof tablaDistancia> | undefined;
  let layoutTimer = 0;
  let altoPrevio = 0;
  const reveladas = new Set<string>();

  const actualizarParadas = (dibujado: number, largo: number) => {
    burbujas.forEach((burbuja) => {
      const dist = Number(burbuja.dataset.dist ?? 0);
      const id = burbuja.dataset.parada ?? '';
      const llega = dibujado >= dist - 20;
      burbuja.classList.toggle('es-iluminada', llega);

      const seccion = document.getElementById(id);
      if (!seccion) return;
      if (llega && !reveladas.has(id)) {
        reveladas.add(id);
        gsap.to(seccion, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else if (!llega && reveladas.has(id)) {
        reveladas.delete(id);
        gsap.to(seccion, {
          autoAlpha: 0,
          y: 24,
          duration: 0.45,
          ease: 'power2.in',
          overwrite: 'auto',
        });
      }
    });
  };

  const yDeParada = (burbuja: HTMLAnchorElement) => {
    const id = burbuja.dataset.parada ?? '';
    const seccion = document.getElementById(id);
    if (!seccion) return null;
    const ancla = seccion.querySelector('h2') ?? seccion;
    return { burbuja, seccion, ancla, y: yDocumento(seccion, ancla) };
  };

  const pintarCabeza = () => {
    if (!tabla || reduce) return;
    const yCabeza = window.scrollY + window.innerHeight * 0.5 + 36;
    const dibujado = Math.min(tabla.total, distEnY(tabla, yCabeza));
    gsap.set([trazo, glow], { strokeDashoffset: tabla.total - dibujado });
    actualizarParadas(dibujado, tabla.total);
  };

  const layout = () => {
    const anclas = burbujas
      .map(yDeParada)
      .filter((item): item is NonNullable<ReturnType<typeof yDeParada>> => item !== null);
    if (anclas.length === 0) return;

    const yFin = anclas[anclas.length - 1].y;
    const altoTrazo = yFin + window.innerHeight * 0.55;
    const altoPagina = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (Math.abs(altoPagina - altoPrevio) < 8 && disparo && !reduce) {
      anclas.forEach(({ burbuja, y }) => {
        const punto = puntoEnY(trazo, y);
        gsap.set(burbuja, { x: punto.x, y: punto.y });
        burbuja.dataset.dist = String(punto.dist);
      });
      pintarCabeza();
      return;
    }
    altoPrevio = altoPagina;

    raiz.style.height = `${altoTrazo}px`;
    svg.setAttribute('viewBox', `0 0 200 ${altoTrazo}`);
    svg.setAttribute('height', String(altoTrazo));
    if (degradado instanceof SVGLinearGradientElement) {
      degradado.setAttribute('y2', String(altoTrazo));
    }

    const d = curvaCatmull(puntosOla(altoTrazo));
    trazo.setAttribute('d', d);
    glow.setAttribute('d', d);

    const largo = trazo.getTotalLength();
    anclas.forEach(({ burbuja, y }) => {
      const punto = puntoEnY(trazo, y);
      gsap.set(burbuja, { x: punto.x, y: punto.y });
      burbuja.dataset.dist = String(punto.dist);
    });

    tabla = tablaDistancia(trazo);

    disparo?.kill();
    disparo = undefined;

    gsap.set([trazo, glow], {
      strokeDasharray: largo,
      strokeDashoffset: reduce ? 0 : largo,
    });

    if (reduce) {
      burbujas.forEach((burbuja) => burbuja.classList.add('es-iluminada'));
      gsap.set('[data-recorrido-seccion]', { autoAlpha: 1, y: 0 });
      return;
    }

    pintarCabeza();
    disparo = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: pintarCabeza,
      onRefresh: pintarCabeza,
    });
  };

  if (!reduce) {
    gsap.set('[data-recorrido-seccion]', { autoAlpha: 0, y: 24 });
  } else {
    gsap.set('[data-recorrido-seccion]', { autoAlpha: 1, y: 0 });
  }

  burbujas.forEach((burbuja) => {
    burbuja.addEventListener('click', (e) => {
      const href = burbuja.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      const seccion = document.querySelector<HTMLElement>(href);
      const ancla = seccion?.querySelector<HTMLElement>('h2') ?? seccion;
      if (ancla) irA(ancla, lenis, extraAlCentro(ancla));
      else irA(href, lenis, extraAlCentro(burbuja));
      history.replaceState(null, '', href);
    });
  });

  const pedirLayout = () => {
    window.clearTimeout(layoutTimer);
    layoutTimer = window.setTimeout(layout, 220);
  };

  layout();
  window.addEventListener('load', pedirLayout);
  window.addEventListener('resize', pedirLayout);

  const contenido = document.querySelector('#contenido');
  if (contenido && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(() => pedirLayout());
    observer.observe(contenido);
  }
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
