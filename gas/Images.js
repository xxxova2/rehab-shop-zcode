/**
 * Images.gs — Image upload + Drive helpers
 *
 * Base64 -> Drive -> public URL. Configured via Script Properties:
 *   DRIVE_IMAGES_FOLDER_ID — folder for product images (preferred)
 *   DRIVE_DOCUMENTS_FOLDER_ID — fallback if no image folder set
 */

function uploadBase64Image(base64, filename, mime) {
  if (!base64) throw new Error('image_base64 required');
  mime = mime || 'image/jpeg';
  filename = filename || ('product-' + Date.now() + '.jpg');

  var bytes = Utilities.base64Decode(stripDataUri_(base64));
  var blob = Utilities.newBlob(bytes, mime, filename);

  var props = PropertiesService.getScriptProperties();
  var folderId = props.getProperty('DRIVE_IMAGES_FOLDER_ID')
    || props.getProperty('DRIVE_DOCUMENTS_FOLDER_ID');
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    file_id: file.getId(),
    url: 'https://drive.google.com/uc?export=view&id=' + file.getId(),
    thumbnail_url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w800',
    name: filename,
    size: bytes.length
  };
}

function stripDataUri_(s) {
  s = String(s || '').trim();
  var m = s.match(/^data:[\w\/\-\.]+;base64,(.+)$/);
  return m ? m[1] : s;
}
