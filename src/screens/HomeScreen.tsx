import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
     Dimensions,
     FlatList,
     Platform,
     Pressable,
     RefreshControl,
     ScrollView,
     StatusBar,
     StyleSheet,
     View
} from 'react-native';

import CustomInput from "@/components/CustomInput";
import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import SettingsBottomSheet from '@/components/SettingsBottomSheet';
import { Text } from '@/components/Themed';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ICategory } from '@/interfaces/category.interface';
import { IProduct } from '@/interfaces/product.interface';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { categoryRepository } from '@/repositories/category.repository';
import { productRepository } from '@/repositories/product.repository';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── design tokens ────────────────────────────────────────────────────────────
const { width: WIDTH } = Dimensions.get('window');

// ─── category emoji map ───────────────────────────────────────────────────────
const EMOJI_MAP: Record<string, string> = {
     frutas: '🍎', fruits: '🍎',
     verduras: '🥦', vegetables: '🥦',
     lacteos: '🥛', dairy: '🥛',
     carnes: '🥩', meat: '🥩',
     panaderia: '🍞', bakery: '🍞',
     bebidas: '🥤', drinks: '🥤',
     snacks: '🍿',
     limpieza: '🧹', cleaning: '🧹',
     higiene: '🧴', congelados: '🧊',
};
function emojiFor(name: string): string {
     const CATEGORY = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
     return EMOJI_MAP[CATEGORY] ?? '🛒';
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
     const router = useRouter();
     const { colors: Colors, isDark } = useAppTheme();
     const user = useAuthStore((s) => s.user);

     const [lists, setLists] = useState<IShoppingList[]>([]);
     const [categories, setCategories] = useState<ICategory[]>([]);
     const [products, setProducts] = useState<IProduct[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);
     const [search, setSearch] = useState('');
     const bottomSheetRef = useRef<{ open: () => void; close: () => void } | null>(null);

     const fetchAll = useCallback(async () => {
          if (!user?._id) return;
          try {
               const [list, category, product] = await Promise.all([
                    shoppingListRepository.getByUser(user._id),
                    categoryRepository.findAll().catch(() => [] as ICategory[]),
                    productRepository.findAll().catch(() => [] as IProduct[]),
               ]);
               setLists(list);
               setCategories(category.slice(0, 8));
               setProducts(product.slice(0, 6));
          } catch {
               showToast.error('Error', 'No se pudieron cargar los datos');
          } finally {
               setIsLoading(false);
               setRefreshing(false);
          }
     }, [user?._id]);

     useEffect(() => { fetchAll(); }, [fetchAll]);
     const onRefresh = () => { setRefreshing(true); fetchAll(); };

     const fmt = (n: number) => `$${n.toFixed(2)}`;
     const filtered = lists.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

     // ─── sub-cards ─────────────────────────────────────────────────────────────
     const ListCard = ({ item }: { item: IShoppingList }) => {
          const open = item.status === 'open';
          return (
               <Pressable
                    style={[styles.lCard, { backgroundColor: Colors.listCardBackgroundColor, borderColor: Colors.listCardBorderColor }]}
                    onPress={() => router.push('/(tabs)/lists' as never)}
               >
                    <View style={[styles.lIcon, { backgroundColor: Colors.listCardIconBackgroundColor }]}>
                         <Feather name="shopping-cart" size={20} color={PRIMARY} />
                    </View>
                    <View style={styles.lBody}>
                         <Text style={[styles.lName, { color: Colors.primaryTextColor }]} numberOfLines={1}>{item.name}</Text>
                         <Text style={[styles.lMeta, { color: Colors.secondaryTextColor }]}>{item.itemsProduct?.length ?? 0} productos</Text>
                    </View>
                    {open && (
                         <View style={[styles.openBadge, { backgroundColor: Colors.statusOpenBackgroundColor }]}>
                              <Text style={[styles.openDot, { color: Colors.statusOpenTextColor }]}>●</Text>
                         </View>
                    )}
               </Pressable>
          );
     };

     const CatChip = ({ category }: { category: ICategory }) => (
          <Pressable
               style={styles.catChip}
               onPress={() => router.push('/(tabs)/categories' as never)}
          >
               <View style={[styles.catBox, { backgroundColor: Colors.categoryCardBackgroundColor }]}>
                    <Text style={styles.catEmoji}>{emojiFor(category.name)}</Text>
               </View>
               <Text style={[styles.catLabel, { color: Colors.secondaryTextColor }]} numberOfLines={1}>{category.name}</Text>
          </Pressable>
     );

     const ProdCard = ({ product }: { product: IProduct }) => (
          <Pressable
               style={[styles.pCard, {
                    backgroundColor: Colors.productCardBackgroundColor, borderColor: Colors.productCardBorderColor
               }]}
               onPress={() => router.push('/(tabs)/products' as never)}
          >
               <View style={[
                    styles.pImgWrap,
                    !product.secure_url && styles.pImgWrapShadow,
                    { backgroundColor: product.secure_url ? 'transparent' : Colors.productImageBackgroundColor }
               ]}>
                    {product.secure_url
                         ? <Image source={{ uri: product.secure_url }} style={styles.pImg} resizeMode="cover" />
                         : <Text style={styles.pEmoji}>🛍️</Text>
                    }
               </View>
               <View style={styles.pInfo}>
                    <Text style={[styles.pName, { color: Colors.primaryTextColor }]} numberOfLines={1}>{product.name}</Text>
                    <Text style={[styles.pUnit, { color: Colors.secondaryTextColor }]}>{product.defaultUnit ?? '1 u.'}</Text>
                    <Text style={[styles.pPrice, { color: PRIMARY }]}>
                         {product.defaultPrice != null ? fmt(product.defaultPrice) : '—'}
                    </Text>
               </View>
          </Pressable>
     );

     // --- loading ---------------------------------------------------------------
     if (isLoading) {
          return (
               <View style={[styles.root, { backgroundColor: Colors.screenBackgroundColor }]}>
                    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
                    <View style={styles.loading}>
                         <Feather name="shopping-cart" size={36} color={PRIMARY} />
                         <Text style={[styles.loadingTxt, { color: Colors.secondaryTextColor }]}>Cargando…</Text>
                    </View>
                    <CustomTabBar activeRoute="/(tabs)" />
               </View>
          );
     }

     // --- render ----------------------------------------------------------------
     return (
          <View style={[styles.root, { backgroundColor: Colors.screenBackgroundColor }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

               {/* -- Sticky Header -- */}
               <View style={styles.header}>
                    <View style={{ height: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) }} />
                    <View style={[styles.headerRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Image
                                   source={require('../assets/SVGs/simple-logo.svg')}
                                   style={{ width: 32, height: 32 }}
                                   contentFit="cover"
                              />
                              <Text style={[styles.hTitle, { color: Colors.primaryTextColor }]}>Lista de Compras</Text>
                         </View>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Pressable onPress={() => { }} style={[styles.menuBtn, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }]}>
                                   <Feather name="bell" size={24} color={Colors.primaryTextColor} />
                              </Pressable>
                              <Pressable onPress={() => bottomSheetRef.current?.open()} style={[styles.menuBtn, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }]}>
                                   <Feather name="settings" size={24} color={Colors.primaryTextColor} />
                              </Pressable>
                         </View>
                    </View>
                    <View style={{ marginTop: 20, }}>
                         <CustomInput
                              leftIcon="search"
                              value={search}
                              onChangeText={setSearch}
                              placeholder="Buscar productos, categorías, listas..."
                              rightIcon={search.length > 0 ? "x" : undefined}
                              onRightIconPress={() => setSearch('')}
                         />
                         {search.length > 0 && (
                              <Pressable onPress={() => setSearch('')}>
                                   <Feather name="x" size={17} color={Colors.secondaryTextColor} />
                              </Pressable>
                         )}
                    </View>
               </View>

               {/* ── Content ── */}
               <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollInner}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />
                    }
               >
                    {/* Recent Lists */}
                    <View style={styles.section}>
                         <View style={styles.secHead}>
                              <Text style={[styles.secTitle, { color: Colors.sectionLabelTextColor }]}>LISTAS RECIENTES</Text>
                              <Pressable onPress={() => router.push('/(tabs)/lists' as never)}>
                                   <Text style={[styles.seeAll, { color: PRIMARY }]}>Ver todas</Text>
                              </Pressable>
                         </View>
                         {filtered.length === 0 ? (
                              <View style={styles.emptyRow}>
                                   <Text style={[styles.emptyTxt, { color: Colors.secondaryTextColor }]}>
                                        {search ? 'Sin resultados' : 'Aún no tienes listas de compras'}
                                   </Text>
                              </View>
                         ) : (
                              <FlatList
                                   data={filtered.slice(0, 10)}
                                   keyExtractor={(item) => item._id ?? item.name}
                                   renderItem={({ item }) => <ListCard item={item} />}
                                   horizontal
                                   showsHorizontalScrollIndicator={false}
                                   contentContainerStyle={styles.hList}
                                   style={styles.hScroll}
                                   scrollEnabled
                              />
                         )}
                    </View>

                    {/* Recent Categories */}
                    {categories.length > 0 && (
                         <View style={styles.section}>
                              <View style={styles.secHead}>
                                   <Text style={[styles.secTitle, { color: Colors.sectionLabelTextColor }]}>Categorías recientes</Text>
                                   <Pressable onPress={() => router.push('/(tabs)/categories' as never)}>
                                        <Text style={[styles.seeAll, { color: PRIMARY }]}>Ver todas</Text>
                                   </Pressable>
                              </View>
                              <View style={styles.catRow}>
                                   {categories.slice(0, 4).map((category) => (
                                        <CatChip key={category._id ?? category.name} category={category} />
                                   ))}
                              </View>
                         </View>
                    )}

                    {/* Recent Products */}
                    {products.length > 0 && (
                         <View style={styles.section}>
                              <View style={styles.secHead}>
                                   <Text style={[styles.secTitle, { color: Colors.sectionLabelTextColor }]}>Productos recientes</Text>
                                   <Pressable onPress={() => router.push('/(tabs)/products' as never)}>
                                        <Text style={[styles.seeAll, { color: PRIMARY }]}>Ver todos</Text>
                                   </Pressable>
                              </View>
                              <View style={styles.prodGrid}>
                                   {products.slice(0, 4).map((product) => (
                                        <ProdCard key={product._id ?? product.name} product={product} />
                                   ))}
                              </View>
                         </View>
                    )}

                    <View style={{ height: 20 }} />
               </ScrollView>

               {/* ── Custom Tab Bar ── */}
               <CustomTabBar activeRoute="/(tabs)" />

               {/* -- Settings Bottom Sheet -- */}
               <SettingsBottomSheet bottomSheetRef={bottomSheetRef} />
          </View>
     );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const PROD_COL_GAP = 12;
