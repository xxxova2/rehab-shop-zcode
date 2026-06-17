/**
 * Admin.gs — Admin auth + dashboard stats
 *
 * Admin auth: simple shared secret in Script Properties (ADMIN_KEY).
 * Matches project taste: "Use simple shared secret key for admin auth
 * instead of JWT or complex auth flows."
 */

function isValidAdminKey(provided) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || '';
  if (!expected || !provided) return false;
  return String(provided) === String(expected);
}

function adminAuthStatus() {
  return {
    has_admin_key: !!PropertiesService.getScriptProperties().getProperty('ADMIN_KEY'),
    has_sheet_id: !!SHEET_ID,
    sheet_id_set: !!SHEET_ID,
    store: STORE_NAME,
    currency: CURRENCY
  };
}

function getAdminDashboard() {
  var productStats = listProducts({});
  var orderStatsResult = orderStats();
  var lowStock = getLowStock();
  var customers = getSheetData(SHEET_NAMES.CUSTOMERS);
  return {
    products: {
      total: productStats.length,
      in_stock: productStats.filter(function (p) { return p.stock_qty > 0; }).length,
      out_of_stock: productStats.filter(function (p) { return p.stock_qty <= 0; }).length,
      low_stock: lowStock.length
    },
    orders: orderStatsResult,
    customers: { total: customers.length },
    low_stock: lowStock
  };
}
