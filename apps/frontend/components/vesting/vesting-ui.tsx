"use client";

import { PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import {
  useVestingProgram,
  useVestingProgramAccount,
} from "./vesting-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

interface VestingAccount {
  publicKey: PublicKey;
}

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const { publicKey } = useWallet();
  const [company, setCompany] = useState("");
  const [mint, setMint] = useState("");

  const isFormValid = company.length > 0;

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({ companyName: company, mint: mint });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Company Name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="Token Mint Address"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
          isFormValid
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
        }`}
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending || !isFormValid}
      >
        {createVestingAccount.isPending ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
            <span>Creating...</span>
          </div>
        ) : (
          "Create New Vesting Account"
        )}
      </button>
    </div>
  );
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account: VestingAccount) => (
            <VestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting } = useVestingProgramAccount({
    account,
  });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? 0,
    [accountQuery.data?.companyName]
  );

  return accountQuery.isLoading ? (
    <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  ) : (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        {companyName}
      </h2>
      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Start Time"
          value={startTime || ""}
          onChange={(e) => setStartTime(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="End Time"
          value={endTime || ""}
          onChange={(e) => setEndTime(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Cliff Time"
          value={cliffTime || ""}
          onChange={(e) => setCliffTime(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Total Allocation"
          value={totalAmount || ""}
          onChange={(e) => setTotalAmount(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          className="w-full px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            createEmployeeVesting.mutateAsync({
              startTime,
              endTime,
              totalAmount,
              cliffTime,
            })
          }
          disabled={createEmployeeVesting.isPending}
        >
          {createEmployeeVesting.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
              <span>Creating...</span>
            </div>
          ) : (
            "Create Employee Vesting Account"
          )}
        </button>
      </div>
    </div>
  );
}
