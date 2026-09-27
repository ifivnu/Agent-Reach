import type { ActivityId, LevelId } from './types';

export type WordLength = 'court' | 'moyen' | 'long';

export type LevelConfig = {
  id: LevelId;
  label: string;
  age: string;
  color: string;
  activities: ActivityId[];
  /** Compter : nombre maximum d'objets. */
  countMax: number;
  /** Additions : plus grande somme possible. */
  sumMax: number;
  /** Lettres manquantes. */
  words: WordLength;
  missingLetters: number;
  uppercase: boolean;
  /** Tracé : caractères proposés. */
  traceGlyphs: string;
};

const DIGITS = '0123456789';
const STRAIGHT_LETTERS = 'EFHILTAKMNVWXYZ';
const ALL_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Programme par niveau (maternelle → CM2). Tout le réglage de difficulté est ici :
 * ajouter un niveau ou une activité ne demande pas de toucher aux moteurs.
 */
export const LEVELS: Record<LevelId, LevelConfig> = {
  PS: {
    id: 'PS', label: 'Petite section', age: '3-4 ans', color: '#FF8A65',
    activities: ['compter', 'trace'],
    countMax: 3, sumMax: 0, words: 'court', missingLetters: 0, uppercase: true,
    traceGlyphs: '1234',
  },
  MS: {
    id: 'MS', label: 'Moyenne section', age: '4-5 ans', color: '#FFB74D',
    activities: ['compter', 'trace'],
    countMax: 6, sumMax: 0, words: 'court', missingLetters: 0, uppercase: true,
    traceGlyphs: DIGITS + STRAIGHT_LETTERS,
  },
  GS: {
    id: 'GS', label: 'Grande section', age: '5-6 ans', color: '#FFD54F',
    activities: ['compter', 'additions', 'lettres', 'trace'],
    countMax: 10, sumMax: 10, words: 'court', missingLetters: 1, uppercase: true,
    traceGlyphs: DIGITS + ALL_UPPERCASE,
  },
  CP: {
    id: 'CP', label: 'Cours préparatoire', age: '6-7 ans', color: '#AED581',
    activities: ['additions', 'lettres', 'trace'],
    countMax: 10, sumMax: 20, words: 'moyen', missingLetters: 1, uppercase: false,
    traceGlyphs: DIGITS + ALL_UPPERCASE,
  },
  CE1: {
    id: 'CE1', label: 'Cours élémentaire 1', age: '7-8 ans', color: '#4DB6AC',
    activities: ['additions', 'lettres'],
    countMax: 10, sumMax: 100, words: 'moyen', missingLetters: 2, uppercase: false,
    traceGlyphs: '',
  },
  CE2: {
    id: 'CE2', label: 'Cours élémentaire 2', age: '8-9 ans', color: '#4FC3F7',
    activities: ['additions', 'lettres'],
    countMax: 10, sumMax: 1000, words: 'long', missingLetters: 2, uppercase: false,
    traceGlyphs: '',
  },
  CM1: {
    id: 'CM1', label: 'Cours moyen 1', age: '9-10 ans', color: '#7986CB',
    activities: ['additions', 'lettres'],
    countMax: 10, sumMax: 10000, words: 'long', missingLetters: 3, uppercase: false,
    traceGlyphs: '',
  },
  CM2: {
    id: 'CM2', label: 'Cours moyen 2', age: '10-11 ans', color: '#BA68C8',
    activities: ['additions', 'lettres'],
    countMax: 10, sumMax: 100000, words: 'long', missingLetters: 3, uppercase: false,
    traceGlyphs: '',
  },
};

export const LEVEL_ORDER: LevelId[] = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];

export const ACTIVITIES: Record<ActivityId, { label: string; emoji: string; engine: string }> = {
  compter: { label: 'Compter', emoji: '🍎', engine: 'choix' },
  additions: { label: 'Additions', emoji: '➕', engine: 'choix' },
  lettres: { label: 'Lettres manquantes', emoji: '🔤', engine: 'glisser' },
  trace: { label: 'Tracer', emoji: '✏️', engine: 'tracé' },
};

export function isLevelId(value: unknown): value is LevelId {
  return typeof value === 'string' && value in LEVELS;
}

export function isActivityId(value: unknown): value is ActivityId {
  return typeof value === 'string' && value in ACTIVITIES;
}
