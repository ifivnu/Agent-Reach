import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../components/BigButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { Stars } from '../components/Stars';
import { STICKERS } from '../domain/content/logic';
import { THEMES } from '../domain/content/vocab';
import { LEVEL_ORDER, LEVELS } from '../domain/levels';
import type { Profile, ProfileData } from '../domain/progress';
import { randInt, shuffle, defaultRng } from '../domain/random';
import { LANGUAGE_SKILLS, SUBJECT_ORDER, SUBJECT_STYLE, skillsFor } from '../domain/skills';
import type { Lang } from '../domain/types';
import { LANG_INFO, LANGS, t } from '../i18n/strings';
import { useLang, useStore } from '../state/AppStore';
import { colors, radius } from '../theme';

/** Espace parents : protégé par une question d'adulte, il montre les progrès et règle les profils. */
export default function ParentsScreen() {
  const lang = useLang();
  const [unlocked, setUnlocked] = useState(false);
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t(lang, 'parents')} />
      {unlocked ? <Dashboard /> : <Gate lang={lang} onPass={() => setUnlocked(true)} />}
    </SafeAreaView>
  );
}

/** Contrôle parental : une multiplication qu'un jeune enfant ne sait pas encore faire. */
function Gate({ lang, onPass }: { lang: Lang; onPass: () => void }) {
  const [seed, setSeed] = useState(0);
  const q = useMemo(() => {
    const a = randInt(defaultRng, 6, 9);
    const b = randInt(defaultRng, 6, 9);
    const answer = a * b;
    const choices = shuffle(defaultRng, [answer, answer + a, answer - b, answer + 10]);
    return { a, b, answer, choices };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  return (
    <View style={styles.gate}>
      <Text style={styles.gateTitle}>🔒 {t(lang, 'gateTitle')}</Text>
      <Text style={styles.gateQuestion}>{t(lang, 'gateQuestion', { a: q.a, b: q.b })}</Text>
      <View style={styles.row}>
        {q.choices.map((c) => (
          <BigButton
            key={c}
            testID={c === q.answer ? 'gate-correct' : 'gate-wrong'}
            accessibilityLabel={String(c)}
            onPress={() => (c === q.answer ? onPass() : setSeed((s) => s + 1))}
            style={styles.gateChoice}
          >
            <Text style={styles.gateChoiceText}>{c}</Text>
          </BigButton>
        ))}
      </View>
    </View>
  );
}

function Dashboard() {
  const { state } = useStore();
  const lang = useLang();
  if (state.profiles.length === 0) return <Text style={styles.empty}>{t(lang, 'noProfiles')}</Text>;
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {state.profiles.map((p) => (
        <ProfileReport key={p.id} profile={p} data={state.data[p.id]} lang={lang} />
      ))}
    </ScrollView>
  );
}

function ProfileReport({ profile, data, lang }: { profile: Profile; data: ProfileData; lang: Lang }) {
  const { updateProfile, removeProfile } = useStore();
  const [confirm, setConfirm] = useState(false);
  const languageRows = Object.entries(data.progress).filter(([key]) => key.includes(':'));

  return (
    <View style={styles.card} testID={`report-${profile.name}`}>
      <Text style={styles.cardTitle}>
        {profile.avatar} {profile.name}
      </Text>
      <Text style={styles.meta}>
        ⭐ {data.totalStars} · 🎁 {data.stickers.length}/{STICKERS.length} · 🔥 {data.streak.days}
      </Text>

      <Text style={styles.label}>{t(lang, 'grade')}</Text>
      <View style={styles.chips}>
        {LEVEL_ORDER.map((id) => (
          <Chip key={id} label={LEVELS[id].label[lang]} selected={profile.level === id} onPress={() => updateProfile(profile.id, { level: id })} />
        ))}
      </View>
      <Text style={styles.label}>{t(lang, 'uiLanguage')}</Text>
      <View style={styles.chips}>
        {LANGS.map((l) => (
          <Chip key={l} label={`${LANG_INFO[l].flag} ${LANG_INFO[l].name}`} selected={profile.lang === l} onPress={() => updateProfile(profile.id, { lang: l })} />
        ))}
      </View>

      <Text style={styles.label}>{t(lang, 'progress')}</Text>
      {SUBJECT_ORDER.filter((s) => s !== 'langues').map((s) => (
        <View key={s} style={styles.subject}>
          <Text style={[styles.subjectTitle, { backgroundColor: SUBJECT_STYLE[s].color }]}>
            {SUBJECT_STYLE[s].emoji} {t(lang, `subject.${s}`)}
          </Text>
          {skillsFor(s, profile.level).map((sk) => (
            <SkillRow key={sk.id} label={`${sk.emoji} ${sk.name[lang]}`} progress={data.progress[sk.id]} lang={lang} />
          ))}
        </View>
      ))}
      {languageRows.length > 0 ? (
        <View style={styles.subject}>
          <Text style={[styles.subjectTitle, { backgroundColor: SUBJECT_STYLE.langues.color }]}>
            {SUBJECT_STYLE.langues.emoji} {t(lang, 'subject.langues')}
          </Text>
          {languageRows.map(([key, progress]) => {
            const [skillId, target, themeId] = key.split(':');
            const sk = LANGUAGE_SKILLS.find((l) => l.id === skillId);
            const theme = THEMES.find((th) => th.id === themeId);
            if (!sk || !theme) return null;
            return (
              <SkillRow
                key={key}
                label={`${LANG_INFO[target as Lang]?.flag ?? ''} ${theme.name[lang]} · ${sk.name[lang]}`}
                progress={progress}
                lang={lang}
              />
            );
          })}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => (confirm ? removeProfile(profile.id) : setConfirm(true))}
        style={styles.delete}
      >
        <Text style={styles.deleteText}>🗑️ {t(lang, confirm ? 'confirmDelete' : 'deleteProfile')}</Text>
      </Pressable>
    </View>
  );
}

function SkillRow({ label, progress, lang }: { label: string; progress?: ProfileData['progress'][string]; lang: Lang }) {
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillName} numberOfLines={1}>
        {label}
      </Text>
      {progress ? (
        <>
          <Text style={styles.skillStat}>
            {progress.sessions} {t(lang, 'sessions')} · {Math.round((progress.firstTry / Math.max(1, progress.exercises)) * 100)} %{' '}
            {t(lang, 'success')} · {t(lang, 'difficulty')} {progress.difficulty}/3
          </Text>
          <Stars value={progress.bestStars} size={12} />
        </>
      ) : (
        <Text style={styles.skillStat}>{t(lang, 'notStarted')}</Text>
      )}
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 16, maxWidth: 900, width: '100%', alignSelf: 'center' },
  empty: { textAlign: 'center', fontSize: 18, color: colors.textMuted, marginTop: 40 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 },
  gateTitle: { fontSize: 26, fontWeight: '900', color: colors.text },
  gateQuestion: { fontSize: 36, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  gateChoice: { minWidth: 90 },
  gateChoiceText: { fontSize: 28, fontWeight: '800', color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 8 },
  cardTitle: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { fontSize: 16, color: colors.textMuted },
  label: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.slot },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  subject: { gap: 4, marginTop: 4 },
  subjectTitle: { fontSize: 16, fontWeight: '800', color: colors.text, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.slot },
  skillName: { fontSize: 15, fontWeight: '700', color: colors.text, minWidth: 180, flexShrink: 1 },
  skillStat: { fontSize: 13, color: colors.textMuted, flex: 1, minWidth: 160 },
  delete: { alignSelf: 'flex-start', marginTop: 12, padding: 10 },
  deleteText: { color: '#C62828', fontWeight: '800' },
});
