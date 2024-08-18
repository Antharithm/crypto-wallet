"use client";
require("dotenv").config();
import { JsonRpcProvider, Wallet } from "ethers";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [provider, setProvider] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

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
                <p className={styles.address}>{wallet.address}</p>
                <p>{balance ? balance.toString() : "Fetching balance..."}</p>
              </div>
              "wallet loaded"
            </>
          ) : (
            "Loading..."
          )}
        </div>
      </div>
    </div>
  );
}
