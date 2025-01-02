import { Provider } from 'zksync-ethers';
import { Contract } from 'zksync-ethers';
import { WebSocketProvider } from 'ethers';
import { ContractMessageManager } from './ContractMessageManager';
import { EventListenerConfig } from './types';

export class ContractEventListener {
    private rpcUrl: string;
    private provider: Provider | WebSocketProvider;
    private contract: Contract;
    private eventName: string;
    private messageManager: ContractMessageManager;
    private logger: Console;

    constructor(config: EventListenerConfig) {
        this.rpcUrl = config.rpcUrl;
        this.logger = console;

        // Use WebSocketProvider for WSS URLs, otherwise use zkSync Provider
        if (this.rpcUrl.startsWith('wss://')) {
            this.logger.log('Using WebSocket provider');
            this.provider = new WebSocketProvider(this.rpcUrl);
        } else {
            this.logger.log('Using HTTP provider');
            this.provider = new Provider(this.rpcUrl);
        }

        this.contract = new Contract(
            config.contractAddress,
            config.contractABI,
            this.provider
        );
        this.eventName = config.eventName;
        this.messageManager = new ContractMessageManager();
    }

    public startListening(): void {
        this.logger.log(`Starting to listen for ${this.eventName} events...`);

        this.contract.on(this.eventName, (...args) => {
            const event = args[args.length - 1];
            this.logger.log(`New ${this.eventName} event detected:`, {
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                args: args.slice(0, -1)
            });

            // Handle the event using ContractMessageManager
            this.messageManager.handleContractEvent({
                eventName: this.eventName,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                args: args
            }).catch(error => {
                this.logger.error('Error handling contract event:', error);
            });
        });

        // Handle provider errors
        this.provider.on('error', (error: Error) => {
            this.logger.error('Provider Error:', error);
            this.reconnect();
        });
    }

    public stopListening(): void {
        this.logger.log('Stopping event listener...');
        this.contract.removeAllListeners(this.eventName);
        this.provider.removeAllListeners();
    }

    private async reconnect(): Promise<void> {
        this.logger.log('Attempting to reconnect...');
        try {
            // Recreate the appropriate provider type
            if (this.rpcUrl.startsWith('wss://')) {
                this.provider = new WebSocketProvider(this.rpcUrl);
            } else {
                this.provider = new Provider(this.rpcUrl);
            }

            this.contract = new Contract(
                this.contract.target as string,
                this.contract.interface.fragments,
                this.provider
            );
            this.startListening();
            this.logger.log('Successfully reconnected');
        } catch (error) {
            this.logger.error('Reconnection failed:', error);
            setTimeout(() => this.reconnect(), 5000);
        }
    }
} 