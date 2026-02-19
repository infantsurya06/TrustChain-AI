import { DocumentMetadata, DocumentStatus, NetworkType, UserRole, GasStrategy } from '../types';

// ==========================================
// 1. Configuration & Type Definitions
// ==========================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// RBAC: Wallet Address to Role Mapping (Simulating Smart Contract Registry)
export const RBAC_REGISTRY: Record<string, UserRole> = {
  '0xAdminKey88888888888888888888888888888888': 'ADMIN',
  '0xIssuerKey1234567890123456789012345678901': 'ISSUER',
  '0xVerifierKey99999999999999999999999999999': 'VERIFIER',
  '0xGuestKey00000000000000000000000000000000': 'GUEST'
};

export const getRoleFromAddress = (address: string): UserRole => {
  return RBAC_REGISTRY[address] || 'GUEST';
};

export interface NetworkConfig {
  name: string;
  blockTimeMs: number;
  currency: string;
  chainId: number;
  type: 'EVM' | 'FABRIC';
  rpcEndpoint: string;
  gasPriceGwei: number; // Base gas price for estimation
}

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  SEPOLIA: { 
    name: 'Sepolia Testnet', 
    blockTimeMs: 12000, 
    currency: 'SepoliaETH', 
    chainId: 11155111,
    type: 'EVM',
    rpcEndpoint: 'https://rpc.sepolia.org',
    gasPriceGwei: 20
  },
  MAINNET: { 
    name: 'Ethereum Mainnet', 
    blockTimeMs: 12000, 
    currency: 'ETH', 
    chainId: 1,
    type: 'EVM',
    rpcEndpoint: 'https://mainnet.infura.io/v3/YOUR_KEY',
    gasPriceGwei: 45 // Higher for Mainnet
  },
  POLYGON: { 
    name: 'Polygon PoS', 
    blockTimeMs: 2200, 
    currency: 'MATIC', 
    chainId: 137,
    type: 'EVM',
    rpcEndpoint: 'https://polygon-rpc.com',
    gasPriceGwei: 150
  },
  BNB: { 
    name: 'BNB Smart Chain', 
    blockTimeMs: 3000, 
    currency: 'BNB', 
    chainId: 56,
    type: 'EVM',
    rpcEndpoint: 'https://bsc-dataseed.binance.org',
    gasPriceGwei: 5
  },
  AVALANCHE: { 
    name: 'Avalanche C-Chain', 
    blockTimeMs: 800, 
    currency: 'AVAX', 
    chainId: 43114,
    type: 'EVM',
    rpcEndpoint: 'https://api.avax.network/ext/bc/C/rpc',
    gasPriceGwei: 25
  },
  HYPERLEDGER: { 
    name: 'Hyperledger Fabric', 
    blockTimeMs: 200, 
    currency: 'N/A', 
    chainId: 0,
    type: 'FABRIC',
    rpcEndpoint: 'grpc://peer0.org1.example.com',
    gasPriceGwei: 0
  }
};

// Global Mock Registry (Simulates the distributed ledger state)
const GLOBAL_LEDGER: DocumentMetadata[] = [
  {
    id: 'doc_genesis_001',
    title: 'University Degree - John Doe',
    type: 'Certificate',
    issuerName: 'Massachusetts Institute of Technology',
    description: 'Bachelor of Science in Computer Science',
    createdAt: new Date().toISOString(),
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    status: DocumentStatus.ACTIVE,
    aiForgeryScore: 0.02,
    network: 'MAINNET'
  }
];

// ==========================================
// 2. Abstraction Layer (Strategy Pattern)
// ==========================================

interface ChainAdapter {
  connectWallet(roleRequest?: UserRole): Promise<string>;
  submitTransaction(doc: DocumentMetadata, strategy?: GasStrategy): Promise<DocumentMetadata>;
  fetchTransaction(hash: string): Promise<DocumentMetadata | null>;
  estimateGas(strategy?: GasStrategy): Promise<{ cost: string, usd: string }>;
}

// EVM Adapter (Ethereum, Polygon, BNB, Avalanche)
class EVMAdapter implements ChainAdapter {
  constructor(private config: NetworkConfig, private network: NetworkType) {}

  async connectWallet(roleRequest?: UserRole): Promise<string> {
    await delay(600);
    // Simulate finding the correct account from the wallet based on the requested simulation role
    // In a real app, this would just be window.ethereum.request({ method: 'eth_requestAccounts' })
    if (roleRequest === 'ADMIN') return '0xAdminKey88888888888888888888888888888888';
    if (roleRequest === 'ISSUER') return '0xIssuerKey1234567890123456789012345678901';
    if (roleRequest === 'VERIFIER') return '0xVerifierKey99999999999999999999999999999';
    return '0xGuestKey00000000000000000000000000000000';
  }

