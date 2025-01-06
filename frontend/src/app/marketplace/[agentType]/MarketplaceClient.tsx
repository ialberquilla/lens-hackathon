"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Image from 'next/image';

interface Asset {
  assetId: number;
  imageUrl: string;
  likes: number;
  description: string;
  price: number;
  contractAddress: string;
}

interface MarketplaceClientProps {
  agentType: string;
}

export default function MarketplaceClient({ agentType }: MarketplaceClientProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/assets/${agentType}`);
        if (!response.ok) throw new Error('Failed to fetch assets');
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [agentType]);

  const handleLike = (assetId: number) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.assetId === assetId
          ? { ...asset, likes: asset.likes + 1 }
          : asset
      )
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading assets...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => (
        <Card key={asset.assetId} className="overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={asset.imageUrl}
              alt={asset.description}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLike(asset.assetId)}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                <span>{asset.likes}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 