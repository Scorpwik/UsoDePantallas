import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initSmoothScroll, irA } from './smooth-scroll';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initSitio() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('[data-revelar]', { autoAlpha: 1 });
    gsap.set('[data-objetivo]', { autoAlpha: 1, y: 0 });
    gsap.set('[data-cat-card]', { autoAlpha: 1, y: 0, rotationY: 0 });
    initNavbar(null);
    initProgreso(null);
    initCristal();
    initCategoriasClick(null);
    return () => undefined;
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = initSmoothScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    initCursor();
    initParticulas();
    initCristal();
    initRevelados();
    initObjetivos();
    initContadores();
    initParallax();
    initClipSecciones();
    initNavbar(lenis);
    initProgreso(lenis);
    initCategorias(lenis);
    return () => {
      lenis?.destroy();
    };
  });
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
      width: on ? 44 : 14,
      height: on ? 44 : 14,
      background: on ? 'rgb(215 0 30 / 0.18)' : 'rgb(215 0 30 / 0.22)',
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  document.querySelectorAll('a, button, [data-cursor-grow]').forEach((el) => {
    el.addEventListener('pointerenter', () => crece(true));
    el.addEventListener('pointerleave', () => crece(false));
  });
}

function initParticulas() {
  const canvas = document.querySelector<HTMLCanvasElement>('#particulas-hero');
  const hero = document.querySelector<HTMLElement>('#inicio');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const puntos = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 1.6,
    v: 0.08 + Math.random() * 0.18,
  }));

  let visible = true;
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { threshold: 0.05 },
  );
  io.observe(hero);

  const pintar = () => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(215, 0, 30, 0.55)';
    for (const p of puntos) {
      p.y -= p.v / 400;
      if (p.y < 0) p.y = 1;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = () => {
    if (visible) pintar();
    requestAnimationFrame(loop);
  };

  const medir = () => {
    canvas.width = hero.clientWidth;
    canvas.height = hero.clientHeight;
  };

  medir();
  window.addEventListener('resize', medir);
  requestAnimationFrame(loop);
}

function initCristal() {
  document.querySelectorAll<HTMLElement>('[data-glass]').forEach((panel) => {
    panel.addEventListener('pointermove', (e) => {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
      panel.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

function initRevelados() {
  ScrollTrigger.batch('[data-revelar]', {
    start: 'top 88%',
    once: true,
    onEnter: (elementos) => {
      elementos.forEach((el) => {
        const split = SplitText.create(el, { type: 'words', aria: 'hidden' });
        gsap.from(split.words, {
          autoAlpha: 0,
          y: 14,
          duration: 0.5,
          stagger: 0.022,
          ease: 'power2.out',
        });
      });
    },
  });
}

function initObjetivos() {
  gsap.from('[data-objetivo]', {
    autoAlpha: 0,
    y: 48,
    rotationX: 8,
    duration: 0.7,
    stagger: 0.16,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#planteamiento', start: 'top 58%' },
  });
}

function initContadores() {
  document.querySelectorAll<HTMLElement>('[data-contador]').forEach((el) => {
    const fin = Number(el.dataset.contador ?? '0');
    const obj = { n: 0 };
    gsap.to(obj, {
      n: fin,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 84%' },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.n)).padStart(2, '0');
      },
    });
  });
}

function initParallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      },
    );
  });
}

function initClipSecciones() {
  document.querySelectorAll<HTMLElement>('[data-clip]').forEach((seccion) => {
    gsap.fromTo(
      seccion,
      { clipPath: 'inset(6% 4% 6% 4% round 28px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: {
          trigger: seccion,
          start: 'top 88%',
          end: 'top 42%',
          scrub: 0.5,
        },
      },
    );
  });
}

function initNavbar(lenis: Lenis | null) {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const pista = nav?.querySelector<HTMLElement>('.navbar-links');
  const indicador = nav?.querySelector<HTMLElement>('[data-nav-indicador]');
  const links = gsap.utils.toArray<HTMLAnchorElement>('[data-nav] .navbar-links a[href^="#"]');
  if (!nav || !pista || !indicador || links.length === 0) return;

  const mover = (link: HTMLElement) => {
    const pistaBox = pista.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    gsap.to(indicador, {
      x: box.left - pistaBox.left,
      width: box.width,
      duration: 0.35,
      ease: 'power3.out',
    });
  };

  requestAnimationFrame(() => mover(links[0]));

  links.forEach((link) => {
    const id = link.getAttribute('href');
    if (!id) return;
    const seccion = document.querySelector(id);
    if (!seccion) return;

    ScrollTrigger.create({
      trigger: seccion,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return;
        links.forEach((l) => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'location');
        mover(link);
      },
    });

    link.addEventListener('click', (e) => {
      e.preventDefault();
      irA(id, lenis, -12);
      history.replaceState(null, '', id);
    });
  });
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
    cards: gsap.utils.toArray<HTMLElement>('[data-cat-card]'),
    panels: gsap.utils.toArray<HTMLElement>('[data-cat-panel]'),
    cerrar: document.querySelectorAll<HTMLButtonElement>('[data-cerrar-categoria]'),
  };
}

