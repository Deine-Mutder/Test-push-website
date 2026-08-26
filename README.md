# Lernplattform Realschulabschluss Sachsen

Individuelle Lernplattform zur Vorbereitung auf den Realschulabschluss Sachsen
(Mathematik, Deutsch, Englisch). Dieses Repository enthält Backend und
Web-App als produktionsnahe Referenzimplementierung.

## Projektstatus (Ausbaustufe 1)

**Fertig implementiert:**
- Backend (NestJS + PostgreSQL/Prisma): Auth (Register/Login/Refresh/Passwort-Reset),
  Fächer/Themen/Wiki, Einstufungstest (50 Fragen, gleichmäßig verteilt),
  Themen-Lerntest (15 Fragen), Defiziterkennung (<75%-Regel), Dashboard-Aggregation,
  Lernzeit-Tracking, Admin-API (Fragen-/Themenverwaltung, Statistik, Nutzerliste)
- Web-App (Next.js 14 + Tailwind): vollständiger Nutzerfluss von Registrierung über
  Einstufungstest bis Wissens-Wiki und Themen-Test, Dashboard mit "Lernkompass"-
  Fortschrittsringen, Light/Dark Mode, Admin-Panel-Grundgerüst
- Fachinhalt: Mathematik → **Bruchrechnung** vollständig als Qualitäts-Vorlage
  ausgearbeitet (2 Wiki-Unterthemen, 15 Testfragen); übrige Mathe-Themen sowie
  Deutsch/Englisch sind strukturell angelegt, aber inhaltlich noch auszubauen

**Noch offen (nächste Ausbaustufen):**
- Flutter-Mobile-Apps (iOS/Android) auf Basis derselben REST-API
- Vollständiger Fachinhalt für alle Themen aller 3 Fächer
- Prüfungssimulation als eigenständiges Feature (Zeitlimit, Originalformat)
- Unit-/Integrationstests
- E-Mail-Versand für Passwort-Reset (aktuell nur Server-Log)
- Admin-UI für Themen-Verwaltung (Backend-Endpunkt existiert bereits)

> ⚠️ **Wichtiger Hinweis zur fachlichen Qualität:** Die enthaltenen Lerninhalte
> und Testfragen wurden mit KI-Unterstützung erstellt. Vor Produktivbetrieb
> sollten alle Inhalte durch eine Lehrkraft mit Bezug zum aktuellen
> sächsischen Lehrplan fachlich geprüft werden.

## Architektur

```
realschule-sachsen/
├── apps/
│   ├── backend/     NestJS REST API (TypeScript, Prisma, SQLite, JWT)
│   └── web/         Next.js 14 Web-App (App Router, Tailwind, Zustand)
```

**Datenbank:** Für die lokale Entwicklung kommt **SQLite** statt PostgreSQL zum
Einsatz — kein Docker, kein separater Datenbankserver nötig. Die komplette
Datenbank liegt als einzelne Datei unter `apps/backend/prisma/dev.db` und
lässt sich mit jedem SQLite-Browser (z. B. [DB Browser for SQLite](https://sqlitebrowser.org/),
kostenlos) direkt öffnen und einsehen. Für den späteren Produktivbetrieb
empfiehlt sich der Wechsel zurück auf PostgreSQL (einzige nötige Änderung:
`provider` in `prisma/schema.prisma` und die `DATABASE_URL`).

**Warum diese Architektur:**
- **Modulares Fach-Datenmodell** (`Subject → Topic → SubTopic → Question`, kein
  Enum): neue Fächer lassen sich rein datenbankseitig ergänzen, ohne
  Code-Änderung.
- **Gemeinsamer `TestAttempt`** für Einstufungstest, Themen-Test und künftige
  Prüfungssimulation, unterschieden über `type` — vermeidet Duplikation der
  Bewertungslogik (siehe `TestScoringService`).
- **REST statt GraphQL**: Das Datenmodell ist überschaubar relational, REST
  deckt den Bedarf ohne zusätzliche Komplexität.
- **Web zuerst, dann Flutter-Mobile**: Backend/API muss stabil sein, bevor
  3 Frontends parallel dagegen entwickelt werden — reduziert Rework-Risiko.

## Lokales Setup

Kein Docker, keine separate Datenbank-Installation nötig — die Datenbank ist
eine einzelne Datei (SQLite), die automatisch beim ersten Setup angelegt wird.

### Voraussetzungen
- Node.js ≥ 20 ([nodejs.org](https://nodejs.org))

### 1. Backend einrichten
```bash
cd apps/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate      # legt apps/backend/prisma/dev.db an und erstellt das Schema
npm run seed                # legt Fächer, Themen, Beispiel-Inhalt & Testnutzer an
npm run start:dev           # läuft auf http://localhost:3001/api/v1
```
API-Dokumentation (Swagger): http://localhost:3001/api/docs

Die Datenbankdatei liegt danach unter `apps/backend/prisma/dev.db` und kann
mit jedem SQLite-Browser geöffnet werden. Alternativ zeigt
```bash
npm run prisma:studio
```
den kompletten Datenbankinhalt im Browser unter http://localhost:5555 an
(Tabellen, Einträge, alles durchsuch- und editierbar).

**Test-Logins nach dem Seed:**
- Admin: `admin@lernplattform-sachsen.de` / `Admin123!`
- Demo-Schüler: `demo@lernplattform-sachsen.de` / `Demo123!`

### 2. Web-App einrichten
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev                 # läuft auf http://localhost:3000
```

## Nächste Schritte

1. Rückmeldung zu den in der Konzeptphase gestellten offenen Punkten
   (Umfang der Fachinhalte, Hosting-Präferenz, Push-Benachrichtigungen etc.)
2. Fachliche Prüfung/Ausbau der Wiki-Inhalte und Fragenpools
3. Flutter-Mobile-Apps auf Basis der bestehenden API
4. Prüfungssimulation als eigenes Feature ergänzen
5. Test-Suite (Unit + E2E) aufbauen
