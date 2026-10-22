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
    gsap.set('[data-entrada-scroll]', { autoAlpha: 1, y: 0 });
    gsap.set('[data-lugar]', { autoAlpha: 1, y: 0 });
    gsap.set('[data-cat-card]', { autoAlpha: 1, y: 0, scale: 1 });
    gsap.set('[data-mask-img]', { autoAlpha: 1, scale: 1 });
    initNavbar(null);
    const limpiarRecorrido = initRecorrido(null, true);
    const limpiarCamara = initCamaraScroll(true);
    const limpiarFotos = initPopupFotosDiario();
    initCategoriasClick(null);
    return () => {
      limpiarFotos?.();
      limpiarCamara?.();
      limpiarRecorrido?.();
    };
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = initSmoothScroll();
    const limpiarCursor = initCursor();
    const limpiarFotos = initPopupFotosDiario();
    initHeroTitulo();
    initCarruselHero();
    initBloques();
    initLugares();
    initContadores();
    initMaskImagenes();
    initEntradas();
    initNavbar(lenis);
    const limpiarRecorrido = initRecorrido(lenis, false);
    const limpiarCamara = initCamaraScroll(false);
    initCategorias(lenis);
    initAmbiente();
    alinearHash(lenis);
    const alCargar = () => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener('load', alCargar, { once: true });
    return () => {
      window.removeEventListener('load', alCargar);
      limpiarCamara?.();
      limpiarRecorrido?.();
      limpiarFotos?.();
      limpiarCursor?.();
      lenis?.destroy();
    };
  });
}

function urlFrameCamara(indice: number) {
  return `/sequences/camara/web_${String(indice + 1).padStart(4, '0')}.webp`;
}

let recorteCamara: { sx: number; sy: number; sw: number; sh: number } | null = null;

function lumaDe(px: Uint8ClampedArray, i: number) {
  return 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
}

function recorteDelFrame(img: HTMLImageElement) {
  if (recorteCamara) return recorteCamara;

  const pw = 160;
  const ph = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * pw));
  const sonda = document.createElement('canvas');
  sonda.width = pw;
  sonda.height = ph;
  const sctx = sonda.getContext('2d', { willReadFrequently: true });
  if (!sctx) {
    recorteCamara = { sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight };
    return recorteCamara;
  }

  sctx.drawImage(img, 0, 0, pw, ph);
  const px = sctx.getImageData(0, 0, pw, ph).data;
  let minX = pw;
  let minY = ph;
  let maxX = 0;
  let maxY = 0;
  const paso = 2;

  for (let y = 0; y < ph; y += paso) {
    for (let x = 0; x < pw; x += paso) {
      if (lumaDe(px, (y * pw + x) * 4) < 6) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX <= minX || maxY <= minY) {
    recorteCamara = { sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight };
    return recorteCamara;
  }

  const pad = 28;
  const sx = Math.max(0, ((minX - pad) / pw) * img.naturalWidth);
  const sy = Math.max(0, ((minY - pad) / ph) * img.naturalHeight);
  const ex = Math.min(img.naturalWidth, ((maxX + pad) / pw) * img.naturalWidth);
  const ey = Math.min(img.naturalHeight, ((maxY + pad) / ph) * img.naturalHeight);
  recorteCamara = { sx, sy, sw: ex - sx, sh: ey - sy };
  return recorteCamara;
}

