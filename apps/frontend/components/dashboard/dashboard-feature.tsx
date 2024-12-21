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

const resources = [
  {
    title: "Solana Resources",
    description: "Essential Solana development tools",
    links: [
      { label: "Solana Explorer", href: "https://explorer.solana.com" },
      { label: "Solana Docs", href: "https://docs.solana.com" },
      { label: "SPL Token", href: "https://spl.solana.com/token" },
    ],
  },
  {
    title: "Developer Links",
    description: "Community and development resources",
    links: [
      {
        label: "Solana Stack Exchange",
        href: "https://solana.stackexchange.com",
      },
      { label: "Solana Cookbook", href: "https://solanacookbook.com" },
      { label: "Solana Playground", href: "https://beta.solpg.io" },
    ],
  },
];

export default function DashboardFeature() {
  return (
    <div>
      <AppHero
        title="Chain Cliff"
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

        {/* Resources Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="glass-panel p-6 rounded-xl border border-slate-700/50"
            >
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {resource.title}
              </h3>
              <p className="text-slate-400 mb-4">{resource.description}</p>
              <div className="space-y-3">
                {resource.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-slate-300 hover:text-purple-400 transition-colors"
                  >
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
