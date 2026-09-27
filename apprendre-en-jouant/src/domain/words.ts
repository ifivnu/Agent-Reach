import type { WordLength } from './levels';

/**
 * Liste de mots originale (sans accents pour ce premier jeu d'étiquettes).
 * Les images sont des emoji Unicode : à remplacer par des illustrations libres
 * (OpenMoji, Kenney…) ou maison.
 */
export const WORDS: Record<WordLength, { word: string; emoji: string }[]> = {
  court: [
    { word: 'chat', emoji: '🐱' }, { word: 'lion', emoji: '🦁' }, { word: 'loup', emoji: '🐺' },
    { word: 'ours', emoji: '🐻' }, { word: 'bus', emoji: '🚌' }, { word: 'lune', emoji: '🌙' },
    { word: 'nez', emoji: '👃' }, { word: 'lit', emoji: '🛏️' }, { word: 'roi', emoji: '🤴' },
    { word: 'sac', emoji: '🎒' }, { word: 'riz', emoji: '🍚' }, { word: 'kiwi', emoji: '🥝' },
    { word: 'pain', emoji: '🍞' }, { word: 'miel', emoji: '🍯' }, { word: 'gant', emoji: '🧤' },
  ],
  moyen: [
    { word: 'pomme', emoji: '🍎' }, { word: 'lapin', emoji: '🐰' }, { word: 'cheval', emoji: '🐴' },
    { word: 'maison', emoji: '🏠' }, { word: 'fraise', emoji: '🍓' }, { word: 'banane', emoji: '🍌' },
    { word: 'tomate', emoji: '🍅' }, { word: 'soleil', emoji: '☀️' }, { word: 'bateau', emoji: '⛵' },
    { word: 'avion', emoji: '✈️' }, { word: 'livre', emoji: '📖' }, { word: 'tortue', emoji: '🐢' },
    { word: 'cochon', emoji: '🐷' }, { word: 'mouton', emoji: '🐑' }, { word: 'carotte', emoji: '🥕' },
  ],
  long: [
    { word: 'poisson', emoji: '🐟' }, { word: 'crocodile', emoji: '🐊' }, { word: 'papillon', emoji: '🦋' },
    { word: 'escargot', emoji: '🐌' }, { word: 'dauphin', emoji: '🐬' }, { word: 'citrouille', emoji: '🎃' },
    { word: 'pingouin', emoji: '🐧' }, { word: 'chocolat', emoji: '🍫' }, { word: 'parapluie', emoji: '☂️' },
    { word: 'ordinateur', emoji: '💻' }, { word: 'champignon', emoji: '🍄' }, { word: 'tournesol', emoji: '🌻' },
  ],
};
