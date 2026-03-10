import crypto from 'crypto';

const zoneByPostalCode = (postalCode) => {
  const code = String(postalCode || '').trim();
  if (!code) return 'Zone-C';

  if (code.startsWith('11') || code.startsWith('12') || code.startsWith('40')) return 'Zone-A';
  if (code.startsWith('56') || code.startsWith('60') || code.startsWith('70')) return 'Zone-B';
  return 'Zone-C';
};

export const calculateShipping = ({ postalCode, itemsPrice }) => {
  const zone = zoneByPostalCode(postalCode);

  const base = zone === 'Zone-A' ? 39 : zone === 'Zone-B' ? 59 : 79;
  const freeShippingThreshold = 699;
  const price = itemsPrice >= freeShippingThreshold ? 0 : base;

  return {
    zone,
    shippingPrice: price,
    courierProvider: process.env.SHIPROCKET_ENABLED === 'true' ? 'Shiprocket' : 'ERLB Logistics',
    etaDays: zone === 'Zone-A' ? '2-3' : zone === 'Zone-B' ? '3-5' : '4-7'
  };
};

export const generateTracking = () => {
  const trackingId = `ERLB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  return {
    trackingId,
    trackingUrl: `https://tracking.erlb.in/${trackingId}`
  };
};
