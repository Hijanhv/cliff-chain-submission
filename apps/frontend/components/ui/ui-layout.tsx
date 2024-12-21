"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import toast from "react-hot-toast";

export function AppHero({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="py-6 text-lg text-slate-400 font-light">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function AppModal({
  children,
  show,
  hide,
  title,
  submit,
  submitLabel,
  submitDisabled,
}: {
  children: ReactNode;
  show: boolean;
  hide: () => void;
  title: string;
  submit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
}) {
  if (!show) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="glass-panel p-6 sm:p-8 max-w-xl w-full mx-4 sm:mx-auto rounded-2xl">
        <h3 className="font-bold text-2xl mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          {title}
        </h3>
        <div className="space-y-4">{children}</div>
        <div className="modal-action">
          <button
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
            onClick={hide}
          >
            Close
          </button>
          {submit && (
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                submitDisabled
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
              }`}
              onClick={submit}
              disabled={submitDisabled}
            >
              {submitLabel || "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className="text-sm">
        <div>Transaction successful!</div>
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View on Explorer
        </a>
      </div>
    );
  };
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function UiLayout({
  children,
  links,
}: {
  children: React.ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 backdrop-blur-xl bg-slate-900/75">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
            >
              Token Vesting
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {links.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === path
                      ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <WalletMultiButton />
        </nav>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="glass-panel p-6">{children}</div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/75 backdrop-blur-xl">
        <div className="flex justify-around py-4">
          {links.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === path
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
