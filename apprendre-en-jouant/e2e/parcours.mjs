/*
 * Parcours complet dans un vrai navigateur (Chromium) : 3 profils, 3 langues, les 6 moteurs.
 *
 *   npm i -D playwright && npx playwright install chromium   (une seule fois)
 *   npm run export:web
 *   node e2e/serve.mjs dist &          # sert le site sur http://localhost:8765
 *   node --experimental-strip-types e2e/parcours.mjs
 *
 * Les captures d'écran sont écrites dans e2e/captures/.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const APP = process.cwd();
const SHOTS = path.join(APP, 'e2e', 'captures');
fs.mkdirSync(SHOTS, { recursive: true });
const { GLYPHS } = await import(`${APP}/src/domain/glyphs.ts`);
const BASE = 'http://localhost:8765';

const browser = await chromium.launch();
const errors = [];
const log = (...a) => console.log(...a);
async function newPage(viewport, context) {
  const ctx = context ?? (await browser.newContext({ viewport }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  return { page, ctx };
}
const tid = (id) => `[data-testid="${id}"]`;
const center = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
const stars = async (page) => Number((await page.locator(tid('starbar')).getAttribute('aria-label')).split('/')[0]);
const waitStars = (page, n) => page.waitForFunction((n) => {
  const el = document.querySelector('[data-testid="starbar"]');
  return !el || Number(el.getAttribute('aria-label').split('/')[0]) >= n;
}, n, { timeout: 15000 });

async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(450);
}
function resample(stroke, step) {
  const out = [stroke[0]];
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1], b = stroke[i];
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
    for (let k = 1; k <= n; k++) out.push({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n });
  }
  return out;
}

const ENGINES = ['choice-correct', 'tile-', 'trace-canvas', 'card-', 'seq-', 'tap-area'];
async function detect(page) {
  const sel = ENGINES.map((e) => (e.endsWith('-') ? `[data-testid^="${e}"]` : tid(e))).join(',');
  await page.locator(sel).first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(600);
  for (const e of ENGINES) {
    const loc = e.endsWith('-') ? page.locator(`[data-testid^="${e}"]`) : page.locator(tid(e));
    if (await loc.count()) return e;
  }
}

/** Joue un exercice selon le moteur affiché. `mistake` : commencer par une erreur quand c'est possible. */
async function playExercise(page, mistake) {
  const engine = await detect(page);
  const before = await stars(page);
  if (engine === 'choice-correct') {
    if (mistake) {
      await page.locator(tid('choice-wrong')).first().click();
      await page.waitForTimeout(300);
      if ((await stars(page)) !== before) throw new Error('mauvaise réponse acceptée');
    }
    await page.locator(tid('choice-correct')).click();
  } else if (engine === 'tile-') {
    const slots = page.locator('[data-testid^="slot-"]');
    const n = await slots.count();
    for (let s = 0; s < n; s++) {
      if ((await slots.nth(s).innerText()).trim() !== '') continue;
      const target = center(await slots.nth(s).boundingBox());
      const tiles = page.locator('[data-testid^="tile-"]');
      let placed = false;
      for (let t = 0; t < (await tiles.count()) && !placed; t++) {
        const box = await tiles.nth(t).boundingBox();
        if (box.y < target.y + 30) continue;
        await drag(page, center(box), target);
        const after = await tiles.nth(t).boundingBox();
        placed = Math.abs(center(after).x - target.x) < 6 && Math.abs(center(after).y - target.y) < 6;
      }
      if (!placed) throw new Error('aucune lettre acceptée');
    }
  } else if (engine === 'trace-canvas') {
    const canvas = page.locator(tid('trace-canvas'));
    const label = await canvas.getAttribute('aria-label');
    const glyph = label.match(/(?:lèt|chif|letter|number|lettre|chiffre) (\S)/)[1];
    const box = await canvas.boundingBox();
    for (const stroke of GLYPHS[glyph]) {
      const pts = resample(stroke, 3).map((p) => ({ x: box.x + p.x / 100 * box.width, y: box.y + p.y / 100 * box.height }));
      await page.mouse.move(pts[0].x, pts[0].y);
      await page.mouse.down();
      for (const p of pts.slice(1)) await page.mouse.move(p.x, p.y);
      await page.mouse.up();
      await page.waitForTimeout(250);
    }
  } else if (engine === 'card-') {
    const ids = [...new Set(await page.locator('[data-testid^="card-"]').evaluateAll((els) => els.map((e) => e.dataset.testid)))];
    if (mistake && ids.length > 1) {
      await page.locator(tid(ids[0])).first().click();
      await page.locator(tid(ids[1])).first().click();
      await page.waitForTimeout(1100);
    }
    for (const id of ids) {
      await page.locator(tid(id)).nth(0).click();
      await page.locator(tid(id)).nth(1).click();
      await page.waitForTimeout(350);
    }
  } else if (engine === 'seq-') {
    const n = await page.locator('[data-testid^="seq-"]').count();
    if (mistake) {
      await page.locator(tid(`seq-${n - 1}`)).click();
      await page.waitForTimeout(300);
    }
    for (let i = 0; i < n; i++) {
      await page.locator(tid(`seq-${i}`)).click();
      await page.waitForTimeout(250);
    }
  } else if (engine === 'tap-area') {
    const deadline = Date.now() + 40000;
    let wrongDone = !mistake;
    while (Date.now() < deadline && (await stars(page)) === before) {
      if (!wrongDone && (await page.locator(tid('tt-no')).count())) {
        await page.locator(tid('tt-no')).first().click({ force: true, timeout: 500 }).catch(() => {});
        wrongDone = true;
      }
      const yes = page.locator(tid('tt-yes'));
      if (await yes.count()) await yes.first().click({ force: true, timeout: 500 }).catch(() => {});
      else await page.waitForTimeout(100);
    }
  }
  try {
    await waitStars(page, before + 1);
  } catch (e) {
    await page.screenshot({ path: `${SHOTS}/ECHEC-${engine}.png` });
    console.log('ÉCHEC sur', engine, 'étoiles avant =', before, 'URL', page.url());
    console.log(await page.locator('body').innerText());
    throw e;
  }
  return engine;
}

