# Filecoin Services

Building comprehensive onchain programmable services that integrate with the Filecoin network for decentralized storage, featuring smart contract-based data management with cryptographic verification and integrated payment systems.

## ⚠️ IMPORTANT DISCLAIMER

**🚨 THE WARM STORAGE CONTRACT IS CURRENTLY UNDER ACTIVE DEVELOPMENT AND IS NOT READY FOR PRODUCTION USE 🚨**

**DO NOT USE IN PRODUCTION ENVIRONMENTS**

This software is provided for development, testing, and research purposes only. The smart contracts have not undergone comprehensive security audits and may contain bugs, vulnerabilities, or other issues that could result in loss of funds or data.

**Use at your own risk. The developers and contributors are not responsible for any losses or damages.**

## 🚀 Features

- **FilecoinWarmStorageService**: Comprehensive smart contract service combining PDP verification with payment rails
- **Cryptographic Data Verification**: PDP (Proof of Data Possession) verification system for data integrity
- **Integrated Payment System**: Built-in payment rails for storage providers and data set management
- **Provider Management**: Complete provider registration, approval, and fault tracking system
- **Real-time Indexing**: GraphQL-based subgraph for efficient data querying and monitoring
- **Rate Management**: Dynamic pricing and rate update mechanisms with lockup periods
- **Fault Detection**: Automated fault recording and provider reputation system
- **Multi-network Support**: Calibnet deployment with mainnet compatibility

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** - Smart contract development language
- **Foundry** - Ethereum development framework and testing suite
- **OpenZeppelin** - Security-focused smart contract libraries
- **OpenZeppelin Upgradeable** - Upgradeable contract patterns

### Indexing & Data Layer
- **The Graph Protocol** - Decentralized indexing protocol
- **GraphQL** - Query language for APIs and subgraph data access
- **TypeScript** - Type-safe subgraph development

### Development Tools
- **Foundry Toolchain** - Smart contract compilation, testing, and deployment
- **Make** - Build automation and task management
- **Git Submodules** - Dependency management for external libraries
- **Docker Compose** - Container orchestration for development environments

### External Dependencies
- **Filecoin Services Payments** - Payment infrastructure framework
- **PDP Verifiers** - Cryptographic proof of data possession verification
- **Forge Standard Library** - Foundry testing utilities

### CI/CD & Automation
- **GitHub Actions** - Automated workflows for testing and deployment
- **AWS Claude AI Integration** - AI-powered code review and generation
- **Makefile CI** - Automated build and test pipelines

## 📁 Project Structure

```
filecoin-services/
├── service_contracts/          # Smart contract implementation
│   ├── src/                   # Solidity source files
│   │   └── FilecoinWarmStorageService.sol
│   ├── test/                  # Contract tests and fixtures
│   ├── lib/                   # External dependencies (submodules)
│   │   ├── fws-payments/      # Payment system integration
│   │   ├── pdp/               # PDP verification library
│   │   └── openzeppelin-*/    # OpenZeppelin contracts
│   └── tools/                 # Deployment and utility scripts
├── subgraph/                  # The Graph Protocol indexing layer
│   ├── src/                   # TypeScript subgraph mappings
│   ├── abis/                  # Contract ABI definitions
│   ├── schema.graphql         # GraphQL schema definition
│   └── utils/                 # Utility functions and constants
└── .github/workflows/         # CI/CD automation workflows
```

## 🔧 Installation & Setup

### Prerequisites

