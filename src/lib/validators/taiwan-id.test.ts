import { isValidTaiwanId } from './taiwan-id'

describe('isValidTaiwanId', () => {
  describe('valid IDs', () => {
    it('accepts a valid male ID', () => {
      expect(isValidTaiwanId('A123456789')).toBe(true)
    })

    it('accepts another valid male ID', () => {
      expect(isValidTaiwanId('A234567893')).toBe(true)
    })

    it('accepts a valid female ID', () => {
      expect(isValidTaiwanId('A201234567')).toBe(true)
    })
  })

  describe('format errors', () => {
    it('rejects lowercase first letter', () => {
      expect(isValidTaiwanId('a123456789')).toBe(false)
    })

    it('rejects numeric first character', () => {
      expect(isValidTaiwanId('1123456789')).toBe(false)
    })

    it('rejects ID that is too short', () => {
      expect(isValidTaiwanId('A12345678')).toBe(false)
    })

    it('rejects ID that is too long', () => {
      expect(isValidTaiwanId('A1234567890')).toBe(false)
    })

    it('rejects invalid gender digit 0', () => {
      expect(isValidTaiwanId('A023456789')).toBe(false)
    })

    it('rejects invalid gender digit 3', () => {
      expect(isValidTaiwanId('A323456789')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(isValidTaiwanId('')).toBe(false)
    })
  })

  describe('checksum errors', () => {
    it('rejects ID with wrong last digit', () => {
      expect(isValidTaiwanId('A123456788')).toBe(false)
    })

    it('rejects ID with wrong last digit (off by more)', () => {
      expect(isValidTaiwanId('A123456780')).toBe(false)
    })

    it('rejects ID with wrong middle digit', () => {
      expect(isValidTaiwanId('A153456789')).toBe(false)
    })
  })
})
