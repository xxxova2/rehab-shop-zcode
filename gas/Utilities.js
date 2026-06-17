/**
 * Utilities.gs — Sheet helpers, validation, ID generation, logging, retry
 *
 * Ported verbatim from clothing-store-backend. Used by Code.gs and the
 * domain files (Orders.gs, Products.gs, Admin.gs, Images.gs).
 */

// ============================================================================
// SHEETS
// ============================================================================

function getSheet(sheetName) {
  if (!SHEET_ID) throw new Error('SHEET_ID not set in Script Properties');
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(sheetName);
}

function getSheetData(sheetName) {
  var sheet = getSheet(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j].trim()] = row[j];
    result.push(obj);
  }
  return result;
}

function findRowByColumn(sheetName, columnName, searchValue) {
  var sheet = getSheet(sheetName);
  if (!sheet) return -1;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][colIndex] == searchValue) return i + 1;
  }
  return -1;
}

function appendSheetRow(sheetName, data) {
  var sheet = getSheet(sheetName);
  if (!sheet) return false;
  sheet.appendRow(Object.keys(data).map(function (k) { return data[k]; }));
  return true;
}

function updateSheetRow(sheetName, rowNumber, data) {
  var sheet = getSheet(sheetName);
  if (!sheet) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var key in data) {
    var colIndex = headers.indexOf(key);
    if (colIndex !== -1) rowData[colIndex] = data[key];
  }
  sheet.getRange(rowNumber, 1, 1, rowData.length).setValues([rowData]);
  return true;
}

function getCellValue(sheetName, columnLetter, rowNumber) {
  var sheet = getSheet(sheetName);
  if (!sheet) return '';
  return sheet.getRange(columnLetter + rowNumber).getValue();
}

function setCellValue(sheetName, columnLetter, rowNumber, value) {
  var sheet = getSheet(sheetName);
  if (!sheet) return false;
  sheet.getRange(columnLetter + rowNumber).setValue(value);
  return true;
}

// ============================================================================
// VALIDATION
// ============================================================================

function isValidSaudiPhone(phone) {
  if (!phone) return false;
  return /^\+966[0-9]{9}$/.test(String(phone).trim());
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function validateRequiredFields(data, requiredFields) {
  var missing = [];
  requiredFields.forEach(function (f) {
    if (!data[f] || data[f] === '' || (Array.isArray(data[f]) && data[f].length === 0)) missing.push(f);
  });
  return { isValid: missing.length === 0, missingFields: missing };
}

function isValidSaudiCity(city) {
  return city && SAUDI_CITIES.indexOf(city) !== -1;
}

function isValidStatus(status) {
  return status && Object.values(ORDER_STATUSES).indexOf(status) !== -1;
}

function isValidStatusTransition(currentStatus, newStatus) {
  if (!STATUS_PIPELINE[currentStatus]) return false;
  return STATUS_PIPELINE[currentStatus].indexOf(newStatus) !== -1;
}

function getInventoryItem(sku) {
  var inventory = getSheetData(SHEET_NAMES.INVENTORY);
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].sku === sku) return inventory[i];
  }
  return null;
}

function validateStockAvailability(items) {
  var errors = [];
  items.forEach(function (item) {
    var inv = getInventoryItem(item.sku);
    if (!inv) { errors.push('SKU not found: ' + item.sku); return; }
    if ((parseInt(inv.stock_qty) || 0) < (item.qty || 1)) {
      errors.push('Insufficient stock for ' + item.sku + ' (have ' + inv.stock_qty + ', need ' + item.qty + ')');
    }
  });
  return { isValid: errors.length === 0, errors: errors };
}

// ============================================================================
// ORDER DATA PIPELINE
// ============================================================================

function validateOrderData(data) {
  var errors = [];
  var required = validateRequiredFields(data, ['customer_name', 'phone', 'address', 'city', 'items']);
  if (!required.isValid) errors = errors.concat(required.missingFields.map(function (f) { return 'Missing ' + f; }));
  if (data.phone && !isValidSaudiPhone(data.phone)) errors.push('Phone must be E.164 format (+9665XXXXXXXX)');
  if (data.email && !isValidEmail(data.email)) errors.push('Invalid email');
  if (data.city && !isValidSaudiCity(data.city)) { /* warn but allow */ }
  if (data.items && data.items.length === 0) errors.push('No items');
  return { isValid: errors.length === 0, errors: errors };
}

