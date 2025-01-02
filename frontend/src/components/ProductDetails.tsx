"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Star, ChevronDown, Link as LinkIcon, FileJson } from 'lucide-react';
import Image from 'next/image';

interface ProductDetailsProps {
  imageUrl: string;
  price: string;
  analysis: string;
  folderUrl: string;
  embeddingsUrl: string;
  transactionHash: string;
}

interface AnalysisData {
  category: string;
  description: string;
  style: string;
  useCases: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  imageUrl, 
  price, 
  analysis,
  folderUrl,
  embeddingsUrl,
  transactionHash 
}) => {
  const [analysisData, setAnalysisData] = React.useState<AnalysisData>({
    category: '',
    description: '',
    style: '',
    useCases: ''
  });

  React.useEffect(() => {
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

  const aiAgents = [
    {
      name: 'Cartoon Collector Agent',
      description: 'Analyzing similarity to existing cartoon images',
      icon: Brain,
      status: 'Processing...',
      color: 'text-purple-500',
      details: [
        "Contemporary pop-art style detected with vibrant color palette",
        "Strong use of primary colors: yellow (60%), blue (30%)",
        "Playful character interpretation with dynamic pose",
        "High contrast elements enhance visual appeal",
        "Recommendation: Suitable for youth-oriented merchandise"
      ]
    },
    {
      name: 'Nature Collector Agent',
      description: 'Analyzing similarity to existing nature images',
      icon: Brain,
      status: 'Processing...',
      color: 'text-blue-500',
      details: [
        "Target demographic: 18-35 age group",
        "High potential for accessories and apparel",
        "Current market demand: Trending upward (23% YoY)",
        "Similar styles showing strong performance in urban markets",
        "Recommended pricing tier: Premium segment"
      ]
    },
  ];

  const [expandedAgents, setExpandedAgents] = React.useState(new Set<string>());

  const toggleAgent = (agentName: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentName)) {
        newSet.delete(agentName);
      } else {
        newSet.add(agentName);
      }
      return newSet;
    });
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="relative w-full h-96">
                <Image
                  src={imageUrl}
                  alt="Uploaded artwork"
                  fill
                  className="rounded-lg object-contain"
                  unoptimized // Since we're using blob URLs
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600 font-medium">Price:</span>
                <span className="text-xl font-bold">${price} GHO</span>
              </div>
              <div className="pt-4 border-t space-y-3">
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
            </CardContent>
          </Card>
        </div>

        {/* AI Agents Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">AI Analysis in Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {aiAgents.map((agent, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => toggleAgent(agent.name)}
                      className="w-full text-left p-4 flex items-start space-x-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-full bg-white shadow-sm ${agent.color}`}>
                        <agent.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <ChevronDown 
                            className={`w-5 h-5 transform transition-transform ${
                              expandedAgents.has(agent.name) ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        <p className="text-gray-600 mt-1">{agent.description}</p>
                        <div className="mt-2">
                          {agent.status === 'Processing...' ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
                              <span className="text-sm text-blue-500">{agent.status}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-green-500 flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>Complete</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {/* Collapsible Details Section */}
                    <div className={`
                      overflow-hidden transition-all duration-300
                      ${expandedAgents.has(agent.name) ? 'max-h-96' : 'max-h-0'}
                    `}>
                      <div className="p-4 bg-white border-t border-gray-100">
                        <ul className="space-y-2 text-gray-600">
                          {agent.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gemini Analysis Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">AI Image Analysis</CardTitle>
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
      </div>
    </div>
  );
};

export default ProductDetails; 