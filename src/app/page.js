"use client";
require("dotenv").config();
import { JsonRpcProvider, Wallet } from "ethers";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { formatWeiAmount } from "./utils";
import blockchain from "./blockchain.json";
import Logo from "./components/Logo.js";
import Transfer from "./components/Transfer";

const initialChain = blockchain.chains[0];
const initialNativeAsset = blockchain.assets.find(
  (asset) => asset.id === initialChain.nativeAssetId
);
const initialTransfer = {
  to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  amount: "1",
  asset: initialNativeAsset,
};

export default function Home() {
  const [provider, setProvider] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [chain, setChain] = useState(initialChain);
  const [balance, setBalance] = useState(undefined);
  const [nativeAsset, setNativeAsset] = useState(initialNativeAsset);
  const [transfer, setTransfer] = useState(initialTransfer);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    if (!wallet) {
      const provider = new JsonRpcProvider(
        process.env.NEXT_PUBLIC_LOCAL_RPC_URL
      );
      const wallet = Wallet.fromPhrase(
        process.env.NEXT_PUBLIC_MNEMONIC,
        provider
      );
      setProvider(provider);
      setWallet(wallet);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const balance = await provider.getBalance(wallet.address);
      setBalance(balance);
    };
    if (wallet) init();
  }, [wallet]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === "asset") {
      const ticker = value;
      value = [nativeAsset].find((asset) => asset.ticker === ticker);
      value = value || { ticker };
    }
    if (name === "amount") {
      value = value.replaceAll(",", "");
    }
    setTransfer({
      ...transfer,
      [name]: value,
    });
  };

  const formatTransferAmount = (amount) => {
    if (
      Number(amount) <= 1 ||
      (amount.indexOf(".") !== -1 &&
        !["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(
          amount.slice(-1)
        ))
    )
      return amount;
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: transfer.asset.decimals,
    }).format(amount);
  };

  return (
    <div className="container-fluid mt-5 d-flex justify-content-center">
      <div id="content" className="row">
        <div id="content-inner" className="col">
          <div className="text-center">
            <h1 id="title" className="fw-bold">
              CRYPTO WALLET
            </h1>
            <p id="sub-title" className="mt-4" fw-bold>
              <span>Manage your crypto</span>
            </p>
          </div>
          {wallet ? (
            <>
              <div className={styles.overview}>
                <p>
                  <Logo asset={nativeAsset} />
                  {nativeAsset.name}
                </p>
                <p className={styles.address}>{wallet.address}</p>
                <p className={styles.balance}>
                  {balance
                    ? `${formatWeiAmount(balance, 18)} ETH`
                    : "Fetching balance..."}
                </p>
              </div>
              <div className={styles.transfer}>
                <div className="form-group mb-3">
                  <label>Transfer asset</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ETH..."
                    name="asset"
                    value={transfer.asset.ticker}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Transfer to</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0x123456789..."
                    name="to"
                    value={transfer.to}
                    onChange={handleInputChange}
                    disabled={!transfer.asset.id}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Transfer amount</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1"
                    name="amount"
                    value={formatTransferAmount(transfer.amount)}
                    onChange={handleInputChange}
                    disabled={!transfer.asset.id}
                  />
                </div>
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => setShowTransferModal(true)}
                  disabled={
                    !transfer.asset.id ||
                    showTransferModal ||
                    !transfer.to ||
                    !transfer.amount
                  }
                >
                  Send
                </button>
                {showTransferModal && (
                  <Transfer
                    provider={provider}
                    wallet={wallet}
                    chain={chain}
                    nativeAsset={nativeAsset}
                    transfer={transfer}
                    setShowTransferModal={setShowTransferModal}
                  />
                )}
              </div>
            </>
          ) : (
            "Loading..."
          )}
        </div>
      </div>
    </div>
  );
}
