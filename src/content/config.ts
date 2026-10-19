import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const categoriaId = z.enum([
  'mediador-crisis',
  'aislamiento-consumo',
  'rituales-transicion',
]);

const textos = defineCollection({
  loader: glob({ base: './src/content/textos', pattern: '**/*.md' }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string(),
    autor: z.string(),
    docente: z.string(),
    materia: z.string(),
    fecha: z.coerce.date(),
    ciudad: z.string(),
    salidas: z.number(),
    observaciones: z.number(),
    entradasDiario: z.number(),
  }),
});

const secciones = defineCollection({
  loader: glob({ base: './src/content/secciones', pattern: '**/*.md' }),
  schema: z.object({
    titulo: z.string(),
    orden: z.number(),
    tema: z.string().optional(),
    pregunta: z.string().optional(),
    objetivoGeneral: z.string().optional(),
    objetivosEspecificos: z.array(z.string()).optional(),
    factoresParentales: z
      .array(z.object({ titulo: z.string(), texto: z.string() }))
      .optional(),
    impactoDesarrollo: z
      .array(z.object({ titulo: z.string(), texto: z.string() }))
      .optional(),
    enfoque: z.string().optional(),
    posicion: z.string().optional(),
    sesgo: z.string().optional(),
    etica: z.string().optional(),
    contexto: z.string().optional(),
    significados: z.string().optional(),
    lugares: z
      .array(z.object({ nombre: z.string(), descripcion: z.string() }))
      .optional(),
    salidasCampo: z
      .array(z.object({ fecha: z.string(), lugar: z.string(), nota: z.string() }))
      .optional(),
    comoObservar: z.string().optional(),
    retos: z.array(z.string()).optional(),
    sorpresas: z.array(z.string()).optional(),
    diferente: z.string().optional(),
  }),
});

const diario = defineCollection({
  loader: glob({ base: './src/content/diario', pattern: '**/*.md' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    hora: z.string(),
    espacio: z.string(),
    descripcion: z.string(),
    impresiones: z.string(),
    reflexion: z.string(),
    frases: z.array(z.string()).default([]),
    categorias: z.array(categoriaId),
    imagenPrincipal: z.string(),
    galeria: z.array(z.string()).default([]),
    preguntasPendientes: z.array(z.string()).default([]),
    notaPrivacidad: z.string(),
    desenfoqueAplicado: z.boolean().default(true),
  }),
});

const referencias = defineCollection({
  loader: glob({ base: './src/content/referencias', pattern: '**/*.md' }),
  schema: z.object({
    cita: z.string(),
    orden: z.number(),
  }),
});

const categorias = defineCollection({
  loader: glob({ base: './src/content/categorias', pattern: '**/*.md' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    color: z.string(),
    orden: z.number(),
  }),
});

export const collections = {
  textos,
  secciones,
  diario,
  referencias,
  categorias,
};
