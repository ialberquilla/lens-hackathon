import { ContractEvent, ContractMessageHandler } from './types';
import { DatabaseManager } from './db/DatabaseManager';
import axios from 'axios';

export class ContractMessageManager implements ContractMessageHandler {
    private logger: Console;
    private dbManager: DatabaseManager;

    constructor() {
        this.logger = console;
        this.dbManager = new DatabaseManager();
    }

    public async initialize(): Promise<void> {
        await this.dbManager.initialize();
    }

    public async handleContractEvent(event: ContractEvent): Promise<void> {
        this.logger.log('Processing contract event:', {
            eventName: event.eventName,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            args: event.args
        });

        try {
            switch (event.eventName) {
                case 'AssetCreated':
                    await this.handleAssetCreated(event);
                    break;
                default:
                    this.logger.warn(`No handler implemented for event: ${event.eventName}`);
            }
        } catch (error) {
            this.logger.error('Error handling contract event:', error);
            throw error;
        }
    }

    private async handleAssetCreated(event: ContractEvent): Promise<void> {
        const [assetAddress, name, symbol, price, coinAddress, imageUrl, embeddingsUrl] = event.args;
        this.logger.log('New Asset event received:', {
            assetAddress,
            name,
            symbol,
            price: price.toString(),
            coinAddress,
            imageUrl,
            embeddingsUrl
        });

        try {
            const embeddingsResponse = await axios.get(embeddingsUrl);
            const embeddings = embeddingsResponse.data;

            const similarAssets = await this.dbManager.findSimilarAssets(embeddings, 0.25);

            if (similarAssets.length > 0) {
                this.logger.log('Warning: Similar assets found:', {
                    count: similarAssets.length,
                    assets: similarAssets.map(asset => ({
                        contractAddress: asset.contractAddress,
                        similarity: asset.similarity,
                        description: asset.description,
                        imageUrl: asset.imageUrl
                    }))
                });
                
            } else {
                this.logger.log('No similar assets found, proceeding with creation');
                
            }
        } catch (error) {
            this.logger.error('Error processing asset:', error);
            throw error;
        }
    }

    public async cleanup(): Promise<void> {
        await this.dbManager.disconnect();
    }
} 