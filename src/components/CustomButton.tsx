import { useTheme } from '@/theme';
import React from 'react';
import {
     ActivityIndicator,
     Platform,
     Pressable,
     StyleSheet,
     Text,
     TextStyle,
     ViewStyle
} from 'react-native';

type ButtonVariant = 'primary' | 'outlined' | 'danger' | 'warning';

interface CustomButtonProps {
     title: string;
     onPress: () => void;
     variant?: ButtonVariant;
     isLoading?: boolean;
     disabled?: boolean;
     style?: ViewStyle;
     textStyle?: TextStyle;
}

const CustomButton = ({
     title,
     onPress,
     variant = 'primary',
     isLoading = false,
     disabled = false,
     style,
     textStyle
}: CustomButtonProps) => {
     const { isDarkMode } = useTheme();

     const COLORS = {
          primary: '#FF803E',
          danger: '#dc3545',
          warning: '#ffc107',
          white: '#ffffff',
          black: '#000000',
          grey: isDarkMode ? '#333333' : '#e0e0e0',
     };

     const dynamicDisabledStyles = {
          button: {
               backgroundColor: isDarkMode ? '#333333' : '#cccccc',
               borderColor: isDarkMode ? '#555555' : '#bbbbbb',
               shadowOpacity: 0,
               elevation: 0,
          } as ViewStyle,
          text: {
               color: isDarkMode ? '#888888' : '#888888',
          } as TextStyle,
     };

     const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
          switch (variant) {
               case 'outlined':
                    return {
                         button: {
                              backgroundColor: 'transparent',
                              borderWidth: 2,
                              borderColor: COLORS.primary,
                              shadowOpacity: 0,
                              elevation: 0,
                         },
                         text: {
                              color: isDarkMode ? '#ffffff' : '#000000',
                         },
                    };
               case 'danger':
                    return {
                         button: {
                              backgroundColor: COLORS.danger,
                              shadowColor: COLORS.danger,
                         },
                         text: {
                              color: COLORS.white,
                         },
                    };
               case 'warning':
                    return {
                         button: {
                              backgroundColor: COLORS.warning,
                              shadowColor: COLORS.warning,
                         },
                         text: {
                              color: isDarkMode ? '#ffffff' : '#000000',
                         },
                    };
               case 'primary':
               default:
                    return {
                         button: {
                              backgroundColor: COLORS.primary,
                              shadowColor: COLORS.primary,
                         },
                         text: {
                              color: COLORS.white,
                         },
                    };
          }
     };

     const variantStyles = getVariantStyles();

     return (
          <Pressable
               onPress={onPress}
               disabled={disabled || isLoading}
               style={[
                    styles.button,
                    variantStyles.button,
                    disabled && dynamicDisabledStyles.button,
                    style,
               ]}
          >
               {isLoading ? (
                    <ActivityIndicator color={variant === 'outlined' ? COLORS.primary : (variant === 'warning' ? '#000000' : '#ffffff')} />
               ) : (
                    <Text style={[
                         styles.text,
                         variantStyles.text,
                         disabled && dynamicDisabledStyles.text,
                         textStyle
                    ]}>
                         {title}
                    </Text>
               )}
          </Pressable>
     );
};

const styles = StyleSheet.create({
     button: {
          height: 50,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          ...Platform.select({
               ios: {
                    shadowOffset: {
                         width: 0,
                         height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
               },
               android: {
                    elevation: 5,
               },
          }),
     },
     text: {
          fontSize: 17,
          fontFamily: 'SF',
     },
});

export default CustomButton;
