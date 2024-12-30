"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Star, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface ProductDetailsProps {
  imageUrl: string;
  price: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ imageUrl, price }) => {
  const aiAgents = [
    {
      name: 'Style Analyzer',
      description: 'Analyzing artistic style and composition elements',
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
      name: 'Market Trends',
      description: 'Evaluating market potential and target audience',
      icon: Star,
      status: 'Complete',
      color: 'text-blue-500',
      details: [
        "Target demographic: 18-35 age group",
        "High potential for accessories and apparel",
        "Current market demand: Trending upward (23% YoY)",
        "Similar styles showing strong performance in urban markets",
        "Recommended pricing tier: Premium segment"
      ]
    },
    {
      name: 'Quality Check',
      description: 'Verifying image quality and resolution',
      icon: Star,
      status: 'Complete',
      color: 'text-yellow-500',
      details: [
        "Resolution: 2400x3200px - Suitable for large prints",
        "Color space: sRGB - Optimal for digital products",
        "No artifacts or compression issues detected",
        "Clean edges and sharp details present",
        "Image meets all quality requirements for production"
      ]
    },
    {
      name: 'Product Recommendations',
      description: 'Suggesting optimal product types',
      icon: Star,
      status: 'Processing...',
      color: 'text-green-500',
      details: [
        "High potential products:",
        "- Graphic t-shirts and hoodies",
        "- Phone cases and tech accessories",
        "- Wall art and posters",
        "- Stickers and small merchandise"
      ]
    }
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
      </div>
    </div>
  );
};

export default ProductDetails; 