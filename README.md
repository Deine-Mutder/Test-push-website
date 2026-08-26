# Lernplattform Realschulabschluss Sachsen

## Architektur

```
realschule-sachsen/
├── apps/
│   ├── backend/     NestJS REST API (TypeScript, Prisma, SQLite, JWT)
│   └── web/         Next.js 14 Web-App (App Router, Tailwind, Zustand)
```

### Voraussetzungen
- Node.js ≥ 20 ([nodejs.org](https://nodejs.org))

### 1. Backend einrichten
```bash
cd apps/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate      
npx prisma migrate dev --name add_question_permission    
npm run seed                
npm run start:dev           
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
npm run dev                 
```

