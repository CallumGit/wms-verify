// ============================================================================
// @wms/core — czysta logika domeny (parser numerów, reguły weryfikacji).
// Bez zależności od NestJS ani React Native. W pełni testowalna jednostkowo.
//
// UWAGA: Właściwa implementacja (parser kodu klienta, reguły PASS/FAIL palety)
// powstanie w OBSZARZE 3. Poniżej tylko placeholder potwierdzający, że pakiet
// buduje się i testuje (zielony pipeline w Obszarze 0).
// ============================================================================

export const CORE_VERSION = '0.1.0';

/** Sanity helper — zostanie zastąpiony właściwą logiką w Obszarze 3. */
export function ping(): string {
  return 'pong';
}
