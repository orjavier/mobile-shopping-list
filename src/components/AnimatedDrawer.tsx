/**
 * AnimatedDrawer — Side navigation drawer sliding from the right.
 * Stylized to match dark/light mode mockups precisely.
 */

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/stores/authStore';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
     Dimensions,
     Image,
     Modal,
     Platform,
     Pressable,
     StatusBar,
     StyleSheet,
     Text,
     TouchableOpacity,
     View,
} from 'react-native';
import Animated, {
     useAnimatedStyle,
     useSharedValue,
     withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;
const PRIMARY = '#FF6C37';

// ─── Theme tokens based on mockups ─────────────────────────────────────────────
const DARK = {
     bg: '#111111',
     text: '#FFFFFF',
     textMuted: '#A0A0A0',
     itemActiveBg: '#2C1A16', // Brownish-orange active bg from mockup
     itemText: '#FFFFFF',
     itemActiveText: PRIMARY,
     iconBgInactive: '#222222',
     iconBgActive: '#3D241E',
     divider: 'rgba(255,255,255,0.08)',
     logoutText: '#555555',
     avatarRing: PRIMARY,
};

const LIGHT = {
     bg: '#F9FAFB',
     text: '#1A1C1E',
     textMuted: '#707070',
     itemActiveBg: '#FFF1EE', // Soft light orange active bg
     itemText: '#1A1C1E',
     itemActiveText: PRIMARY,
     iconBgInactive: '#FFFFFF',
     iconBgActive: '#FFEBE6',
     divider: '#F1F3F5',
     logoutText: '#64748B',
     avatarRing: '#FFEDE8',
     statusDot: '#2BD470',
};

const NAV_ITEMS = [
     { icon: 'person', label: 'Mi Perfil', route: '/(tabs)/profile' },
     { icon: 'settings', label: 'Configuraciones', route: '/settings' },
] as const;

interface AnimatedDrawerProps {
     visible: boolean;
     onClose: () => void;
}

export default function AnimatedDrawer({ visible, onClose }: AnimatedDrawerProps) {
     const router = useRouter();
     const scheme = useColorScheme();
     const isDark = scheme === 'dark';
     const C = isDark ? DARK : LIGHT;

     const user = useAuthStore((s) => s.user);
     const logout = useAuthStore((s) => s.logout);

     const translateX = useSharedValue(DRAWER_WIDTH);
     const overlayOpacity = useSharedValue(0);

     useEffect(() => {
          if (visible) {
               translateX.value = withTiming(0, { duration: 350 });
               overlayOpacity.value = withTiming(1, { duration: 350 });
          } else {
               translateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
               overlayOpacity.value = withTiming(0, { duration: 300 });
          }
     }, [visible]);

     const animatedDrawerStyle = useAnimatedStyle(() => ({
          transform: [{ translateX: translateX.value }],
     }));

     const animatedOverlayStyle = useAnimatedStyle(() => ({
          opacity: overlayOpacity.value,
     }));

     const handleLogout = () => {
          onClose();
          logout();
     };

     const handleNavigate = (route: string) => {
          onClose();
          router.push(route as never);
     };

     const initials = user
          ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
          : 'UA';

     const fullName = user
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Nombre Apellido'
          : 'Nombre Apellido';

     const statusBarH = Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 30);

     return (
          <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
               <View style={styles.container}>
                    <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
                         <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                    </Animated.View>

                    <Animated.View style={[styles.drawer, { backgroundColor: C.bg }, animatedDrawerStyle]}>
                         <View style={{ height: statusBarH }} />

                         {/* ── Header / Avatar Section ── */}
                         <View style={styles.avatarSection}>
                              <View style={[styles.avatarRing, { borderColor: C.avatarRing }]}>
                                   {user?.secure_url ? (
                                        <Image source={{ uri: user.secure_url }} style={styles.avatarImg} />
                                   ) : (
                                        <View style={[styles.avatarFallback, { backgroundColor: isDark ? '#222' : '#FFEDE8' }]}>
                                             <Text style={[styles.avatarTxt, { color: isDark ? '#A0A0A0' : PRIMARY }]}>{initials}</Text>
                                        </View>
                                   )}
                                   {!isDark && <View style={[styles.statusDot, { backgroundColor: LIGHT.statusDot }]} />}
                              </View>
                              <Text style={[styles.userName, { color: C.text }]}>{fullName}</Text>
                              <Text style={[styles.userEmail, { color: C.textMuted }]}>{user?.email || 'user@email.com'}</Text>
                         </View>

                         <View style={[styles.hDivider, { backgroundColor: C.divider }]} />

                         {/* ── Menu Items ── */}
                         <View style={styles.menuList}>
                              {NAV_ITEMS.map((item) => {
                                   return (
                                        <TouchableOpacity
                                             key={item.route}
                                             onPress={() => handleNavigate(item.route)}
                                             style={styles.menuItem}
                                             activeOpacity={0.7}
                                        >
                                             <View style={[
                                                  styles.iconWrap,
                                                  { backgroundColor: C.iconBgInactive }
                                             ]}>
                                                  <MaterialIcons
                                                       name={item.icon as any}
                                                       size={22}
                                                       color={isDark ? '#FFFFFF' : '#444444'}
                                                  />
                                             </View>
                                             <Text style={[
                                                  styles.menuLabel,
                                                  { color: C.itemText }
                                             ]}>
                                                  {item.label}
                                             </Text>
                                        </TouchableOpacity>
                                   );
                              })}
                         </View>

                         {/* ── Footer ── */}
                         <View style={[styles.footer, !isDark && { borderTopWidth: 1, borderTopColor: C.divider }]}>
                              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                                   <MaterialIcons name="logout" size={20} color={C.logoutText} />
                                   <Text style={[styles.logoutTxtLight, { color: C.logoutText }]}>Cerrar sesión</Text>
                              </TouchableOpacity>
                         </View>
                    </Animated.View>
               </View>
          </Modal>
     );
}

const styles = StyleSheet.create({
     container: { flex: 1 },
     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
     drawer: {
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          paddingHorizontal: 16,
     },

     // Avatar section
     avatarSection: { alignItems: 'center', marginVertical: 30 },
     avatarRing: {
          width: 104,
          height: 104,
          borderRadius: 52,
          borderWidth: 2.5,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          position: 'relative'
     },
     avatarImg: { width: 92, height: 92, borderRadius: 46 },
     avatarFallback: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
     avatarTxt: { fontSize: 26, fontWeight: '700' },
     statusDot: {
          position: 'absolute',
          bottom: 6,
          right: 6,
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#FFFFFF'
     },
     userName: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
     userEmail: { fontSize: 13, marginTop: 4, opacity: 0.8 },

     hDivider: { height: 1, marginHorizontal: -16, opacity: 0.5 },

     // Menu
     menuList: { flex: 1, paddingTop: 24, gap: 10 },
     menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderRadius: 18, // Very rounded as requested
          gap: 16,
     },
     iconWrap: {
          width: 44,
          height: 44,
          borderRadius: 22, // Circular icon backgrounds
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
     },
     menuLabel: { fontSize: 16, fontWeight: '600' },

     // Footer
     footer: { paddingBottom: 40, paddingTop: 20 },
     logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
     logoutTxtDark: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
     logoutTxtLight: { fontSize: 15, fontWeight: '500' },
});
