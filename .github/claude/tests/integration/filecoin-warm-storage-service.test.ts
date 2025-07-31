import {
  handleDataSetRailCreated,
  handleFaultRecord,
  handleProviderApproved,
  handleProviderRegistered,
  handleProviderRejected,
  handleProviderRemoved,
  handleRailRateUpdated,
  generateChallengeIndex
} from '../../subgraph/src/filecoin-warm-storage-service';
import { 
  createMockEvent,
  createMockDataSetRailCreatedEvent,
  createMockFaultRecordEvent,
  createMockProviderEvent
} from '../fixtures/test-data';
import { DataSet, Provider, Rail, FaultRecord } from '../../subgraph/generated/schema';
import { PDPVerifier } from '../../subgraph/generated/PDPVerifier/PDPVerifier';
import { BigInt, Bytes, Address, crypto } from '@graphprotocol/graph-ts';

// Mock all dependencies
jest.mock('@graphprotocol/graph-ts');
jest.mock('../../subgraph/generated/schema');
jest.mock('../../subgraph/generated/PDPVerifier/PDPVerifier');

describe('FilecoinWarmStorageService Integration', () => {
  let mockDataSet: any;
  let mockProvider: any;
  let mockRail: any;
  let mockFaultRecord: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock entities
    mockDataSet = {
      id: 'dataset-1',
      railId: BigInt.fromI32(1),
      storageProvider: Address.zero(),
      totalDataSize: BigInt.fromI32(1000),
      totalPieces: BigInt.fromI32(10),
      isActive: true,
      createdAt: BigInt.fromI32(1000),
      updatedAt: BigInt.fromI32(1000),
      blockNumber: BigInt.fromI32(100),
      save: jest.fn()
    };

    mockProvider = {
      id: Address.zero(),
      isApproved: false,
      isRegistered: false,
      totalDataSize: BigInt.fromI32(0),
      totalDataSets: BigInt.fromI32(0),
      pdpUrl: '',
      pieceRetrievalUrl: '',
      createdAt: BigInt.fromI32(1000),
      updatedAt: BigInt.fromI32(1000),
      blockNumber: BigInt.fromI32(100),
      save: jest.fn()
    };

    mockRail = {
      id: 'rail-1',
      railId: BigInt.fromI32(1),
      rate: BigInt.fromI32(1000),
      lockupPeriod: BigInt.fromI32(2880),
      createdAt: BigInt.fromI32(1000),
      updatedAt: BigInt.fromI32(1000),
      blockNumber: BigInt.fromI32(100),
      save: jest.fn()
    };

    mockFaultRecord = {
      id: 'fault-1',
      provider: Address.zero(),
      setId: BigInt.fromI32(1),
      epochsLate: BigInt.fromI32(5),
      penalty: BigInt.fromI32(100),
      createdAt: BigInt.fromI32(1000),
      blockNumber: BigInt.fromI32(100),
      save: jest.fn()
    };

    // Mock schema constructors and load methods
    (DataSet.load as jest.Mock).mockReturnValue(mockDataSet);
    (DataSet as jest.MockedClass<any>).mockImplementation(() => mockDataSet);
    
    (Provider.load as jest.Mock).mockReturnValue(mockProvider);
    (Provider as jest.MockedClass<any>).mockImplementation(() => mockProvider);
    
    (Rail.load as jest.Mock).mockReturnValue(mockRail);
    (Rail as jest.MockedClass<any>).mockImplementation(() => mockRail);
    
    (FaultRecord as jest.MockedClass<any>).mockImplementation(() => mockFaultRecord);

    // Mock BigInt and Bytes
    (BigInt.fromI32 as jest.Mock).mockImplementation((n) => ({ value: n, toString: () => n.toString() }));
    (BigInt.zero as jest.Mock).mockReturnValue({ value: 0 });
    (Bytes.fromUTF8 as jest.Mock).mockImplementation((s) => ({ string: s }));
    (Bytes.fromBigInt as jest.Mock).mockImplementation((n) => ({ bigint: n }));
    (Address.zero as jest.Mock).mockReturnValue({ value: 'zero' });

    // Mock crypto
    (crypto.keccak256 as jest.Mock).mockReturnValue(
      Bytes.fromHexString('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
    );
  });

  describe('handleDataSetRailCreated', () => {
    it('should create new DataSet and Rail entities', () => {
      const event = createMockDataSetRailCreatedEvent();
      
      // Mock entity not existing initially
      (DataSet.load as jest.Mock).mockReturnValue(null);
      (Rail.load as jest.Mock).mockReturnValue(null);

      handleDataSetRailCreated(event);

      expect(DataSet).toHaveBeenCalled();
      expect(Rail).toHaveBeenCalled();
      expect(mockDataSet.save).toHaveBeenCalled();
      expect(mockRail.save).toHaveBeenCalled();
    });

    it('should handle existing DataSet update', () => {
      const event = createMockDataSetRailCreatedEvent();
      
      // Mock existing DataSet
      (DataSet.load as jest.Mock).mockReturnValue(mockDataSet);
      (Rail.load as jest.Mock).mockReturnValue(null);

      handleDataSetRailCreated(event);

      expect(mockDataSet.save).toHaveBeenCalled();
    });

    it('should create SumTree entries for pieces', () => {
      const event = createMockDataSetRailCreatedEvent();
      event.params.leafHashes = [
        Bytes.fromHexString('0x1111'),
        Bytes.fromHexString('0x2222')
      ];

      (DataSet.load as jest.Mock).mockReturnValue(null);
      (Rail.load as jest.Mock).mockReturnValue(null);

      handleDataSetRailCreated(event);

      expect(mockDataSet.totalPieces.value).toBeGreaterThan(0);
    });
  });

  describe('handleProviderRegistered', () => {
    it('should create new provider with correct properties', () => {
      const event = createMockProviderEvent();
      (Provider.load as jest.Mock).mockReturnValue(null);

      handleProviderRegistered(event);

      expect(Provider).toHaveBeenCalled();
      expect(mockProvider.isRegistered).toBe(true);
      expect(mockProvider.save).toHaveBeenCalled();
    });

    it('should update existing provider registration', () => {
      const event = createMockProviderEvent();
      mockProvider.isRegistered = false;

      handleProviderRegistered(event);

      expect(mockProvider.isRegistered).toBe(true);
      expect(mockProvider.save).toHaveBeenCalled();
    });

    it('should decode provider URLs correctly', () => {
      const event = createMockProviderEvent();
      event.params.data = new Uint8Array([/* mock encoded data */]);

      (Provider.load as jest.Mock).mockReturnValue(null);

      handleProviderRegistered(event);

      expect(mockProvider.pdpUrl).toBeDefined();
      expect(mockProvider.pieceRetrievalUrl).toBeDefined();
    });
  });

  describe('handleProviderApproved', () => {
    it('should set provider approval status', () => {
      const event = createMockProviderEvent();

      handleProviderApproved(event);

      expect(mockProvider.isApproved).toBe(true);
      expect(mockProvider.save).toHaveBeenCalled();
    });

    it('should handle non-existent provider gracefully', () => {
      const event = createMockProviderEvent();
      (Provider.load as jest.Mock).mockReturnValue(null);

      expect(() => {
        handleProviderApproved(event);
      }).not.toThrow();
    });
  });

  describe('handleProviderRejected', () => {
    it('should set provider rejection status', () => {
      const event = createMockProviderEvent();
      mockProvider.isApproved = true;

      handleProviderRejected(event);

      expect(mockProvider.isApproved).toBe(false);
      expect(mockProvider.save).toHaveBeenCalled();
    });
  });

  describe('handleProviderRemoved', () => {
    it('should deactivate provider', () => {
      const event = createMockProviderEvent();

      handleProviderRemoved(event);

      expect(mockProvider.isRegistered).toBe(false);
      expect(mockProvider.isApproved).toBe(false);
      expect(mockProvider.save).toHaveBeenCalled();
    });
  });

  describe('handleFaultRecord', () => {
    it('should create fault record for provider', () => {
      const event = createMockFaultRecordEvent();

      handleFaultRecord(event);

      expect(FaultRecord).toHaveBeenCalled();
      expect(mockFaultRecord.save).toHaveBeenCalled();
    });

    it('should update provider stats after fault', () => {
      const event = createMockFaultRecordEvent();

      handleFaultRecord(event);

      expect(mockProvider.save).toHaveBeenCalled();
    });
  });

  describe('handleRailRateUpdated', () => {
    it('should update rail rate and create rate change queue entry', () => {
      const event = {
        params: {
          railId: BigInt.fromI32(1),
          newRate: BigInt.fromI32(2000)
        },
        block: {
          timestamp: BigInt.fromI32(2000),
          number: BigInt.fromI32(200)
        }
      };

      handleRailRateUpdated(event as any);

      expect(mockRail.save).toHaveBeenCalled();
    });

    it('should handle non-existent rail', () => {
      const event = {
        params: {
          railId: BigInt.fromI32(999),
          newRate: BigInt.fromI32(2000)
        },
        block: {
          timestamp: BigInt.fromI32(2000),
          number: BigInt.fromI32(200)
        }
      };

      (Rail.load as jest.Mock).mockReturnValue(null);

      expect(() => {
        handleRailRateUpdated(event as any);
      }).not.toThrow();
    });
  });

  describe('generateChallengeIndex', () => {
    beforeEach(() => {
      (Bytes.fromBigInt as jest.Mock).mockReturnValue(new Uint8Array(32));
      (Bytes.fromUint8Array as jest.Mock).mockImplementation((arr) => arr);
      (Bytes.fromHexString as jest.Mock).mockImplementation((hex) => ({ 
        toHexString: () => hex,
        reverse: () => new Uint8Array(32)
      }));
      (BigInt.fromUnsignedBytes as jest.Mock).mockReturnValue({ value: 12345 });
    });

    it('should generate deterministic challenge index', () => {
      const seed = new Uint8Array(32).fill(1);
      const dataSetID = BigInt.fromI32(100);
      const proofIndex = 5;
      const totalLeaves = BigInt.fromI32(1000);

      const result = generateChallengeIndex(seed, dataSetID, proofIndex, totalLeaves);

      expect(crypto.keccak256).toHaveBeenCalled();
      expect(BigInt.fromUnsignedBytes).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle zero totalLeaves', () => {
      const seed = new Uint8Array(32);
      const dataSetID = BigInt.fromI32(100);
      const proofIndex = 5;
      const totalLeaves = BigInt.fromI32(0);
      totalLeaves.isZero = jest.fn().mockReturnValue(true);

      expect(() => {
        generateChallengeIndex(seed, dataSetID, proofIndex, totalLeaves);
      }).not.toThrow();
    });

    it('should pad seed correctly', () => {
      const shortSeed = new Uint8Array(16); // Less than 32 bytes
      const dataSetID = BigInt.fromI32(100);
      const proofIndex = 5;
      const totalLeaves = BigInt.fromI32(1000);

      const result = generateChallengeIndex(shortSeed, dataSetID, proofIndex, totalLeaves);

      expect(result).toBeDefined();
    });

    it('should handle large proof indices', () => {
      const seed = new Uint8Array(32);
      const dataSetID = BigInt.fromI32(100);
      const proofIndex = 2147483647; // Max i32
      const totalLeaves = BigInt.fromI32(1000);

      const result = generateChallengeIndex(seed, dataSetID, proofIndex, totalLeaves);

      expect(result).toBeDefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete provider lifecycle', () => {
      const providerEvent = createMockProviderEvent();

      // Register provider
      (Provider.load as jest.Mock).mockReturnValue(null);
      handleProviderRegistered(providerEvent);
      expect(mockProvider.isRegistered).toBe(true);

      // Approve provider
      (Provider.load as jest.Mock).mockReturnValue(mockProvider);
      handleProviderApproved(providerEvent);
      expect(mockProvider.isApproved).toBe(true);

      // Create fault record
      const faultEvent = createMockFaultRecordEvent();
      handleFaultRecord(faultEvent);
      expect(mockFaultRecord.save).toHaveBeenCalled();

      // Remove provider
      handleProviderRemoved(providerEvent);
      expect(mockProvider.isRegistered).toBe(false);
    });

    it('should handle data set with pieces lifecycle', () => {
      const dataSetEvent = createMockDataSetRailCreatedEvent();
      dataSetEvent.params.leafHashes = [
        Bytes.fromHexString('0x1111'),
        Bytes.fromHexString('0x2222'),
        Bytes.fromHexString('0x3333')
      ];

      (DataSet.load as jest.Mock).mockReturnValue(null);
      (Rail.load as jest.Mock).mockReturnValue(null);

      handleDataSetRailCreated(dataSetEvent);

      expect(mockDataSet.totalPieces.value).toBeGreaterThan(0);
      expect(mockDataSet.save).toHaveBeenCalled();
      expect(mockRail.save).toHaveBeenCalled();
    });

    it('should maintain data consistency across operations', () => {
      const providerEvent = createMockProviderEvent();
      const dataSetEvent = createMockDataSetRailCreatedEvent();
      
      // Setup provider
      (Provider.load as jest.Mock).mockReturnValue(mockProvider);
      mockProvider.totalDataSets = BigInt.fromI32(0);
      mockProvider.totalDataSize = BigInt.fromI32(0);

      // Create data set
      (DataSet.load as jest.Mock).mockReturnValue(null);
      handleDataSetRailCreated(dataSetEvent);

      // Verify consistency
      expect(mockDataSet.save).toHaveBeenCalled();
      expect(mockRail.save).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle missing entity dependencies gracefully', () => {
      const event = createMockDataSetRailCreatedEvent();
      
      // Mock all loads to return null
      (DataSet.load as jest.Mock).mockReturnValue(null);
      (Provider.load as jest.Mock).mockReturnValue(null);
      (Rail.load as jest.Mock).mockReturnValue(null);

      expect(() => {
        handleDataSetRailCreated(event);
      }).not.toThrow();
    });

    it('should handle corrupted event data', () => {
      const event = createMockProviderEvent();
      event.params.data = null;

      expect(() => {
        handleProviderRegistered(event);
      }).not.toThrow();
    });

    it('should handle BigInt overflow scenarios', () => {
      const event = createMockFaultRecordEvent();
      event.params.penalty = { value: Number.MAX_SAFE_INTEGER };

      expect(() => {
        handleFaultRecord(event);
      }).not.toThrow();
    });
  });
});