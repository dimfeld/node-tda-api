import { OptionChain } from './option_chain';
import { Quote } from './quote';
export * from './quote';
export * from './option_chain';
export declare function occ_to_tda_symbol(occ: string): string;
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
    get_option_chain(options: GetOptionChainOptions): PromiseLike<OptionChain>;
    get_quotes(symbols: string | string[]): Promise<{
        [symbol: string]: Quote;
    }>;
}
