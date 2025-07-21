-include .env

build:; forge build

gas-estimate-sepolia:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} -vvvv

deploy-sepolia:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv

gas-estimate-mainnet:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} -vvvv

deploy-mainnet:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv

verify-contract-sepolia:
	forge verify-contract --chain sepolia ${AGREEMENT_ADDRESS} src/CollateralRentalAgreement.sol:CollateralRentalAgreement --constructor-args $$(cast abi-encode "constructor(address,address,uint256,uint256,uint256,uint256,uint8,uint8)" 0xfb7ba21de87ddfb172daaf163b3057214c2f25b8 0xd74b3e7ad1d375cd2bd419148c03c65e8985e4c1 0 10000000000000000 10000000000000000 5 0 2) -e ${ETHERSCAN_API_KEY}

deploy-anvil:
	forge create src/LendrRentalSystem.sol:LendrRentalSystem --private-key ${ANVIL_PRIVATE_KEY} --broadcast --constructor-args 500