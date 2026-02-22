/**
 * CartViewScreen — Checkout view with products grouped by category
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
     FlatList,
     Image,
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
import RBSheet from 'react-native-raw-bottom-sheet';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { IItemProduct } from '@/interfaces/item-product.interface';
import { IProduct } from '@/interfaces/product.interface';
import { IShoppingList, IShoppingListUpdate } from '@/interfaces/shopping-list.interface';
import { productRepository } from '@/repositories/product.repository';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PRIMARY = '#FF6C37';

const LIGHT = {
     bg: '#F9FAFB',
     headerBg: '#FFFFFF',
     surface: '#FFFFFF',
     border: '#E2E8F0',
     text: '#0F172A',
     textMuted: '#64748B',
     textFaint: '#94A3B8',
     imgBg: '#FFFFFF',
     inputBg: '#FFFFFF',
     inputBorder: '#E2E8F0',
     inputText: '#0F172A',
     footerBg: '#FFFFFF',
     footerBorder: '#F1F5F9',
     actionBar: '#FFFFFF',
     actionBarBorder: '#E2E8F0',
};

const DARK = {
     bg: '#121212',
     headerBg: '#121212',
     surface: '#1E1E1E',
     border: '#2D2D2D',
     text: '#F1F5F9',
     textMuted: '#94A3B8',
     textFaint: '#52525B',
     imgBg: '#1E1E1E',
     inputBg: '#252525',
     inputBorder: 'rgba(255,255,255,0.08)',
     inputText: '#F1F5F9',
     footerBg: '#121212',
     footerBorder: '#1F1F23',
     actionBar: '#1E1E1E',
     actionBarBorder: '#2D2D2D',
};

interface CartItem extends IItemProduct {
     cartQty: number;
}

interface GroupedItems {
     category: string;
     data: CartItem[];
}

export default function CartViewScreen() {
     const router = useRouter();
     const params = useLocalSearchParams<{ id: string }>();
     const id = params.id;
     const isDark = useColorScheme() === 'dark';
     const C = isDark ? DARK : LIGHT;
     const user = useAuthStore((s) => s.user);

     const [list, setList] = useState<IShoppingList | null>(null);
     const [loading, setLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);
     const [items, setItems] = useState<CartItem[]>([]);

const [products, setProducts] = useState<IProduct[]>([]);
     const sheetRef = useRef<{ open: () => void; close: () => void } | null>(null);
     const editBsRef = useRef<{ open: () => void; close: () => void } | null>(null);

     const [searchProduct, setSearchProduct] = useState('');
     const { height: SCREEN_H } = useWindowDimensions();

     const productSheetHeight = useMemo(() => SCREEN_H * 0.7, [SCREEN_H]);
     const editSheetHeight = useMemo(() => SCREEN_H * 0.55, [SCREEN_H]);

     // Edit state
     const [editName, setEditName] = useState('');
     const [editStatus, setEditStatus] = useState<'open' | 'closed'>('open');
     const [editTotalAmount, setEditTotalAmount] = useState('');
     const [saving, setSaving] = useState(false);

     const fetchList = useCallback(async () => {
          if (!id) {
               setLoading(false);
               return;
          }
          try {
               const data = await shoppingListRepository.getById(id);
               setList(data);
               if (data?.itemsProduct) {
                    const cartItems: CartItem[] = data.itemsProduct.map((item) => ({
                         ...item,
                         cartQty: 1,
                    }));
                    setItems(cartItems);
               }
          } catch (error) {
               console.error('[CartView] Error fetching list:', error);
               showToast.error('Error', 'No se pudo cargar la lista');
          } finally {
               setLoading(false);
               setRefreshing(false);
          }
     }, [id]);

     const fetchProducts = useCallback(async () => {
          try {
               const data = await productRepository.findAll();
               setProducts(data || []);
          } catch {
               // Ignore
          }
     }, []);

     useEffect(() => {
          fetchList();
          fetchProducts();
     }, [fetchList]);

     const onRefresh = () => {
          setRefreshing(true);
          fetchList();
     };

     const groupedItems = useMemo((): GroupedItems[] => {
          const groups: Record<string, CartItem[]> = {};
          items.forEach((item) => {
               const cat = (item as unknown as { category?: string }).category || 'General';
               if (!groups[cat]) groups[cat] = [];
               groups[cat].push(item);
          });
          return Object.entries(groups).map(([category, data]) => ({
               category,
               data,
          }));
     }, [items]);

     const toggle = (itemId: string) => {
          setItems((prev) =>
               prev.map((i) =>
                    i._id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
               )
          );
     };

     const changeQty = (itemId: string, delta: number) => {
          setItems((prev) =>
               prev.map((i) =>
                    i._id === itemId
                         ? { ...i, cartQty: Math.max(1, (i.cartQty || 1) + delta) }
                         : i
               )
          );
     };

     const addProductToList = async (product: IProduct) => {
          if (!list?._id || !user?._id) return;
          try {
               await shoppingListRepository.addItem(list._id, {
                    name: product.name,
                    quantity: product.defaultQuantity || 1,
                    unit: product.defaultUnit || 'unid',
                    price: product.defaultPrice || 0,
                    isCompleted: false,
                    memberId: user._id,
               });
               showToast.success('Éxito', 'Producto agregado');
               sheetRef.current?.close();
               fetchList();
          } catch {
               showToast.error('Error', 'No se pudo agregar el producto');
          }
     };

     const openEditSheet = () => {
          if (!list) return;
          setEditName(list.name);
          setEditStatus(list.status || 'open');
          setEditTotalAmount(list.totalAmount?.toString() || '0');
          editBsRef.current?.open();
     };

     const handleSaveEdit = async () => {
          if (!list?._id) return;
          const name = editName.trim();
          if (!name) { showToast.error('Error', 'El nombre no puede estar vacío'); return; }
          setSaving(true);
          try {
               const updateData: IShoppingListUpdate = {
                    name,
                    status: editStatus,
                    totalAmount: parseFloat(editTotalAmount) || 0,
               };
               await shoppingListRepository.update(list._id, updateData);
               showToast.success('Éxito', 'Lista actualizada');
               editBsRef.current?.close();
               fetchList();
          } catch {
               showToast.error('Error', 'No se pudo actualizar la lista');
          } finally {
               setSaving(false);
          }
     };

     const filteredProducts = products.filter((p) =>
          p.name.toLowerCase().includes(searchProduct.toLowerCase())
     );

const total = items.reduce((sum, item) => {
           const price = item.price || 0;
           return sum + price * (item.cartQty || 1);
      }, 0);

      const renderProductItem = ({ item }: { item: IProduct }) => (
          <TouchableOpacity
               style={[s.productItem, { borderColor: C.border }]}
               onPress={() => addProductToList(item)}
               activeOpacity={0.7}
          >
               <View style={[s.productImg, { backgroundColor: C.imgBg }]}>
                    {item.secure_url ? (
                         <Image source={{ uri: item.secure_url }} style={s.productImgInner} />
                    ) : (
                         <MaterialIcons name="shopping-bag" size={24} color={C.textMuted} />
                    )}
               </View>
               <View style={s.productInfo}>
                    <Text style={[s.productName, { color: C.text }]}>{item.name}</Text>
                    <Text style={[s.productDetail, { color: C.textMuted }]}>
                         {item.defaultQuantity} {item.defaultUnit} {item.defaultPrice ? `• $${item.defaultPrice}` : ''}
                    </Text>
               </View>
               <MaterialIcons name="add-circle" size={28} color={PRIMARY} />
          </TouchableOpacity>
     );

     return (
          <View style={[s.root, { backgroundColor: C.bg }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

               <View style={{ height: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight ?? 28, backgroundColor: C.headerBg }} />

               <View style={[s.header, { backgroundColor: C.headerBg }]}>
                    <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: isDark ? '#2D2D2D' : '#F1F5F9' }]}>
                         <MaterialIcons name="arrow-back" size={20} color={C.text} />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: C.text }]}>{list?.name || 'Carrito'} </Text>
                    <TouchableOpacity onPress={openEditSheet} style={[s.backBtn, { backgroundColor: isDark ? '#2D2D2D' : '#F1F5F9' }]}>
                         <MaterialIcons name="settings" size={20} color={C.text} />
                    </TouchableOpacity>
               </View>

               {loading ? (
                    <View style={s.loading}>
                         <MaterialIcons name="shopping-cart" size={36} color={PRIMARY} />
                         <Text style={[s.loadingTxt, { color: C.textMuted }]}>Cargando...</Text>
                    </View>
               ) : (
                    <>
                         <ScrollView
                              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 180 }}
                              showsVerticalScrollIndicator={false}
                              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />}
                         >
                              {items.length === 0 ? (
                                   <View style={s.emptyWrap}>
                                        <MaterialIcons name="shopping-cart" size={64} color={C.textFaint} />
                                        <Text style={[s.emptyTitle, { color: C.text }]}>Carrito vacío</Text>
                                        <Text style={[s.emptySub, { color: C.textMuted }]}>Toca el botón + para agregar productos</Text>
                                   </View>
                              ) : (
                                   groupedItems.map((group) => (
                                        <View key={group.category} style={s.categorySection}>
                                             <Text style={[s.categoryLabel, { color: C.textMuted }]}>{group.category.toUpperCase()}</Text>
                                             {group.data.map((item) => (
                                                  <View key={item._id} style={s.itemWrapper}>
                                                       <View style={s.itemRow}>
                                                            <TouchableOpacity
                                                                 style={[s.checkbox, { borderColor: item.isCompleted ? PRIMARY : C.border, backgroundColor: item.isCompleted ? PRIMARY : 'transparent' }]}
                                                                 onPress={() => item._id && toggle(item._id)}
                                                                 activeOpacity={0.7}
                                                            >
                                                                 {item.isCompleted && <MaterialIcons name="check" size={12} color="#fff" />}
                                                            </TouchableOpacity>

                                                            <View style={[s.imgBox, { backgroundColor: C.imgBg }]}>
                                                                 {item.secure_url ? (
                                                                      <Image source={{ uri: item.secure_url }} style={[s.img, item.isCompleted && { opacity: 0.4 }]} resizeMode="contain" />
                                                                 ) : (
                                                                      <MaterialIcons name="shopping-bag" size={24} color={C.textMuted} />
                                                                 )}
                                                            </View>

                                                            <View style={[s.info, item.isCompleted && { opacity: 0.45 }]}>
                                                                 <Text style={[s.price, { color: item.price ? PRIMARY : C.textMuted }]}>
                                                                      {item.price ? `$${item.price.toFixed(2)}` : '—'}
                                                                 </Text>
                                                                 <Text style={[s.name, { color: C.text }, item.isCompleted && { textDecorationLine: 'line-through' }]} numberOfLines={2}>
                                                                      {item.name}
                                                                 </Text>
                                                                 <Text style={[s.size, { color: C.textMuted }]}>{item.quantity} {item.unit}</Text>
                                                            </View>

                                                            <View style={[s.qtyActions, { borderColor: C.border }]}>
                                                                 <TouchableOpacity onPress={() => item._id && changeQty(item._id, -1)} style={s.qtyBtn}>
                                                                      <MaterialIcons name="remove" size={16} color={C.textMuted} />
                                                                 </TouchableOpacity>
                                                                 <Text style={[s.qtyVal, { color: C.text }]}>{item.cartQty || 1}</Text>
                                                                 <TouchableOpacity onPress={() => item._id && changeQty(item._id, +1)} style={s.qtyBtn}>
                                                                      <MaterialIcons name="add" size={16} color={PRIMARY} />
                                                                 </TouchableOpacity>
                                                            </View>
                                                       </View>
                                                  </View>
                                             ))}
                                        </View>
                                   ))
                              )}
                         </ScrollView>
                         {/* ── action bar (mic | FAB+ | qr) ── */}
                         <View style={[s.actionBar, { backgroundColor: C.actionBar, borderTopColor: C.actionBarBorder }]}>
                              <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
                                   <MaterialIcons name="mic" size={26} color={C.textMuted} />
                              </TouchableOpacity>
                              <TouchableOpacity style={s.fab} onPress={() => sheetRef.current?.open()} activeOpacity={0.8}>
                                   <MaterialIcons name="add" size={28} color="#fff" />
                              </TouchableOpacity>

                              <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
                                   <MaterialIcons name="qr-code-scanner" size={26} color={C.textMuted} />
                              </TouchableOpacity>
                         </View>



                         <View style={[s.footer, { backgroundColor: C.footerBg, borderTopColor: C.footerBorder }]}>
                              <View style={s.footerContent}>
                                   <Text style={[s.footerLabel, { color: C.textMuted }]}>Total</Text>
                                   <Text style={[s.footerTotal, { color: C.text }]}>${total.toFixed(2)}</Text>
                              </View>
                              <CustomButton
                                   title="Finalizar"
                                   variant="primary"
                                   onPress={() => { }}
                                   style={s.checkoutBtn}
                              />
                         </View>
                    </>
               )
               }

