/**
 * L4U Anfragen-Postfach — kostenloses Postfach für das Kontaktformular.
 *
 * Ablauf: Besucher sendet das Formular ab → dieser Script läuft im eigenen
 * Google-Konto des Betreibers, hängt die Anfrage als Zeile in die Tabelle
 * und schickt zusätzlich eine Benachrichtigungs-Mail an NOTIFY_EMAIL.
 *
 * Einrichtung: siehe POSTFACH-SETUP.md im Repo-Root. Kurz: Google Sheet
 * anlegen, Erweiterungen → Apps Script, diesen Code einfügen, als Web-App
 * ("Ausführen als: Ich", "Zugriff: Alle") bereitstellen, die /exec-URL in
 * _data/data.yaml → form.inbox_url eintragen.
 */

var NOTIFY_EMAIL = 'lukas.urbanek@transportundgarten.de';
var SHEET_NAME = 'Anfragen';

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Honeypot: das Formular versteckt dieses Feld vor Menschen; ausgefüllt
  // bedeutet Bot — Anfrage verwerfen, Erfolg vortäuschen.
  if (p.company) {
    return ok();
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Zeitpunkt', 'Leistung', 'Einsatzort', 'Vorhaben',
        'E-Mail', 'Telefon', 'Name', 'Seite']);
    }
    sheet.appendRow([new Date(), p.service || '', p.place || '', p.project || '',
      p.email || '', p.phone || '', p.name || '', p.page || '']);
  } finally {
    lock.releaseLock();
  }

  var subject = 'Neue L4U-Anfrage: ' + (p.service || '?') + ' – ' + (p.place || '?');
  MailApp.sendEmail(NOTIFY_EMAIL, subject, letterText(p));
  return ok();
}

function letterText(p) {
  return [
    'Neue Anfrage über transportundgarten.de',
    '',
    'Leistung: ' + (p.service || '-'),
    'Einsatzort: ' + (p.place || '-'),
    'Vorhaben:',
    p.project || '-',
    '',
    'E-Mail: ' + (p.email || '-'),
    'Telefon: ' + (p.phone || '-'),
    'Name: ' + (p.name || '-'),
  ].join('\n');
}

function ok() {
  return ContentService.createTextOutput('ok');
}
