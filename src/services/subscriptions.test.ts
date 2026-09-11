import { describe, expect, it, vi } from 'vitest';
import {
  WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID,
  createSubscriptionManager,
  purchaseOfferFromProduct,
  type SubscriptionGateway
} from './subscriptions';

function gateway(overrides: Partial<SubscriptionGateway> = {}): SubscriptionGateway {
  return {
    initialize: vi.fn().mockResolvedValue({ available: true, owned: false, price: '3,99 €', trialDays: 7 }),
    purchase: vi.fn().mockResolvedValue({ state: 'cancelled' }),
    restore: vi.fn().mockResolvedValue({ owned: false }),
    ...overrides
  };
}

describe('WortWelt Premium pretplata', () => {
  it('koristi odvojen stabilan identifikator za mesečnu pretplatu', () => {
    expect(WORTWELT_PREMIUM_MONTHLY_PRODUCT_ID).toBe('de.wortwelt.app.premium.monthly');
  });

  it('prikazuje samo cenu i probni period koje prodavnica stvarno vrati', () => {
    expect(purchaseOfferFromProduct({
      getOffer: () => ({
        pricingPhases: [
          { price: '0,00 €', billingPeriod: 'P1W', paymentMode: 'FreeTrial' },
          { price: '3,99 €', billingPeriod: 'P1M', paymentMode: 'PayAsYouGo' }
        ]
      })
    }, false)).toEqual({ available: true, owned: false, price: '3,99 €', trialDays: 7 });
  });

  it('ne otključava premium sadržaj za otkazanu ili nepotvrđenu kupovinu', async () => {
    const syncAccess = vi.fn();
    const manager = createSubscriptionManager(gateway(), syncAccess);

    await manager.purchase();
    expect(syncAccess).not.toHaveBeenCalled();

    await createSubscriptionManager(gateway({ purchase: vi.fn().mockResolvedValue({ state: 'pending' }) }), syncAccess).purchase();
    expect(syncAccess).not.toHaveBeenCalled();
  });

  it('sinhronizuje entitlement pri pokretanju, kupovini i vraćanju', async () => {
    const syncAccess = vi.fn();
    const manager = createSubscriptionManager(gateway({
      initialize: vi.fn().mockResolvedValue({ available: true, owned: false }),
      purchase: vi.fn().mockResolvedValue({ state: 'verified' }),
      restore: vi.fn().mockResolvedValue({ owned: true })
    }), syncAccess);

    await manager.initialize();
    await manager.purchase();
    await manager.restore();

    expect(syncAccess.mock.calls).toEqual([[false], [true], [true]]);
  });
});