- [Foundry](https://getfoundry.sh/) - Ethereum development toolchain
- [Node.js](https://nodejs.org/) (v16+ recommended) - For subgraph development
- [Git](https://git-scm.com/) - Version control with submodule support
- [Docker](https://docker.com/) - For local graph node development (optional)

### Installation Steps

1. **Clone the repository with submodules:**
```bash
git clone --recurse-submodules https://github.com/anisharma07/filecoin-services.git
cd filecoin-services
```

2. **Install smart contract dependencies:**
```bash
cd service_contracts
make install
```

3. **Build the smart contracts:**
```bash
make build
```

4. **Install subgraph dependencies:**
```bash
cd ../subgraph
npm install
```

## 🎯 Usage

### Smart Contract Development

**Build contracts:**
```bash
cd service_contracts
make build
```

**Run tests:**
```bash
make test
```

**Deploy to Calibnet (testnet):**
```bash
# Deploy complete warm storage service
./tools/deploy-all-warm-storage-calibnet.sh

# Deploy only implementation contract
./tools/deploy-warm-storage-implementation-only.sh
```

**Upgrade existing contract:**
```bash
./tools/upgrade-warm-storage-calibnet.sh
```

### Subgraph Development

**Generate types from schema:**
```bash
cd subgraph
npm run codegen
```

**Build subgraph:**
```bash
npm run build
```

**Deploy to local graph node:**
```bash
# Start local graph node
docker-compose up -d

# Deploy subgraph
npm run create-local
npm run deploy-local
```

### Testing & Verification

**Run comprehensive tests:**
```bash
cd service_contracts
make test

# Run tests with verbose output
forge test -vvv

# Run specific test file
forge test --match-contract FilecoinWarmStorageServiceTest
```

**Create test datasets:**
```bash
./tools/create_data_set_with_payments.sh
```

## 📱 Platform Support

- **Filecoin Calibration Network** (Testnet) - Primary deployment target
- **Filecoin Mainnet** - Production-ready deployment
- **Local Development** - Foundry Anvil and local graph node
- **The Graph Network** - Decentralized subgraph hosting

## 🧪 Testing

The project includes comprehensive testing infrastructure:

### Smart Contract Tests
- **Unit Tests**: Individual contract function testing
- **Integration Tests**: Multi-contract interaction testing
- **Signature Tests**: Cryptographic signature verification testing
- **External Fixtures**: Real-world data testing scenarios

### Test Execution
```bash
cd service_contracts

# Run all tests
make test

# Run with coverage
forge coverage

# Run gas usage analysis
forge test --gas-report
```

### Test Files
- `FilecoinWarmStorageService.t.sol` - Main contract testing
- `SignatureFixtureTest.t.sol` - Signature verification testing
- `external_signatures.json` - Test signature fixtures

## 🔄 Deployment

### Testnet Deployment (Calibnet)
```bash
cd service_contracts

# Full deployment with all dependencies
./tools/deploy-all-warm-storage-calibnet.sh

# Implementation-only deployment
./tools/deploy-warm-storage-implementation-only.sh
```

### Contract Upgrades
```bash
# Upgrade existing proxy contract
./tools/upgrade-warm-storage-calibnet.sh
```

### Subgraph Deployment
```bash
cd subgraph

# Deploy to The Graph hosted service
npm run deploy

# Deploy to decentralized network
npm run deploy-studio
```

## 📊 Performance & Optimization

### Smart Contract Optimizations
- **Gas Optimization**: Efficient storage patterns and function implementations
- **Upgradeable Patterns**: OpenZeppelin proxy pattern for contract upgrades
- **Batch Operations**: Optimized for multiple data set operations

### Subgraph Performance
- **Efficient Indexing**: Optimized event handling and entity relationships
- **Type Safety**: TypeScript implementation for reliable data processing
- **Caching Strategies**: Efficient data structure management with SumTree implementation

### Key Performance Features
- **Provider Fault Tracking**: Efficient reputation and fault recording system
- **Rate Management**: Gas-efficient rate updates with queuing mechanisms
- **Payment Rails**: Integrated payment processing with minimal overhead

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

**Smart Contract Development:**
- Follow Solidity style guide and security best practices
- Include comprehensive tests for all new functionality
- Use OpenZeppelin libraries for standard implementations
- Document all public functions with NatSpec comments

**Subgraph Development:**
- Maintain type safety with TypeScript
- Test all mapping functions thoroughly
- Update GraphQL schema for new entities
- Follow The Graph development best practices

**Code Quality:**
- All PRs require passing CI/CD checks
- Include appropriate documentation updates
- Follow existing code style and conventions
- Add tests for new features and bug fixes

## 📄 License

This project is licensed under the ISC License. See the [LICENSE.md](LICENSE.md) file for details.

**Note**: This software is currently under active development and not recommended for production use. Please review the important disclaimer above.

## 🙏 Acknowledgments

- **FilOzone Team** - For the foundational payment infrastructure and PDP verification systems
- **OpenZeppelin** - For secure and battle-tested smart contract libraries
- **The Graph Protocol** - For decentralized indexing infrastructure
- **Foundry Team** - For the excellent Ethereum development framework
- **Filecoin Foundation** - For supporting decentralized storage innovation

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs and request features](https://github.com/anisharma07/filecoin-services/issues)
- **Repository**: [anisharma07/filecoin-services](https://github.com/anisharma07/filecoin-services)
- **Documentation**: Check individual component README files for detailed documentation

### Quick Links
- [Smart Contract Documentation](./service_contracts/README.md)
- [Subgraph API Documentation](./subgraph/API.md)
- [Deployment Tools](./service_contracts/tools/README.md)
- [Changelog](./CHANGELOG.md)

---

**⚠️ Remember: This software is under active development. Always review the latest security considerations and test thoroughly before any deployment.**