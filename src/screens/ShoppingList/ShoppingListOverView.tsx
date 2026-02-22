/**
 * ShoppingListOverView — Shopping Lists from backend
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { CreateShoppingListDTO } from '@/dtos/shopping-list.dto';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';

// ─── tokens ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#F9FAFB',
  headerBg: 'rgba(249,250,251,0.88)',
  searchBg: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  textSub: '#94A3B8',
  sectionLabel: '#94A3B8',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.04)',
  chevron: '#CBD5E1',
  btn: PRIMARY,
  inputBg: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
};
const DARK = {
  bg: '#121212',
  headerBg: 'rgba(18,18,18,0.90)',
  searchBg: '#1A1A1A',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textSub: '#64748B',
  sectionLabel: '#52525B',
  card: '#1C1C1E',
  cardBorder: 'rgba(255,255,255,0.05)',
  chevron: '#3F3F46',
  btn: PRIMARY,
  inputBg: '#252525',
  inputBorder: 'rgba(255,255,255,0.08)',
  inputText: '#F1F5F9',
};

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
  const isDark = useColorScheme() === 'dark';
  const C = isDark ? DARK : LIGHT;
  const user = useAuthStore((s) => s.user);

  const [lists, setLists] = useState<IShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const bsRef = useRef<BottomSheet>(null);
  const { height: SCREEN_H } = useWindowDimensions();
  //const snapPoints = useMemo(() => [Math.round(SCREEN_H * 0.42)], [SCREEN_H]);
  const snapPoints = useMemo(() => ['50%'], []);

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
    bsRef.current?.expand();
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

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
      />
    ),
    []
  );

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
        style={[s.row, { backgroundColor: C.card, borderColor: C.cardBorder }]}
        onPress={() => item._id && router.push(`/list/${item._id}`)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[s.rowIcon, { backgroundColor: pal.bg }]}>
          <MaterialIcons name={pal.icon as never} size={22} color={pal.iconColor} />
        </View>
        <View style={s.rowBody}>
          <Text style={[s.rowName, { color: C.text }]}>{item.name}</Text>
          <Text style={[s.rowSub, { color: C.textMuted }]}>
            {count} producto{count !== 1 ? 's' : ''}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={C.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <View
        style={{ height: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight ?? 28 }}
      />

      <View style={[s.header, { backgroundColor: C.headerBg }]}>
        <Text style={[s.headerTitle, { color: C.text }]}>Lista de Compras</Text>
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
        <View style={[s.searchBar, { backgroundColor: C.searchBg }]}>
          <MaterialIcons name="search" size={20} color={C.textSub} />
          <TextInput
            style={[s.searchInput, { color: C.inputText }]}
            placeholder="Buscar listas..."
            placeholderTextColor={C.textSub}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={17} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recently created */}
        <Text style={[s.sectionLabel, { color: C.sectionLabel, marginTop: 20 }]}>
          CREADO RECIENTEMENTE
        </Text>

        {loading ? (
          <View style={[s.row, { backgroundColor: C.card, borderColor: C.cardBorder, justifyContent: 'center' }]}>
            <Text style={[s.rowSub, { color: C.textMuted }]}>Cargando...</Text>
          </View>
        ) : filteredLists.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={[s.emptyIcon, { backgroundColor: `${PRIMARY}18` }]}>
              <MaterialIcons name="add-shopping-cart" size={36} color={PRIMARY} />
            </View>
            <Text style={[s.emptyTitle, { color: C.text }]}>Sin listas aún</Text>
            <Text style={[s.emptySub, { color: C.textMuted }]}>
              Toca el botón + para crear tu primera lista
            </Text>
          </View>
        ) : (
          filteredLists.map((item, idx) => renderRow(item, idx))
        )}
      </ScrollView>

      {/* BottomSheet: nueva lista */}
      <BottomSheet
        ref={bsRef}
        index={-1}
        animateOnMount={false}
        enablePanDownToClose={true}
        snapPoints={['50%']}  // ← SOLO esta línea
        backdropComponent={renderBackdrop}
        backgroundStyle={[s.sheetBg, { backgroundColor: C.card }]}
        handleIndicatorStyle={{ backgroundColor: C.textSub, width: 40, opacity: 0.35 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={s.sheetContent}>
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: C.text }]}>Nueva Lista</Text>
            <TouchableOpacity
              style={[s.sheetClose, { backgroundColor: C.inputBg }]}
              onPress={() => bsRef.current?.close()}
            >
              <MaterialIcons name="close" size={18} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[s.inputLabel, { color: C.textMuted }]}>NOMBRE DE LA LISTA</Text>
          <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: C.inputBorder }]}>
            <MaterialIcons name="shopping-cart" size={18} color={C.textMuted} />
            <BottomSheetTextInput
              style={[s.bsInput, { color: C.inputText }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej: Compras del supermercado"
              placeholderTextColor={C.textSub}
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
        </BottomSheetView>
      </BottomSheet>

      <CustomTabBar activeRoute="/(tabs)/lists" onFabPress={openSheet} />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },

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
