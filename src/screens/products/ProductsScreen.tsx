import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomTabBar, { PRIMARY } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { IProduct } from '@/interfaces/product.interface';
import { productRepository } from '@/repositories/product.repository';
import { showToast } from '@/toast';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
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

const LIGHT = {
  bg: '#FFFFFF',
  text: '#0F172A',
  textSub: '#64748B',
  cardBg: '#F1F5F9',
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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('1');
  const [productUnit, setProductUnit] = useState('unid');

  const snapPoints = useMemo(() => ['50%', '80%'], []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productRepository.findAll();
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
            <MaterialIcons name="inventory-2" size={64} color={C.textSub} style={{ opacity: 0.5 }} />
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
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: C.text }]}>{product.name}</Text>
                  <Text style={[styles.productDetail, { color: C.textSub }]}>
                    {product.defaultQuantity} {product.defaultUnit}
                    {product.defaultPrice ? ` • $${product.defaultPrice}` : ''}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={C.textSub} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        animateOnMount={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: C.bottomSheetBg }]}
        handleIndicatorStyle={[styles.bottomSheetHandle, { backgroundColor: C.handle }]}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
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
      <CustomTabBar activeRoute="/(tabs)/products" onFabPress={openAddSheet} />
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
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productDetail: {
    fontSize: 14,
    marginTop: 4,
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
});
