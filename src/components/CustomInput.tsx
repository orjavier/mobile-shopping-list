import { useColorScheme } from '@/components/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { ComponentProps, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface CustomInputProps {
     label: string;
     value: string;
     onChangeText: (text: string) => void;
     placeholder?: string;
     error?: string;
     secureTextEntry?: boolean;
     rightIcon?: ComponentProps<typeof MaterialIcons>['name'];
     onRightIconPress?: () => void;
}

const CustomInput = ({
     label,
     value,
     onChangeText,
     placeholder,
     error,
     rightIcon,
     onRightIconPress,
     secureTextEntry
}: CustomInputProps) => {
     const colorScheme = useColorScheme();
     const [focused, setFocused] = useState(false);

     const themeColors = {
          light: {
               inputBg: '#FFFFFF', // Solid white to ensure it never looks dark
               inputText: '#000000',
               label: '#1A1A1A',
               placeholder: '#666666',
               border: '#E5E5EA',
          },
          dark: {
               inputBg: 'rgba(30,30,30,1)', // Solid background for dark mode
               inputText: '#FFFFFF',
               label: '#E0E0E0',
               placeholder: '#666666',
               border: 'rgba(255,255,255,0.2)',
          }
     };

     const colors = colorScheme === 'dark' ? themeColors.dark : themeColors.light;

     return (
          <View style={styles.container}>
               {/* <Text style={[styles.inputLabel, { color: colors.label }]}>
                    {label}
               </Text> */}

               <BlurView
                    intensity={colorScheme === 'dark' ? 40 : 0}
                    tint={colorScheme === 'dark' ? 'dark' : 'default'}
                    style={[
                         styles.inputContainer,
                         focused && styles.inputFocused,
                         {
                              borderColor: focused ? '#FF803E' : colors.border,
                              backgroundColor: colorScheme === 'dark' ? colors.inputBg : '#FFFFFF',
                              borderWidth: colorScheme === 'dark' ? 1.5 : 1
                         }
                    ]}
               >
                    <View style={styles.inputWrapper}>
                         <TextInput
                              style={[
                                   styles.input,
                                   { color: colors.inputText }
                              ]}
                              value={value}
                              onChangeText={onChangeText}
                              placeholder={placeholder}
                              placeholderTextColor={colors.placeholder}
                              secureTextEntry={secureTextEntry}
                              onFocus={() => setFocused(true)}
                              onBlur={() => setFocused(false)}
                              // Fix for Android autofill yellow background
                              autoCapitalize="none"
                              underlineColorAndroid="transparent"
                              selectionColor="#FF803E"
                         />

                         {rightIcon && (
                              <Pressable style={styles.rightIcon} onPress={onRightIconPress}>
                                   <MaterialIcons
                                        name={rightIcon}
                                        size={22}
                                        color={colors.label}
                                   />
                              </Pressable>
                         )}
                    </View>
               </BlurView>

               {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
     );
};


export default CustomInput;

const styles = StyleSheet.create({
     container: {
          width: '100%',
          // marginBottom: 16,
     },
     inputLabel: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 8,
          marginLeft: 4,
     },
     inputContainer: {
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 56, // Fixed height for consistency
          justifyContent: 'center',
          overflow: 'hidden',
     },
     inputFocused: {
          shadowColor: '#FF803E',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
     },
     inputWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
     },
     input: {
          fontSize: 16,
          fontWeight: '500',
          flex: 1,
          height: '100%',
          paddingVertical: 0, // Important for centered text in Android
          // Important: background transparent here but solid on container
          backgroundColor: 'transparent',
     },
     rightIcon: {
          padding: 8,
          marginLeft: 4,
     },
     errorText: {
          fontSize: 12,
          color: '#FF5252',
          marginTop: 4,
          marginLeft: 4,
          fontWeight: '500',
     },
});
