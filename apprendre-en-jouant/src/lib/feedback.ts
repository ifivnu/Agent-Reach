import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import type { Lang, Speakable } from '../domain/types';
import { LANG_INFO, t } from '../i18n/strings';

/** Préfixes de langue des voix installées (« fr », « en »…) ; vide tant qu'on ne sait pas. */
const installed = new Set<string>();

Speech.getAvailableVoicesAsync()
  .then((voices) => voices.forEach((v) => installed.add(v.language.slice(0, 2).toLowerCase())))
  .catch(() => {});

/**
 * Y a-t-il une voix pour cette langue ? Le français et l'anglais sont présents presque
 * partout ; le kreyòl presque nulle part (il faudra des enregistrements, voir README).
 */
export function hasVoice(lang: Lang): boolean {
  if (lang === 'ht') return installed.has('ht');
  return installed.size === 0 || installed.has(lang);
}

function speakOne({ text, lang }: Speakable) {
  if (!hasVoice(lang)) return;
  Speech.speak(text, { language: LANG_INFO[lang].speech, rate: 0.9, pitch: 1.1 });
}

/** Lit un ou plusieurs textes à la suite (ex. la consigne, puis le mot à reconnaître). */
export function say(...items: Speakable[]) {
  try {
    Speech.stop().catch(() => {});
    items.forEach(speakOne);
  } catch {
    // Pas de synthèse vocale : l'application reste utilisable sans le son.
  }
}

export function stopSpeaking() {
  Speech.stop().catch(() => {});
}

function vibrate(type: Haptics.NotificationFeedbackType) {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(type).catch(() => {});
}

const pickOne = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function cheer(lang: Lang) {
  say({ text: t(lang, pickOne(['cheer.1', 'cheer.2', 'cheer.3', 'cheer.4'] as const)), lang });
  vibrate(Haptics.NotificationFeedbackType.Success);
}

export function oops(lang: Lang) {
  say({ text: t(lang, pickOne(['retry.1', 'retry.2'] as const)), lang });
  vibrate(Haptics.NotificationFeedbackType.Warning);
}