const PROD_COL_W = (WIDTH - 40 - PROD_COL_GAP) / 2;

const styles = StyleSheet.create({
     root: { flex: 1 },
     loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
     loadingTxt: { fontSize: 15, fontWeight: '500' },

     header: {
          paddingHorizontal: 20,
          paddingBottom: 14,
          marginTop: 14,
          zIndex: 20,
          elevation: 4,
     },
     hTitle: { fontSize: 22, letterSpacing: -0.5, },
     headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
     menuBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
     searchBar: {
          flexDirection: 'row', alignItems: 'center',
          borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, gap: 10, marginTop: 14,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
     },
     searchInput: { flex: 1, fontSize: 14, padding: 0, margin: 0 },

     scroll: { flex: 1 },
     scrollInner: {
          paddingTop: 22,
          paddingHorizontal: 20,
          paddingBottom: TAB_TOTAL + 40,
     },

     section: { marginBottom: 28 },
     secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
     secTitle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.3,
          textTransform: 'uppercase',
     },
     seeAll: { fontSize: 13, fontWeight: '600' },

     hScroll: { marginHorizontal: -20 },
     hList: { paddingHorizontal: 20, gap: 14 },

     lCard: { width: 148, padding: 14, borderRadius: 20, borderWidth: 1, gap: 10 },
     lIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, },
     lBody: { gap: 3 },
     lName: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
     lMeta: { fontSize: 11 },
     openBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
     openDot: { fontSize: 9, fontWeight: '700' },

     emptyRow: { paddingVertical: 20, alignItems: 'center' },
     emptyTxt: { fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

     catRow: { flexDirection: 'row', justifyContent: 'space-between' },
     catChip: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 4 },
     catBox: { width: 62, height: 62, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, },
     catEmoji: { fontSize: 28 },
     catLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

     prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: PROD_COL_GAP },
     pCard: {
          width: PROD_COL_W, flexDirection: 'row', alignItems: 'center',
          borderRadius: 18, borderWidth: 1, padding: 10, gap: 10,
     },
     pImgWrap: {
          width: 52, height: 52,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
     },
     pImgWrapShadow: {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
     },
     pImg: { width: '100%', height: '100%' },
     pEmoji: { fontSize: 24 },
     pInfo: { flex: 1, gap: 2 },
     pName: { fontSize: 11, fontWeight: '700', letterSpacing: -0.1 },
     pUnit: { fontSize: 9 },
     pPrice: { fontSize: 11, fontWeight: '700', marginTop: 2 },

     // drawer
     drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
     drawer: { width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
     drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
     drawerUserName: { fontSize: 18, fontWeight: '700' },
     drawerUserEmail: { fontSize: 13, marginTop: 2 },
     drawerContent: { gap: 8 },
     drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
     drawerItemText: { flex: 1, fontSize: 15, fontWeight: '500' },
     drawerFooter: { marginTop: 24 },
});
