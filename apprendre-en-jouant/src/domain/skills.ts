import { type ThemeId } from './content/vocab';
import { makeMemory, makeTapTargets } from './generators/agilite';
import type { GenContext } from './generators/context';
import { makeLangMemory, makeListen, makeName, makeSpell } from './generators/langues';
import { makeAnagram, makeFirstLetter, makeMissingLetters, makeReadPick, makeTraceLetter } from './generators/lecture';
import { makeGoesWith, makeOddOneOut, makeOrder, makePattern } from './generators/logique';
import {
  makeAddition,
  makeComparison,
  makeCounting,
  makeMultiplication,
  makeNumberSequence,
  makeSubtraction,
  makeTraceDigit,
} from './generators/maths';
import { LEVELS } from './levels';
import { defaultRng, type Rng } from './random';
import type { Difficulty, Exercise, Lang, LevelId, Localized, SubjectId } from './types';

export type Skill = {
  id: string;
  subject: SubjectId;
  emoji: string;
  name: Localized;
  /** Classes concernées, par rang (0 = PS … 7 = CM2). */
  minRank: number;
  maxRank: number;
  /** Nombre d'exercices par série. */
  sessionLength: number;
  generate: (ctx: GenContext) => Exercise;
};

const skill = (s: Skill) => s;

export const SKILLS: Skill[] = [
  // Maths
  skill({ id: 'compter', subject: 'maths', emoji: '🍎', name: { fr: 'Compter', en: 'Counting', ht: 'Konte' }, minRank: 0, maxRank: 3, sessionLength: 5, generate: makeCounting }),
  skill({ id: 'chiffres', subject: 'maths', emoji: '✏️', name: { fr: 'Tracer les chiffres', en: 'Writing numbers', ht: 'Trase chif yo' }, minRank: 0, maxRank: 3, sessionLength: 4, generate: makeTraceDigit }),
  skill({ id: 'suites-nombres', subject: 'maths', emoji: '🔢', name: { fr: 'Suites de nombres', en: 'Number patterns', ht: 'Swit nimewo' }, minRank: 1, maxRank: 7, sessionLength: 5, generate: makeNumberSequence }),
  skill({ id: 'comparer', subject: 'maths', emoji: '⚖️', name: { fr: 'Comparer', en: 'Comparing', ht: 'Konpare' }, minRank: 2, maxRank: 7, sessionLength: 5, generate: makeComparison }),
  skill({ id: 'additions', subject: 'maths', emoji: '➕', name: { fr: 'Additions', en: 'Addition', ht: 'Adisyon' }, minRank: 2, maxRank: 7, sessionLength: 5, generate: makeAddition }),
  skill({ id: 'soustractions', subject: 'maths', emoji: '➖', name: { fr: 'Soustractions', en: 'Subtraction', ht: 'Soustraksyon' }, minRank: 2, maxRank: 7, sessionLength: 5, generate: makeSubtraction }),
  skill({ id: 'multiplications', subject: 'maths', emoji: '✖️', name: { fr: 'Tables de multiplication', en: 'Times tables', ht: 'Tab miltiplikasyon' }, minRank: 4, maxRank: 7, sessionLength: 5, generate: makeMultiplication }),

  // Lecture
  skill({ id: 'lettres-tracer', subject: 'lecture', emoji: '🖍️', name: { fr: 'Tracer les lettres', en: 'Writing letters', ht: 'Trase lèt yo' }, minRank: 1, maxRank: 3, sessionLength: 4, generate: makeTraceLetter }),
  skill({ id: 'premiere-lettre', subject: 'lecture', emoji: '🔤', name: { fr: 'Première lettre', en: 'First letter', ht: 'Premye lèt' }, minRank: 1, maxRank: 5, sessionLength: 5, generate: makeFirstLetter }),
  skill({ id: 'lire-mot', subject: 'lecture', emoji: '📖', name: { fr: 'Lire un mot', en: 'Reading words', ht: 'Li yon mo' }, minRank: 2, maxRank: 5, sessionLength: 5, generate: makeReadPick }),
  skill({ id: 'mot-melange', subject: 'lecture', emoji: '🔀', name: { fr: 'Mot mélangé', en: 'Word scramble', ht: 'Mo melanje' }, minRank: 3, maxRank: 7, sessionLength: 4, generate: makeAnagram }),
  skill({ id: 'lettres-manquantes', subject: 'lecture', emoji: '🧩', name: { fr: 'Lettres manquantes', en: 'Missing letters', ht: 'Lèt ki manke' }, minRank: 2, maxRank: 7, sessionLength: 5, generate: makeMissingLetters }),

  // Logique et bon sens
  skill({ id: 'suites-logiques', subject: 'logique', emoji: '🔁', name: { fr: 'Suites logiques', en: 'Patterns', ht: 'Swit lojik' }, minRank: 0, maxRank: 7, sessionLength: 5, generate: makePattern }),
  skill({ id: 'va-avec', subject: 'logique', emoji: '🔗', name: { fr: 'Qu’est-ce qui va avec ?', en: 'What goes together?', ht: 'Kisa ki ale ansanm?' }, minRank: 0, maxRank: 4, sessionLength: 5, generate: makeGoesWith }),
  skill({ id: 'ordre', subject: 'logique', emoji: '🪜', name: { fr: 'Remettre en ordre', en: 'Put in order', ht: 'Mete nan lòd' }, minRank: 0, maxRank: 7, sessionLength: 4, generate: makeOrder }),
  skill({ id: 'intrus', subject: 'logique', emoji: '🕵️', name: { fr: 'Trouve l’intrus', en: 'Odd one out', ht: 'Kiyès ki pa menm?' }, minRank: 1, maxRank: 7, sessionLength: 5, generate: makeOddOneOut }),

  // Agilité
  skill({ id: 'memoire', subject: 'agilite', emoji: '🃏', name: { fr: 'Mémoire', en: 'Memory', ht: 'Memwa' }, minRank: 0, maxRank: 7, sessionLength: 2, generate: makeMemory }),
  skill({ id: 'attrape', subject: 'agilite', emoji: '⚡', name: { fr: 'Attrape-les !', en: 'Catch them!', ht: 'Kenbe yo!' }, minRank: 0, maxRank: 7, sessionLength: 2, generate: makeTapTargets }),
];

