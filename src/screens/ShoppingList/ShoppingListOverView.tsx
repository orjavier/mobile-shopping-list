/**
 * ShoppingListOverView — Shopping Lists from backend
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { CreateShoppingListDTO } from '@/dtos/shopping-list.dto';
import { useAppTheme } from '@/hooks/useAppTheme';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import RBSheet from 'react-native-raw-bottom-sheet';
// ─── tokens ───────────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: '#FFF3E0', icon: 'shopping-basket', iconColor: PRIMARY },
  { bg: '#FFF9C4', icon: 'search', iconColor: '#D97706' },
  { bg: '#E8F5E9', icon: 'eco', iconColor: '#16A34A' },
  { bg: '#FCE4EC', icon: 'local-pizza', iconColor: '#E11D48' },
  { bg: '#FCE4EC', icon: 'restaurant', iconColor: '#BE185D' },
  { bg: '#E3F2FD', icon: 'local-bar', iconColor: '#1D4ED8' },
  { bg: '#EDE7F6', icon: 'shopping-cart', iconColor: '#7C3AED' },
];
const PALETTES_DARK = [
  { bg: 'rgba(255,108,55,0.22)', icon: 'shopping-basket', iconColor: PRIMARY },
  { bg: 'rgba(217,119,6,0.22)', icon: 'search', iconColor: '#F59E0B' },
  { bg: 'rgba(22,163,74,0.22)', icon: 'eco', iconColor: '#4ADE80' },
  { bg: 'rgba(225,29,72,0.22)', icon: 'local-pizza', iconColor: '#F87171' },
  { bg: 'rgba(190,24,93,0.22)', icon: 'restaurant', iconColor: '#FB7185' },
  { bg: 'rgba(29,78,216,0.22)', icon: 'local-bar', iconColor: '#60A5FA' },
  { bg: 'rgba(124,58,237,0.22)', icon: 'shopping-cart', iconColor: '#A78BFA' },
];

function paletteFor(idx: number, isDark: boolean) {
  const arr = isDark ? PALETTES_DARK : PALETTES;
  return arr[idx % arr.length];
}

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function ShoppingListOverView() {
  const router = useRouter();
  const { colors: Colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);

  const [lists, setLists] = useState<IShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const bsRef = useRef<{ open: () => void; close: () => void } | null>(null);

  const fetchLists = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await shoppingListRepository.getByUser(user._id);
      setLists(data || []);
    } catch {
      showToast.error('Error', 'No se pudieron cargar las listas');
    } finally {
      setLoading(false);
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

  const openSheet = () => {
    setNewName('');
    bsRef.current?.open();
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      showToast.error('Error', 'El nombre no puede estar vacío');
      return;
    }
    if (!user?._id) {
      showToast.error('Error', 'Usuario no autenticado');
      return;
    }
    setCreating(true);
    try {
      const dto = new CreateShoppingListDTO(name, user._id);
      const nl = await shoppingListRepository.create(dto);
      showToast.success('Éxito', `Lista "${name}" creada`);
      bsRef.current?.close();
      fetchLists();
      if (nl?._id) router.push(`/list/${nl._id}`);
    } catch {
      showToast.error('Error', 'No se pudo crear la lista');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (item: IShoppingList) => {
    // TODO: Implement delete
  };

  const filteredLists = lists
    .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  const renderRow = (item: IShoppingList, idx: number) => {
    const pal = paletteFor(idx, isDark);
    const count = item.itemsProduct?.length ?? 0;
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.72}
        style={[s.row, { backgroundColor: Colors.surfaceBackgroundColor, borderColor: Colors.borderColor }]}
        onPress={() => item._id && router.push(`/list/${item._id}`)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[s.rowIcon, { backgroundColor: pal.bg }]}>
          <MaterialIcons name={pal.icon as never} size={22} color={pal.iconColor} />
        </View>
        <View style={s.rowBody}>
          <Text style={[s.rowName, { color: Colors.primaryTextColor }]}>{item.name}</Text>
          <Text style={[s.rowSub, { color: Colors.secondaryTextColor }]}>
            {count} producto{count !== 1 ? 's' : ''}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={Colors.chevronColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.root, { backgroundColor: Colors.screenBackgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <View
        style={{ height: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight ?? 28 }}
      />

      <View style={[s.header]}>
        <Text style={[s.headerTitle, { color: Colors.primaryTextColor }]}>Lista de Compras</Text>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: TAB_TOTAL + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
      >
        {/* Search Bar */}
        <View style={{ marginTop: 8, marginBottom: 12 }}>
          <CustomInput
            leftIcon="search"
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar listas..."
            rightIcon={search.length > 0 ? "x" : undefined}
            onRightIconPress={() => setSearch('')}
          />
        </View>

        {/* Recently created */}
        <Text style={[s.sectionLabel, { color: Colors.sectionLabelTextColor, marginTop: 20 }]}>
          CREADO RECIENTEMENTE
        </Text>

        {loading ? (
          <View style={[s.row, { backgroundColor: Colors.surfaceBackgroundColor, borderColor: Colors.borderColor, justifyContent: 'center' }]}>
            <Text style={[s.rowSub, { color: Colors.secondaryTextColor }]}>Cargando...</Text>
          </View>
        ) : filteredLists.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={[s.emptyIcon, { backgroundColor: `${PRIMARY}18` }]}>
              <MaterialIcons name="add-shopping-cart" size={36} color={PRIMARY} />
            </View>
            <Text style={[s.emptyTitle, { color: Colors.primaryTextColor }]}>Sin listas aún</Text>
            <Text style={[s.emptySub, { color: Colors.secondaryTextColor }]}>
              Toca el botón + para crear tu primera lista
            </Text>
          </View>
        ) : (
          filteredLists.map((item, idx) => renderRow(item, idx))
        )}
      </ScrollView>

      {/* RBSheet: nueva lista */}
      <RBSheet
        ref={bsRef}
        height={350}
        draggable
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
          container: {
            backgroundColor: Colors.surfaceBackgroundColor,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
          draggableIcon: { backgroundColor: isDark ? '#555' : '#DDD' },
        }}
      >
        <View style={s.sheetContent}>
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: Colors.primaryTextColor }]}>Nueva Lista</Text>
            <TouchableOpacity
              style={[s.sheetClose, { backgroundColor: Colors.inputBackgroundColor }]}
              onPress={() => bsRef.current?.close()}
            >
              <MaterialIcons name="close" size={18} color={Colors.secondaryTextColor} />
            </TouchableOpacity>
          </View>

          <Text style={[s.inputLabel, { color: Colors.secondaryTextColor }]}>NOMBRE DE LA LISTA</Text>
          <View style={{ marginBottom: 24 }}>
            <CustomInput
              leftIcon="shopping-cart"
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej: Compras del supermercado"
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </View>

          <View style={s.sheetBtns}>
            <CustomButton
              title="Cancelar"
              variant="outlined"
              onPress={() => bsRef.current?.close()}
              style={{ flex: 1 }}
            />
            <CustomButton
              title={creating ? 'Creando...' : 'Crear lista'}
              variant="primary"
              onPress={handleCreate}
              isLoading={creating}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </RBSheet>

      <CustomTabBar activeRoute="/(tabs)/lists" onFabPress={openSheet} />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, letterSpacing: -0.3 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginTop: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0, margin: 0 },

  scroll: { paddingHorizontal: 24, paddingTop: 12 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },
  rowSub: { fontSize: 12, fontWeight: '400' },

  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 240, lineHeight: 19 },

  createWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  createBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // BottomSheet
  sheetBg: { borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 24,
  },
  bsInput: { flex: 1, fontSize: 15, padding: 0, margin: 0 },
  sheetBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelTxt: { fontSize: 15, fontWeight: '600' },
});
