"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink, Loader2, Sparkles, Wallet } from "lucide-react";

interface FundTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  currency?: string;
  safeWalletAddress?: string;
  onFundSuccess?: () => void;
}

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

export const FundTreasuryModal: React.FC<FundTreasuryModalProps> = ({
  isOpen,
  onClose,
  currentBalance = 1000,
  currency = "USD-SIM",
  safeWalletAddress = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS || "0x5358053a4dffbeeb05342d645e5cf62a6e9a0397",
  onFundSuccess,
}) => {
  const [amount, setAmount] = useState<number | string>(500);
  const [description, setDescription] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    newBalance: number;
    injected: string;
    day: number;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (safeWalletAddress) {
      navigator.clipboard.writeText(safeWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreset = (val: number) => {
    setAmount(val);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive dollar amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/treasury/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          description: description.trim() || undefined,
          txHash: txHash.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fund treasury.");
      }

      setSuccessData({
        newBalance: data.treasury.currentBalance,
        injected: data.event.result,
        day: data.event.day,
      });

      if (onFundSuccess) {
        onFundSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setAmount(500);
    setDescription("");
    setTxHash("");
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={handleReset}
    >
      <div
        className="w-full max-w-lg bg-[#080808] border border-[#202020] p-6 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-[#6fe39a] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AUTONOMOUS TREASURY // FUNDING</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="font-mono text-xs text-[#666666] hover:text-[#f3f3f4] border border-[#202020] px-2 py-0.5 cursor-pointer transition-colors"
            >
              ESC [×]
            </button>
          </div>
          <p className="text-xs text-[#85858a] font-light leading-relaxed">
            Inject capital into Glyph&apos;s autonomous pool to elevate available trading cash, expand policy margin headroom, and register a verifiable <span className="font-mono text-[#6fe39a]">TREASURY_FUNDED</span> event in the Life Log.
          </p>
          <div className="h-px bg-[#171717]" />
        </div>

        {/* Success State */}
        {successData ? (
          <div className="p-4 bg-[#051109] border border-[#1b4324] space-y-4">
            <div className="flex items-center gap-2 text-[#6fe39a] font-mono text-xs font-medium">
              <Check className="w-4 h-4 text-[#6fe39a]" />
              <span>CAPITAL INJECTION CONFIRMED</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs text-[#d0d0d4]">
              <div className="flex justify-between py-1 border-b border-[#122818]">
                <span className="text-[#85858a]">Injected Amount:</span>
                <span className="text-[#6fe39a] font-semibold">{successData.injected}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#122818]">
                <span className="text-[#85858a]">New Cash Balance:</span>
                <span className="text-[#f3f3f4]">
                  ${successData.newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#85858a]">Life Log Entry:</span>
                <span className="text-[#f3f3f4]">Day {successData.day} · Logged</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="font-mono text-xs px-4 py-2 bg-[#6fe39a] text-black font-medium hover:bg-[#85e9aa] transition-colors cursor-pointer"
              >
                DONE [CLOSE]
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Pool Context */}
            <div className="p-3 bg-[#030303] border border-[#171717] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#55555a]">ACTIVE POOL CASH</span>
                <span className="text-[#f3f3f4] font-medium">
                  ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>

              {safeWalletAddress && (
                <div className="pt-2 border-t border-[#121212] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#77777c]">
                    <Wallet className="w-3 h-3 text-[#55555a]" />
                    <span>Safe Smart Account:</span>
                    <span className="text-[#a0a0a5]">{safeWalletAddress.slice(0, 6)}...{safeWalletAddress.slice(-4)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="font-mono text-[10px] text-[#88888d] hover:text-[#f3f3f4] flex items-center gap-1 px-1.5 py-0.5 border border-[#1f1f1f] bg-[#0c0c0c] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-[#6fe39a]" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#77777c] tracking-wider">
                Quick Selection
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePreset(val)}
                    className={cn(
                      "py-1.5 px-2 font-mono text-xs border transition-all cursor-pointer text-center",
                      Number(amount) === val
                        ? "border-[#6fe39a] bg-[#6fe39a]/10 text-[#6fe39a] font-medium"
                        : "border-[#1c1c1c] bg-[#050505] text-[#85858a] hover:border-[#333333] hover:text-[#f3f3f4]"
                    )}
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#77777c] tracking-wider flex justify-between">
                <span>Funding Amount (USD-SIM)</span>
                <span className="text-[#444448]">MIN $1.00</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono text-sm text-[#77777c] pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  required
                  placeholder="500.00"
                  className="w-full bg-[#030303] border border-[#202020] text-[#f3f3f4] font-mono text-sm pl-7 pr-3 py-2 focus:outline-none focus:border-[#6fe39a] transition-colors"
                />
              </div>
            </div>

            {/* Note / Memo */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#77777c] tracking-wider">
                Funding Note / Reason <span className="text-[#444448]">(Optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Creator backer grant or seed top-up"
                maxLength={120}
                className="w-full bg-[#030303] border border-[#202020] text-[#f3f3f4] font-mono text-xs px-3 py-2 focus:outline-none focus:border-[#6fe39a] transition-colors placeholder:text-[#3a3a3e]"
              />
            </div>

            {/* Optional Onchain Tx Hash */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#77777c] tracking-wider">
                Robinhood Testnet Tx Hash <span className="text-[#444448]">(Optional)</span>
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#030303] border border-[#202020] text-[#f3f3f4] font-mono text-xs px-3 py-2 focus:outline-none focus:border-[#6fe39a] transition-colors placeholder:text-[#3a3a3e]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-[#140606] border border-[#441717] text-[#ff8888] font-mono text-xs">
                {error}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 font-mono text-xs text-[#77777c] hover:text-[#f3f3f4] transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 font-mono text-xs font-semibold bg-[#6fe39a] text-black hover:bg-[#85e9aa] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-[0_0_12px_rgba(111,227,154,0.15)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>INJECTING CAPITAL...</span>
                  </>
                ) : (
                  <span>FUND TREASURY</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