{/* ── RBSheet: Agregar productos ── */}
                <RBSheet
                     ref={sheetRef}
                     height={productSheetHeight}
                     draggable
                >
                     <View style={s.sheetContent}>
                          <Text style={[s.sheetTitle, { color: C.text }]}>Agregar Productos</Text>

                          <View style={[s.searchBar, { backgroundColor: C.inputBg, borderColor: C.inputBorder }]}>
                               <MaterialIcons name="search" size={20} color={C.textMuted} />
                               <TextInput
                                    style={[s.searchInput, { color: C.inputText }]}
                                    placeholder="Buscar productos..."
                                    placeholderTextColor={C.textMuted}
                                    value={searchProduct}
                                    onChangeText={setSearchProduct}
                               />
                          </View>

                          <FlatList
                               data={filteredProducts}
                               renderItem={renderProductItem}
                               keyExtractor={(item: IProduct) => item._id || Math.random().toString()}
                               contentContainerStyle={s.productList}
                               showsVerticalScrollIndicator={false}
                          />
                     </View>
                </RBSheet>

{/* ── RBSheet: editar lista ── */}
                <RBSheet
                     ref={editBsRef}
                     height={editSheetHeight}
                     draggable
                >
                     <View style={s.sheetContent}>
                          <Text style={[s.sheetTitle, { color: C.text }]}>Editar Lista</Text>

                          {/* nombre */}
                          <Text style={[s.inputLabel, { color: C.textMuted }]}>NOMBRE DE LA LISTA</Text>
                          <View style={[s.editInputWrap, { backgroundColor: C.inputBg, borderColor: C.inputBorder }]}>
                               <MaterialIcons name="shopping-cart" size={18} color={C.textMuted} />
                               <TextInput
                                    style={[s.editInput, { color: C.inputText }]}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Nombre de la lista"
                                    placeholderTextColor={C.textMuted}
                               />
                          </View>

                          {/* status */}
                          <Text style={[s.inputLabel, { color: C.textMuted }]}>ESTADO</Text>
                          <View style={[s.editInputWrap, { backgroundColor: C.inputBg, borderColor: C.inputBorder }]}>
                               <MaterialIcons name="flag" size={18} color={C.textMuted} />
                               <TextInput
                                    style={[s.editInput, { color: C.inputText }]}
                                    value={editStatus === 'open' ? 'Abierta' : 'Cerrada'}
                                    readOnly
                                    onChangeText={(text: string) => setEditStatus(text === 'open' || text === 'closed' ? text : 'open')}
                                    placeholder="Abierta o Cerrada"
                                    placeholderTextColor={C.textMuted}
                               />
                          </View>

                          {/* total amount */}
                          <Text style={[s.inputLabel, { color: C.textMuted }]}>MONTO TOTAL</Text>
                          <View style={[s.editInputWrap, { backgroundColor: C.inputBg, borderColor: C.inputBorder }]}>
                               <MaterialIcons name="attach-money" size={18} color={C.textMuted} />
                               <TextInput
                                    style={[s.editInput, { color: C.inputText }]}
                                    value={editTotalAmount}
                                    readOnly
                                    onChangeText={setEditTotalAmount}
                                    placeholder="0.00"
                                    placeholderTextColor={C.textMuted}
                                    keyboardType="decimal-pad"
                               />
                          </View>

                          {/* buttons */}
                          <View style={s.sheetBtns}>
                               <CustomButton
                                    title="Cancelar"
                                    variant="outlined"
                                    onPress={() => editBsRef.current?.close()}
                                    style={{ flex: 1 }}
                               />
                               <CustomButton
                                    title={saving ? 'Guardando...' : 'Guardar'}
                                    variant="primary"
                                    onPress={handleSaveEdit}
                                    isLoading={saving}
                                    style={{ flex: 1 }}
                               />
                          </View>
                     </View>
                </RBSheet>
          </View >
     );
}