function enrichOrderData(data) {
  var items = (data.items || []).map(function (item) {
    var inv = getInventoryItem(item.sku);
    if (inv) {
      return {
        sku: item.sku,
        product_name: inv.product_name || item.product_name || '',
        product_name_ar: inv.product_name_ar || '',
        size: item.size || inv.size || '',
        color: item.color || inv.color || '',
        qty: parseInt(item.qty) || 1,
        price: parseFloat(inv.price) || 0,
        category: inv.category || ''
      };
    }
    return {
      sku: item.sku, product_name: item.product_name || '', size: item.size || '',
      color: item.color || '', qty: parseInt(item.qty) || 1, price: 0
    };
  });
  return {
    customer_name: data.customer_name, phone: data.phone, email: data.email || '',
    address: data.address, city: data.city, items: items,
    notes: data.notes || '', discount_code: data.discount_code || '',
    source: data.source || DEFAULTS.ORDER_SOURCE,
    whatsapp_consent: !!data.whatsapp_consent
  };
}

function calculateTotals(items, shippingFee) {
  var subtotal = 0;
  items.forEach(function (i) { subtotal += (i.price || 0) * (i.qty || 1); });
  var shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingFee || DEFAULT_SHIPPING_FEE);
  var vat = (subtotal + shipping) * VAT_RATE;
  var total = subtotal + shipping + vat;
  return {
    subtotal: round2_(subtotal),
    shipping: shipping,
    vat_amount: round2_(vat),
    total: round2_(total)
  };
}

function round2_(n) { return Math.round(n * 100) / 100; }

function validateDiscountCode(code, total) {
  var valid = {
    'WELCOME10': { type: 'percentage', value: 0.10, max: 100 },
    'WELCOME20': { type: 'percentage', value: 0.20, max: 200 },
    'FREESHIP': { type: 'fixed', value: DEFAULT_SHIPPING_FEE, max: DEFAULT_SHIPPING_FEE }
  };
  code = String(code || '').toUpperCase().trim();
  if (valid[code]) {
    var d = valid[code];
    var amount = d.type === 'percentage' ? total * d.value : d.value;
    if (d.max && amount > d.max) amount = d.max;
    return { isValid: true, amount: round2_(amount), code: code };
  }
  return { isValid: false, amount: 0, code: code, error: 'Invalid code' };
}

function generateOrderId() {
  var d = new Date();
  var datePart = d.getFullYear() + pad2_(d.getMonth() + 1) + pad2_(d.getDate());
  var orders = getSheetData(SHEET_NAMES.ORDERS);
  var today = orders.filter(function (o) { return o.order_id && String(o.order_id).indexOf(datePart) === 4; });
  var seq = pad4_(today.length + 1);
  return 'ORDER-' + datePart + '-' + seq;
}

function pad2_(n) { return String(n).padStart(2, '0'); }
function pad4_(n) { return String(n).padStart(4, '0'); }

function getCurrentTimestamp() { return new Date().toISOString(); }

// ============================================================================
// INVENTORY MUTATIONS
// ============================================================================

function decrementInventory(items) {
  items.forEach(function (item) {
    var row = findRowByColumn(SHEET_NAMES.INVENTORY, 'sku', item.sku);
    if (row <= 0) return;
    var current = parseInt(getCellValue(SHEET_NAMES.INVENTORY, COLUMN_MAP.INVENTORY.stock_qty, row)) || 0;
    var next = Math.max(0, current - (item.qty || 1));
    setCellValue(SHEET_NAMES.INVENTORY, COLUMN_MAP.INVENTORY.stock_qty, row, next);
    setCellValue(SHEET_NAMES.INVENTORY, COLUMN_MAP.INVENTORY.last_updated, row, getCurrentTimestamp());
  });
}

