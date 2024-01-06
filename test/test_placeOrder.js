const MenuManagement = artifacts.require("MenuManagement");
const OrderProcessing = artifacts.require("OrderProcessing");
const PromotionDiscount = artifacts.require("PromotionDiscount");
const RewardLoyalty = artifacts.require("RewardLoyalty");
const FastCoin = artifacts.require("FastCoin");

const truffleAssert = require('truffle-assertions');

contract('OrderProcessing', (accounts) => {
    it('should place an order with orderId 1 and amount equal to totalAmount', async () => {
        const promotionDiscountInstance = await PromotionDiscount.deployed();

        const menuManagementInstance = await MenuManagement.deployed();

        const orderProcessingInstance = await OrderProcessing.deployed();

        const rewardLoyaltyInstance = await RewardLoyalty.deployed();

        const FastCoinInstance = await FastCoin.deployed();

        await orderProcessingInstance.setIntegratedContracts(
            menuManagementInstance.address,
            FastCoinInstance.address,
            promotionDiscountInstance.address,
            rewardLoyaltyInstance.address
        );

        // Add items to the menu
        await menuManagementInstance.addItem('Item 1', 100, 50);
        await menuManagementInstance.addItem('Item 2', 150, 70);

        // Place an order
        const itemIds = [1, 2]; // Define the item IDs
        const quantities = [1, 2]; // Define the quantities
        const tx = await orderProcessingInstance.placeOrder(itemIds, quantities);

        const totalAmount = quantities[0] * 100 + quantities[1] * 150;

        // Assert the emitted event
        truffleAssert.eventEmitted(tx, "OrderPlaced", (ev) => {
            return ev.orderId.toNumber() === 1 && ev.user === accounts[0] && ev.totalAmount.toNumber() === totalAmount;
        }, "OrderPlaced event should be emitted with correct parameters");
    });
});
