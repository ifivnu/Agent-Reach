# Apprendre en jouant · Learn Through Play · Aprann an jwe

Application d'apprentissage pour enfants de 3 à 11 ans (de la petite section au CM2). Elle se joue au doigt, au stylet ou à la souris et fonctionne sur **Android, iOS et PC** (navigateur ou application installable) avec une seule base de code **Expo / React Native**.

- **Interface en 3 langues :** français, anglais et kreyòl ayisyen, au choix pour chaque enfant.
- **5 matières :** Maths, Lecture, Logique et bon sens, Agilité, Langues.
- **22 activités**, réglées selon la classe, avec une **difficulté qui s'adapte** à l'enfant.
- **Parcours de classe** façon programme scolaire, avec étoiles, **album d'autocollants** et série de jours joués.
- **Plusieurs profils enfants** et un **espace parents** protégé, avec le suivi des progrès.

## Contenu : tout est original

Les fiches des sites d'exercices, comme kiddoworksheets.com, sont protégées. Le principe de programmes comme AdaptedMind (parcours par classe, difficulté adaptative, récompenses, rapports aux parents) est repris ici comme *idée* seulement : aucun contenu n'en est copié.

- Les exercices de calcul, de suites, de lettres, etc. sont **générés par le code**.
- Le vocabulaire trilingue (`src/domain/content/vocab.ts`), les catégories, les associations et les histoires (`logic.ts`) ont été écrits pour ce projet.
- Les modèles de tracé des chiffres et des capitales (`glyphs.ts`) sont des coordonnées dessinées pour ce projet.
- Les images sont des emoji Unicode, à remplacer par des illustrations libres ([Kenney](https://kenney.nl) en CC0, [OpenMoji](https://openmoji.org) en CC BY-SA) ou faites maison.

> **Kreyòl :** les textes et le vocabulaire suivent la graphie officielle. Ils sont **à faire relire par un enseignant ou une enseignante haïtienne** avant publication.

## Programme

| Matière | Activités | Classes |
|---|---|---|
| 🔢 **Maths** | Compter · Tracer les chiffres · Suites de nombres · Comparer (<, =, >) · Additions · Soustractions · Tables de multiplication | PS → CM2 |
| 📚 **Lecture** | Tracer les lettres · Première lettre · Lire un mot · Mot mélangé · Lettres manquantes | MS → CM2 |
| 🧠 **Logique et bon sens** | Suites logiques · Qu'est-ce qui va avec ? · Remettre en ordre · Trouve l'intrus | PS → CM2 |
| ⚡ **Agilité** | Mémoire · Attrape-les ! (réflexes et attention) | PS → CM2 |
| 🌍 **Langues** (français, anglais, kreyòl) | Écoute et choisis · Comment ça s'appelle ? · Mémoire des mots · Épeler | 7 thèmes : animaux, couleurs, nombres, nourriture, corps, famille, autour de moi |

La même activité grandit avec l'enfant :

- **Attrape-les** fait toucher des images en PS, des lettres qui se ressemblent (B, D, P, R) en GS, puis les nombres pairs, les calculs qui font 10 ou les multiples de 7 en CE et CM.
- **Mémoire** associe des images identiques chez les petits, puis un calcul à son résultat (« 7 + 5 » ↔ « 12 ») à partir du CE1.
- **Remettre en ordre** fait ranger des histoires en images (œuf → poussin → poule), puis des nombres dans l'ordre croissant ou décroissant.

### Difficulté adaptative et récompenses

- Chaque activité a une difficulté de 1 à 3. Elle **monte** après une série réussie à 80 % du premier coup et **redescend** sous 50 %.
- Une série rapporte 1 à 3 étoiles et **un autocollant** (40 à collectionner).
- Le **parcours** entremêle les matières de la classe et met en avant la prochaine compétence à travailler (« À toi ! »).
- L'**espace parents** s'ouvre avec une multiplication. Il montre, pour chaque compétence, le nombre de séries, le taux de réussite du premier coup, la difficulté et les étoiles. On peut aussi y changer la classe ou la langue d'un profil.

## Les 6 moteurs

Chaque moteur affiche un exercice (une simple donnée) et signale `onSolved` / `onMistake`. Ajouter une activité revient à écrire un générateur.

| Moteur | Fichier | Utilisé par |
|---|---|---|
| Choix multiple | `src/engines/ChoiceEngine.tsx` | Calcul, comparer, suites, intrus, va avec, lire, première lettre, écoute, nommer |
| Glisser-déposer | `src/engines/DragDropEngine.tsx` | Lettres manquantes, épeler |
| Tracé | `src/engines/TraceEngine.tsx` | Chiffres et lettres (vérifie le départ, la couverture, la précision, et refuse les gribouillis) |
| Mémoire | `src/engines/MemoryEngine.tsx` | Mémoire, mémoire des mots |
| Remettre en ordre | `src/engines/SequenceEngine.tsx` | Histoires, nombres à classer, mot mélangé |
| Attrape-les | `src/engines/TapTargetsEngine.tsx` | Réflexes : cibles qui apparaissent et disparaissent |

## Structure

```
src/
  app/                      Écrans (Expo Router)
    index.tsx               Qui joue ? (profils)
    profil.tsx              Nouveau profil : langue, prénom, personnage, classe
    accueil.tsx             Accueil de l'enfant : étoiles, série de jours, matières
    matiere/[subject].tsx   Activités d'une matière
    langues/…               Langue étudiée → thème → activité
    jeu/[skill].tsx         Série d'exercices, célébration, étoiles, autocollant
    parcours.tsx            Parcours de la classe
    album.tsx               Album d'autocollants
    parents.tsx             Contrôle parental + tableau de bord
  domain/                   Logique pure, sans React (testée)
    skills.ts               Registre des activités par matière et par classe
    generators/             Maths, lecture, logique, agilité, langues
    content/                Vocabulaire trilingue, contenus de logique, autocollants
    progress.ts             Profils, étoiles, difficulté adaptative, série de jours
    levels.ts               Classes PS → CM2 (équivalents US et Haïti)
  i18n/strings.ts           Tous les textes en fr / en / ht
  engines/                  Les 6 moteurs interactifs
  state/AppStore.tsx        État de l'application, sauvegardé sur l'appareil
  lib/feedback.ts           Voix multilingue et vibrations
__tests__/                  227 tests Jest
e2e/                        Parcours complet dans un vrai navigateur (Playwright)
```

## Commandes

```bash
npm install
npm run web          # dans le navigateur (PC)
npm start            # QR code à scanner avec Expo Go (Android / iOS)
npm test             # 227 tests de la logique
npm run typecheck    # vérification TypeScript
npm run export:web   # site statique dans dist/
```

Test de bout en bout (3 profils, 3 langues, 6 moteurs, captures dans `e2e/captures/`) :

```bash
npm i -D playwright && npx playwright install chromium
npm run export:web && node e2e/serve.mjs dist &
node --experimental-strip-types e2e/parcours.mjs
```

**Publier :** `npx eas-cli@latest build -p android` / `-p ios`, puis `eas submit`. Pour une application PC installable, envelopper `dist/` avec [Tauri](https://tauri.app) ou Electron.

## Voix et kreyòl

Les consignes sont lues par la synthèse vocale de l'appareil (`expo-speech`). Les voix françaises et anglaises existent presque partout. **Il n'existe en général pas de voix kreyòl** sur Android, iOS ou Windows. Dans ce cas, l'application affiche le mot à lire à la place du haut-parleur.

Pour les enfants qui ne lisent pas encore, la prochaine étape est d'**enregistrer les mots et les consignes kreyòl** (fichiers audio), puis de les brancher dans `src/lib/feedback.ts` (fonction `say`), à la place de la synthèse vocale quand un enregistrement existe.

## Prochaines étapes

1. Enregistrements audio kreyòl (et voix humaines chaleureuses en français et en anglais).
2. Relecture pédagogique des contenus, surtout en kreyòl, et vraies illustrations libres.
3. Tracé des minuscules et de l'écriture cursive ; nouveaux thèmes de vocabulaire (école, nature, métiers, verbes).
4. Plus d'activités : heure et monnaie (gourdes, dollars, euros), fractions, compréhension de phrases, labyrinthes.
5. Synchronisation facultative entre appareils et rapport hebdomadaire pour les parents.
6. Conformité : RGPD (mineurs), COPPA, catégorie Enfants de l'App Store, programme Familles de Google Play. Aujourd'hui, aucune donnée ne quitte l'appareil.

## Licence

À choisir par l'auteur du projet.
