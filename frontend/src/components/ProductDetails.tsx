"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Star, ChevronDown, Link as LinkIcon, FileJson, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductDetailsProps {
  imageUrl: string;
  name: string;
  description: string;
  analysis: string;
  transactionHash: string;
  folderUrl: string;
  embeddingsUrl: string;
}

interface AnalysisData {
  category: string;
  description: string;
  style: string;
  useCases: string;
}

interface AgentAnalysis {
  status: 'PENDING' | 'ANALYZED' | 'PURCHASED' | 'ERROR';
  decision?: boolean;
  feedback?: string;
  errorMessage?: string;
  transactionMint?: string;
}

interface AgentStatus {
  cartoon: AgentAnalysis | null;
  nature: AgentAnalysis | null;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  imageUrl,
  name,
  description,
  analysis,
  transactionHash,
  folderUrl,
  embeddingsUrl
}) => {
  const [processing, setProcessing] = useState(true);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    cartoon: { status: 'PENDING' },
    nature: { status: 'PENDING' }
  });

  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    category: '',
    description: '',
    style: '',
    useCases: ''
  });

  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({
    cartoon: true,
    nature: true
  });

  const toggleAgentExpand = (agentType: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentType]: !prev[agentType]
    }));
  };

  useEffect(() => {
    if (analysis) {
      const sections = analysis.split('\n\n');
      const data: Partial<AnalysisData> = {};
      
      sections.forEach(section => {
        const [title, content] = section.split(': ');
        if (content) {
          switch (title.toLowerCase()) {
            case 'category':
              data.category = content.trim();
              break;
            case 'description':
              data.description = content.trim();
              break;
            case 'style':
              data.style = content.trim();
              break;
            case 'use cases':
              data.useCases = content.trim();
              break;
          }
        }
      });

      setAnalysisData(data as AnalysisData);
    }
  }, [analysis]);

  useEffect(() => {
    if (!transactionHash) return;

    const pollAgentStatus = async () => {
      try {
        const encodedHash = encodeURIComponent(transactionHash);
        console.log('Polling status for:', encodedHash);
        
        const [cartoonRes, natureRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_AGENT_CARTON_API_URL}/api/status/${encodedHash}?agentType=cartoon`),
          fetch(`${process.env.NEXT_PUBLIC_AGENT_NATURE_API_URL}/api/status/${encodedHash}?agentType=nature`)
        ]);

        const cartoonData = await cartoonRes.json();
        const natureData = await natureRes.json();

        console.log('Cartoon response:', cartoonData);
        console.log('Nature response:', natureData);

        setAgentStatus(prev => ({
          cartoon: cartoonData.error 
            ? { status: 'ERROR', errorMessage: cartoonData.error }
            : cartoonData,
          nature: natureData.error 
            ? { status: 'ERROR', errorMessage: natureData.error }
            : natureData
        }));

        // Check if both agents have finished processing
        const isComplete = 
          ((cartoonData.status === 'ANALYZED' && !cartoonData.decision) || cartoonData.status === 'PURCHASED' || cartoonData.status === 'ERROR') &&
          ((natureData.status === 'ANALYZED' && !natureData.decision) || natureData.status === 'PURCHASED' || natureData.status === 'ERROR');

        if (!isComplete) {
          setTimeout(pollAgentStatus, 5000);
        }
      } catch (error) {
        console.error('Error polling agent status:', error);
        setAgentStatus(prev => ({
          cartoon: { status: 'ERROR', errorMessage: 'Failed to fetch agent status' },
          nature: { status: 'ERROR', errorMessage: 'Failed to fetch agent status' }
        }));
        setTimeout(pollAgentStatus, 5000);
      }
    };

    // Initialize with PENDING status
    setAgentStatus({
      cartoon: { status: 'PENDING' },
      nature: { status: 'PENDING' }
    });

    // Start polling after 5 seconds delay
    const initialPollTimeout = setTimeout(pollAgentStatus, 5000);

    // Cleanup function
    return () => {
      clearTimeout(initialPollTimeout);
      setAgentStatus({
        cartoon: { status: 'PENDING' },
        nature: { status: 'PENDING' }
      });
    };
  }, [transactionHash]);

  const aiAgents = [
    {
      name: 'Cartoon Collector Agent',
      description: 'Analyzing similarity to existing cartoon images',
      icon: Brain,
      color: 'text-purple-500',
      type: 'cartoon'
    },
    {
      name: 'Nature Collector Agent',
      description: 'Analyzing similarity to existing nature images',
      icon: Brain,
      color: 'text-blue-500',
      type: 'nature'
    },
  ];

  return (
    <div className="grid gap-6 p-8">
      {/* Asset Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Image
                src={imageUrl}
                alt={name}
                width={400}
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-gray-500 mt-2">{description}</p>
              </div>

              {/* Asset Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Asset Links</h3>
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>View Original Image</span>
                </a>
                <a 
                  href={embeddingsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FileJson className="w-4 h-4" />
                  <span>View Embeddings Data</span>
                </a>
                <a 
                  href={folderUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>View Asset Folder</span>
                </a>
              </div>

              {/* Agent Analysis Cards */}
              <div className="space-y-4">
                {aiAgents.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleAgentExpand(agent.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full bg-white shadow-sm ${agent.color}`}>
                            <agent.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-gray-500">{agent.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/marketplace/${agent.type}`}
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Store className="w-4 h-4" />
                            <span>View Marketplace</span>
                          </Link>
                          {!agentStatus[agent.type] || agentStatus[agent.type]?.status === 'PENDING' ? (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 border border-blue-600">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              <span>Processing...</span>
                            </div>
                          ) : agentStatus[agent.type]?.status === 'ANALYZED' ? (
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              agentStatus[agent.type]?.decision 
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-800' 
                              : 'bg-red-100 text-red-800 border border-red-800'
                            }`}>
                              {agentStatus[agent.type]?.decision ? 'Will Buy' : 'Will Not Buy'}
                            </div>
                          ) : agentStatus[agent.type]?.status === 'PURCHASED' ? (
                            <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-800">
                              Purchased
                            </div>
                          ) : null}
                          <ChevronDown 
                            className={`w-5 h-5 transition-transform ${
                              expandedAgents[agent.type] ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    {expandedAgents[agent.type] && (
                      <CardContent>
                        <div className="mt-4">
                          {(agentStatus[agent.type as keyof AgentStatus]?.status === 'ANALYZED' || 
                            agentStatus[agent.type as keyof AgentStatus]?.status === 'PURCHASED') && (
                            <div className="space-y-2">
                              <div className="font-medium">
                                Decision: {
                                  agentStatus[agent.type as keyof AgentStatus]?.status === 'PURCHASED' 
                                    ? 'Purchased' 
                                    : agentStatus[agent.type as keyof AgentStatus]?.decision 
                                      ? 'Will buy' 
                                      : 'Will not buy'
                                }
                              </div>
                              {agentStatus[agent.type as keyof AgentStatus]?.feedback && (
                                <div className="text-sm text-gray-600">
                                  {agentStatus[agent.type as keyof AgentStatus]?.feedback}
                                </div>
                              )}
                              {(agentStatus[agent.type as keyof AgentStatus]?.status === 'PURCHASED' && 
                                agentStatus[agent.type as keyof AgentStatus]?.transactionMint) && (
                                <a 
                                  href={`https://block-explorer.testnet.lens.dev/tx/${agentStatus[agent.type as keyof AgentStatus]?.transactionMint}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>View Transaction</span>
                                </a>
                              )}
                              {agentStatus[agent.type as keyof AgentStatus]?.status === 'ANALYZED' && 
                               agentStatus[agent.type as keyof AgentStatus]?.decision && (
                                <div className="flex items-center space-x-2 px-3 py-1 text-sm bg-yellow-50 text-yellow-800">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                  <span>Processing purchase...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {agentStatus[agent.type]?.status === 'ERROR' && (
                          <div className="text-red-600">
                            <p>Error: {agentStatus[agent.type]?.errorMessage}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initial Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle>Initial Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Category</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{analysisData.category}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Style</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{analysisData.style}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{analysisData.description}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Potential Use Cases</h3>
              <ul className="list-disc list-inside text-gray-700 bg-gray-50 p-3 rounded-lg">
                {analysisData.useCases.split(',').map((useCase, index) => (
                  <li key={index} className="mb-1">{useCase.trim()}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails; 