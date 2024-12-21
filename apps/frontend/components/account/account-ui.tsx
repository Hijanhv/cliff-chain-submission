"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { IconRefresh } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppModal, ellipsify } from "../ui/ui-layout";
import { useCluster } from "../cluster/cluster-data-access";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
  useTransferSol,
  useGetEmployeeVestingAccounts,
  useClaimTokens,
} from "./account-data-access";
import { BN } from "@coral-xyz/anchor";

interface EmployeeVestingAccount {
  publicKey: PublicKey;
  account: {
    beneficiary: PublicKey;
    startTime: BN;
    endTime: BN;
    totalAmount: BN;
    totalWithdrawn: BN;
    cliffTime: BN;
    vestingAccount: PublicKey;
  };
  vestingAccount: {
    companyName: string;
    mint: PublicKey;
    owner: PublicKey;
    treasuryTokenAccount: PublicKey;
  };
}

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address });

  return (
    <div>
      <h1
        className="text-5xl font-bold cursor-pointer"
        onClick={() => query.refetch()}
      >
        {query.data ? <BalanceSol balance={query.data} /> : "..."} SOL
      </h1>
    </div>
  );
}
export function AccountChecker() {
  const { publicKey } = useWallet();
  if (!publicKey) {
    return null;
  }
  return <AccountBalanceCheck address={publicKey} />;
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster();
  const mutation = useRequestAirdrop({ address });
  const query = useGetBalance({ address });

  if (query.isLoading) {
    return null;
  }
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          You are connected to <strong>{cluster.name}</strong> but your account
          is not found on this cluster.
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() =>
            mutation.mutateAsync(1).catch((err) => console.log(err))
          }
        >
          Request Airdrop
        </button>
      </div>
    );
  }
  return null;
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const wallet = useWallet();
  const { cluster } = useCluster();
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  return (
    <div>
      <ModalAirdrop
        hide={() => setShowAirdropModal(false)}
        address={address}
        show={showAirdropModal}
      />
      <ModalReceive
        address={address}
        show={showReceiveModal}
        hide={() => setShowReceiveModal(false)}
      />
      <ModalSend
        address={address}
        show={showSendModal}
        hide={() => setShowSendModal(false)}
      />
      <div className="space-x-2">
        <button
          disabled={cluster.network?.includes("mainnet")}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowAirdropModal(true)}
        >
          Airdrop
        </button>
        <button
          disabled={wallet.publicKey?.toString() !== address.toString()}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowSendModal(true)}
        >
          Send
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowReceiveModal(true)}
        >
          Receive
        </button>
      </div>
    </div>
  );
}

