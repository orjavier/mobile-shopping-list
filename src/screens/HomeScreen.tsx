import { useCallback, useEffect, useState } from 'react';
import {
     Dimensions,
     FlatList,
     Image,
     Platform,
     RefreshControl,
     ScrollView,
     StatusBar,
     StyleSheet,
     TextInput,
     TouchableOpacity,
     View
} from 'react-native';

import AnimatedDrawer from '@/components/AnimatedDrawer';
import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { ICategory } from '@/interfaces/category.interface';
import { IProduct } from '@/interfaces/product.interface';
import { IShoppingList } from '@/interfaces/shopping-list.interface';
import { categoryRepository } from '@/repositories/category.repository';
import { productRepository } from '@/repositories/product.repository';
import { shoppingListRepository } from '@/repositories/shopping-list.repository';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/toast';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';

// ─── design tokens ────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get('window');

const LIGHT = {
     bg: '#FFFFFF',
     surface: '#FFFFFF',
     headerBg: 'rgba(255,255,255,0.88)',
     searchBg: '#F1F5F9',
     text: '#0F172A',
     textMuted: '#64748B',
     textSub: '#94A3B8',
     sectionTitle: '#0F172A',
     listCard: '#FFF7F3',
     listCardBorder: '#FFE4D6',
     listCardIconBg: `${PRIMARY}28`,
     catCardBg: '#F1F5F9',
     productCard: '#FFFFFF',
     productCardBorder: '#F1F5F9',
     productBg: '#F8FAFC',
     statusOpen: '#22C55E',
     statusOpenBg: '#DCFCE7',
};

