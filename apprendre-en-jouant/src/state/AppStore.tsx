import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as P from '../domain/progress';
import { defaultRng } from '../domain/random';

const STORAGE_KEY = 'apprendre-en-jouant/state';

type Store = {
  ready: boolean;
  state: P.AppState;
  active: P.Profile | null;
  activeData: P.ProfileData;
  addProfile: (p: Omit<P.Profile, 'id' | 'createdAt'>) => void;
  selectProfile: (id: string | null) => void;
  updateProfile: (id: string, patch: Partial<Omit<P.Profile, 'id'>>) => void;
  removeProfile: (id: string) => void;
  recordSession: (key: string, result: P.SessionResult) => Omit<P.SessionOutcome, 'state'>;
};

const StoreContext = createContext<Store | null>(null);

/** État de l'application (profils, progrès, autocollants), sauvegardé sur l'appareil. */
export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<P.AppState>(P.EMPTY_STATE);
  const [ready, setReady] = useState(false);
  // Copie synchrone : recordSession doit calculer à partir du dernier état, même entre deux rendus.
  const latest = useRef(state);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const loaded = P.parseState(raw);
        latest.current = loaded;
        setState(loaded);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const commit = useCallback((next: P.AppState) => {
    latest.current = next;
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const store = useMemo<Store>(() => {
    const active = state.profiles.find((p) => p.id === state.activeId) ?? null;
    return {
      ready,
      state,
      active,
      activeData: (active && state.data[active.id]) || P.emptyProfileData(),
      addProfile: (p) =>
        commit(P.addProfile(latest.current, { ...p, id: `p${Date.now().toString(36)}`, createdAt: Date.now() })),
      selectProfile: (id) => commit({ ...latest.current, activeId: id }),
      updateProfile: (id, patch) => commit(P.updateProfile(latest.current, id, patch)),
      removeProfile: (id) => commit(P.removeProfile(latest.current, id)),
      recordSession: (key, result) => {
        const id = latest.current.activeId;
        if (!id) return { stars: P.starsFor(result), newSticker: null, levelUp: false };
        const { state: next, ...outcome } = P.recordSession(latest.current, id, key, result, Date.now(), defaultRng);
        commit(next);
        return outcome;
      },
    };
  }, [state, ready, commit]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore doit être utilisé sous AppStoreProvider');
  return store;
}

/** Langue de l'interface : celle du profil actif, le français sinon. */
export function useLang() {
  return useStore().active?.lang ?? 'fr';
}
