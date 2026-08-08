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

    expect(screen.getByRole('status')).toHaveTextContent('Bravo');
    expect(screen.getByText('⭐ 1')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Buchstabe B b' })).toBeVisible();
    expect(screen.getAllByText(/Als Nächstes: B/)).toHaveLength(2);
  });

  it('pisanje daje jasnu Bravo potvrdu i nastavlja sa sledećim slovom i kada detetu treba pomoć', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /SchreibenMit dem Finger/i }));

    const canvas = screen.getByLabelText('Schreibfläche für den Buchstaben A');
    fireEvent.pointerDown(canvas, { clientX: 30, clientY: 30, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 30, clientY: 30, pointerId: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Fertig! Weiter mit B/i }));

    expect(screen.getByRole('heading', { name: 'Schreibe B' })).toBeVisible();
    expect(screen.getAllByRole('status').some((status) => status.textContent?.includes('Bravo! A ist geschafft. Als Nächstes: B.'))).toBe(true);
    expect(screen.getByText('⭐ 1')).toBeVisible();
  });

  it('zadržava isti tok nagrade i sledećeg koraka za brojanje i bojanku', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Zählen bis 100/i }));
    fireEvent.click(screen.getAllByRole('button', { name: '0' })[1]);
    expect(screen.getByRole('status')).toHaveTextContent('Bravo');
    expect(screen.getByText('⭐ 1')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Malwelt/i }));
    fireEvent.click(screen.getByRole('button', { name: /Bild speichern/i }));
    expect(screen.getByText(/Bravo! Dein Bild ist gespeichert. Als Nächstes: B/)).toBeVisible();
  });

  it('omogućava nemačko brojanje, priču i roditeljsku zaštitu', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Zählen/i }));
    expect(screen.getByRole('heading', { name: 'Zählen bis 100' })).toBeVisible();
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

  it('otvara nemačke ekvivalente za dnevni izazov, bojanku, kviz i kreativnu priču', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Tägliche Herausforderung/i }));
    expect(screen.getByText('Buchstaben-Stern')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Malwelt/i }));
    expect(screen.getByLabelText(/Malfläche für A/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Quiz/i }));
    expect(screen.getByRole('heading', { name: 'Was siehst du?' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Abenteuer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ideenwerkstatt/i }));
    expect(screen.getByRole('heading', { name: 'Meine Geschichte' })).toBeVisible();
  });

  it('ima bezbedno dostupne avanturističke module za govor, porodicu, logiku i kulturu', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Abenteuer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sprechwerkstatt/i }));
    expect(screen.getByText(/lokale Sprechübung/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Familien-Missionen/i }));
    expect(screen.getByText('Küchen-Zählen')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Denk-Labor/i }));
    expect(screen.getByText('2 + 3 = ?')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Entdeckerland/i }));
    expect(screen.getByText('Ein Wort aus Deutschland')).toBeVisible();
  });

  it('drži preostale glavne Slovolov tokove dostupnim iz WortWelt početne strane', () => {
    render(<WortWeltApp />);
    fireEvent.click(screen.getByRole('button', { name: /Meine nächste Lektion/i }));
    expect(screen.getByRole('heading', { name: 'Meine nächste Lektion' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /SchreibenMit dem Finger/i }));
    expect(screen.getByRole('heading', { name: 'Schreibe A' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /SpieleHören, Memory/i }));
    expect(screen.getByRole('heading', { name: 'Spiele' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Memory/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: /Mein FortschrittSterne/i }));
    expect(screen.getByRole('heading', { name: 'Mein Fortschritt' })).toBeVisible();
  });
});
