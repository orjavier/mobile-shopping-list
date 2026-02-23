import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomTabBar, { PRIMARY } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ICategory } from '@/interfaces/category.interface';
import { IProduct } from '@/interfaces/product.interface';
import { categoryRepository } from '@/repositories/category.repository';
import { productRepository } from '@/repositories/product.repository';
import mediaService from '@/services/media.service';
import { showToast } from '@/toast';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
const UNITS = ['Unidad', 'Kilo', 'Medio Kilo', 'Gramo', 'Litro', 'Medio Litro', 'Mililitro', 'Galón', 'Botella', 'Lata', 'Paquete', 'Caja', 'Bolsa', 'Docena'];
const { width: WIDTH } = Dimensions.get('window');

export const ProductsScreen = () => {
	const { colors: Colors, isDark } = useAppTheme();
	const [products, setProducts] = useState<IProduct[]>([]);
	const [categories, setCategories] = useState<ICategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const bottomSheetRef = useRef<{ open: () => void; close: () => void } | null>(null);
	const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
	const [productName, setProductName] = useState('');
	const [productPrice, setProductPrice] = useState('');
	const [productQuantity, setProductQuantity] = useState('1');
	const [productUnit, setProductUnit] = useState('Unidad');
	const [productCategory, setProductCategory] = useState<string | undefined>(undefined);
	const [productImageUri, setProductImageUri] = useState<string | null>(null);
	const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
	const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

	const fetchData = useCallback(async () => {
		try {
			const [prodsData, catsData] = await Promise.all([
				productRepository.findAll(),
				categoryRepository.findAll(),
			]);
			setProducts(prodsData || []);
			setCategories(catsData || []);
		} catch (error: unknown) {
			console.error('Error fetching data:', error);
			showToast.error('Error', 'No se pudieron cargar los datos');
		} finally {
			setIsLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const onRefresh = () => {
		setRefreshing(true);
		fetchData();
	};

	const openAddSheet = () => {
		setEditingProduct(null);
		setProductName('');
		setProductPrice('');
		setProductQuantity('1');
		setProductUnit('Unidad');
		setProductCategory(undefined);
		setProductImageUri(null);
		bottomSheetRef.current?.open();
	};

	const openEditSheet = (product: IProduct) => {
		setEditingProduct(product);
		setProductName(product.name);
		setProductPrice(String(product.defaultPrice || 0));
		setProductQuantity(String(product.defaultQuantity || 1));
		setProductUnit(product.defaultUnit || 'Unidad');
		setProductCategory(product.category);
		setProductImageUri(product.secure_url || product.imageUrl || null);
		bottomSheetRef.current?.open();
	};

	const closeSheet = () => {
		bottomSheetRef.current?.close();
	};

	const handleCloseCategoryModal = () => {
		setIsCategoryModalVisible(false);
		fetchData();
	};

	const handleSave = async () => {
		if (!productName.trim()) {
			showToast.error('Error', 'El nombre es obligatorio');
			return;
		}

		setIsSaving(true);
		try {
			let finalSecureUrl = editingProduct?.secure_url;
			let finalPublicId = editingProduct?.public_id;

			if (productImageUri && !productImageUri.startsWith('http')) {
				const uploadRes = await mediaService.uploadImage(productImageUri);
				if (uploadRes && uploadRes.data && uploadRes.data.secure_url) {
					finalSecureUrl = uploadRes.data.secure_url;
					finalPublicId = uploadRes.data.public_id;
				}
			}

			const productData = {
				name: productName.trim(),
				defaultPrice: parseFloat(productPrice) || 0,
				defaultQuantity: parseFloat(productQuantity) || 1,
				defaultUnit: productUnit,
				category: productCategory,
				secure_url: finalSecureUrl,
				public_id: finalPublicId,
			};

			if (editingProduct?._id) {
				await productRepository.update(editingProduct._id, productData);
				showToast.success('Éxito', 'Producto actualizado');
			} else {
				await productRepository.create(productData);
				showToast.success('Éxito', 'Producto creado');
			}
			closeSheet();
			fetchData();
		} catch (error: unknown) {
			console.error('Error saving product:', error);
			showToast.error('Error', 'No se pudo guardar el producto');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = (product: IProduct) => {
		Alert.alert(
			'Eliminar Producto',
			`¿Estás seguro de que quieres eliminar "${product.name}"?`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: async () => {
						try {
							await productRepository.delete(product._id!);
							showToast.success('Éxito', 'Producto eliminado');
							fetchData();
						} catch (error: unknown) {
							showToast.error('Error', 'No se pudo eliminar el producto');
						}
					},
				},
			],
		);
	};

	if (isLoading) {
		return (
			<View style={[styles.container, { backgroundColor: Colors.screenBackgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
				<ActivityIndicator size="large" color={PRIMARY} />
			</View>
		);
	}

	const showImagePickerOptions = () => {
		Alert.alert("Foto de Producto", "Elige una opción", [
			{ text: "Cámara", onPress: () => handleImageSelection("camera") },
			{ text: "Galería", onPress: () => handleImageSelection("gallery") },
			{ text: "Cancelar", style: "cancel" },
		]);
	};

	const handleImageSelection = async (mode: "camera" | "gallery") => {
		try {
			let result;
			if (mode === "camera") {
				const { status } = await ImagePicker.requestCameraPermissionsAsync();
				if (status !== "granted") {
					Alert.alert(
						"Permiso denegado",
						"Se necesita permiso para usar la cámara.",
					);
					return;
				}
				result = await ImagePicker.launchCameraAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to use MediaTypeOptions
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.5,
				});
			} else {
				const { status } =
					await ImagePicker.requestMediaLibraryPermissionsAsync();
				if (status !== "granted") {
					Alert.alert(
						"Permiso denegado",
						"Se necesita permiso para acceder a la galería.",
					);
					return;
				}
				result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to use MediaTypeOptions
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.5,
				});
			}

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const selectedUri = result.assets[0].uri;
				setProductImageUri(selectedUri);
			}
		} catch (error) {
			console.error("Error selecting image", error);
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: Colors.screenBackgroundColor }]}>
			<View style={styles.header}>
				<Text style={[styles.headerTitle, { color: Colors.primaryTextColor }]}>Productos</Text>
				<Text style={[styles.headerSubtitle, { color: Colors.tertiaryTextColor }]}>
					{products.length} {products.length === 1 ? 'producto' : 'productos'}
				</Text>
			</View>

			<View style={styles.content}>
				{products.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Feather name="box" size={64} color={Colors.tertiaryTextColor} style={{ opacity: 0.5 }} />
						<Text style={[styles.emptyText, { color: Colors.primaryTextColor }]}>No hay productos</Text>
						<Text style={[styles.emptySubtext, { color: Colors.tertiaryTextColor }]}>
							Toca el botón + para crear uno
						</Text>
					</View>
				) : (
					<ScrollView
						style={styles.listContainer}
						contentContainerStyle={styles.listContent}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								tintColor={PRIMARY}
							/>
						}
						showsVerticalScrollIndicator={false}
					>
						{products.map((product) => (
							<Pressable
								key={product._id || Math.random().toString()}
								style={[styles.productCard, { backgroundColor: Colors.surfaceBackgroundColor }]}
								onPress={() => openEditSheet(product)}
								onLongPress={() => handleDelete(product)}
							>
								{
									product.imageUrl || product.secure_url ? (
										<Image
											source={{ uri: product.imageUrl || product.secure_url }}
											style={product.imageUrl || product.secure_url ? styles.productImage : styles.defaultProductImage}
											resizeMode="cover"
										/>
									) : (
										<View style={[styles.defaultProductImage, { justifyContent: 'center', alignItems: 'center' }]}>
											<Feather
												name="shopping-cart"
												size={24}
												color={isDark ? Colors.primaryTextColor : PRIMARY}
											/>
										</View>
									)
								}
								<View style={styles.productInfo}>
									<Text style={[styles.productName, { color: Colors.primaryTextColor }]} numberOfLines={1}>
										{product.name}
									</Text>
									<Text style={[styles.productDetail, { color: Colors.tertiaryTextColor }]}>
										{product.defaultUnit}
									</Text>
									{!!product.category && (
										<Text style={[styles.productCategory, { color: Colors.colorLabelTextColor }]}>
											{categories.find((c) => c._id === product.category)?.name || 'Desconocida'}
										</Text>
									)}
									{!!product.defaultPrice && (
										<Text style={[styles.productPrice, { color: PRIMARY }]}>
											${Number(product.defaultPrice).toFixed(2)}
										</Text>
									)}
								</View>
								<Pressable onPress={() => openEditSheet(product)} style={styles.editButton}>
									<Feather name="edit-2" size={20} color={Colors.tertiaryTextColor} />
								</Pressable>
							</Pressable>
						))}
					</ScrollView>
				)}
			</View>

			<RBSheet
				ref={bottomSheetRef}
				height={620}
				draggable
				customStyles={{
					wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
					container: {
						backgroundColor: Colors.bottomSheetBackgroundColor,
						borderTopLeftRadius: 24,
						borderTopRightRadius: 24,
					},
					draggableIcon: styles.draggableIcon, // CREAR EL ESTILO PARA QUE DEJAR EL ESPACIO PARA ARRASTRAR EL BOTTOM SHEET PARA QUE SE PUEDA ARRASTRAR EN EL HADER
				}}
			>
				<View style={styles.bottomSheetContent}>
					{/* NOTA: IMPORTANTE NO MODIFICAR LAS SIGUIENTES 2 LINEAS PARA MOSTRAR LA LINEA TOP DEL SHEET Y EL TITULO  */}
					<View style={[styles.bottomSheetHandle, { backgroundColor: isDark ? '#555' : '#DDD', }]} />
					<Text style={[styles.bottomSheetTitle, { color: Colors.primaryTextColor, }]}>{editingProduct?._id ? 'Editar Producto' : 'Nuevo Producto'}</Text>
					{/* FIN DEL BLOQUE */}

					<View style={styles.uploadSection}>
						<Pressable
							style={[
								styles.uploadContainer,
								{
									backgroundColor: isDark ? 'rgba(255,128,62,0.05)' : 'rgba(255,128,62,0.02)',
									borderColor: PRIMARY,
								}
							]}
							onPress={showImagePickerOptions}
							disabled={isSaving}
						>
							{productImageUri ? (
								<Image
									source={{ uri: productImageUri }}
									style={[styles.selectedImage, isSaving && { opacity: 0.5 }]}
									resizeMode="cover"
								/>
							) : (
								<View style={styles.uploadPlaceholder}>
									<View style={[styles.uploadIconCircle, { backgroundColor: isDark ? 'rgba(255,128,62,0.15)' : 'rgba(255,128,62,0.1)' }]}>
										<Feather name="camera" size={28} color={PRIMARY} />
									</View>
									<Text style={[styles.uploadTitle, { color: Colors.primaryTextColor }]}>Tap para seleccionar la imagen</Text>
									<Text style={[styles.uploadSubtitle, { color: Colors.tertiaryTextColor }]}>
										PNG, JPG o PDF hasta 10MB
									</Text>
								</View>
							)}
						</Pressable>

						<CustomButton
							title="Seleccionar Imagen"
							onPress={showImagePickerOptions}
							variant="primary"
							leftIcon={<Feather name="camera" size={20} color="#fff" />}
							style={styles.browseButton}
							disabled={isSaving}
						/>
					</View>

					<CustomInput
						label=""
						placeholder="Nombre del producto"
						value={productName}
						onChangeText={setProductName}
					/>

					<View style={styles.row}>
						<View style={styles.halfInput}>
							<CustomInput
								label=""
								placeholder="Cantidad"
								value={productQuantity}
								onChangeText={setProductQuantity}
							/>
						</View>
						<View style={styles.halfInput}>
							<Pressable
								style={[styles.unitSelector, { backgroundColor: isDark ? 'rgba(30,30,30,1)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#E5E5EA' }]}
								onPress={() => setIsUnitModalVisible(true)}
							>
								<Text style={[styles.unitSelectorText, { color: productUnit ? Colors.primaryTextColor : Colors.tertiaryTextColor }]}>
									{productUnit || 'Unidad'}
								</Text>
								<Feather name="chevron-down" size={20} color={Colors.tertiaryTextColor} />
							</Pressable>
						</View>
					</View>

					<Pressable
						style={[styles.unitSelector, { backgroundColor: isDark ? 'rgba(30,30,30,1)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#E5E5EA', }]}
						onPress={() => setIsCategoryModalVisible(true)}
					>
						<Text style={[styles.unitSelectorText, { color: productCategory ? Colors.primaryTextColor : Colors.tertiaryTextColor }]}>
							{productCategory ? categories.find(c => c._id === productCategory)?.name || 'Desconocida' : 'Seleccionar Categoría'}
						</Text>
						<Feather name="chevron-down" size={20} color={Colors.tertiaryTextColor} />
					</Pressable>

					<CustomInput
						label=""
						placeholder="Precio por defecto"
						value={productPrice}
						onChangeText={setProductPrice}
					/>

					<View style={styles.bottomSheetButtons}>
						<CustomButton
							title="Cancelar"
							onPress={closeSheet}
							variant="outlined"
							style={styles.cancelButton}
						/>
						<CustomButton
							title={isSaving ? 'Guardando...' : 'Guardar'}
							onPress={handleSave}
							disabled={isSaving}
							style={styles.saveButton}
						/>
					</View>
				</View>
			</RBSheet>

			{/* ── Custom Tab Bar ── */}
			<CustomTabBar activeRoute="/(tabs)/products" onFabPress={openAddSheet} />

			{/* ── Unit Selection Modal ── */}
			<Modal
				visible={isUnitModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setIsUnitModalVisible(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setIsUnitModalVisible(false)}
				>
					<View style={[styles.modalContent, { backgroundColor: Colors.bottomSheetBackgroundColor }]}>
						<Text style={[styles.modalTitle, { color: Colors.primaryTextColor }]}>Seleccionar Unidad</Text>
						<ScrollView style={styles.modalScroll}>
							{UNITS.map((unit) => (
								<Pressable
									key={unit}
									style={[styles.modalOption, productUnit === unit && { backgroundColor: PRIMARY + '20' }]}
									onPress={() => {
										setProductUnit(unit);
										setIsUnitModalVisible(false);
									}}
								>
									<Text style={[styles.modalOptionText, { color: productUnit === unit ? PRIMARY : Colors.primaryTextColor }]}>
										{unit}
									</Text>
									{productUnit === unit && <Feather name="check" size={20} color={PRIMARY} />}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>

			{/* ── Category Selection Modal ── */}
			<Modal
				visible={isCategoryModalVisible}
				transparent
				animationType="fade"
				onRequestClose={handleCloseCategoryModal}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={handleCloseCategoryModal}
				>
					<View style={[styles.modalContent, { backgroundColor: Colors.bottomSheetBackgroundColor }]}>
						<Text style={[styles.modalTitle, { color: Colors.primaryTextColor }]}>Seleccionar Categoría</Text>
						<ScrollView style={styles.modalScroll}>
							<Pressable
								style={[styles.modalOption, !productCategory && { backgroundColor: PRIMARY + '20' }]}
								onPress={() => {
									setProductCategory(undefined);
									setIsCategoryModalVisible(false);
								}}
							>
								<Text style={[styles.modalOptionText, { color: !productCategory ? PRIMARY : Colors.primaryTextColor }]}>
									Sin categoría
								</Text>
								{!productCategory && <Feather name="check" size={20} color={PRIMARY} />}
							</Pressable>
							{categories.map((c) => (
								<Pressable
									key={c._id}
									style={[styles.modalOption, productCategory === c._id && { backgroundColor: PRIMARY + '20' }]}
									onPress={() => {
										setProductCategory(c._id);
										setIsCategoryModalVisible(false);
									}}
								>
									<Text style={[styles.modalOptionText, { color: productCategory === c._id ? PRIMARY : Colors.primaryTextColor }]}>
										{c.name}
									</Text>
									{productCategory === c._id && <Feather name="check" size={20} color={PRIMARY} />}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	headerTitle: {
		fontSize: 20,
	},
	headerSubtitle: {
		fontSize: 16,
		marginTop: 4,
	},
	content: {
		flex: 1,
		paddingTop: 8,
	},
	listContainer: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 100,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 100,
	},
	emptyText: {
		fontSize: 20,
		fontWeight: '600',
		marginTop: 16,
	},
	emptySubtext: {
		fontSize: 14,
		marginTop: 8,
	},
	productCard: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
	},
	defaultProductImage: {
		// width: 60,
		// height: 60,
		// borderRadius: 50,
		// marginRight: 16,
		// backgroundColor: '#E2E8F0',
		width: 60,
		height: 60,
		marginRight: 16,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		// shadowColor: '#000',
		// shadowOffset: { width: 0, height: 2 },
		// shadowOpacity: 0.05,
		// shadowRadius: 6,
		// elevation: 2,
	},
	productImage: {
		width: 60,
		height: 60,
		//borderRadius: 50,
		marginRight: 16,
	},
	productInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	productName: {
		fontSize: 16,
		fontWeight: '600',
	},
	productDetail: {
		fontSize: 14,
		marginTop: 4,
	},
	productCategory: {
		fontSize: 13,
		marginTop: 4,
	},
	productPrice: {
		fontSize: 16,
		fontWeight: '700',
		marginTop: 6,
	},
	editButton: {
		padding: 8,
		marginLeft: 8,
	},
	bottomSheetBackground: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	draggableIcon: {
		backgroundColor: 'transparent',
		height: 50,
		width: '100%'
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
	bottomSheetContent: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 8,
		gap: 12,
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
	row: {
		flexDirection: 'row',
		gap: 12,
	},
	halfInput: {
		flex: 1,
	},
	bottomSheetButtons: {
		flexDirection: 'row',
		gap: 12,
	},
	cancelButton: {
		flex: 1,
	},
	saveButton: {
		flex: 1,
	},
	unitSelector: {
		height: 45,
		borderRadius: 8,
		borderWidth: 1.5,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	unitSelectorText: {
		fontSize: 16,
		fontWeight: '500',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '80%',
		maxHeight: '70%',
		borderRadius: 16,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 10,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 16,
		textAlign: 'center',
	},
	modalScroll: {
		marginBottom: 8,
	},
	modalOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginBottom: 4,
	},
	modalOptionText: {
		fontSize: 16,
		fontWeight: '500',
	},
	uploadSection: {
		width: '100%',
		alignItems: 'center',
	},
	uploadContainer: {
		width: '100%',
		height: 160,
		borderRadius: 20,
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: PRIMARY,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		marginBottom: 16,
	},
	selectedImage: {
		width: '55%',
		height: '100%',
	},
	uploadPlaceholder: {
		alignItems: 'center',
	},
	uploadIconCircle: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
	},
	uploadTitle: {
		fontSize: 16,
		marginBottom: 4,
	},
	uploadSubtitle: {
		fontSize: 12,
		fontWeight: '500',
	},
	browseButton: {
		width: '100%',
		height: 52,
	},
});

export default ProductsScreen;