function initCamaraScroll(reduce: boolean) {
  const seccion = document.querySelector<HTMLElement>('[data-camara-seccion]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-camara]');
  if (!seccion || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const total = Number(seccion.dataset.camaraTotal ?? 180);
  const frames: Array<HTMLImageElement | undefined> = new Array(total);
  let dibujado = -1;
  let anchoCanvas = 0;
  let altoCanvas = 0;
  let indiceScroll = 0;
  let cajaCamara = { x: 0, y: 0, w: 0, h: 0 };

  const pintar = (indice: number) => {
    let elegido = indice;
    let img = frames[elegido];
    if (!img?.complete || !img.naturalWidth) {
      for (let d = 1; d < 16; d++) {
        const atras = frames[indice - d];
        if (atras?.complete && atras.naturalWidth) {
          elegido = indice - d;
          img = atras;
          break;
        }
        const adelante = frames[indice + d];
        if (adelante?.complete && adelante.naturalWidth) {
          elegido = indice + d;
          img = adelante;
          break;
        }
      }
    }
    if (!img || elegido === dibujado) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ancho = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const alto = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (anchoCanvas !== ancho || altoCanvas !== alto) {
      canvas.width = ancho;
      canvas.height = alto;
      anchoCanvas = ancho;
      altoCanvas = alto;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
    }

    ctx.clearRect(0, 0, ancho, alto);
    const recorte = recorteDelFrame(img);
    const margen = 0.08;
    const escala = Math.min(ancho / recorte.sw, alto / recorte.sh) * (1 - margen * 2);
    const dw = recorte.sw * escala;
    const dh = recorte.sh * escala;
    const dx = (ancho - dw) / 2;
    const dy = alto * margen;
    ctx.drawImage(img, recorte.sx, recorte.sy, recorte.sw, recorte.sh, dx, dy, dw, dh);
    cajaCamara = { x: dx / dpr, y: dy / dpr, w: dw / dpr, h: dh / dpr };
    dibujado = elegido;
  };

  const cargar = (indice: number) => {
    if (indice < 0 || indice >= total || frames[indice]) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = urlFrameCamara(indice);
    frames[indice] = img;
    img.onload = () => {
      if (!recorteCamara) recorteDelFrame(img);
      if (indice === 0 || indice === indiceScroll) pintar(indiceScroll);
    };
  };

  const cargarCerca = (indice: number) => {
    const desde = Math.max(0, indice - 8);
    const hasta = Math.min(total, indice + 36);
    for (let i = desde; i < hasta; i++) cargar(i);
  };

  const entradas = gsap.utils.toArray<HTMLElement>('[data-entrada-scroll]', seccion);
  const huecos = entradas.map((entrada) => entrada.querySelector<HTMLElement>('.diario-camara-hueco'));
  const piezas = entradas.map((entrada) => entrada.querySelector<HTMLElement>('.cat-entrada'));
  const tarjetas = piezas.map(
    (pieza) => pieza?.querySelector<HTMLElement>('.tarjeta') ?? pieza,
  );
  const mostradas = entradas.map((_, i) => i === 0);
  const opacidadTarjeta = tarjetas.map((tarjeta) =>
    tarjeta
      ? gsap.quickTo(tarjeta, 'opacity', { duration: 0.16, ease: 'power2.out' })
      : null,
  );

  piezas.forEach((pieza, i) => {
    if (!pieza) return;
    gsap.set(pieza, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 32 });
  });

  const coberturaCamara = (
    cam: { left: number; right: number; top: number; bottom: number },
    card: DOMRect,
  ) => {
    const x = Math.max(0, Math.min(cam.right, card.right) - Math.max(cam.left, card.left));
    const y = Math.max(0, Math.min(cam.bottom, card.bottom) - Math.max(cam.top, card.top));
    if (x <= 4 || y <= 4) return 0;
    const anchoCam = Math.max(1, cam.right - cam.left);
    const altoCam = Math.max(1, cam.bottom - cam.top);
    return gsap.utils.clamp(0, 1, Math.min(x / (anchoCam * 0.38), y / (altoCam * 0.22)));
  };

  const xDelHueco = (hueco: HTMLElement) => {
    const caja = hueco.getBoundingClientRect();
    const base = canvas.parentElement?.getBoundingClientRect().left ?? 0;
    return caja.left + caja.width / 2 - canvas.offsetWidth / 2 - base;
  };

  const pasoDelCruce = (t: number, tFinTarjeta: number) => {
    const inicio = gsap.utils.clamp(0, 0.92, tFinTarjeta);
    const meta = Math.min(0.98, inicio + 0.34);
    const recorrido = gsap.utils.clamp(0, 1, (t - inicio) / Math.max(0.08, meta - inicio));
    return recorrido * recorrido * (3 - 2 * recorrido);
  };

  const colocar = () => {
    const validos = huecos.filter((hueco): hueco is HTMLElement => hueco != null);
    if (validos.length === 0) return;

    const vista = window.innerHeight * 0.5;
    const cajas = entradas.map((entrada) => entrada.getBoundingClientRect());
    const centros = cajas.map((caja) => caja.top + caja.height / 2);
    const ultimo = centros.length - 1;
    let tramo = 0;
    let t = 0;

    if (vista <= centros[0]) {
      tramo = 0;
    } else if (vista >= centros[ultimo]) {
      tramo = ultimo;
    } else {
      for (let i = 0; i < ultimo; i++) {
        if (vista >= centros[i] && vista <= centros[i + 1]) {
          tramo = i;
          const distancia = centros[i + 1] - centros[i];
          t = distancia > 0 ? (vista - centros[i]) / distancia : 0;
          break;
        }
      }
    }

    const distanciaTramo =
      tramo < ultimo ? centros[tramo + 1] - centros[tramo] : 1;
    const tFinTarjeta =
      distanciaTramo > 0 ? (cajas[tramo].bottom - centros[tramo]) / distanciaTramo : 1;
    const cruce = tramo === ultimo ? 1 : pasoDelCruce(t, tFinTarjeta);
    const origen = validos[Math.min(tramo, validos.length - 1)];
    const destino = validos[Math.min(tramo + (tramo === ultimo ? 0 : 1), validos.length - 1)];
    gsap.set(canvas, { x: gsap.utils.interpolate(xDelHueco(origen), xDelHueco(destino), cruce) });

    const avance = tramo === ultimo ? ultimo : tramo + cruce;
    const lienzo = canvas.getBoundingClientRect();
    const dibujo =
      cajaCamara.w > 8
        ? cajaCamara
        : {
            x: lienzo.width * 0.1,
            y: lienzo.height * 0.08,
            w: lienzo.width * 0.8,
            h: lienzo.height * 0.52,
          };
    const camaraVista = {
      left: lienzo.left + dibujo.x + 6,
      right: lienzo.left + dibujo.x + dibujo.w - 6,
      top: lienzo.top + dibujo.y + 6,
      bottom: lienzo.top + dibujo.y + dibujo.h - 6,
    };

    if (reduce) {
      piezas.forEach((pieza) => {
        if (pieza) gsap.set(pieza, { autoAlpha: 1, y: 0 });
      });
      return;
    }

    const lista = seccion.querySelector('.diario-camara-lista');
    if (lista) {
      const caja = lista.getBoundingClientRect();
      const progreso = gsap.utils.clamp(
        0,
        1,
        (window.innerHeight - caja.top) / (caja.height + window.innerHeight),
      );
      indiceScroll = Math.round(progreso * (total - 1));
    }

    piezas.forEach((pieza, i) => {
      if (!pieza) return;
      if (i > 0) {
        const enVista = cajas[i].top < window.innerHeight * 0.82;
        const mostrar = avance > i - 1 || enVista;
        if (mostradas[i] !== mostrar) {
          mostradas[i] = mostrar;
          gsap.to(pieza, {
            autoAlpha: mostrar ? 1 : 0,
            y: mostrar ? 0 : 32,
            duration: mostrar ? 0.55 : 0.28,
            ease: mostrar ? 'power2.out' : 'power2.in',
            overwrite: 'auto',
          });
        }
      }

      const tarjeta = tarjetas[i];
      const atenuar = opacidadTarjeta[i];
      if (!tarjeta || !atenuar) return;
      const cubre = coberturaCamara(camaraVista, tarjeta.getBoundingClientRect());
      const suave = cubre * cubre * (3 - 2 * cubre);
      atenuar(gsap.utils.interpolate(1, 0.28, suave));
    });

    cargarCerca(indiceScroll);
    pedirPintar();
  };

  cargar(0);
  for (let i = 1; i < 10; i++) cargar(i);

  let pintarPendiente = false;
  const pedirPintar = () => {
    if (pintarPendiente || reduce) return;
    pintarPendiente = true;
    requestAnimationFrame(() => {
      pintarPendiente = false;
      pintar(indiceScroll);
    });
  };

  ScrollTrigger.create({
    trigger: seccion,
    start: 'top bottom',
    end: 'bottom top',
    invalidateOnRefresh: true,
    onEnter: () => cargarCerca(indiceScroll),
    onEnterBack: () => cargarCerca(indiceScroll),
    onUpdate: colocar,
    onRefresh: colocar,
  });

  const vuelo = canvas.parentElement;
  if (!reduce && vuelo && entradas.length > 1) {
    ScrollTrigger.create({
      trigger: entradas[0],
      endTrigger: entradas[entradas.length - 1],
      start: 'top 118px',
      end: 'bottom center',
      pin: vuelo,
      pinSpacing: false,
      invalidateOnRefresh: true,
      onRefresh: () => {
        const spacer = vuelo.parentElement;
        if (spacer?.classList.contains('pin-spacer')) spacer.style.pointerEvents = 'none';
      },
    });
    const spacer = vuelo.parentElement;
    if (spacer?.classList.contains('pin-spacer')) spacer.style.pointerEvents = 'none';
  }

  colocar();

  let resizeTimer = 0;
  const alRedimensionar = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      dibujado = -1;
      anchoCanvas = 0;
      pintar(indiceScroll);
      colocar();
    }, 120);
  };
  window.addEventListener('resize', alRedimensionar, { passive: true });

  return () => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', alRedimensionar);
  };
}