const s = StyleSheet.create({
     root: { flex: 1 },
     loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
     loadingTxt: { fontSize: 15, fontWeight: '500' },
     header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
     backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
     headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2, flex: 1, textAlign: 'center' },
     categorySection: { marginBottom: 24 },
     categoryLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
     itemWrapper: { marginBottom: 16 },
     itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
     checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
     imgBox: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 , backgroundColor: '#FFFFFF',  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, },
     img: { width: '100%', height: '100%' },
     info: { flex: 1, gap: 1 },
     price: { fontSize: 16, fontWeight: '700' },
     name: { fontSize: 13, fontWeight: '500', lineHeight: 17 },
     size: { fontSize: 11, marginTop: 1 },
     qtyActions: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.02)' },
     qtyBtn: { padding: 6, alignItems: 'center', justifyContent: 'center' },
     qtyVal: { fontSize: 13, fontWeight: '700', paddingHorizontal: 4, minWidth: 22, textAlign: 'center' },
     emptyWrap: { alignItems: 'center', paddingVertical: 64, gap: 12 },
     emptyTitle: { fontSize: 18, fontWeight: '700' },
     emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 240 },
     footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, borderTopWidth: StyleSheet.hairlineWidth },
     footerContent: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
     footerLabel: { fontSize: 14, fontWeight: '500' },
     footerTotal: { fontSize: 18, fontWeight: '700' },
     checkoutBtn: { backgroundColor: PRIMARY, borderRadius: 18, paddingVertical: 16, alignItems: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
     checkoutLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
     fab: { position: 'relative', bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
     sheetBg: { borderTopLeftRadius: 28, borderTopRightRadius: 28 },
     sheetContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
     sheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
     searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10, marginBottom: 12 },
     searchInput: { flex: 1, fontSize: 14, padding: 0, margin: 0 },
     productList: { paddingBottom: 20 },
     productItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
     productImg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' , backgroundColor: '#FFFFFF',  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, },
     productImgInner: { width: '100%', height: '100%', borderRadius: 12 },
     productInfo: { flex: 1 },
     productName: { fontSize: 14, fontWeight: '600' },
     productDetail: { fontSize: 12, marginTop: 2 },

     avatarRow: { flexDirection: 'row', alignItems: 'center' },
     avatar: {
          width: 32, height: 32, borderRadius: 16, borderWidth: 2,
     },
     avatarAdd: {
          width: 32, height: 32, borderRadius: 16, borderWidth: 2,
          alignItems: 'center', justifyContent: 'center',
     },
     avatarAddTxt: { fontSize: 16, fontWeight: '700' },

     // title
     titleWrap: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
     title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },

     // scroll
     scroll: { paddingHorizontal: 24 },

     // section
     section: { marginBottom: 28 },
     sectionLabel: {
          fontSize: 11, fontWeight: '700', letterSpacing: 1.3,
          textTransform: 'uppercase', marginBottom: 12,
     },
     itemsWrap: {},

     itemRowDone: { opacity: 0.5 },
     check: {
          width: 24, height: 24, borderRadius: 12, borderWidth: 2,
          alignItems: 'center', justifyContent: 'center',
     },
     itemName: { flex: 1, fontSize: 15, fontWeight: '500' },
     itemQty: { fontSize: 13 },

     // action bar
     actionBar: {
          position: 'absolute',
          //bottom: TAB_TOTAL + 2,
          bottom: 140,
          left: 16,
          right: 16,
          borderRadius: 20,
          borderTopWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 28,
          height: 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 10,
     },
     actionBtn: { padding: 8 },

     // edit sheet
     inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, marginLeft: 2 },
     editInputWrap: {
          flexDirection: 'row', alignItems: 'center',
          borderRadius: 8, borderWidth: 1,
          paddingHorizontal: 14, paddingVertical: 5,
          gap: 10, marginBottom: 16,
     },
     editInput: { flex: 1, fontSize: 15, padding: 0, margin: 0 },
     sheetBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
     cancelBtn: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 15, alignItems: 'center' },
     cancelTxt: { fontSize: 15, fontWeight: '600' },
     saveBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
     saveGrad: { paddingVertical: 15, alignItems: 'center' },
     saveTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

});
