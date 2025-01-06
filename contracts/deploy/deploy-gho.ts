import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";
import { parseEther } from "ethers";

export default async function (hre: HardhatRuntimeEnvironment) {
    console.log("Starting deployment process...");
    
    // Initialize the wallet.
    const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is not set in the environment variables");
    }
    const wallet = new Wallet(PRIVATE_KEY);
    console.log("Deploying with address:", wallet.address);

    // Create deployer object and load the artifact of the contract we want to deploy.
    const deployer = new Deployer(hre, wallet);
    console.log("Loading contract artifact...");
    
    const artifact = await deployer.loadArtifact("MockERC20");
    console.log("Deploying GHO Token...");
    
    // Deploy the contract
    const ghoToken = await deployer.deploy(artifact, ["GHO Token", "GHO"]);
    console.log("Deployment transaction sent...");
    
    // Get the contract address
    const contractAddress = await ghoToken.getAddress();
    console.log(`GHO Token was deployed to ${contractAddress}`);

    // Mint tokens
    console.log("\nMinting GHO tokens...");
    const mintAmount = parseEther("10000000"); // 10M tokens
    const mintTx = await ghoToken.mint(wallet.address, mintAmount);
    await mintTx.wait();
    console.log(`Minted ${mintAmount.toString()} GHO tokens to ${wallet.address}`);

    // Verify contract
    if (hre.network.name !== "hardhat") {
        console.log("\nVerifying contract...");
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: ["GHO Token", "GHO"],
        });
    }
} 