function initAmbiente() {
  const manchas = gsap.utils.toArray<HTMLElement>('[data-fondo-blob]');
  manchas.forEach((mancha, i) => {
    const recorrido = [
      { x: 160, y: -110 },
      { x: -180, y: 120 },
      { x: 130, y: 150 },
      { x: -140, y: -120 },
    ][i % 4];
    gsap.to(mancha, {
      x: recorrido.x,
      y: recorrido.y,
      duration: 38 + i * 6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });

  const orbita = document.querySelector('.hero-orbita');
  if (orbita) {
    gsap.to(orbita, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
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

  const alMover = (e: PointerEvent) => {
    xTo(e.clientX);
    yTo(e.clientY);
  };
  window.addEventListener('pointermove', alMover);

  const crece = (on: boolean) => {
    gsap.to(anillo, {
      scale: on ? 3 : 1,
      background: on ? 'rgb(110 36 50 / 0.12)' : 'rgb(110 36 50 / 0.16)',
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const objetivos = document.querySelectorAll('a, button, [data-cursor-grow], [data-cursor-img]');
  const entrar = () => crece(true);
  const salir = () => crece(false);
  objetivos.forEach((el) => {
    el.addEventListener('pointerenter', entrar);
    el.addEventListener('pointerleave', salir);
  });

  return () => {
    window.removeEventListener('pointermove', alMover);
    objetivos.forEach((el) => {
      el.removeEventListener('pointerenter', entrar);
      el.removeEventListener('pointerleave', salir);
    });
    document.body.classList.remove('cursor-custom');
  };
}

function initPopupFotosDiario() {
  const popup = document.createElement('div');
  popup.className = 'entrada-foto-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-hidden', 'true');
  popup.setAttribute('aria-label', 'Foto ampliada');
  const popupImg = document.createElement('img');
  popup.appendChild(popupImg);
  document.body.appendChild(popup);
  gsap.set(popup, { autoAlpha: 0, position: 'fixed', x: 0, y: 0 });

  let abierto: HTMLElement | null = null;
  let origenX = 0;
  let origenY = 0;

  const cerrar = () => {
    if (!abierto) return;
    abierto = null;
    popup.setAttribute('aria-hidden', 'true');
    gsap.to(popup, {
      autoAlpha: 0,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: true,
    });
  };

  const abrir = (marco: HTMLElement) => {
    const img = marco.querySelector('img');
    if (!img) return;
    abierto = marco;
    popup.setAttribute('aria-hidden', 'false');
    const caja = marco.getBoundingClientRect();
    popupImg.src = img.currentSrc || img.src;
    popupImg.alt = img.alt;
    const w = Math.min(caja.width * 1.78, 760, window.innerWidth - 40);
    const h = w * (caja.height / Math.max(1, caja.width));
    let left = caja.left;
    let top = caja.top;
    if (left + w > window.innerWidth - 16) left = window.innerWidth - w - 16;
    if (top + h > window.innerHeight - 16) top = window.innerHeight - h - 16;
    left = gsap.utils.clamp(16, window.innerWidth - w - 16, left);
    top = gsap.utils.clamp(16, window.innerHeight - h - 16, top);
    const sx = caja.width / Math.max(1, w);
    const sy = caja.height / Math.max(1, h);
    gsap.killTweensOf(popup);
    gsap.fromTo(
      popup,
      {
        autoAlpha: 1,
        width: w,
        height: h,
        x: caja.left,
        y: caja.top,
        scaleX: sx,
        scaleY: sy,
        transformOrigin: '0 0',
      },
      {
        x: left,
        y: top,
        scaleX: 1,
        scaleY: 1,
        duration: 0.36,
        ease: 'power3.out',
        overwrite: true,
      },
    );
  };

  const fueArrastre = (e: MouseEvent) => Math.hypot(e.clientX - origenX, e.clientY - origenY) > 8;

  const fotos = gsap.utils.toArray<HTMLElement>('.entrada-foto');
  const alPointerDown = (e: PointerEvent) => {
    origenX = e.clientX;
    origenY = e.clientY;
  };
  const alClick = (e: MouseEvent) => {
    const foto = e.currentTarget as HTMLElement;
    if (fueArrastre(e)) return;
    e.stopPropagation();
    abrir(foto);
  };
  const alTeclaFoto = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    abrir(e.currentTarget as HTMLElement);
  };
  fotos.forEach((foto) => {
    foto.addEventListener('pointerdown', alPointerDown);
    foto.addEventListener('click', alClick);
    foto.addEventListener('keydown', alTeclaFoto);
  });

  const alClickPopup = (e: MouseEvent) => {
    e.stopPropagation();
    cerrar();
  };
  popup.addEventListener('click', alClickPopup);

  const alClickDoc = () => {
    if (abierto) cerrar();
  };
  document.addEventListener('click', alClickDoc);

  const alDesplazar = () => {
    if (abierto) cerrar();
  };
  const alEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && abierto) cerrar();
  };
  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('wheel', alDesplazar, { passive: true });
  window.addEventListener('keydown', alEscape);

  return () => {
    fotos.forEach((foto) => {
      foto.removeEventListener('pointerdown', alPointerDown);
      foto.removeEventListener('click', alClick);
      foto.removeEventListener('keydown', alTeclaFoto);
    });
    popup.removeEventListener('click', alClickPopup);
    document.removeEventListener('click', alClickDoc);
    window.removeEventListener('scroll', alDesplazar);
    window.removeEventListener('wheel', alDesplazar);
    window.removeEventListener('keydown', alEscape);
    popup.remove();
  };
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

function initEntradas() {
  const entradas = gsap.utils.toArray<HTMLElement>('[data-entrada-scroll]').filter(
    (entrada) => !entrada.hasAttribute('data-lado'),
  );
  if (entradas.length === 0) return;

  gsap.set(entradas, { autoAlpha: 0, y: 16 });
  ScrollTrigger.batch(entradas, {
    start: 'top 88%',
    interval: 0.08,
    batchMax: 4,
    once: true,
    onEnter: (lote) =>
      gsap.to(lote, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        overwrite: true,
      }),
  });
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

function alinearHash(lenis: Lenis | null) {
  const irAlHash = (inmediato: boolean) => {
    const hash = window.location.hash;
    if (!hash) {
      ScrollTrigger.refresh();
      return;
    }

    const seccion = document.querySelector<HTMLElement>(hash);
    const ancla =
      seccion?.querySelector<HTMLElement>('[data-recorrido-ancla], h2, h1') ?? seccion;
    if (!ancla) {
      ScrollTrigger.refresh();
      return;
    }

    const extra = extraAlCentro(ancla);
    if (lenis && inmediato) {
      lenis.scrollTo(ancla, {
        offset: extra,
        immediate: true,
        force: true,
        onComplete: () => ScrollTrigger.refresh(),
      });
      return;
    }

    irA(ancla, lenis, extra);
    window.setTimeout(() => {
      ScrollTrigger.update();
      ScrollTrigger.refresh();
    }, inmediato ? 80 : 1150);
  };

  requestAnimationFrame(() => irAlHash(true));
  window.addEventListener('load', () => irAlHash(true), { once: true });
  window.addEventListener('hashchange', () => irAlHash(false));
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

  const mostrarSeccion = (seccion: HTMLElement, id: string, visible: boolean) => {
    if (id === 'diario') {
      gsap.to(seccion, {
        autoAlpha: visible ? 1 : 0,
        duration: visible ? 0.7 : 0.45,
        ease: visible ? 'power2.out' : 'power2.in',
        overwrite: 'auto',
      });
      return;
    }
    gsap.to(seccion, {
      autoAlpha: visible ? 1 : 0,
      y: visible ? 0 : 24,
      duration: visible ? 0.7 : 0.45,
      ease: visible ? 'power2.out' : 'power2.in',
      overwrite: 'auto',
    });
  };

  const actualizarParadas = (dibujado: number) => {
    burbujas.forEach((burbuja) => {
      const dist = Number(burbuja.dataset.dist ?? 0);
      const id = burbuja.dataset.parada ?? '';
      const llega = dibujado >= dist - 20;
      if (burbuja.classList.contains('es-iluminada') !== llega) {
        burbuja.classList.toggle('es-iluminada', llega);
      }

      const seccion = document.getElementById(id);
      if (!seccion) return;
      if (llega && !reveladas.has(id)) {
        reveladas.add(id);
        mostrarSeccion(seccion, id, true);
      } else if (!llega && reveladas.has(id)) {
        reveladas.delete(id);
        mostrarSeccion(seccion, id, false);
      }
    });
  };

  const yDeParada = (burbuja: HTMLAnchorElement) => {
    const id = burbuja.dataset.parada ?? '';
    const seccion = document.getElementById(id);
    if (!seccion) return null;
    const ancla =
      seccion.querySelector<HTMLElement>('[data-recorrido-ancla]') ??
      seccion.querySelector('h2') ??
      seccion;
    return { burbuja, seccion, ancla, y: yDocumento(seccion, ancla) };
  };

  const pintarCabeza = () => {
    if (!tabla || reduce) return;
    const yCabeza = window.scrollY + window.innerHeight * 0.5 + 36;
    const dibujado = Math.min(tabla.total, distEnY(tabla, yCabeza));
    gsap.set([trazo, glow], { strokeDashoffset: tabla.total - dibujado });
    actualizarParadas(dibujado);
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
      gsap.set('#diario', { clearProps: 'transform' });
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
    gsap.set('[data-recorrido-seccion]:not(#diario)', { autoAlpha: 0, y: 24 });
    gsap.set('#diario', { autoAlpha: 0, clearProps: 'transform' });
  } else {
    gsap.set('[data-recorrido-seccion]', { autoAlpha: 1, y: 0 });
    gsap.set('#diario', { clearProps: 'transform' });
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
  let observer: ResizeObserver | undefined;
  if (contenido && 'ResizeObserver' in window) {
    observer = new ResizeObserver(() => pedirLayout());
    observer.observe(contenido);
  }

  return () => {
    window.clearTimeout(layoutTimer);
    window.removeEventListener('load', pedirLayout);
    window.removeEventListener('resize', pedirLayout);
    observer?.disconnect();
    disparo?.kill();
  };
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
