// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin-contracts-5.0.2/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint8 private immutable _decimalsValue;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimalsValue
    ) ERC20(name, symbol) {
        _decimalsValue = decimalsValue;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimalsValue;
    }
}
