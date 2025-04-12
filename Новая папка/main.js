import {
    EthereumClient,
    w3mConnectors,
    w3mProvider,
    WagmiCore,
    WagmiCoreChains,
    WagmiCoreConnectors
  } from "https://unpkg.com/@web3modal/ethereum@2.6.2";
  import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.6.2";
  
  // Extract necessary functions from WagmiCore (omit contract-related functions)
  const { configureChains, createConfig } = WagmiCore;
  
  // 1. Define custom chains (in addition to default chains provided by WagmiCoreChains)
  const baseChain = {
    id: 8453,
    name: "Base",
    network: "base",
    nativeCurrency: {
      decimals: 18,
      name: "Ethereum",
      symbol: "ETH",
    },
    rpcUrls: {
      public: { http: ["https://mainnet.base.org"] },
      default: { http: ["https://mainnet.base.org"] },
    },
    blockExplorers: {
      etherscan: { name: "BaseScan", url: "https://basescan.org" },
      default: { name: "BaseScan", url: "https://basescan.org" },
    },
  };
  
  const arbitrumChain = {
    id: 42161,
    name: "Arbitrum",
    network: "arbitrum",
    nativeCurrency: {
      decimals: 18,
      name: "Ethereum",
      symbol: "ETH",
    },
    rpcUrls: {
      public: { http: ["https://arb1.arbitrum.io/rpc"] },
      default: { http: ["https://arb1.arbitrum.io/rpc"] },
    },
    blockExplorers: {
      etherscan: { name: "Arbiscan", url: "https://arbiscan.io" },
      default: { name: "Arbiscan", url: "https://arbiscan.io" },
    },
  };
  
  // (Optional) Define a Solana chain for reference – note that WalletConnect v2 primarily targets EVM chains
  const solanaChain = {
    id: 9999, // Custom ID for reference
    name: "Solana",
    network: "solana",
    nativeCurrency: {
      decimals: 9,
      name: "Solana",
      symbol: "SOL",
    },
    rpcUrls: {
      public: { http: ["https://api.mainnet-beta.solana.com"] },
      default: { http: ["https://api.mainnet-beta.solana.com"] },
    },
    blockExplorers: {
      default: { name: "Solana Explorer", url: "https://explorer.solana.com" },
    },
  };
  
  // 2. Build an array of supported chains for WalletConnect
  const chains = [];
  // Include some default chains from WagmiCoreChains if available
  if (WagmiCoreChains.bsc) chains.push(WagmiCoreChains.bsc);       // Binance Smart Chain
  if (WagmiCoreChains.mainnet) chains.push(WagmiCoreChains.mainnet); // Ethereum Mainnet
  
  // Add custom chains defined above
  chains.push(baseChain);
  chains.push(arbitrumChain);
  
  // Add additional popular chains if supported by WagmiCoreChains
  if (WagmiCoreChains.polygon) chains.push(WagmiCoreChains.polygon);
  if (WagmiCoreChains.avalanche) chains.push(WagmiCoreChains.avalanche);
  if (WagmiCoreChains.optimism) chains.push(WagmiCoreChains.optimism);
  
  console.log("Active chains configured for WalletConnect:", chains);
  
  // Your WalletConnect/Web3Modal project ID (replace with your own project ID if needed)
  const projectId = "2aca272d18deb10ff748260da5f78bfd";
  
  // 3. Configure the wagmi client with the chains and WalletConnect provider
  const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      ...w3mConnectors({ chains, version: 2, projectId }),  // WalletConnect V2 connectors for the defined chains
      new WagmiCoreConnectors.CoinbaseWalletConnector({
        chains,
        options: {
          appName: "WalletConnect Integration Example",
        },
      }),
    ],
    publicClient,
  });
  
  // 4. Initialize Ethereum client and Web3Modal (WalletConnect modal)
  const ethereumClient = new EthereumClient(wagmiConfig, chains);
  export const web3Modal = new Web3Modal(
    {
      projectId,
      themeMode: "dark",  // UI theme for the modal (dark mode)
      walletImages: {
        // Example of customizing a wallet icon (Safe wallet icon)
        safe: "https://pbs.twimg.com/profile_images/1566773491764023297/IvmCdGnM_400x400.jpg",
      },
      chainImages: {
        // Custom icons for some chains
        56:  "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",        // BSC
        1:   "https://assets.coingecko.com/coins/images/279/small/ethereum.png",           // Ethereum
        42161:"https://altcoinsbox.com/wp-content/uploads/2023/03/arbitrum-logo.png",      // Arbitrum
        8453:"https://payload-marketing.moonpay.com/api/media/file/base%20logo.webp",      // Base
        137: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",           // Polygon
        9999:"https://assets.coingecko.com/coins/images/4128/small/solana.png",            // Solana (for reference)
      },
      // Optionally include non-EVM wallets (e.g., Phantom for Solana) in the WalletConnect modal
      mobileWallets: [
        {
          id: "phantom",
          name: "Phantom",
          links: {
            native: "phantom://",
            universal: "https://phantom.app",
          },
        },
      ],
      desktopWallets: [
        {
          id: "phantom",
          name: "Phantom",
          links: {
            native: "phantom://",
            universal: "https://phantom.app",
          },
        },
      ],
      // (Additional configuration like recommended or excluded wallets can be added here)
    },
    ethereumClient
  );
  
  // 5. Set up UI event handlers for connecting wallet
  document.addEventListener("DOMContentLoaded", function() {
    // Find the Connect Wallet button in the DOM
    const connectButton = document.getElementById("connectButton");
    if (connectButton) {
      // When the button is clicked, open the WalletConnect modal
      connectButton.addEventListener("click", () => {
        web3Modal.openModal();
      });
    }
  
    // Log the available chains in the console (for debugging)
    console.log("Ethereum client chains:", ethereumClient.chains);
  
    // Subscribe to wallet account changes (e.g., connect/disconnect events)
    ethereumClient.watchAccount((account) => {
      if (account.address) {
        console.log("✅ Wallet connected:", account.address);
        // (Optional: update UI to show the connected wallet address)
      } else {
        console.log("⚠️ Wallet disconnected.");
        // (Optional: update UI to reflect the wallet is disconnected)
      }
    });
  });