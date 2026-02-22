import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text, View } from '@/components/Themed';
import { IItemProduct } from '@/interfaces/item-product.interface';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<IShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // New Item State
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnit, setItemUnit] = useState('unid');
  const [itemPrice, setItemPrice] = useState('0');
  const [itemNotes, setItemNotes] = useState('');

  // Edit Item State
  const [editingItem, setEditingItem] = useState<IItemProduct | null>(null);

  const user = useAuthStore((state) => state.user);

  const fetchList = useCallback(async () => {
    if (!id) return;

    try {
      const data = await shoppingListRepository.getById(id);
      setList(data);
    } catch (error: unknown) {
      console.error('[fetchList] Error:', error);
      showToast.error('Error', 'No se pudo cargar la lista');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchList();
  };

  const toggleItem = async (itemId: string) => {
    try {
      await shoppingListRepository.toggleItemCompleted(itemId);
      await fetchList();
    } catch (error: unknown) {
      console.error('[toggleItem] Error:', error);
      showToast.error('Error', 'No se pudo actualizar el item');
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      showToast.error('Error', 'El nombre es obligatorio');
      return;
    }

    if (!list?._id || !user?._id) {
      showToast.error('Error', 'Usuario no autenticado');
      return;
    }

    setIsAddingItem(true);
    try {
      if (editingItem?._id) {
        // Edit mode
        const updatedItem = {
          name: itemName.trim(),
          quantity: parseFloat(itemQuantity) || 1,
          unit: itemUnit.trim() || 'unid',
          price: parseFloat(itemPrice) || 0,
          notes: itemNotes.trim(),
        };

        await shoppingListRepository.updateItem(editingItem._id, updatedItem);
        showToast.success('Éxito', 'Producto actualizado');
      } else {
        // Add mode
        const newItem = {
          name: itemName.trim(),
          quantity: parseFloat(itemQuantity) || 1,
          unit: itemUnit.trim() || 'unid',
          price: parseFloat(itemPrice) || 0,
          notes: itemNotes.trim(),
          isCompleted: false,
          memberId: String(user._id),
        };

        await shoppingListRepository.addItem(list._id, newItem);
        showToast.success('Éxito', 'Producto agregado');
      }

      // Reset and close
      resetItemForm();
      fetchList();
    } catch (error: unknown) {
      console.error('[ListDetail] Error al guardar item:', error);
      showToast.error('Error', 'No se pudo guardar el producto');
    } finally {
      setIsAddingItem(false);
    }
  };

  const resetItemForm = () => {
    setItemName('');
    setItemQuantity('1');
    setItemUnit('unid');
    setItemPrice('0');
    setItemNotes('');
    setEditingItem(null);
    setIsModalVisible(false);
  };

  const deleteItem = async (itemId: string) => {
    if (!list?._id) return;

    Alert.alert(
      'Opciones',
      '¿Qué deseas hacer con este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Editar',
          onPress: () => {
            const item = list?.itemsProduct?.find((i) => i._id === itemId);
            if (item) {
              setEditingItem(item);
              setItemName(item.name);
              setItemQuantity(String(item.quantity));
              setItemUnit(item.unit);
              setItemPrice(String(item.price || 0));
              setItemNotes(item.notes || '');
              setIsModalVisible(true);
            }
          },
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await shoppingListRepository.deleteItem(list._id!, itemId);
              showToast.success('Éxito', 'Producto eliminado');
              fetchList();
            } catch (error: unknown) {
              showToast.error('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ],
    );
  };

  const closeList = async () => {
    if (!list?._id) return;

    try {
      await shoppingListRepository.update(list._id, { status: 'closed' });
      showToast.success('Éxito', 'Lista cerrada');
      fetchList();
    } catch (error: unknown) {
      showToast.error('Error', 'No se pudo cerrar la lista');
    }
  };

  const openList = async () => {
    if (!list?._id) return;

    try {
      await shoppingListRepository.update(list._id, { status: 'open' });
      showToast.success('Éxito', 'Lista abierta');
      fetchList();
    } catch (error: unknown) {
      showToast.error('Error', 'No se pudo abrir la lista');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const completedCount = useMemo(() =>
    list?.itemsProduct?.filter((item) => item.isCompleted).length || 0
    , [list?.itemsProduct]);

  const totalCount = list?.itemsProduct?.length || 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF803E" />
        <Text style={styles.loadingText}>Cargando lista...</Text>
      </View>
    );
  }

  if (!list) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Lista no encontrada</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF803E', '#FF6C37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{list.name}</Text>
            <Text style={styles.headerSubtitle}>
              {completedCount} de {totalCount} completados
            </Text>
          </View>
          <TouchableOpacity
            onPress={list.status === 'open' ? closeList : openList}
            style={styles.actionButton}
          >
            <MaterialIcons
              name={list.status === 'open' ? 'lock-open' : 'lock'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              },
            ]}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF803E']}
              tintColor="#FF803E"
            />
          }
        >
          {list.itemsProduct?.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="shopping-basket" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Tu lista está vacía</Text>
              <Text style={styles.emptySubtext}>Agrega productos con el botón +</Text>
            </View>
          ) : (
            list.itemsProduct?.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.itemCard, item.isCompleted && styles.itemCardCompleted]}
                onPress={() => toggleItem(item._id!)}
                onLongPress={() => deleteItem(item._id!)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.isCompleted && styles.checkboxCompleted,
                  ]}
                >
                  {item.isCompleted && (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemName,
                      item.isCompleted && styles.itemNameCompleted,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <View style={styles.itemDetailsRow}>
                    <Text style={styles.itemDetailText}>
                      {item.quantity} {item.unit}
                    </Text>
                    {item.price ? (
                      <Text style={styles.itemDetailPrice}>
                        • {formatCurrency(item.price)}/u
                      </Text>
                    ) : null}
                  </View>
                  {item.notes ? (
                    <Text style={styles.itemNotes} numberOfLines={1}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.itemTotalContainer}>
                  <Text style={[styles.itemTotal, item.isCompleted && styles.itemTotalCompleted]}>
                    {formatCurrency((item.price || 0) * item.quantity)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={styles.totalContainer}>
          <View>
            <Text style={styles.totalLabel}>Subtotal Est.</Text>
            <Text style={styles.totalAmount}>{formatCurrency(list.totalAmount)}</Text>
          </View>
          {list.status === 'open' && (
            <TouchableOpacity style={styles.checkoutButton} onPress={closeList}>
              <Text style={styles.checkoutButtonText}>Finalizar</Text>
            </TouchableOpacity>
          )}
        </View>

        {list.status === 'open' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setEditingItem(null);
              setItemName('');
              setItemQuantity('1');
              setItemUnit('unid');
              setItemPrice('0');
              setItemNotes('');
              setIsModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Add Product Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem?._id ? 'Editar Producto' : 'Agregar Producto'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <CustomInput
                  label="Nombre del Producto"
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder="Ej: Leche"
                  leftIcon="shopping-cart"
                  isLightThemeDefault={true}
                />

                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <CustomInput
                      label="Cantidad"
                      value={itemQuantity}
                      onChangeText={setItemQuantity}
                      placeholder="1"
                      isLightThemeDefault={true}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <CustomInput
                      label="Unidad"
                      value={itemUnit}
                      onChangeText={setItemUnit}
                      placeholder="unid, kg, lt..."
                      isLightThemeDefault={true}
                    />
                  </View>
                </View>

                <CustomInput
                  label="Precio Unitario (Opcional)"
                  value={itemPrice}
                  onChangeText={setItemPrice}
                  placeholder="0.00"
                  isLightThemeDefault={true}
                />

                <CustomInput
                  label="Notas"
                  value={itemNotes}
                  onChangeText={setItemNotes}
                  placeholder="Marca, detalles..."
                  isLightThemeDefault={true}
                />

                <CustomButton
                  title={editingItem?._id ? 'Guardar Cambios' : 'Agregar a la Lista'}
                  onPress={handleAddItem}
                  isLoading={isAddingItem}
                  style={styles.addBtn}
                />
                <View style={{ height: 40 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'SF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontFamily: 'SF',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 20,
    marginTop: -3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF803E',
  },
  itemCardCompleted: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
    backgroundColor: '#F1F3F5',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF803E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
    fontFamily: 'SF',
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#ADB5BD',
  },
  itemDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemDetailText: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '600',
  },
  itemDetailPrice: {
    fontSize: 13,
    color: '#6C757D',
    marginLeft: 5,
  },
  itemNotes: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF803E',
    fontFamily: 'SF',
  },
  itemTotalCompleted: {
    color: '#ADB5BD',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DEE2E6',
    marginTop: 20,
    fontFamily: 'SF',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CED4DA',
    marginTop: 8,
    fontFamily: 'SF',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#343A40',
    fontFamily: 'SF',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    elevation: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    fontFamily: 'SF',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 110,
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#FF6C37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF6C37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    transform: [{ rotate: '45deg' }],
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#343A40',
    fontFamily: 'SF',
  },
  modalForm: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
  },
  addBtn: {
    marginTop: 20,
    backgroundColor: '#FF6C37',
    borderRadius: 15,
    height: 55,
  }
});
