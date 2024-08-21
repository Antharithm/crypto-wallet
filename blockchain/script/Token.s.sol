// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol";

contract TokenScript is Script {
    Token public usdt;
    Token public dai;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        usdt = new Token("Tether", "USDT", 1000 * 10 ** 6, 6);
        dai = new Token("Dai Stablecoin", "DAI", 1000 * 10 ** 18, 18);
        // ADD MORE MOCK TOKENS HERE TO DEPLOY AND TO SHOW UP IN THE WALLET
        vm.stopBroadcast();
    }
}
