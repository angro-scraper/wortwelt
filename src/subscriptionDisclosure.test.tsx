import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WortWeltApp } from './WortWeltApp';

const mocks = vi.hoisted(() => ({ initialize: vi.fn(), native: false }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => mocks.native } }));
vi.mock('./services/subscriptions', async (original) => ({
  ...await original<typeof import('./services/subscriptions')>(),
  createDefaultSubscriptionGateway: () => ({
    initialize: mocks.initialize,
    purchase: vi.fn(),
    restore: vi.fn()
  })
}));

function openParents() {
  fireEvent.click(screen.getByRole('button', { name: /Für Eltern/i }));
  fireEvent.change(screen.getByLabelText('4 + 3 ='), { target: { value: '7' } });
  fireEvent.click(screen.getByRole('button', { name: 'Elternbereich öffnen' }));
  return screen.getByRole('heading', { name: 'WortWelt Premium' }).closest('section')!;
}

describe('WortWelt obavezne informacije pre pretplate', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    mocks.native = false;
    vi.stubEnv('VITE_COMMERCE_ENABLED', 'true');
  });
  afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

  it('prikazuje oba prava HTTPS linka u Premium kartici, tek iza roditeljske zaštite', () => {
    render(<WortWeltApp />);
    expect(screen.queryByRole('link', { name: 'Nutzungsbedingungen (EULA)' })).not.toBeInTheDocument();
    const card = within(openParents());
    for (const [name, href] of [
      ['Datenschutzerklärung', 'https://wortwelt.onrender.com/privacy'],
      ['Nutzungsbedingungen (EULA)', 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/']
    ]) {
      const link = card.getByRole('link', { name });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(card.getByText(/verlängert sich automatisch/i)).toBeVisible();
  });

  it.each([false, true])('pravni linkovi ostaju dostupni i kada Premium owned=%s', async (owned) => {
    mocks.native = true;
    mocks.initialize.mockResolvedValue({ available: false, owned });
    render(<WortWeltApp />);
    const card = within(openParents());
    await screen.findByText('Premium-Angebot ist bereit.');
    expect(card.getByRole('link', { name: 'Datenschutzerklärung' })).toBeVisible();
    expect(card.getByRole('link', { name: 'Nutzungsbedingungen (EULA)' })).toBeVisible();
  });

  it('prikazuje lokalizovanu cenu i probni period prodavnice pre kupovine', async () => {
    mocks.native = true;
    mocks.initialize.mockResolvedValue({ available: true, owned: false, price: '$4.99', trialDays: 7 });
    render(<WortWeltApp />);
    const card = within(openParents());
    expect(await card.findByText('7 Tage kostenlos, danach $4.99 pro Monat.')).toBeVisible();
    expect(card.getByRole('button', { name: 'Premium starten' })).toBeEnabled();
    expect(card.queryByText(/3,99 €/)).not.toBeInTheDocument();
  });

  it('ne obećava besplatnu probu korisniku kome je prodavnica ne ponudi', async () => {
    mocks.native = true;
    mocks.initialize.mockResolvedValue({ available: true, owned: false, price: '3,99 €' });
    render(<WortWeltApp />);
    const card = within(openParents());
    expect(await card.findByText('3,99 € pro Monat.')).toBeVisible();
    expect(card.queryByText(/Tage kostenlos/)).not.toBeInTheDocument();
  });
});
