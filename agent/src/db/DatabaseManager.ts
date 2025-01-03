import { AppDataSource } from "./data-source";
import { Asset } from "./entities/Asset";
import "reflect-metadata";

export class DatabaseManager {
    private agentType: string;

    constructor(agentType: string) {
        this.agentType = agentType;
    }

    public async initialize(): Promise<void> {
        try {
            await AppDataSource.initialize();
            console.log("Database connection initialized");
        } catch (error) {
            console.error("Error initializing database connection:", error);
            throw error;
        }
    }

    public async createAsset(
        contractAddress: string,
        price: number,
        description: string,
        embeddings: number[],
        imageUrl: string,
        embeddingsUrl: string
    ): Promise<Asset> {
        const asset = new Asset();
        asset.contractAddress = contractAddress;
        asset.price = price;
        asset.description = description;
        asset.embeddings = embeddings;
        asset.imageUrl = imageUrl;
        asset.embeddingsUrl = embeddingsUrl;
        asset.agentType = this.agentType;

        return await AppDataSource.manager.save(asset);
    }

    public async findAssetByContractAddress(contractAddress: string): Promise<Asset | null> {
        return await AppDataSource.manager.findOne(Asset, {
            where: { contractAddress, agentType: this.agentType }
        });
    }

    public async updateLikes(assetId: number, likes: number): Promise<void> {
        await AppDataSource.manager.update(Asset, assetId, { likes });
    }

    public async findSimilarAssets(embeddings: number[], similarityThreshold: number = 0.25): Promise<Asset[]> {
        const result = await AppDataSource.query(
            `SELECT a.*, 
                1 - (embeddings <=> $1::vector(1024)) as similarity
             FROM asset a
             WHERE a.agent_type = $2
             AND 1 - (embeddings <=> $1::vector(1024)) > $3
             ORDER BY similarity DESC`,
            [`[${embeddings.join(',')}]`, this.agentType, similarityThreshold]
        );
        return result;
    }

    public async findSimilarAssetsForNewAsset(
        contractAddress: string,
        embeddings: number[],
        similarityThreshold: number = 0.25
    ): Promise<Asset[]> {
        const result = await AppDataSource.query(
            `SELECT a.*, 
                1 - (embeddings <=> $1::vector(1024)) as similarity
             FROM asset a
             WHERE a.agent_type = $2
             AND a.contract_address != $3
             AND 1 - (embeddings <=> $1::vector(1024)) > $4
             ORDER BY similarity DESC`,
            [`[${embeddings.join(',')}]`, this.agentType, contractAddress, similarityThreshold]
        );
        return result;
    }

    public async disconnect(): Promise<void> {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("Database connection closed");
        }
    }
} 