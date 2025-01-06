import React from 'react';
import MarketplaceClient from './MarketplaceClient';

export function generateStaticParams() {
  return [
    { agentType: 'cartoon' },
    { agentType: 'nature' },
  ];
}

interface PageProps {
  params: {
    agentType: 'cartoon' | 'nature';
  };
}

export default function Page({ params }: PageProps) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {params.agentType} Marketplace
      </h1>
      
      <MarketplaceClient agentType={params.agentType} />
    </div>
  );
} 