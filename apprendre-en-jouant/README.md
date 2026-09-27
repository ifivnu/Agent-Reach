# Apprendre en jouant

Application d'apprentissage pour enfants de la petite section au CM2. Elle se joue à la souris, au doigt ou au stylet, et fonctionne sur **Android, iOS et PC** (navigateur ou application installable) à partir d'une seule base de code **Expo / React Native**.

## Contenu : tout est original

Les fiches d'exercices du web, par exemple kiddoworksheets.com, sont protégées : leurs conditions interdisent de les republier, reproduire ou redistribuer. Cette application **n'en contient aucune**. Elle reprend seulement des *types* d'exercices classiques, qui ne sont pas protégés, et génère le contenu par le code :

- les additions, le comptage et les lettres manquantes sont tirés au hasard selon le niveau ;
- les modèles de tracé sont des coordonnées dessinées pour ce projet (`src/domain/glyphs.ts`) ;
- les images sont des emoji Unicode, à remplacer par des illustrations libres ([Kenney](https://kenney.nl) en CC0, [OpenMoji](https://openmoji.org) en CC BY-SA…) ou faites maison.

## Les 3 moteurs

| Moteur | Fichier | Activités | Interaction |
|---|---|---|---|
| Choix multiple | `src/engines/ChoiceEngine.tsx` | Compter, Additions | Toucher ou cliquer la bonne réponse. On peut aussi toucher chaque objet pour le compter à voix haute. |
| Glisser-déposer | `src/engines/DragDropEngine.tsx` | Lettres manquantes | Glisser une lettre vers une case vide. Une mauvaise lettre revient à sa place. |
| Tracé | `src/engines/TraceEngine.tsx` | Tracer chiffres et capitales | Repasser le modèle trait par trait. Chaque trait est vérifié : départ, couverture, précision et anti-gribouillis. |

Chaque moteur reçoit un exercice (une simple donnée) et signale `onSolved` ou `onMistake`. Ajouter une activité revient à écrire un générateur, sans toucher aux moteurs.

## Niveaux

Toute la difficulté se règle dans `src/domain/levels.ts` :

| Niveau | Activités | Réglages |
|---|---|---|
| PS | Compter, Tracer | 1 à 3 objets, chiffres 1 à 4 |
| MS | Compter, Tracer | jusqu'à 6 objets, chiffres et capitales à traits droits |
| GS | Compter, Additions, Lettres, Tracer | sommes ≤ 10 avec objets, mots courts en capitales, 1 lettre cachée, tout l'alphabet |
| CP | Additions, Lettres, Tracer | sommes ≤ 20, mots moyens en minuscules |
| CE1 → CM2 | Additions, Lettres | sommes ≤ 100 / 1 000 / 10 000 / 100 000, mots longs, 2 à 3 lettres cachées |

## Structure

```
src/
  app/                    Écrans (Expo Router)
    index.tsx             Choix de la classe
    niveau/[level].tsx    Choix de l'activité
    jeu/[level]/[activity].tsx  Série de 5 exercices, étoiles, célébration
  domain/                 Logique pure, sans React (testée)
    types.ts              Types des exercices et contrat des moteurs
    levels.ts             Programme par niveau
    generators/           Un générateur par activité
    glyphs.ts             Modèles de tracé (repère 0..100)
    tracing.ts            Vérification d'un trait
    board.ts              Placement et lâcher du glisser-déposer
    words.ts              Liste de mots
  engines/                Les 3 moteurs interactifs
  components/             Boutons animés, étoiles, célébration
  lib/feedback.ts         Voix (synthèse vocale fr-FR) et vibrations
__tests__/                Tests Jest de la logique
```

## Technologies

- **Expo SDK 57** + **Expo Router** : Android, iOS et web avec le même code
- **react-native-gesture-handler** : glisser et tracer au doigt, au stylet ou à la souris
- **react-native-reanimated 4** : animations fluides (ressorts, secousses, apparitions, explosion d'étoiles)
- **react-native-svg** : dessin du modèle et du tracé
- **expo-speech** : consignes lues à voix haute (utile aux enfants qui ne lisent pas encore)
- **expo-haptics** : vibrations de réussite ou d'erreur sur mobile

## Commandes

```bash
npm install
npm run web          # dans le navigateur (PC)
npm run android      # émulateur ou appareil Android
npm run ios          # simulateur iOS (macOS)
npm test             # tests de la logique
npm run typecheck    # vérification TypeScript
npm run export:web   # site statique dans dist/, à héberger ou à envelopper
```

Reanimated, Gesture Handler et SVG sont inclus dans Expo Go : on peut tester sur téléphone en scannant le QR code de `npm start`.

**Publier sur les stores** : `npx eas-cli@latest build -p android` / `-p ios`, puis `eas submit`.

**Application PC installable** : le dossier `dist/` produit par `npm run export:web` peut être enveloppé avec [Tauri](https://tauri.app) ou Electron. Il peut aussi être publié comme site web.

## Prochaines étapes

1. Voix enregistrées (plus chaleureuses que la synthèse vocale) et vraies illustrations libres.
2. Modèles de tracé des minuscules et de l'écriture cursive pour le CP.
3. Nouveaux générateurs réutilisant les moteurs : soustractions et tables (choix), associer image et mot (glisser-déposer).
4. Difficulté adaptative : monter de niveau après 5 réussites d'affilée, redescendre après 3 échecs.
5. Sauvegarde des progrès et espace parents protégé par un contrôle parental.
6. Conformité : RGPD (mineurs), COPPA, catégorie Enfants de l'App Store, programme Familles de Google Play (pas de publicité ni de statistiques d'audience tierces).

## Licence

À choisir par l'auteur du projet.
