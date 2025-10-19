-include .env

build:; forge build

gas-estimate-sepolia:
	forge script script/DeployCustomNFT.s.sol:DeployCustomNFT --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} -vvvv --via-ir

deploy-sepolia:
	forge script script/DeployCustomNFT.s.sol:DeployCustomNFT --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv --via-ir
gas-estimate-mainnet:
	forge script script/DeployCustomNFT.s.sol:DeployCustomNFT --rpc-url ${MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} -vvvv --via-ir
deploy-polygon-amoy:
	forge script script/DeployCustomNFT.s.sol:DeployCustomNFT --rpc-url ${POLYGON_AMOY_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv --via-ir
deploy-mainnet:
	forge script script/DeployCustomNFT.s.sol:DeployCustomNFT --rpc-url ${MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY} -vvvv --via-ir

deploy-anvil:
	forge create src/CustomNFT.sol:CustomNFT --private-key ${ANVIL_PRIVATE_KEY} --broadcast --constructor-args 500

forge verify-contract \
--chain 80002 \
--watch \
--constructor-args $ARGS1 \
--etherscan-api-key $ETHERSCAN_API_KEY \  
--compiler-version v0.8.20 \
--num-of-optimizations 200 0xf8fD65e15ff00fBD8E1846460B109fDc6B35d9bC \
src/CustomNFTCollection.sol:CustomNFTCollection