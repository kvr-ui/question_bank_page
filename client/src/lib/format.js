const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const rupees = (paise) => inr.format((paise || 0) / 100);
export const dateTime = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export const CONTACT = {
  phoneDisplay: '+91 6383-514285',
  phone: '916383514285',
  website: 'https://focasedu.com/',
  instagram: 'https://instagram.com/focasedu',
};

export const EXEC_MESSAGE = [
  'One of our executives will reach out to you shortly with the pricing details.',
  'They will be able to assist you with what product suits your needs the best.',
  'Let me know if you have any other questions about what we offer.',
];
