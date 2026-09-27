import { hitTest, layoutBoard, resolveDrop } from '../src/domain/board';

describe('layoutBoard', () => {
  it.each([288, 320, 390, 768, 1280])('reste dans la largeur %i sans chevauchement', (width) => {
    for (const len of [3, 6, 10]) {
      const board = layoutBoard(width, len, 5);
      for (const r of [...board.slots, ...board.tiles]) {
        expect(r.x).toBeGreaterThanOrEqual(-0.001);
        expect(r.x + r.w).toBeLessThanOrEqual(width + 0.001);
        expect(r.y + r.h).toBeLessThanOrEqual(board.height + 0.001);
      }
      for (let i = 1; i < board.slots.length; i++) {
        expect(board.slots[i].x).toBeGreaterThanOrEqual(board.slots[i - 1].x + board.slots[i - 1].w);
      }
      // Les étiquettes sont sous les cases.
      const slotBottom = board.slots[0].y + board.slots[0].h;
      expect(board.tiles.every((t) => t.y > slotBottom)).toBe(true);
    }
  });
});

describe('hitTest', () => {
  it('trouve le rectangle touché', () => {
    const rects = [{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 }];
    expect(hitTest({ x: 25, y: 5 }, rects)).toBe(1);
    expect(hitTest({ x: 15, y: 5 }, rects)).toBe(-1);
  });
});

describe('resolveDrop', () => {
  const { slots } = layoutBoard(400, 4, 4);
  const center = (i: number) => ({ x: slots[i].x + slots[i].w / 2, y: slots[i].y + slots[i].h / 2 });

  it('accepte la bonne lettre dans la bonne case', () => {
    expect(resolveDrop(center(1), 'H', 'CHAT', [1], new Set(), slots)).toEqual({ result: 'ok', slot: 1 });
  });

  it('signale une mauvaise lettre sur une case à remplir', () => {
    expect(resolveDrop(center(1), 'Z', 'CHAT', [1], new Set(), slots)).toEqual({ result: 'wrong' });
  });

  it('ignore un lâcher sur une lettre déjà visible ou hors des cases', () => {
    expect(resolveDrop(center(0), 'H', 'CHAT', [1], new Set(), slots)).toEqual({ result: 'none' });
    expect(resolveDrop({ x: 0, y: 500 }, 'H', 'CHAT', [1], new Set(), slots)).toEqual({ result: 'none' });
  });

  it('ne remplit pas deux fois la même case', () => {
    expect(resolveDrop(center(1), 'H', 'CHAT', [1], new Set([1]), slots)).toEqual({ result: 'none' });
  });

  it('gère une lettre présente deux fois dans le mot', () => {
    // « POMME » : les deux M sont cachés, un M lâché sur l'une ou l'autre case convient.
    const board = layoutBoard(400, 5, 4);
    const c = (i: number) => ({ x: board.slots[i].x + 5, y: board.slots[i].y + 5 });
    expect(resolveDrop(c(3), 'M', 'POMME', [2, 3], new Set([2]), board.slots)).toEqual({ result: 'ok', slot: 3 });
  });
});
