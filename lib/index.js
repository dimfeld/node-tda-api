"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const got = require("got");
const FormData = require("form-data");
const querystring = require("querystring");
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
function occToTdaSymbol(occ) {
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
exports.occToTdaSymbol = occToTdaSymbol;
class Api {
    constructor(auth) {
        this.auth = auth;
    }
    async init() {
        // Refresh the access token.
        let form = new FormData();
        form.append('grant_type', 'refresh_token');
        form.append('refresh_token', this.auth.refresh_token);
        form.append('client_id', this.auth.client_id);
        let body = await got(`${HOST}/v1/oauth2/token`, {
            method: 'POST',
            body: form,
        });
        let result = JSON.parse(body.body);
        this.access_token = result.access_token;
    }
    request(url, qs) {
        let qsStr = qs ? ('?' + querystring.stringify(qs)) : '';
        return got(url + qsStr, {
            method: 'GET',
            json: true,
            headers: {
                bearer: this.access_token,
            },
        }).then((res) => res.body);
    }
    getOptionChain(options) {
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
        return this.request(url, qs);
    }
    async getQuotes(symbols) {
        let url = `${HOST}/v1/marketdata/quotes`;
        let symbol_list = _.isArray(symbols) ? symbols : [symbols];
        let formatted_symbols = _.transform(symbol_list, (acc, s) => {
            let tda_symbol = occToTdaSymbol(s);
            acc[tda_symbol] = s;
        }, {});
        let qs = {
            symbol: _.keys(formatted_symbols).join(','),
        };
        let results = await this.request(url, { qs });
        return _.transform(results, (acc, result, tda_symbol) => {
            let occ_symbol = formatted_symbols[tda_symbol];
            acc[occ_symbol] = result;
        }, {});
    }
}
exports.Api = Api;
//# sourceMappingURL=index.js.map