import { ContractEvent, ContractMessageHandler } from './types';
import { DatabaseManager } from './db/DatabaseManager';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export class ContractMessageManager implements ContractMessageHandler {
    private logger: Console;
    private dbManager: DatabaseManager;
    private agentType: string;
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.logger = console;
        this.agentType = process.env.AGENT_TYPE || 'cartoon';
        this.dbManager = new DatabaseManager(this.agentType);
        
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }
        this.genAI = new GoogleGenerativeAI(API_KEY);
    }

    public async initialize(): Promise<void> {
        await this.dbManager.initialize();
    }

    private async analyzeSimilarAssets(
        newAssetPrice: string,
        similarAssets: any[],
    ): Promise<{ shouldBuy: boolean; feedback: string }> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
        As a ${this.agentType} specialized agent, you are evaluating a new asset based on similarity matches in the portfolio.
        IMPORTANT: Similarity above 70% indicates strong style/quality match and is a positive signal for purchase.

        New Asset:
        - Price: ${newAssetPrice} ETH
        
        Similar Assets Found:
        ${similarAssets.map(asset => `
        - Similarity: ${(asset.similarity * 100).toFixed(2)}%
        - Price: ${asset.price} ETH
        `).join('\n')}
        
        Evaluation criteria:
        1. Similarity should be >70% with at least one asset to recommend purchase
        2. Price should be within ±30% range of similar assets' average
        3. Multiple high-similarity matches strengthen the buy recommendation
        
        Provide feedback in this format:
        
        Decision: [YES/NO]
        
        Feedback: Explain:
        1. What the similarity matches suggest about the new asset
        2. If it would maintain portfolio cohesion
        3. Price analysis compared to similar items
        `;
        
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse the response
            const decisionMatch = text.match(/Decision:\s*(YES|NO)/i);
            const reasoningMatch = text.match(/Reasoning:\s*(.*)/s);

            const shouldBuy = decisionMatch?.[1].toUpperCase() === 'YES';
            const feedback = reasoningMatch?.[1].trim() || text;

            return { shouldBuy, feedback };
        } catch (error) {
            this.logger.error('Error analyzing with Gemini:', error);
            throw error;
        }
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
            const embeddings = embeddingsResponse.data[0];

            const similarAssets = await this.dbManager.findSimilarAssets(embeddings, 0.25);

            if (similarAssets.length > 0) {
                this.logger.log('Similar assets found:', {
                    count: similarAssets.length,
                    assets: similarAssets.map(asset => ({
                        contractAddress: asset.contractAddress,
                        similarity: asset.similarity,
                        description: asset.description,
                        imageUrl: asset.imageUrl
                    }))
                });

                const priceInEth = (Number(price.toString()) / 1e18).toFixed(6);

                const analysis = await this.analyzeSimilarAssets(
                    priceInEth,
                    similarAssets,
                );

                this.logger.log('LLM Analysis Result:', {
                    shouldBuy: analysis.shouldBuy,
                    feedback: analysis.feedback
                });

                if (analysis.shouldBuy) {
                    this.logger.log('Decision: Will buy asset', {
                        assetAddress,
                        reason: analysis.feedback
                    });
                } else {
                    this.logger.log('Decision: Will not buy asset', {
                        assetAddress,
                        reason: analysis.feedback
                    });
                }
                
            } else {
                this.logger.log('No similar assets found');
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
        const similar = await this.dbManager.findSimilarAssets(embeddings);
        console.log({similar});
    }
} 