import { ContractMessageManager } from './ContractMessageManager';
import { ContractEventListener } from './ContractEventListener'
import { startServer } from './api/server';
import { AppDataSource } from './db/data-source';
import { config } from 'dotenv';

config();

const ASSET_FACTORY_ADDRESS = process.env.ASSET_FACTORY_ADDRESS;
const RPC_URL = process.env.RPC_URL;

if (!ASSET_FACTORY_ADDRESS || !RPC_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const AssetFactoryABI = [
    "event AssetCreated(address indexed owner, address indexed assetAddress, string name, string symbol, uint256 price, address coinAddress, string baseURI)"
];

async function main() {
    try {
        // Initialize database connection first
        await AppDataSource.initialize();
        console.log('Database connection initialized');

        // Start the API server (without initializing DB again)
        await startServer();
        console.log('API server started');

        // Initialize the contract message manager (without initializing DB again)
        const messageManager = new ContractMessageManager();
        await messageManager.initialize(false); // Pass false to skip DB initialization

        const eventListener = new ContractEventListener({
            rpcUrl: RPC_URL as string,
            contractAddress: ASSET_FACTORY_ADDRESS as string,
            contractABI: AssetFactoryABI,
            eventName: 'AssetCreated'
        });

        // Start listening for events
        eventListener.startListening();

        // Handle process termination
        process.on('SIGINT', async () => {
            console.log('Received SIGINT. Cleaning up...');
            eventListener.stopListening();
            await messageManager.cleanup();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('Received SIGTERM. Cleaning up...');
            eventListener.stopListening();
            await messageManager.cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error in main:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Error in main:', error);
    process.exit(1);
});
