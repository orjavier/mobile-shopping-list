/**
 * Shopping List Detail — boceto: dark_mode_detailed_list_view.html
 * Header: back‑button + collaborator avatars + título
 * Items agrupados por categoría, checkboxes circulares naranjas
 * Barra inferior: mic | [FAB +] | qr_code_scanner
 * CustomTabBar NO aparece aquí (es pantalla de detalle, tiene back)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { IItemProduct } from '@/interfaces/item-product.interface';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

// ─── design tokens ────────────────────────────────────────────────────────────
const PRIMARY = '#FF6C37';

const LIGHT = {
  bg: '#F8F8F8',
  surface: '#FFFFFF',
  headerBg: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textSub: '#94A3B8',
  sectionLabel: '#94A3B8',
  border: '#E2E8F0',
  checkBorder: '#CBD5E1',
  backBtn: '#F1F5F9',
  backIcon: '#374151',
  actionBar: 'rgba(255,255,255,0.92)',
  completedTxt: '#94A3B8',
  itemBg: 'transparent',
};
const DARK = {
  bg: '#000000',
  surface: '#1C1C1E',
  headerBg: '#000000',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textSub: '#64748B',
  sectionLabel: '#4B5563',
  border: 'rgba(255,255,255,0.08)',
  checkBorder: '#3F3F46',
  backBtn: 'rgba(255,255,255,0.08)',
  backIcon: '#D1D5DB',
  actionBar: 'rgba(24,24,27,0.92)',
  completedTxt: '#52525B',
  itemBg: 'transparent',
};

// ─── helpers ─────────────────────────────────────────────────────────────────
type SectionData = { title: string; data: IItemProduct[] };

function groupByCategory(items: IItemProduct[]): SectionData[] {
  const map = new Map<string, IItemProduct[]>();
  for (const item of items) {
    const key = (item.notes?.split('|')[0]?.trim()) || 'General';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

const fmt = (n: number) =>
  `$${(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── SCREEN ──────────────────────────────────────────────────────────────────
export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? DARK : LIGHT;
  const user = useAuthStore((s) => s.user);

  const [list, setList] = useState<IShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<IItemProduct | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnit, setItemUnit] = useState('unid');
  const [itemPrice, setItemPrice] = useState('0');
  const [itemNotes, setItemNotes] = useState('');

  // ─── fetch ─────────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (!id) return;
    try {
      const data = await shoppingListRepository.getById(id);
      setList(data);
    } catch {
      showToast.error('Error', 'No se pudo cargar la lista');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchList(); }, [fetchList]);
  const onRefresh = () => { setRefreshing(true); fetchList(); };

  // ─── actions ───────────────────────────────────────────────────────────────
  const toggleItem = async (itemId: string) => {
    try {
      await shoppingListRepository.toggleItemCompleted(itemId);
      await fetchList();
    } catch { showToast.error('Error', 'No se pudo actualizar el item'); }
  };

  const resetForm = () => {
    setItemName(''); setItemQuantity('1'); setItemUnit('unid');
    setItemPrice('0'); setItemNotes(''); setEditingItem(null);
    setModalVisible(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: IItemProduct) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemQuantity(String(item.quantity));
    setItemUnit(item.unit);
    setItemPrice(String(item.price || 0));
    setItemNotes(item.notes || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!itemName.trim()) { showToast.error('Error', 'El nombre es obligatorio'); return; }
    if (!list?._id || !user?._id) { showToast.error('Error', 'Usuario no autenticado'); return; }
    setIsAddingItem(true);
    try {
      if (editingItem?._id) {
        await shoppingListRepository.updateItem(editingItem._id, {
          name: itemName.trim(), quantity: parseFloat(itemQuantity) || 1,
          unit: itemUnit.trim() || 'unid', price: parseFloat(itemPrice) || 0,
          notes: itemNotes.trim(),
        });
        showToast.success('Éxito', 'Producto actualizado');
      } else {
        await shoppingListRepository.addItem(list._id, {
          name: itemName.trim(), quantity: parseFloat(itemQuantity) || 1,
          unit: itemUnit.trim() || 'unid', price: parseFloat(itemPrice) || 0,
          notes: itemNotes.trim(), isCompleted: false, memberId: String(user._id),
        });
        showToast.success('Éxito', 'Producto agregado');
      }
      resetForm();
      fetchList();
    } catch {
      showToast.error('Error', 'No se pudo guardar el producto');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleItemLongPress = (item: IItemProduct) => {
    Alert.alert('Opciones', `"${item.name}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Editar', onPress: () => openEditModal(item) },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await shoppingListRepository.deleteItem(list!._id!, item._id!);
            showToast.success('Éxito', 'Producto eliminado');
            fetchList();
          } catch { showToast.error('Error', 'No se pudo eliminar'); }
        },
      },
    ]);
  };

  const toggleListStatus = async () => {
    if (!list?._id) return;
    const next = list.status === 'open' ? 'closed' : 'open';
    try {
      await shoppingListRepository.update(list._id, { status: next });
      showToast.success('Éxito', next === 'closed' ? 'Lista cerrada' : 'Lista abierta');
      fetchList();
    } catch { showToast.error('Error', 'No se pudo actualizar'); }
  };

  // ─── derived ───────────────────────────────────────────────────────────────
  const completedCount = useMemo(() => list?.itemsProduct?.filter((i) => i.isCompleted).length ?? 0, [list]);
  const totalCount = list?.itemsProduct?.length ?? 0;
  const sections = useMemo(() => groupByCategory(list?.itemsProduct ?? []), [list]);
  const isOpen = list?.status === 'open';

  // ─── loading / not found ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={[s.loadingTxt, { color: C.textMuted }]}>Cargando lista…</Text>
      </View>
    );
  }

  if (!list) {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <Text style={{ color: C.textMuted }}>Lista no encontrada</Text>
      </View>
    );
  }

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.root, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

        {/* ── Status bar spacer ── */}
        <View style={{ height: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28), backgroundColor: C.headerBg }} />

        {/* ── Header row: back | title | avatars / status ── */}
        <View style={[s.header, { backgroundColor: C.headerBg }]}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: C.backBtn }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={C.backIcon} />
          </TouchableOpacity>

          <View style={s.headerCenter} />

          {/* status pill */}
          <TouchableOpacity
            style={[s.statusPill, { backgroundColor: isOpen ? `${PRIMARY}22` : 'rgba(148,163,184,0.15)' }]}
            onPress={toggleListStatus}
            activeOpacity={0.75}
          >
            <View style={[s.statusDot, { backgroundColor: isOpen ? PRIMARY : C.textSub }]} />
            <Text style={[s.statusTxt, { color: isOpen ? PRIMARY : C.textSub }]}>
              {isOpen ? 'Abierta' : 'Cerrada'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Title + progress ── */}
        <View style={[s.titleWrap, { backgroundColor: C.headerBg }]}>
          <Text style={[s.listTitle, { color: C.text }]}>{list.name}</Text>
          <Text style={[s.listSub, { color: C.textMuted }]}>
            {completedCount} de {totalCount} completados
          </Text>

          {/* progress bar */}
          <View style={[s.progressBg, { backgroundColor: isDark ? '#27272A' : '#E2E8F0' }]}>
            <View style={[s.progressFill, {
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              backgroundColor: PRIMARY,
            }]} />
          </View>
        </View>

        {/* ── Items SectionList ── */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id ?? item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />
          }
          renderSectionHeader={({ section }) => (
            <Text style={[s.sectionLabel, { color: C.sectionLabel }]}>{section.title.toUpperCase()}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.itemRow}
              onPress={() => toggleItem(item._id!)}
              onLongPress={() => handleItemLongPress(item)}
              activeOpacity={0.65}
            >
              {/* checkbox */}
              <View style={[
                s.check,
                { borderColor: item.isCompleted ? PRIMARY : C.checkBorder },
                item.isCompleted && s.checkDone,
              ]}>
                {item.isCompleted && <MaterialIcons name="check" size={13} color="#fff" />}
              </View>

              {/* name */}
              <Text style={[
                s.itemName,
                { color: item.isCompleted ? C.completedTxt : C.text },
                item.isCompleted && s.itemNameDone,
              ]}>
                {item.name}
              </Text>

              {/* quantity */}
              <Text style={[s.itemQty, { color: C.textMuted }]}>
                {item.quantity} {item.unit}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <MaterialIcons name="add-shopping-cart" size={52} color={PRIMARY} style={{ opacity: 0.35 }} />
              <Text style={[s.emptyTxt, { color: C.textMuted }]}>Tu lista está vacía</Text>
              <Text style={[s.emptySub, { color: C.textSub }]}>Toca + para agregar productos</Text>
            </View>
          }
        />

        {/* ── Total bar + Checkout ── */}
        <View style={[s.totalBar, { backgroundColor: C.surface, borderTopColor: C.border }]}>
          <View>
            <Text style={[s.totalLabel, { color: C.textMuted }]}>TOTAL EST.</Text>
            <Text style={[s.totalAmt, { color: C.text }]}>{fmt(list.totalAmount)}</Text>
          </View>
          {isOpen && (
            <TouchableOpacity style={s.checkoutBtn} onPress={toggleListStatus}>
              <Text style={s.checkoutTxt}>Finalizar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Action bar (mic | FAB+ | qr) ── */}
        {isOpen && (
          <View style={[s.actionBar, { backgroundColor: C.actionBar, borderTopColor: C.border }]}>
            {/* mic */}
            <TouchableOpacity style={s.actionBtn}>
              <MaterialIcons name="mic" size={24} color={C.textMuted} />
            </TouchableOpacity>

            {/* FAB */}
            <TouchableOpacity style={s.fabSmall} onPress={openAddModal} activeOpacity={0.85}>
              <MaterialIcons name="add" size={26} color="#fff" />
            </TouchableOpacity>

            {/* QR */}
            <TouchableOpacity style={s.actionBtn}>
              <MaterialIcons name="qr-code-scanner" size={24} color={C.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Modal: add / edit product ── */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={resetForm}
        >
          <View style={s.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalSheet}>
              <View style={[s.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
                {/* handle */}
                <View style={[s.handle, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]} />

                <View style={s.modalHeader}>
                  <Text style={[s.modalTitle, { color: C.text }]}>
                    {editingItem?._id ? 'Editar Producto' : 'Agregar Producto'}
                  </Text>
                  <TouchableOpacity onPress={resetForm}>
                    <MaterialIcons name="close" size={22} color={C.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <CustomInput
                    label="Nombre"
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="Ej: Leche"
                    leftIcon="shopping-cart"
                    isLightThemeDefault={!isDark}
                  />
                  <View style={s.inputRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <CustomInput
                        label="Cantidad"
                        value={itemQuantity}
                        onChangeText={setItemQuantity}
                        placeholder="1"
                        isLightThemeDefault={!isDark}
                      />
                    </View>
                    <View style={{ flex: 1.5 }}>
                      <CustomInput
                        label="Unidad"
                        value={itemUnit}
                        onChangeText={setItemUnit}
                        placeholder="unid, kg…"
                        isLightThemeDefault={!isDark}
                      />
                    </View>
                  </View>
                  <CustomInput
                    label="Precio unit. (opcional)"
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    placeholder="0.00"
                    isLightThemeDefault={!isDark}
                  />
                  <CustomInput
                    label="Notas"
                    value={itemNotes}
                    onChangeText={setItemNotes}
                    placeholder="Marca, detalles…"
                    isLightThemeDefault={!isDark}
                  />
                  <CustomButton
                    title={editingItem?._id ? 'Guardar cambios' : 'Agregar a la lista'}
                    onPress={handleSave}
                    isLoading={isAddingItem}
                    style={{ marginTop: 20, borderRadius: 16 }}
                  />
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt: { fontSize: 15, fontWeight: '500' },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusTxt: { fontSize: 12, fontWeight: '700' },

  // title
  titleWrap: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 },
  listTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  listSub: { fontSize: 13, fontWeight: '400', marginTop: 2, marginBottom: 14 },
  progressBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  // section list
  listContent: { paddingHorizontal: 24, paddingBottom: 200 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.3,
    textTransform: 'uppercase', marginTop: 24, marginBottom: 14,
  },

  // item row
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.15)',
  },
  check: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  itemName: { flex: 1, fontSize: 15, fontWeight: '500' },
  itemNameDone: { textDecorationLine: 'line-through' },
  itemQty: { fontSize: 13 },

  // empty
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTxt: { fontSize: 18, fontWeight: '600' },
  emptySub: { fontSize: 13 },

  // total bar
  totalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  totalAmt: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  checkoutBtn: {
    backgroundColor: PRIMARY, borderRadius: 16,
    paddingHorizontal: 22, paddingVertical: 12,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  checkoutTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // action bar (bottom)
  actionBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 44, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    backdropFilter: 'blur(20px)',
  },
  actionBtn: { padding: 10 },
  fabSmall: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -20,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '90%' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  inputRow: { flexDirection: 'row' },
});
