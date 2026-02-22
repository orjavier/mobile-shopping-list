/**
 * ShoppingListsScreen — boceto: dark_mode_shopping_lists_overview.html
 * Header: "Shopping lists" centrado
 * Sección "Our recommendations" (listas del sistema)
 * Sección "Recently created" (listas del usuario)
 * CustomTabBar existente + BottomSheet para crear lista
 */

import RBSheet from 'react-native-raw-bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { CreateShoppingListDTO } from '@/dtos/shopping-list.dto';
import { IShoppingList, IShoppingListUpdate } from '@/interfaces/shopping-list.interface';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// ─── design tokens ────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#F9FAFB',
  surface: '#FFFFFF',
  header: 'rgba(249,250,251,0.9)',
  text: '#0F172A',
  textMuted: '#64748B',
  textSub: '#94A3B8',
  sectionLabel: '#94A3B8',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.04)',
  chevron: '#CBD5E1',
  sheetBg: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  cancelBg: '#F1F5F9',
  cancelText: '#64748B',
  separator: '#F1F5F9',
};
const DARK = {
  bg: '#121212',
  surface: '#1C1C1E',
  header: 'rgba(18,18,18,0.92)',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textSub: '#64748B',
  sectionLabel: '#64748B',
  card: '#1C1C1E',
  cardBorder: 'rgba(255,255,255,0.05)',
  chevron: '#4B5563',
  sheetBg: '#1C1C1E',
  inputBg: '#252525',
  inputBorder: 'rgba(255,255,255,0.08)',
  inputText: '#F1F5F9',
  cancelBg: '#252525',
  cancelText: '#94A3B8',
  separator: 'rgba(255,255,255,0.07)',
};

// icon+color palettes para las tarjetas (ciclo)
const PALETTES = [
  { bg: '#FFF3E0', icon: 'shopping-basket', iconColor: PRIMARY },
  { bg: '#FFF9C4', icon: 'search', iconColor: '#D97706' },
  { bg: '#E8F5E9', icon: 'eco', iconColor: '#16A34A' },
  { bg: '#FCE4EC', icon: 'local-pizza', iconColor: '#E11D48' },
  { bg: '#FCE4EC', icon: 'restaurant', iconColor: '#BE185D' },
  { bg: '#E3F2FD', icon: 'local-bar', iconColor: '#1D4ED8' },
  { bg: '#EDE7F6', icon: 'shopping-cart', iconColor: '#7C3AED' },
] as const;
const PALETTES_DARK = [
  { bg: 'rgba(255,108,55,0.22)', icon: 'shopping-basket', iconColor: PRIMARY },
  { bg: 'rgba(217,119, 6,0.22)', icon: 'search', iconColor: '#F59E0B' },
  { bg: 'rgba(22,163,74,0.22)', icon: 'eco', iconColor: '#4ADE80' },
  { bg: 'rgba(225,29,72,0.22)', icon: 'local-pizza', iconColor: '#F87171' },
  { bg: 'rgba(190,24,93,0.22)', icon: 'restaurant', iconColor: '#FB7185' },
  { bg: 'rgba(29,78,216,0.22)', icon: 'local-bar', iconColor: '#60A5FA' },
  { bg: 'rgba(124,58,237,0.22)', icon: 'shopping-cart', iconColor: '#A78BFA' },
] as const;

function paletteFor(idx: number, isDark: boolean) {
  const arr = isDark ? PALETTES_DARK : PALETTES;
  return arr[idx % arr.length];
}

// ─── ListRow ─────────────────────────────────────────────────────────────────
interface RowProps {
  item: IShoppingList;
  idx: number;
  isDark: boolean;
  C: typeof LIGHT;
  onPress: () => void;
  onLongPress: () => void;
  onSettingsPress: () => void;
}

