"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const request = require("request-promise-native");
__export(require("./quote"));
const HOST = 'https://api.tdameritrade.com';
function optionInfoFromSymbol(symbol) {
    let underlying = symbol.slice(0, 6).trim();
    if (symbol.length <= 6) {
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
exports.optionInfoFromSymbol = optionInfoFromSymbol;
function occ_to_tda_symbol(occ) {
    if (occ.length !== 21 || occ.indexOf('_') >= 0) {
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
exports.occ_to_tda_symbol = occ_to_tda_symbol;
class Api {
    constructor(auth) {
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
    request(options) {
        return request(Object.assign({ method: 'GET', json: true, auth: {
                bearer: this.access_token,
            } }, options));
    }
    get_option_chain(options) {
        let url = `${HOST}/v1/marketdata/chains`;
        let qs = {
            symbol: options.symbol,
            range: options.near_the_money ? 'NTM' : 'ALL',
            includeQuotes: 'TRUE',
            optionType: options.include_nonstandard ? 'ALL' : 'S',
        };
        if (options.contract_type) {
            qs.contractType = options.contract_type;
        }
        if (options.to_date) {
            qs.toDate = options.to_date.toISOString();
        }
        if (options.from_date) {
            qs.fromDate = options.from_date.toISOString();
        }
        return this.request({ url, qs });
    }
    async get_quotes(symbols) {
        let url = `${HOST}/v1/marketdata/quotes`;
        let symbol_list = _.isArray(symbols) ? symbols : [symbols];
        let formatted_symbols = _.transform(symbol_list, (acc, s) => {
            let tda_symbol = occ_to_tda_symbol(s);
            acc[tda_symbol] = s;
        }, {});
        let qs = {
            symbol: _.keys(formatted_symbols).join(','),
        };
        let results = await this.request({ url, qs });
        return _.transform(results, (acc, result, tda_symbol) => {
            let occ_symbol = formatted_symbols[tda_symbol];
            acc[occ_symbol] = result;
        }, {});
    }
}
exports.Api = Api;
//# sourceMappingURL=index.js.map