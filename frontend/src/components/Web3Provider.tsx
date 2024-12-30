"use client"

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { injected } from "wagmi/connectors";
import { chains } from "@lens-network/sdk/viem";

const config = createConfig(
  getDefaultConfig({
    // Using Lens Network chains
    chains: [chains.testnet],
    transports: {
      // Using Lens Network RPC
      [chains.testnet.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Lens Hackathon",

    // Optional App Info
    appDescription: "Transform your art into products",

    // Add support for injected wallets (like MetaMask)
    connectors: [
      injected()
    ]
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}; 