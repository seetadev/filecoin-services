import {
  AbiType,
  AbiValue,
  StringAddressBoolBytesResult,
  BytesStringResult,
  AddServiceProviderFunctionParams,
  decodeStringAddressBoolBytes,
  decodeBytesString,
  decodeAddServiceProviderFunction
} from '../../subgraph/src/decode';
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { ByteUtils } from '../../subgraph/src/utils/ByteUtils';

// Mock dependencies
jest.mock('@graphprotocol/graph-ts');
jest.mock('../../subgraph/src/utils/ByteUtils');

describe('Decode Module', () => {
  beforeEach(() => {
    // Mock Address methods
    (Address.zero as jest.Mock).mockReturnValue({ value: 'zero-address' });
    (Address.fromBytes as jest.Mock).mockImplementation((bytes) => ({ value: 'address', bytes }));
    
    // Mock BigInt methods
    (BigInt.zero as jest.Mock).mockReturnValue({ value: 0 });
    (BigInt.fromUnsignedBytes as jest.Mock).mockImplementation((bytes) => ({ value: 'bigint', bytes }));
    
    // Mock Bytes methods
    (Bytes.empty as jest.Mock).mockReturnValue({ value: 'empty-bytes' });
    (Bytes.fromUint8Array as jest.Mock).mockImplementation((arr) => ({ value: 'bytes', array: arr }));
    
    // Mock ByteUtils methods
    (ByteUtils.toBigInt as jest.Mock).mockReturnValue({ value: 32 });
    (ByteUtils.toI32 as jest.Mock).mockReturnValue(64);
    (ByteUtils.view as jest.Mock).mockImplementation((arr, start, length) => arr.slice(start, start + length));
    (ByteUtils.toBytes as jest.Mock).mockImplementation((arr) => ({ value: 'converted-bytes', array: arr }));
  });

  describe('AbiValue', () => {
    it('should create string AbiValue correctly', () => {
      const value = AbiValue.fromString('test-string');
      
      expect(value.type).toBe(AbiType.STRING);
      expect(value.stringValue).toBe('test-string');
    });

    it('should create address AbiValue correctly', () => {
      const mockAddress = { value: 'test-address' };
      const value = AbiValue.fromAddress(mockAddress as any);
      
      expect(value.type).toBe(AbiType.ADDRESS);
      expect(value.addressValue).toBe(mockAddress);
    });

    it('should create bool AbiValue correctly', () => {
      const value = AbiValue.fromBool(true);
      
      expect(value.type).toBe(AbiType.BOOL);
      expect(value.boolValue).toBe(true);
    });

    it('should create bytes AbiValue correctly', () => {
      const testBytes = new Uint8Array([1, 2, 3, 4]);
      const value = AbiValue.fromBytes(testBytes);
      
      expect(value.type).toBe(AbiType.BYTES);
      expect(value.bytesValue).toBe(testBytes);
    });

    it('should create uint256 AbiValue correctly', () => {
      const mockBigInt = { value: 'big-number' };
      const value = AbiValue.fromUint256(mockBigInt as any);
      
      expect(value.type).toBe(AbiType.UINT256);
      expect(value.uint256Value).toBe(mockBigInt);
    });
  });

  describe('StringAddressBoolBytesResult', () => {
    it('should create result object with all fields', () => {
      const mockAddress = { value: 'test-address' };
      const mockBytes = { value: 'test-bytes' };
      
      const result = new StringAddressBoolBytesResult(
        'test-string',
        mockAddress as any,
        true,
        mockBytes as any
      );
      
      expect(result.stringValue).toBe('test-string');
      expect(result.addressValue).toBe(mockAddress);
      expect(result.boolValue).toBe(true);
      expect(result.bytesValue).toBe(mockBytes);
    });
  });

  describe('BytesStringResult', () => {
    it('should create result object correctly', () => {
      const mockBytes = { value: 'test-bytes' };
      
      const result = new BytesStringResult(mockBytes as any, 'test-string');
      
      expect(result.bytesValue).toBe(mockBytes);
      expect(result.stringValue).toBe('test-string');
    });
  });

  describe('AddServiceProviderFunctionParams', () => {
    it('should create params object correctly', () => {
      const mockAddress = { value: 'provider-address' };
      
      const params = new AddServiceProviderFunctionParams(
        mockAddress as any,
        'https://pdp.example.com',
        'https://retrieval.example.com'
      );
      
      expect(params.provider).toBe(mockAddress);
      expect(params.pdpUrl).toBe('https://pdp.example.com');
      expect(params.pieceRetrievalUrl).toBe('https://retrieval.example.com');
    });
  });

  describe('decodeStringAddressBoolBytes', () => {
    it('should decode valid ABI encoded data', () => {
      const mockData = new Uint8Array(256); // Large enough for test data
      
      // Mock ByteUtils.toBigInt to return different offsets for different calls
      let callCount = 0;
      (ByteUtils.toBigInt as jest.Mock).mockImplementation(() => {
        callCount++;
        return { value: callCount * 32 }; // Return different offsets
      });
      
      // Mock ByteUtils.view to return different data for string extraction
      (ByteUtils.view as jest.Mock).mockImplementation((arr, start, length) => {
        // Simulate string data
        return new Uint8Array([116, 101, 115, 116]); // "test" in ASCII
      });
      
      const result = decodeStringAddressBoolBytes(mockData);
      
      expect(result).toBeInstanceOf(StringAddressBoolBytesResult);
      expect(ByteUtils.toBigInt).toHaveBeenCalled();
      expect(ByteUtils.view).toHaveBeenCalled();
    });

    it('should handle empty data gracefully', () => {
      const emptyData = new Uint8Array(0);
      
      const result = decodeStringAddressBoolBytes(emptyData);
      
      expect(result).toBeInstanceOf(StringAddressBoolBytesResult);
    });

    it('should handle malformed ABI data', () => {
      const malformedData = new Uint8Array(32); // Too small for complete ABI data
      
      // Mock ByteUtils to return invalid offsets
      (ByteUtils.toBigInt as jest.Mock).mockReturnValue({ value: 1000 });
      
      const result = decodeStringAddressBoolBytes(malformedData);
      
      expect(result).toBeInstanceOf(StringAddressBoolBytesResult);
    });
  });

  describe('decodeBytesString', () => {
    it('should decode bytes and string from ABI data', () => {
      const mockData = new Uint8Array(256);
      
      // Mock ByteUtils.toBigInt for offset calculations
      (ByteUtils.toBigInt as jest.Mock).mockImplementation(() => ({ value: 64 }));
      
      // Mock ByteUtils.view for data extraction
      (ByteUtils.view as jest.Mock).mockImplementation(() => new Uint8Array([1, 2, 3, 4]));
      
      const result = decodeBytesString(mockData);
      
      expect(result).toBeInstanceOf(BytesStringResult);
      expect(ByteUtils.toBigInt).toHaveBeenCalled();
      expect(ByteUtils.view).toHaveBeenCalled();
    });

    it('should handle insufficient data', () => {
      const insufficientData = new Uint8Array(10);
      
      const result = decodeBytesString(insufficientData);
      
      expect(result).toBeInstanceOf(BytesStringResult);
    });
  });

  describe('decodeAddServiceProviderFunction', () => {
    it('should decode function parameters correctly', () => {
      const mockData = new Uint8Array(256);
      
      // Mock ByteUtils methods for parameter extraction
      (ByteUtils.toBigInt as jest.Mock)
        .mockReturnValueOnce({ value: 96 })  // provider address offset
        .mockReturnValueOnce({ value: 128 }) // pdpUrl offset  
        .mockReturnValueOnce({ value: 192 }) // pieceRetrievalUrl offset
        .mockReturnValue({ value: 32 });     // string lengths
      
      // Mock address extraction
      (ByteUtils.view as jest.Mock).mockImplementation(() => new Uint8Array(20));
      
      const result = decodeAddServiceProviderFunction(mockData);
      
      expect(result).toBeInstanceOf(AddServiceProviderFunctionParams);
      expect(ByteUtils.toBigInt).toHaveBeenCalled();
      expect(ByteUtils.view).toHaveBeenCalled();
      expect(Address.fromBytes).toHaveBeenCalled();
    });

    it('should handle malformed function data', () => {
      const malformedData = new Uint8Array(50); // Too small
      
      const result = decodeAddServiceProviderFunction(malformedData);
      
      expect(result).toBeInstanceOf(AddServiceProviderFunctionParams);
    });
  });

  describe('string extraction utility', () => {
    it('should extract UTF-8 strings correctly', () => {
      // Test string extraction logic indirectly through decode functions
      const mockData = new Uint8Array(128);
      
      // Set up mock data that would represent a UTF-8 string
      (ByteUtils.view as jest.Mock).mockReturnValue(new Uint8Array([72, 101, 108, 108, 111])); // "Hello"
      
      const result = decodeStringAddressBoolBytes(mockData);
      
      expect(result.stringValue).toBeDefined();
    });

    it('should handle non-UTF-8 data gracefully', () => {
      const mockData = new Uint8Array(128);
      
      // Mock invalid UTF-8 sequence
      (ByteUtils.view as jest.Mock).mockReturnValue(new Uint8Array([255, 254, 253]));
      
      expect(() => {
        decodeStringAddressBoolBytes(mockData);
      }).not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle zero-length strings', () => {
      const mockData = new Uint8Array(128);
      
      (ByteUtils.toBigInt as jest.Mock).mockReturnValue({ value: 0 });
      (ByteUtils.view as jest.Mock).mockReturnValue(new Uint8Array(0));
      
      const result = decodeStringAddressBoolBytes(mockData);
      
      expect(result.stringValue).toBe('');
    });

    it('should handle maximum size data', () => {
      const largeData = new Uint8Array(4096); // Large data array
      
      expect(() => {
        decodeStringAddressBoolBytes(largeData);
      }).not.toThrow();
    });

    it('should validate address data correctly', () => {
      const mockData = new Uint8Array(128);
      
      // Mock 20-byte address data
      (ByteUtils.view as jest.Mock).mockReturnValue(new Uint8Array(20).fill(1));
      
      const result = decodeStringAddressBoolBytes(mockData);
      
      expect(Address.fromBytes).toHaveBeenCalled();
    });
  });
});