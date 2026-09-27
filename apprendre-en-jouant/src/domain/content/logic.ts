/*
 * Contenus originaux pour la logique et le bon sens.
 */

export type CategoryId =
  | 'fruits'
  | 'vegetables'
  | 'wild'
  | 'farm'
  | 'sea'
  | 'vehicles'
  | 'clothes'
  | 'music'
  | 'sky';

export const CATEGORIES: Record<CategoryId, string[]> = {
  fruits: ['🍎', '🍌', '🍇', '🍓', '🍐', '🍊', '🍉', '🍍'],
  vegetables: ['🥕', '🥦', '🌽', '🥔', '🧅', '🍆'],
  wild: ['🦁', '🐯', '🐻', '🐼', '🦊', '🐵', '🦒', '🐘'],
  farm: ['🐄', '🐷', '🐔', '🐑', '🐴', '🐐'],
  sea: ['🐟', '🐙', '🐬', '🦀', '🐳', '🦈'],
  vehicles: ['🚗', '🚌', '🚲', '✈️', '🚂', '🚤', '🚜', '🚀'],
  clothes: ['👕', '👖', '👗', '🧦', '🧢', '👟', '🧤', '🧣'],
  music: ['🎸', '🥁', '🎺', '🎻', '🎹', '🎷'],
  sky: ['☀️', '🌙', '⭐', '☁️', '🌈', '❄️'],
};

/**
 * Familles : deux catégories de la même famille ne sont opposées qu'en difficulté 3,
 * et seulement par les paires de CLOSE_CATEGORIES, dont la différence reste évidente.
 * Sinon une question pourrait avoir deux bonnes réponses (une vache est aussi un animal).
 */
export const FAMILY: Record<CategoryId, string> = {
  fruits: 'food',
  vegetables: 'food',
  wild: 'animal',
  farm: 'animal',
  sea: 'animal',
  vehicles: 'vehicles',
  clothes: 'clothes',
  music: 'music',
  sky: 'sky',
};

export const CLOSE_CATEGORIES: [CategoryId, CategoryId][] = [
  ['sea', 'farm'],
  ['wild', 'sea'],
  ['wild', 'farm'],
  ['fruits', 'vegetables'],
];

/**
 * « Qu'est-ce qui va avec ? » : associations de bon sens. Les autres réponses proposées
 * sont les partenaires des autres paires : aucune ne doit aussi convenir (d'où l'absence
 * de 🔥/🧯 ou 🌱/💧, qui entreraient en concurrence avec 🌧️/☂️).
 */
export const GOES_WITH: [string, string][] = [
  ['🐝', '🍯'],
  ['🐄', '🥛'],
  ['🔑', '🔒'],
  ['🌧️', '☂️'],
  ['🦷', '🪥'],
  ['⚽', '🥅'],
  ['🐔', '🥚'],
  ['🐶', '🦴'],
  ['🐰', '🥕'],
  ['🐒', '🍌'],
  ['🎂', '🕯️'],
  ['🥶', '🧣'],
  ['🎨', '🖌️'],
  ['✉️', '📮'],
  ['🍝', '🍴'],
  ['🧦', '👟'],
  ['🛏️', '😴'],
];

/** Histoires à remettre dans l'ordre (ordre logique ou chronologique). */
export const STORIES: { items: string[]; minRank: number }[] = [
  { items: ['🥚', '🐣', '🐥', '🐓'], minRank: 0 },
  { items: ['🌱', '🌿', '🌳'], minRank: 0 },
  { items: ['🥚', '🐛', '🦋'], minRank: 1 },
  { items: ['👶', '🧒', '🧑', '🧓'], minRank: 1 },
  { items: ['🌅', '☀️', '🌇', '🌙'], minRank: 2 },
  { items: ['🐭', '🐱', '🐶', '🐴', '🐘'], minRank: 1 },
  { items: ['🌑', '🌓', '🌕'], minRank: 3 },
  { items: ['🧊', '💧', '☁️'], minRank: 4 },
  { items: ['🌰', '🌱', '🌳', '🍎'], minRank: 2 },
];

/** Jeux d'images pour les suites logiques. */
export const PATTERN_SETS: string[][] = [
  ['🔴', '🔵', '🟡', '🟢'],
  ['🍎', '🍌', '🍇', '🍓'],
  ['🐶', '🐱', '🐭', '🐰'],
  ['⭐', '🌙', '☀️', '☁️'],
  ['🔺', '🟦', '⚪', '🔶'],
];

/** Autocollants à collectionner dans l'album. */
export const STICKERS: string[] = [
  '🦁', '🐯', '🐼', '🐨', '🦊', '🐸', '🐵', '🦄', '🐙', '🦋',
  '🐢', '🦜', '🐬', '🦒', '🦓', '🐘', '🦉', '🐧', '🦩', '🐳',
  '🌻', '🌈', '🚀', '🎈', '🎁', '🏰', '⛵', '🎪', '🍦', '🧁',
  '🍩', '🥥', '🥭', '🏝️', '🌋', '🎸', '🥁', '⚽', '🏆', '👑',
];
