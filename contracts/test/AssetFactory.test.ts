import { expect } from "chai";
import { ethers } from "hardhat";
import { Asset, AssetFactory, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("AssetFactory", function () {
  let assetFactory: AssetFactory;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  
  const NAME = "Test Asset";
  const SYMBOL = "TASSET";
  const PRICE = ethers.utils.parseEther("100");
  const BASE_URI = "https://api.example.com/metadata/";
  
  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.deployed();
    
    // Deploy AssetFactory contract
    const AssetFactory = await ethers.getContractFactory("AssetFactory");
    assetFactory = await AssetFactory.deploy();
    await assetFactory.deployed();
  });

  describe("Asset Creation", function () {
    it("Should create a new Asset contract", async function () {
      const tx = await assetFactory.createAsset(
        NAME,
        SYMBOL,
        PRICE,
        mockToken.address,
        BASE_URI
      );
      const receipt = await tx.wait();
      
      // Get the AssetCreated event
      const event = receipt.events?.find((e: any) => e.event === "AssetCreated");
      expect(event).to.not.be.undefined;
      expect(event?.args?.name).to.equal(NAME);
      expect(event?.args?.symbol).to.equal(SYMBOL);
      expect(event?.args?.price).to.equal(PRICE);
      expect(event?.args?.coinAddress).to.equal(mockToken.address);
      expect(event?.args?.baseURI).to.equal(BASE_URI);
      
      // Verify the created contract
      const assetAddress = event?.args?.assetAddress;
      const Asset = await ethers.getContractFactory("Asset");
      const createdAsset = Asset.attach(assetAddress);
      
      expect(await createdAsset.name()).to.equal(NAME);
      expect(await createdAsset.symbol()).to.equal(SYMBOL);
      expect(await createdAsset.price()).to.equal(PRICE);
      expect(await createdAsset.coinAddress()).to.equal(mockToken.address);
      expect(await createdAsset.tokenURI(1)).to.equal(BASE_URI);
    });

    it("Should allow minting tokens on the created Asset", async function () {
      // Create Asset
      const tx = await assetFactory.createAsset(
        NAME,
        SYMBOL,
        PRICE,
        mockToken.address,
        BASE_URI
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "AssetCreated");
      const assetAddress = event?.args?.assetAddress;
      
      // Get Asset contract instance
      const Asset = await ethers.getContractFactory("Asset");
      const createdAsset = Asset.attach(assetAddress);
      
      // Mint tokens to addr1 and approve Asset contract
      await mockToken.mint(addr1.address, ethers.utils.parseEther("1000"));
      await mockToken.connect(addr1).approve(assetAddress, ethers.constants.MaxUint256);
      
      // Mint NFT
      await createdAsset.connect(addr1).mint(addr1.address, 1);
      expect(await createdAsset.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should emit AssetCreated event with correct parameters", async function () {
      const tx = await assetFactory.createAsset(
        NAME,
        SYMBOL,
        PRICE,
        mockToken.address,
        BASE_URI
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "AssetCreated");
      expect(event).to.not.be.undefined;
      
      expect(event?.args?.assetAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(event?.args?.name).to.equal(NAME);
      expect(event?.args?.symbol).to.equal(SYMBOL);
      expect(event?.args?.price).to.equal(PRICE);
      expect(event?.args?.coinAddress).to.equal(mockToken.address);
      expect(event?.args?.baseURI).to.equal(BASE_URI);
    });
  });
}); 