function incrementInventory(items) {
  items.forEach(function (item) {
    var row = findRowByColumn(SHEET_NAMES.INVENTORY, 'sku', item.sku);
    if (row <= 0) return;
    var current = parseInt(getCellValue(SHEET_NAMES.INVENTORY, COLUMN_MAP.INVENTORY.stock_qty, row)) || 0;
    setCellValue(SHEET_NAMES.INVENTORY, COLUMN_MAP.INVENTORY.stock_qty, row, current + (item.qty || 1));
    setCellValue(SHEET_NAMES.INVENTORY, COLUMN_MAP.INVENTORY.last_updated, row, getCurrentTimestamp());
  });
}

// ============================================================================
// ORDER CREATION + LOOKUP
// ============================================================================

function createOrder(data) {
  var orderId = generateOrderId();
  var now = getCurrentTimestamp();
  var totals = calculateTotals(data.items, DEFAULT_SHIPPING_FEE);
  if (data.discount_code) {
    var d = validateDiscountCode(data.discount_code, totals.total);
    if (d.isValid) totals.total = round2_(totals.total - d.amount);
  }
  var order = {
    order_id: orderId,
    created_at: now,
    customer_name: data.customer_name,
    phone: data.phone,
    email: data.email || '',
    address: data.address,
    city: data.city,
    items: JSON.stringify(data.items),
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    vat_amount: totals.vat_amount,
    total: totals.total,
    currency: CURRENCY,
    status: ORDER_STATUSES.RECEIVED,
    status_updated_at: now,
    invoice_doc_link: '',
    packing_slip_link: '',
    notes: data.notes || '',
    source: data.source || DEFAULTS.ORDER_SOURCE
  };
  appendSheetRow(SHEET_NAMES.ORDERS, order);
  return order;
}

function updateCustomer(order) {
  var existing = findRowByColumn(SHEET_NAMES.CUSTOMERS, 'phone', order.phone);
  if (existing > 0) {
    var data = getSheetData(SHEET_NAMES.CUSTOMERS);
    var row = data[existing - 1];
    updateSheetRow(SHEET_NAMES.CUSTOMERS, existing, {
      name: order.customer_name,
      email: order.email || '',
      total_orders: (parseInt(row.total_orders) || 0) + 1,
      total_spent: round2_((parseFloat(row.total_spent) || 0) + (parseFloat(order.total) || 0)),
      last_order_date: formatDate_(new Date(), 'YYYY-MM-DD'),
      city: order.city
    });
  } else {
    appendSheetRow(SHEET_NAMES.CUSTOMERS, {
      phone: order.phone,
      name: order.customer_name,
      email: order.email || '',
      total_orders: 1,
      total_spent: parseFloat(order.total) || 0,
      last_order_date: formatDate_(new Date(), 'YYYY-MM-DD'),
      city: order.city,
      created_at: getCurrentTimestamp()
    });
  }
}

function getOrderById(orderId) {
  var orders = getSheetData(SHEET_NAMES.ORDERS);
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].order_id === orderId) {
      try { orders[i].items = JSON.parse(orders[i].items); } catch (e) { orders[i].items = []; }
      return orders[i];
    }
  }
  return null;
}

function updateOrderStatus(orderId, newStatus, updatedBy) {
  try {
    var row = findRowByColumn(SHEET_NAMES.ORDERS, 'order_id', orderId);
    if (row <= 0) return { success: false, error: 'Order not found' };
    var orders = getSheetData(SHEET_NAMES.ORDERS);
    var current = orders[row - 1];
    if (!isValidStatusTransition(current.status, newStatus)) {
      return { success: false, error: 'Invalid transition: ' + current.status + ' -> ' + newStatus };
    }
    updateSheetRow(SHEET_NAMES.ORDERS, row, {
      status: newStatus,
      status_updated_at: getCurrentTimestamp()
    });
    var updated = getOrderById(orderId);
    try { sendStatusNotification(updated, newStatus); } catch (e) { logError('status', ERROR_CODES.WHATSAPP_ERROR, e.toString(), {}); }
    return { success: true };
  } catch (err) {
    logError('status_update', ERROR_CODES.UNKNOWN, err.toString(), { orderId: orderId, newStatus: newStatus });
    return { success: false, error: err.toString() };
  }
}