function ListRow({ item, idx, isDark, C, onPress, onLongPress, onSettingsPress }: RowProps) {
  const pal = paletteFor(idx, isDark);
  const count = item.itemsProduct?.length ?? 0;
  return (
    <TouchableOpacity
      style={[s.row, { backgroundColor: C.card, borderColor: C.cardBorder }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.72}
    >
      <View style={[s.rowIcon, { backgroundColor: pal.bg }]}>
        <MaterialIcons name={pal.icon as never} size={22} color={pal.iconColor} />
      </View>
      <View style={s.rowBody}>
        <Text style={[s.rowName, { color: C.text }]}>{item.name}</Text>
        <Text style={[s.rowSub, { color: C.textMuted }]}>{count} producto{count !== 1 ? 's' : ''}</Text>
      </View>
      <TouchableOpacity onPress={onSettingsPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialIcons name="settings" size={20} color={C.textMuted} />
      </TouchableOpacity>
      <MaterialIcons name="chevron-right" size={22} color={C.chevron} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ShoppingListsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? DARK : LIGHT;
  const user = useAuthStore((s) => s.user);

  const [lists, setLists] = useState<IShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingList, setEditingList] = useState<IShoppingList | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'open' | 'closed'>('open');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const bsRef = useRef<{ open: () => void; close: () => void } | null>(null);
  const editBsRef = useRef<{ open: () => void; close: () => void } | null>(null);

  // ─── fetch ─────────────────────────────────────────────────────────────────
  const fetchLists = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await shoppingListRepository.getByUser(user._id);
      setLists(data);
    } catch {
      showToast.error('Error', 'No se pudieron cargar las listas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => { fetchLists(); }, [fetchLists]);
  const onRefresh = () => { setRefreshing(true); fetchLists(); };

  // ─── create ────────────────────────────────────────────────────────────────
  const openSheet = () => { setNewName(''); bsRef.current?.open(); };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) { showToast.error('Error', 'El nombre no puede estar vacío'); return; }
    if (!user?._id) { showToast.error('Error', 'Usuario no autenticado'); return; }
    setCreating(true);
    try {
      const dto = new CreateShoppingListDTO(name, user._id);
      const nl = await shoppingListRepository.create(dto);
      showToast.success('Éxito', `Lista "${name}" creada`);
      bsRef.current?.close();
      fetchLists();
      if (nl?._id) router.push(`/list/${nl._id}` as never);
    } catch {
      showToast.error('Error', 'No se pudo crear la lista');
    } finally {
      setCreating(false);
    }
  };

  // ─── delete ────────────────────────────────────────────────────────────────
  const handleDelete = (item: IShoppingList) => {
    Alert.alert('Eliminar', `¿Eliminar "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await shoppingListRepository.delete(item._id!);
            showToast.success('Éxito', 'Lista eliminada');
            fetchLists();
          } catch { showToast.error('Error', 'No se pudo eliminar'); }
        },
      },
    ]);
  };

  // ─── edit ─────────────────────────────────────────────────────────────────
  const openEditSheet = (item: IShoppingList) => {
    setEditingList(item);
    setEditName(item.name);
    setEditStatus(item.status || 'open');
    setEditTotalAmount(item.totalAmount?.toString() || '0');
    editBsRef.current?.open();
  };

  const handleSaveEdit = async () => {
    if (!editingList?._id) return;
    const name = editName.trim();
    if (!name) { showToast.error('Error', 'El nombre no puede estar vacío'); return; }
    setSaving(true);
    try {
      const updateData: IShoppingListUpdate = {
        name,
        status: editStatus,
        totalAmount: parseFloat(editTotalAmount) || 0,
      };
      await shoppingListRepository.update(editingList._id, updateData);
      showToast.success('Éxito', 'Lista actualizada');
      editBsRef.current?.close();
      fetchLists();
    } catch {
      showToast.error('Error', 'No se pudo actualizar la lista');
    } finally {
      setSaving(false);
    }
  };

  // ─── split lists ───────────────────────────────────────────────────────────
  // "recommendations" = first 1 item (or a static set if empty) · rest = "recently created"
  const recommendations = lists.slice(0, 1);
  const recent = lists.slice(1);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* ── Status bar spacer ── */}
      <View style={{ height: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) }} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: C.header }]}>
        <Text style={[s.headerTitle, { color: C.text }]}>Shopping lists</Text>
      </View>

      {/* ── Content ── */}
      <FlatList
        data={[]}
        keyExtractor={() => 'x'}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />
        }
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            {/* ── "Our recommendations" ── */}
            <Text style={[s.sectionLabel, { color: C.sectionLabel }]}>OUR RECOMMENDATIONS</Text>

            {loading ? (
              <View style={[s.row, { backgroundColor: C.card, borderColor: C.cardBorder, justifyContent: 'center' }]}>
                <Text style={[s.rowSub, { color: C.textMuted }]}>Cargando…</Text>
              </View>
            ) : recommendations.length === 0 ? (
              <View style={[s.row, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                <View style={[s.rowIcon, { backgroundColor: isDark ? 'rgba(255,108,55,0.22)' : '#FFF3E0' }]}>
                  <MaterialIcons name="shopping-basket" size={22} color={PRIMARY} />
                </View>
                <View style={s.rowBody}>
                  <Text style={[s.rowName, { color: C.text }]}>Often purchased</Text>
                  <Text style={[s.rowSub, { color: C.textMuted }]}>10 products</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={C.chevron} />
              </View>
            ) : (
              recommendations.map((item, i) => (
                <ListRow
                  key={item._id}
                  item={item}
                  idx={i}
                  isDark={isDark}
                  C={C}
                  onPress={() => router.push(`/list/${item._id}` as never)}
                  onLongPress={() => handleDelete(item)}
                  onSettingsPress={() => openEditSheet(item)}
                />
              ))
            )}

            {/* ── "Recently created" ── */}
            <Text style={[s.sectionLabel, { color: C.sectionLabel, marginTop: 28 }]}>RECENTLY CREATED</Text>

            {!loading && recent.length === 0 && (
              <View style={s.emptyWrap}>
                <View style={[s.emptyIcon, { backgroundColor: `${PRIMARY}18` }]}>
                  <MaterialIcons name="add-shopping-cart" size={36} color={PRIMARY} />
                </View>
                <Text style={[s.emptyTitle, { color: C.text }]}>Sin listas aún</Text>
                <Text style={[s.emptySub, { color: C.textMuted }]}>
                  Toca el botón + para crear tu primera lista
                </Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <>
            {recent.map((item, i) => (
              <ListRow
                key={item._id}
                item={item}
                idx={i + 1}
                isDark={isDark}
                C={C}
                onPress={() => router.push(`/list/${item._id}` as never)}
                onLongPress={() => handleDelete(item)}
                onSettingsPress={() => openEditSheet(item)}
              />
            ))}
          </>
        }
      />

      {/* ── CustomTabBar ── */}
      <CustomTabBar activeRoute="/(tabs)/lists" onFabPress={openSheet} />

      {/* ── RBSheet: nueva lista ── */}
      <RBSheet
        ref={bsRef}
        height={350}
        draggable
      >
        <View style={s.sheetContent}>
          {/* header */}
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: C.text }]}>Nueva Lista</Text>
            <TouchableOpacity style={[s.sheetClose, { backgroundColor: C.inputBg }]} onPress={() => bsRef.current?.close()}>
              <MaterialIcons name="close" size={18} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          {/* input */}
          <Text style={[s.inputLabel, { color: C.textMuted }]}>NOMBRE DE LA LISTA</Text>
          <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: C.inputBorder }]}>
            <MaterialIcons name="shopping-cart" size={18} color={C.textMuted} />
            <TextInput
              style={[s.bsInput, { color: C.inputText }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej: Compras del supermercado"
              placeholderTextColor={C.textSub}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </View>

          {/* buttons */}
          <View style={s.sheetBtns}>
            <TouchableOpacity
              style={[s.cancelBtn, { backgroundColor: C.cancelBg, borderColor: C.inputBorder }]}
              onPress={() => bsRef.current?.close()}
            >
              <Text style={[s.cancelTxt, { color: C.cancelText }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.createBtn, creating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              <LinearGradient colors={['#FF8C5A', PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.createGrad}>
                <Text style={s.createTxt}>{creating ? 'Creando…' : 'Crear lista'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>


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
  },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },

  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: TAB_TOTAL + 24,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
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
  rowIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },
  rowSub: { fontSize: 12, fontWeight: '400' },

  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 240, lineHeight: 19 },

  // BottomSheet
  sheetBg: { borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  sheetTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  sheetClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 14,
    gap: 10, marginBottom: 24,
  },
  bsInput: { flex: 1, fontSize: 15, padding: 0, margin: 0 },
  sheetBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 15, alignItems: 'center' },
  cancelTxt: { fontSize: 15, fontWeight: '600' },
  createBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  createGrad: { paddingVertical: 15, alignItems: 'center' },
  createTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
