/**
 * CustomTabBar — shared component used by all tab screens.
 *
 * Tabs order (left-to-right): Home | Shopping List | [FAB] | Categorías | Productos
 * Position: absolute, bottom 0, z-index: 50.
 */

import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

import { Text } from '@/components/Themed';

// ─── constants ────────────────────────────────────────────────────────────────
export const PRIMARY = '#FF6C37';
export const TAB_H = 68;
export const TAB_BOTTOM_EXTRA = Platform.OS === 'ios' ? 24 : 0;
export const TAB_TOTAL = TAB_H + TAB_BOTTOM_EXTRA;

const FAB_D = 62;
const FAB_OUTER_D = 76;
const { width: W } = Dimensions.get('window');

// ─── route map ────────────────────────────────────────────────────────────────
export type TabRoute =
     | '/(tabs)'
     | '/(tabs)/lists'
     | '/(tabs)/categories'
     | '/(tabs)/products'
     | '/(tabs)/two'
     | '/(tabs)/profile';

interface Tab {
     icon: string;
     label: string;
     route: TabRoute;
}

const TABS_L: Tab[] = [
     { icon: 'grid-view', label: 'Home', route: '/(tabs)' },
     { icon: 'view-list', label: 'Shopping List', route: '/(tabs)/lists' },
];

const TABS_R: Tab[] = [
     { icon: 'folder', label: 'Categorías', route: '/(tabs)/categories' },
     { icon: 'archive', label: 'Productos', route: '/(tabs)/products' },
];

// ─── theme tokens ─────────────────────────────────────────────────────────────
const LIGHT_TB = {
     tabText: 'rgba(255,255,255,0.72)',
     tabActive: '#FFFFFF',
     fabCenter: '#FFFFFF',
};
const DARK_TB = {
     tabText: 'rgba(255,255,255,0.65)',
     tabActive: '#FFFFFF',
     fabCenter: '#0F0F0F',
};

// ─── component ────────────────────────────────────────────────────────────────
export interface CustomTabBarProps {
     /** Highlight the matching tab. Pass the current route string e.g. '/(tabs)/lists'. */
     activeRoute: TabRoute;
     /** Called when the center FAB is pressed. Default: navigates to /(tabs)/lists. */
     onFabPress?: () => void;
}

export default function CustomTabBar({ activeRoute, onFabPress }: CustomTabBarProps) {
     const router = useRouter();
     const scheme = useColorScheme();
     const isDark = scheme === 'dark';
     const C = isDark ? DARK_TB : LIGHT_TB;

     const handleFab = onFabPress ?? (() => router.push('/(tabs)/lists' as never));
     const isActive = (r: TabRoute) => activeRoute === r;

     const renderTab = (tab: Tab) => (
          <TouchableOpacity
               key={tab.route}
               style={tb.tabBtn}
               onPress={() => router.push(tab.route as never)}
               activeOpacity={0.7}
          >
               <MaterialIcons
                    name={tab.icon as never}
                    size={22}
                    color={isActive(tab.route) ? C.tabActive : C.tabText}
               />
               <Text style={[
                    tb.tabLabel,
                    { color: isActive(tab.route) ? C.tabActive : C.tabText },
                    isActive(tab.route) && tb.tabLabelActive,
               ]}>
                    {tab.label}
               </Text>
          </TouchableOpacity>
     );

     return (
          <View style={tb.root} pointerEvents="box-none">
               {/* ── orange bar ── */}
               <View style={[tb.bar, { shadowColor: PRIMARY }]}>
                    <View style={tb.half}>{TABS_L.map(renderTab)}</View>
                    <View style={tb.centerGap} />
                    <View style={tb.half}>{TABS_R.map(renderTab)}</View>
               </View>

               {/* ── FAB (floats above the bar center) ── */}
               <View style={tb.fabWrap}>
                    <View style={[tb.fabOuter, { backgroundColor: C.fabCenter }]}>
                         <TouchableOpacity style={tb.fabTouch} onPress={handleFab} activeOpacity={0.85}>
                              <LinearGradient
                                   colors={['#FF8C5A', PRIMARY]}
                                   start={{ x: 0, y: 0 }}
                                   end={{ x: 1, y: 1 }}
                                   style={tb.fabGrad}
                              >
                                   <MaterialIcons name="add" size={30} color="#fff" />
                              </LinearGradient>
                         </TouchableOpacity>
                    </View>
               </View>
          </View>
     );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
     root: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 50,
     } as object,
     bar: {
          width: W,
          height: TAB_H,
          backgroundColor: PRIMARY,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingBottom: TAB_BOTTOM_EXTRA,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 20,
     },
     half: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
     },
     centerGap: { width: FAB_OUTER_D + 12 },
     tabBtn: { alignItems: 'center', gap: 2, flex: 1, paddingTop: 4 },
     tabLabel: { fontSize: 9, fontWeight: '500', textAlign: 'center' },
     tabLabelActive: { fontWeight: '800' },
     fabWrap: {
          position: 'absolute',
          top: -(FAB_OUTER_D / 2 + 6),
          alignSelf: 'center',
          zIndex: 99,
     },
     fabOuter: {
          width: FAB_OUTER_D,
          height: FAB_OUTER_D,
          borderRadius: FAB_OUTER_D / 2,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 12,
     },
     fabTouch: {
          width: FAB_D,
          height: FAB_D,
          borderRadius: FAB_D / 2,
          overflow: 'hidden',
     },
     fabGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
