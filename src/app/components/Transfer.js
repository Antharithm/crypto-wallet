"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const init = async () => {
      try {
        if (!transfer || !nativeAsset) {
          console.error("Transfer or nativeAsset is undefined");
          return;
        }

        // Ensure decimals is defined
        const decimals = transfer.address?.decimals || 18;

        // 1. Estimate gas cost
        const txRequest = {
          from: wallet.address,
          to: transfer.to,
          value: parseUnits(transfer.amount, decimals),
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
          (ethPrice[nativeAsset.coingeckoId]?.usd || 0).toFixed(2) * scaleFactor
        );
        const txCostUSD =
          (txCostEth * BigInt(adjustedEthPrice)) / BigInt(scaleFactor);

        setTxCostEth(txCostEth);
        setTxCostUSD(txCostUSD);
      } catch (error) {
        console.error("Error in init:", error);
      }
    };

    init();
  }, [transfer, nativeAsset, wallet, provider]);

  const getTransactionFeeString = () => {
    return `${formatWeiAmount(
      txCostUSD || BigInt(0),
      nativeAsset?.decimals || 18
    )} USD (${formatWeiAmount(
      txCostEth || BigInt(0),
      nativeAsset?.decimals || 18
    )})`;
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
        <div className="text-right">
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
