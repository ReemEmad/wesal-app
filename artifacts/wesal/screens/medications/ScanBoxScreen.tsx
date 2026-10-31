import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoundButton } from '../../components/Buttons';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';

export default function ScanBoxScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ScanBox'>) {
  const focused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);

  const goToForm = () => navigation.navigate('MedicationForm');

  const capture = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try {
      await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      goToForm();
    } catch {
      Alert.alert('تعذّر التصوير', 'حاول مرة أخرى أو اختر صورة من المعرض.');
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) goToForm();
  };

  const renderViewfinder = () => {
    if (!permission) return null;
    if (!permission.granted) {
      return (
        <View style={styles.permission}>
          <Text style={styles.permissionText}>نحتاج إذنك لاستخدام الكاميرا حتى نصوّر علبة الدواء.</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
            accessibilityRole="button"
          >
            <Text style={styles.permissionButtonText}>
              {permission.canAskAgain ? 'السماح بالكاميرا' : 'فتح الإعدادات'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return focused ? (
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        onCameraReady={() => setReady(true)}
      />
    ) : null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {focused ? <StatusBar style="light" /> : null}

      <View style={styles.topRow}>
        <RoundButton icon="close" label="إغلاق" size={44} color={colors.text} onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>صوّر علبة الدواء</Text>
        <View style={styles.viewfinder}>
          {renderViewfinder()}
          <View pointerEvents="none" style={styles.dashed} />
        </View>
        <Text style={styles.hint}>ضع العلبة داخل الإطار وثبّت الهاتف لحظة</Text>
      </View>

      <View style={styles.controls}>
        <RoundButton
          icon={torch ? 'flash' : 'flash-outline'}
          label="الفلاش"
          size={52}
          color={colors.text}
          onPress={() => setTorch((value) => !value)}
        />
        <TouchableOpacity style={styles.shutterRing} onPress={capture} accessibilityRole="button" accessibilityLabel="التقاط">
          <View style={styles.shutter} />
        </TouchableOpacity>
        <RoundButton icon="image-outline" label="المعرض" size={52} color={colors.text} onPress={pickFromGallery} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.camera,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.surface,
    textAlign: 'center',
  },
  viewfinder: {
    width: 300,
    height: 300,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#2C2B31',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.cameraAccent,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.surface,
    textAlign: 'center',
  },
  permission: {
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  permissionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.surface,
    textAlign: 'center',
  },
  permissionButton: {
    paddingHorizontal: spacing.xl,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  shutterRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
  },
});
