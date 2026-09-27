import type { ThemeId } from '../content/vocab';
import type { LevelConfig } from '../levels';
import type { Rng } from '../random';
import type { Difficulty, Lang } from '../types';

/** Tout ce dont un générateur a besoin pour fabriquer un exercice. */
export type GenContext = {
  level: LevelConfig;
  difficulty: Difficulty;
  /** Langue de l'interface (consignes). */
  lang: Lang;
  /** Langue étudiée (section Langues) ; égale à `lang` ailleurs. */
  target: Lang;
  theme?: ThemeId;
  rng: Rng;
  id: string;
};
