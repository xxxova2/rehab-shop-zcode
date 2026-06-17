/**
 * Orders.gs — Order domain logic
 *
 * Re-exports order operations. See Utilities.gs for the real work.
 */

function listOrders(filter) {
  filter = filter || {};
  var rows = getSheetData(SHEET_NAMES.ORDERS);
  rows.forEach(function (o) { try { o.items = JSON.parse(o.items); } catch (e) { o.items = []; } });
  if (filter.status) rows = rows.filter(function (o) { return o.status === filter.status; });
  if (filter.q) {
    var q = String(filter.q).toLowerCase();
    rows = rows.filter(function (o) {
      return String(o.order_id || '').toLowerCase().indexOf(q) !== -1
        || String(o.customer_name || '').toLowerCase().indexOf(q) !== -1
        || String(o.phone || '').indexOf(q) !== -1;
    });
  }
  if (filter.from) {
    var fromTs = new Date(filter.from).getTime();
    rows = rows.filter(function (o) { return new Date(o.created_at).getTime() >= fromTs; });
  }
  if (filter.to) {
    var toTs = new Date(filter.to).getTime();
    rows = rows.filter(function (o) { return new Date(o.created_at).getTime() <= toTs; });
  }
  return rows.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function placeOrder(data) {
  var validation = validateOrderData(data);
  if (!validation.isValid) throw new Error('Validation: ' + validation.errors.join('; '));
  var enriched = enrichOrderData(data);
  var stock = validateStockAvailability(enriched.items);
  if (!stock.isValid) throw new Error('Stock: ' + stock.errors.join('; '));
  decrementInventory(enriched.items);
  var order = createOrder(enriched);
  updateCustomer(order);
  try { generateOrderDocuments(order); } catch (e) { logError('orders', ERROR_CODES.DOCS_ERROR, e.toString(), { order_id: order.order_id }); }
  try { sendOrderReceivedNotification(order); } catch (e) { logError('orders', ERROR_CODES.WHATSAPP_ERROR, e.toString(), { order_id: order.order_id }); }
  return order;
}

function changeOrderStatus(orderId, newStatus, updatedBy) {
  return updateOrderStatus(orderId, newStatus, updatedBy || 'admin');
}

function findOrder(orderId) { return getOrderById(orderId); }

function cancelOrder(orderId, reason) {
  var order = getOrderById(orderId);
  if (!order) return { success: false, error: 'Order not found' };
  if (!isValidStatusTransition(order.status, 'Cancelled')) {
    return { success: false, error: 'Cannot cancel from ' + order.status };
  }
  incrementInventory(order.items);
  return updateOrderStatus(orderId, 'Cancelled', 'admin');
}

function orderStats() {
  var orders = getSheetData(SHEET_NAMES.ORDERS);
  var byStatus = {};
  var revenue = 0;
  var orderCount = 0;
  orders.forEach(function (o) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status !== 'Cancelled' && o.status !== 'Returned') {
      revenue += parseFloat(o.total) || 0;
      orderCount++;
    }
  });
  return {
    total_orders: orders.length,
    completed_orders: orderCount,
    revenue: round2_(revenue),
    by_status: byStatus
  };
}
