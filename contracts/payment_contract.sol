// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces.sol";

// Simple ERC20 Token Contract
contract FastCoin is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public _totalSupply;

    //owner's address
    address payable owner;

    // Conversion rate
    uint256 public conversionRate = 1e15 wei; // 1e15 Wei = 1 FastCoin, adjustable by owner.

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    IOrderProcessingContract orderProcessingContract;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _orderProcessingContractAddress
    ) {
        owner = payable(msg.sender);
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = (10 ** uint256(decimals));
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);

        _allowances[msg.sender][address(this)] = _totalSupply / 2;
        emit Approval(msg.sender, address(this), _totalSupply / 2);

        orderProcessingContract = IOrderProcessingContract(
            _orderProcessingContractAddress
        );
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(
        address account
    ) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view override returns (uint256) {
        return _allowances[_owner][_spender];
    }

    function approve(
        address _spender,
        uint256 amount
    ) external override returns (bool) {
        _approve(msg.sender, _spender, amount);
        return true;
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 amount
    ) public override returns (bool) {
        require(
            _allowances[_sender][msg.sender] >= amount,
            "Insufficient allowance"
        );
        _transfer(_sender, _recipient, amount);
        _approve(
            _sender,
            msg.sender,
            _allowances[_sender][msg.sender] - amount
        );
        return true;
    }

    function processPayment(uint256 _orderId) external override returns (bool) {
        uint256 totalPayment = orderProcessingContract.validateOrder(
            msg.sender,
            _orderId
        );
        require(totalPayment > 0, "Invalid order");
        _transfer(msg.sender, owner, totalPayment);
        orderProcessingContract.completeOrder(msg.sender, _orderId);
        return true;
    }

    // function increaseAllowance(
    //     address spender,
    //     uint256 addedValue
    // ) external returns (bool) {
    //     _approve(
    //         msg.sender,
    //         spender,
    //         _allowances[msg.sender][spender] + addedValue
    //     );
    //     return true;
    // }

    // function decreaseAllowance(
    //     address spender,
    //     uint256 subtractedValue
    // ) external returns (bool) {
    //     _approve(
    //         msg.sender,
    //         spender,
    //         _allowances[msg.sender][spender] - subtractedValue
    //     );
    //     return true;
    // }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "Transfer from the zero address");
        require(recipient != address(0), "Transfer to the zero address");
        require(_balances[sender] >= amount, "Insufficient balance");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(
        address _owner,
        address _spender,
        uint256 amount
    ) internal {
        require(_owner != address(0), "Approve from the zero address");
        require(_spender != address(0), "Approve to the zero address");

        _allowances[_owner][_spender] = amount;
        emit Approval(_owner, _spender, amount);
    }

    receive() external payable {
        require(msg.value > 0, "Invalid amount");
        uint256 tokensToTransfer = msg.value / conversionRate;
        uint256 weiLeftOver = msg.value % conversionRate;
        transferFrom(owner, msg.sender, tokensToTransfer);
        payable(msg.sender).transfer(weiLeftOver);
        owner.transfer(msg.value - weiLeftOver);
    }

    // How many Wei is 1 FastCoin?
    function updateConversionRate(uint256 newRate) external {
        require(newRate > 0, "Conversion rate must be greater than zero.");
        conversionRate = newRate;
    }
}
