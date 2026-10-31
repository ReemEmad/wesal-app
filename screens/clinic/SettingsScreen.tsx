import { CommonActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OutlineButton } from '../../components/Buttons';
import { TabHeader } from '../../components/TabHeader';
import { colors, fonts, spacing } from '../../theme';

export default function SettingsScreen() {
  const navigation = useNavigation();

  const switchRole = () =>
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'RoleSelect' }] }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <TabHeader title="الإعدادات" />
        <Text style={styles.note}>إعدادات العيادة ستتوفر هنا.</Text>
      </View>
      <View style={styles.footer}>
        <OutlineButton label="تبديل نوع الحساب" onPress={switchRole} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'right',
  },
  footer: {
    padding: spacing.lg,
  },
});
