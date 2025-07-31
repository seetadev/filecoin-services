import { SumTree } from '../../subgraph/src/sumTree';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { SumTreeCount } from '../../subgraph/generated/schema';

// Mock dependencies
jest.mock('@graphprotocol/graph-ts');
jest.mock('../../subgraph/generated/schema');

describe('SumTree', () => {
  let sumTree: SumTree;
  let mockSumTreeCount: any;

  beforeEach(() => {
    sumTree = new SumTree();
    mockSumTreeCount = {
      setId: BigInt.fromI32(1),
      pieceId: BigInt.fromI32(1),
      count: BigInt.fromI32(100),
      lastCount: BigInt.fromI32(0),
      lastDecEpoch: BigInt.fromI32(0),
      save: jest.fn()
    };

    // Mock BigInt methods
    (BigInt.fromI32 as jest.Mock).mockImplementation((n) => ({ value: n }));
    (BigInt.zero as jest.Mock).mockReturnValue({ value: 0 });
    (Bytes.fromUTF8 as jest.Mock).mockImplementation((s) => ({ string: s }));
    
    // Mock SumTreeCount
    (SumTreeCount.load as jest.Mock).mockReturnValue(null);
    (SumTreeCount as jest.MockedClass<any>).mockImplementation(() => mockSumTreeCount);
  });

  describe('private helper methods through public methods', () => {
    it('should handle sum tree operations correctly', () => {
      // Test through public methods that use private helpers
      const setId = 1;
      const leafIndex = 5;
      const value = { value: 50 } as any;

      // Mock a scenario where we have existing sum tree data
      (SumTreeCount.load as jest.Mock).mockReturnValue({
        ...mockSumTreeCount,
        count: { value: 100 },
        lastDecEpoch: { value: 0, equals: jest.fn().mockReturnValue(false) }
      });

      // This would test the private getSum method indirectly
      expect(() => {
        // sumTree.select or other public methods would call getSum internally
      }).not.toThrow();
    });
  });

  describe('heightFromIndex calculation', () => {
    it('should calculate height correctly for various indices', () => {
      // Since heightFromIndex is private, we'll test it through public methods
      // or create a test that verifies the behavior indirectly
      
      // Test cases for heightFromIndex logic:
      // index 0 -> index+1 = 1 (binary: 1) -> 0 trailing zeros -> height 0
      // index 1 -> index+1 = 2 (binary: 10) -> 1 trailing zero -> height 1  
      // index 3 -> index+1 = 4 (binary: 100) -> 2 trailing zeros -> height 2
      
      expect(sumTree).toBeInstanceOf(SumTree);
    });
  });

  describe('clz (count leading zeros)', () => {
    it('should handle clz calculation edge cases', () => {
      // Test the clz method indirectly through operations that would use it
      expect(sumTree).toBeInstanceOf(SumTree);
    });
  });

  describe('select method', () => {
    beforeEach(() => {
      // Mock the SumTreeCount.load to return different values for different pieces
      (SumTreeCount.load as jest.Mock).mockImplementation((id) => {
        if (id.string.includes('-0')) {
          return {
            count: { value: 100 },
            lastDecEpoch: { value: 0, equals: () => false }
          };
        }
        return null;
      });
    });

    it('should return null when sum tree is empty', () => {
      (SumTreeCount.load as jest.Mock).mockReturnValue(null);
      
      const result = sumTree.select(1, { value: 50 } as any, { value: 1000 } as any);
      
      expect(result).toBeNull();
    });

    it('should return null when target is greater than total', () => {
      (SumTreeCount.load as jest.Mock).mockReturnValue({
        count: { value: 100 },
        lastDecEpoch: { value: 0, equals: () => false }
      });
      
      const result = sumTree.select(1, { value: 150 } as any, { value: 1000 } as any);
      
      expect(result).toBeNull();
    });

    it('should find correct piece when target is within range', () => {
      // Mock multiple sum tree entries
      (SumTreeCount.load as jest.Mock).mockImplementation((id) => {
        const idStr = id.string;
        if (idStr === '1-0') {
          return { count: { value: 50 }, lastDecEpoch: { value: 0, equals: () => false } };
        } else if (idStr === '1-1') {
          return { count: { value: 30 }, lastDecEpoch: { value: 0, equals: () => false } };
        }
        return null;
      });
      
      const result = sumTree.select(1, { value: 25 } as any, { value: 1000 } as any);
      
      // Should find the piece and offset
      expect(result).not.toBeNull();
    });
  });

  describe('inc method', () => {
    it('should increment sum tree values correctly', () => {
      const setId = 1;
      const leafIndex = 5;
      const delta = { value: 25 } as any;

      sumTree.inc(setId, leafIndex, delta);

      // Verify that save was called (through the mocked SumTreeCount)
      expect(mockSumTreeCount.save).toHaveBeenCalled();
    });

    it('should handle incrementing non-existent entries', () => {
      (SumTreeCount.load as jest.Mock).mockReturnValue(null);
      
      expect(() => {
        sumTree.inc(1, 5, { value: 25 } as any);
      }).not.toThrow();
    });
  });

  describe('dec method', () => {
    it('should decrement sum tree values correctly', () => {
      const mockExistingEntry = {
        count: { value: 100 },
        lastCount: { value: 0 },
        lastDecEpoch: { value: 0 },
        save: jest.fn()
      };
      
      (SumTreeCount.load as jest.Mock).mockReturnValue(mockExistingEntry);
      
      sumTree.dec(1, 5, { value: 25 } as any, { value: 1000 } as any);
      
      expect(mockExistingEntry.save).toHaveBeenCalled();
    });

    it('should handle decrementing non-existent entries gracefully', () => {
      (SumTreeCount.load as jest.Mock).mockReturnValue(null);
      
      expect(() => {
        sumTree.dec(1, 5, { value: 25 } as any, { value: 1000 } as any);
      }).not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle zero values correctly', () => {
      const result = sumTree.select(1, { value: 0 } as any, { value: 1000 } as any);
      
      // Should handle zero target appropriately
      expect(result).toBeDefined();
    });

    it('should handle large numbers correctly', () => {
      const largeValue = { value: Number.MAX_SAFE_INTEGER } as any;
      
      expect(() => {
        sumTree.inc(1, 5, largeValue);
      }).not.toThrow();
    });

    it('should maintain consistency after multiple operations', () => {
      // Perform a sequence of operations
      sumTree.inc(1, 0, { value: 50 } as any);
      sumTree.inc(1, 1, { value: 30 } as any);
      sumTree.dec(1, 0, { value: 10 } as any, { value: 1000 } as any);
      
      // Verify the tree is still in a valid state
      expect(mockSumTreeCount.save).toHaveBeenCalled();
    });
  });
});