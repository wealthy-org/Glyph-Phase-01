"use client";

import React, { useState } from "react";
import { parseAbi, decodeEventLog } from "viem";

const CANONICAL_IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const REQUIRED_CHAIN_ID = 4663;
const REQUIRED_CHAIN_ID_HEX = "0x1237";
const TARGET_GLYPH_WALLET = "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C";
const AGENT_URI = "/agents/glyph.json";
const REGISTER_CALLDATA =
  "0xf2c298be000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000122f6167656e74732f676c7970682e6a736f6e0000000000000000000000000000";

const ABI = parseAbi([
  "function register(string calldata agentURI) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "event AgentRegistered(uint256 indexed agentId, string agentURI, address indexed owner)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

export default function MainnetRegisterPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [result, setResult] = useState<{
    agentId?: string;
    owner?: string;
    agentWallet?: string;
    tokenURI?: string;
    blockNumber?: string;
  } | null>(null);

  const connectWallet = async () => {
    setErrorMsg("");
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setErrorMsg("MetaMask not detected in your browser.");
      return;
    }

    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const currentChainIdHex = await ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(currentChainIdHex, 16);

      setAccount(accounts[0]);
      setChainId(currentChainId);

      if (currentChainId !== REQUIRED_CHAIN_ID) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: REQUIRED_CHAIN_ID_HEX }],
          });
          setChainId(REQUIRED_CHAIN_ID);
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: REQUIRED_CHAIN_ID_HEX,
                  chainName: "Robinhood Chain",
                  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
                  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
                },
              ],
            });
            setChainId(REQUIRED_CHAIN_ID);
          } else {
            throw switchError;
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect MetaMask");
    }
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setStatusMsg("");
    setResult(null);

    if (!account) {
      setErrorMsg("Please connect MetaMask first.");
      return;
    }

    if (account.toLowerCase() !== TARGET_GLYPH_WALLET.toLowerCase()) {
      setErrorMsg(
        `Connected account (${account}) does not match Target Primary Wallet (${TARGET_GLYPH_WALLET}). Please switch account in MetaMask.`
      );
      return;
    }

    if (chainId !== REQUIRED_CHAIN_ID) {
      setErrorMsg(`Please switch network to Robinhood Chain Mainnet (Chain ID ${REQUIRED_CHAIN_ID}).`);
      return;
    }

    setIsSubmitting(true);
    setStatusMsg("Prompting MetaMask to sign and broadcast register('/agents/glyph.json')...");

    try {
      const ethereum = (window as any).ethereum;
      const hash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: CANONICAL_IDENTITY_REGISTRY,
            data: REGISTER_CALLDATA,
            value: "0x0",
          },
        ],
      });

      setTxHash(hash);
      setStatusMsg(`Transaction broadcast! Hash: ${hash}. Waiting for block confirmation...`);
      await pollReceipt(hash);
    } catch (err: any) {
      setErrorMsg(err.message || "Transaction rejected or failed.");
      setIsSubmitting(false);
    }
  };

  const handleVerifyManualTx = async () => {
    if (!txHash || !txHash.startsWith("0x")) {
      setErrorMsg("Please enter a valid 0x transaction hash.");
      return;
    }
    setErrorMsg("");
    setStatusMsg("Querying transaction receipt from Robinhood Chain Mainnet...");
    setIsSubmitting(true);
    await pollReceipt(txHash);
  };

  const pollReceipt = async (hash: string) => {
    try {
      const ethereum = (window as any).ethereum;
      let receipt: any = null;
      let attempts = 0;

      while (!receipt && attempts < 30) {
        attempts++;
        receipt = await ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (!receipt) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      if (!receipt) {
        setStatusMsg("Transaction is pending. Please verify again shortly.");
        setIsSubmitting(false);
        return;
      }

      if (receipt.status !== "0x1") {
        setErrorMsg("Transaction reverted on-chain.");
        setIsSubmitting(false);
        return;
      }

      setStatusMsg("Transaction confirmed! Decoding minted Agent ID...");

      let mintedId: string | undefined;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "AgentRegistered") {
            mintedId = (decoded.args as any).agentId.toString();
            break;
          }
          if (decoded.eventName === "Transfer") {
            mintedId = (decoded.args as any).tokenId.toString();
          }
        } catch {
          // ignore other logs
        }
      }

      setResult({
        agentId: mintedId || "Unknown (Check Blockscout)",
        owner: account || TARGET_GLYPH_WALLET,
        agentWallet: account || TARGET_GLYPH_WALLET,
        tokenURI: AGENT_URI,
        blockNumber: parseInt(receipt.blockNumber, 16).toString(),
      });
      setStatusMsg("Identity registered successfully on Robinhood Chain Mainnet!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to query transaction receipt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono max-w-4xl mx-auto">
      <div className="border border-white/20 p-6 rounded-lg bg-zinc-950/60 backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          GLYPH PHASE 4 — MAINNET IDENTITY REGISTRATION
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          Execute canonical ERC-8004 identity registration directly from your MetaMask wallet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6 bg-zinc-900/80 p-4 rounded border border-white/10">
          <div>
            <span className="text-zinc-500 block">Target Network</span>
            <span className="text-emerald-400 font-bold">Robinhood Chain Mainnet (4663)</span>
          </div>
          <div>
            <span className="text-zinc-500 block">IdentityRegistry Contract</span>
            <span className="text-zinc-200">{CANONICAL_IDENTITY_REGISTRY}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Required Sender / Owner</span>
            <span className="text-amber-400 font-bold">{TARGET_GLYPH_WALLET}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Agent URI</span>
            <span className="text-zinc-200">{AGENT_URI}</span>
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div className="mb-6 p-4 rounded bg-zinc-900 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">Connected MetaMask Account:</div>
              <div className="text-sm font-bold mt-1 text-white">
                {account ? (
                  <span
                    className={
                      account.toLowerCase() === TARGET_GLYPH_WALLET.toLowerCase()
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {account}{" "}
                    {account.toLowerCase() === TARGET_GLYPH_WALLET.toLowerCase()
                      ? "(Matched)"
                      : "(Mismatch — Switch to 0x1Ba1...)"}
                  </span>
                ) : (
                  <span className="text-zinc-500">Not connected</span>
                )}
              </div>
              {chainId && (
                <div className="text-xs text-zinc-400 mt-1">
                  Chain ID: {chainId} {chainId === REQUIRED_CHAIN_ID ? "✅" : "❌"}
                </div>
              )}
            </div>

            {!account ? (
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded transition"
              >
                Connect MetaMask
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition"
              >
                Re-check / Switch
              </button>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-4">
          <button
            onClick={handleRegister}
            disabled={
              !account ||
              account.toLowerCase() !== TARGET_GLYPH_WALLET.toLowerCase() ||
              chainId !== REQUIRED_CHAIN_ID ||
              isSubmitting
            }
            className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Processing..." : "Sign & Submit Registration via MetaMask"}
          </button>

          <div className="text-center text-xs text-zinc-500 py-2">— OR VERIFY EXISTING TRANSACTION —</div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste 0x transaction hash here to verify..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value.trim())}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/30"
            />
            <button
              onClick={handleVerifyManualTx}
              disabled={isSubmitting || !txHash}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition disabled:opacity-30"
            >
              Verify Tx
            </button>
          </div>
        </div>

        {/* Status / Output Messages */}
        {statusMsg && (
          <div className="mt-6 p-4 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
            {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 rounded bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
            ❌ {errorMsg}
          </div>
        )}

        {/* Successful Registration Result */}
        {result && (
          <div className="mt-6 p-5 rounded bg-zinc-900 border border-emerald-500/50 space-y-2 text-xs">
            <div className="text-emerald-400 font-bold text-sm mb-3">
              🎉 MAINNET IDENTITY REGISTERED SUCCESSFULLY!
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-500 block">Mainnet Agent ID:</span>
                <span className="text-white text-base font-bold">#{result.agentId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Confirmed Block:</span>
                <span className="text-zinc-300">{result.blockNumber}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Owner Address:</span>
                <span className="text-zinc-300">{result.owner}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Agent Wallet:</span>
                <span className="text-zinc-300">{result.agentWallet}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block">Blockscout Explorer:</span>
                <a
                  href={`https://robinhoodchain.blockscout.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline break-all"
                >
                  https://robinhoodchain.blockscout.com/tx/{txHash}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
