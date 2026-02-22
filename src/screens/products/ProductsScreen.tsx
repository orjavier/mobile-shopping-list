import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomTabBar, { PRIMARY } from '@/components/CustomTabBar';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { ICategory } from '@/interfaces/category.interface';
import { IProduct } from '@/interfaces/product.interface';
import { categoryRepository } from '@/repositories/category.repository';
import { productRepository } from '@/repositories/product.repository';
import { showToast } from '@/toast';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const UNITS = ['Unidad', 'Kilo', 'Medio Kilo', 'Gramo', 'Litro', 'Medio Litro', 'Mililitro', 'Galón', 'Botella', 'Lata', 'Paquete', 'Caja', 'Bolsa', 'Docena'];

const LIGHT = {
  bg: '#F9FAFB',
  text: '#0F172A',
  textSub: '#64748B',
  cardBg: '#FFFFFF',
  bottomSheetBg: '#FFFFFF',
  handle: '#ddd',
  colorLabel: '#666',
};

const DARK = {
  bg: '#0F0F0F',
  text: '#F1F5F9',
  textSub: '#94A3B8',
  cardBg: 'rgba(255,255,255,0.06)',
  bottomSheetBg: '#1C1C1E',
  handle: '#444',
  colorLabel: '#94A3B8',
};

export default function ProductsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? DARK : LIGHT;

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
    bottomSheetRef.current?.open();
  };

  const openEditSheet = (product: IProduct) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.defaultPrice || 0));
    setProductQuantity(String(product.defaultQuantity || 1));
    setProductUnit(product.defaultUnit || 'Unidad');
    setProductCategory(product.category);
    bottomSheetRef.current?.open();
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      showToast.error('Error', 'El nombre es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: productName.trim(),
        defaultPrice: parseFloat(productPrice) || 0,
        defaultQuantity: parseFloat(productQuantity) || 1,
        defaultUnit: productUnit,
        category: productCategory,
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
      <View style={[styles.container, { backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Productos</Text>
        <Text style={[styles.headerSubtitle, { color: C.textSub }]}>
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </Text>
      </View>

      <View style={styles.content}>
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="box" size={64} color={C.textSub} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: C.text }]}>No hay productos</Text>
            <Text style={[styles.emptySubtext, { color: C.textSub }]}>
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
              <TouchableOpacity
                key={product._id || Math.random().toString()}
                style={[styles.productCard, { backgroundColor: C.cardBg }]}
                onPress={() => openEditSheet(product)}
                onLongPress={() => handleDelete(product)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: product.imageUrl || product.secure_url || 'https://via.placeholder.com/150?text=Prod' }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: C.text }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productDetail, { color: C.textSub }]}>
                    {product.defaultQuantity} {product.defaultUnit}
                  </Text>
                  {!!product.category && (
                    <Text style={[styles.productCategory, { color: C.colorLabel }]}>
                      Categoría: {categories.find((c) => c._id === product.category)?.name || 'Desconocida'}
                    </Text>
                  )}
                  {!!product.defaultPrice && (
                    <Text style={[styles.productPrice, { color: PRIMARY }]}>
                      ${Number(product.defaultPrice).toFixed(2)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => openEditSheet(product)} style={styles.editButton}>
                  <Feather name="edit-2" size={20} color={C.textSub} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <RBSheet
        ref={bottomSheetRef}
        height={400}
        draggable
      >
        <View style={styles.bottomSheetContent}>
          <Text style={[styles.bottomSheetTitle, { color: C.text }]}>
            {editingProduct?._id ? 'Editar Producto' : 'Nuevo Producto'}
          </Text>

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
                <Text style={[styles.unitSelectorText, { color: productUnit ? C.text : C.textSub }]}>
                  {productUnit || 'Unidad'}
                </Text>
                <Feather name="chevron-down" size={20} color={C.textSub} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.unitSelector, { backgroundColor: isDark ? 'rgba(30,30,30,1)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#E5E5EA', }]}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Text style={[styles.unitSelectorText, { color: productCategory ? C.text : C.textSub }]}>
              {productCategory ? categories.find(c => c._id === productCategory)?.name || 'Desconocida' : 'Seleccionar Categoría'}
            </Text>
            <Feather name="chevron-down" size={20} color={C.textSub} />
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
          <View style={[styles.modalContent, { backgroundColor: C.bottomSheetBg }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Seleccionar Unidad</Text>
            <ScrollView style={styles.modalScroll}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.modalOption, productUnit === u && { backgroundColor: PRIMARY + '20' }]}
                  onPress={() => {
                    setProductUnit(u);
                    setIsUnitModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: productUnit === u ? PRIMARY : C.text }]}>
                    {u}
                  </Text>
                  {productUnit === u && <Feather name="check" size={20} color={PRIMARY} />}
                </TouchableOpacity>
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
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: C.bottomSheetBg }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Seleccionar Categoría</Text>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={[styles.modalOption, !productCategory && { backgroundColor: PRIMARY + '20' }]}
                onPress={() => {
                  setProductCategory(undefined);
                  setIsCategoryModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: !productCategory ? PRIMARY : C.text }]}>
                  Sin categoría
                </Text>
                {!productCategory && <Feather name="check" size={20} color={PRIMARY} />}
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[styles.modalOption, productCategory === c._id && { backgroundColor: PRIMARY + '20' }]}
                  onPress={() => {
                    setProductCategory(c._id);
                    setIsCategoryModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: productCategory === c._id ? PRIMARY : C.text }]}>
                    {c.name}
                  </Text>
                  {productCategory === c._id && <Feather name="check" size={20} color={PRIMARY} />}
                </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#E2E8F0',
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
  bottomSheetHandle: {
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    marginTop: 24,
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
});
