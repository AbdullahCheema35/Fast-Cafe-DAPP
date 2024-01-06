// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MenuManagement {
    struct MenuItem {
        uint256 itemId;
        string name;
        uint256 price;
        uint256 availability;
    }

    mapping(uint256 => MenuItem) public menuItems;
    uint256 public itemCount;
    address public admin;

    // Addresses for other contracts for integration purposes.
    address orderProcessingContractAddress;

    event ItemAdded(
        uint256 indexed itemId,
        string name,
        uint256 price,
        uint256 availability
    );

    // Modifier to ensure the function is called by the integrated contracts only.
    modifier onlyIntegratedContracts() {
        require(
            msg.sender == orderProcessingContractAddress,
            "Only integrated contracts can call this function."
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    // Constructor updated to accept addresses of integrated contracts.
    constructor() {
        admin = msg.sender;
    }

    // Function to update the addresses of integrated contracts, if needed.
    function setIntegratedContracts(
        address _menuManagementContractAddress,
        address payable _paymentContractAddress,
        address _promotionsDiscountsContractAddress,
        address _rewardsLoyaltyContractAddress,
        address _orderProcessingContractAddress
    ) public onlyAdmin {
        // Implement appropriate access control...
        orderProcessingContractAddress = _orderProcessingContractAddress;
    }

    // Function to add a new item to the menu.
    function addItem(
        string memory name,
        uint256 price,
        uint256 availability
    ) public onlyAdmin {
        itemCount++;
        menuItems[itemCount] = MenuItem(itemCount, name, price, availability);
        // Emit event or notify other contracts as needed.
        emit ItemAdded(itemCount, name, price, availability);
    }

    // Function to update an existing menu item.
    function updateItem(
        uint256 itemId,
        string memory name,
        uint256 price,
        uint256 availability
    ) public onlyAdmin {
        require(itemId <= itemCount, "Item does not exist.");
        menuItems[itemId] = MenuItem(itemId, name, price, availability);
        // Emit event or notify other contracts as needed.
    }

    // Function to remove an item from the menu.
    function removeItem(uint256 itemId) public onlyAdmin {
        require(itemId <= itemCount, "Item does not exist.");
        delete menuItems[itemId];
        // Emit event or notify other contracts as needed.
    }

    // Function to check item availability (integration point for Order Processing Contract).
    function checkItemAvailability(
        uint256 itemId
    ) public view returns (uint256) {
        require(itemId <= itemCount, "Item does not exist.");
        return menuItems[itemId].availability;
    }

    function getItemPrice(uint256 itemId) public view returns (uint256) {
        require(itemId <= itemCount, "Item does not exist.");
        return menuItems[itemId].price;
    }

    // Function to get item details (itemId, name, price, availability).
    function getItemDetails(
        uint256 itemId
    ) public view returns (uint256, string memory, uint256, uint256) {
        require(itemId <= itemCount, "Item does not exist.");
        MenuItem memory item = menuItems[itemId];
        return (item.itemId, item.name, item.price, item.availability);
    }

    // Function to update item availability (called by Order Processing Contract after order completion).
    function reduceItemAvailability(
        uint256 itemId,
        uint256 unitsConsumed
    ) public onlyIntegratedContracts {
        require(itemId <= itemCount, "Item does not exist.");
        require(
            menuItems[itemId].availability >= unitsConsumed,
            "Cannot update item availability. Not enough units available to subtract."
        );
        menuItems[itemId].availability -= unitsConsumed;
        // Emit event or notify other contracts as needed.
    }
}
