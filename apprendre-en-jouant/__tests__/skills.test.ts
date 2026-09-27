import { CATEGORIES, FAMILY, GOES_WITH } from '../src/domain/content/logic';
import { THEMES } from '../src/domain/content/vocab';
import { LEVEL_ORDER, LEVELS } from '../src/domain/levels';
import { seededRng } from '../src/domain/random';
import { isAvailable, LANGUAGE_SKILLS, makeSession, pathFor, SKILLS, skillsFor } from '../src/domain/skills';
import type { Difficulty, Exercise, Lang } from '../src/domain/types';
import { LANGS } from '../src/i18n/strings';

const DIFFICULTIES: Difficulty[] = [1, 2, 3];

/** Vérifications communes à tout exercice, quel que soit le moteur. */
function checkExercise(ex: Exercise) {
  expect(ex.instruction.length).toBeGreaterThan(3);
  expect(ex.instruction).not.toMatch(/\{\w+\}/); // aucun paramètre oublié
  switch (ex.engine) {
    case 'choice': {
      const ids = ex.choices.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(ex.answer);
      expect(ids.length).toBeGreaterThanOrEqual(3);
      for (const c of ex.choices) expect(c.text ?? c.emoji).toBeTruthy();
      if (ex.prompt.kind === 'groups') {
        expect(ex.prompt.counts.reduce((a, b) => a + b, 0)).toBe(Number(ex.answer));
      }
      if (ex.prompt.kind === 'takeaway') {
        expect(ex.prompt.total - ex.prompt.removed).toBe(Number(ex.answer));
      }
      break;
    }
    case 'dragdrop': {
      const chars = [...ex.word];
      expect(ex.hidden.length).toBeGreaterThan(0);
      expect(ex.hidden.length).toBeLessThanOrEqual(Math.max(1, Math.floor(chars.length / 2)));
      const pool = [...ex.tiles];
      for (const i of ex.hidden) {
        const at = pool.indexOf(chars[i]);
        expect(at).toBeGreaterThanOrEqual(0);
        pool.splice(at, 1);
      }
      expect(pool.length).toBeGreaterThanOrEqual(2);
      break;
    }
    case 'trace':
      expect(ex.strokes.length).toBeGreaterThan(0);
      break;
    case 'memory': {
      const byPair = new Map<string, number>();
      for (const c of ex.cards) byPair.set(c.pair, (byPair.get(c.pair) ?? 0) + 1);
      for (const n of byPair.values()) expect(n).toBe(2);
      expect(byPair.size).toBeGreaterThanOrEqual(3);
      // Une face ne doit appartenir qu'à une seule paire, sinon deux associations seraient valides.
      const pairOfFace = new Map<string, string>();
      for (const c of ex.cards) {
        if (pairOfFace.has(c.face)) expect(pairOfFace.get(c.face)).toBe(c.pair);
        pairOfFace.set(c.face, c.pair);
      }
      break;
    }
    case 'sequence':
      expect([...ex.shuffled].sort()).toEqual([...ex.ordered].sort());
      // Les images d'une histoire sont toutes différentes ; les lettres d'un mot peuvent se répéter.
      if (!ex.emoji) expect(new Set(ex.ordered).size).toBe(ex.ordered.length);
      expect(ex.shuffled.join('')).not.toBe(ex.ordered.join(''));
      break;
    case 'taptargets':
      expect(ex.targets.length).toBeGreaterThan(0);
      expect(ex.distractors.length).toBeGreaterThan(0);
      for (const d of ex.distractors) expect(ex.targets).not.toContain(d);
      expect(ex.goal).toBeGreaterThan(0);
      break;
  }
}

describe('compétences', () => {
  for (const level of LEVEL_ORDER) {
    for (const s of SKILLS.filter((sk) => isAvailable(sk, level))) {
      it(`${level} / ${s.id} : séries valides dans les 3 langues et 3 difficultés`, () => {
        for (const lang of LANGS) {
          for (const difficulty of DIFFICULTIES) {
            for (const seed of [1, 2, 3]) {
              const session = makeSession({ skill: s, level, difficulty, lang, rng: seededRng(seed * 97 + difficulty) });
              expect(session).toHaveLength(s.sessionLength);
              session.forEach(checkExercise);
            }
          }
        }
      });
    }
  }
});

describe('langues', () => {
  for (const s of LANGUAGE_SKILLS) {
    it(`${s.id} : tous les thèmes, toutes les langues étudiées`, () => {
      for (const theme of THEMES) {
        for (const target of LANGS) {
          for (const difficulty of DIFFICULTIES) {
            const level = s.minRank >= 2 ? 'CP' : 'MS';
            const session = makeSession({ skill: s, level, difficulty, lang: 'fr', target, theme: theme.id, rng: seededRng(difficulty) });
            session.forEach(checkExercise);
            if (s.id === 'epeler') {
              // On épelle bien dans la langue étudiée.
              for (const ex of session) {
                if (ex.engine !== 'dragdrop') throw new Error('épeler doit utiliser le glisser-déposer');
                expect(theme.words.map((w) => w[target])).toContain(ex.word);
              }
            }
          }
        }
      }
    });
  }
});

describe('programme', () => {
  it.each(LEVEL_ORDER)('%s : chaque matière propose au moins 2 compétences', (level) => {
    for (const subject of ['maths', 'lecture', 'logique', 'agilite', 'langues'] as const) {
      if (subject === 'lecture' && LEVELS[level].rank === 0) continue; // la lecture commence en MS
      expect(skillsFor(subject, level).length).toBeGreaterThanOrEqual(2);
    }
  });

  it.each(LEVEL_ORDER)('%s : le parcours contient chaque compétence une seule fois', (level) => {
    const ids = pathFor(level).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(6);
  });

  it('identifiants uniques', () => {
    const ids = [...SKILLS, ...LANGUAGE_SKILLS].map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('contenus', () => {
  it('vocabulaire complet dans les 3 langues, sans doublon par thème', () => {
    for (const theme of THEMES) {
      for (const lang of LANGS as Lang[]) {
        expect(theme.name[lang]).toBeTruthy();
        const words = theme.words.map((w) => w[lang]);
        words.forEach((w) => expect(w.trim()).toBe(w));
        expect(new Set(words).size).toBe(words.length);
      }
      expect(new Set(theme.words.map((w) => w.emoji)).size).toBe(theme.words.length);
      expect(theme.words.length).toBeGreaterThanOrEqual(6);
    }
  });

  it('catégories disjointes (un intrus ne peut pas appartenir au groupe)', () => {
    const seen = new Map<string, string>();
    for (const [cat, items] of Object.entries(CATEGORIES)) {
      for (const e of items) {
        expect(seen.get(e)).toBeUndefined();
        seen.set(e, cat);
      }
      expect(FAMILY[cat as keyof typeof FAMILY]).toBeTruthy();
    }
  });

  it('associations sans doublon', () => {
    const rights = GOES_WITH.map(([, r]) => r);
    const lefts = GOES_WITH.map(([l]) => l);
    expect(new Set(rights).size).toBe(rights.length);
    expect(new Set(lefts).size).toBe(lefts.length);
  });
});
