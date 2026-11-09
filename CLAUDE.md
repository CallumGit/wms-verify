# CLAUDE.md — WMS Verify

> Plik konwencji projektu dla Claude Code. Trzymaj się tych zasad przy generowaniu i refaktoryzacji kodu.
> Język domeny i UI: **polski**. Język kodu (nazwy zmiennych, klas, komentarzy technicznych): **angielski**.

---

## 1. Czym jest projekt

**WMS Verify** to aplikacja mobilna (Android: telefon + tablet) do weryfikacji wysyłek magazynowych.
Operator weryfikuje detale na palecie poprzez:
- skan kodu kreskowego / QR (numer HU, numer materiału),
- OCR numeru grawera z aparatu (z ręcznym fallbackiem),
- dopasowanie do zamówienia, palety, klienta i materiału w bazie.

Następnie wysyła zweryfikowane dane (pojedyncza paleta lub całe zamówienie) do backendu,
z odpornością na utratę połączenia (autosave + synchronizacja). System generuje raporty
na żądanie i wg harmonogramu.

---

## 2. Stack technologiczny

### Frontend (mobile)
- **React Native + Expo**, **TypeScript** (strict).
- `react-native-vision-camera` — aparat + frame processors.
- `react-native-mlkit-barcode` (ML Kit) — skan kodów kreskowych/QR (offline).
- ML Kit Text Recognition — OCR grawera on-device; fallback: OCR serwerowy.
- `@tanstack/react-query` — pobieranie danych, cache, retry.
- `expo-sqlite` + `react-native-mmkv` — pamięć offline i autosave.
- `react-navigation` — nawigacja.
- `react-hook-form` + `zod` — formularze i walidacja (ręczne wprowadzanie).
- `i18next` — i18n, domyślny język `pl`.

### Backend
- **Node.js + NestJS**, **TypeScript** (strict).
- **PostgreSQL** + **Prisma** (ORM, źródło prawdy dla typów domeny).
- **Redis + BullMQ** — kolejki i harmonogram raportów.
- **JWT + RBAC** — autoryzacja i role.
- Raporty: `pdfmake` / Puppeteer (PDF), `exceljs` (XLSX).
- Walidacja DTO: `class-validator` + `class-transformer`.
- Dokumentacja API: OpenAPI / Swagger.

### Infrastruktura
- **Docker + docker-compose** (lokalnie i prod).
- **GitHub Actions** — CI/CD.
- **EAS Build** — buildy APK/AAB.

---

## 3. Struktura repozytorium (monorepo)

```
wms-verify/
├── CLAUDE.md
├── docker-compose.yml
├── apps/
│   ├── api/                      # NestJS backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/         # logowanie, role, uprawnienia
│   │       │   ├── master-data/  # klienci, oddziały, materiały, słowniki
│   │       │   ├── verification/ # silnik walidacji + parser numerów
│   │       │   ├── orders/       # zamówienia, palety, statusy
│   │       │   ├── sync/         # synchronizacja offline, idempotentne zapisy
│   │       │   ├── reporting/    # raporty PDF/XLSX + harmonogram (BullMQ)
│   │       │   └── recognition/  # OCR serwerowy (fallback), obróbka zdjęć
│   │       └── common/           # filtry, guardy, interceptory, utils
│   └── mobile/                   # React Native + Expo
│       └── src/
│           ├── features/
│           │   ├── auth/
│           │   ├── scanning/     # aparat, skan kodów, OCR grawera, ręczny wpis
│           │   ├── verification/ # ekrany flow weryfikacji
│           │   ├── orders/       # lista zamówień, palety, statusy
│           │   ├── dashboard/    # podgląd zamówień/palet, powiadomienia
│           │   ├── reporting/    # podgląd/eksport raportów
│           │   └── offline/      # warstwa autosave + sync
│           ├── components/       # współdzielone komponenty UI
│           └── i18n/             # tłumaczenia (pl)
├── packages/
│   ├── core/                     # parser numerów, reguły walidacji (czysta logika)
│   ├── types/                    # współdzielone typy (generowane z Prisma + DTO)
│   └── config/                   # konfiguracja ESLint/TS współdzielona
└── prisma/
    └── schema.prisma
```

**Zasada:** czysta logika domeny (parser, reguły) żyje w `packages/core` — bez zależności od
NestJS ani React Native, w pełni testowalna jednostkowo i współdzielona przez frontend i backend.

---

## 4. Obszary (moduły) i odpowiedzialności

| Moduł | Odpowiedzialność | Wymagania |
|-------|------------------|-----------|
| auth | logowanie, role, uprawnienia (konfiguracja raportów) | — |
| master-data | klienci/oddziały, materiały, słowniki | d |
| recognition / scanning | aparat, kody kreskowe/QR, OCR grawera, ręczny wpis | a, b, c, e |
| verification | dopasowanie grawer↔materiał↔HU↔klient, reguły | a–e |
| orders | zamówienia, palety, statusy; weryfikacja palety i zamówienia | f, g |
| sync / offline | autosave, kolejka synchronizacji, idempotentność | h |
| reporting | raporty PDF/XLSX + harmonogram | i, j |
| dashboard | podgląd zamówień/palet, powiadomienia o niezweryfikowanych | g |
| core (shared) | parser numerów, reguły, typy, i18n | wszystkie |

---

## 5. Reguły domeny — krytyczne

