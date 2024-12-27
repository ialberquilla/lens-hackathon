import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface StorageKey {
    storage_key: string;
    gateway_url: string;
    uri: string;
}

interface LensACLTemplate {
    template: 'lens_account';
    lens_account: string;
}

interface UploadConfig {
    files: {
        path: string;
        contentType: string;
    }[];
    lensAccountAddress?: string;
    includeIndex?: boolean;
}

const API_BASE_URL = 'https://storage-api.testnet.lens.dev';

async function requestStorageKeys(amount: number): Promise<StorageKey[]> {
    try {
        const response = await axios.post(`${API_BASE_URL}/link/new?amount=${amount}`);
        return response.data;
    } catch (error) {
        console.error('Error requesting storage keys:', error);
        throw error;
    }
}

function createLensACLTemplate(lensAccountAddress: string): LensACLTemplate {
    return {
        template: 'lens_account',
        lens_account: lensAccountAddress
    };
}

function createIndexJson(files: StorageKey[]): string {
    return JSON.stringify({
        files: files.map(file => ({
            uri: file.uri,
            gateway_url: file.gateway_url
        }))
    }, null, 2);
}

async function uploadFiles(config: UploadConfig): Promise<void> {
    try {
        // Request storage keys (number of files + 1 for folder + 1 for index if needed)
        const keysNeeded = config.files.length + 1 + (config.includeIndex ? 1 : 0);
        const storageKeys = await requestStorageKeys(keysNeeded);
        
        // The first key will be used for the folder
        const folderKey = storageKeys[0];
        const fileKeys = storageKeys.slice(1);
        
        // Create form data for upload
        const formData = new FormData();
        
        // Add files to form data
        config.files.forEach((file, index) => {
            formData.append(
                fileKeys[index].storage_key,
                fs.createReadStream(file.path),
                {
                    filename: path.basename(file.path),
                    contentType: file.contentType
                }
            );
        });
        
        // Add index.json if requested
        if (config.includeIndex) {
            const indexContent = createIndexJson(fileKeys);
            formData.append(
                fileKeys[fileKeys.length - 1].storage_key,
                indexContent,
                {
                    filename: 'index.json',
                    contentType: 'application/json'
                }
            );
        }
        
        // Add ACL template if lens account address is provided
        if (config.lensAccountAddress) {
            const aclTemplate = createLensACLTemplate(config.lensAccountAddress);
            formData.append(
                'lens-acl.json',
                JSON.stringify(aclTemplate),
                {
                    filename: 'lens-acl.json',
                    contentType: 'application/json'
                }
            );
        }
        
        // Upload files
        const uploadResponse = await axios.post(
            `${API_BASE_URL}/${folderKey.storage_key}`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
        
        console.log('Upload successful!');
        console.log('Folder URL:', folderKey.gateway_url);
        console.log('File URLs:', fileKeys.map(key => key.gateway_url));

        console.log(uploadResponse.data);
        
    } catch (error) {
        console.error('Error during upload process:', error);
        throw error;
    }
}

// Example usage
async function main() {
    const config: UploadConfig = {
        files: [
            {
                path: './files/input.json',
                contentType: 'application/json'
            },
            {
                path: './files/input2.json',
                contentType: 'application/json'
            }
        ],
        includeIndex: true // Optional
    };
    
    try {
        await uploadFiles(config);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

// Run the script
main();