const DARK = {
     bg: '#0F0F0F',
     surface: '#1C1C1E',
     headerBg: 'rgba(15,15,15,0.90)',
     searchBg: '#1A1A1A',
     text: '#F1F5F9',
     textMuted: '#94A3B8',
     textSub: '#64748B',
     sectionTitle: '#FFFFFF',
     listCard: 'rgba(255,255,255,0.06)',
     listCardBorder: 'rgba(255,255,255,0.10)',
     listCardIconBg: `${PRIMARY}28`,
     catCardBg: 'rgba(255,255,255,0.06)',
     productCard: 'rgba(255,255,255,0.04)',
     productCardBorder: 'rgba(255,255,255,0.07)',
     productBg: 'transparent',
     statusOpen: '#4ADE80',
     statusOpenBg: 'rgba(74,222,128,0.15)',
};

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
     const k = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
     return EMOJI_MAP[k] ?? '🛒';
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
     const router = useRouter();
     const scheme = useColorScheme();
     const isDark = scheme === 'dark';
     const C = isDark ? DARK : LIGHT;
     const user = useAuthStore((s) => s.user);

     const [lists, setLists] = useState<IShoppingList[]>([]);
     const [categories, setCategories] = useState<ICategory[]>([]);
     const [products, setProducts] = useState<IProduct[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);
     const [search, setSearch] = useState('');
     const [drawerVisible, setDrawerVisible] = useState(false);

     const fetchAll = useCallback(async () => {
          if (!user?._id) return;
          try {
               const [l, c, p] = await Promise.all([
                    shoppingListRepository.getByUser(user._id),
                    categoryRepository.findAll().catch(() => [] as ICategory[]),
                    productRepository.findAll().catch(() => [] as IProduct[]),
               ]);
               setLists(l);
               setCategories(c.slice(0, 8));
               setProducts(p.slice(0, 6));
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
               <TouchableOpacity
                    style={[s.lCard, { backgroundColor: C.listCard, borderColor: C.listCardBorder }]}
                    onPress={() => router.push('/(tabs)/lists' as never)}
                    activeOpacity={0.75}
               >
                    <View style={[s.lIcon, { backgroundColor: C.listCardIconBg }]}>
                         <MaterialIcons name="shopping-cart" size={20} color={PRIMARY} />
                    </View>
                    <View style={s.lBody}>
                         <Text style={[s.lName, { color: C.text }]} numberOfLines={1}>{item.name}</Text>
                         <Text style={[s.lMeta, { color: C.textMuted }]}>{item.itemsProduct?.length ?? 0} productos</Text>
                    </View>
                    {open && (
                         <View style={[s.openBadge, { backgroundColor: C.statusOpenBg }]}>
                              <Text style={[s.openDot, { color: C.statusOpen }]}>●</Text>
                         </View>
                    )}
               </TouchableOpacity>
          );
     };

     const CatChip = ({ cat }: { cat: ICategory }) => (
          <TouchableOpacity
               style={s.catChip}
               onPress={() => router.push('/(tabs)/categories' as never)}
               activeOpacity={0.75}
          >
               <View style={[s.catBox, { backgroundColor: C.catCardBg }]}>
                    <Text style={s.catEmoji}>{emojiFor(cat.name)}</Text>
               </View>
               <Text style={[s.catLabel, { color: C.textMuted }]} numberOfLines={1}>{cat.name}</Text>
          </TouchableOpacity>
     );

     const ProdCard = ({ prod }: { prod: IProduct }) => (
          <TouchableOpacity
               style={[s.pCard, { backgroundColor: C.productCard, borderColor: C.productCardBorder }]}
               onPress={() => router.push('/(tabs)/products' as never)}
               activeOpacity={0.8}
          >
               <View style={[s.pImgWrap, { backgroundColor: C.productBg }]}>
                    {prod.secure_url
                         ? <Image source={{ uri: prod.secure_url }} style={s.pImg} resizeMode="cover" />
                         : <Text style={s.pEmoji}>🛍️</Text>
                    }
               </View>
               <View style={s.pInfo}>
                    <Text style={[s.pName, { color: C.text }]} numberOfLines={1}>{prod.name}</Text>
                    <Text style={[s.pUnit, { color: C.textMuted }]}>{prod.defaultUnit ?? '1 u.'}</Text>
                    <Text style={[s.pPrice, { color: PRIMARY }]}>
                         {prod.defaultPrice != null ? fmt(prod.defaultPrice) : '—'}
                    </Text>
               </View>
          </TouchableOpacity>
     );

     // ─── loading ───────────────────────────────────────────────────────────────
     if (isLoading) {
          return (
               <View style={[s.root, { backgroundColor: C.bg }]}>
                    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
                    <View style={s.loading}>
                         <MaterialIcons name="shopping-cart" size={36} color={PRIMARY} />
                         <Text style={[s.loadingTxt, { color: C.textMuted }]}>Cargando…</Text>
                    </View>
                    <CustomTabBar activeRoute="/(tabs)" />
               </View>
          );
     }

     // ─── render ────────────────────────────────────────────────────────────────
     return (
          <View style={[s.root, { backgroundColor: C.bg }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

               {/* ── Sticky Header ── */}
               <View style={[s.header, { backgroundColor: C.headerBg }]}>
                    <View style={{ height: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) }} />
                    <View style={s.headerRow}>
                         <Text style={[s.hTitle, { color: C.sectionTitle }]}></Text>
                         <TouchableOpacity onPress={() => setDrawerVisible(true)} style={[s.menuBtn, { backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9' }]}>
                              <MaterialIcons name="menu" size={24} color={C.text} />
                         </TouchableOpacity>
                    </View>
                    <View style={[s.searchBar, { backgroundColor: C.searchBg }]}>
                         <MaterialIcons name="search" size={20} color={C.textSub} />
                         <TextInput
                              style={[s.searchInput, { color: C.text }]}
                              placeholder="Buscar productos, categorías, o listas"
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
               </View>

               {/* ── Content ── */}
               <ScrollView
                    style={s.scroll}
                    contentContainerStyle={s.scrollInner}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />
                    }
               >
                    {/* Recent Lists */}
                    <View style={s.section}>
                         <View style={s.secHead}>
                              <Text style={[s.secTitle, { color: C.sectionTitle }]}>Listas recientes</Text>
                              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/lists' as never)}>
                                   <Text style={[s.seeAll, { color: PRIMARY }]}>Ver todas</Text>
                              </TouchableOpacity>
                         </View>
                         {filtered.length === 0 ? (
                              <View style={s.emptyRow}>
                                   <Text style={[s.emptyTxt, { color: C.textMuted }]}>
                                        {search ? 'Sin resultados' : 'Aún no tienes listas de compras'}
                                   </Text>
                              </View>
                         ) : (
                              <FlatList
                                   data={filtered.slice(0, 10)}
                                   keyExtractor={(i) => i._id ?? i.name}
                                   renderItem={({ item }) => <ListCard item={item} />}
                                   horizontal
                                   showsHorizontalScrollIndicator={false}
                                   contentContainerStyle={s.hList}
                                   style={s.hScroll}
                                   scrollEnabled
                              />
                         )}
                    </View>

                    {/* Recent Categories */}
                    {categories.length > 0 && (
                         <View style={s.section}>
                              <View style={s.secHead}>
                                   <Text style={[s.secTitle, { color: C.sectionTitle }]}>Categorias recientes</Text>
                                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/categories' as never)}>
                                        <Text style={[s.seeAll, { color: PRIMARY }]}>Ver todas</Text>
                                   </TouchableOpacity>
                              </View>
                              <View style={s.catRow}>
                                   {categories.slice(0, 4).map((c) => (
                                        <CatChip key={c._id ?? c.name} cat={c} />
                                   ))}
                              </View>
                         </View>
                    )}

                    {/* Recent Products */}
                    {products.length > 0 && (
                         <View style={s.section}>
                              <View style={s.secHead}>
                                   <Text style={[s.secTitle, { color: C.sectionTitle }]}>Productos recientes</Text>
                                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/products' as never)}>
                                        <Text style={[s.seeAll, { color: PRIMARY }]}>Ver todos</Text>
                                   </TouchableOpacity>
                              </View>
                              <View style={s.prodGrid}>
                                   {products.slice(0, 4).map((p) => (
                                        <ProdCard key={p._id ?? p.name} prod={p} />
                                   ))}
                              </View>
                         </View>
                    )}

                    <View style={{ height: 20 }} />
               </ScrollView>

               {/* ── Custom Tab Bar ── */}
               <CustomTabBar activeRoute="/(tabs)" />

               {/* ── Animated Drawer ── */}
               <AnimatedDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
          </View>
     );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const PROD_COL_GAP = 12;
const PROD_COL_W = (W - 40 - PROD_COL_GAP) / 2;

const s = StyleSheet.create({
     root: { flex: 1 },
     loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
     loadingTxt: { fontSize: 15, fontWeight: '500' },

     header: {
          paddingHorizontal: 20,
          paddingBottom: 14,
          zIndex: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
     },
     hTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginBottom: 12 },
     headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
     menuBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
     searchBar: {
          flexDirection: 'row', alignItems: 'center',
          borderRadius: 18, paddingHorizontal: 14, paddingVertical: 13, gap: 10, marginTop: 14,
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
     secTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
     seeAll: { fontSize: 13, fontWeight: '600' },

     hScroll: { marginHorizontal: -20 },
     hList: { paddingHorizontal: 20, gap: 14 },

     lCard: { width: 148, padding: 14, borderRadius: 20, borderWidth: 1, gap: 10 },
     lIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
     lBody: { gap: 3 },
     lName: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
     lMeta: { fontSize: 11 },
     openBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
     openDot: { fontSize: 9, fontWeight: '700' },

     emptyRow: { paddingVertical: 20, alignItems: 'center' },
     emptyTxt: { fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

     catRow: { flexDirection: 'row', justifyContent: 'space-between' },
     catChip: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 4 },
     catBox: { width: 62, height: 62, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
     catEmoji: { fontSize: 28 },
     catLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

     prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: PROD_COL_GAP },
     pCard: {
          width: PROD_COL_W, flexDirection: 'row', alignItems: 'center',
          borderRadius: 18, borderWidth: 1, padding: 10, gap: 10,
     },
     pImgWrap: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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
