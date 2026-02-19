import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
	ImageBackground,
	StatusBar,
	StyleSheet,
	TouchableOpacity
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { userRepository } from '@/repositories';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { View } from 'react-native';

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const setAuth = useAuthStore((state) => state.setAuth);

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

	return (
		<View style={styles.container}>
			<View style={styles.body}>
				<StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
				<ImageBackground
					resizeMode="cover" // or cover
					style={styles.body}
					source={require('../../assets/images/background_login.png')}
				>
					<View style={styles.header}>
						<Text style={styles.title}>Iniciar Sesión</Text>
					</View>
					<View style={styles.form}>
						<View style={styles.inputContainer}>
							<CustomInput
								label="Email"
								value={email}
								onChangeText={setEmail}
								placeholder="ejemplo@correo.com"
								rightIcon="email"
							/>
						</View>

						<View style={styles.inputContainer}>
							<CustomInput
								label="Contraseña"
								value={password}
								onChangeText={setPassword}
								placeholder="Introduzca su contraseña"
								secureTextEntry
								rightIcon="lock"
							/>
						</View>

						<CustomButton
							title="Iniciar Sesión"
							onPress={handleLogin}
							isLoading={isLoading}
							style={styles.loginButton}
						/>
					</View>

					<View style={styles.footer}>
						<Text style={styles.footerText}>¿No tienes cuenta? </Text>
						<TouchableOpacity>
							<Text style={styles.linkText}>Regístrate</Text>
						</TouchableOpacity>
					</View>
				</ImageBackground>
			</View>
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
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
	},
	form: {
		width: '100%',
		paddingHorizontal: 20,
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
