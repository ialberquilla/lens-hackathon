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
        // Request 3 storage keys: folder, image, and embeddings
        const storageKeys = await requestStorageKeys(3);
        const [folderKey, imageKey, embeddingsKey] = storageKeys;

        // Create form data for upload
        const formData = new FormData();

        // Add files with their storage keys as field names
        formData.append(
            imageKey.storage_key,
            imageFile,
            `type=${imageFile.type}`
        );

        // Add embeddings as JSON
        const embeddingsBlob = new Blob([JSON.stringify(embeddings)], { type: 'application/json' });
        formData.append(
            embeddingsKey.storage_key,
            embeddingsBlob,
            'type=application/json'
        );

        // Add ACL template if lens account address is provided
        if (lensAccountAddress) {
            const aclTemplate = {
                template: 'lens_account',
                lens_account: lensAccountAddress
            };
            formData.append(
                'lens-acl.json',
                new Blob([JSON.stringify(aclTemplate)], { type: 'application/json' }),
                'type=application/json'
            );
        }

        // Upload files to the folder
        await axios.post(
            `${API_BASE_URL}/${folderKey.storage_key}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        return {
            folderUrl: `https://storage-api.testnet.lens.dev/${folderKey.storage_key}`,
            imageUrl: `https://storage-api.testnet.lens.dev/${imageKey.storage_key}`,
            embeddingsUrl: `https://storage-api.testnet.lens.dev/${embeddingsKey.storage_key}`
        };
    } catch (error) {
        console.error('Error during upload process:', error);
        throw error;
    }
}

export { uploadToLensStorage };
export type { UploadResult }; 