async function playSession(page, name, shotEvery = false) {
  const engines = new Set();
  for (let i = 0; ; i++) {
    if (await page.locator(tid('replay')).count()) break;
    const e = await playExercise(page, i === 0);
    engines.add(e);
    if (i === 0 && shotEvery) await page.screenshot({ path: `${SHOTS}/${name}.png` });
    await page.waitForTimeout(1600);
  }
  await page.locator(tid('replay')).waitFor();
  await page.waitForTimeout(1800);
  return engines;
}

// ───────── Profil 1 : Ana, kreyòl, Preskolè 3 (GS), tablette paysage
const { page, ctx } = await newPage({ width: 1180, height: 820 });
await page.goto(BASE);
await page.locator(tid('name-input')).waitFor();
await page.locator(tid('lang-ht')).click();
await page.locator(tid('name-input')).fill('Ana');
await page.locator(tid('level-GS')).click();
await page.screenshot({ path: `${SHOTS}/01-nouveau-profil-kreyol.png` });
await page.locator(tid('create')).click();
await page.getByText('Bonjou Ana!').first().waitFor();
await page.waitForTimeout(800);
await page.screenshot({ path: `${SHOTS}/02-accueil-kreyol.png` });
log('OK profil kreyòl créé, accueil en kreyòl');

const played = [];
async function playSkill(subject, skill, shot) {
  await page.goto(`${BASE}/accueil`);
  await page.locator(tid(`subject-${subject}`)).click();
  await page.locator(tid(`skill-${skill}`)).click();
  const engines = await playSession(page, shot, true);
  await page.screenshot({ path: `${SHOTS}/${shot}-fin.png` });
  played.push(`${skill} [${[...engines].join(',')}]`);
}
await playSkill('maths', 'additions', '03-additions');
await playSkill('maths', 'chiffres', '04-tracer-chiffres');
await playSkill('lecture', 'lettres-manquantes', '05-lettres-manquantes');
await playSkill('lecture', 'premiere-lettre', '06-premiere-lettre');
await playSkill('logique', 'suites-logiques', '07-suites-logiques');
await playSkill('logique', 'intrus', '08-intrus');
await playSkill('logique', 'ordre', '09-remettre-en-ordre');
await playSkill('logique', 'va-avec', '10-va-avec');
await playSkill('agilite', 'memoire', '11-memoire');
await playSkill('agilite', 'attrape', '12-attrape');
log('OK séries jouées :', played.join(' · '));

// Langues : anglais, animaux
const langPlayed = [];
for (const [skill, shot] of [['ecouter', '13-langue-ecouter'], ['nommer', '14-langue-nommer'], ['memoire-mots', '15-langue-memoire'], ['epeler', '16-langue-epeler']]) {
  await page.goto(`${BASE}/langues`);
  await page.locator(tid('target-en')).click();
  await page.locator(tid('theme-animaux')).click();
  if (skill === 'ecouter') await page.screenshot({ path: `${SHOTS}/13a-langues-activites.png` });
  await page.locator(tid(`skill-${skill}`)).click();
  const engines = await playSession(page, shot, true);
  langPlayed.push(`${skill} [${[...engines].join(',')}]`);
}
log('OK langues (anglais / animaux) :', langPlayed.join(' · '));

