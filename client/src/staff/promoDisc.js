import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './adminMenu.css';
import PromotionDiscount from '../contracts/PromotionDiscount.json';

const PromotionDiscountPage = ({ staffIndex }) => {
    const [web3, setWeb3] = useState(null);
    const [promotionInstance, setPromotionInstance] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [newPromotionItemId, setNewPromotionItemId] = useState('');
    const [newPromotionDescription, setNewPromotionDescription] = useState('');
    const [newPromotionDiscountPercentage, setNewPromotionDiscountPercentage] = useState('');
    const [newPromotionValidTill, setNewPromotionValidTill] = useState('');
    const [editingPromotionItemId, setEditingPromotionItemId] = useState(null);
    const [editPromotionDescription, setEditPromotionDescription] = useState('');
    const [editPromotionDiscountPercentage, setEditPromotionDiscountPercentage] = useState('');
    const [editPromotionValidTill, setEditPromotionValidTill] = useState('');
    const [latestBlock, setLatestBlock] = useState(0);

    useEffect(() => {
        const initWeb3AndLoadData = async () => {
            try {
                const web3Instance = new Web3(Web3.givenProvider || "http://localhost:7545");
                setWeb3(web3Instance);

                const networkId = await web3Instance.eth.net.getId();

                const deployedNetwork = PromotionDiscount.networks[networkId];
                const promotionContractInstance = new web3Instance.eth.Contract(
                    PromotionDiscount.abi,
                    deployedNetwork && deployedNetwork.address,
                );
                setPromotionInstance(promotionContractInstance);

                await loadPromotions(promotionContractInstance, web3Instance);

                const blockNumber = await web3Instance.eth.getBlockNumber();
                setLatestBlock(blockNumber);

                // Fetch latest block number periodically
                const interval = setInterval(async () => {
                    const blockNumber = await web3Instance.eth.getBlockNumber();
                    setLatestBlock(blockNumber);
                }, 5000); // Update every 5 seconds

                // return () => clearInterval(interval);
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };

        initWeb3AndLoadData();
    }, []);

    const loadPromotions = async (promoInstance, web3Instance) => {
        const accounts = await web3Instance.eth.getAccounts();
        const promotions = await promoInstance.methods.getAllPromotions().call({ from: accounts[staffIndex] });
        setPromotions(
            promotions.map((promotion) => ({
                itemId: promotion.itemId,
                id: promotion.itemId,
                description: promotion.description,
                discountPercentage: promotion.discountPercentage,
                validTill: promotion.validTill,
            }))
        );
    };

    const addPromotion = async () => {
        try {
            const accounts = await web3.eth.getAccounts();

            const gasLimit = await promotionInstance.methods
                .addPromotion(newPromotionItemId, newPromotionDescription, newPromotionDiscountPercentage, newPromotionValidTill)
                .estimateGas({ from: accounts[staffIndex] });

            await promotionInstance.methods
                .addPromotion(newPromotionItemId, newPromotionDescription, newPromotionDiscountPercentage, newPromotionValidTill)
                .send({ from: accounts[staffIndex], gas: gasLimit });

            setPromotions([
                ...promotions,
                {
                    id: newPromotionItemId,
                    description: newPromotionDescription,
                    discountPercentage: newPromotionDiscountPercentage,
                    validTill: newPromotionValidTill,
                },
            ]);
            window.alert('Promotion Added Successfully :)');
            window.location.reload();
        } catch (error) {
            console.error('Error adding promotion:', error);
        }

        setNewPromotionItemId('');
        setNewPromotionDescription('');
        setNewPromotionDiscountPercentage('');
        setNewPromotionValidTill('');
    };

    const updatePromotion = async (itemId, description, discountPercentage, validTill) => {
        try {
            const accounts = await web3.eth.getAccounts();

            const gasLimit = await promotionInstance.methods
                .updatePromotion(itemId, description, discountPercentage, validTill)
                .estimateGas({ from: accounts[staffIndex] });

            await promotionInstance.methods
                .updatePromotion(itemId, description, discountPercentage, validTill)
                .send({ from: accounts[staffIndex], gas: gasLimit });

            setPromotions(
                promotions.map((promotion) =>
                    promotion.id === itemId
                        ? { ...promotion, description, discountPercentage, validTill }
                        : promotion
                )
            );
            window.alert('Promotion Updated Successfully :)');
            window.location.reload();
        } catch (error) {
            console.error('Error updating promotion:', error);
        }
    };

    const removePromotion = async (itemId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            console.log('Removing promotion with ID:', itemId);
            console.log('Using account:', accounts[staffIndex]);

            const gasLimit = await promotionInstance.methods.deletePromotion(itemId).estimateGas({ from: accounts[staffIndex] });
            await promotionInstance.methods.deletePromotion(itemId).send({ from: accounts[staffIndex], gas: gasLimit });

            setPromotions(promotions.filter((promotion) => promotion.id !== itemId));
            window.alert('Promotion Removed Successfully :|');
            window.location.reload();
        } catch (error) {
            console.error('Error removing promotion:', error);
        }
    };

    const startEditingPromotion = (promotion) => {
        setEditingPromotionItemId(promotion.id);
        setEditPromotionDescription(promotion.description);
        setEditPromotionDiscountPercentage(promotion.discountPercentage);
        setEditPromotionValidTill(promotion.validTill);
    };

    const stopEditingAndUpdatePromotion = async () => {
        await updatePromotion(
            editingPromotionItemId,
            editPromotionDescription,
            editPromotionDiscountPercentage,
            editPromotionValidTill
        );
        setEditingPromotionItemId(null);
    };

    const stopEditingPromotion = () => {
        setEditingPromotionItemId(null);
    };

    return (
        <div className="admin-menu">
            <h1>Account: {staffIndex}</h1>
            <h1>Staff Promotion Discount Management</h1>
            <div>
                <strong>Latest Block Number:</strong> {latestBlock.toString()}
            </div>
            <div className="admin-form">
                <h2>Add New Promotion</h2>
                <input
                    type="text"
                    placeholder="Item ID"
                    value={newPromotionItemId}
                    onChange={(e) => setNewPromotionItemId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newPromotionDescription}
                    onChange={(e) => setNewPromotionDescription(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Discount Percentage"
                    value={newPromotionDiscountPercentage}
                    onChange={(e) => setNewPromotionDiscountPercentage(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Valid Till"
                    value={newPromotionValidTill}
                    onChange={(e) => setNewPromotionValidTill(e.target.value)}
                />
                <button onClick={addPromotion}>Add Promotion</button>
            </div>
            <div className="promotion-items">
                <h2>Promotion Discounts</h2>
                <ul>
                    {promotions.map((promotion) => (
                        <li key={promotion.id}>
                            {editingPromotionItemId === promotion.id ? (
                                <div>
                                    Item ID: {promotion.itemId.toString()}
                                    <input
                                        type="text"
                                        value={editPromotionDescription}
                                        onChange={(e) => setEditPromotionDescription(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={editPromotionDiscountPercentage.toString()}
                                        onChange={(e) => setEditPromotionDiscountPercentage(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={editPromotionValidTill.toString()}
                                        onChange={(e) => setEditPromotionValidTill(e.target.value)}
                                    />
                                    <button onClick={stopEditingAndUpdatePromotion}>Save</button>
                                    <button onClick={stopEditingPromotion}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    Item ID: {promotion.itemId.toString()} - Description: {promotion.description} - Discount: {promotion.discountPercentage.toString()}% - Valid Till: {promotion.validTill.toString()}th Block
                                    <button onClick={() => startEditingPromotion(promotion)}>Edit</button>
                                    <button onClick={() => removePromotion(promotion.itemId)}>Remove</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PromotionDiscountPage;
