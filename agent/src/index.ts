import { ContractEventListener } from './ContractEventListener';
import { config } from 'dotenv';

// Load environment variables
config();

const ASSET_FACTORY_ADDRESS = process.env.ASSET_FACTORY_ADDRESS;
const RPC_URL = process.env.RPC_URL;

if (!ASSET_FACTORY_ADDRESS || !RPC_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// AssetFactory ABI - you'll need to copy this from your contracts build
const AssetFactoryABI = [
    "event AssetCreated(address indexed assetAddress, string name, string symbol, uint256 price, address coinAddress, string imageUrl, string embeddingsUrl)"
];

const eventListener = new ContractEventListener({
    rpcUrl: RPC_URL,
    contractAddress: ASSET_FACTORY_ADDRESS,
    contractABI: AssetFactoryABI,
    eventName: 'AssetCreated'
});

// Start listening for events
eventListener.startListening();
