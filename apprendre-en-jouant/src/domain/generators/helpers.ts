import { type Rng, shuffle } from '../random';
import type { ChoiceOption } from '../types';

/** La bonne réponse + des voisins proches (jamais négatifs, jamais en double), mélangés. */
export function withDistractors(rng: Rng, answer: number, count = 2): number[] {
  const set = new Set([answer]);
  const spread = Math.max(1, Math.round(answer / 10));
  for (let d = 1; set.size < count + 1; d++) {
    if (answer - d * spread >= 0) set.add(answer - d * spread);
    if (set.size < count + 1) set.add(answer + d * spread);
  }
  return shuffle(rng, [...set]);
}

export const numberOptions = (values: number[]): ChoiceOption[] =>
  values.map((v) => ({ id: String(v), text: v.toLocaleString('fr-FR') }));

export const emojiOptions = (values: string[]): ChoiceOption[] => values.map((v) => ({ id: v, emoji: v }));

export const textOptions = (values: string[]): ChoiceOption[] => values.map((v) => ({ id: v, text: v }));

/** Majuscules pour les petits (capitales d'imprimerie), minuscules ensuite. */
export const caseFor = (word: string, uppercase: boolean) => (uppercase ? word.toLocaleUpperCase('fr-FR') : word);
