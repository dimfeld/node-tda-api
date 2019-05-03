import * as _ from 'lodash';
import got = require('got');
import * as querystring from 'querystring';

import { OptionChain } from './option_chain';
import { Quote } from './quote';

export * from './quote';
export * from './option_chain';

const HOST = 'https://api.tdameritrade.com';

export function optionInfoFromSymbol(symbol: string) {
  let underlying = symbol.slice(0, 6).trim();
  if(symbol.length <= 6) {
    return {
      underlying,
      expiration: undefined,
      call: undefined,
      strike: undefined,
    };
  }

  return {
    underlying,
    expiration: symbol.slice(6, 12),
    call: symbol[12] === 'C',
    strike: +_.trimStart(symbol.slice(13)) / 1000,
  };
}

export function occToTdaSymbol(occ : string) {
  if(occ.length !== 21 || occ.indexOf('_') >= 0) {
    // Not an OCC-format option symbol. Just return it unmodified.
    return occ;
  }

  // Change from OCC format to the format that TDA expects.
  let info = optionInfoFromSymbol(occ);

  let side = info.call ? 'C' : 'P';

  // OCC expiration is YYMMDD. TDA is MMDDYY
  let expiration = `${info.expiration.slice(2, 4)}${info.expiration.slice(4, 6)}${info.expiration.slice(0, 2)}`;

  let dollars = _.trimStart(occ.slice(13, 18), ' 0');
  let cents_raw = _.trimEnd(occ.slice(18), ' 0');
  let cents = cents_raw ? `.${cents_raw}` : '';

  return `${info.underlying}_${expiration}${side}${dollars}${cents}`;
}

export interface GetOptionChainOptions {
  symbol: string;
  from_date?: Date;
  to_date?: Date;
  include_nonstandard?: boolean;
  contract_type?: 'CALL' | 'PUT';
  near_the_money? : boolean;
}

export interface GetTransactionsOptions {
  symbol? : string;
  startDate? : string;
  endDate? : string;
}

export interface AuthData {
  client_id : string;
  refresh_token : string;
}

export class Api {
  auth : AuthData;
  access_token : string;
  accountId: string;

  constructor(auth : AuthData) {
    this.auth = auth;
  }

  async init() {
    // Refresh the access token.
    let body = await got(`${HOST}/v1/oauth2/token`, {
      method: 'POST',
      form: true,
      body: {
        grant_type: 'refresh_token',
        refresh_token: this.auth.refresh_token,
        client_id: this.auth.client_id,
      },
    });

    let result = JSON.parse(body.body);
    this.access_token = result.access_token;

    let accountData = await this.getMainAccount();
    this.accountId = accountData.accountId;
  }

  private request(url: string, qs?) {
    let qsStr = qs ? ('?' + querystring.stringify(qs)) : '';
    return got(url + qsStr, {
      method: 'GET',
      json: true,
      headers: {
        authorization: 'Bearer ' + this.access_token,
      },
    }).then((res) => res.body);
  }

  getOptionChain(options : GetOptionChainOptions) : Promise<OptionChain> {
    let url = `${HOST}/v1/marketdata/chains`;

    let qs : any = {
      symbol: options.symbol,
      range: options.near_the_money ? 'NTM' : 'ALL',
      includeQuotes: 'TRUE',
      optionType: 'ALL',
      expMonth: 'ALL',
    };

    if(options.contract_type) {
      qs.contractType = options.contract_type;
    }

    if(options.to_date) {
      qs.toDate = options.to_date.toISOString();
    }

    if(options.from_date) {
      qs.fromDate = options.from_date.toISOString();
    }

    return this.request(url, qs);
  }

  async getQuotes(symbols : string|string[]) : Promise<{[symbol:string]: Quote}> {
    let url = `${HOST}/v1/marketdata/quotes`;

    let symbol_list = _.isArray(symbols) ? symbols : [symbols];
    let formatted_symbols = _.transform(symbol_list, (acc : {[s:string]:string}, s) => {
      let tda_symbol = occToTdaSymbol(s);
      acc[tda_symbol] = s;
    }, {});

    let qs = {
      symbol: _.keys(formatted_symbols).join(','),
    };

    let results = await this.request(url, qs);
    return _.transform(results, (acc, result : Quote, tda_symbol) => {
      let occ_symbol = formatted_symbols[tda_symbol];
      acc[occ_symbol] = result;
    }, {});
  }

  async getAccounts() {
    return this.request(`${HOST}/v1/accounts`);
  }

  async getMainAccount() {
    let accounts = await this.getAccounts();
    return _.values(accounts[0])[0];
  }

  async getTrades(options : GetTransactionsOptions = {}) {
    let url = `${HOST}/v1/accounts/${this.accountId}/transactions`;
    let qs = {
      type: 'TRADE',
      ..._.pick(options, ['symbol', 'startDate', 'endDate']),
    };

    return this.request(url, qs);
  }
}
