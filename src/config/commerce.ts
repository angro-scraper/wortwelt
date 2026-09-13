import { Capacitor } from '@capacitor/core';

export const WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID = 'de.wortwelt.app.premium.monthly';
export const WORTWELT_PREMIUM_TRIAL_DAYS = 7;
export const WORTWELT_PREMIUM_PRICE = '3,99 €';
export const WORTWELT_PRIVACY_URL = 'https://wortwelt.onrender.com/privacy';
export const WORTWELT_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export function isCommerceEnabled(): boolean {
  return Capacitor.isNativePlatform() && import.meta.env.VITE_COMMERCE_ENABLED === 'true';
}
