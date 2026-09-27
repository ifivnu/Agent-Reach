import { t } from '../../i18n/strings';
import { ALL_WORDS, ALPHABETS, firstGrapheme, isSpellable, type VocabEntry } from '../content/vocab';
import { GLYPHS } from '../glyphs';
import { pick, type Rng, sample, shuffle } from '../random';
import type { ChoiceExercise, Difficulty, DragDropExercise, Lang, SequenceExercise, TraceExercise } from '../types';
import type { GenContext } from './context';
import { caseFor, emojiOptions, textOptions } from './helpers';

/** Longueur de mot visée selon la classe et la difficulté. */
function lengthRange(rank: number, difficulty: Difficulty): [number, number] {
  if (rank <= 2) return difficulty === 3 ? [3, 5] : [2, 4];
  if (rank <= 4) return difficulty === 3 ? [6, 12] : [4, 6];
  return difficulty === 1 ? [5, 7] : [7, 12];
}

/** Mots épelables dans une langue, filtrés par longueur (repli sur tous les mots si le filtre est trop strict). */
export function spellableWords(words: VocabEntry[], lang: Lang, range?: [number, number]): VocabEntry[] {
  const ok = words.filter((w) => isSpellable(w[lang]));
  if (!range) return ok;
  const sized = ok.filter((w) => [...w[lang]].length >= range[0] && [...w[lang]].length <= range[1]);
  return sized.length >= 3 ? sized : ok;
}

/** Exercice « lettres manquantes » sur un mot dans une langue donnée (réutilisé par la section Langues). */
export function missingLettersExercise(
  entry: VocabEntry,
  lang: Lang,
  hiddenCount: number,
  uppercase: boolean,
  instruction: string,
  rng: Rng,
  id: string,
): DragDropExercise {
  const word = caseFor(entry[lang], uppercase);
  const chars = [...word];
  const howMany = Math.max(1, Math.min(hiddenCount, Math.floor(chars.length / 2)));
  const hidden = sample(rng, chars.map((_, i) => i), howMany).sort((x, y) => x - y);
  const needed = hidden.map((i) => chars[i]);
  const decoyPool = [...ALPHABETS[lang]].map((c) => caseFor(c, uppercase)).filter((c) => !needed.includes(c));
  const decoys = sample(rng, decoyPool, Math.max(2, needed.length));
  return { engine: 'dragdrop', id, instruction, emoji: entry.emoji, word, hidden, tiles: shuffle(rng, [...needed, ...decoys]) };
}

export function makeMissingLetters(ctx: GenContext): DragDropExercise {
  const words = spellableWords(ALL_WORDS, ctx.lang, lengthRange(ctx.level.rank, ctx.difficulty));
  const hidden = ctx.level.missingLetters + (ctx.difficulty === 3 ? 1 : 0);
  return missingLettersExercise(
    pick(ctx.rng, words),
    ctx.lang,
    hidden,
    ctx.level.uppercase,
    t(ctx.lang, 'i.missing'),
    ctx.rng,
    ctx.id,
  );
}

export function makeFirstLetter(ctx: GenContext): ChoiceExercise {
  const entry = pick(ctx.rng, spellableWords(ALL_WORDS, ctx.lang));
  const word = entry[ctx.lang];
  const answer = caseFor(firstGrapheme(word, ctx.lang), ctx.level.uppercase);
  const others = [...ALPHABETS[ctx.lang]]
    .map((c) => caseFor(c, ctx.level.uppercase))
    .filter((c) => c !== answer && !answer.startsWith(c));
  const choices = shuffle(ctx.rng, [answer, ...sample(ctx.rng, others, ctx.difficulty === 1 ? 2 : 3)]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.firstLetter'),
    prompt: { kind: 'picture', emoji: entry.emoji, say: { text: word, lang: ctx.lang } },
    choices: textOptions(choices),
    answer,
  };
}

/** Lire un mot et toucher l'image (lecture dans la langue de l'interface). */
export function makeReadPick(ctx: GenContext): ChoiceExercise {
  const entry = pick(ctx.rng, ALL_WORDS);
  const others = ALL_WORDS.filter((w) => w.emoji !== entry.emoji && w[ctx.lang] !== entry[ctx.lang]);
  const choices = shuffle(ctx.rng, [entry.emoji, ...sample(ctx.rng, others, ctx.difficulty === 1 ? 2 : 3).map((w) => w.emoji)]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.readPick'),
    prompt: { kind: 'word', text: caseFor(entry[ctx.lang], ctx.level.uppercase), lang: ctx.lang },
    choices: emojiOptions(choices),
    answer: entry.emoji,
    layout: 'big',
  };
}

export function makeTraceLetter(ctx: GenContext): TraceExercise {
  const letters = [...ctx.level.traceGlyphs].filter((g) => /[A-Z]/.test(g));
  const glyph = pick(ctx.rng, letters.length ? letters : [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']);
  return { engine: 'trace', id: ctx.id, instruction: t(ctx.lang, 'i.traceLetter', { g: glyph }), glyph, strokes: GLYPHS[glyph] };
}

/** Mot mélangé : remettre les lettres dans l'ordre (l'image sert d'indice). */
export function makeAnagram(ctx: GenContext): SequenceExercise {
  const words = spellableWords(ALL_WORDS, ctx.lang, lengthRange(ctx.level.rank, ctx.difficulty)).filter(
    (w) => new Set(w[ctx.lang]).size > 1,
  );
  const entry = pick(ctx.rng, words);
  const ordered = [...caseFor(entry[ctx.lang], ctx.level.uppercase)];
  let shuffled = shuffle(ctx.rng, ordered);
  for (let i = 0; shuffled.join('') === ordered.join('') && i < 20; i++) shuffled = shuffle(ctx.rng, ordered);
  if (shuffled.join('') === ordered.join('')) shuffled = [...ordered].reverse();
  return { engine: 'sequence', id: ctx.id, instruction: t(ctx.lang, 'i.anagram'), ordered, shuffled, emoji: entry.emoji };
}
