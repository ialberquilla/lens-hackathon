"use client"

import React, { useState, useEffect } from 'react';
import { Upload, Check, FileImage } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductDetails from '@/components/ProductDetails';
import Image from 'next/image';
import { ConnectKitButton, useModal } from "connectkit";
import { useAccount, useChainId, useWriteContract, useSwitchChain, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { analyzeImage } from '@/lib/gemini';
import { generateEmbeddings } from '@/lib/embeddings';
import { uploadToLensStorage, type UploadResult } from '@/lib/storage';
import { WebSocketProvider, Contract, EventLog } from 'ethers';

const AssetFactoryABI = [{
  name: 'createAsset',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'name', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'price', type: 'uint256' },
    { name: 'coinAddress', type: 'address' },
    { name: 'baseURI', type: 'string' }
  ],
  outputs: [{ name: '', type: 'address' }]
}, {
  name: 'AssetCreated',
  type: 'event',
  inputs: [
    { name: 'owner', type: 'address', indexed: true },
    { name: 'assetAddress', type: 'address', indexed: true },
    { name: 'name', type: 'string', indexed: false },
    { name: 'symbol', type: 'string', indexed: false },
    { name: 'price', type: 'uint256', indexed: false },
    { name: 'coinAddress', type: 'address', indexed: false },
    { name: 'baseURI', type: 'string', indexed: false }
  ]
}] as const;

const ASSET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_ASSET_FACTORY_ADDRESS as `0x${string}`;
const GHO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GHO_TOKEN_ADDRESS as `0x${string}`;

// Lens Network configuration
const LENS_NETWORK = {
  id: 37111,
  name: 'Lens Network Sepolia Testnet',
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.lens.dev'],
    },
    public: {
      http: ['https://rpc.testnet.lens.dev'],
    },
  },
  blockExplorerUrls: ['https://block-explorer.testnet.lens.dev'],
  nativeCurrency: {
    name: 'GRASS',
    symbol: 'GRASS',
    decimals: 18
  }
};

const ImageUpload = () => {
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [price, setPrice] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [uploadedUrls, setUploadedUrls] = useState<UploadResult | null>(null);
  const [transactionHash, setTransactionHash] = useState<string>('');
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { setOpen: openConnectModal } = useModal();
  const { data: grassBalance } = useBalance({
    address,
    chainId: LENS_NETWORK.id
  });

  // Contract interaction hooks
  const { writeContract, status: writeStatus, isPending, data: hash } = useWriteContract();
  const isLoading = writeStatus === 'pending';

  useEffect(() => {
    if (hash) {
      console.log('hash', hash);
      setTransactionHash(hash);
      setShowAnalysis(true);
    }
  }, [hash]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setPreview(URL.createObjectURL(file));
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setStatus('uploading');
      if (!file) {
        setError('No image file selected');
        return;
      }

      const analysis = await analyzeImage(file);
      setAnalysis(analysis);
      
      setStatus('generating');
      const embeddingVector = await generateEmbeddings(analysis);

      // Upload to Lens storage
      const uploadResult = await uploadToLensStorage(file, embeddingVector, address);
      setUploadedUrls(uploadResult);
      
      setStatus('ready');
    } catch (error) {
      setError('An error occurred while processing your image');
      setStatus('idle');
      console.error('Error during image processing:', error);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Analyzing image...';
      case 'generating':
        return 'Generating embeddings... (this may take a few minutes)';
      case 'ready':
        return 'Image processed successfully!';
      default:
        return 'Upload a product image to get started';
    }
  };

  const handlePublish = async () => {
    if (!uploadedUrls || !price) return;

    try {
      setError('');

      // Check wallet connection
      if (!isConnected) {
        openConnectModal(true);
        return;
      }

      // Check network
      if (!chainId) {
        setError('Unable to detect network. Please check your wallet connection.');
        return;
      }

      if (chainId !== LENS_NETWORK.id) {
        try {
          await switchChainAsync({ chainId: LENS_NETWORK.id });
        } catch (error: any) {
          // If the network doesn't exist in the wallet
          if (error.code === 4902) {
            setError(
              'Lens Network not found in your wallet. Please add it manually:\n' +
              'Network Name: Lens Network Sepolia Testnet\n' +
              'RPC URL: https://rpc.testnet.lens.dev\n' +
              'Chain ID: 37111'
            );
            return;
          }
          setError('Failed to switch network. Please switch to Lens Network manually.');
          return;
        }
      }

      // Check GRASS balance
      if (!grassBalance || grassBalance.value === BigInt(0)) {
        setError(
          'You need GRASS tokens to publish on Lens Network. ' +
          'Get tokens from the faucet: https://testnet.lenscan.io/faucet'
        );
        return;
      }

      // Create asset using the contract
      writeContract({
        abi: AssetFactoryABI,
        address: ASSET_FACTORY_ADDRESS,
        functionName: 'createAsset',
        args: [
          'AI Art NFT', // name
          'AINFT', // symbol
          parseEther(price), // price in wei
          GHO_TOKEN_ADDRESS, // GHO token address
          uploadedUrls.folderUrl, // baseURI
        ],
      });
    } catch (error) {
      console.error('Error creating asset:', error);
      setError('Failed to create asset. Please try again.');
    }
  };

  if (showAnalysis && preview && uploadedUrls) {
    return (
      <ProductDetails 
        imageUrl={uploadedUrls.imageUrl} 
        price={price} 
        analysis={analysis}
        folderUrl={uploadedUrls.folderUrl}
        embeddingsUrl={uploadedUrls.embeddingsUrl}
        transactionHash={transactionHash}
      />
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ConnectKitButton />
      </div>
      <div className="w-full max-w-md mx-auto pt-12 space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold text-gray-900">Transform Your Art into Products</h2>
          <p className="text-xl text-gray-600">Upload your artwork and start earning in minutes</p>
        </div>
        <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-8">
            <div className="space-y-6">
              {!preview ? (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={status !== 'idle'}
                  />
                </label>
              ) : (
                <div className="relative h-96">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex items-center justify-center space-x-2">
                {status !== 'idle' && (
                  <div className="flex items-center space-x-2">
                    {status === 'ready' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
                    )}
                    <span className="text-sm text-gray-600">{getStatusMessage()}</span>
                  </div>
                )}
              </div>

              {status === 'ready' && (
                <div className="space-y-4">
                  {analysis && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">AI Analysis</h3>
                      <p className="text-sm text-gray-600">{analysis}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <Label htmlFor="price" className="text-sm font-medium">Set Your Price</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$GHO</span>
                      </div>
                      <Input
                        type="text"
                        name="price"
                        id="price"
                        className="pl-16 pr-4"
                        placeholder="0.00"
                        value={price}
                        onChange={handlePriceChange}
                        pattern="^\d*\.?\d{0,2}$"
                      />
                    </div>
                    <p className="text-sm text-gray-500">Set the price in $GHO tokens</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-black text-white hover:bg-black/90"
                    onClick={(e) => !isConnected ? openConnectModal(true) : handlePublish()}
                    disabled={!price || isPending || isLoading}
                  >
                    {isPending || isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                        {isPending ? 'Confirm in Wallet...' : 'Creating...'}
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet'
                    ) : chainId !== LENS_NETWORK.id ? (
                      'Switch to Lens Network'
                    ) : (
                      <>
                        <FileImage className="w-4 h-4 mr-2" />
                        Publish!
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

export default ImageUpload;