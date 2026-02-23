/**
 * DetailedListView — boceto: dark_mode_detailed_list_view.html
 */

import {
     Image,
     Platform,
     ScrollView,
     StatusBar,
     StyleSheet,
     TouchableOpacity,
     View,
} from 'react-native';

import CustomTabBar, { PRIMARY, TAB_TOTAL } from '@/components/CustomTabBar';
import { Text } from '@/components/Themed';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
// ─── mock data ────────────────────────────────────────────────────────────────
type Item = { id: string; name: string; qty: string; done: boolean };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
     {
          title: 'Dairy',
          items: [
               { id: '1', name: 'Milk', qty: '1 gal', done: false },
               { id: '2', name: 'Butter', qty: '1 ct', done: false },
               { id: '3', name: 'Parmesan cheese', qty: '1 ct', done: true },
               { id: '4', name: 'Eggs', qty: '4 ct', done: true },
          ],
     },
     {
          title: 'Bakery',
          items: [
               { id: '5', name: 'Bread', qty: '1 ct', done: false },
               { id: '6', name: 'Blueberry muffins', qty: '2 ct', done: true },
          ],
     },
     {
          title: 'Drinks',
          items: [
               { id: '7', name: 'Mocha coffee', qty: '1 ct', done: false },
               { id: '8', name: 'Orange juice', qty: '1 gal', done: false },
               { id: '9', name: 'Almond Milk', qty: '1 ct', done: false },
          ],
     },
];

const COLLABORATORS = [
     'https://i.pravatar.cc/40?img=10',
     'https://i.pravatar.cc/40?img=11',
];

// ─── tokens ───────────────────────────────────────────────────────────────────
// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function DetailedListView() {
     const { colors: Colors, isDark } = useAppTheme();

     return (
          <View style={[s.root, { backgroundColor: Colors.screenBackgroundColor }]}>
               <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

               {/* status bar spacer */}
               <View style={{ height: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28), backgroundColor: Colors.headerBackgroundColor }} />

               {/* ── header row: back | spacer | collaborators ── */}
               <View style={[s.header, { backgroundColor: Colors.headerBackgroundColor }]}>
                    {/* back button */}
                    <TouchableOpacity style={[s.backBtn, { backgroundColor: Colors.backButtonBackgroundColor }]} activeOpacity={0.75}>
                         <MaterialIcons name="arrow-back" size={22} color={Colors.backButtonIconColor} />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }} />

                    {/* collaborator avatars */}
                    <View style={s.avatarRow}>
                         {COLLABORATORS.map((uri, i) => (
                              <Image
                                   key={i}
                                   source={{ uri }}
                                   style={[s.avatar, {
                                        marginLeft: i === 0 ? 0 : -10,
                                        borderColor: isDark ? '#000' : '#fff',
                                   }]}
                              />
                         ))}
                         {/* +add */}
                         <View style={[s.avatarAdd, {
                              marginLeft: -10,
                              borderColor: isDark ? '#000' : '#fff',
                              backgroundColor: `${PRIMARY}30`,
                         }]}>
                              <Text style={[s.avatarAddTxt, { color: PRIMARY }]}>+</Text>
                         </View>
                    </View>
               </View>

               {/* ── title ── */}
               <View style={[s.titleWrap, { backgroundColor: Colors.headerBackgroundColor }]}>
                    <Text style={[s.title, { color: Colors.primaryTextColor }]}>Morning breakfast</Text>
               </View>

               {/* ── items scroll ── */}
               <ScrollView
                    contentContainerStyle={[s.scroll, { paddingBottom: TAB_TOTAL + 130 }]}
                    showsVerticalScrollIndicator={false}
               >
                    {SECTIONS.map((section) => (
                         <View key={section.title} style={s.section}>
                              {/* section label */}
                              <Text style={[s.sectionLabel, { color: Colors.sectionLabelTextColor }]}>
                                   {section.title.toUpperCase()}
                              </Text>

                              {/* items */}
                              <View style={s.itemsWrap}>
                                   {section.items.map((item, idx) => (
                                        <View
                                             key={item.id}
                                             style={[
                                                  s.itemRow,
                                                  { borderBottomColor: Colors.dividerColor },
                                                  idx === section.items.length - 1 && { borderBottomWidth: 0 },
                                                  item.done && s.itemRowDone,
                                             ]}
                                        >
                                             {/* checkbox */}
                                             <View style={[
                                                  s.check,
                                                  item.done
                                                       ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
                                                       : { backgroundColor: 'transparent', borderColor: Colors.checkboxBorderColor },
                                             ]}>
                                                  {item.done && <MaterialIcons name="check" size={13} color="#fff" />}
                                             </View>

                                             {/* name */}
                                             <Text style={[
                                                  s.itemName,
                                                  { color: item.done ? Colors.completedItemTextColor : Colors.primaryTextColor },
                                                  item.done && { textDecorationLine: 'line-through' },
                                             ]}>
                                                  {item.name}
                                             </Text>

                                             {/* qty */}
                                             <Text style={[s.itemQty, { color: Colors.secondaryTextColor }]}>{item.qty}</Text>
                                        </View>
                                   ))}
                              </View>
                         </View>
                    ))}
               </ScrollView>

               {/* ── action bar (mic | FAB+ | qr) ── */}
               <View style={[s.actionBar, { backgroundColor: Colors.actionBarBackgroundColor, borderTopColor: Colors.actionBarBorderColor }]}>
                    <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
                         <MaterialIcons name="mic" size={26} color={Colors.secondaryTextColor} />
                    </TouchableOpacity>

                    {/* floating FAB */}
                    <TouchableOpacity style={s.fab} activeOpacity={0.85}>
                         <MaterialIcons name="add" size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
                         <MaterialIcons name="qr-code-scanner" size={26} color={Colors.secondaryTextColor} />
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
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, paddingVertical: 10,
     },
     backBtn: {
          width: 40, height: 40, borderRadius: 20,
          alignItems: 'center', justifyContent: 'center',
     },
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

     // item row
     itemRow: {
          flexDirection: 'row', alignItems: 'center',
          paddingVertical: 15, gap: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
     },
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
          bottom: TAB_TOTAL + 2,
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
     fab: {
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: PRIMARY,
          alignItems: 'center', justifyContent: 'center',
          marginTop: -28,
          shadowColor: PRIMARY,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
     },
});
