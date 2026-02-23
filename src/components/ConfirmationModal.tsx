import { useAppTheme } from '@/hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import CustomButton from './CustomButton';
import { Text } from './Themed';

interface ConfirmationModalProps {
     visible: boolean;
     onClose: () => void;
     onConfirm: () => void;
     title: string;
     description: string;
     confirmText?: string;
     cancelText?: string;
     isLoading?: boolean;
     icon?: keyof typeof Feather.glyphMap;
     iconColor?: string;
}

const ConfirmationModal = ({
     visible,
     onClose,
     onConfirm,
     title,
     description,
     confirmText = 'Aceptar',
     cancelText = 'Cancelar',
     isLoading = false,
     icon = 'alert-circle',
     iconColor,
}: ConfirmationModalProps) => {
     const { colors: Colors, isDark } = useAppTheme();

     return (
          <Modal
               visible={visible}
               transparent
               animationType="fade"
               onRequestClose={onClose}
          >
               <View style={styles.overlay}>
                    <View
                         style={[
                              styles.container,
                              { backgroundColor: Colors.surfaceBackgroundColor }
                         ]}
                    >
                         {/* Icon Header */}
                         <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,108,55,0.1)' : 'rgba(255,108,55,0.05)' }]}>
                              <Feather
                                   name={icon}
                                   size={32}
                                   color={iconColor || '#FF6C37'}
                              />
                         </View>

                         {/* Content */}
                         <View style={styles.content}>
                              <Text style={[styles.title, { color: Colors.primaryTextColor }]}>
                                   {title}
                              </Text>
                              <Text style={[styles.description, { color: Colors.secondaryTextColor }]}>
                                   {description}
                              </Text>
                         </View>

                         {/* Actions */}
                         <View style={styles.footer}>
                              <CustomButton
                                   title={cancelText}
                                   onPress={onClose}
                                   variant="outlined"
                                   style={styles.button}
                                   disabled={isLoading}
                              />
                              <CustomButton
                                   title={confirmText}
                                   onPress={onConfirm}
                                   variant="primary"
                                   style={styles.button}
                                   isLoading={isLoading}
                              />
                         </View>
                    </View>
               </View>
          </Modal>
     );
};

const styles = StyleSheet.create({
     overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
     },
     container: {
          width: '100%',
          maxWidth: 340,
          borderRadius: 24,
          padding: 24,
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
     },
     iconContainer: {
          width: 64,
          height: 64,
          borderRadius: 32,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
     },
     content: {
          alignItems: 'center',
          marginBottom: 32,
     },
     title: {
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 8,
          textAlign: 'center',
     },
     description: {
          fontSize: 15,
          textAlign: 'center',
          lineHeight: 22,
     },
     footer: {
          flexDirection: 'row',
          gap: 12,
          width: '100%',
     },
     button: {
          flex: 1,
          height: 48,
     },
});

export default ConfirmationModal;
