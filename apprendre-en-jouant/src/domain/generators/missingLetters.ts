import type { LevelConfig } from '../levels';
import { type Rng, pick, sample, shuffle } from '../random';
import type { DragDropExercise } from '../types';
import { WORDS } from '../words';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export function makeMissingLetters(level: LevelConfig, rng: Rng, id: string): DragDropExercise {
  const entry = pick(rng, WORDS[level.words]);
  const word = level.uppercase ? entry.word.toUpperCase() : entry.word;

  // Jamais plus de la moitié du mot caché, sinon il devient impossible à deviner.
  const howMany = Math.max(1, Math.min(level.missingLetters, Math.floor(word.length / 2)));
  const hidden = sample(rng, [...word].map((_, i) => i), howMany).sort((x, y) => x - y);

  const needed = hidden.map((i) => word[i]);
  const decoyPool = [...ALPHABET]
    .map((c) => (level.uppercase ? c.toUpperCase() : c))
    .filter((c) => !needed.includes(c));
  const decoys = sample(rng, decoyPool, Math.max(2, needed.length));

  return {
    engine: 'dragdrop',
    id,
    instruction: `Retrouve les lettres qui manquent au mot ${entry.word}.`,
    emoji: entry.emoji,
    word,
    hidden,
    tiles: shuffle(rng, [...needed, ...decoys]),
  };
}