### 5.1 Parsowanie numeru klienta/materiału
Format: `101-2-018-119-01`
- `101-2-018` → **numer klienta** (firma + oddział) — istnieje w bazie (`Customer`).
- `119-01` → **numer materiału** (produkt/detal) — istnieje w bazie (`Material`).

Parser w `packages/core/parser`:
- Zawsze waliduj format regexem **przed** rozbiciem.
- Zwracaj typowany wynik `{ customerCode: string; materialCode: string }` lub błąd domenowy.
- Pokryj testami brzegowymi: brak segmentu, dodatkowe znaki, spacje, błędna liczba członów, wiodące zera.
- **Nigdy** nie zakładaj stałej długości segmentów — waliduj wg wzorca, nie wg długości łańcucha.

### 5.2 Reguły weryfikacji palety
Paleta uznana za zweryfikowaną, gdy **wszystkie** warunki spełnione:
1. Numer HU (zeskanowany) zgadza się z HU przypisanym do palety.
2. Numer materiału z etykiety = numer materiału z grawera (OCR lub ręcznie).
3. Numer materiału zgodny z materiałem zakodowanym w numerze klienta (`119-01`).
4. Numer klienta wskazuje na klienta/oddział przypisanego do zamówienia.
5. Liczba zweryfikowanych detali = oczekiwana liczba na palecie.

Każdy niespełniony warunek → status `FAILED` z czytelnym, **polskim** komunikatem dla operatora.

### 5.3 OCR grawera
- Próg pewności (confidence) konfigurowalny; poniżej progu → wymuś potwierdzenie lub ręczny wpis.
- Ręczny wpis (`e`) zawsze dostępny jako fallback, oznaczany w danych jako `source: MANUAL`.

---

## 6. Odporność i offline (wymaganie h)

- Każdy krok weryfikacji zapisywany lokalnie (`expo-sqlite`) natychmiast — operator nigdy nie traci postępu.
- Wysyłka do API jest **idempotentna**: każda weryfikacja palety ma `clientGeneratedId` (UUID).
  Backend odrzuca duplikaty po tym ID, nie tworzy zdublowanych rekordów.
- Synchronizacja w tle z retry i wykładniczym backoffem (`react-query` + kolejka lokalna).
- Przy utracie sieci proces trwa offline; po odzyskaniu — automatyczna synchronizacja.
- Przed wysyłką całego zamówienia: jeśli brakuje zweryfikowanych palet (`g.1`) — ostrzeżenie z listą.

---

## 7. Konwencje kodu

- TypeScript `strict: true`. Zakaz `any` (używaj `unknown` + zawężanie).
- Walidacja wejść: backend `class-validator` (DTO), frontend `zod`.
- Nazwy: pliki `kebab-case`, klasy `PascalCase`, zmienne/funkcje `camelCase`, stałe `UPPER_SNAKE`.
- Enumy statusów spójne między Prisma, backendem i frontendem (jedno źródło: `packages/types`).
- Komunikaty dla użytkownika **zawsze** przez i18n (`pl`), nigdy hardkodowane w komponentach.
- Każdy moduł NestJS: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.spec.ts`.
- Logika domeny nie zależy od frameworka — trzymaj ją w `packages/core`.
- Nie loguj danych wrażliwych (tokeny, pełne dane klienta) do konsoli/logów.

---

## 8. Testowanie

- **Unit (Jest)**: parser numerów, reguły walidacji, logika statusów. Priorytet: `packages/core`.
- **Integration (Jest + Testcontainers)**: endpointy API z prawdziwym PostgreSQL; kolejki BullMQ.
- **E2E (Maestro)**: pełny flow skan→walidacja→wysyłka; scenariusz offline→utrata sieci→sync.
- **OCR/skan**: zestaw realnych zdjęć (ostre, rozmyte, słabe światło, pod kątem) + pomiar skuteczności.
- **Obciążeniowe (k6)**: generowanie raportów dużych zamówień + równoległe wysyłki.
- Każdy PR musi przechodzić lint + testy w CI. Nowa logika domeny = nowe testy jednostkowe.

---

## 9. Kolejność implementacji (etapy)

0. Fundament: repo, Docker, CI, schemat Prisma, szkielet API + mobile, i18n.
1. Master Data + Auth.
2. Parser + Verification Engine (czysta logika, pełne testy) — `packages/core`.
3. Skanowanie i rozpoznawanie (kody, OCR, ręczny wpis).
4. Orders & Pallets + weryfikacja pojedynczej palety.
5. Offline & Sync (idempotentność, autosave).
6. Weryfikacja całego zamówienia + powiadomienia.
7. Dashboard / Overview UI.
8. Reporting (PDF/XLSX na żądanie).
9. Harmonogram raportów (BullMQ).
10. Hardening: obciążenie, UAT, UX, optymalizacja OCR.

**Zasada pracy:** najpierw rdzeń (`packages/core`) z testami, potem warstwy nadbudowane.
Zmiana reguł walidacji powinna być izolowana w `packages/core`.

---

## 10. Czego NIE robić

- Nie umieszczać logiki walidacji w komponentach UI ani w kontrolerach — tylko w `core`/`service`.
- Nie hardkodować tekstów PL w kodzie — wszystko przez i18n.
- Nie zakładać obecności naklejki QR — OCR i ręczny wpis muszą zawsze działać.
- Nie tworzyć nieidempotentnych endpointów zapisu weryfikacji.
- Nie zakładać stałych długości segmentów numeru klienta/materiału.
