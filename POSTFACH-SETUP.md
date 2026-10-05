# Anfragen-Postfach einrichten (kostenlos, über das eigene Google-Konto)

Das Kontaktformular kann Anfragen ohne E-Mail-Programm direkt in eine
Google-Tabelle schreiben und zusätzlich eine Benachrichtigungs-Mail an
Lukas senden. Alles läuft im eigenen Google-Konto des Betreibers — kostenlos,
keine Formular-Drittanbieter (Airtable & Co.), keine API-Keys im
Seitenquelltext. Besucher sehen nur die Web-App-URL des Scripts.

## 1. Google-Tabelle anlegen

- `sheets.new` im Browser öffnen (mit dem Google-Konto des Betreibers).
- Tabelle benennen, z. B. „L4U Anfragen“.

## 2. Apps Script einrichten

- In der Tabelle: **Erweiterungen → Apps Script**.
- Inhalt von `apps-script/Code.gs` einfügen (alten Editor-Inhalt ersetzen).
- Oben `NOTIFY_EMAIL` prüfen — dort landet die Benachrichtigungsmail.
- Speichern (Strg+S).

## 3. Als Web-App bereitstellen

- **Bereitstellen → Neue Bereitstellung → Zahnrad → Web-App**
  - Beschreibung: `L4U Kontaktformular`
  - „Ausführen als“: **Ich**
  - „Wer hat Zugriff“: **Alle** — nötig, damit Besucher ohne Google-Konto senden können
- **Bereitstellen** klicken, Zugriff einmalig bestätigen (Hinweis
  „Nicht überprüft“ → **Erweitert** → zu L4U Anfragen gehen → Zulassen).
- Die **Web-App-URL** (`https://script.google.com/macros/s/…/exec`) kopieren.

## 4. URL in die Seite eintragen

- In `_data/data.yaml` im Abschnitt `form:` bei `inbox_url:` die URL in
  Anführungszeichen eintragen, Commit + Push → GitHub Pages baut neu.
- `inbox_url: ""` (leer) schaltet wieder auf den bisherigen mailto-Ablauf
  zurück — die Seite funktioniert also jederzeit.

## Hinweise

- **Kostenlos:** normales Google-Konto genügt; ~100 Benachrichtigungsmails/Tag
  (MailApp-Kontingent), Tabellenzeilen praktisch unbegrenzt.
- **Änderungen an `Code.gs`** werden erst wirksam nach
  **Bereitstellen → Bereitstellungen → Stift → Neue Version → Bereitstellen**.
- **Spam-Schutz:** das Formular enthält ein per CSS unsichtbares Feld
  („Firma“). Bots, die es ausfüllen, landen nicht in der Tabelle.
- **Test:** Formular einmal wirklich ausfüllen und absenden — die Zeile muss
  in der Tabelle erscheinen und die Mail ankommen. Falls der Postfach-Server
  nicht erreichbar ist, öffnet die Seite automatisch den bisherigen
  E-Mail-Entwurf (mailto), es geht keine Anfrage verloren.
