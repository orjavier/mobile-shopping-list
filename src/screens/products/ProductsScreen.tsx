import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomTabBar from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { IProduct } from '@/interfaces/product.interface';
import { productRepository } from '@/repositories/product.repository';
import { showToast } from '@/toast';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const UNITS = ['unid', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'pack'];

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('1');
  const [productUnit, setProductUnit] = useState('unid');

  const snapPoints = useMemo(() => ['50%'], []);

  const fetchProducts = useCallback(async () => {
    try {
      console.log('[Products] Fetching products...');
      const data = await productRepository.findAll();
      console.log('[Products] Data received:', JSON.stringify(data));
      setProducts(data || []);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      showToast.error('Error', 'No se pudieron cargar los productos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const openAddSheet = () => {
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductQuantity('1');
    setProductUnit('unid');
    bottomSheetRef.current?.expand();
  };

  const openEditSheet = (product: IProduct) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.defaultPrice || 0));
    setProductQuantity(String(product.defaultQuantity || 1));
    setProductUnit(product.defaultUnit || 'unid');
    bottomSheetRef.current?.expand();
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
      };

      if (editingProduct?._id) {
        await productRepository.update(editingProduct._id, productData);
        showToast.success('Éxito', 'Producto actualizado');
      } else {
        await productRepository.create(productData);
        showToast.success('Éxito', 'Producto creado');
      }
      closeSheet();
      fetchProducts();
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
              fetchProducts();
            } catch (error: unknown) {
              showToast.error('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ],
    );
  };

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (isLoading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Productos</Text>
        <Text style={styles.headerSubtitle}>
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </Text>
      </View>

      <View style={styles.content}>
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory-2" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>No hay productos</Text>
            <Text style={styles.emptySubtext}>
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
                tintColor="#fff"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {products.map((product) => (
              <TouchableOpacity
                key={product._id || Math.random().toString()}
                style={styles.productCard}
                onPress={() => openEditSheet(product)}
                onLongPress={() => handleDelete(product)}
                activeOpacity={0.7}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDetail}>
                    {product.defaultQuantity} {product.defaultUnit}
                    {product.defaultPrice ? ` • $${product.defaultPrice}` : ''}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={openAddSheet}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>
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
              <CustomInput
                label=""
                placeholder="Unidad"
                value={productUnit}
                onChangeText={setProductUnit}
              />
            </View>
          </View>

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
        </BottomSheetView>
      </BottomSheet>

      {/* ── Custom Tab Bar ── */}
      <CustomTabBar activeRoute="/(tabs)/products" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
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
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetHandle: {
    backgroundColor: '#ddd',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
});
