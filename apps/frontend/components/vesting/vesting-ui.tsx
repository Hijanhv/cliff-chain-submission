"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { toast } from "react-hot-toast";

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
      toast.success(`Mint created successfully!`);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create mint: " + error.message);
    } finally {
      setIsCreatingMint(false);
    }
  };

  const createVesting = async () => {
    if (!program || !wallet.publicKey) {
      toast.error("Program not ready or wallet not connected");
      return;
    }
    if (!companyName || !mintAddress) {
      toast.error("Enter a company name and mint address first");
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

      toast.success(`Vesting account created for ${companyName}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Error creating vesting account: " + err.message);
    } finally {
      setIsCreatingVesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Create New Token
        </h2>
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [cliffDate, setCliffDate] = useState<Date | null>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [isValidBeneficiary, setIsValidBeneficiary] = useState(false);

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? "",
    [accountQuery.data?.companyName]
  );

  const validateBeneficiary = (address: string) => {
    try {
      new PublicKey(address);
      setIsValidBeneficiary(true);
    } catch {
      setIsValidBeneficiary(false);
    }
  };

  useEffect(() => {
    validateBeneficiary(beneficiary);
  }, [beneficiary]);

  const handleSubmit = async () => {
    if (
      !startDate ||
      !endDate ||
      !cliffDate ||
      !totalAmount ||
      !beneficiary ||
      !isValidBeneficiary
    ) {
      toast.error("Please fill in all fields with valid values");
      return;
    }

    try {
      const beneficiaryPubkey = new PublicKey(beneficiary);
      const startTime = Math.floor(startDate.getTime() / 1000);
      const endTime = Math.floor(endDate.getTime() / 1000);
      const cliffTime = Math.floor(cliffDate.getTime() / 1000);
      const amount = parseInt(totalAmount);

      if (startTime >= endTime) {
        toast.error("End date must be after start date");
        return;
      }

      if (cliffTime < startTime || cliffTime > endTime) {
        toast.error("Cliff date must be between start and end dates");
        return;
      }

      await createEmployeeVesting.mutateAsync({
        startTime,
        endTime,
        totalAmount: amount,
        cliffTime,
        beneficiary: beneficiaryPubkey,
      });

      toast.success("Employee vesting schedule created successfully!");

      // Clear form on success
      setStartDate(null);
      setEndDate(null);
      setCliffDate(null);
      setTotalAmount("");
      setBeneficiary("");
    } catch (err: any) {
      console.error(err);
      toast.error("Error creating employee vesting: " + err.message);
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
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              beneficiary && !isValidBeneficiary
                ? "border-red-500"
                : "border-slate-700"
            }`}
            placeholder="Enter beneficiary wallet address"
          />
          {beneficiary && !isValidBeneficiary && (
            <p className="mt-1 text-xs text-red-500">
              Please enter a valid Solana address
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholderText="Select start date and time"
              wrapperClassName="w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-1">Cliff Date</label>
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
              wrapperClassName="w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-1">End Date</label>
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
              wrapperClassName="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-300 mb-1">
            Total Token Allocation
          </label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter total token amount"
            min="0"
          />
        </div>

        {(startDate || endDate || cliffDate) && (
          <div className="p-4 bg-slate-800/30 rounded-lg space-y-2">
            <h3 className="text-sm font-medium text-slate-300">
              Schedule Summary
            </h3>
            {startDate && (
              <p className="text-xs text-slate-400">
                Vesting Starts: {startDate.toLocaleString()}
              </p>
            )}
            {cliffDate && (
              <p className="text-xs text-slate-400">
                Cliff Period Ends: {cliffDate.toLocaleString()}
              </p>
            )}
            {endDate && (
              <p className="text-xs text-slate-400">
                Vesting Ends: {endDate.toLocaleString()}
              </p>
            )}
          </div>
        )}

        <button
          className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={
            createEmployeeVesting.isPending ||
            !startDate ||
            !endDate ||
            !cliffDate ||
            !totalAmount ||
            !isValidBeneficiary
          }
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
