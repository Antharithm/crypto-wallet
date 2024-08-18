"use client";
import styles from "./transfer.module.css";

export default function Transfer({
  provider,
  wallet,
  chain,
  nativeAsset,
  transfer,
  setShowTransferModal,
}) {
  return (
    <div id={styles.overlay}>
      <div id={styles.transfer}>
        Transfer
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
