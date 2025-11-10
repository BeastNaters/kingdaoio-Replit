export type Chain = 'ETH' | 'SOL';

export interface DaoWallet {
  label: string;
  address: string;
  chain: Chain;
  chainId?: number | string;
}

export interface DaoWalletGroups {
  controller: DaoWallet[];
  multisigs: DaoWallet[];
  tactical: DaoWallet[];
}

export const daoWallets: DaoWalletGroups = {
  controller: [
    {
      label: "Controller (ETH)",
      address: "0xd8a7113a701a4eccc5f8aa85a621ac42104d6eb8",
      chain: "ETH",
      chainId: 1
    },
    {
      label: "Controller (SOL)",
      address: "Gok7zfZ2aZ6ftvYtXhRR2KR8dzu2cKZLDeqvDhNQvipT",
      chain: "SOL",
      chainId: "mainnet-beta"
    },
    {
      label: "Deployer Wallet (ETH)",
      address: "0xB26ACB02661620C7533A20CC709afDECFe3b94DB",
      chain: "ETH",
      chainId: 1
    },
    {
      label: "KING Developer Wallet",
      address: "0x17c08C6445401736A31f50aFbCca7258623F0Cfb",
      chain: "ETH",
      chainId: 1
    },
  ],
  multisigs: [
    {
      label: "DAO Fund (ETH)",
      address: "0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF",
      chain: "ETH",
      chainId: 1
    },
    {
      label: "Reward Wallet (ETH)",
      address: "0x24901F1b9b41e853778107CD737cC426b456fC95",
      chain: "ETH",
      chainId: 1
    },
    {
      label: "Incentivization Bucket Wallet (ETH)",
      address: "0x00239b99703b773B0A1B6A33f4691867aF071d5A",
      chain: "ETH",
      chainId: 1
    },
  ],
  tactical: [
    {
      label: "Dogepound & ZK Race",
      address: "0x1C0F0b94B3130Bd7F3c93417D4c19e9E80C56f74",
      chain: "ETH",
      chainId: 1
    },
    {
      label: "Wilder World",
      address: "0x8CC04643143caFa204b2797459AA3cb82cd41283",
      chain: "ETH",
      chainId: 1
    },
  ],
};

export interface DcaToken {
  symbol: string;
  amount: number;
}

export const dcaPortfolio: DcaToken[] = [
  { symbol: "BTC", amount: 0.3153 },
  { symbol: "ETH", amount: 10.04 },
  { symbol: "SOL", amount: 94 },
  { symbol: "AVAX", amount: 242.51 },
  { symbol: "LINK", amount: 424.42 },
  { symbol: "ADA", amount: 9072.07 },
  { symbol: "XRP", amount: 2310.77 },
];

export interface TreasuryToken {
  symbol: string;
  amount: number;
}

export const otherTreasuryTokens: TreasuryToken[] = [
  { symbol: "ZERC", amount: 7118 },
  { symbol: "RLB", amount: 6122570 },
  { symbol: "PYR", amount: 500 },
  { symbol: "WILD", amount: 1049 },
  { symbol: "JUP", amount: 7575 },
  { symbol: "PENGU", amount: 3795 },
  { symbol: "SOL", amount: 4.35 },
  { symbol: "OP", amount: 1190.268 },
];
