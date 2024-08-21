"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { parseUnits, Contract } from "ethers";
import styles from "./transfer.module.css";
import { formatWeiAmount } from "../utils.js";
import blockchain from "../blockchain.json";

export default function Transfer({
  provider,
  wallet,
  chain,
  nativeAsset,
  transfer,
  setShowTransferModal,
}) {
  const [txCostEth, setTxCostEth] = useState(undefined); // in Wei
  const [txCostUSD, setTxCostUSD] = useState(undefined); // in USD
  const [sending, setSending] = useState(undefined); // send tx
  const [txHash, setTxHash] = useState(undefined); // tx hash
  const [error, setError] = useState(undefined); // tx error

  useEffect(() => {
    const init = async () => {
      let estimateGas;
      // if no address it is a native token (addresses only assigned to ERC20s in json)
      if (!transfer.asset.address) {
        const txRequest = {
          from: wallet.address,
          to: transfer.to,
          value: parseUnits(transfer.amount, transfer.asset.decimals),
        };
        estimateGas = wallet.estimateGas(txRequest);
        // Otherwise it's an ERC20 token
      } else {
        const token = new Contract(
          transfer.asset.address,
          blockchain.abis.erc20,
          wallet
        );
        // Estimate gas cost
        estimateGas = token.transfer.estimateGas(
          transfer.to,
          parseUnits(transfer.amount, transfer.asset.decimals)
        );
      }
      // Gas price parameter
      const [gasCost, feeData, ethPriceRaw] = await Promise.all([
        estimateGas,
        // Compute txCostUSD
        provider.getFeeData(),
        fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${nativeAsset.coingeckoId}&vs_currencies=usd&x_cg_demo_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`
        ),
      ]);
      // Compute txCostEth
      const txCostEth = BigInt(gasCost) * BigInt(feeData.maxFeePerGas);
      const ethPrice = await ethPriceRaw.json();
      const scaleFactor = 100;
      const adjustedEthPrice = parseInt(
        ethPrice[nativeAsset.coingeckoId].usd.toFixed(2) * scaleFactor
      );
      const txCostUSD =
        (txCostEth * BigInt(adjustedEthPrice)) / BigInt(scaleFactor);
      setTxCostEth(txCostEth);
      setTxCostUSD(txCostUSD);
    };

    init();
  }, []);

  const getTransactionFeeString = () => {
    return `${formatWeiAmount(
      txCostUSD,
      nativeAsset.decimals
    )} USD (${formatWeiAmount(txCostEth, nativeAsset.decimals)} ${
      nativeAsset.ticker
    })`;
  };

  const getTransactionUrl = (hash) => {
    return `${chain.blockchainExplorer}/${hash}`;
  };

  const send = async () => {
    setSending(true);
    try {
      let tx;
      // Native asset
      if (!transfer.asset.address) {
        const txRequest = {
          from: wallet.address,
          to: transfer.to,
          value: parseUnits(transfer.amount, transfer.asset.decimals),
        };
        tx = wallet.sendTransaction(txRequest);
        // Otherwise it's an ERC20 token
      } else {
        const token = new Contract(
          transfer.asset.address,
          blockchain.abis.erc20,
          wallet
        );
        tx = token.transfer(
          transfer.to,
          parseUnits(transfer.amount, transfer.asset.decimals)
        );
      }
      const txResponse = await tx;
      const txReceipt = await txResponse.wait(); // wait for tx to be mined
      console.log(txReceipt);
      if (parseInt(txReceipt.status !== 1))
        throw new Error("Transaction has failed!");
      setTxHash(txReceipt.hash); // link to etherscan
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div id={styles.overlay}>
      <div id={styles.transfer}>
        <h2 className="fw-bold text-center">Transfer Details</h2>
        <div className="form-group mb3">
          <label>Network</label>
          <input
            type="text"
            className="form-control mb-3"
            name="network"
            value={chain.name}
            disabled={true}
          />
        </div>
        <div className="form-group mb3">
          <label>From</label>
          <input
            type="text"
            className="form-control mb-3"
            name="from"
            value={wallet.address}
            disabled={true}
          />
        </div>
        <div className="form-group mb3">
          <label>To</label>
          <input
            type="text"
            className="form-control mb-3"
            name="to"
            value={transfer.to}
            disabled={true}
          />
        </div>
        <div className="form-group mb3">
          <label>Amount</label>
          <input
            type="text"
            className="form-control mb-3"
            name="amount"
            value={transfer.amount}
            disabled={true}
          />
        </div>
        <div className="form-group mb3">
          <label>Asset</label>
          <input
            type="text"
            className="form-control mb-3"
            name="asset"
            value={transfer.asset.ticker}
            disabled={true}
          />
        </div>
        <div className="form-group mb3">
          <label>Transaction fee</label>
          <input
            type="text"
            className="form-control mb-3"
            name="txFee"
            value={
              txCostEth && txCostUSD
                ? getTransactionFeeString()
                : "Loading tx cost..."
            }
            disabled={true}
          />
        </div>
        {sending && (
          <div className="alert alert-info mt-3 mb-3">
            <span role="img" aria-label="Loading" className="me-2">
              ⏳
            </span>
            Processing transaction...
          </div>
        )}
        {txHash && (
          <div className="alert alert-success mt-3 mb-3">
            <span role="img" aria-label="Success">
              ✅
            </span>{" "}
            Transaction successful!{" "}
            <Link
              href={getTransactionUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View transaction details
            </Link>
          </div>
        )}
        {error && (
          <div className="alert alert-danger mt-3 mb-3">
            <strong>Error:</strong> Transaction failed. Please try again.
          </div>
        )}
        <div className="text-right">
          <button className="btn btn-primary me-3" onClick={send}>
            Submit
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowTransferModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
