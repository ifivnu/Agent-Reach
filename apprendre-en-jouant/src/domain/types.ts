export type Point = { x: number; y: number };

/** Un trait = une suite de points dans un repère 0..100 (y vers le bas). */
export type Stroke = Point[];

export type LevelId = 'PS' | 'MS' | 'GS' | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';

export type ActivityId = 'compter' | 'additions' | 'lettres' | 'trace';

/** Moteur 1 — choix multiple (comptage, additions…). */
export type ChoiceExercise = {
  engine: 'choice';
  id: string;
  /** Consigne lue à voix haute. */
  instruction: string;
  visual:
    | { kind: 'groups'; emoji: string; counts: number[]; operator?: '+' }
    | { kind: 'equation'; text: string };
  choices: number[];
  answer: number;
};

/** Moteur 2 — glisser-déposer (lettres manquantes…). */
export type DragDropExercise = {
  engine: 'dragdrop';
  id: string;
  instruction: string;
  emoji: string;
  /** Le mot complet, déjà dans la casse affichée. */
  word: string;
  /** Positions des lettres à retrouver dans `word`. */
  hidden: number[];
  /** Étiquettes proposées : les bonnes lettres + des intrus, mélangées. */
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

export type Exercise = ChoiceExercise | DragDropExercise | TraceExercise;

/** Contrat commun des moteurs : ils ne connaissent que leur exercice et signalent le résultat. */
export type EngineProps<E extends Exercise> = {
  exercise: E;
  onSolved: () => void;
  onMistake: () => void;
};
