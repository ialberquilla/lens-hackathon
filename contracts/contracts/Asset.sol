// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Asset is ERC721 {
    string private _name;
    uint256 public price;
    address public coinAddress;
    string private _baseTokenURI;

    constructor(
        string memory name_, 
        string memory symbol_,
        uint256 _price, 
        address _coinAddress,
        string memory baseURI
    ) ERC721(name_, symbol_) {
        _name = name_;
        price = _price;
        coinAddress = _coinAddress;
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return _baseURI();
    }

    function mint(address to, uint256 tokenId) public {
        ERC20(coinAddress).transferFrom(msg.sender, address(this), price);
        _mint(to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not token owner or approved for all"
        );
        _approve(to, tokenId);
    }

    function getPrice() public view returns (uint256) {
        return price;
    }
}
