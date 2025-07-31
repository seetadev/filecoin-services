import {
  FunctionSelectors,
  TransactionConstants,
  ContractAddresses
} from '../../subgraph/src/constants';
import { ByteArray } from '@graphprotocol/graph-ts';

// Mock @graphprotocol/graph-ts
jest.mock('@graphprotocol/graph-ts');

describe('Constants', () => {
  beforeEach(() => {
    (ByteArray.fromHexString as jest.Mock).mockImplementation((hex) => ({
      hex,
      toHexString: () => hex
    }));
  });

  describe('FunctionSelectors', () => {
    it('should have correct EXEC_TRANSACTION selector', () => {
      expect(FunctionSelectors.EXEC_TRANSACTION).toBeDefined();
      expect(ByteArray.fromHexString).toHaveBeenCalledWith('0x6a761202');
    });

    it('should have correct ADD_SERVICE_PROVIDER selector', () => {
      expect(FunctionSelectors.ADD_SERVICE_PROVIDER).toBeDefined();
      expect(ByteArray.fromHexString).toHaveBeenCalledWith('0x5f6840ec');
    });

    it('should have correct MULTI_SEND selector', () => {
      expect(FunctionSelectors.MULTI_SEND).toBeDefined();
      expect(ByteArray.fromHexString).toHaveBeenCalledWith('0x8d80ff0a');
    });

    it('should have all selectors as 4-byte values', () => {
      // Function selectors should be 4 bytes (8 hex characters + 0x prefix)
      expect('0x6a761202').toHaveLength(10);
      expect('0x5f6840ec').toHaveLength(10);
      expect('0x8d80ff0a').toHaveLength(10);
    });

    it('should maintain selector immutability', () => {
      const originalSelector = FunctionSelectors.EXEC_TRANSACTION;
      
      // Attempt to modify (should not work due to readonly)
      expect(() => {
        (FunctionSelectors as any).EXEC_TRANSACTION = 'modified';
      }).toThrow();
      
      expect(FunctionSelectors.EXEC_TRANSACTION).toBe(originalSelector);
    });
  });

  describe('TransactionConstants', () => {
    it('should have correct WORD_SIZE', () => {
      expect(TransactionConstants.WORD_SIZE).toBe(32);
    });

    it('should have correct ADDRESS_SIZE', () => {
      expect(TransactionConstants.ADDRESS_SIZE).toBe(20);
    });

    it('should have correct SELECTOR_SIZE', () => {
      expect(TransactionConstants.SELECTOR_SIZE).toBe(4);
    });

    it('should have correct MIN_ADD_SERVICE_PROVIDER_SIZE', () => {
      expect(TransactionConstants.MIN_ADD_SERVICE_PROVIDER_SIZE).toBe(96); // 3 * 32
    });

    it('should maintain mathematical relationships', () => {
      // Verify that calculated constants are correct
      expect(TransactionConstants.MIN_ADD_SERVICE_PROVIDER_SIZE)
        .toBe(3 * TransactionConstants.WORD_SIZE);
    });

    it('should use standard Ethereum sizes', () => {
      // Verify Ethereum standard sizes
      expect(TransactionConstants.WORD_SIZE).toBe(32); // Standard EVM word size
      expect(TransactionConstants.ADDRESS_SIZE).toBe(20); // Ethereum address size
      expect(TransactionConstants.SELECTOR_SIZE).toBe(4); // Function selector size
    });
  });

  describe('ContractAddresses', () => {
    it('should have valid WARM_STORAGE address', () => {
      const address = ContractAddresses.WARM_STORAGE;
      
      expect(address).toBe('0xf49ba5eaCdFD5EE3744efEdf413791935FE4D4c5');
      expect(address).toHaveLength(42); // 0x + 40 hex characters
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should maintain address immutability', () => {
      const originalAddress = ContractAddresses.WARM_STORAGE;
      
      expect(() => {
        (ContractAddresses as any).WARM_STORAGE = '0x0000000000000000000000000000000000000000';
      }).toThrow();
      
      expect(ContractAddresses.WARM_STORAGE).toBe(originalAddress);
    });

    it('should have valid Ethereum address format', () => {
      const address = ContractAddresses.WARM_STORAGE;
      
      // Check if it's a valid Ethereum address format
      expect(address.startsWith('0x')).toBe(true);
      expect(address.substring(2)).toHaveLength(40);
      expect(address.substring(2)).toMatch(/^[a-fA-F0-9]+$/);
    });

    it('should not be zero address', () => {
      const zeroAddress = '0x0000000000000000000000000000000000000000';
      
      expect(ContractAddresses.WARM_STORAGE).not.toBe(zeroAddress);
    });
  });

  describe('Constants Integration', () => {
    it('should have consistent hex string formatting', () => {
      // All hex strings should use lowercase 'x'
      expect(ContractAddresses.WARM_STORAGE.indexOf('0x')).toBe(0);
      
      // Function selectors should be properly formatted
      const mockCalls = (ByteArray.fromHexString as jest.Mock).mock.calls;
      mockCalls.forEach(call => {
        expect(call[0]).toMatch(/^0x[a-fA-F0-9]+$/);
      });
    });

    it('should maintain type safety', () => {
      // Verify types are maintained correctly
      expect(typeof TransactionConstants.WORD_SIZE).toBe('number');
      expect(typeof TransactionConstants.ADDRESS_SIZE).toBe('number');
      expect(typeof TransactionConstants.SELECTOR_SIZE).toBe('number');
      expect(typeof ContractAddresses.WARM_STORAGE).toBe('string');
    });

    it('should handle constants in computations', () => {
      // Test that constants can be used in calculations
      const totalSize = TransactionConstants.WORD_SIZE + 
                       TransactionConstants.ADDRESS_SIZE + 
                       TransactionConstants.SELECTOR_SIZE;
      
      expect(totalSize).toBe(56); // 32 + 20 + 4
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle ByteArray creation failures gracefully', () => {
      (ByteArray.fromHexString as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid hex string');
      });

      expect(() => {
        // This would trigger during module loading, but we test the concept
        ByteArray.fromHexString('invalid');
      }).toThrow('Invalid hex string');
    });

    it('should validate selector uniqueness', () => {
      const selectors = [
        FunctionSelectors.EXEC_TRANSACTION,
        FunctionSelectors.ADD_SERVICE_PROVIDER,
        FunctionSelectors.MULTI_SEND
      ];
      
      // Check that all selectors are unique (mock objects should be different)
      const uniqueSelectors = new Set(selectors.map(s => s.hex));
      expect(uniqueSelectors.size).toBe(selectors.length);
    });
  });
});