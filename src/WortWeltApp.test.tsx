import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WortWeltApp } from './WortWeltApp';

describe('WortWelt početni tok', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('otvara nemačku abecedu i nemačko slovo sa tri reči', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Buchstaben lernen/i }));
    fireEvent.click(screen.getByRole('button', { name: 'A a' }));

    expect(screen.getByRole('heading', { name: 'Buchstabe A a' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Bild auswählen: Affe' })).toBeVisible();
    expect(screen.getByText('Apfel')).toBeVisible();
    expect(screen.queryByText('Avion')).not.toBeInTheDocument();
  });

  it('tačan odgovor dodeljuje zvezdicu i prelazi na sledeće slovo', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Buchstaben lernen/i }));
    fireEvent.click(screen.getByRole('button', { name: 'A a' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bild auswählen: Affe' }));

    expect(screen.getByRole('status')).toHaveTextContent('Prima');
    expect(screen.getByText('⭐ 1')).toBeVisible();
  });

  it('omogućava nemačko brojanje, priču i roditeljsku zaštitu', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Zählen/i }));
    expect(screen.getByRole('heading', { name: 'Zählen' })).toBeVisible();
    expect(screen.getByText(/Wie viele leer/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Lesen & Geschichten/i }));
    expect(screen.getByRole('heading', { name: 'Mila und der Mond' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Für Eltern/i }));
    expect(screen.getByText('Nur für Erwachsene')).toBeVisible();
    fireEvent.change(screen.getByLabelText('4 + 3 ='), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: /Elternbereich öffnen/i }));
    expect(screen.getByText('Datenschutz zuerst')).toBeVisible();
  });
});
