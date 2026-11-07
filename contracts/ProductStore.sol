// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductStore {

    struct Product {
        string name;
        string description;
        uint256 price;
        address creator;
        uint256 createdAt;
        string imageUrl;
    }

    Product[] public products;

    event ProductCreated(
        string name,
        address creator,
        uint256 createdAt
    );

    function createProduct(
        string memory _name,
        string memory _description,
        uint256 _price,
        string memory _imageUrl
    ) public {

        products.push(
            Product({
                name: _name,
                description: _description,
                price: _price,
                creator: msg.sender,
                createdAt: block.timestamp,
                imageUrl: _imageUrl
            })
        );

        emit ProductCreated(
            _name,
            msg.sender,
            block.timestamp
        );
    }

    function getProducts()
        public
        view
        returns(Product[] memory)
    {
        return products;
    }
}