  async estimateGas(strategy: GasStrategy = GasStrategy.STANDARD): Promise<{ cost: string, usd: string }> {
    await delay(300);
    
    // Smart Contract Optimization Simulation
    // Standard Gas: 21000 base + 50000 data storage = ~71000 gas
    let gasUnits = 71000;
    let gasPriceMultiplier = 1;

    // OPTIMIZATION: Economy mode uses a "Batched Proxy" contract, sharing base gas across multiple hashes
    if (strategy === GasStrategy.ECONOMY) {
        gasUnits = 45000; // ~35% Gas Reduction via Batching
    } else if (strategy === GasStrategy.URGENT) {
        gasPriceMultiplier = 1.5; // High priority fee for next-block inclusion
    }

    const gwei = this.config.gasPriceGwei * gasPriceMultiplier;
    const ethCost = (gasUnits * gwei) / 1000000000;
    
    // Mock Exchange Rates
    const rates: Record<string, number> = {
        'ETH': 3200,
        'SepoliaETH': 0,
        'MATIC': 0.85,
        'BNB': 600,
        'AVAX': 40
    };
    
    const rate = rates[this.config.currency] || 0;
    const usdCost = (ethCost * rate).toFixed(4);
    
    return {
        cost: `~${ethCost.toFixed(6)} ${this.config.currency}`,
        usd: `$${usdCost}`
    };
  }

  async submitTransaction(doc: DocumentMetadata, strategy: GasStrategy = GasStrategy.STANDARD): Promise<DocumentMetadata> {
    console.log(`[EVM] Routing tx to Chain ID ${this.config.chainId} via ${this.config.rpcEndpoint} [Strategy: ${strategy}]`);
    
    // Simulate variable latency based on Gas Strategy
    let latency = this.config.blockTimeMs;
    if (strategy === GasStrategy.URGENT) latency = latency * 0.5; // Next block guarantee
    if (strategy === GasStrategy.ECONOMY) latency = latency * 1.5; // Wait for batch fill

    await delay(latency);
    
    const newDoc: DocumentMetadata = { ...doc, status: DocumentStatus.ACTIVE, network: this.network };
    GLOBAL_LEDGER.push(newDoc);
    return newDoc;
  }

  async fetchTransaction(hash: string): Promise<DocumentMetadata | null> {
    await delay(800);
    // Check Global Mock Ledger
    const found = GLOBAL_LEDGER.find(d => d.hash === hash || d.id === hash);
    return found || null;
  }
}

// Fabric Adapter (Hyperledger)
class FabricAdapter implements ChainAdapter {
  constructor(private config: NetworkConfig) {}

  async connectWallet(roleRequest?: UserRole): Promise<string> {
    await delay(300);
    if (roleRequest === 'ADMIN') return "Admin@org1.example.com";
    if (roleRequest === 'ISSUER') return "Issuer@org1.example.com";
    return "User1@org1.example.com";
  }

  async estimateGas(): Promise<{ cost: string; usd: string; }> {
      return { cost: "0.00", usd: "$0.00 (Enterprise Quota)" };
  }

  async submitTransaction(doc: DocumentMetadata): Promise<DocumentMetadata> {
    await delay(200);
    const newDoc: DocumentMetadata = { ...doc, status: DocumentStatus.ACTIVE, network: 'HYPERLEDGER' };
    GLOBAL_LEDGER.push(newDoc);
    return newDoc;
  }

  async fetchTransaction(hash: string): Promise<DocumentMetadata | null> {
    await delay(200);
    return GLOBAL_LEDGER.find(d => d.hash === hash) || null;
  }
}

// ==========================================
// 3. Service Facade
// ==========================================

export const BlockchainService = {
  getAdapter: (network: NetworkType): ChainAdapter => {
    const config = NETWORK_CONFIGS[network];
    if (config.type === 'FABRIC') return new FabricAdapter(config);
    return new EVMAdapter(config, network);
  },

  calculateHash: async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  connectWallet: async (network: NetworkType, roleRequest?: UserRole) => {
    return BlockchainService.getAdapter(network).connectWallet(roleRequest);
  },

  registerDocument: async (metadata: Omit<DocumentMetadata, 'id' | 'createdAt' | 'status'>, network: NetworkType, strategy: GasStrategy = GasStrategy.STANDARD) => {
    const doc: DocumentMetadata = {
      ...metadata,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      status: DocumentStatus.PENDING,
      network
    };
    return BlockchainService.getAdapter(network).submitTransaction(doc, strategy);
  },

  verifyDocument: async (hash: string, network: NetworkType) => {
    return BlockchainService.getAdapter(network).fetchTransaction(hash);
  },
  
  estimateGas: async (network: NetworkType, strategy: GasStrategy = GasStrategy.STANDARD) => {
      return BlockchainService.getAdapter(network).estimateGas(strategy);
  }
};