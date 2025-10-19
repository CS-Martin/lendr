# Custom NFT Factory Test Suite

This comprehensive test suite validates the entire Custom NFT Factory system with 65 passing tests across multiple categories.

## Test Structure

### 📁 Unit Tests (`test/unit/`)

- **CustomNFTCollectionTest.sol** (14 tests)

  - Constructor validation
  - Minting functionality with attributes
  - ERC4907 rental features
  - Access control (minter roles)
  - Supply limits and sequential IDs
  - Interface support verification

- **CustomNFTFactoryTest.sol** (13 tests)
  - Factory deployment and initialization
  - Creator authorization/revocation
  - Collection creation (fixed/unlimited supply)
  - Registry management
  - Access control validation

### 📁 Functional Tests (`test/functional/`)

- **MintingWorkflowTest.sol** (6 tests)

  - Complete whitelist minting workflow
  - Attribute encoding in metadata
  - Supply enforcement
  - Multiple minters and recipients

- **RentalManagementTest.sol** (12 tests)
  - ERC4907 rental functionality
  - User assignment and expiration
  - Rental state management
  - Edge cases (past expiration, zero expiration)
  - Access control for rentals

### 📁 Integration Tests (`test/integration/`)

- **EndToEndWorkflowTest.sol** (3 tests)

  - Complete art gallery workflow
  - Complex attribute encoding edge cases
  - Max supply stress testing

- **MetadataValidationTest.sol** (11 tests)

  - JSON metadata structure
  - Special character escaping
  - Unicode and emoji support
  - Fallback value handling
  - Long attributes and many attributes

- **ExampleMintFlowTest.sol** (6 tests)
  - Game studio mint flow
  - Art gallery mint flow
  - Complex attribute encoding
  - Rental flow examples
  - Multi-collection registry

### 📁 Helpers (`test/helpers/`)

- **TestHelpers.sol**
  - Utility functions for creating test attributes
  - Mock contracts for testing edge cases
  - Common test data generators

## Key Test Coverage

### ✅ Core Functionality

- Factory deployment and creator authorization
- Collection creation with fixed/unlimited supply
- Whitelist-based minting with sequential IDs
- ERC4907 rental functionality
- JSON metadata generation with Base64 encoding

### ✅ Security & Access Control

- Role-based access control (admin, creator, minter roles)
- Unauthorized action prevention
- Reentrancy protection validation
- Supply limit enforcement

### ✅ Metadata & Encoding

- Complex attribute arrays with key/value pairs
- Special character escaping in JSON
- Unicode and emoji support
- Long text and many attributes handling
- Consistent metadata generation

### ✅ Edge Cases

- Empty attribute arrays
- Default value fallbacks
- Past expiration rentals
- Max supply reached scenarios
- Multiple collections and creators

## Running Tests

```bash
# Run all tests
forge test

# Run with verbose output
forge test -v

# Run specific test file
forge test --match-path test/unit/CustomNFTCollectionTest.sol

# Run specific test function
forge test --match-test test_Mint_BasicFlow
```

## Test Results Summary

- **Total Tests**: 65
- **Passed**: 65 ✅
- **Failed**: 0 ❌
- **Coverage**: Comprehensive coverage of all contract functionality

## Example Usage from Tests

### Creating a Collection

```solidity
address collectionAddr = factory.createCollection(
  "Gaming Assets",
  "GAME",
  "Collectible gaming assets",
  "ipfs://QmDefaultImage",
  true, // fixed supply
  10000 // max supply
);
```

### Minting with Attributes

```solidity
CustomNFTCollection.AttributeKV[] memory attributes = new CustomNFTCollection.AttributeKV[](3);
attributes[0] = CustomNFTCollection.AttributeKV({ key: "Type", value: "Weapon" });
attributes[1] = CustomNFTCollection.AttributeKV({ key: "Rarity", value: "Legendary" });
attributes[2] = CustomNFTCollection.AttributeKV({ key: "Power", value: "150" });

uint256 tokenId = collection.mint(
  recipient,
  "Legendary Sword",
  "A powerful weapon",
  "ipfs://QmSwordImage",
  attributes
);
```

### Setting Up Rentals

```solidity
uint64 expires = uint64(block.timestamp + 7 days);
collection.setUser(tokenId, renter, expires);
```

The test suite ensures robust, secure, and feature-complete NFT factory functionality with comprehensive validation of all user flows and edge cases.
