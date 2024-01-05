// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces.sol";

contract RewardLoyalty {
    // ERC20 token address for loyalty points (e.g., FastCoin).
    address public fastCoinAddress;
    mapping(address => uint256) public loyaltyPoints;

    uint256 public conversionRate = 100; // 100 points = 1 FastCoin, adjustable by owner.
    address public owner;

    uint256 public purchaseFactor = 10; // Factor to determine loyalty points based on purchase amount.
    event LoyaltyPointsAdded(address indexed user, uint256 points);

    // Interfaces for other contracts to interact with.
    IERC20 paymentContract;

    // Addresses for other contracts for integration purposes.
    address paymentContractAddress;

    event LoyaltyPointsRedeemed(
        address indexed user,
        uint256 points,
        uint256 tokens
    );
    event ConversionRateChanged(uint256 newRate);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    // Function to set the addresses for integrated contracts.
    function setIntegratedContracts(
        address _paymentContractAddress
    ) public onlyOwner {
        paymentContractAddress = _paymentContractAddress;
        // Initialize contract interfaces with the provided addresses.
        paymentContract = IERC20(paymentContractAddress);
    }

    // Function to reward loyalty points based on a successful purchase made.
    function successfulPurchaseMade(address user, uint256 tokens) public {
        require(tokens > 0, "Invalid number of tokens.");

        // Calculate loyalty points based on the number of tokens received and scaling factor
        uint256 loyaltyPointsToAdd;
        if (tokens < 50) {
            loyaltyPointsToAdd = tokens / purchaseFactor; // Standard x factor
        } else if (tokens <= 100) {
            loyaltyPointsToAdd = (tokens * 125) / (purchaseFactor * 100); // 1.25x factor
        } else {
            loyaltyPointsToAdd = (tokens * 150) / (purchaseFactor * 100); // 1.5x factor
        }

        // Award loyalty points to the user
        loyaltyPoints[user] += loyaltyPointsToAdd;

        // Emit event indicating loyalty points added
        emit LoyaltyPointsAdded(user, loyaltyPointsToAdd);
    }

    // Function to redeem loyalty points for FastCoin tokens.
    function redeemPointsForTokens(address user, uint256 points) public {
        require(loyaltyPoints[user] >= points, "Not enough loyalty points.");
        uint256 tokensToTransfer = points / conversionRate;
        uint256 pointsLeft = points % conversionRate;
        loyaltyPoints[user] -= (points - pointsLeft);
        require(
            paymentContract.transferFrom(owner, msg.sender, tokensToTransfer),
            "Token transfer failed."
        );
        emit LoyaltyPointsRedeemed(user, points, tokensToTransfer);
    }

    // Function to change the conversion rate for loyalty points.
    function changeConversionRate(uint256 newRate) public onlyOwner {
        require(newRate > 0, "Conversion rate must be greater than zero.");
        conversionRate = newRate;
        emit ConversionRateChanged(newRate);
    }
}
