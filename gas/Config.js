/**
 * Config.gs — Configuration, constants, sheet column mappings
 *
 * Ported from clothing-store-backend. Sensitive values are read from
 * Script Properties (File > Project properties > Script properties).
 *
 * Required Script Properties (set these before deploying):
 *   SHEET_ID                 — Google Sheet ID hosting the DB
 *   ADMIN_KEY                — Shared secret for admin API calls (any random 32+ char string)
 *   DRIVE_IMAGES_FOLDER_ID   — Drive folder for product image uploads
 *   DRIVE_DOCUMENTS_FOLDER_ID — Drive folder for invoices / packing slips
 *   DRIVE_BACKUP_FOLDER_ID   — Drive folder for daily backups
 *   INVOICE_TEMPLATE_ID      — Google Docs invoice template
 *   PACKING_SLIP_TEMPLATE_ID — Google Docs packing slip template
 *   WHATSAPP_PHONE_ID        — Meta WhatsApp Business phone number ID
 *   WHATSAPP_ACCESS_TOKEN    — Meta WhatsApp Business access token
 */

var SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';

var SHEET_NAMES = {
  ORDERS: 'Orders',
  INVENTORY: 'Inventory',
  CUSTOMERS: 'Customers',
  MESSAGE_LOG: 'Message_Log',
  ERRORS: 'Errors'
};

var COLUMN_MAP = {
  ORDERS: {
    order_id: 'A', created_at: 'B', customer_name: 'C', phone: 'D',
    email: 'E', address: 'F', city: 'G', items: 'H',
    subtotal: 'I', shipping: 'J', vat_amount: 'K', total: 'L',
    currency: 'M', status: 'N', status_updated_at: 'O',
    invoice_doc_link: 'P', packing_slip_link: 'Q',
    notes: 'R', source: 'S'
  },
  INVENTORY: {
    sku: 'A', product_name: 'B', product_name_ar: 'C', description: 'D',
    size: 'E', color: 'F', stock_qty: 'G', reorder_threshold: 'H',
    price: 'I', category: 'J', last_updated: 'K',
    image_url: 'L'
  },
  CUSTOMERS: {
    phone: 'A', name: 'B', email: 'C', total_orders: 'D',
    total_spent: 'E', last_order_date: 'F', city: 'G', created_at: 'H'
  },
  MESSAGE_LOG: {
    timestamp: 'A', order_id: 'B', phone: 'C', message_type: 'D',
    template_name: 'E', language: 'F', status_sent: 'G',
    whatsapp_message_id: 'H', response: 'I', error_code: 'J', retry_count: 'K'
  },
  ERRORS: {
    timestamp: 'A', source: 'B', error_type: 'C', message: 'D',
    context: 'E', resolved: 'F', resolved_at: 'G', resolved_by: 'H'
  }
};

var ORDER_STATUSES = {
  RECEIVED: 'Received', CONFIRMED: 'Confirmed', PACKED: 'Packed',
  SHIPPED: 'Shipped', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', RETURNED: 'Returned'
};

var STATUS_PIPELINE = {
  'Received': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Packed', 'Cancelled'],
  'Packed': ['Shipped', 'Cancelled'],
  'Shipped': ['Delivered', 'Returned', 'Cancelled'],
  'Delivered': ['Returned'],
  'Cancelled': [],
  'Returned': []
};

var MESSAGE_TYPES = {
  ORDER_RECEIVED: 'order_received', ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PACKED: 'order_packed', ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered', ORDER_CANCELLED: 'order_cancelled',
  ORDER_RETURNED: 'order_returned', LOW_STOCK_ALERT: 'low_stock_alert',
  PAYMENT_RECEIVED: 'payment_received'
};

var WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
var WHATSAPP_PHONE_ID = PropertiesService.getScriptProperties().getProperty('WHATSAPP_PHONE_ID') || '';
var WHATSAPP_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('WHATSAPP_ACCESS_TOKEN') || '';

var STORE_NAME = 'Rehab Store';
var CURRENCY = 'SAR';
var VAT_RATE = 0.15;
var DEFAULT_SHIPPING_FEE = 25;
var FREE_SHIPPING_THRESHOLD = 500;
var ESTIMATED_DELIVERY_DAYS = 3;

var COURIER = {
  NAME: 'SMSA',
  TRACKING_URL: 'https://track.smsaexpress.com/?b='
};

var DEFAULTS = {
  ORDER_SOURCE: 'Google_Form',
  CURRENCY: 'SAR',
  STATUS: 'Received',
  LANGUAGE: 'en',
  SHIPPING_FEE: 25,
  VAT_RATE: 0.15
};

var SAUDI_CITIES = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam',
  'Khobar', 'Dhahran', 'Jubail', 'Taif', 'Tabuk',
  'Yanbu', 'Abha', 'Qassim', 'Hail', 'Najran',
  'Al Baha', 'Jazan', 'Al Ahsa', 'Al Kharj',
  'Al Majmaah', 'Al Qatif'
];

var SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
var COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Gray', 'Pink', 'Purple', 'Orange', 'Navy',
  'Beige', 'Brown', 'Maroon', 'Teal'
];

var ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVENTORY_ERROR: 'INVENTORY_ERROR',
  WHATSAPP_ERROR: 'WHATSAPP_ERROR',
  SHEETS_ERROR: 'SHEETS_ERROR',
  DOCS_ERROR: 'DOCS_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN'
};

var LOG_LEVELS = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

var MAX_RETRY_ATTEMPTS = 3;
var RETRY_DELAYS = [1000, 5000, 10000];
var SESSION_TIMEOUT_MINUTES = 60;
