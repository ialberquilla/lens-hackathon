"use client"

import React, { useState } from 'react';
import { Upload, Check, FileImage } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductDetails from '@/components/ProductDetails';
import Image from 'next/image';
import { ConnectKitButton } from "connectkit";
import { analyzeImage } from '@/lib/gemini';
import { generateEmbeddings } from '@/lib/embeddings';
import { uploadToLensStorage, type UploadResult } from '@/lib/storage';

const ImageUpload = () => {
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, generating, ready
  const [error, setError] = useState('');
  const [price, setPrice] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [uploadedUrls, setUploadedUrls] = useState<UploadResult | null>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
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
      const uploadResult = await uploadToLensStorage(file, embeddingVector);
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
        return 'Generating embeddings...';
      case 'ready':
        return 'Image processed successfully!';
      default:
        return 'Upload a product image to get started';
    }
  };

  const handlePublish = () => {
    console.log('Publishing with price:', price);
    setShowAnalysis(true);
  };

  if (showAnalysis && preview && uploadedUrls) {
    return (
      <ProductDetails 
        imageUrl={uploadedUrls.imageUrl} 
        price={price} 
        analysis={analysis}
        folderUrl={uploadedUrls.folderUrl}
        embeddingsUrl={uploadedUrls.embeddingsUrl}
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
                    unoptimized // Since we're using blob URLs
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
                    onClick={handlePublish}
                    disabled={!price}
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Publish!
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