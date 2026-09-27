import type { Lang, Localized } from '../types';

export type VocabEntry = { emoji: string } & Localized;

export type ThemeId = 'animaux' | 'couleurs' | 'nombres' | 'nourriture' | 'corps' | 'famille' | 'maison';

export type Theme = { id: ThemeId; emoji: string; name: Localized; words: VocabEntry[] };

/*
 * Vocabulaire original en trois langues. Orthographe kreyòl : graphie officielle
 * (IPN 1979). À faire valider par des enseignants avant publication.
 */
export const THEMES: Theme[] = [
  {
    id: 'animaux',
    emoji: '🐶',
    name: { fr: 'Animaux', en: 'Animals', ht: 'Bèt yo' },
    words: [
      { emoji: '🐱', fr: 'chat', en: 'cat', ht: 'chat' },
      { emoji: '🐶', fr: 'chien', en: 'dog', ht: 'chen' },
      { emoji: '🐟', fr: 'poisson', en: 'fish', ht: 'pwason' },
      { emoji: '🐦', fr: 'oiseau', en: 'bird', ht: 'zwazo' },
      { emoji: '🐄', fr: 'vache', en: 'cow', ht: 'bèf' },
      { emoji: '🐷', fr: 'cochon', en: 'pig', ht: 'kochon' },
      { emoji: '🐐', fr: 'chèvre', en: 'goat', ht: 'kabrit' },
      { emoji: '🐴', fr: 'cheval', en: 'horse', ht: 'cheval' },
      { emoji: '🐔', fr: 'poule', en: 'hen', ht: 'poul' },
      { emoji: '🐭', fr: 'souris', en: 'mouse', ht: 'sourit' },
      { emoji: '🦋', fr: 'papillon', en: 'butterfly', ht: 'papiyon' },
      { emoji: '🐢', fr: 'tortue', en: 'turtle', ht: 'tòti' },
      { emoji: '🐸', fr: 'grenouille', en: 'frog', ht: 'krapo' },
    ],
  },
  {
    id: 'couleurs',
    emoji: '🎨',
    name: { fr: 'Couleurs', en: 'Colors', ht: 'Koulè yo' },
    words: [
      { emoji: '🔴', fr: 'rouge', en: 'red', ht: 'wouj' },
      { emoji: '🔵', fr: 'bleu', en: 'blue', ht: 'ble' },
      { emoji: '🟡', fr: 'jaune', en: 'yellow', ht: 'jòn' },
      { emoji: '🟢', fr: 'vert', en: 'green', ht: 'vèt' },
      { emoji: '⚫', fr: 'noir', en: 'black', ht: 'nwa' },
      { emoji: '⚪', fr: 'blanc', en: 'white', ht: 'blan' },
      { emoji: '🟠', fr: 'orange', en: 'orange', ht: 'zoranj' },
      { emoji: '🟣', fr: 'violet', en: 'purple', ht: 'vyolèt' },
      { emoji: '🟤', fr: 'marron', en: 'brown', ht: 'mawon' },
    ],
  },
  {
    id: 'nombres',
    emoji: '🔢',
    name: { fr: 'Nombres', en: 'Numbers', ht: 'Chif yo' },
    words: [
      { emoji: '1️⃣', fr: 'un', en: 'one', ht: 'en' },
      { emoji: '2️⃣', fr: 'deux', en: 'two', ht: 'de' },
      { emoji: '3️⃣', fr: 'trois', en: 'three', ht: 'twa' },
      { emoji: '4️⃣', fr: 'quatre', en: 'four', ht: 'kat' },
      { emoji: '5️⃣', fr: 'cinq', en: 'five', ht: 'senk' },
      { emoji: '6️⃣', fr: 'six', en: 'six', ht: 'sis' },
      { emoji: '7️⃣', fr: 'sept', en: 'seven', ht: 'sèt' },
      { emoji: '8️⃣', fr: 'huit', en: 'eight', ht: 'uit' },
      { emoji: '9️⃣', fr: 'neuf', en: 'nine', ht: 'nèf' },
      { emoji: '🔟', fr: 'dix', en: 'ten', ht: 'dis' },
    ],
  },
  {
    id: 'nourriture',
    emoji: '🍎',
    name: { fr: 'Fruits et repas', en: 'Food', ht: 'Fwi ak manje' },
    words: [
      { emoji: '🍎', fr: 'pomme', en: 'apple', ht: 'pòm' },
      { emoji: '🍌', fr: 'banane', en: 'banana', ht: 'fig' },
      { emoji: '🥭', fr: 'mangue', en: 'mango', ht: 'mango' },
      { emoji: '🍊', fr: 'orange', en: 'orange', ht: 'zoranj' },
      { emoji: '🍉', fr: 'pastèque', en: 'watermelon', ht: 'melon dlo' },
      { emoji: '🍍', fr: 'ananas', en: 'pineapple', ht: 'anana' },
      { emoji: '🥥', fr: 'noix de coco', en: 'coconut', ht: 'kokoye' },
      { emoji: '🍞', fr: 'pain', en: 'bread', ht: 'pen' },
      { emoji: '🍚', fr: 'riz', en: 'rice', ht: 'diri' },
      { emoji: '💧', fr: 'eau', en: 'water', ht: 'dlo' },
      { emoji: '🥚', fr: 'œuf', en: 'egg', ht: 'ze' },
      { emoji: '🥛', fr: 'lait', en: 'milk', ht: 'lèt' },
    ],
  },
  {
    id: 'corps',
    emoji: '✋',
    name: { fr: 'Le corps', en: 'The body', ht: 'Kò a' },
    words: [
      { emoji: '👁️', fr: 'œil', en: 'eye', ht: 'je' },
      { emoji: '👃', fr: 'nez', en: 'nose', ht: 'nen' },
      { emoji: '👄', fr: 'bouche', en: 'mouth', ht: 'bouch' },
      { emoji: '👂', fr: 'oreille', en: 'ear', ht: 'zòrèy' },
      { emoji: '✋', fr: 'main', en: 'hand', ht: 'men' },
      { emoji: '🦶', fr: 'pied', en: 'foot', ht: 'pye' },
      { emoji: '🦷', fr: 'dent', en: 'tooth', ht: 'dan' },
      { emoji: '🦵', fr: 'jambe', en: 'leg', ht: 'janm' },
    ],
  },
  {
    id: 'famille',
    emoji: '👪',
    name: { fr: 'La famille', en: 'Family', ht: 'Fanmi' },
    words: [
      { emoji: '👩', fr: 'maman', en: 'mom', ht: 'manman' },
      { emoji: '👨', fr: 'papa', en: 'dad', ht: 'papa' },
      { emoji: '👶', fr: 'bébé', en: 'baby', ht: 'bebe' },
      { emoji: '👧', fr: 'fille', en: 'girl', ht: 'tifi' },
      { emoji: '👦', fr: 'garçon', en: 'boy', ht: 'tigason' },
      { emoji: '👵', fr: 'grand-mère', en: 'grandma', ht: 'grann' },
      { emoji: '👴', fr: 'grand-père', en: 'grandpa', ht: 'granpè' },
    ],
  },
  {
    id: 'maison',
    emoji: '🏠',
    name: { fr: 'Autour de moi', en: 'Around me', ht: 'Bò kote m' },
    words: [
      { emoji: '🏠', fr: 'maison', en: 'house', ht: 'kay' },
      { emoji: '🚪', fr: 'porte', en: 'door', ht: 'pòt' },
      { emoji: '🛏️', fr: 'lit', en: 'bed', ht: 'kabann' },
      { emoji: '🪑', fr: 'chaise', en: 'chair', ht: 'chèz' },
      { emoji: '📖', fr: 'livre', en: 'book', ht: 'liv' },
      { emoji: '✏️', fr: 'crayon', en: 'pencil', ht: 'kreyon' },
      { emoji: '🚗', fr: 'voiture', en: 'car', ht: 'machin' },
      { emoji: '⚽', fr: 'ballon', en: 'ball', ht: 'boul' },
      { emoji: '☀️', fr: 'soleil', en: 'sun', ht: 'solèy' },
      { emoji: '🌙', fr: 'lune', en: 'moon', ht: 'lalin' },
      { emoji: '⭐', fr: 'étoile', en: 'star', ht: 'zetwal' },
      { emoji: '🌳', fr: 'arbre', en: 'tree', ht: 'pyebwa' },
      { emoji: '🌧️', fr: 'pluie', en: 'rain', ht: 'lapli' },
    ],
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((th) => th.id === value);
}

export function getTheme(id: ThemeId): Theme {
  const theme = THEMES.find((th) => th.id === id);
  if (!theme) throw new Error(`Thème inconnu : ${id}`);
  return theme;
}

/** Tous les mots, tous thèmes confondus (pour la lecture dans la langue de l'interface). */
export const ALL_WORDS: VocabEntry[] = THEMES.flatMap((th) => th.words);

/** Un mot « simple » s'épelle lettre par lettre : pas d'espace, de tiret ni d'apostrophe. */
export function isSpellable(word: string): boolean {
  return /^[\p{L}]+$/u.test(word);
}

/** Lettres utilisées pour les intrus, par langue. */
export const ALPHABETS: Record<Lang, string> = {
  fr: 'abcdefghijklmnopqrstuvwxyzéèàç',
  en: 'abcdefghijklmnopqrstuvwxyz',
  ht: 'abcdefghijklmnoprstuvwyzèò',
};

/** Digrammes kreyòl notant un seul son : « chat » commence par « ch », « ouvè » par « ou ». */
const HT_GRAPHEMES = ['oun', 'ch', 'ou', 'on', 'an', 'en', 'ng'];

/** Premier son écrit du mot (lettre, ou digramme en kreyòl). */
export function firstGrapheme(word: string, lang: Lang): string {
  if (lang === 'ht') {
    const lower = word.toLowerCase();
    const match = HT_GRAPHEMES.find((g) => lower.startsWith(g));
    if (match) return word.slice(0, match.length);
  }
  return [...word][0];
}
