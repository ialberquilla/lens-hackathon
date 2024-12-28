import { expect } from "chai";
import { ethers } from "hardhat";
import { Asset, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Asset", function () {
  let asset: Asset;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  
  const NAME = "Test Asset";
  const SYMBOL = "TASSET";
  const PRICE = ethers.utils.parseEther("100");
  const BASE_URI = "https://api.example.com/metadata/";
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.deployed();
    
    // Deploy Asset contract
    const Asset = await ethers.getContractFactory("Asset");
    asset = await Asset.deploy(NAME, SYMBOL, PRICE, mockToken.address, BASE_URI);
    await asset.deployed();
    
    // Mint some tokens to addr1 for testing
    await mockToken.mint(addr1.address, ethers.utils.parseEther("1000"));
    await mockToken.connect(addr1).approve(asset.address, ethers.constants.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set the correct name", async function () {
      expect(await asset.name()).to.equal(NAME);
    });

    it("Should set the correct symbol", async function () {
      expect(await asset.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct price", async function () {
      expect(await asset.price()).to.equal(PRICE);
    });

    it("Should set the correct coin address", async function () {
      expect(await asset.coinAddress()).to.equal(mockToken.address);
    });

    it("Should set the correct base URI", async function () {
      expect(await asset.tokenURI(1)).to.equal(BASE_URI);
    });
  });

  describe("Minting", function () {
    it("Should mint a new token when paying the correct price", async function () {
      await asset.connect(addr1).mint(addr1.address, 1);
      expect(await asset.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should transfer the correct amount of tokens during mint", async function () {
      const initialBalance = await mockToken.balanceOf(addr1.address);
      await asset.connect(addr1).mint(addr1.address, 1);
      const finalBalance = await mockToken.balanceOf(addr1.address);
      expect(initialBalance.sub(finalBalance)).to.equal(PRICE);
    });

    it("Should revert if trying to mint without enough tokens", async function () {
      await expect(
        asset.connect(addr2).mint(addr2.address, 1)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should revert if trying to mint the same token ID twice", async function () {
      await asset.connect(addr1).mint(addr1.address, 1);
      await expect(
        asset.connect(addr1).mint(addr1.address, 1)
      ).to.be.revertedWith("ERC721: token already minted");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await asset.connect(addr1).mint(addr1.address, 1);
    });

    it("Should transfer token between addresses", async function () {
      await asset.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await asset.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should emit Transfer event", async function () {
      await expect(asset.connect(addr1).transferFrom(addr1.address, addr2.address, 1))
        .to.emit(asset, "Transfer")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should revert if transferring token that sender doesn't own", async function () {
      await expect(
        asset.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await asset.connect(addr1).mint(addr1.address, 1);
    });

    it("Should approve address to transfer token", async function () {
      await asset.connect(addr1).approve(addr2.address, 1);
      expect(await asset.getApproved(1)).to.equal(addr2.address);
    });

    it("Should allow approved address to transfer token", async function () {
      await asset.connect(addr1).approve(addr2.address, 1);
      await asset.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await asset.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should emit Approval event", async function () {
      await expect(asset.connect(addr1).approve(addr2.address, 1))
        .to.emit(asset, "Approval")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should revert if non-owner tries to approve", async function () {
      await expect(
        asset.connect(addr2).approve(addr2.address, 1)
      ).to.be.revertedWith("ERC721: approve caller is not token owner or approved for all");
    });
  });

  describe("Price", function () {
    it("Should return the correct price", async function () {
      expect(await asset.getPrice()).to.equal(PRICE);
    });
  });
}); 