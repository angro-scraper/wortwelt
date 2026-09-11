import { Capacitor } from '@capacitor/core';
import 'cordova-plugin-purchase';
import { WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID, isCommerceEnabled } from '../config/commerce';

export { WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID };

export type PurchaseOffer = {
  available: boolean;
  owned: boolean;
  price?: string;
  trialDays?: number;
  reason?: string;
};

export type PurchaseResult = {
  state: 'verified' | 'pending' | 'cancelled' | 'unavailable' | 'failed';
  message?: string;
};

export type RestoreResult = { owned: boolean; message?: string };

export interface SubscriptionGateway {
  initialize(): Promise<PurchaseOffer>;
  purchase(): Promise<PurchaseResult>;
  restore(): Promise<RestoreResult>;
}

type PricingPhaseLike = { price?: string; billingPeriod?: string; paymentMode?: string };
type StoreProductLike = {
  pricing?: { price?: string };
  getOffer(): { pricingPhases?: PricingPhaseLike[] } | undefined;
};

function trialDaysFromBillingPeriod(period?: string): number | undefined {
  const match = period && /^P(\d+)(D|W)$/.exec(period);
  return match ? Number(match[1]) * (match[2] === 'W' ? 7 : 1) : undefined;
}

export function purchaseOfferFromProduct(product: StoreProductLike | undefined, owned: boolean, reason?: string): PurchaseOffer {
  const offer = product?.getOffer();
  if (!offer) return { available: false, owned, reason: reason || 'Premium ponuda još nije učitana iz prodavnice.' };

  const phases = offer.pricingPhases ?? [];
  const trial = phases.find((phase) => phase.paymentMode === 'FreeTrial');
  const paid = [...phases].reverse().find((phase) => phase.paymentMode !== 'FreeTrial');
  const price = paid?.price ?? product?.pricing?.price;
  if (!price) return { available: false, owned, reason: 'Premium ponuda još nema potvrđenu cenu.' };

  return { available: true, owned, price, ...(trialDaysFromBillingPeriod(trial?.billingPeriod) ? { trialDays: trialDaysFromBillingPeriod(trial?.billingPeriod) } : {}) };
}

export function createSubscriptionManager(gateway: SubscriptionGateway, setAccess: (active: boolean) => void) {
  return {
    initialize: async () => {
      const offer = await gateway.initialize();
      setAccess(offer.owned);
      return offer;
    },
    purchase: async () => {
      const result = await gateway.purchase();
      if (result.state === 'verified') setAccess(true);
      return result;
    },
    restore: async () => {
      const result = await gateway.restore();
      setAccess(result.owned);
      return result;
    }
  };
}

function webGateway(): SubscriptionGateway {
  const reason = 'Pretplata je dostupna samo u instaliranoj Android ili iOS aplikaciji.';
  return {
    initialize: async () => ({ available: false, owned: false, reason }),
    purchase: async () => ({ state: 'unavailable', message: reason }),
    restore: async () => ({ owned: false, message: reason })
  };
}

function nativeGateway(): SubscriptionGateway {
  const platform = Capacitor.getPlatform() === 'ios' ? CdvPurchase.Platform.APPLE_APPSTORE : CdvPurchase.Platform.GOOGLE_PLAY;
  const store = CdvPurchase.store;
  let registered = false;
  let initialized = false;
  const product = () => store.get(WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID, platform);
  const owns = () => store.owned({ id: WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID, platform });

  const refresh = async () => {
    const previous = store.minTimeBetweenUpdates;
    store.minTimeBetweenUpdates = 0;
    try { await store.update(); } finally { store.minTimeBetweenUpdates = previous; }
  };

  const initialize = async (): Promise<PurchaseOffer> => {
    if (!registered) {
      store.register({ id: WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID, type: CdvPurchase.ProductType.PAID_SUBSCRIPTION, platform });
      store.when().approved((transaction) => transaction.finish());
      registered = true;
    }
    const errors = initialized ? (await refresh(), []) : await store.initialize([platform]);
    initialized = true;
    const error = errors.find((entry) => entry.productId === WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID || entry.platform === platform);
    return purchaseOfferFromProduct(product(), owns(), error?.message);
  };

  return {
    initialize,
    purchase: async () => {
      const offerState = await initialize();
      if (offerState.owned) return { state: 'verified' };
      const offer = product()?.getOffer();
      if (!offer) return { state: 'unavailable', message: offerState.reason };
      const error = await store.order(offer);
      if (error) return { state: error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED ? 'cancelled' : 'failed', message: error.message };
      await refresh();
      return owns() ? { state: 'verified' } : { state: 'pending', message: 'Kupovina čeka potvrdu prodavnice.' };
    },
    restore: async () => {
      await initialize();
      const error = await store.restorePurchases();
      if (error) return { owned: false, message: error.message };
      await refresh();
      return { owned: owns(), message: owns() ? undefined : 'Aktivna pretplata nije pronađena.' };
    }
  };
}

export function createDefaultSubscriptionGateway(): SubscriptionGateway {
  if (!isCommerceEnabled() || typeof CdvPurchase === 'undefined') return webGateway();
  return nativeGateway();
}
