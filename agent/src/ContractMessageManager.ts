import { ContractEvent, ContractMessageHandler } from './types';
import { DatabaseManager } from './db/DatabaseManager';
import axios from 'axios';

export class ContractMessageManager implements ContractMessageHandler {
    private logger: Console;
    private dbManager: DatabaseManager;
    private agentType: string;

    constructor() {
        this.logger = console;
        this.agentType = process.env.AGENT_TYPE || 'cartoon';
        this.dbManager = new DatabaseManager(this.agentType);
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
        const [owner, assetAddress, name, symbol, price, coinAddress, baseURI] = event.args;
        this.logger.log('New Asset event received:', {
            owner,
            assetAddress,
            name,
            symbol,
            price: price.toString(),
            coinAddress,
            baseURI
        });

        try {
            // First, get the list of files
            const filesResponse = await axios.get(baseURI);
            const files = filesResponse.data.files;
            
            // Get the second file's gateway URL (index 1)
            const embeddingsUrl = files[1].gateway_url;
            
            // Fetch the actual embeddings
            const embeddingsResponse = await axios.get(embeddingsUrl);

            console.log({embeddingsResponse})

            const embeddings = embeddingsResponse.data[0]; // Get the first array of embeddings

            console.log({embeddings})

            const similarAssets = await this.dbManager.findSimilarAssets(embeddings, 0.25);

            if (similarAssets.length > 0) {
                this.logger.log('Warning: Similar assets found:', {
                    count: similarAssets.length,
                    assets: similarAssets.map(asset => ({
                        contractAddress: asset.contractAddress,
                        similarity: asset.similarity,
                        description: asset.description,
                        imageUrl: asset.imageUrl
                    })),
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

    public async testQuery(embeddings: any): Promise<void> {

        const similar = await this.dbManager.findSimilarAssets(embeddings)

        console.log({similar})

    }
} 