import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, ScrollView, StatusBar, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import { Text, useThemeColor } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

const ProfileScreen = () => {
     const router = useRouter();
     const user = useAuthStore((state) => state.user);
     const logout = useAuthStore((state) => state.logout);
     const { theme, setTheme } = useThemeStore();
     const colorScheme = useColorScheme();

     const backgroundColor = useThemeColor({}, 'background');
     const textColor = useThemeColor({}, 'text');
     const cardBg = colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
     const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

     const handleLogout = () => {
          Alert.alert(
               'Cerrar Sesión',
               '¿Estás seguro de que quieres cerrar sesión?',
               [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                         text: 'Cerrar Sesión',
                         style: 'destructive',
                         onPress: () => {
                              logout();
                              router.replace('/login');
                         },
                    },
               ]
          );
     };

     const toggleTheme = () => {
          setTheme(colorScheme === 'dark' ? 'light' : 'dark');
     };

     return (
          <View style={{ flex: 1, backgroundColor }}>
               <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
               <View style={{ height: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight ?? 28 }} />

               {/* Header with back button */}
               <View style={[styles.headerRow, { backgroundColor }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                         <MaterialIcons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Mi Perfil</Text>
                    <View style={styles.backBtn} />
               </View>

               <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                         <View style={styles.avatarContainer}>
                              {user?.secure_url ? (
                                   <Image source={{ uri: user.secure_url }} style={styles.avatar} />
                              ) : (
                                   <View style={[styles.avatarPlaceholder, { backgroundColor: '#FF803E' }]}>
                                        <Text style={styles.avatarText}>
                                             {user?.firstName?.charAt(0) ?? '?'}
                                             {user?.lastName?.charAt(0) ?? ''}
                                        </Text>
                                   </View>
                              )}
                              <TouchableOpacity style={styles.editAvatarBtn}>
                                   <MaterialIcons name="camera-alt" size={20} color="#fff" />
                              </TouchableOpacity>
                         </View>
                         <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                         <Text style={[styles.email, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{user?.email}</Text>
                    </View>

                    <View style={styles.section}>
                         <Text style={styles.sectionTitle}>Ajustes</Text>

                         <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                              <View style={styles.cardRow}>
                                   <View style={styles.cardIconLabel}>
                                        <MaterialIcons name={colorScheme === 'dark' ? "dark-mode" : "light-mode"} size={22} color={textColor} />
                                        <Text style={styles.cardLabel}>Modo Oscuro</Text>
                                   </View>
                                   <Switch
                                        value={colorScheme === 'dark'}
                                        onValueChange={toggleTheme}
                                        trackColor={{ false: '#767577', true: '#FF803E' }}
                                        thumbColor={colorScheme === 'dark' ? '#ffffff' : '#f4f3f4'}
                                   />
                              </View>

                              <TouchableOpacity style={styles.cardRow} onPress={() => setTheme('system')}>
                                   <View style={styles.cardIconLabel}>
                                        <MaterialIcons name="settings-brightness" size={22} color={textColor} />
                                        <Text style={styles.cardLabel}>Usar tema del sistema</Text>
                                   </View>
                                   {theme === 'system' && <MaterialIcons name="check" size={20} color="#FF803E" />}
                              </TouchableOpacity>
                         </View>
                    </View>

                    <View style={styles.section}>
                         <Text style={styles.sectionTitle}>Información Personal</Text>
                         <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                              <InfoRow label="Nombre" value={user?.firstName} icon="person" />
                              <InfoRow label="Apellido" value={user?.lastName} icon="person-outline" />
                              <InfoRow label="Email" value={user?.email} icon="email" last />
                         </View>
                    </View>

                    {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#fff" />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
               </TouchableOpacity> */}

                    <CustomButton
                         title="Cerrar Sesión"
                         onPress={handleLogout}
                         variant="outlined"
                    />
                     <Text style={styles.versionText}>Versión 1.0.0</Text>
               </ScrollView>
          </View>
     );
}

const InfoRow = ({ label, value, icon, last }: { label: string; value?: string; icon: any; last?: boolean }) => {
     const textColor = useThemeColor({}, 'text');
     const colorScheme = useColorScheme();
     const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

     return (
          <View style={[styles.cardRow, !last && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
               <View style={styles.cardIconLabel}>
                    <MaterialIcons name={icon} size={20} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
                    <View style={{ marginLeft: 12 }}>
                         <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#888' : '#666' }]}>{label}</Text>
                         <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
                    </View>
               </View>
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     content: {
          padding: 20,
          paddingBottom: 40,
     },
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
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: '700',
     },
     header: {
          alignItems: 'center',
          marginVertical: 30,
     },
     avatarContainer: {
          position: 'relative',
          marginBottom: 16,
     },
     avatar: {
          width: 100,
          height: 100,
          borderRadius: 50,
     },
     avatarPlaceholder: {
          width: 100,
          height: 100,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
     },
     avatarText: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#fff',
     },
     editAvatarBtn: {
          position: 'absolute',
          right: 0,
          bottom: 0,
          backgroundColor: '#FF803E',
          padding: 8,
          borderRadius: 20,
          borderWidth: 3,
          borderColor: '#fff',
     },
     name: {
          fontSize: 26,
          fontWeight: '700',
          marginBottom: 4,
     },
     email: {
          fontSize: 16,
     },
     section: {
          marginBottom: 25,
     },
     sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 12,
          marginLeft: 4,
          color: '#FF803E',
     },
     card: {
          borderRadius: 16,
          borderWidth: 1,
          overflow: 'hidden',
     },
     cardRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
     },
     cardIconLabel: {
          flexDirection: 'row',
          alignItems: 'center',
     },
     cardLabel: {
          fontSize: 16,
          marginLeft: 12,
          fontWeight: '500',
     },
     infoLabel: {
          fontSize: 12,
          fontWeight: '500',
          textTransform: 'uppercase',
          marginBottom: 2,
     },
     infoValue: {
          fontSize: 16,
          fontWeight: '600',
     },
     logoutButton: {
          backgroundColor: '#dc3545',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
          shadowColor: '#dc3545',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
     },
     logoutButtonText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
          marginLeft: 8,
     },
     versionText: {
          textAlign: 'center',
          marginTop: 30,
          fontSize: 12,
          color: '#888',
     },
});

export default ProfileScreen;
