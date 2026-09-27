export type Point = { x: number; y: number };

/** Un trait = une suite de points dans un repère 0..100 (y vers le bas). */
export type Stroke = Point[];

export type LevelId = 'PS' | 'MS' | 'GS' | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';

/** Langues de l'interface et des contenus. */
export type Lang = 'fr' | 'en' | 'ht';

/** Texte disponible dans les trois langues. */
export type Localized = Record<Lang, string>;

export type Difficulty = 1 | 2 | 3;

export type SubjectId = 'maths' | 'lecture' | 'logique' | 'agilite' | 'langues';

/** Une option de réponse : texte, emoji, ou les deux. */
export type ChoiceOption = { id: string; text?: string; emoji?: string };

/** Ce que l'enfant regarde (ou écoute) avant de répondre. */
export type ChoicePrompt =
  | { kind: 'groups'; emoji: string; counts: number[]; operator?: '+' }
  | { kind: 'takeaway'; emoji: string; total: number; removed: number }
  | { kind: 'text'; text: string }
  | { kind: 'emojis'; items: string[] }
  | { kind: 'none' }
  | { kind: 'picture'; emoji: string; say?: { text: string; lang: Lang } }
  | { kind: 'word'; text: string; lang: Lang }
  | { kind: 'listen'; text: string; lang: Lang };

/** Moteur 1 — choix multiple. */
export type ChoiceExercise = {
  engine: 'choice';
  id: string;
  instruction: string;
  prompt: ChoicePrompt;
  choices: ChoiceOption[];
  /** id de la bonne option. */
  answer: string;
  /** Présentation des options : grosses tuiles emoji, mots, ou nombres. */
  layout?: 'big' | 'words';
};

/** Texte lu à voix haute, dans une langue donnée. */
export type Speakable = { text: string; lang: Lang };

/** Moteur 2 — glisser-déposer des lettres. */
export type DragDropExercise = {
  engine: 'dragdrop';
  id: string;
  instruction: string;
  emoji: string;
  /** Le mot complet, découpé en caractères affichés. */
  word: string;
  hidden: number[];
  tiles: string[];
};

/** Moteur 3 — tracé au doigt ou à la souris. */
export type TraceExercise = {
  engine: 'trace';
  id: string;
  instruction: string;
  glyph: string;
  strokes: Stroke[];
};

/** Moteur 4 — mémoire : retrouver les paires. */
export type MemoryExercise = {
  engine: 'memory';
  id: string;
  instruction: string;
  /** Chaque carte appartient à une paire (`pair`) ; les deux cartes d'une paire peuvent différer (image ↔ mot). */
  cards: { id: string; pair: string; face: string; isText: boolean }[];
};

/** Moteur 5 — remettre dans l'ordre (toucher les éléments dans le bon ordre). */
export type SequenceExercise = {
  engine: 'sequence';
  id: string;
  instruction: string;
  /** Éléments dans l'ordre attendu (des doublons sont possibles, ex. les lettres d'un mot). */
  ordered: string[];
  /** Image d'indice facultative (ex. le mot à reconstituer). */
  emoji?: string;
  /** Les mêmes éléments, mélangés, tels qu'affichés. */
  shuffled: string[];
};

/** Moteur 6 — attrape-les : toucher vite les bonnes cibles qui apparaissent. */
export type TapTargetsExercise = {
  engine: 'taptargets';
  id: string;
  instruction: string;
  /** Rappel visuel de la règle (ex. « 🍎 », « pair », « = 10 »). */
  hint: string;
  targets: string[];
  distractors: string[];
  goal: number;
  /** Durée de vie d'une cible (ms) et intervalle d'apparition (ms). */
  lifetime: number;
  spawnEvery: number;
};

/** Tout exercice peut faire prononcer un mot après la consigne (ex. le mot à reconnaître). */
export type Exercise =
  | ChoiceExercise
  | DragDropExercise
  | TraceExercise
  | MemoryExercise
  | SequenceExercise
  | TapTargetsExercise;

/** Contrat commun des moteurs : ils ne connaissent que leur exercice et signalent le résultat. */
export type EngineProps<E extends Exercise> = {
  exercise: E;
  lang: Lang;
  onSolved: () => void;
  /** `silent` : pas de message vocal (jeux rapides où la voix gênerait). */
  onMistake: (opts?: { silent?: boolean }) => void;
};
