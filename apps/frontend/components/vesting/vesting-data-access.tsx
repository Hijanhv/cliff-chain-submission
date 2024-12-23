"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getVestingProgram } from "@/utils/vesting";
import { PROGRAM_ID } from "@/constants";
import * as web3 from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

interface CreateVestingArgs {
  companyName: string;
  mint: string;
}

interface CreateEmployeeArgs {
  startTime: number;
  endTime: number;
  totalAmount: number;
  cliffTime: number;
  beneficiary: PublicKey;
}

export function useVestingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(() => PROGRAM_ID, []);
  const program = getVestingProgram(provider);

  const accounts = useQuery({
    queryKey: ["vesting", "all", { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ["vestingAccount", "create", { cluster }],
    mutationFn: ({ companyName, mint }) =>
      program.methods
        .createVestingAccount(companyName)
        .accounts({ mint: new PublicKey(mint), tokenProgram: TOKEN_PROGRAM_ID })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to initialize account"),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createVestingAccount,
  };
}

export function useVestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useVestingProgram();
  const provider = useAnchorProvider();

  const accountQuery = useQuery({
    queryKey: ["vesting", "fetch", { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  });

  const createEmployeeVesting = useMutation<string, Error, CreateEmployeeArgs>({
    mutationKey: ["vesting", "close", { cluster, account }],
    mutationFn: async ({
      startTime,
      endTime,
      totalAmount,
      cliffTime,
      beneficiary,
    }) => {
      if (!provider) throw new Error("Provider not found");

      const [employeePda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("employee_vesting"),
          beneficiary.toBuffer(),
          account.toBuffer(),
        ],
        program.programId
      );

      return program.methods
        .createEmployeeVesting(
          new BN(startTime),
          new BN(endTime),
          new BN(totalAmount),
          new BN(cliffTime)
        )
        .accounts({
          owner: provider.wallet.publicKey,
          beneficiary: beneficiary,
          vestingAccount: account,
          employeeAccount: employeePda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
    onError: (error) => {
      console.error("Error creating employee vesting:", error);
      toast.error(`Failed to create employee vesting: ${error.message}`);
    },
  });

  return {
    accountQuery,
    createEmployeeVesting,
  };
}
