import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Initialize the wallet.
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set in the environment variables");
  }
  const wallet = new Wallet(privateKey);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Deploy AssetFactory contract
  console.log("\nDeploying AssetFactory...");
  const artifact = await deployer.loadArtifact("AssetFactory");
  const assetFactory = await deployer.deploy(artifact, []);
  const contractAddress = await assetFactory.getAddress();
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // Verify the contract
  if (hre.network.name !== "hardhat") {
    console.log("\nVerifying contract...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
  }
} 