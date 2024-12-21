"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTransactionToast } from "../ui/ui-layout";
import { getVestingProgram } from "@/utils/vesting";
import { useAnchorProvider } from "../solana/solana-provider";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-balance", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  });
}

export function useGetSignatures({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-signatures", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getConfirmedSignaturesForAddress2(address),
  });
}

export function useGetTokenAccounts({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: [
      "get-token-accounts",
      { endpoint: connection.rpcEndpoint, address },
    ],
    queryFn: async () => {
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);
      return [...tokenAccounts.value, ...token2022Accounts.value];
    },
  });
}

export function useTransferSol({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const wallet = useWallet();
  const client = useQueryClient();

  return useMutation({
    mutationKey: [
      "transfer-sol",
      { endpoint: connection.rpcEndpoint, address },
    ],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = "";
      try {
        const { transaction, latestBlockhash } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection: new Connection(
            connection.rpcEndpoint,
            connection.commitment
          ),
        });

        // @ts-expect-error - Handling version mismatch between different @solana/web3.js installations
        signature = await wallet.sendTransaction(transaction, connection);

        await connection.confirmTransaction(
          { signature, ...latestBlockhash },
          "confirmed"
        );

        console.log(signature);
        return signature;
      } catch (error: unknown) {
        console.log("error", `Transaction failed! ${error}`, signature);

        return;
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        transactionToast(signature);
      }
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });
}

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["airdrop", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ]);

      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
      ]);
    },
  });
}

export function useGetEmployeeVestingAccounts({
  address,
}: {
  address: PublicKey;
}) {
  const { connection } = useConnection();
  const provider = useAnchorProvider();
  const program = getVestingProgram(provider);

  return useQuery({
    queryKey: [
      "get-employee-vesting",
      { endpoint: connection.rpcEndpoint, address },
    ],
    queryFn: async () => {
      const accounts = await program.account.employeeAccount.all([
        {
          memcmp: {
            offset: 8, // After the discriminator
            bytes: address.toBase58(),
          },
        },
      ]);

      // Get vesting account details for each employee account
      const vestingDetails = await Promise.all(
        accounts.map(async (acc) => {
          const vestingAccount = await program.account.vestingAccount.fetch(
            acc.account.vestingAccount
          );
          return {
            ...acc,
            vestingAccount,
          };
        })
      );

      return vestingDetails;
    },
  });
}

export function useClaimTokens() {
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getVestingProgram(provider);
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeAccount,
      vestingAccount,
      beneficiary,
      companyName,
    }: {
      employeeAccount: PublicKey;
      vestingAccount: PublicKey;
      beneficiary: PublicKey;
      companyName: string;
    }) => {
      const [treasuryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
        program.programId
      );

      const vestingAccountData = await program.account.vestingAccount.fetch(
        vestingAccount
      );
      const mint = vestingAccountData.mint;

      // Get or create associated token account for beneficiary
      const beneficiaryAta = await getAssociatedTokenAddress(
        mint,
        beneficiary,
        false,
        TOKEN_PROGRAM_ID
      );

      const signature = await program.methods
        .claimTokens(companyName)
        .accounts({
          beneficiary,
          employeeAccount,
          vestingAccount,
          mint,
          treasuryTokenAccount: treasuryPda,
          employeeTokenAccount: beneficiaryAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return client.invalidateQueries({ queryKey: ["get-employee-vesting"] });
    },
    onError: (error) => {
      console.error("Failed to claim tokens:", error);
      toast.error(`Failed to claim tokens: ${error.message}`);
    },
  });
}

async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey;
  destination: PublicKey;
  amount: number;
  connection: Connection;
}): Promise<{
  transaction: VersionedTransaction;
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number };
}> {
  // Get the latest blockhash to use in our transaction
  const latestBlockhash = await connection.getLatestBlockhash();

  // Create instructions to send, in this case a simple transfer
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  ];

  // Create a new TransactionMessage with version and compile it to legacy
  const messageLegacy = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage();

  // Create a new VersionedTransaction which supports legacy and v0
  const transaction = new VersionedTransaction(messageLegacy);

  return {
    transaction,
    latestBlockhash,
  };
}
