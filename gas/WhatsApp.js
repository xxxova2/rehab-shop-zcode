/**
 * WhatsApp.gs — WhatsApp Business Cloud API integration
 *
 * Ported from clothing-store-backend. Sends template messages for order
 * status updates. Uses Meta WhatsApp Business Cloud API v18.0.
 *
 * Required Script Properties:
 *   WHATSAPP_PHONE_ID, WHATSAPP_ACCESS_TOKEN
 *
 * Templates must be pre-approved in Meta Business Manager. Edit the
 * templates object below to match the exact template names you have
 * approved (English + Arabic).
 */

function sendWhatsAppMessage(phone, templateName, languageCode, parameters) {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_ACCESS_TOKEN) {
    logError('whatsapp', ERROR_CODES.WHATSAPP_ERROR, 'WhatsApp credentials not set', {});
    return { success: false, error: 'WhatsApp not configured' };
  }
  if (!phone || !templateName) return { success: false, error: 'phone and templateName required' };

  var url = WHATSAPP_API_URL + '/' + WHATSAPP_PHONE_ID + '/messages';
  var components = [];
  if (parameters && parameters.length) {
    components.push({
      type: 'body',
      parameters: parameters.map(function (p) { return { type: 'text', text: String(p) }; })
    });
  }
  var payload = {
    messaging_product: 'whatsapp',
    to: String(phone).replace(/[^\d+]/g, ''),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode || 'en' },
      components: components
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: { Authorization: 'Bearer ' + WHATSAPP_ACCESS_TOKEN },
      muteHttpExceptions: true
    });
    var result = JSON.parse(response.getContentText());
    var success = response.getResponseCode() === 200 && !result.error;
    logWhatsAppMessage({
      order_id: '',
      phone: phone,
      message_type: templateName,
      template_name: templateName,
      language: languageCode || 'en',
      status: success ? 'sent' : 'failed',
      whatsapp_message_id: (result.messages && result.messages[0] && result.messages[0].id) || '',
      response: JSON.stringify(result),
      error_code: result.error ? String(result.error.code || '') : '',
      retry_count: 0
    });
    return success ? { success: true, id: result.messages[0].id } : { success: false, error: result.error };
  } catch (err) {
    logError('whatsapp', ERROR_CODES.WHATSAPP_ERROR, err.toString(), { phone: phone, template: templateName });
    return { success: false, error: err.toString() };
  }
}

function sendOrderReceivedNotification(order) {
  var template = isArabicPhone_(order.phone) ? 'order_received_ar' : 'order_received_en';
  return sendWhatsAppMessage(order.phone, template, isArabicPhone_(order.phone) ? 'ar' : 'en', [
    order.customer_name, order.order_id, String(order.total) + ' ' + CURRENCY
  ]);
}

function sendStatusNotification(order, newStatus) {
  var lang = isArabicPhone_(order.phone) ? 'ar' : 'en';
  var template = lang === 'ar' ? ('order_' + newStatus.toLowerCase() + '_ar') : ('order_' + newStatus.toLowerCase() + '_en');
  return sendWhatsAppMessage(order.phone, template, lang, [order.customer_name, order.order_id]);
}

function isArabicPhone_(phone) {
  return String(phone || '').indexOf('+966') === 0;
}
