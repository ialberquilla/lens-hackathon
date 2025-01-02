import { AppDataSource } from "./data-source";
import { Asset } from "./entities/Asset";
import "reflect-metadata";

export class DatabaseManager {
    constructor() {}

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

        return await AppDataSource.manager.save(asset);
    }

    public async findAssetByContractAddress(contractAddress: string): Promise<Asset | null> {
        return await AppDataSource.manager.findOne(Asset, {
            where: { contractAddress }
        });
    }

    public async updateLikes(assetId: number, likes: number): Promise<void> {
        await AppDataSource.manager.update(Asset, assetId, { likes });
    }

    public async findSimilarAssets(embeddings: number[], similarityThreshold: number = 0.25): Promise<Asset[]> {

        const result = await AppDataSource.query(
            `SELECT a.*, 
                    1 - (a.embeddings <=> $1::vector) as similarity
             FROM asset a
             WHERE 1 - (a.embeddings <=> $1::vector) > $2
             ORDER BY similarity DESC`,
            [embeddings, similarityThreshold]
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
                    1 - (a.embeddings <=> $1::vector) as similarity
             FROM asset a
             WHERE a.contract_address != $2
             AND 1 - (a.embeddings <=> $1::vector) > $3
             ORDER BY similarity DESC`,
            [embeddings, contractAddress, similarityThreshold]
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