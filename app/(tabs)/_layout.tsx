import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

// Oculta el header nativo y el tab bar nativo en todas las pantallas.
// HomeScreen tiene su propio CustomTabBar con position:absolute.
const NO_NATIVE_UI = {
  headerShown: false,
  tabBarStyle: { display: 'none' } as object,
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        ...NO_NATIVE_UI,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      {/* Home — Search + Recent overview + CustomTabBar */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* Shopping Lists — FlatList + BottomSheet */}
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Shopping List',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />

      {/* Categorías */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorías',
          tabBarIcon: ({ color }) => <TabBarIcon name="folder" color={color} />,
        }}
      />

      {/* Productos */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,
        }}
      />

      {/* Historial */}
      <Tabs.Screen
        name="two"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
        }}
      />

      {/* Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
