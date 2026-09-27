import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../components/BigButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { LEVEL_ORDER, LEVELS } from '../domain/levels';
import { AVATARS } from '../domain/progress';
import type { Lang, LevelId } from '../domain/types';
import { LANG_INFO, LANGS, t } from '../i18n/strings';
import { useStore } from '../state/AppStore';
import { colors, radius } from '../theme';

/** Création d'un profil enfant : prénom, personnage, classe et langue de l'application. */
export default function NewProfile() {
  const { addProfile, state } = useStore();
  const [lang, setLang] = useState<Lang>('fr');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [level, setLevel] = useState<LevelId>('GS');
  const valid = name.trim().length > 0;

  const create = () => {
    if (!valid) return;
    addProfile({ name: name.trim(), avatar, level, lang });
    router.replace('/accueil');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {state.profiles.length > 0 ? <ScreenHeader title={t(lang, 'newProfile')} /> : null}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {state.profiles.length === 0 ? <Text style={styles.title}>{t(lang, 'appTitle')}</Text> : null}

        <Section label={t(lang, 'uiLanguage')}>
          {LANGS.map((l) => (
            <Chip key={l} testID={`lang-${l}`} selected={l === lang} onPress={() => setLang(l)} label={`${LANG_INFO[l].flag} ${LANG_INFO[l].name}`} />
          ))}
        </Section>

        <Section label={t(lang, 'name')}>
          <TextInput
            testID="name-input"
            value={name}
            onChangeText={setName}
            placeholder={t(lang, 'namePlaceholder')}
            maxLength={20}
            style={styles.input}
            onSubmitEditing={create}
          />
        </Section>

        <Section label={t(lang, 'avatar')}>
          {AVATARS.map((a) => (
            <Chip key={a} selected={a === avatar} onPress={() => setAvatar(a)} label={a} big />
          ))}
        </Section>

        <Section label={t(lang, 'chooseClass')}>
          {LEVEL_ORDER.map((id) => (
            <Chip key={id} testID={`level-${id}`} selected={id === level} onPress={() => setLevel(id)} label={LEVELS[id].label[lang]} color={LEVELS[id].color} />
          ))}
        </Section>

        <BigButton testID="create" accessibilityLabel={t(lang, 'create')} onPress={create} disabled={!valid} color={valid ? colors.primary : colors.guide} style={styles.create}>
          <Text style={styles.createText}>{t(lang, 'create')} ✨</Text>
        </BigButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({ label, selected, onPress, big, color, testID }: { label: string; selected: boolean; onPress: () => void; big?: boolean; color?: string; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: color ?? colors.surface }, selected && styles.chipSelected]}
    >
      <Text style={big ? styles.chipBig : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 20, maxWidth: 760, width: '100%', alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 12 },
  section: { gap: 10 },
  label: { fontSize: 20, fontWeight: '800', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 3, borderColor: 'transparent', minHeight: 52, justifyContent: 'center' },
  chipSelected: { borderColor: colors.primary },
  chipText: { fontSize: 17, fontWeight: '700', color: colors.text },
  chipBig: { fontSize: 36 },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, fontSize: 24, padding: 14, color: colors.text },
  create: { alignSelf: 'center', paddingHorizontal: 40, marginTop: 8 },
  createText: { fontSize: 24, fontWeight: '900', color: '#fff' },
});
