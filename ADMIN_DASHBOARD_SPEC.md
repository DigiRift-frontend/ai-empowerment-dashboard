# Admin Dashboard - Spezifikation

## Übersicht: Kunden-Dashboard Features

### 1. Dashboard (Startseite)
- Willkommensnachricht mit Firmenname
- Paket-Modul (klickbar für Details)
  - Paketname (S/M/L)
  - Monatliche Punkte
  - Verfügbare Punkte
  - Nächster Einzug
  - Vertragsdaten
  - Kosten
  - Übertragene Punkte mit Verfallswarnung
- Offene Aktionen (Akzeptanzkriterien bestätigen, Tests durchführen)
- Aktuelle Ziele aus der Roadmap
- Aktive KI-Module
- Schulungsübersicht

### 2. Punkteübersicht
- Budget-Karten (Monatlich, Verbraucht, Verfügbar, Wartung)
- Verbrauch nach Kategorie (Entwicklung, Wartung, Schulung, Beratung, Analyse & PM)
- Monatliche Wartungskosten pro Modul
- Transaktionshistorie mit Filter (Monat, Kategorie)
- 6-Monats-Verlauf (Chart)
- Übertragene Punkte Info
- Paket-Info

### 3. Roadmap
- Kanban-Board (Geplant → In Arbeit → Im Test → Abgeschlossen)
- Projektdetails mit Beschreibung
- Akzeptanzkriterien (vom Kunden zu bestätigen)
- Test-Feedback (vom Kunden einzugeben)
- Fortschrittsanzeige
- Zugewiesene Person
- Timeline-Ansicht

### 4. Module
- Modulübersicht mit Status (Setup, Live, Optimierung)
- Moduldetails (Beschreibung, Wartungspunkte, Software-URL)
- Verantwortlicher zuweisen
- Änderungshistorie

### 5. Schulungen
- Schulungskatalog (10 Kategorien, 50+ Themen)
- Lernpfade
- Individuelle Schulungsanfrage

### 6. Team
- Teammitglieder-Übersicht
- Projektzuordnungen

### 7. Benachrichtigungen (Header)
- Akzeptanz erforderlich
- Test erforderlich
- Nachrichten vom Admin
- Projekt-Updates

### 8. Sidebar
- Ansprechpartner mit Kontaktdaten
- Kunden-PIN für Anrufe

---

## Admin Dashboard - Funktionen

### 1. Kundenverwaltung
- [ ] Kundenliste mit Suche und Filter
- [ ] Neuen Kunden anlegen
  - Name, Firmenname, E-Mail
  - Paket zuweisen (S/M/L)
  - Vertragsbeginn festlegen
  - Monatlicher Beitrag
  - Monatliche Punkte
- [ ] Kunden bearbeiten
- [ ] Zugangsdaten generieren (E-Mail/Passwort)
- [ ] Kunden-PIN generieren
- [ ] Ansprechpartner zuweisen

### 2. Punkte verwalten
- [ ] Punkte buchen für Kunde
  - Beschreibung
  - Punkte (Anzahl)
  - Kategorie (Entwicklung, Wartung, Schulung, Beratung, Analyse)
  - Datum (optional, sonst heute)
  - Modul zuordnen (optional)
- [ ] Buchungshistorie einsehen
- [ ] Übertragene Punkte verwalten
- [ ] Punkte-Statistiken pro Kunde

### 3. Projekte / Roadmap (Kanban)
- [ ] Kanban-Board mit Drag & Drop
  - Geplant
  - In Arbeit
  - Im Test
  - Abgeschlossen
- [ ] Neues Projekt anlegen
  - Titel, Beschreibung
  - Priorität (Hoch, Mittel, Niedrig)
  - Zieldatum
  - Verantwortlicher
- [ ] Akzeptanzkriterien definieren
- [ ] Akzeptanzkriterien-Status einsehen (bestätigt/ausstehend)
- [ ] Projekt in nächste Phase schieben
- [ ] Test-Feedback vom Kunden einsehen
- [ ] Fortschritt aktualisieren

### 4. Module verwalten
- [ ] Modulliste pro Kunde
- [ ] Neues Modul anlegen
  - Name, Beschreibung
  - Status (Setup, Live, Optimierung)
  - Monatliche Wartungspunkte
  - Software-URL (optional)
  - Verantwortlicher
- [ ] Modul bearbeiten
- [ ] Status ändern
- [ ] Historie eintragen

### 5. Nachrichten & Benachrichtigungen
- [ ] Nachricht an Kunden senden
  - Betreff, Inhalt
  - Aktion erforderlich (Ja/Nein)
- [ ] Benachrichtigungen erstellen
  - Typ (Nachricht, Projekt-Update, Budget-Warnung)
  - Automatische Benachrichtigungen bei:
    - Projekt in Test-Phase → "Test erforderlich"
    - Akzeptanzkriterien definiert → "Bestätigung erforderlich"
- [ ] Nachrichtenverlauf einsehen

### 6. Schulungen
- [ ] Schulung planen
  - Titel, Datum, Dauer
  - Teilnehmeranzahl
  - Punkte
- [ ] Schulung als abgeschlossen markieren
- [ ] Schulungsanfragen vom Kunden einsehen

### 7. Team verwalten
- [ ] Teammitglieder anlegen
  - Name, Rolle, Abteilung
- [ ] Teammitglieder zu Projekten/Modulen zuweisen

---

## Admin Dashboard - Navigation

```
/admin
├── /admin                    → Dashboard/Übersicht
├── /admin/customers          → Kundenliste
├── /admin/customers/[id]     → Kundendetails & Bearbeitung
├── /admin/customers/[id]/points    → Punkte buchen
├── /admin/customers/[id]/roadmap   → Kanban für diesen Kunden
├── /admin/customers/[id]/modules   → Module für diesen Kunden
├── /admin/customers/[id]/messages  → Nachrichten an Kunden
├── /admin/team               → Teammitglieder verwalten
└── /admin/settings           → Admin-Einstellungen
```

---

## Technische Umsetzung

### Datenmodell-Erweiterungen
- Admin-User mit Berechtigungen
- Mehrere Kunden unterstützen
- Nachrichten-Tabelle

### UI-Komponenten
- Drag & Drop Kanban Board
- Datepicker für Punktebuchung
- Modal für Nachrichten
- Tabellen mit Suche/Filter/Sortierung

### Mock-Daten
- Mehrere Beispielkunden
- Verschiedene Pakete (S, M, L)
- Unterschiedliche Projektstände
