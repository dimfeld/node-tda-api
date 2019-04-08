export declare enum AssetType {
    Option = "OPTION",
    Equity = "EQUITY",
    ETF = "ETF"
}
export interface Quote {
    assetType: AssetType;
    symbol: string;
    description: string;
    bidPrice: number;
    bidSize: number;
    bidId: string;
    askPrice: number;
    askSize: number;
    askId: string;
    lastPrice: number;
    lastSize: number;
    lastId: string;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    bidTick: string;
    closePrice: number;
    netChange: number;
    totalVolume: number;
    quoteTimeInLong: number;
    tradeTimeInLong: number;
    mark: number;
    exchange: string;
    exchangeName: string;
    marginable: boolean;
    shortable: boolean;
    volatility: number;
    digits: number;
    "52WkHigh": number;
    "52WkLow": number;
    nAV: number;
    peRatio: number;
    divAmount: number;
    divYield: number;
    divDate: string;
    securityStatus: string;
    regularMarketLastPrice: number;
    regularMarketLastSize: number;
    regularMarketNetChange: number;
    regularMarketTradeTimeInLong: number;
    delayed: boolean;
}
