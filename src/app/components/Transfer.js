"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { parseUnits } from "ethers";
import styles from "./transfer.module.css";
import { formatWeiAmount } from "../utils.js";

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
      // 1. Estimate gas cost
      const txRequest = {
        from: wallet.address,
        to: transfer.to,
        value: parseUnits(transfer.amount, transfer.asset.decimals),
      };
      const gasCost = await wallet.estimateGas(txRequest);

      // 2. Gas price parameter
      const feeData = await provider.getFeeData();

      // 3. Compute txCostEth
      const txCostEth = BigInt(gasCost) * BigInt(feeData.maxFeePerGas);

      // 4. Compute txCostUSD
      const ethPriceRaw = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${nativeAsset.coingeckoId}&vs_currencies=usd&x_cg_demo_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`
      );
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
      const txRequest = {
        from: wallet.address,
        to: transfer.to,
        value: parseUnits(transfer.amount, transfer.asset.decimals),
      };
      const txResponse = await wallet.sendTransaction(txRequest);
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
