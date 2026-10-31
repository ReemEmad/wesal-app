import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, fonts, radius } from '../theme';
import { FigmaIcon } from './FigmaIcon';

/**
 * White pill search field with the icon on the right. Pass `onPress` for a read-only
 * entry point that opens the search screen; otherwise it is an editable input.
 */
export function SearchField({
  placeholder,
  value,
  onChangeText,
  onPress,
  autoFocus,
  focused,
}: {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  autoFocus?: boolean;
  focused?: boolean;
}) {
  const content = (
    <>
      {onPress ? (
        <Text style={styles.placeholder}>{placeholder}</Text>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoFocus={autoFocus}
          textAlign="right"
          returnKeyType="search"
        />
      )}
      <FigmaIcon name="icon_search" size={22} />
    </>
  );

  const style = [styles.field, focused && styles.focused];

  return onPress ? (
    <TouchableOpacity style={style} onPress={onPress} accessibilityRole="search" accessibilityLabel={placeholder}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={style}>{content}</View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  focused: {
    borderColor: colors.primary,
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
});
