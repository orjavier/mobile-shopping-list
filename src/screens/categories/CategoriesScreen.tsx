import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomTabBar, { PRIMARY } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { ICategory } from '@/interfaces/category.interface';
import { categoryRepository } from '@/repositories/category.repository';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

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
  text: 'rgba(77, 77, 77, 0.5)',
  textSub: '#94A3B8',
  cardBg: 'rgba(255,255,255,0.06)',
  bottomSheetBg: '#1C1C1E',
  handle: '#444',
  colorLabel: '#94A3B8',
};

export default function CategoriesScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bottomSheetRef = useRef<{ open: () => void; close: () => void } | null>(null);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(COLORS[0]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryRepository.findAll();
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
    bottomSheetRef.current?.open();
  };

  const openEditSheet = (category: ICategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    bottomSheetRef.current?.open();
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
        <Text style={[styles.headerTitle, { color: C.text }]}>Categorías</Text>
        <Text style={[styles.headerSubtitle, { color: C.textSub }]}>
          {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
        </Text>
      </View>

      <View style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={64} color={C.textSub} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: C.text }]}>No hay categorías</Text>
            <Text style={[styles.emptySubtext, { color: C.textSub }]}>
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
                tintColor={PRIMARY}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item._id || Math.random().toString()}
                style={[styles.categoryCard, { backgroundColor: C.cardBg }]}
                onPress={() => openEditSheet(item)}
                onLongPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <Text style={[styles.categoryName, { color: C.text }]}>{item.name}</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.textSub} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <RBSheet
        ref={bottomSheetRef}
        height={350}
        draggable
      >
        <View style={styles.bottomSheetContent}>
          <Text style={[styles.bottomSheetTitle, { color: isDark ? C.colorLabel : C.colorLabel }]}>
            {editingCategory?._id ? 'Editar Categoría' : 'Nueva Categoría'}
          </Text>

          <CustomInput
            label=""
            placeholder="Nombre de la categoría"
            value={categoryName}
            onChangeText={setCategoryName}
          />

          <Text style={[styles.colorLabel, { color: C.colorLabel }]}>Color</Text>
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
        </View>
      </RBSheet>

      {/* ── Custom Tab Bar ── */}
      <CustomTabBar activeRoute="/(tabs)/categories" onFabPress={openAddSheet} />
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
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
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
