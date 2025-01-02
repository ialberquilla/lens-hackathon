import { ContractEvent, ContractMessageHandler } from './types';

export class ContractMessageManager implements ContractMessageHandler {
    private logger: Console;

    constructor() {
        this.logger = console;
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
                // Add more event handlers here
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
        this.logger.log('New Asset created:', {
            assetAddress,
            name,
            symbol,
            price: price.toString(),
            coinAddress,
            imageUrl,
            embeddingsUrl
        });
        
    }
} 