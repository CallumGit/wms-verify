# WMS Verify — Roadmapa implementacji (spis obszarów)

> Plik roboczy / spis treści projektu. Każdy obszar jest osobną „porcją" pracy.
> **Sposób użycia:** każdego dnia wskaż numer obszaru (np. „przygotuj Obszar 3"),
> a otrzymasz plik z kodem + instrukcję krok po kroku dla tego obszaru.
>
> Legenda statusów: ⬜ do zrobienia · 🟨 w trakcie · ✅ gotowe
> Aktualizuj kolumnę „Status" po ukończeniu każdego obszaru.

---

## Jak korzystać z roadmapy

1. Idź zgodnie z kolejnością (zależności są ułożone tak, by nic nie blokowało).
2. Każdy obszar = jeden dzień / jedna sesja = jeden plik z kodem + kroki.
3. Po ukończeniu zaznacz status i przejdź dalej.
4. Obszary oznaczone 🔁 warto rozwijać iteracyjnie (wracać do nich po feedbacku).

---

## Tabela zbiorcza

| # | Obszar | Warstwa | Zależy od | Wymagania (a–j) | Status |
|---|--------|---------|-----------|-----------------|--------|
| 0 | Fundament projektu (setup) | Repo/DevOps | — | — | ✅ |
| 1 | Baza danych i Prisma | Backend | 0 | d, f, g, i, j | ✅ |
| 2 | Auth & Users (RBAC) | Backend | 1 | uprawnienia | ⬜ |
| 3 | Core: parser numerów + reguły | Shared | 0 | a–e | ⬜ |
| 4 | Master Data (klienci, materiały) | Backend | 1,2 | d | ⬜ |
| 5 | Verification Engine (API) | Backend | 1,3,4 | a–e | ⬜ |
| 6 | Orders & Pallets (API) | Backend | 1,4,5 | f, g | ⬜ |
| 7 | Sync & idempotentność (API) | Backend | 5,6 | h | ⬜ |
| 8 | Recognition serwerowy (OCR fallback) | Backend | 5 | a, c | ⬜ |
| 9 | Reporting — generowanie (API) | Backend | 6 | i | ⬜ |
| 10 | Reporting — harmonogram (BullMQ) | Backend | 9,2 | j | ⬜ |
| 11 | Mobile: fundament + nawigacja + i18n | Mobile | 0 | UI/UX, pl | ⬜ |
| 12 | Mobile: Auth (logowanie) | Mobile | 11,2 | uprawnienia | ⬜ |
| 13 | Mobile: warstwa offline + autosave | Mobile | 11 | h | ⬜ |
| 14 | Mobile: skanowanie (kody + QR) | Mobile | 11 | b, c | ⬜ |
| 15 | Mobile: OCR grawera + ręczny wpis | Mobile | 14,3 | a, e | ⬜ |
| 16 | Mobile: flow weryfikacji palety | Mobile | 13,14,15,5 | a–f, h | ⬜ |
| 17 | Mobile: weryfikacja zamówienia + powiadomienia | Mobile | 16,6 | f, g | ⬜ |
| 18 | Mobile: Dashboard / podgląd statusów | Mobile | 6,17 | g | ⬜ |
| 19 | Mobile: raporty (podgląd/eksport) | Mobile | 9 | i | ⬜ |
| 20 | Testy E2E + obciążeniowe | QA | większość | testowanie | ⬜ |
| 21 | Hardening / UAT / optymalizacja | Cross | wszystko | UI/UX, OCR | ⬜ |

---

## Szczegóły obszarów

Każdy wpis poniżej opisuje, **co dany obszar obejmuje** i **co dostaniesz** w pliku w dniu jego realizacji.

### Obszar 0 — Fundament projektu (setup)
Zakres: monorepo, `package.json`/workspaces, TypeScript (strict), ESLint/Prettier,
`docker-compose` (PostgreSQL + Redis), szkielet `apps/api`, `apps/mobile`, `packages/core|types|config`,
GitHub Actions (lint+test), plik `.env.example`.
Dostarczę: pliki konfiguracyjne + instrukcja uruchomienia środowiska lokalnego.

### Obszar 1 — Baza danych i Prisma
Zakres: finalny `schema.prisma` (już mamy bazę), pierwsza migracja, seed danych testowych
(przykładowi klienci `101-2-018`, materiały `119-01`, użytkownicy), klient Prisma jako moduł NestJS.
Dostarczę: migracja + `seed.ts` + `PrismaModule/PrismaService` + kroki migracji.

### Obszar 2 — Auth & Users (RBAC)
Zakres: logowanie JWT, hashowanie haseł, role (ADMIN/SUPERVISOR/OPERATOR), guardy ról,
dekorator `@Roles`, endpoint logowania i odświeżania tokenu.
Dostarczę: moduł `auth` (controller/service/guard/dto) + testy + kroki.

### Obszar 3 — Core: parser numerów + reguły 🔁
Zakres: parser `101-2-018-119-01` → `{ customerCode, materialCode }`, walidacja formatu,
reguły weryfikacji palety (HU ↔ materiał ↔ grawer ↔ klient ↔ liczba), błędy domenowe.
Czysta logika w `packages/core`, bez zależności od frameworka. **Sercem aplikacji** — pełne testy.
Dostarczę: `parser.ts`, `verification-rules.ts`, typy, komplet testów jednostkowych + kroki.

### Obszar 4 — Master Data (klienci, materiały)
Zakres: CRUD klientów i materiałów, walidacja kodów, wyszukiwanie po kodzie,
import danych (opcjonalnie CSV).
Dostarczę: moduły `master-data` (customers, materials) + DTO + testy + kroki.

### Obszar 5 — Verification Engine (API)
Zakres: endpoint przyjmujący weryfikację palety, użycie `packages/core` do walidacji,
zapis `PalletVerification` + `EngravingRecord`, ustalanie wyniku PASS/FAIL i powodu.
Dostarczę: moduł `verification` (controller/service/dto) + testy integracyjne + kroki.

### Obszar 6 — Orders & Pallets (API)
Zakres: pobieranie zamówień i palet ze statusami, przeliczanie statusu zamówienia
na podstawie palet, lista niezweryfikowanych palet (wymaganie g), oznaczanie wysyłki.
Dostarczę: moduły `orders`, `pallets` + DTO + testy + kroki.

### Obszar 7 — Sync & idempotentność (API)
Zakres: przyjmowanie partii weryfikacji z urządzenia, idempotentność po `clientGeneratedId`,
obsługa konfliktów, endpoint synchronizacji wsadowej (pojedyncza paleta i całe zamówienie — f).
Dostarczę: moduł `sync` + logika idempotentna + testy + kroki.

### Obszar 8 — Recognition serwerowy (OCR fallback)
Zakres: endpoint przyjmujący zdjęcie grawera, OCR serwerowy (gdy on-device zawiedzie),
zwrot kandydatów z pewnością. Uzupełnia OCR mobilny.
Dostarczę: moduł `recognition` + integracja OCR + kroki.

### Obszar 9 — Reporting — generowanie (API)
Zakres: budowa raportów (ORDER_SUMMARY, SHIPMENT_SUMMARY, PALLET_DETAIL),
eksport PDF (`pdfmake`/Puppeteer) i XLSX (`exceljs`), zakres dat/zamówień, dane: klienci,
palety, statusy, daty i godziny realizacji (wymaganie i).
Dostarczę: moduł `reporting` + generatory PDF/XLSX + testy + kroki.

### Obszar 10 — Reporting — harmonogram (BullMQ)
Zakres: `ReportSchedule` (CRON, strefa Europe/Warsaw), kolejka BullMQ + Redis,
generowanie o zadanych godzinach dnia/nocy, konfiguracja tylko dla uprawnionych (wymaganie j).
Dostarczę: worker + scheduler + endpointy konfiguracji + kroki.

### Obszar 11 — Mobile: fundament + nawigacja + i18n
Zakres: projekt Expo, nawigacja (react-navigation), motyw/UI bazowe pod telefon i tablet,
konfiguracja `i18next` (pl), klient API + react-query.
Dostarczę: szkielet `apps/mobile` + nawigacja + i18n + kroki.

### Obszar 12 — Mobile: Auth (logowanie)
Zakres: ekran logowania, przechowywanie tokenu (bezpiecznie), kontekst sesji, wylogowanie.
Dostarczę: ekrany + hook auth + integracja z API + kroki.

### Obszar 13 — Mobile: warstwa offline + autosave 🔁
Zakres: lokalna baza (`expo-sqlite`), zapis każdego kroku weryfikacji natychmiast,
kolejka synchronizacji z retry/backoff, wykrywanie stanu sieci (wymaganie h).
Dostarczę: repozytorium lokalne + sync manager + testy + kroki.

### Obszar 14 — Mobile: skanowanie (kody + QR)
Zakres: aparat (vision-camera), skan kodu kreskowego HU i numeru materiału, skan QR (przyszłość),
ekran skanera z feedbackiem (wymagania b, c).
Dostarczę: komponent skanera + hooki + kroki.

### Obszar 15 — Mobile: OCR grawera + ręczny wpis
Zakres: OCR on-device (ML Kit) numeru grawera ze zdjęcia, próg pewności,
fallback ręcznego wpisu z walidacją (zod) — wymagania a, e.
Dostarczę: komponent OCR + formularz ręczny + integracja z core + kroki.

### Obszar 16 — Mobile: flow weryfikacji palety
Zakres: pełny ekran procesu — skan HU → materiał → grawery → walidacja (core) → wynik,
zapis offline na bieżąco, wysyłka pojedynczej palety (wymagania a–f, h).
Dostarczę: ekrany flow + integracja core/sync/API + kroki.

### Obszar 17 — Mobile: weryfikacja zamówienia + powiadomienia
Zakres: wysyłka całego zamówienia, ostrzeżenie przed wysyłką o brakujących paletach (g.1),
podsumowanie wyników (wymagania f, g).
Dostarczę: ekran zamówienia + logika ostrzeżeń + kroki.

### Obszar 18 — Mobile: Dashboard / podgląd statusów
Zakres: lista zamówień i palet ze statusami, filtry, wskazanie niezweryfikowanych (g.2),
odświeżanie danych.
Dostarczę: ekrany dashboardu + komponenty statusów + kroki.

### Obszar 19 — Mobile: raporty (podgląd/eksport)
Zakres: lista wygenerowanych raportów, pobieranie/udostępnianie pliku, podgląd zakresu (wymaganie i).
Dostarczę: ekran raportów + integracja z API + kroki.

### Obszar 20 — Testy E2E + obciążeniowe
Zakres: Maestro (pełny flow + scenariusz offline→sync), k6 (raporty + równoległe wysyłki),
zestaw zdjęć testowych do OCR.
Dostarczę: scenariusze testowe + konfiguracja + kroki.

### Obszar 21 — Hardening / UAT / optymalizacja 🔁
Zakres: dopracowanie UX (płynność, czytelność, tryb jednoręczny), optymalizacja progów OCR,
poprawki po testach z operatorami, bezpieczeństwo, wydajność.
Dostarczę: checklisty + konkretne poprawki + kroki.

---

## Mapowanie wymagań a–j → obszary (kontrola pokrycia)

| Wymaganie | Opis skrótowy | Obszary |
|-----------|---------------|---------|
| a | Weryfikacja numerów grawerów (aparat/OCR) | 3, 5, 8, 15, 16 |
| b | Walidacja numeru HU (kod kreskowy) | 1, 5, 14, 16 |
| c | Numer materiału z etykiety wysyłkowej | 3, 5, 14, 15, 16 |
| d | Weryfikacja numeru klienta + parsowanie | 1, 3, 4, 5 |
| e | Ręczny wpis grawera (fallback) | 3, 15, 16 |
| f | Weryfikacja pojedynczej palety i całego zamówienia | 5, 6, 7, 16, 17 |
| g | Informowanie o niezweryfikowanych paletach | 6, 17, 18 |
| h | Odporność na utratę postępu (offline/idempotentność) | 7, 13, 16 |
| i | Raporty podsumowujące wysyłki | 9, 19 |
| j | Harmonogram automatycznych raportów | 10 |
| UI/UX | Intuicyjność, telefon+tablet, płynność, pl | 11, 18, 21 |

Wszystkie wymagania a–j mają pokrycie. ✅

---

## Sugerowany harmonogram (orientacyjnie, „dzień = obszar")

Tydzień 1: Obszary 0–4 (fundament + baza + auth + core + master data)
Tydzień 2: Obszary 5–10 (silnik weryfikacji, orders, sync, recognition, reporting, harmonogram)
Tydzień 3: Obszary 11–17 (mobile: fundament → flow weryfikacji → zamówienia)
Tydzień 4: Obszary 18–21 (dashboard, raporty mobile, testy, hardening)

Kolejność jest elastyczna — backendowe obszary 5–10 i mobilne 11–15 można prowadzić równolegle,
jeśli pracuje nad nimi więcej niż jedna osoba.
