// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PromotionDiscount {
    struct Promotion {
        uint256 itemId; // ID of the menu item the promotion is for.
        string description;
        uint256 discountPercentage; // e.g., 10 for a 10% discount.
        uint256 validTill; // Timestamp for when the promotion ends.
    }

    // Mapping to store promotions for each item
    mapping(uint256 => Promotion) public itemPromotions;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    // Function to add a new promotion for a specific item.
    function addPromotion(
        uint256 _itemId,
        string memory _description,
        uint256 _discountPercentage,
        uint256 _validTill
    ) public onlyOwner {
        require(
            _validTill > block.timestamp,
            "Promotion end time must be in the future."
        );
        require(
            _discountPercentage > 0 && _discountPercentage <= 100,
            "Invalid discount percentage."
        );
        itemPromotions[_itemId] = Promotion(
            _itemId,
            _description,
            _discountPercentage,
            _validTill
        );
        // Emit event or notify other contracts as needed.
    }

    // Function to update an existing promotion for a specific item.
    function updatePromotion(
        uint256 _itemId,
        string memory _description,
        uint256 _discountPercentage,
        uint256 _validTill
    ) public onlyOwner {
        require(
            _validTill > block.timestamp,
            "Promotion end time must be in the future."
        );
        require(
            _discountPercentage > 0 && _discountPercentage <= 100,
            "Invalid discount percentage."
        );
        require(
            itemPromotions[_itemId].validTill > block.timestamp,
            "No existing promotion for this item or the existing promotion has expired."
        );
        itemPromotions[_itemId] = Promotion(
            _itemId,
            _description,
            _discountPercentage,
            _validTill
        );
        // Emit event or notify other contracts as needed.
    }

    // Function to remove a promotion for a specific item.
    function removePromotion(uint256 _itemId) public onlyOwner {
        delete itemPromotions[_itemId];
        // Emit event or notify other contracts as needed.
    }

    // Function to calculate the discounted price for an item.
    function calculateDiscountedPrice(
        uint256 _itemId,
        uint256 itemPrice
    ) public view returns (uint256) {
        uint256 discountedPrice = itemPrice;
        if (itemPromotions[_itemId].validTill > block.timestamp) {
            // Apply the promotion if it's still valid.
            discountedPrice =
                itemPrice -
                ((itemPrice * itemPromotions[_itemId].discountPercentage) /
                    100);
        }
        return discountedPrice;
    }

    // Function to check if there is a promotion for a specific item and return its details if available.
    function getPromotionDetails(
        uint256 _itemId
    ) public view returns (uint256, string memory, uint256, uint256) {
        if (itemPromotions[_itemId].validTill > block.timestamp) {
            // Promotion exists for this item, return its details.
            return (
                _itemId,
                itemPromotions[_itemId].description,
                itemPromotions[_itemId].discountPercentage,
                itemPromotions[_itemId].validTill
            );
        } else {
            // No promotion exists for this item, return specific values to indicate absence of promotion.
            return (0, "", 0, 0);
        }
    }

    // Additional functions and logic as required by the project requirements...
}
