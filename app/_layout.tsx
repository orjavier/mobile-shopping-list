import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import Toast from '@/toast';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

SplashScreen.preventAutoHideAsync();

const ONBOARDING_SEEN_KEY = 'onboarding_seen';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    Feather: require('@/assets/fonts/feather.ttf'),
    SF: require('@/assets/fonts/SFUIText-Light.ttf'),
    ...FontAwesome.font,
  });

  const { isAuthenticated } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY)
      .then(val => setHasSeenOnboarding(val === 'true'))
      .catch(() => setHasSeenOnboarding(false));
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded || hasSeenOnboarding === null) return;

    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => { });
    }, 100);

    const rootSegment = segments[0];

    if (isAuthenticated) {
      if (!rootSegment || rootSegment === 'login' || rootSegment === 'register' || rootSegment === 'onboarding') {
        router.replace('/(tabs)');
      }
    } else {
      if (hasSeenOnboarding) {
        if (!rootSegment || rootSegment === '(tabs)' || rootSegment === 'onboarding') {
          router.replace('/login');
        }
      } else {
        if (rootSegment !== 'onboarding') {
          router.replace('/onboarding');
        }
      }
    }
  }, [loaded, hasSeenOnboarding, isAuthenticated, segments]);

  if (!loaded || hasSeenOnboarding === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
      <Toast />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { theme } = useThemeStore();
  
  const resolvedTheme = theme === 'system' ? colorScheme : theme;

  return (
    <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="list/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
