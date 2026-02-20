import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
     Pressable,
     StatusBar,
     StyleSheet
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { userRepository } from '@/repositories';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export default function RegisterScreen() {
     const router = useRouter();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [firstName, setFirstName] = useState('');
     const [lastName, setLastName] = useState('');
     const [isLoading, setIsLoading] = useState(false);

     const validateForm = (): boolean => {
          if (!firstName.trim()) {
               showToast.error('Error', 'Por favor ingresa tu nombre');
               return false;
          }
          if (!lastName.trim()) {
               showToast.error('Error', 'Por favor ingresa tu apellido');
               return false;
          }
          if (!email.trim()) {
               showToast.error('Error', 'Por favor ingresa tu email');
               return false;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               showToast.error('Error', 'Por favor ingresa un email válido');
               return false;
          }
          if (!password.trim()) {
               showToast.error('Error', 'Por favor ingresa una contraseña');
               return false;
          }
          if (password.length < 6) {
               showToast.error('Error', 'La contraseña debe tener al menos 6 caracteres');
               return false;
          }
          if (password !== confirmPassword) {
               showToast.error('Error', 'Las contraseñas no coinciden');
               return false;
          }
          return true;
     };

     const handleRegister = async () => {
          if (!validateForm()) {
               return;
          }

          setIsLoading(true);
          try {
               await userRepository.register(
                    firstName.trim(),
                    lastName.trim(),
                    email.trim(),
                    password,
               );
               showToast.success('Éxito', 'Cuenta creada. Por favor inicia sesión');
               router.replace('/login');
          } catch (error: unknown) {
               let message = 'Error al registrarse';

               if (error && typeof error === 'object' && 'response' in error) {
                    const err = error as { response?: { data?: { message?: string }, status: number } };
                    message = err.response?.data?.message || `Error: ${err.response?.status}`;
               } else if (error && typeof error === 'object' && 'message' in error) {
                    const err = error as { message: string };
                    message = err.message;
               }

               showToast.error('Error', message);
          } finally {
               setIsLoading(false);
          }
     };
     //https://rn-gradient.vercel.app/
     return (
          <View style={styles.container}>
               <LinearGradient
                    style={styles.container}
                    colors={['#FF6C37', '#ffc340ff', '#FF6C37']}
                    start={{ x: 0.07, y: 0.24 }}
                    end={{ x: 0.93, y: 0.76 }}
               >
                    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                    <Image
                         source={require('../../assets/SVGs/inferior-blob.svg')}
                         style={{ width: 620, height: 426, position: 'absolute', top: -180, right: -220, opacity: 0.2, transform: [{ rotate: '70deg' }] }}
                         contentFit="cover"
                    />
                    <Image
                         source={require('../../assets/SVGs/superior-blob.svg')}
                         style={{ width: 550, height: 370, position: 'absolute', bottom: -180, right: -20, opacity: 0.2 }}
                         contentFit="cover"
                    />

                    <View style={styles.form}>
                         <View style={styles.header}>
                              <Image
                                   source={require('../../assets/images/logo-border-white.png')}
                                   style={{ width: 250, height: 86, marginRight: -20 }}
                                   contentFit="cover"
                              />
                         </View>
                         <Text style={styles.title}>Crea tu cuenta.</Text>
                         <View style={styles.inputContainer}>
                              <CustomInput
                                   label="Nombre"
                                   value={firstName}
                                   onChangeText={setFirstName}
                                   placeholder="John"
                                   leftIcon="user"
                                   isLightThemeDefault={true}
                              />
                         </View>
                         <View style={styles.inputContainer}>
                              <CustomInput
                                   label="Apellido"
                                   value={lastName}
                                   onChangeText={setLastName}
                                   placeholder="Doe"
                                   leftIcon="user"
                                   isLightThemeDefault={true}
                              />
                         </View>
                         <View style={styles.inputContainer}>
                              <CustomInput
                                   label="Email"
                                   value={email}
                                   onChangeText={setEmail}
                                   placeholder="ejemplo@correo.com"
                                   leftIcon="mail"
                                   isLightThemeDefault={true}
                              />
                         </View>

                         <View style={styles.inputContainer}>
                              <CustomInput
                                   label="Contraseña"
                                   value={password}
                                   onChangeText={setPassword}
                                   placeholder="Introduzca su contraseña"
                                   secureTextEntry
                                   leftIcon="lock"
                                   isLightThemeDefault={true}
                              />
                         </View>
                          <View style={styles.inputContainer}>
                               <CustomInput
                                    label="Repite la Contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repite la contraseña"
                                    secureTextEntry
                                    leftIcon="lock"
                                    isLightThemeDefault={true}
                               />
                          </View>

                         <CustomButton
                              title="Registrarse"
                              variant="outlined"
                              onPress={handleRegister}
                              isLoading={isLoading}
                              style={styles.loginButton}
                         />
                         <View style={styles.footer}>
                              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'SF', }}>¿Ya tienes cuenta? </Text>
                              <Pressable onPress={() => router.replace('/login')}>
                                   <Text style={styles.linkText}>Inicia Sesión</Text>
                              </Pressable>
                         </View>
                    </View>

               </LinearGradient>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     body: {
          flex: 1,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
     },
     header: {
          alignItems: 'center',
          marginBottom: 40,
          paddingTop: 20,
          gap: 20,
     },
     title: {
          fontSize: 24,
          fontFamily: 'SF',
          fontWeight: 'bold',
          marginBottom: 20,
     },
     subtitle: {
          fontSize: 16,
          color: '#666',
     },
     form: {
          flex: 1,
          width: '100%',
          paddingHorizontal: 20,
          justifyContent: 'center',
     },
     inputContainer: {
          marginBottom: 20,
     },
     label: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 8,
     },
     input: {
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          backgroundColor: '#fff',
     },
     loginButton: {
          marginTop: 10,
          borderColor: '#FFF',
          borderWidth: 1,
          backgroundColor: 'rgba(255, 210, 210, 0.2)',
          fontFamily: 'SF',
     },
     footer: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 30,
     },
     footerText: {
          color: '#666',
          fontSize: 14,

     },
     linkText: {
          color: '#fff',
          fontWeight: '600',
     },
});
