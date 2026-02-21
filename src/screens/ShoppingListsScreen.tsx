import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { CreateShoppingListDTO } from '@/dtos/shopping-list.dto';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function ShoppingListsScreen() {
  const router = useRouter();
  const [lists, setLists] = useState<IShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fetchLists = useCallback(async () => {
    if (!user?._id) return;

    try {
      const data = await shoppingListRepository.getByUser(user._id);
      setLists(data);
    } catch (error: unknown) {
      let message = 'Error al cargar las listas';
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        message = err.response?.data?.message || message;
      }
      showToast.error('Error', message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLists();
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: 'open' | 'closed') => {
    return status === 'open' ? '#4CAF50' : '#9E9E9E';
  };

  const getStatusText = (status: 'open' | 'closed') => {
    return status === 'open' ? 'Abierta' : 'Cerrada';
  };

  const openCreateModal = () => {
    console.log('[ShoppingLists] Abriendo modal de creación');
    setNewListName('');
    setIsModalVisible(true);
  };

  const handleCreateList = async () => {
    console.log('[ShoppingLists] handleCreateList llamado, name:', newListName);
    
    if (!newListName.trim()) {
      showToast.error('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (!user?._id) {
      console.log('[ShoppingLists] Usuario no autenticado, user:', user);
      showToast.error('Error', 'Usuario no autenticado');
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('[ShoppingLists] Creando lista:', { name: newListName.trim(), createdBy: user._id });
      
      const dto = new CreateShoppingListDTO(newListName.trim(), user._id);
      console.log('[ShoppingLists] DTO creado:', JSON.stringify(dto));
      
      const newList = await shoppingListRepository.create(dto);
      console.log('[ShoppingLists] Lista creada response:', JSON.stringify(newList));
      
      showToast.success('Éxito', 'Lista creada correctamente');
      setIsModalVisible(false);
      fetchLists();

      if (newList && newList._id) {
        navigateToList(newList._id);
      }
    } catch (error: unknown) {
      console.error('[ShoppingLists] Error al crear lista:', error);
      let message = 'No se pudo crear la lista';
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        message = err.response?.data?.message || message;
      }
      showToast.error('Error', message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteList = (list: IShoppingList) => {
    Alert.alert(
      'Eliminar Lista',
      `¿Estás seguro de que quieres eliminar "${list.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await shoppingListRepository.delete(list._id!);
              showToast.success('Éxito', 'Lista eliminada');
              fetchLists();
            } catch (error: unknown) {
              showToast.error('Error', 'No se pudo eliminar la lista');
            }
          },
        },
      ],
    );
  };

  const navigateToList = (listId: string) => {
    const url = `/list/${listId}`;
    router.push(url as never);
  };

  const renderListCard = (list: IShoppingList) => (
    <TouchableOpacity
      key={list._id}
      style={styles.card}
      onPress={() => navigateToList(list._id!)}
      onLongPress={() => handleDeleteList(list)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{list.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(list.status) }]}>
          <Text style={styles.statusText}>{getStatusText(list.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="shopping-cart" size={20} color="#FF803E" />
          <Text style={styles.infoText}>
            {list.itemsProduct?.length || 0} productos
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="attach-money" size={20} color="#FF803E" />
          <Text style={styles.infoText}>
            Total: {formatCurrency(list.totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Creada: {formatDate(list.createdAt)}
        </Text>
        {list.status === 'closed' && list.closedAt && (
          <Text style={styles.dateText}>
            Cerrada: {formatDate(list.closedAt)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando listas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF803E', '#FF6C37']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mis Listas</Text>
        <Text style={styles.headerSubtitle}>
          {lists.length} {lists.length === 1 ? 'lista' : 'listas'}
        </Text>
      </LinearGradient>

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
        {lists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="add-shopping-cart" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tienes listas todavía</Text>
            <Text style={styles.emptySubtext}>
              Toca el botón + para crear tu primera lista
            </Text>
          </View>
        ) : (
          lists.map(renderListCard)
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Lista</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre de la lista</Text>
              <TextInput
                style={styles.modalInput}
                value={newListName}
                onChangeText={setNewListName}
                placeholder="Ej: Compras del supermercado"
                placeholderTextColor="#999"
                autoFocus
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                onPress={handleCreateList}
                disabled={isCreating}
              >
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Creando...' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF803E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#FF803E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FF803E',
    alignItems: 'center',
    marginLeft: 10,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
