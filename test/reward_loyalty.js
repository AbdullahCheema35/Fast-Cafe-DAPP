// test/payment_test.js

const FastCoin = artifacts.require("FastCoin");
const MenuManagement = artifacts.require("MenuManagement");
const OrderProcessing = artifacts.require("OrderProcessing");
const RewardLoyalty = artifacts.require("RewardLoyalty");

contract("PaymentContract", (accounts) => {
    let fastCoinInstance;
    let menuManagementInstance;
    let orderProcessingInstance;

    before(async () => {
        fastCoinInstance = await FastCoin.deployed();
        menuManagementInstance = await MenuManagement.deployed();
        orderProcessingInstance = await OrderProcessing.deployed();
        rewardLoyaltyInstance = await RewardLoyalty.deployed();

        // Add a menu item
        await menuManagementInstance.addItem("ItemName", 50, 100); // Replace with actual item details
        await menuManagementInstance.addItem("ItemName2", 100, 100); // Replace with actual item details
    });

    const user = accounts[5];

    it("User should receive 10000 tokens for 10 ethers", async () => {
        const paymentContractInstance = await FastCoin.deployed();

        // const initialBalance = await web3.eth.getBalance(paymentContractInstance.address);
        const valueToSend = web3.utils.toWei("10", "ether");

        // Send 10 ethers directly to the receive() function of PaymentContract
        await web3.eth.sendTransaction({
            from: user,
            to: paymentContractInstance.address,
            value: valueToSend,
        });

        // const finalBalance = await web3.eth.getBalance(paymentContractInstance.address);
        const tokenBalance = await paymentContractInstance.balanceOf(user);

        assert.equal(
            tokenBalance.toNumber(),
            20000, // Assuming 1 ether = 1000 tokens
            "Tokens were not correctly credited to sender"
        );
    });

    it("User should be able to successfully process payment for the order", async () => {
        const paymentContractInstance = await FastCoin.deployed();

        const itemIds = [2]; // Replace with the actual item ID
        const quantities = [10]; // Replace with the actual quantity

        // Create an order
        const tx = await orderProcessingInstance.placeOrder(itemIds, quantities, { from: user });

        // Extracting the emitted event
        const orderPlacedEvent = tx.logs.find(
            (log) => log.event === "OrderPlaced"
        );

        // Accessing the event parameters
        const orderId = orderPlacedEvent.args.orderId.toNumber();
        const totalAmount = orderPlacedEvent.args.totalAmount.toNumber();

        // Perform assertions or log the extracted values
        assert.equal(orderId, 1, "Unexpected orderId emitted");
        assert.equal(totalAmount, 1000, "Unexpected total amount");

        // Call the processPayment function
        await fastCoinInstance.processPayment(orderId, { from: user });

        // Call order details fucntion and check if the order is completed
        const orderDetails = await orderProcessingInstance.getOrderDetails(orderId, { from: user });
        assert.equal(orderDetails[4], true, "Order is not completed");
        assert.equal(orderDetails[3], 1000, "Order amount is not correct");

        // Call the balanceOf function to check the balance of the user
        const remBalance = await fastCoinInstance.balanceOf(user);
        assert.equal(remBalance, 19000, "Remaining Balance is not correct");

        // Call the getLoyaltyPoints function to check the loyalty points of the user
        const loyaltyPoints = await rewardLoyaltyInstance.getLoyaltyPoints({ from: user });
        assert.equal(loyaltyPoints.toNumber(), 150, "Loyalty points are not correct");
    });

    it("User should be able to successfully redeem tokens and have correct left over points", async () => {
        // Call the redeem tokens function
        await rewardLoyaltyInstance.redeemPointsForTokens({ from: user });

        // Call the balanceOf function to check the balance of the user
        const remBalance = await fastCoinInstance.balanceOf(user);
        assert.equal(remBalance, 19001, "Remaining Balance is not correct");

        // Call getLoyaltyPoints function to check the loyalty points of the user
        const loyaltyPoints = await rewardLoyaltyInstance.getLoyaltyPoints({ from: user });
        assert.equal(loyaltyPoints.toNumber(), 50, "Loyalty points are not correct");
    });


});
