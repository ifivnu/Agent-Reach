import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

const CHEERS = ['Bravo !', 'Super !', 'Génial !', 'Très bien !', 'Champion !'];
const RETRIES = ['Essaie encore !', 'Presque ! Réessaie.', 'Pas tout à fait, recommence.'];

const pickOne = (items: string[]) => items[Math.floor(Math.random() * items.length)];

/** Lit un texte à voix haute en français (voix du système : iOS, Android et navigateur). */
export function say(text: string) {
  try {
    Speech.stop().catch(() => {});
    Speech.speak(text, { language: 'fr-FR', rate: 0.9, pitch: 1.1 });
  } catch {
    // Pas de synthèse vocale disponible : l'application reste utilisable sans le son.
  }
}

export function stopSpeaking() {
  Speech.stop().catch(() => {});
}

function vibrate(type: Haptics.NotificationFeedbackType) {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(type).catch(() => {});
}

export function cheer() {
  say(pickOne(CHEERS));
  vibrate(Haptics.NotificationFeedbackType.Success);
}

export function oops() {
  say(pickOne(RETRIES));
  vibrate(Haptics.NotificationFeedbackType.Warning);
}
