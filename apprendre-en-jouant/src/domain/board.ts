import type { Point } from './types';

export type Rect = { x: number; y: number; w: number; h: number };

export type Board = { slots: Rect[]; tiles: Rect[]; height: number };

const GAP = 8;
const ROW_GAP = 48;
const MAX_SLOT = 72;
const TILE = 64;

/**
 * Calcule la position des cases du mot (en haut) et des étiquettes (en bas) dans un
 * même repère. Comme tout est positionné par le calcul, le lâcher d'une étiquette se
 * vérifie par une simple collision de rectangles, sans mesurer la vue à l'écran.
 */
export function layoutBoard(width: number, wordLength: number, tileCount: number): Board {
  // Les mots longs resserrent l'espacement ; les cases rentrent toujours dans la largeur.
  const gap = wordLength > 8 ? GAP / 2 : GAP;
  const slot = Math.min(MAX_SLOT, (width - gap * (wordLength - 1)) / wordLength);
  const rowWidth = wordLength * slot + (wordLength - 1) * gap;
  const x0 = (width - rowWidth) / 2;
  const slots = Array.from({ length: wordLength }, (_, i) => ({ x: x0 + i * (slot + gap), y: 0, w: slot, h: slot }));

  const perRow = Math.max(1, Math.floor((width + GAP) / (TILE + GAP)));
  const tilesTop = slot + ROW_GAP;
  const tiles: Rect[] = [];
  for (let i = 0; i < tileCount; i++) {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, tileCount - row * perRow);
    const rowStart = (width - (inRow * TILE + (inRow - 1) * GAP)) / 2;
    const col = i % perRow;
    tiles.push({ x: rowStart + col * (TILE + GAP), y: tilesTop + row * (TILE + GAP), w: TILE, h: TILE });
  }
  const rows = Math.ceil(tileCount / perRow);
  const height = tilesTop + rows * TILE + Math.max(0, rows - 1) * GAP;
  return { slots, tiles, height };
}

/** Indice du rectangle contenant le point, ou -1. */
export function hitTest(point: Point, rects: Rect[]): number {
  return rects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
}

/** Case cible pour une lettre lâchée : 'ok', 'wrong' (mauvaise case à remplir) ou 'none'. */
export function resolveDrop(
  point: Point,
  letter: string,
  word: string,
  hidden: number[],
  filled: ReadonlySet<number>,
  slots: Rect[],
): { result: 'ok'; slot: number } | { result: 'wrong' | 'none' } {
  // Un peu de marge autour des cases : les petits doigts ne visent pas au pixel près.
  const margin = GAP * 2;
  const grown = slots.map((r) => ({ x: r.x - margin, y: r.y - margin, w: r.w + 2 * margin, h: r.h + 2 * margin }));
  const open = hidden.filter((i) => !filled.has(i));

  // Priorité à une case libre qui attend cette lettre (utile si une lettre apparaît deux fois).
  const good = open.find((i) => word[i] === letter && hitTest(point, [grown[i]]) === 0);
  if (good !== undefined) return { result: 'ok', slot: good };
  if (open.some((i) => hitTest(point, [grown[i]]) === 0)) return { result: 'wrong' };
  return { result: 'none' };
}
