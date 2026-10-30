export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPhone = (phone) => {
  // Convert to WhatsApp format
  let cleaned = phone.replace(/[\s\-\+]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '254' + cleaned.slice(1);
  }
  return cleaned;
};

export const generateWhatsAppLink = (phone, message = '') => {
  const cleanPhone = formatPhone(phone);
  const base = `https://wa.me/${cleanPhone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};