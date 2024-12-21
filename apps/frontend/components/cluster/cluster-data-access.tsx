"use client";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createContext, ReactNode, useContext } from "react";
import toast from "react-hot-toast";

export interface Cluster {
  name: string;
  endpoint: string;
  network?: ClusterNetwork;
  active?: boolean;
}

export enum ClusterNetwork {
  Mainnet = "mainnet-beta",
  Testnet = "testnet",
  Devnet = "devnet",
  Custom = "custom",
}

export const defaultClusters: Cluster[] = [
  {
    name: "devnet",
    endpoint: clusterApiUrl("devnet"),
    network: ClusterNetwork.Devnet,
  },
  { name: "local", endpoint: "http://localhost:8899" },
  {
    name: "testnet",
    endpoint: clusterApiUrl("testnet"),
    network: ClusterNetwork.Testnet,
  },
];

interface ClusterStore {
  cluster: Cluster;
  clusters: Cluster[];
  setCluster: (cluster: Cluster) => void;
  setClusters: (clusters: Cluster[]) => void;
}

const useClusterStore = create<ClusterStore>()(
  persist(
    (set) => ({
      cluster: defaultClusters[0],
      clusters: defaultClusters,
      setCluster: (cluster) => set({ cluster }),
      setClusters: (clusters) => set({ clusters }),
    }),
    {
      name: "solana-cluster-storage",
    }
  )
);

export interface ClusterProviderContext {
  cluster: Cluster;
  clusters: Cluster[];
  addCluster: (cluster: Cluster) => void;
  deleteCluster: (cluster: Cluster) => void;
  setCluster: (cluster: Cluster) => void;
  getExplorerUrl(path: string): string;
}

const Context = createContext<ClusterProviderContext>(
  {} as ClusterProviderContext
);

export function ClusterProvider({ children }: { children: ReactNode }) {
  const { cluster, clusters, setCluster, setClusters } = useClusterStore();

  const activeClusters = clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));

  const activeCluster =
    activeClusters.find((item) => item.active) || activeClusters[0];

  const value: ClusterProviderContext = {
    cluster: activeCluster,
    clusters: activeClusters.sort((a, b) => (a.name > b.name ? 1 : -1)),
    addCluster: (cluster: Cluster) => {
      try {
        new Connection(cluster.endpoint);
        setClusters([...clusters, cluster]);
      } catch (err) {
        toast.error(`${err}`);
      }
    },
    deleteCluster: (cluster: Cluster) => {
      setClusters(clusters.filter((item) => item.name !== cluster.name));
    },
    setCluster: (cluster: Cluster) => setCluster(cluster),
    getExplorerUrl: (path: string) =>
      `https://explorer.solana.com/${path}${getClusterUrlParam(activeCluster)}`,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}

function getClusterUrlParam(cluster: Cluster): string {
  let suffix = "";
  switch (cluster.network) {
    case ClusterNetwork.Devnet:
      suffix = "devnet";
      break;
    case ClusterNetwork.Mainnet:
      suffix = "";
      break;
    case ClusterNetwork.Testnet:
      suffix = "testnet";
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : "";
}
