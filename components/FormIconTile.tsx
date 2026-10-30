import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { DosageForm, getDosageForm } from '../constants/dosageForms';

export function FormIconTile({
  form,
  width,
  height,
  radius = 14,
}: {
  form: DosageForm;
  width: number;
  height: number;
  radius?: number;
}) {
  const config = getDosageForm(form);
  return (
    <View style={[styles.tile, { width, height, borderRadius: radius, backgroundColor: config.tint }]}>
      <MaterialCommunityIcons name={config.icon} size={Math.round(Math.min(width, height) * 0.5)} color={config.iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