export function AccountTokens({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false);
  const query = useGetTokenAccounts({ address });
  const client = useQueryClient();
  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-4">
      <div className="justify-between">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Token Accounts
          </h2>
          <div className="space-x-2">
            {query.isLoading ? (
              <div className="w-6 h-6 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
            ) : (
              <button
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={async () => {
                  await query.refetch();
                  await client.invalidateQueries({
                    queryKey: ["getTokenAccountBalance"],
                  });
                }}
              >
                <IconRefresh size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div className="text-slate-400">No token accounts found.</div>
          ) : (
            <div className="glass-panel overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-400 font-medium">
                      Public Key
                    </th>
                    <th className="text-left p-4 text-slate-400 font-medium">
                      Mint
                    </th>
                    <th className="text-right p-4 text-slate-400 font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map(({ account, pubkey }) => (
                    <tr
                      key={pubkey.toString()}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="p-4">
                        <ExplorerLink
                          path={`account/${pubkey.toString()}`}
                          label={ellipsify(pubkey.toString())}
                          className="text-indigo-400 hover:text-indigo-300"
                        />
                      </td>
                      <td className="p-4">
                        <ExplorerLink
                          path={`account/${account.data.parsed.info.mint}`}
                          label={ellipsify(account.data.parsed.info.mint)}
                          className="text-indigo-400 hover:text-indigo-300"
                        />
                      </td>
                      <td className="p-4 text-right font-mono">
                        {account.data.parsed.info.tokenAmount.uiAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {query.data.length > 5 && (
                <div className="p-4 text-center">
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Show Less" : "Show All"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address });
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="space-x-2">
          {query.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => query.refetch()}
            >
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </div>
      {query.isError && (
        <pre className="alert alert-error">
          Error: {query.error?.message.toString()}
        </pre>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300">
              <thead>
                <tr>
                  <th>Signature</th>
                  <th className="text-right">Slot</th>
                  <th>Block Time</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.signature}>
                    <th className="font-mono">
                      <ExplorerLink
                        path={`tx/${item.signature}`}
                        label={ellipsify(item.signature, 8)}
                      />
                    </th>
                    <td className="font-mono text-right">
                      <ExplorerLink
                        path={`block/${item.slot}`}
                        label={item.slot.toString()}
                      />
                    </td>
                    <td>
                      {new Date((item.blockTime ?? 0) * 1000).toISOString()}
                    </td>
                    <td className="text-right">
                      {item.err ? (
                        <div
                          className="badge badge-error"
                          title={JSON.stringify(item.err)}
                        >
                          Failed
                        </div>
                      ) : (
                        <div className="badge badge-success">Success</div>
                      )}
                    </td>
                  </tr>
                ))}
                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? "Show Less" : "Show All"}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountVesting({ address }: { address: PublicKey }) {
  const query = useGetEmployeeVestingAccounts({ address });
  const claimTokens = useClaimTokens();
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  const calculateVestedAmount = (account: EmployeeVestingAccount) => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = Math.floor(
      new Date(account.account.startTime.toNumber() * 1000).getTime() / 1000
    );
    const endTime = Math.floor(
      new Date(account.account.endTime.toNumber() * 1000).getTime() / 1000
    );
    const totalAmount = account.account.totalAmount.toNumber();
    const totalWithdrawn = account.account.totalWithdrawn.toNumber();
    const cliffTime = Math.floor(
      new Date(account.account.cliffTime.toNumber() * 1000).getTime() / 1000
    );

    if (now < startTime || now < cliffTime) {
      return 0;
    }

    if (now >= endTime) {
      return totalAmount - totalWithdrawn;
    }

    const timeElapsed = now - startTime;
    const totalDuration = endTime - startTime;
    const vestedAmount = Math.floor(
      (totalAmount * timeElapsed) / totalDuration
    );
    return Math.max(0, vestedAmount - totalWithdrawn);
  };

  const handleClaim = async (account: EmployeeVestingAccount) => {
    try {
      await claimTokens.mutateAsync({
        employeeAccount: account.publicKey,
        vestingAccount: account.account.vestingAccount,
        beneficiary: account.account.beneficiary,
        companyName: account.vestingAccount.companyName,
      });
    } catch (error) {
      console.error("Error claiming tokens:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="justify-between">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Vesting Schedules
          </h2>
          <div className="space-x-2">
            {query.isLoading ? (
              <div className="w-6 h-6 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
            ) : (
              <button
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => query.refetch()}
              >
                <IconRefresh size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
      {query.isSuccess && (
        <div>
          {!query.data?.length ? (
            <div className="text-slate-400">No vesting schedules found.</div>
          ) : (
            <div className="glass-panel overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-400 font-medium">
                      Company
                    </th>
                    <th className="text-right p-4 text-slate-400 font-medium">
                      Total Amount
                    </th>
                    <th className="text-right p-4 text-slate-400 font-medium">
                      Withdrawn
                    </th>
                    <th className="text-right p-4 text-slate-400 font-medium">
                      Available
                    </th>
                    <th className="text-right p-4 text-slate-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((item) => {
                    const vestedAmount = calculateVestedAmount(item);
                    return (
                      <tr
                        key={item.publicKey.toString()}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30"
                      >
                        <td className="p-4">
                          {item.vestingAccount.companyName}
                        </td>
                        <td className="p-4 text-right font-mono">
                          {item.account.totalAmount.toString()}
                        </td>
                        <td className="p-4 text-right font-mono">
                          {item.account.totalWithdrawn.toString()}
                        </td>
                        <td className="p-4 text-right font-mono">
                          {vestedAmount.toString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => handleClaim(item)}
                            disabled={
                              vestedAmount <= 0 || claimTokens.isPending
                            }
                          >
                            {claimTokens.isPending ? (
                              <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
                            ) : (
                              "Claim"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {query.data.length > 5 && (
                <div className="p-4 text-center">
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Show Less" : "Show All"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BalanceSol({ balance }: { balance: number }) {
  return (
    <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
  );
}

function ModalReceive({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  return (
    <AppModal title="Receive" hide={hide} show={show}>
      <p>Receive assets by sending them to your public key:</p>
      <code>{address.toString()}</code>
    </AppModal>
  );
}

function ModalAirdrop({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const mutation = useRequestAirdrop({ address });
  const [amount, setAmount] = useState("2");

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Airdrop"
      submitDisabled={!amount || mutation.isPending}
      submitLabel="Request Airdrop"
      submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  );
}

function ModalSend({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const wallet = useWallet();
  const mutation = useTransferSol({ address });
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");

  if (!address || !wallet.sendTransaction) {
    return <div>Wallet not connected</div>;
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Send"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount),
          })
          .then(() => hide());
      }}
    >
      <input
        disabled={mutation.isPending}
        type="text"
        placeholder="Destination"
        className="input input-bordered w-full"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  );
}
