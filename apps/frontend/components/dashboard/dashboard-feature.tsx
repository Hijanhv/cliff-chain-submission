"use client";

import { AppHero } from "../ui/ui-layout";
import Link from "next/link";

const vestingActions = [
  {
    title: "Vesting Dashboard",
    description: "Set up and manage token vesting schedules",
    href: "/vesting",
    icon: "🗓️",
  },
  {
    title: "My Wallet",
    description: "View your wallet details and token balances",
    href: "/account",
    icon: "👤",
  },
  {
    title: "Network Settings",
    description: "Configure your Solana network connection",
    href: "/clusters",
    icon: "⚙️",
  },
];

export default function DashboardFeature() {
  return (
    <div>
      <AppHero
        title="Cliff Chain"
        subtitle="Secure token vesting platform on Solana"
      />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {vestingActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="glass-panel p-6 rounded-xl hover:shadow-lg transition-all duration-200 border border-slate-700/50 hover:border-purple-500/50 group"
            >
              <div className="text-3xl mb-4">{action.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-slate-400 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
