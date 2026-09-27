import { makeSession } from '../src/domain/generators';
import { withDistractors } from '../src/domain/generators/choice';
import { makeMissingLetters } from '../src/domain/generators/missingLetters';
import { LEVELS, LEVEL_ORDER } from '../src/domain/levels';
import { seededRng } from '../src/domain/random';
import type { ChoiceExercise, DragDropExercise, TraceExercise } from '../src/domain/types';

describe('withDistractors', () => {
  it.each([0, 1, 2, 7, 19, 250, 99999])('contient la réponse %i, 3 choix distincts et positifs', (answer) => {
    const rng = seededRng(answer);
    const choices = withDistractors(rng, answer);
    expect(choices).toContain(answer);
    expect(new Set(choices).size).toBe(3);
    expect(choices.every((c) => c >= 0)).toBe(true);
  });
});

describe('makeSession', () => {
  for (const levelId of LEVEL_ORDER) {
    for (const activity of LEVELS[levelId].activities) {
      it(`${levelId} / ${activity} : 5 exercices valides`, () => {
        const rng = seededRng(42);
        const session = makeSession(levelId, activity, 5, rng);
        expect(session).toHaveLength(5);
        for (const ex of session) {
          if (ex.engine === 'choice') checkChoice(ex, levelId);
          if (ex.engine === 'dragdrop') checkDragDrop(ex);
          if (ex.engine === 'trace') checkTrace(ex, levelId);
        }
      });
    }
  }
});

function checkChoice(ex: ChoiceExercise, levelId: keyof typeof LEVELS) {
  const level = LEVELS[levelId];
  expect(ex.choices).toContain(ex.answer);
  if (ex.visual.kind === 'groups') {
    const total = ex.visual.counts.reduce((a, b) => a + b, 0);
    expect(total).toBe(ex.answer);
  }
  const max = ex.visual.kind === 'groups' && !ex.visual.operator ? level.countMax : level.sumMax;
  expect(ex.answer).toBeLessThanOrEqual(max);
}

function checkDragDrop(ex: DragDropExercise) {
  expect(ex.hidden.length).toBeGreaterThan(0);
  expect(ex.hidden.length).toBeLessThanOrEqual(Math.floor(ex.word.length / 2));
  // Chaque lettre cachée doit avoir une étiquette correspondante.
  const pool = [...ex.tiles];
  for (const i of ex.hidden) {
    const at = pool.indexOf(ex.word[i]);
    expect(at).toBeGreaterThanOrEqual(0);
    pool.splice(at, 1);
  }
  // Il reste au moins deux intrus.
  expect(pool.length).toBeGreaterThanOrEqual(2);
}

function checkTrace(ex: TraceExercise, levelId: keyof typeof LEVELS) {
  expect(LEVELS[levelId].traceGlyphs).toContain(ex.glyph);
  expect(ex.strokes.length).toBeGreaterThan(0);
}

it('respecte la casse du niveau', () => {
  const gs = makeMissingLetters(LEVELS.GS, seededRng(1), 'x');
  const cp = makeMissingLetters(LEVELS.CP, seededRng(1), 'x');
  expect(gs.word).toBe(gs.word.toUpperCase());
  expect(cp.word).toBe(cp.word.toLowerCase());
  expect(gs.tiles.every((t) => t === t.toUpperCase())).toBe(true);
});
