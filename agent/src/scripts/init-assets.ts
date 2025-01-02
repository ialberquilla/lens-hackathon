import { AppDataSource } from '../db/data-source';
import { Asset } from '../db/entities/Asset';
import { cartoonAssets } from '../mock/cartoon-assets';
import axios from 'axios';
import { config } from 'dotenv';

config();

const EMBEDDINGS_API = process.env.EMBEDDINGS_API || 'http://localhost:3001';

async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    console.log('Generating embeddings for:', text.substring(0, 100) + '...');
    
    const response = await axios.post(`${EMBEDDINGS_API}/api/embeddings`, { text });

    if (!response.data.embeddings || !Array.isArray(response.data.embeddings)) {
      throw new Error('Invalid embedding format in response');
    }

    return response.data.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

async function initializeAssets() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    const assetRepository = AppDataSource.getRepository(Asset);
    
    console.log('Starting asset initialization...');

    for (const asset of cartoonAssets) {
      // Check if asset already exists
      const existingAsset = await assetRepository.findOne({
        where: { assetId: asset.assetId }
      });

      if (!existingAsset) {
        console.log(`Processing new asset ID: ${asset.assetId}`);
        
        // Generate embeddings for the entire description
        const embeddings = await generateEmbeddings(asset.description);
        
        // Create new asset in DB
        const newAsset = assetRepository.create({
          assetId: asset.assetId,
          price: asset.price,
          description: asset.description,
          likes: asset.likes,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
          contractAddress: asset.contractAddress,
          imageUrl: asset.imageUrl,
          embeddingsUrl: asset.embeddingsUrl,
          embeddings: embeddings 
        });
        
        await assetRepository.save(newAsset);
        console.log(`Created asset ID: ${asset.assetId} with embeddings`);
      } else {
        console.log(`Asset ID: ${asset.assetId} already exists, skipping`);
      }
    }

    console.log('Asset initialization completed successfully');
  } catch (error) {
    console.error('Error during asset initialization:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the initialization
initializeAssets()
  .catch((error) => {
    console.error('Failed to initialize assets:', error);
    process.exit(1);
  }); 