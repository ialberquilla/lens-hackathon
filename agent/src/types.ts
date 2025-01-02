export interface ContractEvent {
    eventName: string;
    blockNumber: number;
    transactionHash: string;
    args: any[];
}

export interface EventListenerConfig {
    rpcUrl: string;
    contractAddress: string;
    contractABI: any[];
    eventName: string;
}

export interface ContractMessageHandler {
    handleContractEvent(event: ContractEvent): Promise<void>;
} 