import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';
import { Banner, Btn, Icon, s as ui } from './PharmacyUI';

/** Local-only prescription image attachment. Never uploaded anywhere. */
export function PrescriptionPicker({ uri, onChange, disabled, compact }: {
  uri: string | null; onChange: (uri: string | null) => void; disabled?: boolean; compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const pick = async () => {
    if (busy || disabled) return;
    setError(null); setNote(null); setDenied(false);
    setBusy(true);
    try {
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setDenied(!perm.canAskAgain);
          setError('لم يُسمح بالوصول إلى الصور. يمكنك السماح من إعدادات الجهاز ثم المحاولة مرة أخرى.');
          return;
        }
      }
      // On web this runs directly inside the press gesture (no prior permission prompt).
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (result.canceled || !result.assets?.[0]?.uri) { setNote('لم يتم اختيار صورة.'); return; }
      onChange(result.assets[0].uri);
    } catch {
      setError('تعذر فتح معرض الصور. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };

  if (uri) {
    return (
      <View style={styles.attached}>
        <View style={styles.row}>
          <Image source={{ uri }} style={styles.preview} accessibilityLabel="معاينة صورة الروشتة المرفقة" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={ui.strong}>صورة الروشتة مرفقة</Text>
            <Text style={ui.label}>تبقى الصورة على جهازك فقط ولا تُرفع. ستحتاج لإرفاقها مجددًا بعد إعادة فتح التطبيق. سعر أدوية الروشتة تحدده الصيدلية بعد المراجعة.</Text>
          </View>
        </View>
        <Btn testID="prescription-remove" label="إزالة الصورة" variant="ghost" icon="close" disabled={disabled} onPress={() => onChange(null)} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {compact ? (
        <Pressable testID="prescription-pick" accessibilityRole="button" accessibilityLabel="عندك روشتة؟ ارفع صورتها"
          accessibilityState={{ disabled: !!disabled || busy, busy }} disabled={disabled || busy} onPress={pick}
          style={({ pressed }) => [styles.link, (disabled || busy) && ui.disabled, pressed && ui.pressed]}>
          <Icon name="doc" size={18} />
          <Text style={styles.linkText}>{busy ? 'جارٍ فتح الصور…' : 'عندك روشتة؟ ارفع صورتها'}</Text>
        </Pressable>
      ) : (
        <Pressable testID="prescription-pick" accessibilityRole="button" accessibilityLabel="مش لاقي الدوا؟ ارفع صورة الروشتة"
          accessibilityState={{ disabled: !!disabled || busy, busy }} disabled={disabled || busy} onPress={pick}
          style={({ pressed }) => [styles.card, (disabled || busy) && ui.disabled, pressed && ui.pressed]}>
          <View style={styles.docCircle}><Icon name="doc" size={20} /></View>
          <View style={{ flex: 1 }}>
            <Text style={ui.strong}>مش لاقي الدوا؟</Text>
            <Text style={ui.label}>ارفع صورة الروشتة والصيدلية هتراجعها</Text>
          </View>
          <Text style={styles.linkText}>{busy ? '…' : 'ارفع'}</Text>
        </Pressable>
      )}
      {note ? <Text style={[ui.label, { textAlign: 'center' }]}>{note}</Text> : null}
      {error ? <Banner tone="danger">{error}</Banner> : null}
      {denied && Platform.OS !== 'web' ? <Btn label="فتح الإعدادات" variant="outline" onPress={() => { void Linking.openSettings(); }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'center' },
  attached: { backgroundColor: colors.primarySoftBg, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  preview: { width: 64, height: 80, borderRadius: 10, backgroundColor: colors.surface },
  link: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 },
  linkText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
  card: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primarySoftBg, borderRadius: radius.md, padding: spacing.lg },
  docCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
