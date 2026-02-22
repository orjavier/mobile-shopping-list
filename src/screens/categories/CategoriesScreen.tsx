import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { ICategory } from '@/interfaces/category.interface';
import { categoryRepository } from '@/repositories/category.repository';
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

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(COLORS[0]);

  const snapPoints = useMemo(() => ['50%'], []);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('[Categories] Fetching categories...');
      const data = await categoryRepository.findAll();
      console.log('[Categories] Data received:', JSON.stringify(data));
      setCategories(data || []);
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      showToast.error('Error', 'No se pudieron cargar las categorías');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const openAddSheet = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    bottomSheetRef.current?.expand();
  };

  const openEditSheet = (category: ICategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    bottomSheetRef.current?.expand();
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      showToast.error('Error', 'El nombre es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory?._id) {
        await categoryRepository.update(editingCategory._id, {
          name: categoryName.trim(),
          color: categoryColor,
        });
        showToast.success('Éxito', 'Categoría actualizada');
      } else {
        await categoryRepository.create({
          name: categoryName.trim(),
          color: categoryColor,
        });
        showToast.success('Éxito', 'Categoría creada');
      }
      closeSheet();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error saving category:', error);
      showToast.error('Error', 'No se pudo guardar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (category: ICategory) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de que quieres eliminar "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryRepository.delete(category._id!);
              showToast.success('Éxito', 'Categoría eliminada');
              fetchCategories();
            } catch (error: unknown) {
              showToast.error('Error', 'No se pudo eliminar la categoría');
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
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorías</Text>
        <Text style={styles.headerSubtitle}>
          {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
        </Text>
      </View> */}

      <View style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>No hay categorías</Text>
            <Text style={styles.emptySubtext}>
              Toca el botón + para crear una
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
            {categories.map((item) => (
              <TouchableOpacity
                key={item._id || Math.random().toString()}
                style={styles.categoryCard}
                onPress={() => openEditSheet(item)}
                onLongPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <Text style={styles.categoryName}>{item.name}</Text>
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
            {editingCategory?._id ? 'Editar Categoría' : 'Nueva Categoría'}
          </Text>

          <CustomInput
            label=""
            placeholder="Nombre de la categoría"
            value={categoryName}
            onChangeText={setCategoryName}
          />

          <Text style={styles.colorLabel}>Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  categoryColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setCategoryColor(color)}
              >
                {categoryColor === color && (
                  <MaterialIcons name="check" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>

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
  categoryCard: {
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
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
