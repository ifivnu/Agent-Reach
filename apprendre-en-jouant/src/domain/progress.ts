import { STICKERS } from './content/logic';
import { type Rng, pick } from './random';
import type { Difficulty, Lang, LevelId } from './types';

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  level: LevelId;
  lang: Lang;
  createdAt: number;
};

export type SkillProgress = {
  difficulty: Difficulty;
  /** Meilleur résultat d'une série : 1 à 3 étoiles. */
  bestStars: number;
  sessions: number;
  exercises: number;
  firstTry: number;
  lastPlayed: number;
};

export type ProfileData = {
  progress: Record<string, SkillProgress>;
  stickers: string[];
  totalStars: number;
  /** Jours joués d'affilée (jour local AAAA-MM-JJ). */
  streak: { lastDay: string; days: number };
};

export type AppState = {
  version: 1;
  profiles: Profile[];
  activeId: string | null;
  data: Record<string, ProfileData>;
};

export const EMPTY_STATE: AppState = { version: 1, profiles: [], activeId: null, data: {} };

export const emptyProfileData = (): ProfileData => ({
  progress: {},
  stickers: [],
  totalStars: 0,
  streak: { lastDay: '', days: 0 },
});

export const AVATARS = ['🦁', '🐼', '🦊', '🐸', '🐵', '🦄', '🐙', '🐢', '🐧', '🦉', '🐬', '🐞'];

export type SessionResult = { exercises: number; firstTry: number };

/** 3 étoiles : tout juste du premier coup ; 2 : au moins 60 % ; 1 : série terminée. */
export function starsFor(r: SessionResult): number {
  if (r.exercises === 0) return 0;
  if (r.firstTry >= r.exercises) return 3;
  return r.firstTry / r.exercises >= 0.6 ? 2 : 1;
}

/**
 * Difficulté adaptative : on monte après une série réussie à 80 % du premier coup,
 * on redescend sous 50 %. L'enfant reste ainsi dans sa zone de progrès.
 */
export function nextDifficulty(current: Difficulty, r: SessionResult): Difficulty {
  const rate = r.exercises ? r.firstTry / r.exercises : 0;
  if (rate >= 0.8) return Math.min(3, current + 1) as Difficulty;
  if (rate < 0.5) return Math.max(1, current - 1) as Difficulty;
  return current;
}

export function dayKey(time: number): string {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nextStreak(streak: ProfileData['streak'], now: number): ProfileData['streak'] {
  const today = dayKey(now);
  if (streak.lastDay === today) return streak;
  const yesterday = dayKey(now - 24 * 3600 * 1000);
  return { lastDay: today, days: streak.lastDay === yesterday ? streak.days + 1 : 1 };
}

export type SessionOutcome = {
  state: AppState;
  stars: number;
  newSticker: string | null;
  levelUp: boolean;
};

/** Enregistre une série terminée : étoiles, difficulté, autocollant gagné, série de jours. */
export function recordSession(
  state: AppState,
  profileId: string,
  key: string,
  result: SessionResult,
  now: number,
  rng: Rng,
): SessionOutcome {
  const data = state.data[profileId] ?? emptyProfileData();
  const previous = data.progress[key];
  const difficulty = previous?.difficulty ?? 1;
  const stars = starsFor(result);
  const newDifficulty = nextDifficulty(difficulty, result);

  const progress: SkillProgress = {
    difficulty: newDifficulty,
    bestStars: Math.max(previous?.bestStars ?? 0, stars),
    sessions: (previous?.sessions ?? 0) + 1,
    exercises: (previous?.exercises ?? 0) + result.exercises,
    firstTry: (previous?.firstTry ?? 0) + result.firstTry,
    lastPlayed: now,
  };

  // Chaque série terminée fait gagner un nouvel autocollant, jusqu'à compléter l'album.
  const missing = STICKERS.filter((s) => !data.stickers.includes(s));
  const newSticker = missing.length ? pick(rng, missing) : null;

  const nextData: ProfileData = {
    progress: { ...data.progress, [key]: progress },
    stickers: newSticker ? [...data.stickers, newSticker] : data.stickers,
    totalStars: data.totalStars + stars,
    streak: nextStreak(data.streak, now),
  };

  return {
    state: { ...state, data: { ...state.data, [profileId]: nextData } },
    stars,
    newSticker,
    levelUp: newDifficulty > difficulty,
  };
}

export function difficultyOf(state: AppState, profileId: string, key: string): Difficulty {
  return state.data[profileId]?.progress[key]?.difficulty ?? 1;
}

export function addProfile(state: AppState, profile: Profile): AppState {
  return {
    ...state,
    profiles: [...state.profiles, profile],
    activeId: profile.id,
    data: { ...state.data, [profile.id]: emptyProfileData() },
  };
}

export function updateProfile(state: AppState, id: string, patch: Partial<Omit<Profile, 'id'>>): AppState {
  return { ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

export function removeProfile(state: AppState, id: string): AppState {
  const { [id]: _removed, ...data } = state.data;
  return {
    ...state,
    profiles: state.profiles.filter((p) => p.id !== id),
    activeId: state.activeId === id ? null : state.activeId,
    data,
  };
}

/** Lecture tolérante d'un état sauvegardé : une donnée abîmée ne doit jamais bloquer l'application. */
export function parseState(raw: string | null): AppState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed?.version !== 1 || !Array.isArray(parsed.profiles)) return EMPTY_STATE;
    const data: Record<string, ProfileData> = {};
    for (const p of parsed.profiles) data[p.id] = { ...emptyProfileData(), ...(parsed.data?.[p.id] ?? {}) };
    const activeId = parsed.profiles.some((p) => p.id === parsed.activeId) ? (parsed.activeId ?? null) : null;
    return { version: 1, profiles: parsed.profiles, activeId, data };
  } catch {
    return EMPTY_STATE;
  }
}
