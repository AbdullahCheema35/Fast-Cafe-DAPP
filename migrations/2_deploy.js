// test/payment_contract.js

const PaymentContract = artifacts.require("FastCoin");

module.exports = async function (deployer) {
    const paymentContractInstance = await PaymentContract.deployed();
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[5];

    // const initialBalance = await web3.eth.getBalance(paymentContractInstance.address);
    const valueToSend = web3.utils.toWei("10", "ether");

    // Send 10 ethers directly to the receive() function of PaymentContract
    await web3.eth.sendTransaction({
        from: sender,
        to: paymentContractInstance.address,
        value: valueToSend,
    });

    const tokenBalance = await paymentContractInstance.balanceOf(sender);

    console.log(tokenBalance.toString());
}
