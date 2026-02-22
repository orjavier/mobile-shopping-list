import { StyleSheet, View } from 'react-native';

import CustomTabBar, { TAB_TOTAL } from '@/components/CustomTabBar';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View as ThemedView } from '@/components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <ThemedView style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />

      {/* ── Custom Tab Bar ── */}
      <CustomTabBar activeRoute="/(tabs)/two" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: TAB_TOTAL,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
