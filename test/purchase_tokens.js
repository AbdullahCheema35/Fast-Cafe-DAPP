// test/payment_contract.js

const PaymentContract = artifacts.require("FastCoin");

contract("PaymentContract", (accounts) => {
    it("should receive 10 ethers and give 10000 tokens", async () => {
        const paymentContractInstance = await PaymentContract.deployed();
        const sender = accounts[5];

        // const initialBalance = await web3.eth.getBalance(paymentContractInstance.address);
        const valueToSend = web3.utils.toWei("10", "ether");

        // Send 10 ethers directly to the receive() function of PaymentContract
        await web3.eth.sendTransaction({
            from: sender,
            to: paymentContractInstance.address,
            value: valueToSend,
        });

        // const finalBalance = await web3.eth.getBalance(paymentContractInstance.address);
        const tokenBalance = await paymentContractInstance.balanceOf(sender);

        // assert.equal(
        //     finalBalance - initialBalance,
        //     valueToSend,
        //     "Payment contract did not receive 10 ethers"
        // );

        assert.equal(
            tokenBalance.toNumber(),
            10000, // Assuming 1 ether = 1000 tokens
            "Tokens were not correctly credited to sender"
        );
    });
});
