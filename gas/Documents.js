/**
 * Documents.gs — Invoice + packing slip generation
 *
 * Ported from clothing-store-backend. Creates a Google Doc from a
 * template, replaces placeholders, exports to PDF, saves to Drive,
 * and writes the link back to the Orders sheet.
 *
 * Required Script Properties:
 *   INVOICE_TEMPLATE_ID, PACKING_SLIP_TEMPLATE_ID, DRIVE_DOCUMENTS_FOLDER_ID
 */

function generateOrderDocuments(order) {
  try {
    var invoiceLink = generateInvoice(order);
    var slipLink = generatePackingSlip(order);
    var row = findRowByColumn(SHEET_NAMES.ORDERS, 'order_id', order.order_id);
    if (row > 0) {
      updateSheetRow(SHEET_NAMES.ORDERS, row, {
        invoice_doc_link: invoiceLink || '',
        packing_slip_link: slipLink || ''
      });
    }
  } catch (err) {
    logError('documents', ERROR_CODES.DOCS_ERROR, err.toString(), { order_id: order.order_id });
  }
}

function generateInvoice(order) {
  var templateId = PropertiesService.getScriptProperties().getProperty('INVOICE_TEMPLATE_ID');
  if (!templateId) return '';
  return generateFromTemplate_(templateId, order, 'Invoice ' + order.order_id);
}

function generatePackingSlip(order) {
  var templateId = PropertiesService.getScriptProperties().getProperty('PACKING_SLIP_TEMPLATE_ID');
  if (!templateId) return '';
  return generateFromTemplate_(templateId, order, 'Packing Slip ' + order.order_id);
}

function generateFromTemplate_(templateId, order, fileName) {
  var template = DriveApp.getFileById(templateId);
  var folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_DOCUMENTS_FOLDER_ID');
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var copy = template.makeCopy(fileName, folder);
  var doc = DocumentApp.openById(copy.getId());
  var body = doc.getBody();
  var items = order.items;
  if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { items = []; } }
  var itemsText = (items || []).map(function (i) {
    return (i.product_name || i.sku) + ' x ' + (i.qty || 1) + ' = ' + (i.price * i.qty).toFixed(2) + ' ' + CURRENCY;
  }).join('\n');

  body.replaceText('\\{order_id\\}', order.order_id);
  body.replaceText('\\{customer_name\\}', order.customer_name);
  body.replaceText('\\{phone\\}', order.phone);
  body.replaceText('\\{address\\}', order.address || '');
  body.replaceText('\\{city\\}', order.city || '');
  body.replaceText('\\{date\\}', formatDate_(new Date(order.created_at || new Date()), 'YYYY-MM-DD'));
  body.replaceText('\\{items\\}', itemsText);
  body.replaceText('\\{subtotal\\}', String(order.subtotal || 0) + ' ' + CURRENCY);
  body.replaceText('\\{shipping\\}', String(order.shipping || 0) + ' ' + CURRENCY);
  body.replaceText('\\{vat\\}', String(order.vat_amount || 0) + ' ' + CURRENCY);
  body.replaceText('\\{total\\}', String(order.total || 0) + ' ' + CURRENCY);
  body.replaceText('\\{status\\}', order.status || '');

  doc.saveAndClose();
  var pdf = copy.getAs('application/pdf');
  var pdfFile = folder.createFile(pdf).setName(fileName + '.pdf');
  return pdfFile.getUrl();
}
