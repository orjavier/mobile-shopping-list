/**
 * CartViewScreen — boceto: dark_mode_cart_view.html
 */

import {
     Image,
     Platform,
     ScrollView,
     StatusBar,
     StyleSheet,
     TouchableOpacity,
     useColorScheme,
     View,
} from 'react-native';

import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';

// ─── mock data ────────────────────────────────────────────────────────────────
type CartItem = {
     id: string;
     name: string;
     size: string;
     price: string;
     originalPrice?: string;
     qty: string | number;
     image: string;
     badge?: string;
};

const CART_ITEMS: CartItem[] = [
     {
          id: '1',
          name: 'Cliff Crunchy Nut Butter Bar',
          size: '2.4 oz',
          price: '$2.50',
          qty: 4,
          image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=120&q=80',
     },
     {
          id: '2',
          name: 'Tostitos Chunky Salsa',
          size: '15.5 oz',
          price: '$3.69',
          qty: 1,
          image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=120&q=80',
     },
     {
          id: '3',
          name: 'Prego+ Super Veggies Traditional Italian Sauce',
          size: '24 oz',
          price: '$1.49',
          originalPrice: '$2.99',
          qty: 2,
          image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=120&q=80',
          badge: '%',
     },
     {
          id: '4',
          name: 'Dietz & Watson Gourmet Lite Turkey Breast',
          size: '1 ea',
          price: '$7.99 / lb',
          qty: '0.5 lb',
          image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=120&q=80',
     },
     {
          id: '5',
          name: 'Autumn Glory Apple',
          size: '$0.39 each',
          price: '$0.99 / lb',
          qty: '2.5 lb',
          image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=120&q=80',
     },
];

const TOTAL = '$21.17';

// ─── tokens ───────────────────────────────────────────────────────────────────
const LIGHT = {
     bg: '#F8F8F8',
     headerBg: '#FFFFFF',
     text: '#0F172A',
     textMuted: '#64748B',
     textSub: '#94A3B8',
     itemImg: '#F1F5F9',
     qtyBorder: '#E2E8F0',
     footerBg: '#FFFFFF',
     footerBorder: '#F1F5F9',
     priceSale: '#EF4444',
     priceOrig: '#94A3B8',
};
const DARK = {
     bg: '#121212',
     headerBg: '#121212',
     text: '#F1F5F9',
     textMuted: '#94A3B8',
     textSub: '#71717A',
     itemImg: '#1E1E1E',
     qtyBorder: '#3F3F46',
     footerBg: '#121212',
     footerBorder: '#1F1F23',
     priceSale: '#F87171',
     priceOrig: '#52525B',
};

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function CartViewScreen() {
     const isDark = useColorScheme() === 'dark';
     const C = isDark ? DARK : LIGHT;

     return (
          <View style={[s.root, { backgroundColor: C.bg }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

               {/* status bar spacer */}
               <View style={{ height: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28), backgroundColor: C.headerBg }} />

               {/* ── header ── */}
               <View style={[s.header, { backgroundColor: C.headerBg }]}>
                    <Text style={[s.headerTitle, { color: C.text }]}>Cart</Text>
               </View>

               {/* ── item list ── */}
               <ScrollView
                    contentContainerStyle={[s.scroll, { paddingBottom: TAB_TOTAL + 120 }]}
                    showsVerticalScrollIndicator={false}
               >
                    {CART_ITEMS.map((item) => (
                         <View key={item.id} style={s.itemRow}>
                              {/* image wrapper */}
                              <View style={[s.imgWrap, { backgroundColor: C.itemImg }]}>
                                   {item.badge && (
                                        <View style={s.badge}>
                                             <Text style={s.badgeTxt}>{item.badge}</Text>
                                        </View>
                                   )}
                                   <Image
                                        source={{ uri: item.image }}
                                        style={s.img}
                                        resizeMode="contain"
                                   />
                              </View>

                              {/* info */}
                              <View style={s.itemInfo}>
                                   {/* price row */}
                                   <View style={s.priceRow}>
                                        <Text style={[
                                             s.price,
                                             { color: item.originalPrice ? C.priceSale : PRIMARY },
                                        ]}>
                                             {item.price}
                                        </Text>
                                        {item.originalPrice && (
                                             <Text style={[s.priceOrig, { color: C.priceOrig }]}>
                                                  {item.originalPrice}
                                             </Text>
                                        )}
                                   </View>
                                   <Text style={[s.itemName, { color: C.text }]} numberOfLines={2}>
                                        {item.name}
                                   </Text>
                                   <Text style={[s.itemSize, { color: C.textMuted }]}>{item.size}</Text>
                              </View>

                              {/* qty pill */}
                              <View style={[s.qtyPill, { borderColor: C.qtyBorder }]}>
                                   <Text style={[s.qtyTxt, { color: C.text }]}>{item.qty}</Text>
                              </View>
                         </View>
                    ))}
               </ScrollView>

               {/* ── footer: checkout button ── */}
               <View style={[s.footer, { backgroundColor: C.footerBg, borderTopColor: C.footerBorder }]}>
                    <TouchableOpacity style={s.checkoutBtn} activeOpacity={0.85}>
                         <Text style={s.checkoutLabel}>Checkout</Text>
                         <Text style={s.checkoutTotal}>{TOTAL}</Text>
                    </TouchableOpacity>
               </View>

               {/* ── CustomTabBar ── */}
               <CustomTabBar activeRoute="/(tabs)/lists" />
          </View>
     );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
     root: { flex: 1 },

     // header
     header: {
          paddingHorizontal: 24, paddingTop: 6, paddingBottom: 14,
          alignItems: 'center',
     },
     headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },

     // scroll
     scroll: { paddingHorizontal: 24, paddingTop: 8 },

     // item row
     itemRow: {
          flexDirection: 'row', alignItems: 'center',
          gap: 16, marginBottom: 24,
     },
     imgWrap: {
          width: 64, height: 64, borderRadius: 18,
          alignItems: 'center', justifyContent: 'center',
          overflow: 'visible', position: 'relative',
     },
     img: { width: 54, height: 54, borderRadius: 12 },
     badge: {
          position: 'absolute', top: -6, left: -6,
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: '#EF4444',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
     },
     badgeTxt: { fontSize: 9, color: '#fff', fontWeight: '800' },

     itemInfo: { flex: 1, gap: 2 },
     priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
     price: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
     priceOrig: { fontSize: 11, textDecorationLine: 'line-through' },
     itemName: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
     itemSize: { fontSize: 11 },

     qtyPill: {
          minWidth: 40, height: 40, borderRadius: 20,
          borderWidth: 1, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 8,
     },
     qtyTxt: { fontSize: 13, fontWeight: '600' },

     // footer
     footer: {
          position: 'absolute',
          bottom: TAB_TOTAL,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: 14,
          borderTopWidth: StyleSheet.hairlineWidth,
     },
     checkoutBtn: {
          backgroundColor: PRIMARY,
          borderRadius: 18,
          paddingVertical: 16,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: PRIMARY,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 6,
     },
     checkoutLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
     checkoutTotal: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
