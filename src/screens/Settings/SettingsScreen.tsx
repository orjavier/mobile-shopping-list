import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
const PRIMARY = '#FF6C37';

export default function SettingsScreen() {
     const router = useRouter();
     const { theme, setTheme } = useThemeStore();
          const { colors: Colors, isDark } = useAppTheme();
     const logout = useAuthStore((s) => s.logout);

     const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

     const toggleTheme = () => {
          setTheme(isDark ? 'light' : 'dark');
     };

     const handleLogout = () => {
          setIsLogoutModalVisible(false);
          logout();
          router.replace('/auth/login' as never);
     };

     const renderSettingItem = ({
          icon,
          label,
          rightElement,
     }: {
          icon: string;
          label: string;
          rightElement: React.ReactNode;
     }) => {
          if (isDark) {
               return (
                    <View style={[styles.pillCard, { backgroundColor: Colors.surfaceBackgroundColor }]}>
                         <View style={styles.pillCardContent}>
                              <View style={styles.cardIconLabel}>
                                   <View style={[styles.iconCircle, { backgroundColor: Colors.settingsIconBackgroundColor }]}>
                                        <MaterialIcons name={icon as any} size={24} color={PRIMARY} />
                                   </View>
                                   <Text style={[styles.cardLabel, { color: Colors.primaryTextColor }]}>{label}</Text>
                              </View>
                              {rightElement}
                         </View>
                    </View>
               );
          }

          // Light mode: flat design
          return (
               <View style={styles.flatRow}>
                    <View style={styles.cardIconLabel}>
                         <View style={[styles.iconCircle, { backgroundColor: Colors.settingsIconBackgroundColor }]}>
                              <MaterialIcons name={icon as any} size={24} color={PRIMARY} />
                         </View>
                         <Text style={[styles.cardLabel, { color: Colors.primaryTextColor }]}>{label}</Text>
                    </View>
                    {rightElement}
               </View>
          );
     };

     return (
          <View style={[styles.container, { backgroundColor: Colors.screenBackgroundColor }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
               <View style={{ height: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight ?? 28 }} />

               {/* Header */}
               <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                         <MaterialIcons name="arrow-back-ios" size={20} color={Colors.primaryTextColor} />
                    </TouchableOpacity>
                    <View style={styles.backBtn} />
               </View>

               <ScrollView contentContainerStyle={styles.content}>

                    <View style={[styles.headerRow, { justifyContent: 'center', paddingBottom: 40 }]}>
                         <Text style={[styles.headerTitle, { color: Colors.primaryTextColor }]}>
                              {isDark ? 'Configuraciones' : 'Configuración'}
                         </Text>
                    </View>
                    {renderSettingItem({
                         icon: 'notifications-none',
                         label: 'Notificaciones',
                         rightElement: (
                              <Switch
                                   value={false}
                                   onValueChange={() => { }}
                                   trackColor={{ false: Colors.borderColor, true: Colors.statusOpenTextColor }}
                                   thumbColor="#FFF"
                                   ios_backgroundColor={Colors.borderColor}
                              />
                         ),
                    })}

                    {renderSettingItem({
                         icon: isDark ? 'dark-mode' : 'palette',
                         label: 'Tema',
                         rightElement: (
                              <Switch
                                   value={isDark}
                                   onValueChange={toggleTheme}
                                   trackColor={{ false: Colors.borderColor, true: Colors.statusOpenTextColor }}
                                   thumbColor="#FFF"
                                   ios_backgroundColor={Colors.borderColor}
                              />
                         ),
                    })}

                    {renderSettingItem({
                         icon: 'logout',
                         label: 'Cerrar sesión',
                         rightElement: (
                              <Pressable
                                   onPress={() => setIsLogoutModalVisible(true)}
                                   android_ripple={{ color: PRIMARY }}
                              >
                              </Pressable>
                         ),
                    })}
               </ScrollView>

               {/* Bottom Sheet for Logout Confirmation */}
               <Modal
                    transparent
                    visible={isLogoutModalVisible}
                    animationType="slide"
                    onRequestClose={() => setIsLogoutModalVisible(false)}
               >
                    <View style={styles.modalOverlay}>
                         <Pressable style={styles.modalBackdrop} onPress={() => setIsLogoutModalVisible(false)} />
                         <View style={[styles.bottomSheet, { backgroundColor: Colors.bottomSheetBackgroundColor }]}>
                              <View style={styles.dragIndicator} />
                              <Text style={[styles.sheetTitle, { color: Colors.primaryTextColor }]}>
                                   ¿Estás seguro?
                              </Text>
                              <Text style={[styles.sheetSubtitle, { color: Colors.primaryTextColor, opacity: 0.7 }]}>
                                   ¿Deseas cerrar tu sesión actual? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
                              </Text>

                              <TouchableOpacity style={[styles.sheetBtn, { backgroundColor: PRIMARY }]} onPress={handleLogout}>
                                   <Text style={styles.sheetBtnText}>Cerrar sesión</Text>
                              </TouchableOpacity>

                              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setIsLogoutModalVisible(false)}>
                                   <Text style={[styles.sheetCancelBtnText, { color: Colors.primaryTextColor }]}>
                                        Cancelar
                                   </Text>
                              </TouchableOpacity>
                         </View>
                    </View>
               </Modal>
          </View>
     );
}

const styles = StyleSheet.create({
     container: { flex: 1 },
     headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
     },
     backBtn: {
          width: 40,
          height: 40,
          alignItems: 'flex-start',
          justifyContent: 'center',
     },
     headerTitle: {
          fontSize: 20,
          fontWeight: '700',
     },
     content: {
          padding: 24,
          paddingTop: 10,
     },
     pillCard: {
          borderRadius: 35,
          marginBottom: 16,
          height: 70,
          justifyContent: 'center',
          paddingHorizontal: 10,
     },
     pillCardContent: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 8,
     },
     flatRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 16,
          marginBottom: 8,
     },
     cardIconLabel: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
     },
     iconCircle: {
          width: 46,
          height: 46,
          borderRadius: 23,
          alignItems: 'center',
          justifyContent: 'center',
     },
     cardLabel: {
          fontSize: 16,
          fontWeight: '600',
     },
     modalOverlay: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
     },
     modalBackdrop: {
          ...StyleSheet.absoluteFillObject,
     },
     bottomSheet: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          padding: 24,
          paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          alignItems: 'center',
     },
     dragIndicator: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#D1D5DB',
          marginBottom: 20,
     },
     sheetTitle: {
          fontSize: 22,
          fontWeight: '700',
          marginBottom: 10,
     },
     sheetSubtitle: {
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 20,
     },
     sheetBtn: {
          width: '100%',
          paddingVertical: 16,
          borderRadius: 30,
          alignItems: 'center',
          marginBottom: 12,
     },
     sheetBtnText: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '700',
     },
     sheetCancelBtn: {
          width: '100%',
          paddingVertical: 14,
          alignItems: 'center',
     },
     sheetCancelBtnText: {
          fontSize: 16,
          fontWeight: '600',
     },
});
