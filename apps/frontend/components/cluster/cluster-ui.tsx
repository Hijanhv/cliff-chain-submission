"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AppModal } from "../ui/ui-layout";
import { ClusterNetwork, useCluster } from "./cluster-data-access";
import { Connection } from "@solana/web3.js";

export function ExplorerLink({
  path,
  label,
  className,
}: {
  path: string;
  label: string;
  className?: string;
}) {
  const { getExplorerUrl } = useCluster();
  return (
    <a
      href={getExplorerUrl(path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  );
}

export function ClusterChecker({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: ["version", { cluster, endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getVersion(),
    retry: 1,
  });
  if (query.isLoading) {
    return null;
  }
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          Error connecting to cluster <strong>{cluster.name}</strong>
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() => query.refetch()}
        >
          Refresh
        </button>
      </div>
    );
  }
  return children;
}

export function ClusterUiSelect() {
  const { clusters, setCluster, cluster } = useCluster();
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-primary rounded-btn">
        {cluster.name}
      </label>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4"
      >
        {clusters.map((item) => (
          <li key={item.name}>
            <button
              className={`btn btn-sm ${
                item.active ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setCluster(item)}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClusterUiModal({
  hideModal,
  show,
}: {
  hideModal: () => void;
  show: boolean;
}) {
  const { addCluster } = useCluster();
  const [name, setName] = useState("");
  const [network, setNetwork] = useState<ClusterNetwork | undefined>();
  const [endpoint, setEndpoint] = useState("");

  return (
    <AppModal
      title={"Add Cluster"}
      hide={hideModal}
      show={show}
      submit={() => {
        try {
          new Connection(endpoint);
          if (name) {
            addCluster({ name, network, endpoint });
            hideModal();
          } else {
            console.log("Invalid cluster name");
          }
        } catch {
          console.log("Invalid cluster endpoint");
        }
      }}
      submitLabel="Save"
    >
      <input
        type="text"
        placeholder="Name"
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Endpoint"
        className="input input-bordered w-full"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
      />
      <select
        className="select select-bordered w-full"
        value={network}
        onChange={(e) => setNetwork(e.target.value as ClusterNetwork)}
      >
        <option value={undefined}>Select a network</option>
        <option value={ClusterNetwork.Devnet}>Devnet</option>
        <option value={ClusterNetwork.Testnet}>Testnet</option>
        <option value={ClusterNetwork.Mainnet}>Mainnet</option>
      </select>
    </AppModal>
  );
}

export function ClusterUiTable() {
  const { clusters, setCluster, deleteCluster } = useCluster();
  return (
    <div className="glass-panel overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left p-4 text-slate-400 font-medium">
              Name / Network / Endpoint
            </th>
            <th className="text-center p-4 text-slate-400 font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((item) => (
            <tr
              key={item.name}
              className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${
                item?.active ? "bg-slate-800/50" : ""
              }`}
            >
              <td className="p-4 space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xl ${
                      item?.active
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
                        : "text-slate-300 hover:text-indigo-400 cursor-pointer"
                    }`}
                  >
                    {item?.active ? (
                      item.name
                    ) : (
                      <button onClick={() => setCluster(item)}>
                        {item.name}
                      </button>
                    )}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Network: {item.network ?? "custom"}
                </span>
                <div className="text-xs text-slate-600">{item.endpoint}</div>
              </td>
              <td className="p-4 text-center">
                <button
                  disabled={item?.active}
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                  onClick={() => {
                    if (!window.confirm("Are you sure?")) return;
                    deleteCluster(item);
                  }}
                >
                  <IconTrash size={16} className="text-slate-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
