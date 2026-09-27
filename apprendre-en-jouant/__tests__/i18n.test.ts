import { firstGrapheme } from '../src/domain/content/vocab';
import { LANGS, STRINGS, t } from '../src/i18n/strings';

describe('traductions', () => {
  it('chaque texte existe et garde les mêmes paramètres dans les 3 langues', () => {
    const params = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    for (const key of Object.keys(STRINGS.fr) as (keyof typeof STRINGS.fr)[]) {
      for (const lang of LANGS) {
        expect(STRINGS[lang][key]?.trim()).toBeTruthy();
        expect(params(STRINGS[lang][key])).toBe(params(STRINGS.fr[key]));
      }
    }
  });

  it('remplace les paramètres', () => {
    expect(t('ht', 'i.add', { a: 2, b: 3 })).toBe('Konbyen 2 plis 3 fè?');
    expect(t('en', 'hello', { name: 'Ana' })).toBe('Hello Ana!');
  });
});

describe('firstGrapheme', () => {
  it('reconnaît les digrammes kreyòl', () => {
    expect(firstGrapheme('chat', 'ht')).toBe('ch');
    expect(firstGrapheme('chen', 'ht')).toBe('ch');
    expect(firstGrapheme('pwason', 'ht')).toBe('p');
    expect(firstGrapheme('chat', 'fr')).toBe('c');
    expect(firstGrapheme('œil', 'fr')).toBe('œ');
  });
});
