import { PRIMARY_COLOR as PRIMARY, useAppTheme } from '@/hooks/useAppTheme';
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
     TouchableOpacity,
     useWindowDimensions,
     View
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { Text } from '@/components/Themed';
import { IItemProduct } from '@/interfaces/item-product.interface';
import { IProduct } from '@/interfaces/product.interface';
import { IShoppingList, IShoppingListUpdate } from '@/interfaces/shopping-list.interface';
import { productRepository } from '@/repositories/product.repository';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RBSheet from 'react-native-raw-bottom-sheet';
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
     const { colors: Colors, isDark } = useAppTheme();
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
               style={[style.productItem, { borderColor: Colors.borderColor }]}
               onPress={() => addProductToList(item)}
               activeOpacity={0.7}
          >
               <View style={[style.productImg, { backgroundColor: Colors.productImageBackgroundColor }]}>
                    {item.secure_url ? (
                         <Image source={{ uri: item.secure_url }} style={style.productImgInner} />
                    ) : (
                         <MaterialIcons name="shopping-bag" size={24} color={Colors.secondaryTextColor} />
                    )}
               </View>
               <View style={style.productInfo}>
                    <Text style={[style.productName, { color: Colors.primaryTextColor }]}>{item.name}</Text>
                    <Text style={[style.productDetail, { color: Colors.secondaryTextColor }]}>
                         {item.defaultQuantity} {item.defaultUnit} {item.defaultPrice ? `• $${item.defaultPrice}` : ''}
                    </Text>
               </View>
               <MaterialIcons name="add-circle" size={28} color={PRIMARY} />
          </TouchableOpacity>
     );

     return (
          <View style={[style.root, { backgroundColor: Colors.screenBackgroundColor }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

               <View style={{ height: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight ?? 28, backgroundColor: Colors.headerBackgroundColor }} />

               <View style={[style.header]}>
                    <TouchableOpacity onPress={() => router.back()} style={[style.backBtn]}>
                         <Feather name="chevron-left" size={24} color={Colors.primaryTextColor} />
                    </TouchableOpacity>
                    <Text style={[style.headerTitle, { color: Colors.primaryTextColor }]}>{list?.name || 'Carrito'} </Text>
                    <TouchableOpacity onPress={openEditSheet} style={[style.backBtn, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }]}>
                         <Feather name="settings" size={20} color={Colors.primaryTextColor} />
                    </TouchableOpacity>
               </View>

               {
                    loading ? (
                         <View style={style.loading}>
                              <MaterialIcons name="shopping-cart" size={36} color={PRIMARY} />
                              <Text style={[style.loadingTxt, { color: Colors.secondaryTextColor }]}>Cargando...</Text>
                         </View>
                    ) : (
                         <>
                              <ScrollView
                                   contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 180 }}
                                   showsVerticalScrollIndicator={false}
                                   refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />}
                              >
                                   {items.length === 0 ? (
                                        <View style={style.emptyWrap}>
                                             <MaterialIcons name="shopping-cart" size={64} color={Colors.tertiaryTextColor} />
                                             <Text style={[style.emptyTitle, { color: Colors.primaryTextColor }]}>Carrito vacío</Text>
                                             <Text style={[style.emptySub, { color: Colors.secondaryTextColor }]}>Toca el botón + para agregar productos</Text>
                                        </View>
                                   ) : (
                                        groupedItems.map((group) => (
                                             <View key={group.category} style={style.categorySection}>
                                                  <Text style={[style.categoryLabel, { color: Colors.secondaryTextColor }]}>{group.category.toUpperCase()}</Text>
                                                  {group.data.map((item) => (
                                                       <View key={item._id} style={style.itemWrapper}>
                                                            <View style={style.itemRow}>
                                                                 <TouchableOpacity
                                                                      style={[
                                                                           style.checkbox,
                                                                           { borderColor: item.isCompleted ? 'transparent' : Colors.borderColor, backgroundColor: item.isCompleted ? PRIMARY : 'transparent' }
                                                                      ]}
                                                                      onPress={() => item._id && toggle(item._id)}
                                                                      activeOpacity={0.7}
                                                                 >
                                                                      {item.isCompleted && <MaterialIcons name="check" size={16} color="#fff" />}
                                                                 </TouchableOpacity>

                                                                 <View style={[style.imgBox, { backgroundColor: Colors.productImageBackgroundColor }]}>
                                                                      {item.secure_url ? (
                                                                           <Image source={{ uri: item.secure_url }} style={[style.img, item.isCompleted && { opacity: 0.4 }]} resizeMode="contain" />
                                                                      ) : (
                                                                           <MaterialIcons name="shopping-bag" size={24} color={Colors.secondaryTextColor} />
                                                                      )}
                                                                 </View>

                                                                 <View style={[style.info, item.isCompleted && { opacity: 0.45 }]}>
                                                                      <Text style={[style.name, { color: Colors.primaryTextColor }, item.isCompleted && { textDecorationLine: 'line-through' }]} numberOfLines={2}>
                                                                           {item.name}
                                                                      </Text>
                                                                      <Text style={[style.size, { color: Colors.secondaryTextColor }]}>
                                                                           {item.quantity} {item.unit} • {(item.price || 0).toFixed(2).replace('.', ',')} €
                                                                      </Text>
                                                                 </View>

                                                                 <View style={[style.qtyActions, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F5F7FA' }]}>
                                                                      <TouchableOpacity onPress={() => item._id && changeQty(item._id, -1)} style={[style.qtyBtn, { backgroundColor: Colors.surfaceBackgroundColor, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 }]}>
                                                                           <MaterialIcons name="remove" size={18} color={Colors.primaryTextColor} />
                                                                      </TouchableOpacity>
                                                                      <Text style={[style.qtyVal, { color: Colors.primaryTextColor }]}>{item.cartQty || 1}</Text>
                                                                      <TouchableOpacity onPress={() => item._id && changeQty(item._id, +1)} style={[style.qtyBtn, { backgroundColor: PRIMARY, elevation: 4, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }]}>
                                                                           <MaterialIcons name="add" size={18} color="#FFFFFF" />
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
                              <View style={[style.actionBar, { backgroundColor: Colors.actionBarBackgroundColor, borderTopColor: Colors.actionBarBorderColor }]}>
                                   <TouchableOpacity style={style.actionBtn} activeOpacity={0.7}>
                                        <MaterialIcons name="mic" size={26} color={Colors.secondaryTextColor} />
                                   </TouchableOpacity>
                                   <TouchableOpacity style={style.fab} onPress={() => sheetRef.current?.open()} activeOpacity={0.8}>
                                        <MaterialIcons name="add" size={28} color="#fff" />
                                   </TouchableOpacity>

                                   <TouchableOpacity style={style.actionBtn} activeOpacity={0.7}>
                                        <MaterialIcons name="qr-code-scanner" size={26} color={Colors.secondaryTextColor} />
                                   </TouchableOpacity>
                              </View>



                              <View style={[style.footer, { borderTopColor: Colors.footerBorderColor }]}>
                                   <View style={style.footerContent}>
                                        <Text style={[style.footerLabel, { color: Colors.secondaryTextColor }]}>Total</Text>
                                        <Text style={[style.footerTotal, { color: Colors.primaryTextColor }]}>{total.toFixed(2).replace('.', ',')} €</Text>
                                   </View>
                                   <CustomButton
                                        title="Finalizar"
                                        variant="primary"
                                        onPress={() => { }}
                                        style={style.checkoutBtn}
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
                    <View style={style.sheetContent}>
                         <Text style={[style.sheetTitle, { color: Colors.primaryTextColor }]}>Agregar Productos</Text>

                         <View style={{ marginBottom: 12 }}>
                              <CustomInput
                                   leftIcon="search"
                                   value={searchProduct}
                                   onChangeText={setSearchProduct}
                                   placeholder="Buscar productos..."
                                   rightIcon={searchProduct.length > 0 ? "x" : undefined}
                                   onRightIconPress={() => setSearchProduct('')}
                              />
                         </View>

                         <FlatList
                              data={filteredProducts}
                              renderItem={renderProductItem}
                              keyExtractor={(item: IProduct) => item._id || Math.random().toString()}
                              contentContainerStyle={style.productList}
                              showsVerticalScrollIndicator={false}
                         />
                    </View>
               </RBSheet>

               {/* ── RBSheet: editar lista ── */}
               <RBSheet
                    ref={editBsRef}
                    height={editSheetHeight}
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
                    <View style={style.sheetContent}>
                         <Text style={[style.sheetTitle, { color: Colors.primaryTextColor }]}>Editar Lista</Text>

                         {/* nombre */}
                         <Text style={[style.inputLabel, { color: Colors.secondaryTextColor }]}>NOMBRE DE LA LISTA</Text>
                         <View style={{ marginBottom: 16 }}>
                              <CustomInput
                                   leftIcon="shopping-cart"
                                   value={editName}
                                   onChangeText={setEditName}
                                   placeholder="Nombre de la lista"
                              />
                         </View>

                         {/* status */}
                         <Text style={[style.inputLabel, { color: Colors.secondaryTextColor }]}>ESTADO</Text>
                         <View style={{ marginBottom: 16 }}>
                              <CustomInput
                                   leftIcon="flag"
                                   value={editStatus === 'open' ? 'Abierta' : 'Cerrada'}
                                   readOnly
                                   onChangeText={(text: string) => setEditStatus(text === 'open' || text === 'closed' ? text : 'open')}
                                   placeholder="Abierta o Cerrada"
                              />
                         </View>

                         {/* total amount */}
                         <Text style={[style.inputLabel, { color: Colors.secondaryTextColor }]}>MONTO TOTAL</Text>
                         <View style={{ marginBottom: 16 }}>
                              <CustomInput
                                   leftIcon="dollar-sign"
                                   value={editTotalAmount}
                                   readOnly
                                   onChangeText={setEditTotalAmount}
                                   placeholder="0.00"
                                   keyboardType="decimal-pad"
                              />
                         </View>

                         {/* buttons */}
                         <View style={style.sheetBtns}>
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

const style = StyleSheet.create({
     root: { flex: 1 },
     loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
     loadingTxt: { fontSize: 15, fontWeight: '500' },
     header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
     backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
     headerTitle: { fontSize: 20, letterSpacing: -0.2, flex: 1, textAlign: 'center' },
     categorySection: { marginBottom: 24 },
     categoryLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
     itemWrapper: { marginBottom: 16 },
     itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
     checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
     imgBox: { width: 64, height: 64, borderRadius: 50, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, },
     img: { width: '100%', height: '100%' },
     info: { flex: 1, gap: 3, justifyContent: 'center' },
     name: { fontSize: 16, fontWeight: '600', lineHeight: 20 },
     size: { fontSize: 13, fontWeight: '500' },
     qtyActions: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 4 },
     qtyBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
     qtyVal: { fontSize: 16, fontWeight: '700', paddingHorizontal: 12, minWidth: 32, textAlign: 'center' },
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
     sheetTitle: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
     searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10, marginBottom: 12 },
     searchInput: { flex: 1, fontSize: 14, padding: 0, margin: 0 },
     productList: { paddingBottom: 20 },
     productItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
     productImg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, },
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
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
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
