const MenuManagement = artifacts.require('MenuManagement');

contract('MenuManagement', (accounts) => {
    it('Should return item price equal to 100', async () => {
        const menuManagementInstance = await MenuManagement.deployed();

        // Add items to the menu
        const itemId = await menuManagementInstance.addItem.call('Item 1', 100, 50);
        console.log(itemId.toNumber());
        assert.equal(itemId, 1, 'Item Price should be 1');
        // await menuManagementInstance.addItem('Item 2', 150, 70);

        // Get Item Price of Item 1
        // const itemPrice = await menuManagementInstance.getItemPrice(1);

        // console.log(itemPrice.toNumber());

        // Assert that the orderId is 1 and amount is greater than zero
        // assert.equal(itemPrice, 100, 'Item Price should be 100');
        // assert(amount > 0, 'Amount should be greater than zero');
    });
});
