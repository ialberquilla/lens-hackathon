import "@matterlabs/hardhat-zksync";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
  },
  zksolc: {
    version: "latest",
    settings: {},
  },
  networks: {
    lensTestnet: {
      url: "https://rpc.testnet.lens.dev",
      ethNetwork: "sepolia",
      zksync: true,
      chainId: 37111,
      verifyURL: "https://block-explorer-verify.testnet.lens.dev/contract_verification",
    },
    hardhat: {
      zksync: true,
      loggingEnabled: true,
    },
  },
};

export default config;
