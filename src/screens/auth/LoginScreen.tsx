import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
	StatusBar,
	StyleSheet,
	TouchableOpacity
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { userRepository } from '@/repositories';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme';
import { showToast } from '@/toast';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const setAuth = useAuthStore((state) => state.setAuth);
	const { isDarkMode, color } = useTheme();

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
				colors={['#f58300', '#ffc340ff', '#f58300']}
				start={{ x: 0.07, y: 0.24 }}
				end={{ x: 0.93, y: 0.76 }}
			>
				<StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
				<View style={styles.form}>
					<View style={styles.header}>
						<Text style={styles.title}>Iniciar Sesión</Text>
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

					<CustomButton
						title="Iniciar Sesión"
						variant="outlined"
						onPress={handleLogin}
						isLoading={isLoading}
						style={styles.loginButton}
					/>
					<View style={styles.footer}>
						<Text style={{ color: isDarkMode ? color.dark.text : color.light.text, fontFamily: 'SF' }}>¿No tienes cuenta? </Text>
						<TouchableOpacity>
							<Text style={styles.linkText}>Regístrate</Text>
						</TouchableOpacity>
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
	},
	title: {
		fontSize: 24,
		fontFamily: 'SF',
		marginBottom: 8,
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
		// paddingTop: 50,
		// marginTop: 150,
		//backgroundColor: 'rgba(255, 255, 255, 0.5)',
		// borderTopWidth: 1,
		// borderTopColor: '#fff',
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
	},
	linkText: {
		color: '#FF803E',
		fontWeight: '600',
	},
});
