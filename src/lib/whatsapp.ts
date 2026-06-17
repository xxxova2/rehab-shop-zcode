// WhatsApp order helper. Builds a pre-filled order message in either English or
// Arabic and returns a wa.me link for the admin's phone. Per project taste, the
// admin is reached via WhatsApp instead of a customer signup/account flow.

export const ADMIN_WHATSAPP_E164 = '+201555121132';
export const ADMIN_WHATSAPP_DIGITS = '201555121132';

const FX: Record<string, number> = { SAR: 1, AED: 0.98, EGP: 13.39 };

export type WhatsAppCustomer = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};

export type WhatsAppCartItem = {
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

export function buildWhatsappOrderMessage(items: WhatsAppCartItem[], customer: WhatsAppCustomer, locale: string = 'en'): string {
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const totalAED = total * (FX['AED'] || 1);
  const totalEGP = total * (FX['EGP'] || 1);

  const lines: string[] = [];
  if (locale === 'ar') {
    lines.push('\u0637\u0644\u0628 \u062c\u062f\u064a\u062f \u0645\u0646 \u0645\u062a\u062c\u0631 \u0631\u064a\u0647\u0627\u0628');
    lines.push('--------------------------');
    lines.push('\u0627\u0644\u0639\u0645\u064a\u0644:');
    lines.push('\u0627\u0644\u0627\u0633\u0645: ' + customer.name);
    lines.push('\u0627\u0644\u062c\u0648\u0627\u0644: ' + customer.phone);
    lines.push('\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ' + customer.address);
    lines.push('\u0627\u0644\u0645\u062f\u064a\u0646\u0629: ' + customer.city);
    if (customer.notes) lines.push('\u0645\u0644\u0627\u062d\u0638\u0627\u062a: ' + customer.notes);
    lines.push('');
    lines.push('\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a:');
    items.forEach((i, idx) => {
      const sizeColor = [i.size, i.color].filter(Boolean).join(' / ');
      const line = (idx + 1) + '. ' + i.name + (sizeColor ? ' (' + sizeColor + ')' : '') + ' x ' + i.quantity + ' = ' + (i.price * i.quantity).toFixed(2) + ' \u0631.\u0633';
      lines.push(line);
    });
    lines.push('');
    lines.push('\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064a: ' + subtotal.toFixed(2) + ' \u0631.\u0633');
    lines.push('\u0627\u0644\u0634\u062d\u0646: ' + (shipping === 0 ? '\u0645\u062c\u0627\u0646\u064a' : shipping.toFixed(2) + ' \u0631.\u0633'));
    lines.push('\u0627\u0644\u0636\u0631\u064a\u0628\u0629 8%: ' + tax.toFixed(2) + ' \u0631.\u0633');
    lines.push('\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a: ' + total.toFixed(2) + ' \u0631.\u0633');
    lines.push('');
    lines.push('\u0628\u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0627\u0644\u0623\u062e\u0631\u0649:');
    lines.push('\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a: ' + totalAED.toFixed(2) + ' \u062f.\u0625 \u00b7 ' + totalEGP.toFixed(2) + ' \u062c.\u0645');
  } else {
    lines.push('New order from Rehab Shop');
    lines.push('--------------------------');
    lines.push('Customer:');
    lines.push('Name: ' + customer.name);
    lines.push('Phone: ' + customer.phone);
    lines.push('Address: ' + customer.address);
    lines.push('City: ' + customer.city);
    if (customer.notes) lines.push('Notes: ' + customer.notes);
    lines.push('');
    lines.push('Items:');
    items.forEach((i, idx) => {
      const sizeColor = [i.size, i.color].filter(Boolean).join(' / ');
      const line = (idx + 1) + '. ' + i.name + (sizeColor ? ' (' + sizeColor + ')' : '') + ' x ' + i.quantity + ' = ' + (i.price * i.quantity).toFixed(2) + ' SAR';
      lines.push(line);
    });
    lines.push('');
    lines.push('Subtotal: ' + subtotal.toFixed(2) + ' SAR');
    lines.push('Shipping: ' + (shipping === 0 ? 'Free' : shipping.toFixed(2) + ' SAR'));
    lines.push('Tax 8%: ' + tax.toFixed(2) + ' SAR');
    lines.push('Total: ' + total.toFixed(2) + ' SAR');
    lines.push('');
    lines.push('In other currencies:');
    lines.push('Total: ' + totalAED.toFixed(2) + ' AED \u00b7 ' + totalEGP.toFixed(2) + ' EGP');
  }
  return lines.join('\n');
}

export function buildWhatsappOrderLink(message: string): string {
  return 'https://wa.me/' + ADMIN_WHATSAPP_DIGITS + '?text=' + encodeURIComponent(message);
}
