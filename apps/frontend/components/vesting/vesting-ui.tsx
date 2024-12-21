"use client";

import React, { useState, useMemo } from "react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3, BN } from "@coral-xyz/anchor";
import {
  useVestingProgram,
  useVestingProgramAccount,
} from "./vesting-data-access";
import vestingIdl from "@token-vesting/anchor/target/idl/vesting.json";
import { PROGRAM_ID } from "@/constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface VestingAccount {
  publicKey: PublicKey;
}

export function VestingCreate() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [companyName, setCompanyName] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [isCreatingMint, setIsCreatingMint] = useState(false);
  const [isCreatingVesting, setIsCreatingVesting] = useState(false);

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(vestingIdl as any, PROGRAM_ID, provider);
  }, [provider]);

  const createMintAccount = async (decimals: number) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("Wallet not connected");
      return;
    }
    try {
      setIsCreatingMint(true);

      const mintKeypair = Keypair.generate();
      const lamports = await connection.getMinimumBalanceForRentExemption(
        MINT_SIZE,
        "confirmed"
      );

      const createAccIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      });

      const initIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        wallet.publicKey,
        wallet.publicKey
      );

      const tx = new Transaction().add(createAccIx, initIx);
      tx.feePayer = wallet.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      tx.sign(mintKeypair);
      //@ts-expect-error
      const signedTx = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      setMintAddress(mintKeypair.publicKey.toBase58());
      alert(`Mint created: ${mintKeypair.publicKey.toBase58()}`);
    } catch (error: any) {
      console.error(error);
      alert("Failed to create mint: " + error.message);
    } finally {
      setIsCreatingMint(false);
    }
  };

  const createVesting = async () => {
    if (!program || !wallet.publicKey) {
      alert("Program not ready or wallet not connected");
      return;
    }
    if (!companyName || !mintAddress) {
      alert("Enter a company name and mint address first");
      return;
    }
    try {
      setIsCreatingVesting(true);

      const [vestingPda] = await PublicKey.findProgramAddress(
        [Buffer.from(companyName)],
        program.programId
      );
      const [treasuryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
        program.programId
      );

      await program.methods
        .createVestingAccount(companyName)
        .accounts({
          signer: wallet.publicKey,
          vestingAccount: vestingPda,
          mint: new PublicKey(mintAddress),
          treasuryTokenAccount: treasuryPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      alert(`Vesting account created for company: ${companyName}`);
    } catch (err: any) {
      console.error(err);
      alert("Error creating vesting account: " + err.message);
    } finally {
      setIsCreatingVesting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4">
      <div className="space-y-8">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Create New Token
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            Create a new SPL token that will be used for vesting. Choose
            between:
            <br />• 0 decimals - Best for whole token amounts (e.g., NFT-like
            tokens)
            <br />• 9 decimals - Standard for fungible tokens (similar to SOL)
          </p>
          <div className="space-y-4">
            <div>
              <button
                onClick={() => createMintAccount(0)}
                disabled={isCreatingMint}
                className="w-full px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                {isCreatingMint ? "Creating..." : "Create Mint (0 decimals)"}
              </button>
              <button
                onClick={() => createMintAccount(9)}
                disabled={isCreatingMint}
                className="w-full px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingMint ? "Creating..." : "Create Mint (9 decimals)"}
              </button>
            </div>
            {mintAddress && (
              <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
                <p className="text-sm text-slate-300">Mint Address:</p>
                <p className="text-sm font-mono break-all">{mintAddress}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Create Vesting Account
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            Create a vesting contract for your company. This will be the main
            account that manages all employee vesting schedules.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Mint Address"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              className="w-full px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={createVesting}
              disabled={isCreatingVesting}
            >
              {isCreatingVesting ? "Creating..." : "Create Vesting Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAccounts = useMemo(() => {
    if (!accounts.data) return [];
    return accounts.data.filter((account: VestingAccount) => {
      const companyName = account.publicKey.toString().toLowerCase();
      return companyName.includes(searchTerm.toLowerCase());
    });
  }, [accounts.data, searchTerm]);

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
    <div className="container mx-auto max-w-4xl px-4">
      <div className="space-y-6">
        <div className="glass-panel p-4">
          <input
            type="text"
            placeholder="Search company vesting accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className={"space-y-6"}>
          {accounts.isLoading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : filteredAccounts.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAccounts.map((account: VestingAccount) => (
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
      </div>
    </div>
  );
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting } = useVestingProgramAccount({
    account,
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [cliffDate, setCliffDate] = useState<Date | null>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? "",
    [accountQuery.data?.companyName]
  );

  const handleSubmit = async () => {
    if (!startDate || !endDate || !cliffDate || !totalAmount || !beneficiary) {
      alert("Please fill in all fields");
      return;
    }

    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);
    const cliffTime = Math.floor(cliffDate.getTime() / 1000);
    const amount = parseInt(totalAmount);

    try {
      await createEmployeeVesting.mutateAsync({
        startTime,
        endTime,
        totalAmount: amount,
        cliffTime,
        beneficiary: new PublicKey(beneficiary),
      });
    } catch (err: any) {
      console.error(err);
      alert("Error creating employee vesting: " + err.message);
    }
  };

  return accountQuery.isLoading ? (
    <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  ) : (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        {companyName}
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">
            Beneficiary Address
            <span className="text-xs text-slate-400 ml-2">
              (Employee's wallet address that will receive the tokens)
            </span>
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter beneficiary wallet address"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">
            Start Date
            <span className="text-xs text-slate-400 ml-2">
              (When the vesting period begins)
            </span>
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholderText="Select start date and time"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">
            End Date
            <span className="text-xs text-slate-400 ml-2">
              (When 100% of tokens will be vested)
            </span>
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholderText="Select end date and time"
            minDate={startDate || undefined}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">
            Cliff Date
            <span className="text-xs text-slate-400 ml-2">
              (Date before which no tokens can be claimed)
            </span>
          </label>
          <DatePicker
            selected={cliffDate}
            onChange={(date) => setCliffDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholderText="Select cliff date and time"
            minDate={startDate || undefined}
            maxDate={endDate || undefined}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">
            Total Allocation
            <span className="text-xs text-slate-400 ml-2">
              (Total number of tokens to be vested)
            </span>
          </label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter total token amount"
          />
        </div>

        <div className="text-xs text-slate-400 p-4 bg-slate-800/30 rounded-lg">
          <h3 className="font-medium mb-2">How Vesting Works:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Tokens will vest linearly between start and end dates</li>
            <li>No tokens can be claimed before the cliff date</li>
            <li>After cliff, vested tokens can be claimed at any time</li>
            <li>100% of tokens will be available at the end date</li>
          </ul>
        </div>

        <button
          className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={createEmployeeVesting.isPending}
        >
          {createEmployeeVesting.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
              <span>Creating...</span>
            </div>
          ) : (
            "Create Employee Vesting Schedule"
          )}
        </button>
      </div>
    </div>
  );
}
