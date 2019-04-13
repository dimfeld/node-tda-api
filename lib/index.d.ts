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
export interface GetOptionChainOptions {
    symbol: string;
    from_date?: Date;
    to_date?: Date;
    include_nonstandard?: boolean;
    contract_type?: 'CALL' | 'PUT';
    near_the_money?: boolean;
}
export interface AuthData {
    client_id: string;
    refresh_token: string;
}
export declare class Api {
    auth: AuthData;
    access_token: string;
    constructor(auth: AuthData);
    init(): Promise<void>;
    private request;
    getOptionChain(options: GetOptionChainOptions): Promise<OptionChain>;
    getQuotes(symbols: string | string[]): Promise<{
        [symbol: string]: Quote;
    }>;
}
