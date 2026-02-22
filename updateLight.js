const fs = require("fs");

function updateLight(content) {
  return content.replace(/const LIGHT = \{([\s\S]*?)\};/, (match, inner) => {
    let replaced = inner
      .replace(/bg:.*?,/g, "bg: '#F9FAFB',")
      .replace(/headerBg:.*?,/g, "headerBg: '#FFFFFF',")
      .replace(/surface:.*?,/g, "surface: '#FFFFFF',")
      .replace(/searchBg:.*?,/g, "searchBg: '#FFFFFF',")
      .replace(/listCard:.*?,/g, "listCard: '#FFFFFF',")
      .replace(/catCardBg:.*?,/g, "catCardBg: '#FFFFFF',")
      .replace(/productCard:.*?,/g, "productCard: '#FFFFFF',")
      .replace(/productBg:.*?,/g, "productBg: '#FFFFFF',")
      .replace(/cardBg:.*?,/g, "cardBg: '#FFFFFF',")
      .replace(/card:.*?,/g, "card: '#FFFFFF',")
      .replace(/sheetBg:.*?,/g, "sheetBg: '#FFFFFF',")
      .replace(/bottomSheetBg:.*?,/g, "bottomSheetBg: '#FFFFFF',")
      .replace(/inputBg:.*?,/g, "inputBg: '#FFFFFF',")
      .replace(/imgBg:.*?,/g, "imgBg: '#FFFFFF',")
      .replace(/iconBgInactive:.*?,/g, "iconBgInactive: '#FFFFFF',")
      .replace(/listCardIconBg:.*?,/g, "listCardIconBg: '#FFFFFF',");
    return "const LIGHT = {" + replaced + "};";
  });
}

function updateShadows(content) {
  const shadowStr = ` shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, `;

  // These are basically the icons/image wraps that we want to be white and have shadow
  return (
    content
      // CategoriesScreen uses colorIndicator which is just a color splash, maybe we add a shadow, but we were explicitly asked for rounded icons with white background and shadow
      .replace(/lIcon: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `lIcon: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/catBox: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `catBox: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/pImgWrap: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `pImgWrap: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/cardIconWrap: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `cardIconWrap: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/iconWrap: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `iconWrap: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/imgBox: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `imgBox: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/drawerIconContainer: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `drawerIconContainer: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/productImg: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `productImg: {${c}, backgroundColor: '#FFFFFF', ${shadowStr}}`;
        return m;
      })
      .replace(/colorIndicator: \{([^}]*?)\}/g, (m, c) => {
        if (!c.includes("shadowColor"))
          return `colorIndicator: {${c}, ${shadowStr}}`;
        return m;
      })
  );
}

let files = [
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/HomeScreen.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/categories/CategoriesScreen.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/products/ProductsScreen.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/Settings/SettingsScreen.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/ShoppingListsScreen.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/ShoppingList/ShoppingListOverView.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/ShoppingList/DetailedListView.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/screens/ShoppingList/CartViewScreen.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/components/AnimatedDrawer.tsx",
  "d:/dev/ShoppingList/mobile-shopping-list/src/components/CustomInput.tsx",
];

for (let f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, "utf8");
  let newC = updateLight(c);
  newC = updateShadows(newC);

  if (c !== newC) {
    fs.writeFileSync(f, newC);
    console.log("Updated", f);
  }
}
