/**
 * Test.gs — In-editor test runner
 *
 * Run from the Apps Script editor (select function, click Run). Cannot
 * run from a Node.js environment. Each test prints results to the
 * execution log (View > Logs).
 *
 * Requires SHEET_ID to be set. Will create a "Test_" sheet prefix is
 * NOT used — tests run against the real sheet. Be careful in production.
 */

function runAllTests() {
  var results = [];
  results.push(testPing());
  results.push(testGetPublicProducts());
  results.push(testGetPublicProduct());
  results.push(testSubmitOrder());
  results.push(testTrackOrder());
  results.push(testAdminStats());

  var passed = results.filter(function (r) { return r.ok; }).length;
  Logger.log('========= TEST RESULTS =========');
  Logger.log('Passed: ' + passed + ' / ' + results.length);
  results.forEach(function (r) {
    Logger.log((r.ok ? 'PASS' : 'FAIL') + ' — ' + r.name + (r.error ? ' :: ' + r.error : ''));
  });
  return results;
}

function testPing() {
  return safeRun_('ping', function () {
    var r = handlePing_();
    assert_(r.ok === true, 'ok should be true');
    assert_(r.message === 'pong', 'message should be pong');
  });
}

function testGetPublicProducts() {
  return safeRun_('getPublicProducts', function () {
    var r = handleGetPublicProducts_({ lang: 'en' });
    assert_(r.ok === true, 'ok should be true');
    assert_(Array.isArray(r.products), 'products should be array');
    Logger.log('Public products: ' + r.count);
  });
}

function testGetPublicProduct() {
  return safeRun_('getPublicProduct', function () {
    var r = handleGetPublicProducts_({ lang: 'en' });
    if (r.products.length === 0) { Logger.log('SKIP — no products in sheet'); return; }
    var sku = r.products[0].sku;
    var single = handleGetPublicProduct_({ sku: sku, lang: 'en' });
    assert_(single.ok === true, 'ok should be true');
    assert_(single.product.sku === sku, 'sku should match');
  });
}

function testSubmitOrder() {
  return safeRun_('submitOrder', function () {
    var list = handleGetPublicProducts_({ lang: 'en' });
    if (list.products.length === 0) { Logger.log('SKIP — no products to test against'); return; }
    var p = list.products[0];
    var params = {
      action: 'submitOrder',
      customer_name: 'Test Customer',
      phone: '+966501234567',
      email: 'test@example.com',
      address: '123 Test Street',
      city: 'Riyadh',
      items: JSON.stringify([{ sku: p.sku, qty: 1 }])
    };
    var fakeEvent = { parameter: params, postData: { contents: '' } };
    var resp = routeAction_(fakeEvent, 'POST');
    var body = JSON.parse(resp.getContent());
    assert_(body.ok === true, 'submit should succeed: ' + JSON.stringify(body));
    Logger.log('Created test order: ' + body.order_id);
  });
}

function testTrackOrder() {
  return safeRun_('trackOrder', function () {
    var orders = handleAdminListOrders_({});
    if (orders.count === 0) { Logger.log('SKIP — no orders yet'); return; }
    var id = orders.orders[0].order_id;
    var tracked = handleTrackOrder_({ order_id: id });
    assert_(tracked.ok === true, 'track should succeed');
    assert_(tracked.order.order_id === id, 'id should match');
  });
}

function testAdminStats() {
  return safeRun_('adminStats (unauth)', function () {
    var resp = routeAction_({ parameter: { action: 'adminStats' } }, 'GET');
    var body = JSON.parse(resp.getContent());
    assert_(body.ok === false && /Unauthorized/i.test(body.error || ''), 'should require auth');
  });
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function safeRun_(name, fn) {
  try {
    fn();
    return { ok: true, name: name };
  } catch (err) {
    Logger.log('FAIL — ' + name + ': ' + err.toString());
    return { ok: false, name: name, error: err.toString() };
  }
}

function assert_(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}
