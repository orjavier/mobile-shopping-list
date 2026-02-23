/**
 * CustomTabBar — shared component used by all tab screens.
 *
 * Tabs order (left-to-right): Home | Shopping List | [FAB] | Categorías | Productos
 * Position: absolute, bottom 0, z-index: 50.
 */

import { useColorScheme } from '@/components/useColorScheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

// ─── constants ────────────────────────────────────────────────────────────────
export const PRIMARY = '#FF6C37';
export const TAB_H = 68;
export const TAB_BOTTOM_EXTRA = Platform.OS === 'ios' ? 24 : 0;
export const TAB_TOTAL = TAB_H + TAB_BOTTOM_EXTRA;

const FAB_D = 62;
const FAB_OUTER_D = 76;
const { width: WIDTH } = Dimensions.get('window');

// ─── route map ────────────────────────────────────────────────────────────────
export type TabRoute =
     | '/(tabs)'
     | '/(tabs)/lists'
     | '/(tabs)/categories'
     | '/(tabs)/products'
     | '/(tabs)/two'
     | '/(tabs)/profile'
     | '/settings';

interface Tab {
     icon: string;
     label: string;
     route: TabRoute;
}

const TABS_L: Tab[] = [
     { icon: 'home', label: 'Home', route: '/(tabs)' },
     { icon: 'list', label: 'Shopping List', route: '/(tabs)/lists' },
];

const TABS_R: Tab[] = [
     { icon: 'folder', label: 'Categorías', route: '/(tabs)/categories' },
     { icon: 'archive', label: 'Productos', route: '/(tabs)/products' },
];

const TABS_HOME: Tab[] = [
     { icon: 'home', label: 'Home', route: '/(tabs)' },
     { icon: 'list', label: 'Shopping List', route: '/(tabs)/lists' },
     { icon: 'folder', label: 'Categorías', route: '/(tabs)/categories' },
     { icon: 'archive', label: 'Productos', route: '/(tabs)/products' },
     { icon: 'user', label: 'Perfil', route: '/(tabs)/profile' },
];

// ─── theme tokens ─────────────────────────────────────────────────────────────
const LIGHT_TB = {
     tabText: 'rgba(49, 49, 49, 0.72)',
     tabActive: '#FF6C37',
     fabCenter: '#FFFFFF',
};
const DARK_TB = {
     tabText: 'rgba(255,255,255,0.65)',
     tabActive: '#FF6C37',
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
     const pathname = usePathname();
     const scheme = useColorScheme();
     const isDark = scheme === 'dark';
     const C = isDark ? DARK_TB : LIGHT_TB;

     const isHome = pathname === '/' || pathname === '/(tabs)';
     const handleFab = isHome
          ? () => { }
          : (onFabPress ?? (() => router.push('/(tabs)/lists' as never)));
     const isActive = (r: TabRoute) => activeRoute === r;

     const renderTab = (tab: Tab) => (
          <Pressable
               key={tab.route}
               style={tb.tabBtn}
               onPress={() => router.push(tab.route as never)}
          >
               <Feather
                    name={tab.icon as never}
                    size={22}
                    color={isActive(tab.route) ? C.tabActive : C.tabText}
               />
          </Pressable>
     );

     return (
          <BlurView
               intensity={100}
               tint={isDark ? 'dark' : 'light'}
               style={tb.root}
               pointerEvents="box-none"
          >
               {/* -- tab bar -- */}
               <View style={tb.bar}>
                    {isHome ? (
                         <View style={tb.fullRow}>{TABS_HOME.map(renderTab)}</View>
                    ) : (
                         <>
                              <View style={tb.half}>{TABS_L.map(renderTab)}</View>
                              <View style={tb.centerGap} />
                              <View style={tb.half}>{TABS_R.map(renderTab)}</View>
                         </>
                    )}
               </View>

               {/* ── FAB (only outside home) ── */}
               {!isHome && (
                    <View style={tb.fabWrap}>
                         <View style={[tb.fabOuter, {
                              backgroundColor: C.fabCenter,
                              borderColor: 'transparent',
                              shadowColor: isDark ? '#ffffff' : '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5
                         }]}>
                              <Pressable style={tb.fabTouch} onPress={handleFab}>
                                   <LinearGradient
                                        colors={['#FF8C5A', PRIMARY]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={tb.fabGrad}
                                   >
                                        <Feather name="plus" size={26} color="#fff" />
                                   </LinearGradient>
                              </Pressable>
                         </View>
                    </View>
               )}
          </BlurView>
     );
}

const tb = StyleSheet.create({
     root: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
     } as object,
     bar: {
          width: WIDTH,
          height: TAB_H,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingBottom: TAB_BOTTOM_EXTRA,
          borderTopWidth: 1,
          borderTopColor: 'rgba(150, 150, 150, 0.2)',
     },
     half: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
     },
     fullRow: {
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
          borderWidth: 3,
          alignItems: 'center',
          justifyContent: 'center',
          shadowRadius: 10,
     },
     fabTouch: {
          width: FAB_D,
          height: FAB_D,
          borderRadius: FAB_D / 2,
          overflow: 'hidden',
     },
     fabGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
     fabIcon: { width: 32, height: 32, tintColor: '#fff' },
});
