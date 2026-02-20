import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StatusBar,
	StyleSheet
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { userRepository } from '@/repositories';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme';
import { showToast } from '@/toast';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, View } from 'react-native';

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const setAuth = useAuthStore((state) => state.setAuth);
	const { isDarkMode, color } = useTheme();
	const { width } = Dimensions.get('window');

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			showToast.error('Error', 'Por favor ingresa email y contraseña');
			return;
		}

		setIsLoading(true);
		try {
			const user = await userRepository.login(email, password);
			const token = useAuthStore.getState().token;
			if (token && user) {
				setAuth(user, token);
				router.replace('/(tabs)');
			}
		} catch (error: unknown) {
			let message = 'Error al iniciar sesión';

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
					source={require('../../assets/SVGs/superior-blob.svg')}
					style={{ width: 620, height: 426, position: 'absolute', top: -100, right: -180, opacity: 0.2, transform: [{ rotate: '160deg' }] }}
					contentFit="cover"
				/>
				<Image
					source={require('../../assets/SVGs/inferior-blob.svg')}
					style={{ width: 550, height: 370, position: 'absolute', bottom: -200, right: -10, opacity: 0.2, }}
					contentFit="cover"
				/>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={{ flex: 1 }}
				>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.form}>
							<View style={styles.header}>
								<Image
									source={require('../../assets/images/logo-border-white.png')}
									style={{ width: 250, height: 86, marginRight: -20 }}
									contentFit="cover"
								/>
							</View>
							<Text style={styles.title}>Bienvenido de nuevo.</Text>
							<Text style={styles.subtitle}>Por favor, introduzca sus datos.</Text>
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
							<View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -10, marginBottom: 40 }}>
								<Pressable onPress={() => { }}>
									<Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'SF', }}>¿Olvidaste la contraseña? </Text>
								</Pressable>
							</View>

							<CustomButton
								title="Iniciar Sesión"
								variant="outlined"
								onPress={handleLogin}
								isLoading={isLoading}
								style={styles.loginButton}
							/>
							<View style={styles.footer}>
								<Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'SF', }}>¿No tienes cuenta? </Text>
								<Pressable onPress={() => router.replace('/register')}>
									<Text style={styles.linkText}>Regístrate</Text>
								</Pressable>
							</View>
							<View style={styles.fingerprintContainer}>
								<Pressable style={styles.fingerprint}>
									<MaterialIcons name="fingerprint" size={60} color="white" />
								</Pressable>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
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
		marginBottom: 80,
		gap: 20,
	},
	title: {
		fontSize: 24,
		fontFamily: 'SF',
		fontWeight: 'bold',
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 50,

	},
	form: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 40,
	},
	scrollContent: {
		flexGrow: 1,
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
		width: '100%',
	},
	footerText: {
		color: '#666',
		fontSize: 14,

	},
	linkText: {
		color: '#fff',
		fontWeight: '600',
	},
	fingerprintContainer: {
		alignItems: 'center',
		marginTop: 40,
		marginBottom: 20,
	},
	fingerprint: {
		// Centering handled by fingerprintContainer
	}
});