// ============================================================================
// INVENTORY CRUD
// ============================================================================

function updateInventoryItem(sku, updates) {
  var row = findRowByColumn(SHEET_NAMES.INVENTORY, 'sku', sku);
  if (row <= 0) return false;
  updates.last_updated = getCurrentTimestamp();
  return updateSheetRow(SHEET_NAMES.INVENTORY, row, updates);
}

function addInventoryItem(item) {
  return appendSheetRow(SHEET_NAMES.INVENTORY, {
    sku: item.sku,
    product_name: item.product_name,
    product_name_ar: item.product_name_ar || '',
    description: item.description || '',
    size: item.size || '',
    color: item.color || '',
    stock_qty: item.stock_qty || 0,
    reorder_threshold: item.reorder_threshold || 5,
    price: item.price || 0,
    category: item.category || '',
    image_url: item.image_url || '',
    last_updated: getCurrentTimestamp()
  });
}

function getLowStockItems() {
  var inventory = getSheetData(SHEET_NAMES.INVENTORY);
  return inventory.filter(function (i) {
    return (parseInt(i.stock_qty) || 0) <= (parseInt(i.reorder_threshold) || 0);
  });
}

// ============================================================================
// LOGGING
// ============================================================================

function logError(source, errorType, message, context) {
  try {
    appendSheetRow(SHEET_NAMES.ERRORS, {
      timestamp: getCurrentTimestamp(),
      source: source || 'unknown',
      error_type: errorType || ERROR_CODES.UNKNOWN,
      message: message || 'Unknown error',
      context: context ? JSON.stringify(context) : '',
      resolved: false,
      resolved_at: '',
      resolved_by: ''
    });
  } catch (e) {
    Logger.log('logError failed: ' + e);
  }
  Logger.log('[ERROR] ' + source + ': ' + message);
}

function log(level, message, data) {
  Logger.log('[' + level + '] ' + message);
  if (data) Logger.log(JSON.stringify(data));
}

function logWhatsAppMessage(messageData) {
  try {
    appendSheetRow(SHEET_NAMES.MESSAGE_LOG, {
      timestamp: getCurrentTimestamp(),
      order_id: messageData.order_id || '',
      phone: messageData.phone || '',
      message_type: messageData.message_type || '',
      template_name: messageData.template_name || '',
      language: messageData.language || 'en',
      status_sent: messageData.status || 'pending',
      whatsapp_message_id: messageData.whatsapp_message_id || '',
      response: messageData.response || '',
      error_code: messageData.error_code || '',
      retry_count: messageData.retry_count || 0
    });
  } catch (e) { Logger.log('logWhatsAppMessage failed: ' + e); }
}

// ============================================================================
// DATE HELPERS
// ============================================================================

function formatDate_(date, format) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  format = format || 'YYYY-MM-DD HH:mm:ss';
  var p = function (n) { return String(n).padStart(2, '0'); };
  return format
    .replace('YYYY', date.getFullYear())
    .replace('MM', p(date.getMonth() + 1))
    .replace('DD', p(date.getDate()))
    .replace('HH', p(date.getHours()))
    .replace('mm', p(date.getMinutes()))
    .replace('ss', p(date.getSeconds()));
}

// ============================================================================
// BACKUP
// ============================================================================

function createSheetBackup() {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var name = ss.getName() + ' - Backup ' + formatDate_(new Date(), 'YYYY-MM-DD HH-mm-ss');
    var folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_BACKUP_FOLDER_ID');
    var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    var file = DriveApp.getFileById(SHEET_ID).makeCopy(name, folder);
    return { success: true, file_id: file.getId(), file_name: name };
  } catch (err) {
    logError('backup', ERROR_CODES.UNKNOWN, err.toString(), {});
    return { success: false, error: err.toString() };
  }
}
