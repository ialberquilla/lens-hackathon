import axios from 'axios';

interface UploadResult {
    folderUrl: string;
    imageUrl: string;
    embeddingsUrl: string;
}

const API_BASE_URL = 'https://storage-api.testnet.lens.dev';

async function requestStorageKeys(amount: number) {
    try {
        const response = await axios.post(`${API_BASE_URL}/link/new?amount=${amount}`);
        return response.data;
    } catch (error) {
        console.error('Error requesting storage keys:', error);
        throw error;
    }
}

async function uploadToLensStorage(
    imageFile: File,
    embeddings: number[],
    lensAccountAddress?: `0x${string}`
): Promise<UploadResult> {
    try {
        // Request storage keys (1 for folder + 1 for image + 1 for embeddings + 1 for index)
        const storageKeys = await requestStorageKeys(4);
        const [folderKey, imageKey, embeddingsKey, indexKey] = storageKeys;

        // Create form data for upload
        const formData = new FormData();

        // Add image file
        formData.append(imageKey.storage_key, imageFile, imageFile.name);

        // Add embeddings as JSON
        const embeddingsBlob = new Blob([JSON.stringify(embeddings)], { type: 'application/json' });
        formData.append(embeddingsKey.storage_key, embeddingsBlob, 'embeddings.json');

        // Add ACL template if lens account address is provided
        if (lensAccountAddress) {
            const aclTemplate = {
                template: 'lens_account',
                lens_account: lensAccountAddress
            };
            const aclBlob = new Blob([JSON.stringify(aclTemplate)], { type: 'application/json' });
            formData.append('lens-acl.json', aclBlob, 'lens-acl.json');
        }

        // Create index.json
        const indexContent = {
            files: [
                {
                    uri: imageKey.uri,
                    gateway_url: imageKey.gateway_url
                },
                {
                    uri: embeddingsKey.uri,
                    gateway_url: embeddingsKey.gateway_url
                }
            ]
        };

        // Add index.json using its storage key
        const indexBlob = new Blob([JSON.stringify(indexContent, null, 2)], { type: 'application/json' });
        formData.append(indexKey.storage_key, indexBlob, 'index.json');

        // Upload files to the folder
        await axios.post(
            `${API_BASE_URL}/${folderKey.storage_key}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log({
            folderUrl: folderKey.gateway_url,
            imageUrl: imageKey.gateway_url,
            embeddingsUrl: embeddingsKey.gateway_url
        })

        return {
            folderUrl: folderKey.gateway_url,
            imageUrl: imageKey.gateway_url,
            embeddingsUrl: embeddingsKey.gateway_url
        };
    } catch (error) {
        console.error('Error during upload process:', error);
        throw error;
    }
}

export { uploadToLensStorage };
export type { UploadResult }; 