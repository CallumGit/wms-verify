import { ping, CORE_VERSION } from './index';

describe('@wms/core — sanity (Obszar 0)', () => {
  it('ping zwraca pong', () => {
    expect(ping()).toBe('pong');
  });

  it('eksportuje wersję', () => {
    expect(CORE_VERSION).toBe('0.1.0');
  });
});