// Parcours et album
await page.goto(`${BASE}/parcours`);
await page.locator(tid('path-next')).waitFor();
await page.waitForTimeout(900);
await page.screenshot({ path: `${SHOTS}/17-parcours.png`, fullPage: true });
await page.goto(`${BASE}/album`);
await page.getByText(/\d+ \/ 40 etikèt/).waitFor();
const albumText = await page.getByText(/\d+ \/ 40 etikèt/).innerText();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${SHOTS}/18-album.png` });
log(`OK parcours affiché, album : ${albumText}`);

// Sauvegarde : rechargement complet
await page.goto(BASE);
await page.locator(tid('profile-Ana')).waitFor();
log('OK profil retrouvé après rechargement (sauvegarde locale)');

// ───────── Profil 2 : Leo, anglais, Grade 4 (CM1), téléphone
const phone = await newPage({ width: 390, height: 844 }, await browser.newContext({ viewport: { width: 390, height: 844 } }));
const p2 = phone.page;
// Même stockage que le profil 1 ? Non : nouveau contexte = nouvel appareil.
await p2.goto(BASE);
await p2.locator(tid('name-input')).waitFor();
await p2.locator(tid('lang-en')).click();
await p2.locator(tid('name-input')).fill('Leo');
await p2.locator(tid('level-CM1')).click();
await p2.locator(tid('create')).click();
await p2.getByText('Hello Leo!').first().waitFor();
await p2.waitForTimeout(700);
await p2.screenshot({ path: `${SHOTS}/19-home-english-phone.png` });
const leo = [];
for (const [subject, skill, shot] of [
  ['maths', 'multiplications', '20-times-tables-phone'],
  ['agilite', 'attrape', '21-catch-phone'],
  ['agilite', 'memoire', '22-memory-sums-phone'],
  ['lecture', 'mot-melange', '23-word-scramble-phone'],
  ['logique', 'ordre', '24-order-phone'],
]) {
  await p2.goto(`${BASE}/accueil`);
  await p2.locator(tid(`subject-${subject}`)).click();
  await p2.locator(tid(`skill-${skill}`)).click();
  const engines = await playSession(p2, shot, true);
  leo.push(`${skill} [${[...engines].join(',')}]`);
}
log('OK profil anglais CM1 sur téléphone :', leo.join(' · '));

// Difficulté adaptative : après une série parfaite, la difficulté monte.
await p2.goto(`${BASE}/parents`);
await p2.locator(tid('gate-wrong')).first().click();
await p2.locator(tid('gate-correct')).click();
await p2.locator(tid('report-Leo')).waitFor();
const report = await p2.locator(tid('report-Leo')).innerText();
if (!/Difficulty 2\/3/.test(report)) throw new Error('la difficulté aurait dû monter après une série réussie');
await p2.screenshot({ path: `${SHOTS}/25-parents-phone.png`, fullPage: true });
log('OK espace parents (contrôle parental, rapport, difficulté adaptée à 2/3)');

// Espace parents du profil 1 (tablette)
await page.goto(`${BASE}/parents`);
await page.locator(tid('gate-correct')).click();
await page.locator(tid('report-Ana')).waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOTS}/26-parents-tablette.png`, fullPage: true });

// ───────── Profil 3 : interface française, apprend le kreyòl (fruits et repas)
const third = await newPage({ width: 1024, height: 768 }, await browser.newContext({ viewport: { width: 1024, height: 768 } }));
const p3 = third.page;
await p3.goto(BASE);
await p3.locator(tid('name-input')).fill('Maya');
await p3.locator(tid('level-CP')).click();
await p3.locator(tid('create')).click();
await p3.getByText('Bonjour Maya !').first().waitFor();
const ht = [];
for (const [skill, shot] of [['ecouter', '27-kreyol-ecouter-sans-voix'], ['nommer', '28-kreyol-nommer'], ['epeler', '29-kreyol-epeler'], ['memoire-mots', '30-kreyol-memoire']]) {
  await p3.goto(`${BASE}/langues`);
  await p3.locator(tid('target-ht')).click();
  await p3.locator(tid('theme-nourriture')).click();
  await p3.locator(tid(`skill-${skill}`)).click();
  if (skill === 'ecouter') {
    // Sans voix kreyòl installée, le mot doit s'afficher à la place du haut-parleur.
    await p3.getByText('Pas de voix sur cet appareil : lis le mot.').waitFor();
  }
  const engines = await playSession(p3, shot, true);
  ht.push(`${skill} [${[...engines].join(',')}]`);
}
log('OK kreyòl appris depuis une interface française :', ht.join(' · '));

await browser.close();
const real = errors.filter((e) => !/speech|synthesis|voices/i.test(e));
console.log(real.length ? `ERREURS NAVIGATEUR (${real.length}) :\n${[...new Set(real)].slice(0, 15).join('\n')}` : 'Aucune erreur dans la console du navigateur');