function abrirPanel(i: number) {
  const { cards, panels } = panelesCategoria();
  panels.forEach((panel, j) => {
    const abierto = j === i;
    panel.classList.toggle('es-abierto', abierto);
    panel.setAttribute('aria-hidden', abierto ? 'false' : 'true');
    gsap.to(panel, {
      autoAlpha: abierto ? 1 : 0,
      y: abierto ? 0 : 24,
      duration: 0.55,
      ease: 'power3.inOut',
    });
  });
  gsap.to(cards, {
    autoAlpha: 0.14,
    scale: 0.96,
    duration: 0.45,
    ease: 'power3.out',
  });
  const entradas = panels[i]?.querySelectorAll('.cat-entrada');
  if (entradas?.length) {
    gsap.fromTo(
      entradas,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.12, ease: 'power2.out' },
    );
  }
}

function cerrarPaneles() {
  const { cards, panels } = panelesCategoria();
  panels.forEach((panel) => {
    panel.classList.remove('es-abierto');
    panel.setAttribute('aria-hidden', 'true');
  });
  gsap.to(panels, { autoAlpha: 0, duration: 0.4, ease: 'power2.inOut' });
  gsap.to(cards, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
}

function initCategoriasClick(lenis: Lenis | null) {
  const { cards, cerrar } = panelesCategoria();
  cards.forEach((card, i) => {
    card.addEventListener('click', () => abrirPanel(i));
  });
  cerrar.forEach((btn) => {
    btn.addEventListener('click', () => {
      cerrarPaneles();
      irA('#categorias', lenis, 0);
    });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarPaneles();
  });
}

function initCategorias(lenis: Lenis | null) {
  const seccion = document.querySelector<HTMLElement>('#categorias');
  const { cards, panels, cerrar } = panelesCategoria();
  if (!seccion || cards.length === 0) return;

  gsap.set(panels, { autoAlpha: 0, y: 32 });
  gsap.set(cards, { autoAlpha: 0, y: 70, rotationY: 16, rotation: 3 });

  gsap.to(cards, {
    autoAlpha: 1,
    y: 0,
    rotationY: 0,
    rotation: 0,
    stagger: 0.18,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: seccion, start: 'top 72%' },
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: seccion,
      start: 'top top',
      end: `+=${cards.length * 120}%`,
      pin: true,
      scrub: 0.75,
      anticipatePin: 1,
    },
  });

  cards.forEach((_card, i) => {
    tl.addLabel(`cat-${i}`);
    tl.to(cards, { autoAlpha: 0.12, scale: 0.94, duration: 0.35 }, `cat-${i}`);
    tl.to(cards[i], { autoAlpha: 1, scale: 1.02, duration: 0.35 }, `cat-${i}`);
    tl.to(panels[i], { autoAlpha: 1, y: 0, duration: 0.4 }, `cat-${i}+=0.05`);
    const entradas = panels[i]?.querySelectorAll('.cat-entrada');
    if (entradas?.length) {
      tl.fromTo(
        entradas,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.35 },
        `cat-${i}+=0.12`,
      );
    }
    tl.add(() => {
      panels.forEach((panel, j) => {
        const abierto = j === i;
        panel.classList.toggle('es-abierto', abierto);
        panel.setAttribute('aria-hidden', abierto ? 'false' : 'true');
      });
    }, `cat-${i}`);

    if (i < cards.length - 1) {
      tl.to(panels[i], { autoAlpha: 0, duration: 0.3 });
      tl.to(cards, { autoAlpha: 1, scale: 1, duration: 0.25 }, '<');
    }
  });

  const irAEtiqueta = (i: number) => {
    const st = tl.scrollTrigger;
    if (!st) return;
    const tiempo = Math.min(tl.duration() * 0.98, (tl.labels[`cat-${i}`] ?? 0) + 0.45);
    const progreso = tiempo / tl.duration();
    irA(st.start + (st.end - st.start) * progreso, lenis);
  };

  cards.forEach((card, i) => {
    card.addEventListener('click', () => irAEtiqueta(i));
  });

  cerrar.forEach((btn) => {
    btn.addEventListener('click', () => {
      const st = tl.scrollTrigger;
      if (st) irA(st.start, lenis);
      else cerrarPaneles();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const st = tl.scrollTrigger;
    if (st) irA(st.start, lenis);
  });
}
