import type { LevelId, Localized } from './types';

export type LevelConfig = {
  id: LevelId;
  /** Index 0 (PS) → 7 (CM2) : sert aux comparaisons « à partir de tel niveau ». */
  rank: number;
  label: Localized;
  age: string;
  color: string;
  /** Compter : nombre maximum d'objets. */
  countMax: number;
  /** Additions / soustractions : plus grand nombre manipulé. */
  sumMax: number;
  /** Tables de multiplication : plus grand facteur. */
  tableMax: number;
  /** Lettres manquantes : nombre de lettres cachées. */
  missingLetters: number;
  uppercase: boolean;
  /** Tracé : caractères proposés. */
  traceGlyphs: string;
};

const DIGITS = '0123456789';
const STRAIGHT_LETTERS = 'EFHILTAKMNVWXYZ';
const ALL_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Classes françaises, avec leurs équivalents américains et haïtiens.
 * Tout le réglage de difficulté de base est ici ; la difficulté adaptative (1 à 3)
 * se règle ensuite à l'intérieur de ces bornes.
 */
export const LEVELS: Record<LevelId, LevelConfig> = {
  PS: {
    id: 'PS', rank: 0, age: '3-4', color: '#FF8A65',
    label: { fr: 'Petite section', en: 'Preschool', ht: 'Preskolè 1' },
    countMax: 3, sumMax: 3, tableMax: 0, missingLetters: 1, uppercase: true, traceGlyphs: '1234',
  },
  MS: {
    id: 'MS', rank: 1, age: '4-5', color: '#FFB74D',
    label: { fr: 'Moyenne section', en: 'Pre-K', ht: 'Preskolè 2' },
    countMax: 6, sumMax: 5, tableMax: 0, missingLetters: 1, uppercase: true, traceGlyphs: DIGITS + STRAIGHT_LETTERS,
  },
  GS: {
    id: 'GS', rank: 2, age: '5-6', color: '#FFD54F',
    label: { fr: 'Grande section', en: 'Kindergarten', ht: 'Preskolè 3' },
    countMax: 10, sumMax: 10, tableMax: 0, missingLetters: 1, uppercase: true, traceGlyphs: DIGITS + ALL_UPPERCASE,
  },
  CP: {
    id: 'CP', rank: 3, age: '6-7', color: '#AED581',
    label: { fr: 'CP', en: 'Grade 1', ht: '1ye ane' },
    countMax: 20, sumMax: 20, tableMax: 2, missingLetters: 1, uppercase: false, traceGlyphs: DIGITS + ALL_UPPERCASE,
  },
  CE1: {
    id: 'CE1', rank: 4, age: '7-8', color: '#4DB6AC',
    label: { fr: 'CE1', en: 'Grade 2', ht: '2yèm ane' },
    countMax: 20, sumMax: 100, tableMax: 5, missingLetters: 2, uppercase: false, traceGlyphs: '',
  },
  CE2: {
    id: 'CE2', rank: 5, age: '8-9', color: '#4FC3F7',
    label: { fr: 'CE2', en: 'Grade 3', ht: '3yèm ane' },
    countMax: 20, sumMax: 1000, tableMax: 10, missingLetters: 2, uppercase: false, traceGlyphs: '',
  },
  CM1: {
    id: 'CM1', rank: 6, age: '9-10', color: '#7986CB',
    label: { fr: 'CM1', en: 'Grade 4', ht: '4yèm ane' },
    countMax: 20, sumMax: 10000, tableMax: 10, missingLetters: 3, uppercase: false, traceGlyphs: '',
  },
  CM2: {
    id: 'CM2', rank: 7, age: '10-11', color: '#BA68C8',
    label: { fr: 'CM2', en: 'Grade 5', ht: '5yèm ane' },
    countMax: 20, sumMax: 100000, tableMax: 12, missingLetters: 3, uppercase: false, traceGlyphs: '',
  },
};

export const LEVEL_ORDER: LevelId[] = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];

export function isLevelId(value: unknown): value is LevelId {
  return typeof value === 'string' && value in LEVELS;
}

/** Borne ajustée à la difficulté : 1 = moitié, 2 = trois quarts, 3 = pleine. */
export function scaled(max: number, difficulty: 1 | 2 | 3, min = 1): number {
  return Math.max(min, Math.round(max * [0.5, 0.75, 1][difficulty - 1]));
}