/** Activités de la section Langues : elles s'appliquent à une langue étudiée et à un thème. */
export const LANGUAGE_SKILLS: Skill[] = [
  skill({ id: 'ecouter', subject: 'langues', emoji: '👂', name: { fr: 'Écoute et choisis', en: 'Listen and pick', ht: 'Koute epi chwazi' }, minRank: 0, maxRank: 7, sessionLength: 5, generate: makeListen }),
  skill({ id: 'nommer', subject: 'langues', emoji: '🏷️', name: { fr: 'Comment ça s’appelle ?', en: 'What is it called?', ht: 'Kòman yo rele l?' }, minRank: 2, maxRank: 7, sessionLength: 5, generate: makeName }),
  skill({ id: 'memoire-mots', subject: 'langues', emoji: '🃏', name: { fr: 'Mémoire des mots', en: 'Word memory', ht: 'Memwa mo yo' }, minRank: 0, maxRank: 7, sessionLength: 2, generate: makeLangMemory }),
  skill({ id: 'epeler', subject: 'langues', emoji: '🔡', name: { fr: 'Épeler', en: 'Spelling', ht: 'Eple' }, minRank: 2, maxRank: 7, sessionLength: 5, generate: makeSpell }),
];

export const SUBJECT_ORDER: SubjectId[] = ['maths', 'lecture', 'logique', 'agilite', 'langues'];

export const SUBJECT_STYLE: Record<SubjectId, { emoji: string; color: string }> = {
  maths: { emoji: '🔢', color: '#FFB74D' },
  lecture: { emoji: '📚', color: '#81C784' },
  logique: { emoji: '🧠', color: '#9575CD' },
  agilite: { emoji: '⚡', color: '#4FC3F7' },
  langues: { emoji: '🌍', color: '#F06292' },
};

export function findSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id) ?? LANGUAGE_SKILLS.find((s) => s.id === id);
}

export function isAvailable(s: Skill, level: LevelId): boolean {
  const rank = LEVELS[level].rank;
  return rank >= s.minRank && rank <= s.maxRank;
}

export function skillsFor(subject: SubjectId, level: LevelId): Skill[] {
  const pool = subject === 'langues' ? LANGUAGE_SKILLS : SKILLS.filter((s) => s.subject === subject);
  return pool.filter((s) => isAvailable(s, level));
}

/**
 * Parcours de la classe (façon programme scolaire) : les compétences des quatre matières
 * entrelacées, pour varier les plaisirs d'une série à l'autre.
 */
export function pathFor(level: LevelId): Skill[] {
  const lists = SUBJECT_ORDER.filter((s) => s !== 'langues').map((s) => skillsFor(s, level));
  const out: Skill[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

/** Clé de progression : une activité de langue se suit par langue et par thème. */
export function progressKey(skillId: string, target?: Lang, theme?: ThemeId): string {
  return target && theme ? `${skillId}:${target}:${theme}` : skillId;
}

export type SessionParams = {
  skill: Skill;
  level: LevelId;
  difficulty: Difficulty;
  lang: Lang;
  target?: Lang;
  theme?: ThemeId;
  rng?: Rng;
};

/** Une série d'exercices tous différents (autant que le permet la compétence). */
export function makeSession({ skill: s, level, difficulty, lang, target, theme, rng = defaultRng }: SessionParams): Exercise[] {
  const out: Exercise[] = [];
  const seen = new Set<string>();
  const count = s.sessionLength;
  for (let attempt = 0; out.length < count && attempt < count * 20; attempt++) {
    const ex = s.generate({
      level: LEVELS[level],
      difficulty,
      lang,
      target: target ?? lang,
      theme,
      rng,
      id: `${s.id}-${out.length}`,
    });
    const key = signature(ex);
    if (seen.has(key) && attempt < count * 10) continue;
    seen.add(key);
    out.push(ex);
  }
  return out;
}

/** Ce qui distingue vraiment deux exercices (l'ordre des réponses proposées ne compte pas). */
function signature(ex: Exercise): string {
  switch (ex.engine) {
    case 'choice':
      return `${ex.instruction}|${JSON.stringify(ex.prompt)}|${ex.answer}`;
    case 'dragdrop':
      return `${ex.word}|${ex.hidden.join(',')}`;
    case 'trace':
      return ex.glyph;
    case 'memory':
      return ex.cards.map((c) => c.face).sort().join(',');
    case 'sequence':
      return ex.ordered.join(',');
    case 'taptargets':
      return ex.instruction;
  }
}
