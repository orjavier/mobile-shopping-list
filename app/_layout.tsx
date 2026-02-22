import { useColorScheme } from '@/components/useColorScheme';
import Toast from '@/toast';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        
        if (isAuthenticated) {
          setInitialRoute('(tabs)');
        } else if (hasSeenOnboarding === 'true') {
          setInitialRoute('login');
        } else {
          setInitialRoute('onboarding');
        }
      } catch (e) {
        setInitialRoute('onboarding');
      }
    };

    if (loaded) {
      checkInitialRoute();
    }
  }, [loaded, isAuthenticated]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !initialRoute) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav initialRoute={initialRoute} />
      <Toast />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav({ initialRoute }: { initialRoute: string }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
