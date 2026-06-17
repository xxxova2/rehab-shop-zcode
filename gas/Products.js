/**
 * Products.gs — Product catalog domain logic
 *
 * Thin module that re-exports product-related operations. Heavy lifting
 * is in Utilities.gs (sheet helpers, validation) and Code.gs (HTTP layer).
 *
 * Public functions (used by Code.gs):
 *   - listProducts(filter)
 *   - getProduct(sku)
 *   - createProduct(data)
 *   - updateProduct(sku, data)
 *   - deleteProduct(sku)
 *   - adjustStock(sku, delta)
 *   - getLowStock()
 *   - normalizeProductRow(row)
 */

function listProducts(filter) {
  filter = filter || {};
  var rows = getSheetData(SHEET_NAMES.INVENTORY);
  var out = rows.map(normalizeProductRow);
  if (filter.category) out = out.filter(function (p) { return String(p.category).toLowerCase() === String(filter.category).toLowerCase(); });
  if (filter.search) {
    var q = String(filter.search).toLowerCase();
    out = out.filter(function (p) {
      return (p.product_name || '').toLowerCase().indexOf(q) !== -1
        || (p.product_name_ar || '').toLowerCase().indexOf(q) !== -1
        || (p.sku || '').toLowerCase().indexOf(q) !== -1;
    });
  }
  if (filter.in_stock_only) out = out.filter(function (p) { return p.stock_qty > 0; });
  return out;
}

function getProduct(sku) {
  var row = getInventoryItem(sku);
  return row ? normalizeProductRow(row) : null;
}

function createProduct(data) {
  if (!data || !data.sku) throw new Error('sku required');
  if (getInventoryItem(data.sku)) throw new Error('SKU already exists: ' + data.sku);
  return addInventoryItem(data);
}

function updateProduct(sku, data) {
  if (!getInventoryItem(sku)) throw new Error('SKU not found: ' + sku);
  return updateInventoryItem(sku, data);
}

function deleteProduct(sku) {
  var sheet = getSheet(SHEET_NAMES.INVENTORY);
  if (!sheet) return false;
  var row = findRowByColumn(SHEET_NAMES.INVENTORY, 'sku', sku);
  if (row <= 0) return false;
  sheet.deleteRow(row);
  return true;
}

function adjustStock(sku, delta) {
  var item = getInventoryItem(sku);
  if (!item) throw new Error('SKU not found: ' + sku);
  var current = parseInt(item.stock_qty) || 0;
  var next = Math.max(0, current + (parseInt(delta) || 0));
  return updateInventoryItem(sku, { stock_qty: next });
}

function getLowStock() {
  return getLowStockItems().map(normalizeProductRow);
}

function normalizeProductRow(row) {
  return {
    sku: row.sku || '',
    product_name: row.product_name || '',
    product_name_ar: row.product_name_ar || '',
    description: row.description || '',
    size: row.size || '',
    color: row.color || '',
    stock_qty: parseInt(row.stock_qty) || 0,
    reorder_threshold: parseInt(row.reorder_threshold) || 0,
    price: parseFloat(row.price) || 0,
    currency: CURRENCY,
    category: row.category || '',
    image_url: row.image_url || '',
    last_updated: row.last_updated || ''
  };
}
