"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  AccountBalance,
  AccountButtons,
  AccountTokens,
  AccountVesting,
} from "./account-ui";

export default function AccountDetailFeature() {
  const { publicKey: walletPublicKey } = useWallet();
  const searchParams = useSearchParams();
  const addressParam = searchParams.get("address");

  const publicKey = useMemo(() => {
    if (addressParam) {
      try {
        return new PublicKey(addressParam);
      } catch (e) {
        return null;
      }
    }
    return walletPublicKey || null;
  }, [addressParam, walletPublicKey]);

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="alert alert-warning">
          Please connect your wallet or provide a valid address in the URL
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="space-y-4">
        <AccountBalance address={publicKey} />
        <AccountButtons address={publicKey} />
      </div>
      <AccountVesting address={publicKey} />
      <AccountTokens address={publicKey} />
    </div>
  );
}
