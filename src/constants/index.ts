import { Cluster } from "@solana/web3.js";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

require('dotenv').config()

// Endpoints, connection
export const ENV: Cluster = (process.env.cluster as Cluster) || "mainnet-beta";
export const SOLANA_RPC_ENDPOINT = ENV === "devnet"
    ? 'https://api.devnet.solana.com'
    //: "https://api.mainnet-beta.solana.com";
    : "https://solana-api.projectserum.com";
//export const SOLANA_RPC_ENDPOINT = "https://solana-api.projectserum.com";

// Wallets
export const WALLET_PUBLIC_KEY  : string = process.env.WALLET_PUBLIC_KEY || "";
export const USER_PUBLIC_KEY : Buffer = bs58.decode(WALLET_PUBLIC_KEY);
export const WALLET_PRIVATE_KEY : string = process.env.WALLET_PRIVATE_KEY || "PASTE YOUR WALLET PRIVATE KEY";
export const USER_PRIVATE_KEY : Buffer = bs58.decode(WALLET_PRIVATE_KEY);
export const USER_KEYPAIR : Keypair = Keypair.fromSecretKey(USER_PRIVATE_KEY);

// Token Mints
export const INPUT_MINT_ADDRESS =
    ENV === "devnet"
        ? "So11111111111111111111111111111111111111112" // SOL
        : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
export const OUTPUT_MINT_ADDRESS = ENV === "devnet"
    ? "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" // SRM
    : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT

// Interface
export interface Token {
    chainId: number; // 101,
    address: string; // '8f9s1sUmzUbVZMoMh6bufMueYH1u4BJSM57RCEvuVmFp',
    symbol: string; // 'TRUE',
    name: string; // 'TrueSight',
    decimals: number; // 9,
    logoURI: string; // 'https://i.ibb.co/pKTWrwP/true.jpg',
    tags: string[]; // [ 'utility-token', 'capital-token' ]
}
