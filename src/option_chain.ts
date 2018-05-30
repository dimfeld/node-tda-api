export interface UnderlyingInfo {
  symbol: string;
  description: string;
  change: number;
  percentChange: number;
  close: number;
  quoteTime: number;
  tradeTime: number;
  bid: number;
  ask: number;
  last: number;
  mark: number;
  markChange: number;
  markPercentChange: number;
  bidSize: number;
  askSize: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  totalVolume: number;
  exchangeName: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  delayed: boolean;
}

export interface ContractInfo {
  putCall: string;
  symbol: string;
  description: string;
  exchangeName: string;
  bid: number;
  ask: number;
  last: number;
  mark: number;
  bidSize: number;
  askSize: number;
  lastSize: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  closePrice: number;
  totalVolume: number;
  tradeDate: number;
  tradeTimeInLong: number;
  quoteTimeInLong: number;
  netChange: number;
  volatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  openInterest: number;
  timeValue: number;
  theoreticalOptionValue: number;
  theoreticalVolatility: number;
  optionDeliverablesList: any; // Not sure what this one is
  strikePrice: number;
  expirationDate: number;
  daysToExpiration: number;
  expirationType: string;
  lastTradingDay: number;
  multiplier: number;
  settlementType: string;
  deliverableNote: string;
  isIndexOption: boolean;
  percentChange: number;
  markChange: number;
  markPercentChange: number;
  inTheMoney: boolean;
  mini: boolean;
  nonStandard: boolean;
}

export interface StrikeMap {
  [strike:string] : ContractInfo[];
}

export interface ExpirationDateMap {
  [exp_date:string] : StrikeMap;
}

export interface OptionChain {
  symbol : string;
  status : string;
  underlying : UnderlyingInfo;
  callExpDateMap?: ExpirationDateMap;
  putExpDateMap? : ExpirationDateMap;
}
