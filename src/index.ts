import * as _ from 'lodash';
import * as request from 'request-promise-native';

import { OptionChain } from './option_chain';

const HOST = 'https://api.tdameritrade.com';

export interface GetOptionChainOptions {
  symbol: string;
  from_date?: Date;
  to_date?: Date;
  include_nonstandard?: boolean;
  contract_type?: 'CALL' | 'PUT';
  near_the_money? : boolean;
}

export interface AuthData {
  client_id : string;
  refresh_token : string;
}

export class Api {
  auth : AuthData;
  access_token : string;

  constructor(auth : AuthData) {
    this.auth = auth;
  }

  async init() {
    // Refresh the access token.
    let body = await request({
      url: `${HOST}/v1/oauth2/token`,
      method: 'POST',
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.auth.refresh_token,
        client_id: this.auth.client_id,
      }
    });

    let result = JSON.parse(body);
    this.access_token = result.access_token;
  }

  private request(options) {
    return request({
      method: 'GET',
      json: true,
      auth: {
        bearer: this.access_token,
      },
      ...options,
    });
  }

  get_option_chain(options : GetOptionChainOptions) {
    let url = `${HOST}/v1/marketdata/chains`;

    let qs : any = {
      symbol: options.symbol,
      range: options.near_the_money ? 'NTM' : 'ALL',
      includeQuotes: 'TRUE',
      optionType: options.include_nonstandard ? 'ALL' : 'S',
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

    return this.request({ url, qs });
  }

  get_quotes(symbols : string|string[]) {
    let url = `${HOST}/v1/marketdata/quotes`;

    let symbol_list = _.isArray(symbols) ? symbols.join(',') : symbols;
    let qs = {
      symbol: symbol_list,
    };

    return this.request({ url, qs });
  }
}
