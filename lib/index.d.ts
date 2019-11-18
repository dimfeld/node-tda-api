import { OptionChain } from './option_chain';
import { Quote } from './quote';
export * from './quote';
export * from './option_chain';
export declare function optionInfoFromSymbol(symbol: string): {
    underlying: string;
    expiration: string;
    call: boolean;
    strike: number;
};
export declare function occToTdaSymbol(occ: string): string;
export declare function tdaToOccSymbol(tda: string): string;
export interface GetOptionChainOptions {
    symbol: string;
    from_date?: Date;
    to_date?: Date;
    include_nonstandard?: boolean;
    contract_type?: 'CALL' | 'PUT';
    near_the_money?: boolean;
}
export interface GetTransactionsOptions {
    symbol?: string;
    startDate?: string;
    endDate?: string;
}
export interface GetTradeOptions {
    startDate?: string;
    endDate?: string;
}
export interface AuthData {
    client_id: string;
    refresh_token: string;
}
export declare class Api {
    auth: AuthData;
    access_token: string;
    accountId: string;
    autorefresh: boolean;
    constructor(auth: AuthData, autorefresh?: boolean);
    refresh(): Promise<void>;
    init(): Promise<void>;
    private request;
    getOptionChain(options: GetOptionChainOptions): Promise<OptionChain>;
    getQuotes(symbols: string | string[]): Promise<{
        [symbol: string]: Quote;
    }>;
    getAccounts(): Promise<any>;
    getMainAccount(): Promise<any>;
    getTransactionHistory(options?: GetTransactionsOptions): Promise<any>;
    getTrades(options?: GetTradeOptions): Promise<{
        id: any;
        traded: any;
        price: any;
        commissions: any;
        legs: {
            symbol: string;
            price: number;
            size: number;
        }[];
    }[]>;
}
