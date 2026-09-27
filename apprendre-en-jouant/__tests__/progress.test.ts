import { STICKERS } from '../src/domain/content/logic';
import {
  addProfile,
  EMPTY_STATE,
  nextDifficulty,
  parseState,
  type Profile,
  recordSession,
  removeProfile,
  starsFor,
} from '../src/domain/progress';
import { seededRng } from '../src/domain/random';

const ana: Profile = { id: 'a', name: 'Ana', avatar: '🦁', level: 'GS', lang: 'ht', createdAt: 0 };
const DAY = 24 * 3600 * 1000;
const T0 = new Date(2026, 8, 1, 10).getTime();

describe('étoiles et difficulté', () => {
  it('attribue 1 à 3 étoiles', () => {
    expect(starsFor({ exercises: 5, firstTry: 5 })).toBe(3);
    expect(starsFor({ exercises: 5, firstTry: 3 })).toBe(2);
    expect(starsFor({ exercises: 5, firstTry: 1 })).toBe(1);
  });

  it('monte, reste ou descend selon la réussite', () => {
    expect(nextDifficulty(1, { exercises: 5, firstTry: 4 })).toBe(2);
    expect(nextDifficulty(3, { exercises: 5, firstTry: 5 })).toBe(3);
    expect(nextDifficulty(2, { exercises: 5, firstTry: 3 })).toBe(2);
    expect(nextDifficulty(2, { exercises: 5, firstTry: 2 })).toBe(1);
    expect(nextDifficulty(1, { exercises: 5, firstTry: 0 })).toBe(1);
  });
});

describe('recordSession', () => {
  it('cumule les résultats, adapte la difficulté et donne un autocollant', () => {
    let state = addProfile(EMPTY_STATE, ana);
    const rng = seededRng(1);
    const first = recordSession(state, 'a', 'additions', { exercises: 5, firstTry: 5 }, T0, rng);
    expect(first.stars).toBe(3);
    expect(first.levelUp).toBe(true);
    expect(first.newSticker).not.toBeNull();
    state = first.state;
    const p = state.data.a.progress.additions;
    expect(p).toMatchObject({ difficulty: 2, bestStars: 3, sessions: 1, exercises: 5, firstTry: 5 });

    const second = recordSession(state, 'a', 'additions', { exercises: 5, firstTry: 1 }, T0 + 1000, rng);
    expect(second.state.data.a.progress.additions).toMatchObject({ difficulty: 1, bestStars: 3, sessions: 2 });
    expect(second.state.data.a.totalStars).toBe(4);
    expect(new Set(second.state.data.a.stickers).size).toBe(2);
  });

  it("s'arrête proprement quand l'album est complet", () => {
    let state = addProfile(EMPTY_STATE, ana);
    const rng = seededRng(2);
    for (let i = 0; i < STICKERS.length; i++) state = recordSession(state, 'a', 'x', { exercises: 1, firstTry: 1 }, T0, rng).state;
    expect([...state.data.a.stickers].sort()).toEqual([...STICKERS].sort());
    expect(recordSession(state, 'a', 'x', { exercises: 1, firstTry: 1 }, T0, rng).newSticker).toBeNull();
  });

  it('compte les jours joués d’affilée', () => {
    let state = addProfile(EMPTY_STATE, ana);
    const rng = seededRng(3);
    const play = (time: number) => (state = recordSession(state, 'a', 'x', { exercises: 1, firstTry: 1 }, time, rng).state);
    play(T0);
    play(T0 + 1000);
    expect(state.data.a.streak.days).toBe(1);
    play(T0 + DAY);
    expect(state.data.a.streak.days).toBe(2);
    play(T0 + 3 * DAY);
    expect(state.data.a.streak.days).toBe(1);
  });
});

describe('profils et sauvegarde', () => {
  it('ajoute et supprime un profil avec ses données', () => {
    const state = removeProfile(addProfile(EMPTY_STATE, ana), 'a');
    expect(state.profiles).toHaveLength(0);
    expect(state.data.a).toBeUndefined();
    expect(state.activeId).toBeNull();
  });

  it('relit un état sauvegardé et résiste aux données abîmées', () => {
    const saved = recordSession(addProfile(EMPTY_STATE, ana), 'a', 'x', { exercises: 2, firstTry: 2 }, T0, seededRng(4)).state;
    expect(parseState(JSON.stringify(saved))).toEqual(saved);
    expect(parseState(null)).toEqual(EMPTY_STATE);
    expect(parseState('{pas du json')).toEqual(EMPTY_STATE);
    expect(parseState(JSON.stringify({ version: 99 }))).toEqual(EMPTY_STATE);
    const partial = parseState(JSON.stringify({ version: 1, profiles: [ana], activeId: 'zzz', data: {} }));
    expect(partial.activeId).toBeNull();
    expect(partial.data.a.stickers).toEqual([]);
  });
});
