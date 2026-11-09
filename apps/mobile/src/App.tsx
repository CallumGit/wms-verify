import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { CORE_VERSION } from '@wms/core';

// Minimalny ekran startowy (Obszar 0). Nawigacja, i18n i właściwe ekrany
// pojawią się od Obszaru 11.
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WMS Verify</Text>
      <Text style={styles.subtitle}>Weryfikacja wysyłek magazynowych</Text>
      <Text style={styles.version}>core v{CORE_VERSION}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#555', marginTop: 8 },
  version: { fontSize: 12, color: '#999', marginTop: 24 },
});
