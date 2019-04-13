import { assert } from 'chai';

import { occToTdaSymbol } from './index';

describe('occ_to_tda_symbol', function() {
  it('converts a symbol with no cents', function() {
    let occ = 'ANET  180615C00275000';
    let tda = occToTdaSymbol(occ);
    assert.equal(tda, 'ANET_061518C275', occ);
  });

  it('converts a symbol with cents', function() {
    let occ = 'ANET  180615C00275250';
    let tda = occToTdaSymbol(occ);
    assert.equal(tda, 'ANET_061518C275.25', occ);
  });

  it('passes equity symbols through', function() {
    assert.equal(occToTdaSymbol('ANET'), 'ANET');
  });

  it('passes TDA-format symbols through', function() {
    assert.equal(occToTdaSymbol('ANET_061518C275'), 'ANET_061518C275');
  });
});
