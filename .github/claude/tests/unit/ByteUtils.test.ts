import { ByteUtils } from '../../subgraph/src/utils/ByteUtils';
import { Bytes, BigInt } from '@graphprotocol/graph-ts';

// Mock @graphprotocol/graph-ts
jest.mock('@graphprotocol/graph-ts');

describe('ByteUtils', () => {
  describe('equals', () => {
    it('should return true for identical byte arrays', () => {
      const a = new Uint8Array([1, 2, 3, 4, 5]);
      const b = new Uint8Array([1, 2, 3, 4, 5]);
      
      expect(ByteUtils.equals(a, 0, b, 0, 5)).toBe(true);
    });

    it('should return false for different byte arrays', () => {
      const a = new Uint8Array([1, 2, 3, 4, 5]);
      const b = new Uint8Array([1, 2, 3, 4, 6]);
      
      expect(ByteUtils.equals(a, 0, b, 0, 5)).toBe(false);
    });

    it('should handle partial array comparison with custom start positions', () => {
      const a = new Uint8Array([0, 1, 2, 3, 4]);
      const b = new Uint8Array([2, 3, 4, 5, 6]);
      
      expect(ByteUtils.equals(a, 2, b, 0, 3)).toBe(true);
    });

    it('should return false when arrays are too short', () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([1, 2, 3, 4, 5]);
      
      expect(ByteUtils.equals(a, 0, b, 0, 5)).toBe(false);
    });

    it('should handle default length parameter', () => {
      const a = new Uint8Array([0, 1, 2, 3]);
      const b = new Uint8Array([2, 3]);
      
      expect(ByteUtils.equals(a, 2, b)).toBe(true);
    });

    it('should handle edge cases with zero length', () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([4, 5, 6]);
      
      expect(ByteUtils.equals(a, 0, b, 0, 0)).toBe(true);
    });
  });

  describe('toBigInt', () => {
    beforeEach(() => {
      (BigInt.fromUnsignedBytes as jest.Mock).mockImplementation((bytes) => {
        return { value: 'mocked-bigint', bytes };
      });
      (BigInt.zero as jest.Mock).mockReturnValue({ value: 'zero' });
      (Bytes.fromUint8Array as jest.Mock).mockImplementation((arr) => arr);
    });

    it('should extract BigInt from valid byte array', () => {
      const data = new Uint8Array(64); // 32 bytes + offset
      data.fill(1, 10, 42); // Fill 32 bytes starting at offset 10
      
      const result = ByteUtils.toBigInt(data, 10);
      
      expect(Bytes.fromUint8Array).toHaveBeenCalled();
      expect(BigInt.fromUnsignedBytes).toHaveBeenCalled();
      expect(result).toEqual({ value: 'mocked-bigint', bytes: expect.any(Uint8Array) });
    });

    it('should return zero for insufficient data length', () => {
      const data = new Uint8Array(20); // Too short
      
      const result = ByteUtils.toBigInt(data, 10);
      
      expect(result).toEqual({ value: 'zero' });
    });

    it('should handle edge case at exact boundary', () => {
      const data = new Uint8Array(32); // Exactly 32 bytes
      
      const result = ByteUtils.toBigInt(data, 0);
      
      expect(BigInt.fromUnsignedBytes).toHaveBeenCalled();
    });
  });

  describe('toI32', () => {
    it('should extract 32-bit integer from last 4 bytes of 32-byte word', () => {
      const data = new Uint8Array(32);
      // Set last 4 bytes to represent the number 0x01020304
      data[28] = 0x01;
      data[29] = 0x02;
      data[30] = 0x03;
      data[31] = 0x04;
      
      const result = ByteUtils.toI32(data, 0);
      
      expect(result).toBe(0x01020304);
    });

    it('should return zero for insufficient data', () => {
      const data = new Uint8Array(20); // Too short
      
      const result = ByteUtils.toI32(data, 10);
      
      expect(result).toBe(0);
    });

    it('should handle different offsets correctly', () => {
      const data = new Uint8Array(64);
      // Set bytes at offset 32+28 to 32+31
      data[60] = 0xFF;
      data[61] = 0xFF;
      data[62] = 0xFF;
      data[63] = 0xFF;
      
      const result = ByteUtils.toI32(data, 32);
      
      expect(result).toBe(-1); // 0xFFFFFFFF as signed integer
    });
  });

  describe('view', () => {
    it('should create a view of the array without copying', () => {
      const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      
      const view = ByteUtils.view(data, 2, 4);
      
      expect(view).toBeInstanceOf(Uint8Array);
      expect(view.length).toBe(4);
      expect(Array.from(view)).toEqual([2, 3, 4, 5]);
    });

    it('should handle edge cases at array boundaries', () => {
      const data = new Uint8Array([1, 2, 3]);
      
      const view = ByteUtils.view(data, 0, 3);
      
      expect(Array.from(view)).toEqual([1, 2, 3]);
    });
  });

  describe('toBytes', () => {
    it('should convert Uint8Array to Bytes', () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      (Bytes.fromUint8Array as jest.Mock).mockReturnValue('converted-bytes');
      
      const result = ByteUtils.toBytes(data);
      
      expect(Bytes.fromUint8Array).toHaveBeenCalledWith(data);
      expect(result).toBe('converted-bytes');
    });
  });
});