# Obszar 0 — Fundament projektu (instrukcja krok po kroku)

Ten dokument prowadzi Cię od pustego komputera do działającego szkieletu monorepo:
backend (NestJS) z health-checkiem, mobile (Expo) z ekranem startowym, współdzielone
pakiety `core` i `types`, baza w Dockerze, lint, testy i CI.

> Co już jest w repo (wygenerowane): cała struktura plików opisana niżej.
> Co robisz Ty: instalujesz zależności, uruchamiasz Docker i migracje, weryfikujesz, że wszystko żyje.

---

## 0. Wymagania wstępne

Zainstaluj lokalnie:
- **Node.js 20+** (zalecane LTS) i **npm 10+** — sprawdź: `node -v`, `npm -v`
- **Docker** + **Docker Compose** — sprawdź: `docker -v`, `docker compose version`
- **Git**
- (do mobile, później) konto **Expo** i aplikacja **Expo Go** na telefonie z Androidem lub emulator Android Studio

---

## 1. Struktura, którą otrzymujesz

```
wms-verify/
├── CLAUDE.md                  # konwencje projektu
├── ROADMAP.md                 # spis obszarów (0-21)
├── README-OBSZAR-0.md         # ten plik
├── package.json               # npm workspaces + skrypty
├── tsconfig.base.json         # wspólna konfiguracja TS (strict)
├── tsconfig.json              # referencje do projektów
├── .eslintrc.cjs              # ESLint
├── .prettierrc.json           # Prettier
├── .gitignore
├── .env.example               # wzór zmiennych środowiskowych
├── docker-compose.yml         # PostgreSQL + Redis
├── .github/workflows/ci.yml   # CI (lint, typecheck, build, test)
├── prisma/
│   ├── schema.prisma          # model bazy (z poprzednich kroków)
│   └── seed.ts                # dane testowe (klient 101-2-018, materiał 119-01)
├── packages/
│   ├── types/                 # współdzielone enumy/typy (źródło prawdy)
│   └── core/                  # czysta logika domeny (parser/reguły — od Obszaru 3)
└── apps/
    ├── api/                   # NestJS: main + AppModule + HealthController
    └── mobile/                # Expo: ekran startowy
```

---

## 2. Krok po kroku — uruchomienie

### Krok 1 — Pobierz/umieść pliki i wejdź do katalogu
```bash
cd wms-verify
```

### Krok 2 — Skonfiguruj zmienne środowiskowe
```bash
cp .env.example .env
# Otwórz .env i ustaw własne sekrety JWT (na razie wystarczą wartości domyślne do dev).
```

### Krok 3 — Zainstaluj zależności (npm workspaces)
```bash
npm install
```
> To zainstaluje zależności dla wszystkich workspace'ów (api, mobile, core, types) naraz.

### Krok 4 — Podnieś bazę i Redis (Docker)
```bash
npm run docker:up
# sprawdź, że kontenery działają:
docker ps
```
Powinieneś zobaczyć `wms_postgres` i `wms_redis` w stanie healthy.

### Krok 5 — Wygeneruj klienta Prisma i uruchom pierwszą migrację
```bash
npm run prisma:generate
npm run prisma:migrate   # nada nazwę migracji, np. "init"
```
> Migracja utworzy wszystkie tabele wg `prisma/schema.prisma`.

### Krok 6 — Zasiej dane testowe
```bash
npm run prisma:seed
```
Powinieneś zobaczyć komunikat o utworzeniu klienta `101-2-018`, materiału `119-01`
i zamówienia `ZAM-2026-0001`.

### Krok 7 — Sprawdź jakość kodu i testy rdzenia
```bash
npm run lint
npm run typecheck
npm run test:core
```
Testy `@wms/core` (sanity) powinny przejść na zielono.

### Krok 8 — Uruchom backend i sprawdź health-check
```bash
npm run start:dev --workspace apps/api
```
W drugim terminalu:
```bash
curl http://localhost:3000/api/health
```
Oczekiwany wynik (JSON):
```json
{ "status": "ok", "core": "0.1.0", "corePing": "pong", "timestamp": "..." }
```

### Krok 9 — Uruchom aplikację mobilną (Expo)
```bash
npm run android --workspace apps/mobile
# lub: npm run start --workspace apps/mobile  (i zeskanuj QR aplikacją Expo Go)
```
Na ekranie zobaczysz „WMS Verify / Weryfikacja wysyłek magazynowych / core v0.1.0".

> Uwaga: na emulatorze Androida API jest pod `http://10.0.2.2:3000` (już ustawione w `.env.example`).

---

## 3. Weryfikacja końcowa (definicja ukończenia Obszaru 0)

Obszar 0 uznaj za gotowy, gdy **wszystkie** punkty są spełnione:

- [ ] `npm install` przechodzi bez błędów
- [ ] `docker ps` pokazuje zdrowe `wms_postgres` i `wms_redis`
- [ ] `npm run prisma:migrate` tworzy tabele, `prisma:seed` wstawia dane
- [ ] `npm run lint` i `npm run typecheck` bez błędów
- [ ] `npm run test:core` — zielone
- [ ] `GET /api/health` zwraca `status: ok` i `corePing: pong`
- [ ] aplikacja mobilna pokazuje ekran startowy
- [ ] (opcjonalnie) push do repo uruchamia CI i przechodzi

---

## 4. Najczęstsze problemy

- **Port 5432 zajęty** — masz lokalnego PostgreSQL. Zatrzymaj go lub zmień port w `docker-compose.yml` i `DATABASE_URL`.
- **`prisma migrate` nie łączy się z bazą** — sprawdź, czy kontener `wms_postgres` jest healthy i czy `DATABASE_URL` w `.env` zgadza się z `docker-compose.yml`.
- **Mobile nie widzi API** — na emulatorze użyj `10.0.2.2`, na fizycznym telefonie użyj adresu IP komputera w sieci lokalnej (np. `http://192.168.x.x:3000`).
- **`@wms/core` nie znaleziony przez API/mobile** — uruchom `npm run build` (buduje pakiety) lub upewnij się, że `npm install` połączył workspaces.

---

## 5. Co dalej

Po zaznaczeniu wszystkich punktów z sekcji 3 zaktualizuj status w `ROADMAP.md`
(Obszar 0 → ✅) i przejdź do **Obszaru 1 (Baza danych i Prisma)** lub od razu do
**Obszaru 3 (Core: parser + reguły)** — zgodnie z wcześniejszą rekomendacją kolejności.
