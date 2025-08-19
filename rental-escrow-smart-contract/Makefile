-include .env

build:; forge build

gas-estimate-sepolia:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} -vvvv --via-ir

deploy-sepolia:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv --via-ir
gas-estimate-mainnet:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} -vvvv --via-ir

deploy-mainnet:
	forge script script/DeployLendrRentalSystem.s.sol:DeployLendrRentalSystem --rpc-url ${MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv --via-ir

deploy-anvil:
	forge create src/LendrRentalSystem.sol:LendrRentalSystem --private-key ${ANVIL_PRIVATE_KEY} --broadcast --constructor-args 500