// ============================================================================
// @wms/types — współdzielone typy i enumy domeny.
// JEDNO ŹRÓDŁO PRAWDY dla statusów używanych przez backend i mobile.
// Wartości muszą być spójne ze schematem Prisma (prisma/schema.prisma).
// ============================================================================

// --- Role użytkownika ---
export const UserRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  OPERATOR: 'OPERATOR',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// --- Status zamówienia ---
export const OrderStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  VERIFIED: 'VERIFIED',
  SHIPPED: 'SHIPPED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// --- Status palety ---
export const PalletStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  SHIPPED: 'SHIPPED',
} as const;
export type PalletStatus = (typeof PalletStatus)[keyof typeof PalletStatus];

// --- Wynik weryfikacji ---
export const VerificationResult = {
  PASS: 'PASS',
  FAIL: 'FAIL',
} as const;
export type VerificationResult =
  (typeof VerificationResult)[keyof typeof VerificationResult];

// --- Źródło wprowadzenia danych ---
export const InputSource = {
  BARCODE: 'BARCODE',
  QR: 'QR',
  OCR: 'OCR',
  MANUAL: 'MANUAL',
} as const;
export type InputSource = (typeof InputSource)[keyof typeof InputSource];

// --- Status synchronizacji (offline) ---
export const SyncStatus = {
  PENDING: 'PENDING',
  SYNCED: 'SYNCED',
  CONFLICT: 'CONFLICT',
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

// --- Raporty ---
export const ReportType = {
  ORDER_SUMMARY: 'ORDER_SUMMARY',
  SHIPMENT_SUMMARY: 'SHIPMENT_SUMMARY',
  PALLET_DETAIL: 'PALLET_DETAIL',
} as const;
export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const ReportFormat = {
  PDF: 'PDF',
  XLSX: 'XLSX',
} as const;
export type ReportFormat = (typeof ReportFormat)[keyof typeof ReportFormat];

// --- Wspólne kształty danych przekazywane między warstwami ---

/** Wynik rozbicia pełnego kodu klienta/materiału, np. "101-2-018-119-01". */
export interface ParsedClientCode {
  /** np. "101-2-018" — kod klienta (firma + oddział) */
  customerCode: string;
  /** np. "119-01" — kod materiału (produkt/detal) */
  materialCode: string;
  /** oryginalny, pełny kod wejściowy */
  raw: string;
}
