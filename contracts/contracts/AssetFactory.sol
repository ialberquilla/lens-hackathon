// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Asset.sol";

contract AssetFactory {
    event AssetCreated(
        address indexed owner,
        address indexed assetAddress,
        string name,
        string symbol,
        uint256 price,
        address coinAddress,
        string baseURI
    );

    function createAsset(
        string memory name,
        string memory symbol,
        uint256 price,
        address coinAddress,
        string memory baseURI
    ) public returns (address) {
        Asset asset = new Asset(
            name,
            symbol,
            price,
            coinAddress,
            baseURI
        );

        emit AssetCreated(
            msg.sender,
            address(asset),
            name,
            symbol,
            price,
            coinAddress,
            baseURI
        );

        return address(asset);
    }
} 