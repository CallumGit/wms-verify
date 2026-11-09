# Obszar 1 — Baza danych i Prisma (instrukcja krok po kroku)

Cel: połączyć backend NestJS z bazą PostgreSQL przez Prisma, uruchomić pierwszą migrację
(utworzenie wszystkich tabel), zasiać dane testowe i potwierdzić, że API faktycznie
rozmawia z bazą (health-check pokazuje `database: up`).

> Co dostajesz nowego w tym obszarze:
> - `apps/api/src/prisma/prisma.service.ts` — połączenie z bazą wpięte w cykl życia Nest
> - `apps/api/src/prisma/prisma.module.ts` — globalny moduł (PrismaService dostępny wszędzie)
> - zaktualizowany `app.module.ts` (dołączony PrismaModule)
> - zaktualizowany `health.controller.ts` (sprawdza połączenie z bazą)
> - `prisma/tsconfig.json` — dedykowana konfiguracja dla seeda (stabilna na Windows)
> - zaktualizowany root `package.json` (zależność `@prisma/client`, blok `prisma.seed`)

---

## 0. Warunek wstępny

Docker z Obszaru 0 musi działać (kontener `wms_postgres` healthy):
```bash
docker ps
```
Jeśli baza nie stoi:
```bash
npm run docker:up
```

---

## 1. Zainstaluj zależności

Doszła zależność `@prisma/client`. Z katalogu głównego:
```bash
npm install
```

---

## 2. Wygeneruj klienta Prisma

Klient to wygenerowany, typowany kod dostępu do bazy (na podstawie `schema.prisma`):
```bash
npm run prisma:generate
```
Po tym kroku import `import { PrismaClient } from '@prisma/client'` w `prisma.service.ts`
i w `seed.ts` będzie miał komplet typów.

---

## 3. Uruchom pierwszą migrację

Migracja tworzy w bazie wszystkie tabele wg schematu:
```bash
npm run prisma:migrate
```
Prisma zapyta o nazwę migracji — wpisz np. `init`.

Co się stanie:
- powstanie katalog `prisma/migrations/<data>_init/` z plikiem SQL,
- tabele (`User`, `Customer`, `Material`, `Order`, `Pallet`, `PalletVerification`,
  `EngravingRecord`, `Report`, `ReportSchedule`, `AuditLog`) zostaną utworzone,
- Prisma automatycznie spróbuje uruchomić seed (patrz krok 4).

> Jeśli migracja nie połączy się z bazą — sprawdź `DATABASE_URL` w `.env`
> i czy kontener `wms_postgres` jest healthy.

---

## 4. Zasiej dane testowe

Jeśli seed nie uruchomił się automatycznie po migracji, odpal ręcznie:
```bash
npm run prisma:seed
```
Oczekiwany komunikat:
```
Seed zakończony: klient 101-2-018, materiał 119-01, zamówienie ZAM-2026-0001.
```

Co trafia do bazy:
- klient `101-2-018` (Przykładowa Firma, oddział Katowice),
- materiał `119-01`,
- użytkownicy `admin` i `operator` (hasła to placeholdery — prawdziwe hashowanie w Obszarze 2),
- zamówienie `ZAM-2026-0001` z jedną paletą `HU0000000001` (oczekiwana ilość 100, status PENDING).

---

## 5. Obejrzyj dane w przeglądarce (opcjonalnie, ale wygodne)

Prisma Studio to graficzny podgląd bazy:
```bash
npx prisma studio --schema prisma/schema.prisma
```
Otworzy się `http://localhost:5555` — możesz przejrzeć wszystkie tabele i rekordy z seeda.

---

## 6. Sprawdź, że API rozmawia z bazą

Uruchom backend:
```bash
npm run start:dev --workspace apps/api
```
W drugim terminalu:
```bash
curl http://localhost:3000/api/health
```
Oczekiwany wynik:
```json
{
  "status": "ok",
  "core": "0.1.0",
  "corePing": "pong",
  "database": "up",
  "timestamp": "..."
}
```
Kluczowe: `"database": "up"`. Jeśli widzisz `"database": "down"` i `"status": "degraded"`,
to API działa, ale nie łączy się z bazą — sprawdź Docker i `DATABASE_URL`.

---

## 7. Weryfikacja końcowa (definicja ukończenia Obszaru 1)

- [ ] `npm run prisma:generate` przechodzi bez błędów
- [ ] `npm run prisma:migrate` tworzy katalog `prisma/migrations/` i tabele
- [ ] `npm run prisma:seed` wstawia dane (komunikat o kliencie 101-2-018)
- [ ] Prisma Studio pokazuje rekordy (opcjonalnie)
- [ ] `GET /api/health` zwraca `database: up` i `status: ok`

---

## 8. Najczęstsze problemy

- **`Environment variable not found: DATABASE_URL`** — nie masz `.env` w roocie albo brakuje w nim
  `DATABASE_URL`. Skopiuj z `.env.example` i uzupełnij.
- **`Can't reach database server at localhost:5432`** — kontener bazy nie działa. `npm run docker:up`,
  poczekaj aż `docker ps` pokaże healthy.
- **Seed: `Cannot find module '@prisma/client'`** — nie uruchomiłeś `npm run prisma:generate` przed seedem.
- **`ts-node` błąd przy seedzie na Windows** — używamy dedykowanego `prisma/tsconfig.json`; upewnij się,
  że skrypt `prisma:seed` w `package.json` ma `--project prisma/tsconfig.json`.
- **Chcesz zacząć bazę od zera** — `npx prisma migrate reset --schema prisma/schema.prisma`
  (uwaga: kasuje wszystkie dane i uruchamia seed ponownie).

---

## 9. Co dalej

Po domknięciu tej checklisty zaktualizuj `ROADMAP.md` (Obszar 1 → ✅).
Następny w kolejności zgodnie z planem: **Obszar 3 (Core: parser + reguły)** — serce logiki,
w całości bez bazy. Albo **Obszar 2 (Auth)**, jeśli wolisz najpierw domknąć warstwę backendu.
