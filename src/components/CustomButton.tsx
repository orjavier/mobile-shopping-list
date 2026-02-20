import { useColorScheme } from '@/components/useColorScheme';
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
     const colorScheme = useColorScheme();

     const COLORS = {
          primary: '#FF803E',
          danger: '#dc3545',
          warning: '#ffc107',
          white: '#ffffff',
          black: '#000000',
          grey: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
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
                              color: colorScheme === 'dark' ? COLORS.white : COLORS.black,
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
                              color: colorScheme === 'dark' ? '#000' : '#000',
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
                    disabled && styles.disabledButton,
                    style,
               ]}
          >
               {isLoading ? (
                    <ActivityIndicator color={variant === 'outlined' ? COLORS.primary : (variant === 'warning' ? '#000' : '#fff')} />
               ) : (
                    <Text style={[
                         styles.text,
                         variantStyles.text,
                         disabled && styles.disabledText,
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
          borderRadius: 25,
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
          fontWeight: 'bold',
          fontSize: 17,
          fontFamily: 'SF',
     },
     disabledButton: {
          backgroundColor: '#cccccc',
          borderColor: '#bbbbbb',
          shadowOpacity: 0,
          elevation: 0,
     },
     disabledText: {
          color: '#888888',
     },
});

export default CustomButton;
