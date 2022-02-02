import { Connection, PublicKey } from "@solana/web3.js";
import fetch from "isomorphic-fetch";

import { Jupiter, RouteInfo, TOKEN_LIST_URL } from "@jup-ag/core";
import {
  ENV,
  INPUT_MINT_ADDRESS,
  OUTPUT_MINT_ADDRESS,
  SOLANA_RPC_ENDPOINT,
  Token,
  USER_KEYPAIR,
  WALLET_PUBLIC_KEY
} from "./constants";


console.log('=================== process start ===================');

// 交換可能な通貨ペアの情報を取得する
const getPossiblePairsTokenInfo = ({
  tokens,
  routeMap,
  inputToken,
}: {
  tokens: Token[];
  routeMap: Map<string, string[]>;
  inputToken?: Token;
}) => {

  try {
    if (!inputToken) {
      return {};
    }

    const possiblePairs = inputToken
      ? routeMap.get(inputToken.address) || []
      : []; // SOL と交換可能なトークン・ミントの配列を返す

    const possiblePairsTokenInfo: { [key: string]: Token | undefined } = {};

    possiblePairs.forEach((address) => {
      possiblePairsTokenInfo[address] = tokens.find((t) => {
        return t.address == address;
      });
    });

    // Perform your conditionals here to use other outputToken
    // ここで条件分岐を行い、他のoutputTokenを使用する
    // const alternativeOutputToken = possiblePairsTokenInfo[USDT_MINT_ADDRESS]
    return possiblePairsTokenInfo;

  } catch (error) {
    throw error;
  }

};

// 交換ルートを取得する
const getRoutes = async ({
  jupiter,
  inputToken,
  outputToken,
  inputAmount,
  slippage,
}: {
  jupiter: Jupiter;
  inputToken?: Token;
  outputToken?: Token;
  inputAmount: number;
  slippage: number;
}) => {
  console.log(inputToken);
  console.log("==========");
  console.log(outputToken);

  try {
    if (!inputToken || !outputToken) {
      return null;
    }

    console.log("Getting routes");
    const inputAmountInSmallestUnits = inputToken
      ? Math.round(inputAmount * 10 ** inputToken.decimals)
      : 0;

    const routes =
      inputToken && outputToken
        ? (await jupiter.computeRoutes(
          new PublicKey(inputToken.address),
          new PublicKey(outputToken.address),
          inputAmountInSmallestUnits, // raw input amount of tokens
          slippage,
          true
        ))
        : null;

    if (routes && routes.routesInfos) {
      console.log("Possible number of routes:", routes.routesInfos.length);
      console.log("Best quote: ", routes.routesInfos[0].outAmount);
      return routes;
    } else {
      return null;
    }

  } catch (error) {
    throw error;
  }

};

// 通貨スワップを実行する
const executeSwap = async ({
  jupiter,
  route,
}: {
  jupiter: Jupiter;
  route: RouteInfo;
}) => {

  try {
    // Prepare execute exchange
    const { execute } = await jupiter.exchange({
      route,
    });
    // Execute swap
    const swapResult: any = await execute(); // Force any to ignore TS misidentifying SwapResult type

    if (swapResult.error) {
      console.log(swapResult.error);
    } else {
      console.log(`https://explorer.solana.com/tx/${swapResult.txid}`);
      console.log(
        `inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`
      );
      console.log(
        `inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`
      );
    }

  } catch (error) {
    throw error;
  }

};


// 通貨
const coinAddess = "So11111111111111111111111111111111111111112"; // SOL
// ペア solana USDC token Address　で検索した
const pairAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC (SPL Token Address)
//const pairAddress = "Ga2AXHpfAF6mv2ekZwcsJFqu7wB4NV331qNH7fW9Nst8";

// メイン処理
const main = async () => {

  try {
    const connection = new Connection(SOLANA_RPC_ENDPOINT); // Setup Solana RPC connection
    const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json(); // Fetch token list from Jupiter API
    //console.log(tokens);

    const beforeBalance = await connection.getBalance(new PublicKey(WALLET_PUBLIC_KEY));
    console.log(`wallet balance: ${beforeBalance}`);

    //  Load Jupiter
    const jupiter = await Jupiter.load({
      connection,
      cluster: ENV,
      user: USER_KEYPAIR, // or public key
    });

    //  Get routeMap, which maps each tokenMint and their respective tokenMj  ints that are swappable
    const routeMap = jupiter.getRouteMap();

    // // If you know which input/output pair you want 欲しい入出力ペアが決まっている場合
    //const inputToken = tokens.find((t) => t.address == INPUT_MINT_ADDRESS); // USDC Mint Info
    const inputToken = tokens.find((t) => t.address == coinAddess);

    //const outputToken = tokens.find((t) => t.address == OUTPUT_MINT_ADDRESS); // USDT Mint Info
    const outputToken = tokens.find((t) => t.address == pairAddress);

    // // Alternatively, find all possible outputToken based on your inputToken
    // あるいは、inputToken に基づいて、可能なすべての outputToken を探します。
    const possiblePairsTokenInfo = await getPossiblePairsTokenInfo({
      tokens,
      routeMap,
      inputToken,
    });
    
    // console.log(possiblePairsTokenInfo);
    // console.log("possiblePairsTokenInfo============")

    const routes = await getRoutes({
      jupiter,
      inputToken,
      outputToken,
      inputAmount: 0.1, // 1 unit in UI0831
      slippage: 1, // 1% slippage
    });
    //console.log(routes);

    // Routes are sorted based on outputAmount, so ideally the first route is the best.
    // ルートはoutputAmountを基準にソートされるので、理想的には最初のルートがベストです。
    const routeInfo = routes?.routesInfos[0] as RouteInfo;

    if (routeInfo != null) {
      //await executeSwap({ jupiter, route: routeInfo });

      // 残高を取得

    }

  } catch (error) {
    console.log({ error });
  }
};

main();
