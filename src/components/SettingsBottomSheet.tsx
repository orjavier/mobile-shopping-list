import ConfirmationModal from '@/components/ConfirmationModal';
import CustomSwitch from '@/components/CustomSwitch';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSharedValue } from 'react-native-reanimated';

const PRIMARY = '#FF6C37';

interface SettingsBottomSheetProps {
	bottomSheetRef: React.RefObject<{ open: () => void; close: () => void } | null>;
}

export interface SettingsBottomSheetRef {
	open: () => void;
	close: () => void;
}

const SettingsBottomSheet = forwardRef<SettingsBottomSheetRef, SettingsBottomSheetProps>(
	function SettingsBottomSheet({ bottomSheetRef }, ref) {
		const router = useRouter();
		const { colors: Colors, isDark } = useAppTheme();
		const { setTheme } = useThemeStore();
		const logout = useAuthStore((s) => s.logout);

		const [showLogoutModal, setShowLogoutModal] = useState(false);
		const internalRef = useRef<{ open: () => void; close: () => void }>(null);

		useImperativeHandle(ref, () => ({
			open: () => internalRef.current?.open(),
			close: () => internalRef.current?.close(),
		}));

		useImperativeHandle(bottomSheetRef, () => ({
			open: () => internalRef.current?.open(),
			close: () => internalRef.current?.close(),
		}));

		const isDarkShared = useSharedValue(isDark);
		const notificationsEnabled = useSharedValue(false);

		useEffect(() => {
			isDarkShared.value = isDark;
		}, [isDark]);

		const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

		const handleLogoutPress = () => setShowLogoutModal(true);

		const handleLogoutConfirm = () => {
			setShowLogoutModal(false);
			internalRef.current?.close();
			logout();
			router.replace('/auth/login' as never);
		};

		const renderSettingItem = ({
			icon,
			label,
			rightElement,
			onPress,
		}: {
			icon: string;
			label: string;
			rightElement?: React.ReactNode;
			onPress?: () => void;
		}) => {
			const itemStyle = styles.itemContainer;

			return (
				<TouchableOpacity
					key={label}
					style={itemStyle}
					activeOpacity={onPress ? 0.7 : 1}
					onPress={onPress}
					disabled={!onPress}
				>
					<View style={styles.itemContent}>
						<View style={styles.cardIconLabel}>
							<View style={styles.iconCircle}>
								<Feather name={icon as any} size={22} color={PRIMARY} />
							</View>
							<Text style={[styles.cardLabel, { color: Colors.primaryTextColor }]}>{label}</Text>
						</View>
						{rightElement}
					</View>
				</TouchableOpacity>
			);
		};

		return (
			<>
				<RBSheet
					ref={internalRef}
					height={320}
					draggable
					customStyles={{
						wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
						container: {
							backgroundColor: Colors.bottomSheetBackgroundColor,
							borderTopLeftRadius: 24,
							borderTopRightRadius: 24,
						},
						draggableIcon: styles.draggableIcon,
					}}
				>
					<View style={styles.bottomSheetContent}>
						{/* Handle + Title — no modificar este bloque */}
						<View style={[styles.bottomSheetHandle, { backgroundColor: isDark ? '#555' : '#DDD' }]} />
						<Text style={[styles.bottomSheetTitle, { color: Colors.primaryTextColor }]}>
							{isDark ? 'Configuraciones' : 'Configuración'}
						</Text>
						{/* Fin del bloque */}

						{renderSettingItem({
							icon: 'bell',
							label: 'Notificaciones',
							rightElement: (
								<CustomSwitch
									value={notificationsEnabled}
									onPress={() => {
										notificationsEnabled.value = !notificationsEnabled.value;
									}}
									trackColors={{
										off: Colors.borderColor,
										on: PRIMARY
									}}
								/>
							),
						})}
						<View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

						{renderSettingItem({
							icon: 'moon',
							label: 'Tema',
							rightElement: (
								<CustomSwitch
									value={isDarkShared}
									onPress={toggleTheme}
									trackColors={{
										off: Colors.borderColor,
										on: PRIMARY
									}}
								/>
							),
						})}
						<View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

						{renderSettingItem({
							icon: 'log-out',
							label: 'Cerrar sesión',
							onPress: handleLogoutPress,
						})}
					</View>
				</RBSheet>

				<ConfirmationModal
					visible={showLogoutModal}
					onClose={() => setShowLogoutModal(false)}
					onConfirm={handleLogoutConfirm}
					title="Cerrar sesión"
					description="¿Estás seguro de que quieres cerrar sesión?"
					confirmText="Sí"
					cancelText="No"
					icon="log-out"
					iconColor="#FF6C37"
				/>
			</>
		);
	}
);

export default SettingsBottomSheet;

const styles = StyleSheet.create({
	draggableIcon: {
		backgroundColor: 'transparent',
		height: 50,
		width: '100%',
	},
	bottomSheetContent: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 10,
		gap: 4,

	},
	bottomSheetHandle: {
		height: 3,
		width: 80,
		borderRadius: 10,
		alignSelf: 'center',
		position: 'absolute',
		top: -60,
		justifyContent: 'center',
		alignItems: 'center'
	},
	bottomSheetTitle: {
		fontSize: 20,
		textAlign: 'center',
		position: 'absolute',
		top: -40,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: -1,
	},
	pillCard: {
		borderRadius: 30,
	},
	itemContainer: {
		height: 64,
		justifyContent: 'center',
		paddingHorizontal: 12,
	},
	itemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	cardIconLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	iconCircle: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cardLabel: {
		fontSize: 16,
	},
	divider: {
		height: 1,
		width: '100%',
		marginVertical: 2,
	},
});
